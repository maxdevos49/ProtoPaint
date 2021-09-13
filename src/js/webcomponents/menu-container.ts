import { WebComponent, attribute, initShadow } from "../helpers/webcomponent.js";

@WebComponent({
    selector: "menu-container",
    attributes: ["resize", "title", "toggle", "height"],
    template: /*html*/`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css" integrity="sha512-1PKOgIY59xJ8Co8+NE6FZ+LOAZKjy+KY8iq0G4B3CyeY6wYHN3yt9PW0XpSriVlkMXe40PTKnXrLnZ9+fkDaog==" crossorigin="anonymous" />
<style>
    :host(.closed) div#header{
        border-bottom: 3px solid rgba(0,0,0,0.5);
    }

    :host([resize]) div#container{
        padding: 0 12px 0 0;
        overflow: scroll;
    }

    :host(.closed) div#container{
        display: none;
    }

    span#toggle{
        transform: rotate(90deg);
        transition: 0.2s;
    }

    :host(.closed) span#toggle{
        transform: rotate(0deg);
    }

    :host([title]) div#header{
        display: block;
    }

    span#toggle{
        display: none;
    }

    :host([toggle]) span#toggle{
        display: inline-block;
    }

    div#header{
        padding: 3px;
        background-color: rgba(200,200,200,0.7);
        display: flex;
        align-items: baseline;
        display: none;
    }

    div#header > span{
        padding: 1px 3px;
    }

    

    div#container{
        position: relative;
        margin: 0;
        padding: 0;
        background: rgba(255,255,255,0.1);/* Does not work :( */
    }

    div[data-dragger]{
        padding: 0;
        margin: 0;
        display: flex;
        background-color: rgb(30, 30, 30);
        align-items: center;
        justify-content: center;
        transition: 0.2s;
    }

    div[data-dragger]>hr {
        margin: 0;
        padding: 0;
        background-color: white;
        border-radius: 4px;
    }

    div[data-dragger="right"], div[data-dragger="left"] {
        width: 8px;
    }

    /** Horizontal Resize Highlight **/
    div[data-dragger="right"]>hr, div[data-dragger="left"]>hr {
        height: 30%;
        width: 25%;
    }

    /** Horizontal Resize Hover **/
    div[data-dragger="right"]:hover, div[data-dragger="left"]:hover {
        width: 18px;
    }

    /** Vertical Resize Highlight **/
    div[data-dragger="top"]>hr, div[data-dragger="bottom"]>hr {
        width: 30%;
        height: 25%;
    }

    div[data-dragger="top"], div[data-dragger="bottom"] {
        height: 8px;
    }

    /** Vertical Resize Hover **/
    div[data-dragger="top"]:hover, div[data-dragger="bottom"]:hover {
        height: 18px;
    }

    

  

    

</style>
<div id="header">
    <span id="toggle">
        <i class="fas fa-xs fa-play"></i>
    </span>
    <span id="title"></span>
</div>
<div id="container">
    <slot></slot>
</div>

`
})
export class MenuContainerElement extends HTMLElement {

    @attribute("resize")
    public side: string;

    @attribute("title")
    public title: string;

    @attribute("height")
    public height: string;

    private _dragging: boolean;
    private readonly _dragElement: HTMLDivElement;
    private readonly _containerElement: HTMLDivElement;

    private readonly _toggleElement: HTMLDivElement;
    private readonly _titleElement: HTMLDivElement;

    private readonly _shadowRoot: ShadowRoot;

    constructor() {
        super();

        this._shadowRoot = initShadow(this);

        this._dragElement = document.createElement("div");

        this._containerElement = this._shadowRoot.querySelector("div#container");
        this._titleElement = this._shadowRoot.querySelector("span#title");
        this._toggleElement = this._shadowRoot.querySelector("span#toggle");

        this._dragging = false;
    }

    public connectedCallback(): void {
        this.addListeners();
        this.render();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        this.render();
    }

    public render(): void {

        if (this.height) {
            this._containerElement.style.height = this.height;
        }

        //If Title
        if (this.title) {
            this._titleElement.innerHTML = this.title;
        }

        //If resizable
        if (this.side) {

            this._dragElement.setAttribute("data-dragger", this.side);
            this._dragElement.innerHTML = "<hr/>";

            if (this.side === "bottom") {
                this._shadowRoot.appendChild(this._dragElement);
            } else if (this.side === "top") {
                this._shadowRoot.prepend(this._dragElement);
            } else if (this.side === "left") {
                //TODO
            } else if (this.side === "right") {
                //TODO
            }
        }
    }

    private addListeners() {

        this._toggleElement.addEventListener("click", e => {
            this.classList.toggle("closed");
        }, false);

        this._toggleElement.parentElement.addEventListener("dblclick", e => {
            this.classList.toggle("closed");
        }, false)

        let startWidth: number, startHeight: number, startX: number, startY: number;

        this._dragElement.addEventListener("mousedown", (e) => {
            e.preventDefault();
            let el = document.activeElement as HTMLElement;
            el.blur();

            startX = e.clientX;
            startY = e.clientY;
            startWidth = this._containerElement.offsetWidth;
            startHeight = this._containerElement.offsetHeight;

            this._dragging = true;
        }, false);

        document.addEventListener("mousemove", (e) => {
            e.preventDefault();

            if (this._dragging) {

                switch (this.side) {
                    case "top":
                        this._containerElement.style.height = (startHeight - (e.clientY - startY)) + 'px';
                        break;
                    case "bottom":
                        this._containerElement.style.height = (startHeight + (e.clientY - startY)) + 'px';
                        break;
                    case "right":
                        this._containerElement.style.width = (startWidth + (e.clientX - startX)) + 'px';
                        break;
                    case "left":
                        this._containerElement.style.width = (startWidth - (e.clientX - startX)) + 'px';
                        break;
                }
            }

        }, false);

        document.addEventListener("mouseup", (e) => {
            e.preventDefault();
            if (this._dragging)
                this._dragging = false;
        }, false);

    }
}