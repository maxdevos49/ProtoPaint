import { WebComponent, initShadow } from "../helpers/webcomponent.js";

@WebComponent({
    selector: "tabbed-panel",
    attributes: [],
    template: /*html*/``
})
export class TabbedPanelElement extends HTMLElement {

    private readonly _shadowRoot: ShadowRoot;

    constructor() {
        super();

        this._shadowRoot = initShadow(this);
    }

    public connectedCallback(): void {
        this.render();
    }

    public attributeChangedCallback(attributeName: string, oldValue: string, newValue: string): void {
        this.render();
    }

    public render(): void {
        
    }
}