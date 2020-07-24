import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IPaintFrame } from "../interfaces/IPaintFrame.js";
import { IPaintLayer, LayerType } from "../interfaces/IPaintLayer.js";
import { ProjectMenuElement, ITreeData } from "../webcomponents/project-menu.js";

@service()
export class ProjectService {

    public set menuElement(element: ProjectMenuElement) {
        this._menuElement = element;
        this.init();
    }

    private _menuElement: ProjectMenuElement;
    private _defaultLayerType: LayerType;
    private _selectedFrame: number;
    private _selectedLayer: number;
    private readonly _frames: IPaintFrame[];


    constructor() {
        this._defaultLayerType = LayerType.Pixel;
        this._frames = [];
        this._selectedFrame = 0;
        this._selectedLayer = 0;

        this.addFrame("Frame 1");
    }

    private init() {

        //item is selected
        this._menuElement.addEventListener("menu-item-select", ((e: CustomEvent) => {
            let frameIndex: number = e.detail.frameIndex;
            let layerIndex: number = e.detail.layerIndex ?? 0;

            this.select(frameIndex, layerIndex);

        }) as EventListener);

        //Frame list is toggled
        this._menuElement.addEventListener("menu-item-toggle", ((e: CustomEvent) => {
            this.toggleFrameList(e.detail.frameIndex);
        }) as EventListener);

        //Menu item title is edited
        this._menuElement.addEventListener("menu-title-edit", ((e: CustomEvent) => {
            this.renameTitle(e.detail.title, e.detail.frameIndex, e.detail.layerIndex);
        }) as EventListener);

        //Menu item button is clicked
        this._menuElement.addEventListener("menu-item-button-click", ((e: CustomEvent) => {
            let buttonType: string = e.detail.buttonType;
            let frameIndex: number = e.detail.frameIndex;
            let layerIndex: number | null = e.detail.layerIndex;

            if (layerIndex === null) {
                if (buttonType === "add") {
                    this.showFrameList(frameIndex);
                    this.addLayerToFrame(frameIndex, "Layer " + (this.frameLayerCount(frameIndex) + 1));
                } else if (buttonType === "remove") {
                    this.removeFrame(frameIndex);
                }

                this.renderChanges();
            } else {
                if (buttonType === "visibility") {
                    this.toggleLayerVisibility(frameIndex, layerIndex);
                } else if (buttonType === "remove") {
                    this.removeLayerFromFrame(frameIndex, layerIndex);
                    this.renderChanges();
                }

            }



        }) as EventListener);

        this._menuElement.addEventListener("menu-button-click", ((e: CustomEvent) => {
            let buttonType = e.detail.buttonType;

            if (buttonType === "refresh") {
                this.renderChanges();
            } else if (buttonType === "add") {
                this.addFrame("Frame " + (this.frameCount() + 1));
                this.renderChanges();
            }
        }) as EventListener);

        this.renderChanges();
    }

    public frameCount(): number {
        return this._frames.length;
    }

    public addFrame(frameName: string, layerType?: LayerType): number {

        if (frameName === null || frameName === undefined || frameName.length === 0)
            throw new TypeError("Frame name must be a valid string");

        let frame: IPaintFrame = {
            name: frameName,
            open: false,
            layers: []
        };

        let frameIndex = this._frames.push(frame) - 1;

        //Add first layer
        this.addLayerToFrame(frameIndex, "Layer 1", layerType);

        return frameIndex;
    }

    public getFrame(index: number): IPaintFrame {
        if (typeof index !== "number" || index < 0 || index >= this._frames.length)
            throw new TypeError("Index must be a valid integer >= 0 and < frameCount");

        return this._frames[index];
    }

    public removeFrame(index: number): void {

        if (typeof index !== "number" || index < 0 || index >= this._frames.length)
            throw new TypeError("Index must be a number within the range of current frames.");

        this._frames.splice(index, 1);
    }

