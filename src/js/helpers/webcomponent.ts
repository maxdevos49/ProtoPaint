import "../../lib/reflect-metadata/js/reflect-metadata.js";

export interface IWebComponent {
    selector: string;
    shadowOptions?: ShadowRootInit;
    attributes?: string[];
    template: string;
}

export function WebComponent(config: IWebComponent) {

    return function <T extends CustomElementConstructor>(constructor: T) {

        Reflect.defineMetadata("selector", config.selector, constructor);
        Reflect.defineMetadata("shadowOptions", config.shadowOptions ?? { mode: "open" }, constructor);
        Reflect.defineMetadata("template", config.template, constructor);
        Reflect.defineMetadata("attributes", config.attributes ?? [], constructor);

        //define static getter "observedAttributes"
        Object.defineProperty(constructor, "observedAttributes", {
            get: () => config.attributes ?? [],
        });

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

export function attribute<T extends Element>(name?: string) {

    return function (target: T, propertyKey: string | symbol) {

        name = name ?? propertyKey as string;

        let type = Reflect.getMetadata("design:type", target, propertyKey);

        if (type.name !== "String") {

            Object.defineProperty(target, propertyKey, {
                get() {
                    return JSON.parse(this.getAttribute(name));
                },
                set(value: string) {
                    this.setAttribute(name, JSON.stringify(value));
                }
            });
        } else {

            Object.defineProperty(target, propertyKey, {
                get() {
                    return this.getAttribute(name);
                },
                set(value: string) {
                    this.setAttribute(name, value);
                }
            });
        }

    };
}