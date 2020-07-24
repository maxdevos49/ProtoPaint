import { IPaintLayer } from "./IPaintLayer.js";

export interface IPaintFrame {
    name: string;
    layers: IPaintLayer[];
    open: boolean;
}