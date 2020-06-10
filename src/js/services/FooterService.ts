import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IDataSource, DataSourceCollection, SourceMode, SelectMode, IDataPart } from "../../lib/action-commander/js/services/DataSourceCollection.js";
import { Observable, fromProperty } from "../../lib/observable/js/observable.js";
import { PanelService } from "./PanelService.js";

@service()
export class FooterService {

    public _menuSource: IDataSource;
    private readonly _$menuSource: Observable<IDataSource>;

    private readonly _dsc: DataSourceCollection;
    private readonly _panel: PanelService;

    constructor(dsc: DataSourceCollection, panel: PanelService) {
        this._dsc = dsc;
        this._panel = panel;

        this._menuSource = {
            title: "Menu",
            sourceMode: SourceMode.Menu,
            allowFiltering: true,
            resetOnSelect: true,
            selectMode: SelectMode.Replace,
            tabCharacter: "",
            data: []
        }
        this._$menuSource = fromProperty(this, "_menuSource");

        this._dsc.addSource("menu", this._$menuSource);
    }

    public registerObservableMenu<T>(
        title: string,
        value: Observable<T>,
        menu: () => T[],
        formatValueSelector: (value: T) => string,
        formatMenuSelector: (value: T) => IDataPart,
        onSelect: (value: string, index: number, dataSource: IDataSource) => void
    ): void {

        let span = document.createElement("SPAN");

        //handle mouse clicks
        span.addEventListener("click", (e) => {

            this._panel.showSearch();

            this._dsc.setActiveSource("menu");

            let dataSource = this._menuSource;
            dataSource.title = title;
            dataSource.data = menu()?.map(formatMenuSelector) ?? [];
            dataSource.onSelect = onSelect;

            this._menuSource = dataSource;
        });

        //subscribe to value changes
        value.subscribe((value) => {
            span.innerHTML = formatValueSelector(value);
        });

        //add to document
        this.addElement(span);
    }

    public registerObservableButton<T>(value: Observable<T>, onSelect: (value: T) => void, formatSelector?: (value: T) => string): void {

        let span = document.createElement("SPAN");
        let cachedValue: T;//This is captured by event listener and observable subscription

        //prevent undefined/null format selector        
        if (!formatSelector)
            formatSelector = (value) => value + "";

        //handle mouse clicks
        span.addEventListener("click", (e) => {
            onSelect?.(cachedValue);
        });

        //subscribe to value changes
        value.subscribe((value) => {
            cachedValue = value;
            span.innerHTML = formatSelector(value);
        });

        //add to document
        this.addElement(span);
    }

    public registerStaticButton(value: string, onSelect: () => void): void {
        let span = document.createElement("SPAN");

        //handle mouse clicks
        span.addEventListener("click", (e) => {
            onSelect?.();
        });

        //assign value
        span.innerHTML = value;

        //add to document
        this.addElement(span);
    }

    private addElement(element: HTMLElement) {
        element.classList.add("footer-value");
        element.classList.add("no-select");
        document.querySelector("footer>div#right").appendChild(element);
    }

}