import { WebComponent, initShadow } from "../helpers/webcomponent.js";
import { ProjectService } from "../services/ProjectService.js";
import { ServiceCollection } from "../../lib/dependency-injection/js/DependencyInjection.js";

@WebComponent({
    selector: "project-menu",
    shadowOptions: { mode: "closed" },
    template: /*html*/`
<style>

</style>
<div id="header">
    <h2>New Project</h2>
</div>
<div id="body">
    <ul>
        <li>
            Frame 1
            <ul>
                <li>Layer 1</li>
                <li>Layer 2</li>
                <li>Layer 3</li>
            </ul>
        </li>
        <li>
            Frame 2
            <ul>
                <li>Layer 1</li>
                <li>Layer 2</li>
                <li>Layer 3</li>
            </ul>
        </li>
    </ul>
</div>
`})
export class FrameMenu extends HTMLElement {

    private readonly _shadowRoot: ShadowRoot;
    private readonly _projectService: ProjectService;

    constructor() {
        super();
        this._shadowRoot = initShadow(this);

        //because we cant use true dependency injection we must grab the service ourself. The custom element js must also be defined after the service is registered
        this._projectService = ServiceCollection.getService(ProjectService);
    }

    private render() {

    }

}