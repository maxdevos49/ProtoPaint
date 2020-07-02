import { extension } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../../lib/action-commander/js/interfaces/IActionExtension.js";
import { IActionCommander } from "../../lib/action-commander/js/ActionCommander.js";

@extension()
export class SplashScreen implements IActionExtension {

    private readonly _actionCommander: IActionCommander;

    constructor(actionCommander: IActionCommander) {
        this._actionCommander = actionCommander;
    }
    init(): void {

        //show for 1 second guaranteed
        setTimeout(() => {
            //do animation
            document.getElementById("splash").classList.add("fade");

            //remove after a additional second
            setTimeout(() => {
                document.getElementById("splash").remove()
            }, 1000);
        }, 1000)

    }

}