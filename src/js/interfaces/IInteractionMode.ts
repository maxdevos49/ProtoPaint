
export interface IInteractionMode {

    init(): void;

    onMouseClick?(e: MouseEvent): void;
    onMouseDblClick?(e: MouseEvent): void;
    onMouseDown?(e: MouseEvent): void;
    onMouseUp?(e: MouseEvent): void;
    onMouseMove?(e: MouseEvent): void;
    onMouseEnter?(e: MouseEvent): void;
    onMouseLeave?(e: MouseEvent): void;
    onContextMenu?(e: MouseEvent): void;
    onWheel?(e: WheelEvent): void;
}