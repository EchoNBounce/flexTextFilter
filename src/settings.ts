/*
 *  Power BI Visualizations
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

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class generalSettings {
    public searchText: string = "";
}

export class layoutSettings {
    public showSearchButton: boolean = true;
    public showClearButton: boolean = true;
    public placeholder: string = "Search $1";
    public suggestions: string = "";
}

export class formattingSettings {
    public searchBoxTextColour: string = "#fff";
    public searchBoxTextSize: number = 11;

    public searchBoxBackgroundColour: string = "#202020";
    public searchBoxBorderColour: string = "#303030";
    public searchBoxBorderThickness: number = 2;

    public searchButtonBackgroundColour: string = "#202020";

    public buttonIconColour: string = "#C0C0C0";
    //public buttonHoverColour: string = "#FF9F1A";
}

export class behaviourSettings {
    public enableLiveSearch: boolean = false;
}

export class VisualSettings extends DataViewObjectsParser {

    public general: generalSettings = new generalSettings();
    public layout: layoutSettings = new layoutSettings();
    public formatting: formattingSettings = new formattingSettings();
    public behaviour: behaviourSettings = new behaviourSettings();

}