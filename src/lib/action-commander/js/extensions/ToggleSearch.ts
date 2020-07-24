
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { IParsedCommand } from "../interfaces/IParsedCommand.js";
import { extension } from "../../../dependency-injection/js/DependencyInjection.js";

@extension()
export class ToggleSearch implements IActionExtension {

    private _actionCommander: IActionCommander;

    public searchContainerId: string;

    constructor(actionCommander: IActionCommander) {
        this._actionCommander = actionCommander;

        this.searchContainerId = "search-container";//default value
    }

    public init(): void { }

    public onSuccess(): void {
        this._actionCommander.blur();
    }

    public onInput(e: KeyboardEvent): void {
        if ((e.key === "p" && e.metaKey) || e.key === "Escape")
            this._actionCommander.blur();
    }

    public onFocus(): void {
        document.getElementById(this.searchContainerId).classList.add("show");
    }

    public onBlur(): void {
        document.getElementById(this.searchContainerId).classList.remove("show");
        this._actionCommander.setText("");
    }
}