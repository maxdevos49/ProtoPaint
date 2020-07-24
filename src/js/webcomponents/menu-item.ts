import { WebComponent, initShadow, attribute } from "../helpers/webcomponent.js";

@WebComponent({
    selector: "menu-item",
    attributes: ["title", "selected", "layer-index", "frame-index", "visibility"],
    template:
/*html*/`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css" integrity="sha512-1PKOgIY59xJ8Co8+NE6FZ+LOAZKjy+KY8iq0G4B3CyeY6wYHN3yt9PW0XpSriVlkMXe40PTKnXrLnZ9+fkDaog==" crossorigin="anonymous" />
<style>

    :host{
        display: block;/* Holy shit this fixed so much frustrations */
        position: relative;
        contain: content;
        border-top: rgba(255,255,255,0.1) 1px solid;
        border-bottom: rgba(255,255,255,0.1) 1px solid;
        border-collapse: collapse;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        transition: 0.1s;
    }

    :host(.show) div.slotted{
        display: block;
    }

    :host(.show) span#arrow{
        transform: rotate(90deg);
    }

    :host([selected="true"]){
        background: rgba(255,255,255,0.2);
    }

    div#header{
        display: flex;
        flex-direction: row;
        padding: 0 3px;
        margin: 0;
        position: relative;
    }

    div#header>span{
        whitespace: no-wrap;
        overflow: hidden;
        text-overflow: ellipse;
    }

    span#arrow{
        position: absolute;
        left: -15px;
        padding: 0 4px 0 0;
        margin: 0;
        transition: 0.2s;
        z-index: 100000;
    }

    span#icon{
        flex-grow: 0;
    }

    span#icon>i{
        margin: 3px 3px 3px 0;
        color: rgba(255,255,255,0.7);
    }

    :host([frame-index]) span#icon{
        display: none;
    }

    span#title{
        flex-grow: 0;
        white-space: no-wrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    span#extra{
        flex-grow: 1;
        text-align: right;
        opacity: 0;
        transition: 0.3s;
        white-space: no-wrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    :host([selected="true"]) span#extra{
        opacity: 1;
    }

    :host([frame-index]) span#extra>i#visibility{
        display: none;
    }

    :host([layer-index]) span#extra>i#add{
        display: none;
    }

    span#extra:hover{
        opacity: 1;
    }

    span#extra>i{
        padding: 1px 4px;
        opacity: 0.5;
        transition: 0.2s;

    }

    span#extra>i:hover{
        opacity: 1;
    }

    div.slotted{
        display: none;
        padding-left: 20px;
        transition: 0.2s;
    }

    
</style>
<div id="header">
    <span id="arrow">▶</span>
    <span id="icon">
    <i class="fas fa-layer-group"></i>
    </span>
    <span id="title"></span>
    <span id="extra">
        <i title="Toggle Visibility" id="visibility" class="fas fa-eye"></i>
        <i title="New Layer" id="add" class="fas fa-plus"></i>
        <i title="Remove Frame" id="remove" class="fas fa-trash-alt"></i>
    </span>
</div>
<div class="slotted">
    <slot></slot>
</div>
`})
export class MenuItemElement extends HTMLElement {

    @attribute("title")
    public title: string;

    @attribute("selected")
    public selected: string;

    @attribute("frame-index")
    public frameIndex: string;

    @attribute("layer-index")
    public layerIndex: string | null;

    @attribute("visibility")
    public visibility: string;


    private _editMode: boolean;

    private readonly _shadowRoot: ShadowRoot;
    private readonly _titleSpan: HTMLSpanElement;
    private readonly _extraSpan: HTMLSpanElement;
    private readonly _arrowSpan: HTMLSpanElement;
    private readonly _headerDiv: HTMLDivElement;


