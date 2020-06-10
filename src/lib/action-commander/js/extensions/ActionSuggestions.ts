import { extension } from "../../../dependency-injection/js/DependencyInjection.js";
import { Observable, fromProperty } from "../../../observable/js/observable.js";
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { DataSourceCollection, IDataSource, SourceMode, SelectMode } from "../services/DataSourceCollection.js";
import { IFlag } from "../interfaces/IFlag.js";

@extension()
export class ActionSuggestions implements IActionExtension {

    public onFocusDataSourceKey: string;
    public defaultDataSourceKey: string;
    private readonly _actionCommander: IActionCommander;
    private readonly _dsc: DataSourceCollection;

    public _suggestionDataSource: IDataSource;
    private readonly _$suggestionDataSource: Observable<IDataSource>;

    constructor(actionCommander: IActionCommander, dsc: DataSourceCollection) {
        this._actionCommander = actionCommander;
        this._dsc = dsc;

        this.onFocusDataSourceKey = "controllers"
        this.defaultDataSourceKey = "suggestions"

        this._suggestionDataSource = null;
        this._$suggestionDataSource = fromProperty(this, "_suggestionDataSource");
    }

    public init(): void {

        //Define controller datasource
        let data = [...this._actionCommander.controllers ?? []].map((item) => {
            return {
                value: item[1].name,
                description: item[1].description
            }
        });


        this._suggestionDataSource = {
            title: "Suggestions",
            sourceMode: SourceMode.Action,
            allowFiltering: false,
            resetOnSelect: false,
            tabCharacter: " ",
            selectMode: SelectMode.Append,
            data: data
        }

        this._dsc.addSource(this.defaultDataSourceKey, this._$suggestionDataSource);
    }

    public onChange(): void {

        let command = this._actionCommander.getText();
        let parsedCommand = this._actionCommander.parseCommand(command);
        let filteredResult: any[] = [];

        let datasource: IDataSource = {
            title: "Suggestions",
            sourceMode: SourceMode.Action,
            allowFiltering: false,
            resetOnSelect: false,
            tabCharacter: " ",
            selectMode: SelectMode.Append,
            onSelect: null,
            data: []
        };

        if (!parsedCommand.controller) {
            filteredResult = [...this._actionCommander.controllers ?? []].filter((item) => item[0].startsWith(parsedCommand.searchKey));
            datasource.title = "Controller Suggestions";
            datasource.tabCharacter = " ";

            datasource.data = filteredResult.map((item) => {
                return {
                    displayValue: item[1].name,
                    value: item[1].name,
                    description: item[1].description
                }
            });

        } else if (!parsedCommand.action) {

            filteredResult = [...(parsedCommand?.controllerMetaData?.actions ?? [])].filter((item) => item[0].startsWith(parsedCommand.searchKey));
            datasource.title = "Action Suggestions";
            datasource.tabCharacter = " ";

            datasource.data = filteredResult.map((item) => {
                return {
                    displayValue: item[1].name,
                    value: item[1].name,
                    description: item[1].description
                }
            });

        } else {

            if (parsedCommand?.currentFlag?.flagMetaData?.suggestionKey) {
                let valueDataSource = this._dsc.getDataSourceState(parsedCommand.currentFlag.flagMetaData.suggestionKey);
                if (valueDataSource) {
                    datasource = valueDataSource;
                    datasource.data = datasource.data.filter(v => v.value.startsWith(parsedCommand.searchKey));
                }

            } else {
                let availableFlags: IFlag[][] = [];
                datasource.data = [];

                //generate available flags
                parsedCommand.actionMetaData?.flags.forEach((flagInfo) => {
                    if (!availableFlags[flagInfo.parameterIndex])
                        availableFlags[flagInfo.parameterIndex] = [];

                    availableFlags[flagInfo.parameterIndex].push(flagInfo);
                });

                //map available flags to a IDataPart array
                availableFlags.forEach((flagGroup) => {

                    //sort shortest to longest flag so flags are displayed consistently
                    flagGroup = flagGroup.sort((a: IFlag, b: IFlag) => a.name.length - b.name.length);

                    //filter the flag options here
                    if (flagGroup.filter(v => v.name.startsWith(parsedCommand.searchKey)).length
                        && !flagGroup.filter(v => parsedCommand.rawValues.has(v.name)).length) {

                        //add filtered data
                        datasource.data.push({
                            displayValue: `[ ${flagGroup.map(v => v.name).join(" | ")} ]`,
                            value: flagGroup[0].name,
                            description: flagGroup[0].description
                        })
                    }
                });

                datasource.tabCharacter = "=";
                datasource.title = "Flag Suggestions";
            }
        }

        //Assign results
        this._suggestionDataSource = datasource;
    }

}