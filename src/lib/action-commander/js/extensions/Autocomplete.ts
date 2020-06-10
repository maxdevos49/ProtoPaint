import { extension } from "../../../dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { DataSourceCollection, IDataSource, IDataPart, SourceMode, SelectMode } from "../services/DataSourceCollection.js";


@extension()
export class Autocomplete implements IActionExtension {

    //#region Properties

    public defaultDataSourceKey: string;
    public sourceToggles: Map<string, string>;

    // private _activeDataSource: string;
    private _selectionIndex: number | null;
    private _selectionsCount: number;

    private readonly _autoCompleteContainer: HTMLDivElement;

    private readonly _actionCommander: IActionCommander;
    private readonly _dsc: DataSourceCollection;

    //#endregion


    //#region Constructor

    constructor(actionCommander: IActionCommander, dsc: DataSourceCollection) {
        this._actionCommander = actionCommander;
        this._dsc = dsc;

        this._autoCompleteContainer = document.createElement("DIV") as HTMLDivElement;
        this._selectionIndex = null;
        this._selectionsCount = 0;

        //Config defaults
        this.defaultDataSourceKey = "suggestions";
        this.sourceToggles = new Map();

    }

    //#endregion


    //#region Hooks

    public onInput(event: KeyboardEvent): void {

        //pick new data source
        if (this.sourceToggles.has(event.key)) {
            this._selectionIndex = null;
            let sourceKey = this.sourceToggles.get(event.key);

            //Use key to toggle that data source or direct change
            this._dsc.setActiveSource((this._dsc.activeDataSourceKey === sourceKey) ? this.defaultDataSourceKey : sourceKey);
        }

        if (event.key === "ArrowUp") {
            this.moveSelection(-1);
        } else if (event.key === "ArrowDown") {
            this.moveSelection(1);
        } else if ((event.key === "Tab" || event.key === "Enter") && this.isSelecting()) {
            this.selectIndex();
        }
    }
    public onChange() {
        this.generateHTML(this._dsc.activeDataSource);
    }

    public onBlur(): void {
        this._autoCompleteContainer.innerHTML = "";
        this._dsc.setActiveSource(this.defaultDataSourceKey);
    }

    public onFocus(): void {
        this._dsc.setActiveSource(this.defaultDataSourceKey);
    }

    //#endregion

    //#region generateHTML

    private generateHTML(dataSource: IDataSource): void {

        let data: IDataPart[] = [];

        if (dataSource === null || dataSource.data.length === 0) {
            this._autoCompleteContainer.innerHTML = ``;
            return;
        }

        if (dataSource.allowFiltering) {
            data = dataSource.data.filter((value) => {
                return value.value.toLowerCase().startsWith(this._actionCommander.getText().toLowerCase());
            });

        } else {
            data = dataSource.data;
        }

        let html: string = "";

        html += `<dt class="title">${dataSource.title + ((data.length !== dataSource.data.length) ? " - (Filtered)" : "")}</dt>`;
        html += data.map((item: IDataPart, index: number) => {

            let section = "";

            if (item.description)
                section += `<dt>${item.displayValue ?? item.value}</dt>`

            section += `<dd>${item.description ?? (item.displayValue ?? item.value)}</dd>`

            return `<section data-index="${index}" data-value="${item.value}">${section}</section>`;
        }).join("");

        if (data.length === 0)
            html += "<section><dd>No results</dd></section>"

        this._autoCompleteContainer.innerHTML = `<dl>${html}</dl>`;

        this._selectionsCount = data.length;

        let newSelection = this._autoCompleteContainer.querySelector(`section[data-index="${this._selectionIndex}"]`) as any;
        newSelection?.scrollIntoViewIfNeeded?.()
        newSelection?.classList.add("active");
    }

    //#endregion

    //#region SelectIndex

    private getSectionValue(index: number): string {
        return (this._autoCompleteContainer.querySelector(`section[data-index="${index}"]`) as HTMLElement)?.dataset.value ?? "";
    }

    public selectIndex(index?: number): void {

        //get valid index
        index = index ?? this._selectionIndex;

        if (index === null)
            return;

        //sections data value
        let value = this.getSectionValue(index);
        let dataSource = this._dsc.activeDataSource;

        //what kind of source is this?
        if (dataSource.sourceMode === SourceMode.Action) {//action source

            //if data source is append mode or replace
            if (dataSource.selectMode === SelectMode.Replace) {

                //replace
                this._actionCommander.setText(value);

            } else if (dataSource.selectMode === SelectMode.Append) {

                //append
                let currentText = this._actionCommander.getText();
                let parsedCommand = this._actionCommander.parseCommand(currentText);

                if (parsedCommand.searchKey !== "") {

                    let split = currentText.split(parsedCommand.searchKey);
                    let lefthalf: string;

                    if (split.length > 2) {
                        let regroup = split.slice(0, split.length - 1);
                        lefthalf = regroup.join(parsedCommand.searchKey);
                    } else {
                        lefthalf = split[0];
                    }

                    this._actionCommander.setText(lefthalf + value + dataSource.tabCharacter);
                } else {
                    this._actionCommander.appendText(value + dataSource.tabCharacter);
                }
            }

        } else if (dataSource.sourceMode === SourceMode.Menu) {//menu source

            this._actionCommander.blur();

            if (dataSource.onSelect)
                dataSource.onSelect(value, index, dataSource);

        }

        //reset datasource on select or not
        if (dataSource.resetOnSelect) {
            this._dsc.setActiveSource(this.defaultDataSourceKey);
        }

        //reset selection index after select
        this._selectionIndex = null;
    }

    //#endregion

    //#region MoveSelection
    public moveSelection(amount: number): void {
        //apply offset
        if (this._selectionIndex === null)
            this._selectionIndex = (amount > 0) ? 0 : null;
        else
            this._selectionIndex += amount;


        //enforce range
        if (this._selectionIndex < 0)
            this._selectionIndex = null;
        else if (this._selectionIndex > this._selectionsCount - 1)
            this._selectionIndex = this._selectionsCount - 1;

        //early out 
        if (this._selectionIndex === null)
            return;

        this.generateHTML(this._dsc.activeDataSource);
    }

    //#endregion

    //#region IsSelecting

    public isSelecting(): boolean {
        return this._selectionIndex !== null;
    }

    //#endregion

    //#region Init


    public init(): void {
        //assign autocomplete area
        this._autoCompleteContainer.classList.add("autocomplete");
        this._actionCommander.appendChildElement(this._autoCompleteContainer);


        this._dsc.$activeDataSource.subscribe((v) => {
            this.generateHTML(v);
        });

        this._dsc.setActiveSource(this.defaultDataSourceKey);

        this.initEvents();
    }

    private initEvents(): void {

        this._autoCompleteContainer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            let target = e.target as HTMLElement;

            let section = target.closest("section[data-index]") as HTMLElement;

            if (section) {
                let index = parseInt(section.dataset?.index ?? "0");
                this.selectIndex(index);
            }

        }, false);
    }

    //#endregion
}