    public addLayerToFrame(frameIndex: number, layerName: string, layerType?: LayerType): number {
        layerType = layerType ?? this._defaultLayerType;

        if (typeof frameIndex !== "number" || frameIndex < 0 || frameIndex >= this._frames.length)
            throw new TypeError("frameIndex must be a valid number >= 0 or < frame count.");

        if (typeof layerName !== "string" || layerName.length === 0)
            throw new TypeError("layerName must be a valid string at least 1 character long.");


        let newLayer: IPaintLayer = {
            name: layerName,
            visibility: true,
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

        let layerIndex = this._frames[frameIndex].layers.push(newLayer) - 1;
        return layerIndex;
    }

    public removeLayerFromFrame(frameIndex: number, layerIndex: number): void {

        if (typeof frameIndex !== "number" || frameIndex < 0 || frameIndex >= this._frames.length)
            throw new TypeError("frameIndex must be a valid integer > 0 and < frame count");

        if (this._frames[frameIndex].layers.length === 0)
            throw new Error("No layers exist on frame");

        if (typeof layerIndex !== "number" || layerIndex < 0 || layerIndex >= this._frames[frameIndex].layers.length)
            throw new TypeError("layerIndex must be a valid integer > 0 and < layer count");


        this._frames[frameIndex].layers.splice(layerIndex, 1);
    }

    public getFrameLayer(frameIndex: number, layerIndex: number): IPaintLayer {

        if (typeof frameIndex !== "number" || frameIndex < 0 || frameIndex >= this._frames.length)
            throw new TypeError("frameIndex must be a valid integer >= 0 or < frameCount.");

        if (typeof layerIndex !== "number" || layerIndex < 0 || layerIndex >= this._frames[frameIndex].layers.length)
            throw new TypeError("layerIndex must be a valid integer >= 0 or < frameLayerCount.");

        return this._frames[frameIndex].layers[layerIndex];
    }

    public frameLayerCount(frameIndex: number): number {

        if (typeof frameIndex !== "number" || frameIndex < 0 || frameIndex >= this._frames.length)
            throw new TypeError("Frame with the index: ${frameIndex} is not valid");

        return this._frames[frameIndex].layers.length;
    }

    public select(frameIndex: number, layerIndex?: number): void {//TODO TEST

        if (typeof frameIndex !== "number" || frameIndex < 0 || frameIndex >= this._frames.length)
            throw new TypeError("frameIndex was not valid");

        this._selectedFrame = frameIndex;
        this._selectedLayer = layerIndex ?? 0;
    }

    public toggleFrameList(frameIndex: number) {//TODO TEST
        let frame = this.getFrame(frameIndex);
        frame.open = !frame.open;
    }

    public showFrameList(frameIndex: number) {//TODO TEST
        let frame = this.getFrame(frameIndex);
        frame.open = true;
    }

    public hideFrameList(frameIndex: number) {//TODO TEST
        let frame = this.getFrame(frameIndex);
        frame.open = false;
    }

    public renameTitle(title: string, frameIndex: number, layerIndex?: number | null | undefined) {//TODO TEST

        if (!layerIndex) {
            this.getFrame(frameIndex).name = title;
        } else {
            this.getFrameLayer(frameIndex, layerIndex).name = title;
        }

    }

    public toggleLayerVisibility(frameIndex: number, layerIndex: number): void {
        let layer = this.getFrameLayer(frameIndex, layerIndex);

        layer.visibility = !layer.visibility;
    }

    public renderChanges(): void {
        if (this._menuElement)
            this._menuElement.data = this.generateMenuData();
    }

    private generateMenuData() {
        let data: ITreeData[] = [];

        this._frames.forEach((frameData, frameIndex) => {

            let layerMenuData: ITreeData[] = [];

            frameData.layers.forEach((layerData, layerIndex) => {
                layerMenuData.push({
                    name: layerData.name,
                    visibility: layerData.visibility,
                    selected: (this._selectedFrame === frameIndex && this._selectedLayer === layerIndex)
                });
            });

            data.push({
                name: frameData.name,
                open: frameData.open,
                selected: (this._selectedFrame === frameIndex),
                data: layerMenuData
            });
        });

        return data;
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

}
