
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { DataSourceCollection, IDataSource, IDataPart, SourceMode, SelectMode } from "../services/DataSourceCollection.js";
import { IParsedCommmand } from "../interfaces/IParsedCommand.js";
import { extension } from "../../../dependency-injection/js/DependencyInjection.js";
import { Observable, fromProperty } from "../../../observable/js/observable.js";


@extension()
export class ActionHistory implements IActionExtension {

    public historyDataSourceKey: string;
    private readonly _actionCommander: IActionCommander;
    private readonly _dsc: DataSourceCollection;

    public _historyDataSource: IDataSource;
    private readonly _$historyDataSource: Observable<IDataSource>;

    public constructor(actionCommander: IActionCommander, dsc: DataSourceCollection) {
        this._actionCommander = actionCommander;
        this._dsc = dsc;
        this.historyDataSourceKey = "action-history";

        this._historyDataSource = null;
        this._$historyDataSource = fromProperty(this, "_historyDataSource");
    }

    public init(): void {

        let items = localStorage.getItem(this.historyDataSourceKey) ?? "[]";
        let data: IDataPart[] = [];

        (JSON.parse(items) ?? new Array<string>()).forEach((item: string) => {
            data.push({ value: item });
        });

        this._historyDataSource = {
            title: "Action History",
            sourceMode: SourceMode.Action,
            allowFiltering: true,
            resetOnSelect: true,
            selectMode: SelectMode.Replace,
            tabCharacter: "",
            data: data
        };

        this._dsc.addSource(this.historyDataSourceKey, this._$historyDataSource);


    }

    public onSubmit(parsedCommand: IParsedCommmand): void {

        let command = this._actionCommander.getText();

        //get current history
        let datasource = this._historyDataSource;

        //add new history
        datasource.data.unshift({ value: command });

        //constrain history to 100 entries
        if (datasource.data.length > 100)
            datasource.data.pop();

        //Replace history in local storage
        localStorage.setItem(this.historyDataSourceKey, JSON.stringify(datasource.data.map(value => value.value)));

        //update the datasource
        this._historyDataSource = datasource;
    }
}