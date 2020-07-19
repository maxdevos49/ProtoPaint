import { WebComponent, initShadow } from "../helpers/webcomponent.js";
import { ProjectService } from "../services/ProjectService.js";
import { ServiceCollection } from "../../lib/dependency-injection/js/DependencyInjection.js";

@WebComponent({
    selector: "project-menu",
    shadowOptions: { mode: "closed", delegatesFocus: true },
    template: /*html*/`
<style>

:host {
    display: block;
    contain: content;
    background: rgba(255,255,255,0.1);
    padding: 0;
    margin: 0;
    overflow: scroll;
    min-height: 100px;

}

div#header{
    background-color: rgba(0,0,0,0.4);
    padding: 1px 5px;
}

h2{
    margin: 0;
}

div#items{
    padding: 1px 20px;
    margin: 0;
}

menu-item{
    position: relative;
    margin: 0;
    padding: 0;
}

menu-item menu-item:before {
    position: absolute;
    left: -15px;
    top: 0px;
    content: '';
    display: block;
    border-left: 1px solid #ddd;
    height: 1em;
    border-bottom: 1px solid #ddd;
    width: 10px;
}

menu-item menu-item:after {
    position: absolute;
    left: -15px;
    bottom: -7px;
    content: '';
    display: block;
    border-left: 1px solid #fff;
    height: 100%;
}

menu-item  menu-item:last-child:after {
    display: none;
}

</style>

<div id="header">
    <h2>New Project</h2>
</div>
<div id="items">
    <menu-item title="Frame 1" selected="true" open="true">
        <menu-item title="Layer 1" selected="true"></menu-item>
        <menu-item title="Layer 2"></menu-item>
        <menu-item title="Layer 3"></menu-item>
        <menu-item title="Layer 4"></menu-item>
    </menu-item>
    <menu-item title="Frame 2">
        <menu-item title="Layer 1"></menu-item>
        <menu-item title="Layer 2"></menu-item>
        <menu-item title="Layer 3"></menu-item>
        <menu-item title="Layer 4"></menu-item>
    </menu-item>
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

    public onConnect() {
        this.render();
    }

    private render() {

        //TODO 
    }
}
