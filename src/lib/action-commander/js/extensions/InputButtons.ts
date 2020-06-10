
import { IActionExtension } from "../interfaces/IActionExtension.js";
import { IActionCommander } from "../ActionCommander.js";
import { extension } from "../../../dependency-injection/js/DependencyInjection.js";

@extension()
export class InputButtons implements IActionExtension {

    public buttons: Map<string, (ac: IActionCommander) => void>;

    private _actionCommander: IActionCommander;

    constructor(actionCommander: IActionCommander) {
        this._actionCommander = actionCommander;
    }

    init(): void {
        this.buttons.forEach((value, key) => {
            //create button
            let bElement = document.createElement("SPAN") as HTMLButtonElement;
            bElement.setAttribute("class", "input-button");
            bElement.innerHTML = key;

            //add click listener
            bElement.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                e.stopPropagation();

                value(this._actionCommander);
            }, false);

            this._actionCommander.appendButtonElement(bElement);
        });
    }

}