import { InteractionMode } from "../services/InteractionModeService.js";
import { IInteractionMode } from "../interfaces/IInteractionMode.js";
import { Vector } from "../helpers/vector.js";
import { CanvasService } from "../services/CanvasService.js";

@InteractionMode()
export class EditMode implements IInteractionMode {

    private _mouseDown: boolean;
    private _previousPosition: Vector;

    private readonly _canvas: CanvasService;
    constructor(canvas: CanvasService) {
        this._canvas = canvas;
    }

    public init(): void {
        throw new Error("Method not implemented.");
    }

    public onMouseDown(e: MouseEvent): void {
        this.mouseDown();
    }

    public onMouseUp(e: MouseEvent): void {
        this.mouseUp();
    }

    public onMouseMove(e: MouseEvent): void {
        if (this._mouseDown)
            this._canvas.pan(e.offsetX - this._previousPosition.x, e.offsetY - this._previousPosition.y);

        this._previousPosition.x = e.offsetX;
        this._previousPosition.y = e.offsetY;
    }


    public onMouseLeave(e: MouseEvent): void {
        this.mouseUp();
    }

    public onMouseDblClick(e: MouseEvent): void {
        if (e.altKey)
            this._canvas.scaleFromPoint(this._canvas.scale - this._canvas.dblClickScale, e.offsetX, e.offsetY);
        else
            this._canvas.scaleFromPoint(this._canvas.scale + this._canvas.dblClickScale, e.offsetX, e.offsetY);
    }

    public onContextMenu(e: MouseEvent): void {
        this.mouseUp();
    }

    public onWheel(e: WheelEvent): void {
        if (e.altKey)
            this._canvas.scaleFromPoint(this._canvas.scale + e.deltaY * -0.01, e.offsetX, e.offsetY);
        else
            this._canvas.pan(e.deltaX * -0.2, e.deltaY * -0.2);
    }


    private mouseDown(): void {
        this._mouseDown = true;
        this._canvas.interactionLayer.style.cursor = "grabbing";
    }

    private mouseUp(): void {
        this._mouseDown = false;
        this._canvas.interactionLayer.style.cursor = "grab";
    }
}