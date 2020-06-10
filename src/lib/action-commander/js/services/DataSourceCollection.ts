import { Observable, Subject, Subscription } from "../../../observable/js/observable.js";
import { service } from "../../../dependency-injection/js/DependencyInjection.js";


//#region Interfaces


export interface IDataSourceCollection {
    addSource(key: string, data: Observable<IDataSource>): void;

    removeSource(key: string): void;
}

export enum SelectMode {
    Replace,
    Append
}

export enum SourceMode {
    Search,
    Action,
    Menu
}

export interface IDataSource {
    title: string;
    sourceMode: SourceMode
    allowFiltering: boolean;
    resetOnSelect: boolean;
    selectMode: SelectMode;
    tabCharacter: string;
    onSelect?: (value: string, index: number, datasource: IDataSource) => void;
    data: IDataPart[];
}

export interface IDataPart {
    value: string;
    displayValue?: string;
    description?: string;
}

//#endregion

@service()
export class DataSourceCollection implements IDataSourceCollection {

    private _dataSources: Map<string, Observable<IDataSource>>;
    private _$$activeDataSource: Subject<IDataSource>;
    private _activeDataSubscription: Subscription;
    private _activeDataSource: IDataSource;
    private _activeDataSourceKey: string;

    public get activeDataSourceKey(): string { return this._activeDataSourceKey }

    public get activeDataSource(): IDataSource { return this._activeDataSource; }
    public readonly $activeDataSource: Observable<IDataSource>;


    public constructor() {
        this._dataSources = new Map();

        this._$$activeDataSource = new Subject();
        this.$activeDataSource = this._$$activeDataSource.toObservable();

        this.addSource("default-boolean", new Observable<IDataSource>(observer => {
            observer.next(
                {
                    title: "Flag value Suggestions",
                    sourceMode: SourceMode.Action,
                    allowFiltering: false,
                    resetOnSelect: true,
                    tabCharacter: " ",
                    selectMode: SelectMode.Append,
                    data: [{
                        value: "true"
                    }, {
                        value: "false"
                    }]
                })
        }));

        this.addSource("default-number", new Observable<IDataSource>(observer => {
            observer.next(
                {
                    title: "Flag value Suggestions",
                    sourceMode: SourceMode.Action,
                    allowFiltering: false,
                    resetOnSelect: true,
                    tabCharacter: " ",
                    selectMode: SelectMode.Append,
                    data: [{
                        value: "-100"
                    }, {
                        value: "-50"
                    }, {
                        value: "-25"
                    }, {
                        value: "-10"
                    }, {
                        value: "-5"
                    }, {
                        value: "0"
                    }, {
                        value: "5"
                    }, {
                        value: "10"
                    }, {
                        value: "25"
                    }, {
                        value: "50"
                    }, {
                        value: "100"
                    }].reverse()
                })
        }));

        this.addSource("empty", Observable.of<IDataSource>({
            title: "Empty source",
            sourceMode: SourceMode.Search,
            allowFiltering: false,
            resetOnSelect: true,
            tabCharacter: " ",
            selectMode: SelectMode.Append,
            data: []
        }))
    }

    public setActiveSource(key: string): void {


        if (!this._dataSources.has(key))
            return

        this._activeDataSourceKey = key;

        if (this._activeDataSubscription)
            this._activeDataSubscription.unsubscribe();

        //forward the values to the active source
        this._activeDataSubscription = this._dataSources
            .get(key)
            .subscribe((v) => {
                this._activeDataSource = v;
                this._$$activeDataSource.next(v)
            });
    }

    public addSource(key: string, data: Observable<IDataSource>): void {
        this._dataSources.set(key, data);
    }

    public removeSource(key: string): void {
        if (this._dataSources.has(key))
            this._dataSources.delete(key);
    }

    public getDataSource(key: string): Observable<IDataSource> | null {
        return this._dataSources.get(key) ?? null;
    }

    public getDataSourceState(key: string): IDataSource | null {

        if (!this._dataSources.has(key))
            return null;

        let datasource: IDataSource;

        this._dataSources.get(key).subscribe(v => datasource = v).unsubscribe();

        return datasource;
    }

}