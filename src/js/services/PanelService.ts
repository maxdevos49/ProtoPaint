import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IActionCommander } from "../../lib/action-commander/js/ActionCommander.js";
import { FlagOptionService } from "./FlagOptionService.js";
import { DataSourceCollection, SourceMode, SelectMode, IDataSource } from "../../lib/action-commander/js/services/DataSourceCollection.js";
import { Observable, fromProperty } from "../../lib/observable/js/observable.js";

@service()
export class PanelService {

    private _panels: Map<string, HTMLElement>;
    private _actionCommander: IActionCommander;


    public _panelSource: IDataSource;
    private readonly _$panelSource: Observable<IDataSource>;

    public constructor(options: FlagOptionService, dsc: DataSourceCollection) {
        this._panels = new Map();

        this._panelSource = {
            title: "Flag value Suggestions",
            sourceMode: SourceMode.Action,
            allowFiltering: false,
            resetOnSelect: true,
            tabCharacter: " ",
            selectMode: SelectMode.Append,
            data: []
        }
        this._$panelSource = fromProperty(this, "_panelSource")

        options.registerOptions({
            name: "panels",
            sourceSelector: () => [...this._panels.keys()],
            formatterSelector: (value: string) => ({ value: value })
        })

        dsc.addSource("panels", this._$panelSource);
    }

    public registerPanel(name: string, selector: string): void {
        if (this._panels.has(name))
            throw new Error(`Panel Name: "${name}" is already registered. Try using a different name`);

        let element = document.querySelector(selector) as HTMLElement;

        if (!element)
            throw new Error(`Panel Name: "${name}" with selector: "${selector}" failed to be found. Check your selector.`);

        this._panels.set(name.toLowerCase(), element);

        element.insertAdjacentHTML("afterbegin", /*html*/`
<div class="panel-title">
    <p>${name}</p>
    <span class="no-select" onclick="this.closest('div[data-panel]').classList.add('hide')"><i class="fas fa-times fa-lg" style="padding: 3px;"></i></span>
</div>`)

        let dataSource = this._panelSource;
        dataSource.data = [...this._panels.keys()].map(v => ({ value: v }));
        this._panelSource = dataSource;
    }

    public getPanelKeys(): string[] {
        return [...this._panels].map((value) => value[0]);
    }

    public hidePanel(panel: string) {
        panel = panel.toLowerCase();
        if (this._panels.has(panel)) {
            this._panels.get(panel)?.classList.add("hide");
        }
    }

    public showPanel(panel: string) {
        panel = panel.toLowerCase();
        if (this._panels.has(panel)) {
            this._panels.get(panel)?.classList.remove("hide");
        }
    }

    public togglePanel(panel: string) {
        panel = panel.toLowerCase();
        if (this._panels.has(panel)) {
            this._panels.get(panel)?.classList.toggle("hide");
        }
    }

    public showSearch(): void {
        this._actionCommander.focus();
    }

    public injectActionCommander(actionCommander: IActionCommander): void {
        this._actionCommander = actionCommander;
    }

}