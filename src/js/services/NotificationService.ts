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

    public set notificationContainer(element: HTMLDivElement) {
        this._containerElement = element;
        this.$notification.subscribe(v => {
            this.appendNotification(v);
        });
    }

    constructor() {
        this._notification = new Subject();
        this.$notification = this._notification.toObservable();
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

        let children = this._containerElement.querySelectorAll(".notification");
        (children[children.length - 1] as any)?.scrollIntoViewIfNeeded?.()
    }

    private generateNotification(message: string, logLevel: LogLevel): INotification {

        if (typeof message !== "string") {
            throw new TypeError("Notification message must be a valid string");
        }

        let result = {
            message: message,
            logLevel: logLevel
        };

        this._notification.next(result);

        return result;
    }

}