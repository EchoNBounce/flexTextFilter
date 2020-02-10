/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import FilterAction = powerbi.FilterAction;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import { AdvancedFilter } from "powerbi-models";
import { VisualSettings } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private host: powerbi.extensibility.visual.IVisualHost;

    private column: powerbi.DataViewMetadataColumn;

    private searchBar: HTMLTableElement;
    private searchContainer: HTMLTableCellElement;
    private searchBox: HTMLInputElement;
    private searchButtonContainer: HTMLTableCellElement;
    private searchButton: HTMLButtonElement;
    private clearButtonContainer: HTMLTableCellElement;
    private clearButton: HTMLButtonElement;
    //private debugBox: HTMLTextAreaElement;

    private timer: number;
    private liveSearch: boolean = true;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        this.target.innerHTML = `<table class="search-bar" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td class="search-container">
                                            <table cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td>
                                                        <input aria-label="Enter your search" type="text" placeholder="Search" name="search-field">
                                                    </td>
                                                    <td class="button-container search-button-container" style="left:1px;">
                                                        <button class="search-button" name="search-button">
                                                            <svg class="search-icon" version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path  d="M344.5,298c15-23.6,23.8-51.6,23.8-81.7c0-84.1-68.1-152.3-152.1-152.3C132.1,64,64,132.2,64,216.3  c0,84.1,68.1,152.3,152.1,152.3c30.5,0,58.9-9,82.7-24.4l6.9-4.8L414.3,448l33.7-34.3L339.5,305.1L344.5,298z M301.4,131.2  c22.7,22.7,35.2,52.9,35.2,85c0,32.1-12.5,62.3-35.2,85c-22.7,22.7-52.9,35.2-85,35.2c-32.1,0-62.3-12.5-85-35.2  c-22.7-22.7-35.2-52.9-35.2-85c0-32.1,12.5-62.3,35.2-85c22.7-22.7,52.9-35.2,85-35.2C248.5,96,278.7,108.5,301.4,131.2z" /></svg>
                                                            <span class="x-screen-reader">Search</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td class="button-container clear-button-container">
                                            <button class="clear-button" name="clear-button" style="margin-left:2px;">
                                                <svg class="clear-icon" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M832 1408l336-384h-768l-336 384h768zm1013-1077q15 34 9.5 71.5t-30.5 65.5l-896 1024q-38 44-96 44h-768q-38 0-69.5-20.5t-47.5-54.5q-15-34-9.5-71.5t30.5-65.5l896-1024q38-44 96-44h768q38 0 69.5 20.5t47.5 54.5z" /></svg>
                                                <span class="x-screen-reader">Clear</span>
                                            </button>
                                        </td>
                                    </tr>
                                </table>`;
                                //<textarea class="debug-box"></textarea>`;

        this.searchBar = this.target.getElementsByTagName("TABLE")[0] as HTMLTableElement;
        this.searchContainer = this.target.getElementsByClassName("search-container")[0] as HTMLTableCellElement;
        this.searchBox = this.target.getElementsByTagName("INPUT")[0] as HTMLInputElement;
        this.searchBox.addEventListener("keydown", (e) => {

            clearTimeout(this.timer);
          
            if (e.keyCode == 13) {
                this.performSearch(this.searchBox.value);
            }
            else if (this.settings.behaviour.enableLiveSearch) {
                this.timer = setTimeout(() => { this.performSearch(this.searchBox.value); }, 1000);
            }
        });

        this.searchButtonContainer = this.target.getElementsByClassName("search-button-container")[0] as HTMLTableCellElement;
        this.searchButton = this.target.getElementsByTagName("BUTTON")[0] as HTMLButtonElement;
        this.searchButton.addEventListener("click", () => this.performSearch(this.searchBox.value));

        this.clearButtonContainer = this.target.getElementsByClassName("clear-button-container")[0] as HTMLTableCellElement;
        this.clearButton = this.target.getElementsByTagName("BUTTON")[1] as HTMLButtonElement;
        this.clearButton.addEventListener("click", () => this.performSearch(''));

         //this.debugBox = this.target.getElementsByTagName("TEXTAREA")[0] as HTMLTextAreaElement;

        this.host = options.host;
    }

    /** 
    * Perfom search/filtering in a column
    * @param {string} text - text to filter on
    */
    public performSearch(text: string) {
        if (this.column) {
            const isBlank = ((text || "") + "").match(/^\s*$/);
           
            let filter: IAdvancedFilter = null;
            let action = FilterAction.remove;
            if (!isBlank) {

                let target: IFilterColumnTarget = {
                    table: this.column.queryName.substr(0, this.column.queryName.indexOf('.')),
                    column: this.column.queryName.substr(this.column.queryName.indexOf('.') + 1)
                };

                let conditions: IAdvancedFilterCondition[] = [];
                conditions.push({
                    operator: "Contains",
                    value: text
                });
            
               filter = new AdvancedFilter(target, "And", conditions).toJSON();
               action = FilterAction.merge;
            }

            this.host.applyJsonFilter(filter, "general", "filter", action);
        }
        this.searchBox.value = text;
    }

    public update(options: VisualUpdateOptions) {

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        // Retrieve filter.
        const metadata = options.dataViews && options.dataViews[0] && options.dataViews[0].metadata;
        const newColumn = metadata && metadata.columns && metadata.columns[0];
        const objectCheck = metadata && metadata.objects;
        const properties = dataViewObjects.getObject(objectCheck, "general") as any || {};

        let searchText = "";
        let columnName = newColumn ? newColumn.queryName.substr(newColumn.queryName.indexOf('.') + 1) : "";

        // Constrain settings.
        this.settings.formatting.searchBoxBorderThickness = Math.max(0, this.settings.formatting.searchBoxBorderThickness);
        this.settings.formatting.searchBoxBorderThickness = Math.min(5, this.settings.formatting.searchBoxBorderThickness);

        this.settings.formatting.searchBoxTextSize = Math.max(0, this.settings.formatting.searchBoxTextSize);
     
        // Apply formatting.
        this.searchBar.style.color = this.settings.formatting.searchBoxTextColour;
        this.searchBar.style.fontSize = this.settings.formatting.searchBoxTextSize.toString() + "pt";
        this.searchBar.style.fill = this.settings.formatting.buttonIconColour;

        this.searchContainer.style.backgroundColor = this.settings.formatting.searchBoxBackgroundColour;
        this.searchContainer.style.borderColor = this.settings.formatting.searchBoxBorderColour;
        this.searchContainer.style.borderWidth = this.settings.formatting.searchBoxBorderThickness.toString() + "px";

        this.searchBox.placeholder = this.settings.layout.placeholder.replace("$1", columnName); 

        if (this.settings.layout.suggestions) {
            let suggestions = this.settings.layout.suggestions.split(",");

            var date = new Date;
            let selection = Math.floor(date.getMinutes() / (60 / suggestions.length));
            selection = Math.max(0, selection);
            selection = Math.min(suggestions.length, selection);
            this.searchBox.placeholder += (this.searchBox.placeholder ? " " : "") + "(e.g. '" + suggestions[selection].trim() + "')";
        }

        this.searchButtonContainer.style.visibility = this.settings.layout.showSearchButton ? "visible" : "hidden";
        this.searchButton.style.backgroundColor = this.settings.formatting.searchButtonBackgroundColour;

        this.clearButtonContainer.style.display = this.settings.layout.showClearButton ? "initial" : "none";
        this.clearButton.style.marginTop = this.settings.formatting.searchBoxBorderThickness.toString() + "px";

        this.searchBar.style.opacity = "1";

        // We had a column, but now it is empty, or it has changed.
        if (options.dataViews && options.dataViews.length > 0 && this.column && (!newColumn || this.column.queryName !== newColumn.queryName)) {
            this.performSearch("");

            // Well, it hasn't changed, then lets try to load the existing search text.
        } else if (properties.filter) {
            let filter = properties.filter;
            if (filter.whereItems && filter.whereItems.length == 1) {
                let whereItem = filter.whereItems[0];
                if (whereItem.condition && whereItem.condition.right) {
                    searchText = (whereItem.condition.right.value || "") + "";
                }
            }
        }

        this.searchBox.value = searchText;
        this.column = newColumn;
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}