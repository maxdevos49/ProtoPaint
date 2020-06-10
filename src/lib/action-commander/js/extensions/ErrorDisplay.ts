import { extension } from "../../../dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { IParsedCommmand } from "../interfaces/IParsedCommand.js";

@extension()
export class ErrorDisplay implements IActionExtension {

    private readonly _actionCommander: IActionCommander;
    private readonly _errorContainer: HTMLDivElement;


    public constructor(actionCommander: IActionCommander) {
        this._actionCommander = actionCommander;
        this._errorContainer = document.createElement("DIV") as HTMLDivElement;
    }

    public init(): void {
        this._errorContainer.style.backgroundColor = "red";
        this._errorContainer.style.color = "white";
        this._errorContainer.style.padding = "0 2px";
        this._actionCommander.appendChildElement(this._errorContainer);
    }

    public onChange() {
        this._errorContainer.innerHTML = "";
    }

    public onError(parsedCommand: IParsedCommmand): void {
        this._errorContainer.innerHTML = parsedCommand.errors.join(";");
    }


    public onBlur(): void {
        this._errorContainer.innerHTML = "";
    }

}