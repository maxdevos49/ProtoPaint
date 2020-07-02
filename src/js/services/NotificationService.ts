import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { Observable, Subject } from "../../lib/observable/js/observable.js";

export interface INotification {
    message: string;
    logLevel: LogLevel
}

export enum LogLevel {
    Log,
    Warning,
    Error
}

@service()
export class NotificationService {

    private _containerElement: HTMLDivElement;
    private _notification: Subject<INotification>;
    public readonly $notification: Observable<INotification>;

    private _unread: number;
    private readonly _unreadSubject: Subject<number>;
    public readonly $unread: Observable<number>;

    public set notificationContainer(element: HTMLDivElement) {
        this._containerElement = element;
        this.$notification.subscribe(v => {
            this.appendNotification(v);
        });
    }

    constructor() {
        this._notification = new Subject();
        this.$notification = this._notification.toObservable();

        this._unread = 0;
        this._unreadSubject = new Subject();
        this.$unread = this._unreadSubject.toObservable();
        this._unreadSubject.start(() => 0);

    }

    /**
     * Create a basic notification
     * @param message The message of the notification
     */
    public notify(message: string): INotification {
        return this.generateNotification(message, LogLevel.Log);
    }

    /**
    * Create a warning notification
    * @param message The message of the notification
    */
    public notifyWarning(message: string): INotification {
        return this.generateNotification(message, LogLevel.Warning);
    }

    /**
    * Create a warning notification
    * @param message The message of the notification
    */
    public notifyError(message: string): INotification {
        return this.generateNotification(message, LogLevel.Error);
    }

    private appendNotification(n: INotification): void {

        let title: string;
        let cssClass = ""

        if (n.logLevel === LogLevel.Log) {
            title = "Notification";
        } else if (n.logLevel === LogLevel.Warning) {
            title = "Warning Notification"
            cssClass = "warning"
        } else if (n.logLevel === LogLevel.Error) {
            title = "Error Notification";
            cssClass = "error";
        }

        this._containerElement.insertAdjacentHTML("beforeend",
/*html*/`
<div class="notification ${cssClass}">
    <div>
        <p>${title}</p>
        <span class="no-select" onclick="this.closest('.notification').style.display = 'none';">X</span>
    </div>
    <p>${n.message}</p>
</div>
`.trim());

        smoothScroll(this._containerElement, 1000);
    }

    public clearUnread(): void{
        this._unread = 0;
        this._unreadSubject.next(this._unread);
    }

    private generateNotification(message: string, logLevel: LogLevel): INotification {

        if (typeof message !== "string") {
            throw new TypeError("Notification message must be a valid string");
        }

        if (this._containerElement.parentElement.classList.contains("hide")) {
            this._unread++;
            this._unreadSubject.next(this._unread);
        }

        let result = {
            message: message,
            logLevel: logLevel
        };

        this._notification.next(result);



        return result;
    }

}

//smooth scroll handler
let handler: any;

//Scrolls a element to the bottom
function smoothScroll(element: HTMLElement, duration: number) {

    //only allow 1 interval at a time
    if (handler)
        clearInterval(handler);

    let currentTime = 0;
    const steps = 200;

    let originalPosition = element.scrollTop;
    let distance = element.scrollHeight - originalPosition;

    let move = () => {

        currentTime += duration / steps;
        let percent = currentTime / duration;

        //calculate new position
        let position = easeOutQuad(percent) * distance;

        //apply new position
        element.scrollTop = originalPosition + position;

        //remove interval when 100%
        if (percent >= 1) {
            clearInterval(handler);
            handler = null;
        }

    }

    move();
    handler = setInterval(move, duration / steps);
}

/**
 *  Use for 0 -> 1 aka percentage
 */
function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
}