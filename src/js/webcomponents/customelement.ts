// import { fromEvent } from "../../lib/observable/js/observable.js";

// export class CustomElement<S extends Object> extends HTMLElement {

//     protected state: S;

//     constructor() {
//         super();

//         // fromEvent<CustomElement, S>(window, "ProtoPaint.State.Canvas", (e) => e.details).subscribe((_state) => {
//         //     this.setState(_state);
//         // });

//         window.addEventListener("ProtoPaint.State.Canvas", (e) => {

//         });

//     }

//     public show(): void {
//         this.classList.remove("hidden");
//     }

//     public hide(): void {
//         this.classList.add("hidden");
//     }

//     public setState(newState: S): void {
//         Object.entries(newState)
//             .forEach(([k, value]) => {

//                 let key: keyof S = k as unknown as any;

//                 this.state[key] = this.isObject(this.state[key]) && this.isObject(value) ? { ...this.state[key], ...value } : value;

//                 const bindKey = this.isObject(value) ? this.getBindKey(key, value) : key;
//                 // const bindKeys = this.isArray(bindKey) ? bindKey : [bindKey];

//                 // bindKeys.forEach(key => this.updateBindings(key, value));
//             });

//         this.state = newState;
//     }

//     private isObject(obj: any) {
//         return Object.prototype.toString.call(obj) === '[object Object]';
//     }

//     private getBindKey<V>(key: keyof S, obj: V): string[] {
//         return Object.keys(obj).map((k: keyof V) => this.isObject(obj[k]) ? `${key}.${this.getBindKey(k, obj[k])}` : `${key}.${k}`);
//     }

// }