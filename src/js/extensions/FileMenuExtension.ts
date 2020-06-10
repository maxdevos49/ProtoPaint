import { extension } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../../lib/action-commander/js/interfaces/IActionExtension.js";
import { IActionCommander } from "../../lib/action-commander/js/ActionCommander.js";

@extension()
export class FileMenuExtension implements IActionExtension {

    private readonly _actionCommander: IActionCommander;

    constructor(actionCommander: IActionCommander) {
        this._actionCommander = actionCommander;
    }

    public init(): void {

        let navList = document.querySelector("header>nav>ul");
        let nav = document.querySelector("header>nav");

        //Process each controller
        [...this._actionCommander.controllers.values()].forEach((controller) => {

            let li = document.createElement("LI");
            li.innerHTML += `<span>${controller.name}</span>`;

            let actions: string = "";
            //Process each action
            [...controller.actions.values()].forEach((action) => {

                if (actions && action.variations)
                    actions += "<hr/>"//break up sections

                //process each variation
                action.variations?.forEach((variation) => {
                    actions += `<li data-command="${controller.name} ${action.name} ${variation.flagOptions ?? ""}"><span>${variation.description}</span>${(variation.keyCombination) ? "<span class='grow'></span><kbd>" + variation.keyCombination + "</kbd>" : ""}</li>`
                });

            });

            li.innerHTML += `
            <ul class="dropdown">
                ${actions === "" ? "<li><span>Controller not Implemented Yet</span></li>" : actions}
            </ul>`;


            navList.appendChild(li);
        });

        //toggle with click
        document.addEventListener("click", (e) => {

            //Execute clicked command
            if ((e.target as HTMLElement).closest("header>nav li[data-command]")) {
                let li = (e.target as HTMLElement).closest("header>nav li[data-command]") as HTMLLIElement;

                this._actionCommander.parseAndExecuteCommand(li.dataset.command);
            }

            if ((e.target as HTMLElement).closest("header>nav"))
                nav.classList.toggle("active");
            else
                nav.classList.toggle("active");

        }, false);

        //remove with escape
        document.addEventListener("keydown", (e) => {//should be ok that this is not through key commander
            if (e.key === "Escape")
                nav.classList.remove("active");
        })
    }

}