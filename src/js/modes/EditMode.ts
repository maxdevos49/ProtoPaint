import { InteractionMode } from "../services/InteractionModeService.js";
import { IInteractionMode } from "../interfaces/IInteractionMode.js";
import { Vector } from "../helpers/vector.js";
import { CanvasService } from "../services/CanvasService.js";
import { PixelDrawingService } from "../services/PixelDrawingService.js";

@InteractionMode()
export class EditMode implements IInteractionMode {

    private _mouseDown: boolean;
    private _previousPosition: Vector;
    private readonly _canvas: CanvasService;
    private readonly _pixel: PixelDrawingService;


    constructor(canvas: CanvasService, pixel: PixelDrawingService) {
        this._canvas = canvas;
        this._pixel = pixel;

        this._previousPosition = new Vector();

    }

    public init(): void {
        this._canvas.interactionLayer.style.cursor = "crosshair";
    }

    public onMouseDown(e: MouseEvent): void {
        this._pixel.activate(e.offsetX, e.offsetY);

    }

    public onMouseUp(e: MouseEvent): void {
    }

    public onMouseMove(e: MouseEvent): void {
        if (this._mouseDown)
            this._canvas.pan(e.offsetX - this._previousPosition.x, e.offsetY - this._previousPosition.y);

        this._previousPosition.x = e.offsetX;
        this._previousPosition.y = e.offsetY;
    }


    public onMouseLeave(e: MouseEvent): void {
    }

    public onMouseDblClick(e: MouseEvent): void {
        if (e.altKey)
            this._canvas.scaleFromPoint(this._canvas.scale - this._canvas.dblClickScale, e.offsetX, e.offsetY);
        else
            this._canvas.scaleFromPoint(this._canvas.scale + this._canvas.dblClickScale, e.offsetX, e.offsetY);
    }

    public onContextMenu(e: MouseEvent): void {
    }

    public onWheel(e: WheelEvent): void {
        if (e.altKey)
            this._canvas.scaleFromPoint(this._canvas.scale + e.deltaY * -0.01, e.offsetX, e.offsetY);
        else
            this._canvas.pan(e.deltaX * -0.2, e.deltaY * -0.2);
    }



}