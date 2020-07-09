import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IPaintFrame } from "../interfaces/IPaintFrame.js";
import { IPaintLayer, LayerType } from "../interfaces/IPaintLayer.js";
import { Observable, Subject } from "../../lib/observable/js/observable.js";

@service()
export class ProjectService {

    public name: string;
    public readonly $frames: Observable<IPaintFrame[]>;

    // private _defaultPixelData?: IPixelData;
    // private _defaultVectorData?: IVectorData;

    private _defaultLayerType: LayerType;

    private readonly _frameSubject: Subject<IPaintFrame[]>;
    private readonly _frameMap: Map<string, IPaintFrame>;


    constructor() {
        this._defaultLayerType = LayerType.Pixel;
        this._frameMap = new Map();
        this._frameSubject = new Subject();
        this.$frames = this._frameSubject.toObservable();
        this._frameSubject.start(() => [...this._frameMap.values()]);
    }


    // public newProject(): void {
    //     throw new Error("Method not implemented");
    // }

    // public resetProject(): void {
    //     throw new Error("Method not implemented");
    // }

    // public saveProject(): void {
    //     throw new Error("Method not implemented");
    // }

    // public loadProject(): void {
    //     throw new Error("Method not implemented");
    // }



    public addFrame(frameName: string, layerType?: LayerType): IPaintFrame {

        if (frameName === null || frameName === undefined || frameName.length === 0)
            throw new TypeError("Frame name must be a valid string");

        if (this._frameMap.has(frameName))
            throw new Error(`The frame name ${frameName} is already used. Try a different name.`);

        let frame: IPaintFrame = {
            name: frameName,
            layers: []
        };

        this._frameMap.set(frameName, frame);

        //Add first layer
        this.addLayerToFrame(frameName, "Layer 1", layerType);

        //trigger observable
        this._frameSubject.next([...this._frameMap.values()]);

        return frame;
    }

    public removeFrame(frameName: string): void {

        if (typeof frameName !== "string" || frameName.length === 0)
            throw new TypeError("frameName must be a valid string longer then 1 character");

        if (!this._frameMap.has(frameName))
            throw new Error(`The frameName: "${frameName}" was not a valid frameName`);

        this._frameMap.delete(frameName);
        this._frameSubject.next([...this._frameMap.values()]);
    }

    // public getFrame(frameName: string): IPaintFrame {
    //     throw new Error("Method not implemented");
    // }

    // public frameCount(): number {
    //     throw new Error("Method not implemented");
    // }



    public addLayerToFrame(frameName: string, layerName: string, layerType?: LayerType): IPaintLayer {
        layerType = layerType ?? this._defaultLayerType;

        if (typeof frameName !== "string" || frameName.length === 0 || typeof layerName !== "string" || layerName.length === 0)
            throw new TypeError("frameName and/or layerName must be a valid string at least 1 character long");

        if (!this._frameMap.has(frameName))
            throw new Error(`The frameName: "${frameName}" does not exist`);

        let frame = this._frameMap.get(frameName);

        if (frame.layers.filter(v => v.name === layerName).length > 0)
            throw new Error(`Layer name: "${layerName}" cannot be repeated`);

        let newLayer: IPaintLayer = {
            name: layerName,
            layerType: layerType,
        };

        if (layerType === LayerType.Pixel) {
            newLayer.pixelData = {
                columns: 10,
                rows: 10,
                grid: []
            };//TODO use default later
        } else if (layerType === LayerType.Vector) {
            newLayer.vectorData = {};//TODO in future
        }

        //TODO indicate frame was added somehow


        frame.layers.push(newLayer);
        return newLayer;
    }

    public removeLayerFromFrame(frameName: string, layerName: string): void {

        if (typeof frameName !== "string" || frameName.length === 0 || typeof layerName !== "string" || layerName.length === 0)
            throw new TypeError("frameName and/or layerName must be a valid string at least 1 character long");

        if (!this._frameMap.has(frameName))
            throw new Error(`The frameName: "${frameName}" does not exist`);

        let frame = this._frameMap.get(frameName);
        let index: number;

        if (frame.layers.filter((v, i) => {
            if (v.name === layerName)
                index = i;
            return v.name === layerName;
        }).length === 0)
            throw new Error(`Layer name: "${layerName}" cannot be found`);

        frame.layers.splice(index, 1);

        //TODO indicate frame was removed somehow
    }

    // public getFrameLayer(frameName: string, layerName: string): IPaintLayer {
    //     throw new Error("Method not implemented");
    // }

    // public frameLayerCount(frameName: string): number {
    //     throw new Error("Method not implemented");
    // }


    //TODO Render hook/Observable? Maybe Observable string/enum with indication of what to re render

}