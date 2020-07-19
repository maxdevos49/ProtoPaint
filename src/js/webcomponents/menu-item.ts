import { WebComponent, initShadow, attribute } from "../helpers/webcomponent.js";

@WebComponent({
    selector: "menu-item",
    attributes: ["title", "selected"],
    template:
/*html*/`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css">
<style>
    :host{
        display: block;/* Holy shit this fixed so much frustrations */
        position: relative;
    }

    :host(.show) div.slotted{
        display: block;
    }

    :host(.show) span#arrow{
        transform: rotate(90deg);
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
    }
    span#title{
        flex-grow: 1;
    }

    span#extra{
        flex-grow: 0;
    }

    div.slotted{
        display: none;
        padding-left: 15px;
        transition: 0.2s;
    }

    
</style>
<div id="header">
    <span id="arrow">▶</span>
    <span id="icon"><i class="fas fa-layer-group"></i></span>
    <span id="title"></span>
    <span id="extra"></span>
</div>
<div class="slotted">
    <slot><!-- This is the inner html! I think?!?!?--></slot>
</div>
`})
export class MenuItem extends HTMLElement {

    @attribute("title")
    public title: string;

    @attribute("selected")
    public selected: string;

    private _editMode: boolean;

    private readonly _shadowRoot: ShadowRoot;
    private readonly _titleSpan: HTMLSpanElement;
    private readonly _extraSpan: HTMLSpanElement;
    private readonly _arrowSpan: HTMLSpanElement;


    constructor() {
        super();

        this._editMode = false;

        this._shadowRoot = initShadow(this);

        this._arrowSpan = this._shadowRoot.querySelector("span#arrow");
        this._titleSpan = this._shadowRoot.querySelector("span#title");
        this._extraSpan = this._shadowRoot.querySelector("span#extra");

        this._arrowSpan.addEventListener("click", e => {
            e.preventDefault();
            
            this.classList.toggle("show");
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

    public attributeChangedCallback() {
        this.render();
    }

    private render() {
        this._titleSpan.innerHTML = this.title;

        if (!this.innerHTML) {
            (this._shadowRoot.querySelector("span#arrow") as HTMLElement).innerHTML = "";
        }

        //Indicate selected
        if (this.selected) {
            if (this.innerHTML)
                this.style.background = "rgba(255,255,255,0.2)";
            else
                (this._shadowRoot.querySelector("div#header") as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.2)";
        }

    }
}