import { WebComponent, initShadow, attribute } from "../helpers/webcomponent.js";
import { MenuItemElement } from "./menu-item.js";
import "./menu-container.js";

@WebComponent({
    selector: "project-menu",
    shadowOptions: { mode: "open", delegatesFocus: true },
    attributes: ["data", "title"],
    template: /*html*/`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css" integrity="sha512-1PKOgIY59xJ8Co8+NE6FZ+LOAZKjy+KY8iq0G4B3CyeY6wYHN3yt9PW0XpSriVlkMXe40PTKnXrLnZ9+fkDaog==" crossorigin="anonymous" />
<style>

:host {
    display: block;
    contain: content;
    padding: 0;
    margin: 0;
}

div#header{
    display: flex;
    flex-direction: row;
    background-color: rgba(0,0,0,0.4);
    padding: 1px 5px;
    white-space: nowrap;
}

span.title{
    font-weight: bold;
    font-size: 1.7rem;
    white-space: nowrap; 
    margin: 0;
    padding: 0;
    flex-grow: 0;
    align-self: baseline
}

span.title>input{
    font-size: 1.7rem;
}

span.extension{
    white-space: nowrap; 
    text-overflow: ellipsis;
    opacity: 0.7;
    align-self: baseline
}

span.buttons{
    flex-grow: 1;
    text-align: right;
    align-self: baseline

}

span.buttons>i{
    margin: 10px 3px 3px 3px;
    color: rgba(255,255,255,1);
    transition: 0.2s;
}

span.buttons>i:hover{
    color: rgba(255,255,255,0.7);

}

div#items{
    padding: 4px 0px  1px 20px;
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
    <span class="title">New Project</span><span class="extension">.protopaint</span>
    <span class="buttons">
        <i title="New Frame" id="add" class="fas fa-plus"></i>
        <i title="Refresh" id="refresh" class="fas fa-sync-alt"></i>
    </span>
</div>
<menu-container resize="bottom" height="250px">
    <div id="items">
    </div>
</menu-container>
`})
export class ProjectMenuElement extends HTMLElement {

    @attribute("data")
    public data: ITreeData[];

    private readonly _buttons: HTMLSpanElement;
    private readonly _titleSpan: HTMLSpanElement;

    private readonly _shadowRoot: ShadowRoot;

    private _editMode: boolean;


    constructor() {
        super();
        this._shadowRoot = initShadow(this);

        this._editMode = false;

        this._titleSpan = this._shadowRoot.querySelector("span.title");
        this._buttons = this._shadowRoot.querySelector("span.buttons");

        this._buttons.addEventListener("click", (e) => {

            if (!(e.target as HTMLElement).closest("i"))
                return;

            e.preventDefault();
            e.stopPropagation();

            let buttonType = (e.target as HTMLElement).id;

            this.dispatchEvent(new CustomEvent("menu-button-click", {
                composed: true,
                bubbles: true,
                detail: {
                    buttonType: buttonType
                }
            }));
        });

        this._titleSpan.addEventListener("dblclick", (e) => {
            e.preventDefault();

            if (!this._editMode) {

                this._editMode = true;

                let input = document.createElement("input") as HTMLInputElement;

                input.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key === "Escape") {
                        this._titleSpan.innerHTML = this.title;
                        this._editMode = false;
                    } else if (e.key === "Enter") {

                        if (input.value)
                            this.title = input.value;

                        this._titleSpan.innerHTML = this.title;
                        this._editMode = false;

                    }
                }, false);

                input.addEventListener("focusout", _ => {
                    if (input.value)
                        this.title = input.value;

                    this._titleSpan.innerHTML = this.title;
                    this._editMode = false;
                }, false);

                input.addEventListener("input", _ => {
                    input.style.width = input.value.length + 1 + "ch";
                });

                // this._titleSpan.innerHTML = ``;
                this._titleSpan.replaceChild(input, this._titleSpan.childNodes[0]);

                input.value = this.title;
                input.style.width = input.value.length + 1 + "ch";
                input.focus();
            }

        }, false);
    }

    public connectedCallback() {
        this.render();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        this.render();
    }

    private render() {

        let itemsContainer = this._shadowRoot.querySelector("div#items") as HTMLDivElement;
        itemsContainer.innerHTML = "";

        this.data?.forEach((frame, frameIndex) => {

            let frameElement = document.createElement("menu-item") as MenuItemElement;
            frameElement.title = frame.name;
            frameElement.frameIndex = frameIndex + "";
            frameElement.selected = frame.selected + "";

            if (frame.open)
                frameElement.classList.add("show");

            frame.data?.forEach((layer, layerIndex) => {
                let layerElement = document.createElement("menu-item") as MenuItemElement;

                layerElement.title = layer.name;
                layerElement.layerIndex = layerIndex + "";
                layerElement.selected = layer.selected + "";
                layerElement.visibility = layer.visibility + "";

                frameElement.appendChild(layerElement);
            });

            itemsContainer.appendChild(frameElement);
        });

        this._titleSpan.innerHTML = this.title;

    }
}

export interface ITreeData {
    name: string;
    visibility?: boolean,
    open?: boolean;
    data?: ITreeData[];
    selected?: boolean;
}