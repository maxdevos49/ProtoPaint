   
class Resize{

    private _dragging: boolean;

    private _side: string;

    private _parentElement: HTMLElement;

    private _dragElement: HTMLElement;

    public constructor(parentElement: HTMLElement){
        this._parentElement = parentElement;
        this._side = parentElement.dataset?.resize ?? "right";
        this._dragElement = document.createElement("div");
        
        this._dragging = false;

        this.addDragger();
        this.addListeners();
    }

    private addDragger() : void {
        
        this._dragElement.setAttribute("data-dragger", this._side)
        this._dragElement.innerHTML += "<hr/>";

        this._parentElement.style.position = "relative";
        this._parentElement.appendChild(this._dragElement);
    }

    private addListeners() : void{

        let startWidth: number, startHeight: number, startX: number, startY: number;

        this._dragElement.addEventListener("mousedown", (e) => {
            e.preventDefault();
            let el = document.activeElement as HTMLElement;
            el.blur();

            startX = e.clientX;
            startY = e.clientY;
            startWidth = this._parentElement.offsetWidth;
            startHeight = this._parentElement.offsetHeight;

            this._dragging = true;
        }, false);

        document.addEventListener("mousemove", (e) => {
            e.preventDefault();

            if(this._dragging)
            {

                switch(this._side){
                    case "top":
                        this._parentElement.style.height = (startHeight - (e.clientY - startY)) + 'px';
                        break;
                    case "bottom":
                        this._parentElement.style.height = (startHeight + (e.clientY - startY)) + 'px';
                        break;
                    case "right":
                        this._parentElement.style.width = (startWidth + (e.clientX - startX)) + 'px';
                        break;
                    case "left":
                        this._parentElement.style.width = (startWidth - (e.clientX - startX)) + 'px';
                        break;
                }
            }

        },false);

        document.addEventListener("mouseup", (e) => {
            e.preventDefault();
            if(this._dragging)
                this._dragging = false;
        }, false);

    }

}

document.querySelectorAll("div[data-resize]").forEach((element) => {
    new Resize(element as HTMLElement);
});