    constructor() {
        super();

        this._editMode = false;

        this._shadowRoot = initShadow(this);

        this._arrowSpan = this._shadowRoot.querySelector("span#arrow");
        this._titleSpan = this._shadowRoot.querySelector("span#title");
        this._extraSpan = this._shadowRoot.querySelector("span#extra");
        this._headerDiv = this._shadowRoot.querySelector("div#header");

        //arrow toggle
        this._arrowSpan.addEventListener("click", e => {//Change to click the entire row
            e.preventDefault();
            e.stopPropagation();

            this.dispatchEvent(new CustomEvent("menu-item-toggle", {
                bubbles: true,
                composed: true,
                detail: {
                    frameIndex: parseInt(this.frameIndex)
                }
            }));

            this.classList.toggle("show");
        });

        //select
        this._headerDiv.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            this.dispatchEvent(new CustomEvent("menu-item-select", {
                bubbles: true,
                composed: true,
                detail: {
                    frameIndex: parseInt(this.frameIndex ?? (this.parentElement as MenuItemElement).frameIndex),
                    LayerIndex: parseInt(this.layerIndex) ?? null
                }
            }));


            if (this.hasAttribute("frame-index")) {
                this.parentElement.querySelectorAll(`menu-item[selected="true"]`).forEach(element => (element as MenuItemElement).selected = "false");

                this.selected = "true";
                (this.querySelector(`menu-item[layer-index="0"]`) as MenuItemElement).selected = "true";
            } else {
                this.parentElement.parentElement.querySelectorAll(`menu-item[selected="true"]`).forEach(element => (element as MenuItemElement).selected = "false");

                this.selected = "true";//self
                (this.parentElement as MenuItemElement).selected = "true";//parent
            }

        });

        //Button click
        this._extraSpan.addEventListener("click", (e: MouseEvent) => {

            //Check if we touched anything
            if (!(e.target as HTMLElement).closest("i"))
                return;

            e.preventDefault();
            e.stopPropagation();

            let buttonType: string = (e.target as HTMLElement).closest("i").id;

            this.dispatchEvent(new CustomEvent("menu-item-button-click", {
                bubbles: true,
                composed: true,
                detail: {
                    buttonType: buttonType,
                    frameIndex: parseInt(this.frameIndex ?? (this.parentElement as MenuItemElement).frameIndex),
                    layerIndex: this.layerIndex !== null ? parseInt(this.layerIndex) : null
                }
            }));

            if (buttonType === "visibility") {
                this.visibility = (!(this.visibility === "true")) + "";
            }


        });

        //edit name
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


    private dispatchTitleEdit(name: string): void {

        this.dispatchEvent(new CustomEvent("menu-title-edit", {
            cancelable: false,
            composed: true,
            bubbles: true,
            detail: {
                title: name,
                frameIndex: parseInt(this.frameIndex ?? (this.parentElement as MenuItemElement).frameIndex),
                LayerIndex: parseInt(this.layerIndex) ?? null
            }
        }));
    }

    public connectedCallback() {
        this.render();
    }

    public attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {

        if (attributeName === "title" && oldValue !== null) {
            this.dispatchTitleEdit(newValue);
        } else if (attributeName === "visibility") {
            let i = this._extraSpan.querySelector("i#visibility");

            i.classList.remove("fa-eye-slash");
            i.classList.remove("fa-eye");

            if (newValue === "true")
                i.classList.add("fa-eye");
            else
                i.classList.add("fa-eye-slash");

        }

        this.render();
    }

    private render() {
        this._titleSpan.innerHTML = this.title;

        if (this.hasAttribute("layer-index")) {
            this._arrowSpan.innerHTML = "";
            (this._extraSpan.querySelector("#remove") as HTMLElement).title = "Remove Layer";
        }

        if (this.hasAttribute("visibility")) {

            // console.log(this.visibility);

            // if (this.visibility) {
            //     console.log("Hey hey what is that noise");
            //     let i = this._extraSpan.querySelector("i#visibility");
            //     console.log(i, this);
            //     i.classList.toggle("fa-eye");
            //     i.classList.toggle("fa-eye-slash");
        }
    }

}