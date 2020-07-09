export interface IWebComponent {
    selector: string;
    shadowOptions?: ShadowRootInit;
    template: string;
}

export function WebComponent(config: IWebComponent) {
    return function <T extends CustomElementConstructor>(constructor: T) {

        Reflect.defineMetadata("selector", config.selector, constructor);
        Reflect.defineMetadata("shadowOptions", config.shadowOptions ?? { mode: "open" }, constructor);
        Reflect.defineMetadata("template", config.template, constructor);

        //Register Custom Element
        window.customElements.define(config.selector, constructor);
    };
}

/**
 * Sets up the shadow dom according to how it was defined by the WebComponent decorator
 * @param target The custom element instance
 */
export function initShadow<T extends HTMLElement>(target: T): ShadowRoot {
    let ShadowRoot: ShadowRoot = target.attachShadow(Reflect.getMetadata("shadowOptions", target.constructor));

    const template = document.createElement('template');
    template.innerHTML = Reflect.getMetadata("template", target.constructor);
    ShadowRoot.appendChild(template.content.cloneNode(true));

    return ShadowRoot;
}