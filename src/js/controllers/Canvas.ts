import { actioncontroller, action, flag, bindVariation } from "../../lib/action-commander/js/helpers/ActionDecorators.js";
import { CanvasService } from "../services/CanvasService.js";
import { DataSourceCollection, SourceMode, SelectMode } from "../../lib/action-commander/js/services/DataSourceCollection.js";
import { Observable } from "../../lib/observable/js/observable.js";

@actioncontroller("canvas", "Manage the canvas")
export class Canvas {

    private readonly _canvas: CanvasService;
    private readonly _dsc: DataSourceCollection;

    constructor(canvas: CanvasService, dsc: DataSourceCollection) {
        this._canvas = canvas;
        this._dsc = dsc;

        //scale data source
        this._dsc.addSource("scale", Observable.of({
            title: "Flag value Suggestions",
            sourceMode: SourceMode.Action,
            allowFiltering: false,
            resetOnSelect: true,
            tabCharacter: " ",
            selectMode: SelectMode.Append,
            data: [{
                value: "4"
            }, {
                value: "3.5"
            }, {
                value: "3"
            }, {
                value: "2.5"
            }, {
                value: "2"
            }, {
                value: "1.5"
            }, {
                value: "1"
            }, {
                value: "0.5"
            }, {
                value: "0.25"
            }]
        }));


    }

    @bindVariation("Pan Canvas Up", "-y=-50", "ArrowUp")
    @bindVariation("Pan Canvas Down", "-y=50", "ArrowDown")
    @bindVariation("Pan Canvas Left", "-x=-50", "ArrowLeft")
    @bindVariation("Pan Canvas Right", "-x=50", "ArrowRight")
    @action("pan", "Pan the canvas", "Pan the canvas by an x or y offset.")
    public pan(
        @flag(["-x"], "x offset to pan with", "default-number") x: number = 0,
        @flag(["-y"], "y offset to pan with", "default-number") y: number = 0
    ): void {
        this._canvas.pan(x, y);
    }

    @action("position", "Position the canvas", "Position the canvas by an x or y position.")
    public position(
        @flag(["-x"], "x coordinate to move to", "default-number") x: number,
        @flag(["-y"], "y coordinate to move to", "default-number") y: number
    ): void {

        if (x)
            this._canvas.x = x;

        if (y)
            this._canvas.y = y;

    }

    @bindVariation("Reset Canvas Scale", "-s=1")
    @bindVariation("Scale Canvas Up", "-s=0.5 -a=true")
    @bindVariation("Scale Canvas Down", "-s=-0.5 -a=true")
    @action("scale", "Scale the canvas", "Scale the canvas by a scalar.")
    public scale(
        @flag(["-s", "--scalar"], "The scale to change to", "scale") scalar: number = 1,
        @flag(["-a", "--absolute"], "Scale via current scale or absolute scale", Boolean.name) absolute: boolean = false
    ): void {

        if (absolute)
            this._canvas.setScale(this._canvas.scale + scalar);
        else {
            this._canvas.setScale(scalar);
        }
    }

    @bindVariation("Center The Canvas", "", "Meta+f")
    @action("center", "Center the canvas", "Center the canvas")
    public centerCanvas(): void {

        this._canvas.centerCanvas();
    }

    @bindVariation("Resize Canvas", "")
    @action("resize", "Resize the canvas", "Resize the canvas")
    public resizeCanvas(
        @flag(["-w", "--width"], "The width to set the canvas", "default-number") width: number,
        @flag(["-h", "--height"], "The height to change the canvas", "default-number") height: number
    ): void {


        if (width)
            this._canvas.width = width;

        if (height)
            this._canvas.height = height;

        this.centerCanvas();
    }

}