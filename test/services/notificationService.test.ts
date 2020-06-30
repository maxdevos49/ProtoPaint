import JSDOM from "jsdom";
import { specification, it, expect, beforeEach, afterEach } from "prototest";
import { NotificationService, INotification, LogLevel } from "../../src/js/services/NotificationService.js";

specification({
    title: "Notification Service",
    authors: [
        "Maxwell DeVos"
    ],
    description:
        "The notification service is to serve as communicating alerts and messages to the user in a standardized way. The service will have 3 levels of notification "
        + "with those levels being notify, notifyWarning, and notifyError.",
    specs: [
        ["Service Init", () => {

            let service = new NotificationService();

            it("Should have the property $notification", () => {
                expect(service).toHaveProperty("$notification");
            });

            it("Should have the method notify", () => {
                expect(service).toHaveMethod("notify");
            });

            it("Should have the method notifyWarning", () => {
                expect(service).toHaveMethod("notifyWarning");
            });

            it("Should have the method notifyError", () => {
                expect(service).toHaveMethod("notifyError");
            });
        }],
        ["Notify Method", () => {
            let service = new NotificationService();
            it("Should throw a type error if passed null or undefined", () => {
                expect(() => service.notify(null)).toThrow(TypeError);
                expect(() => service.notify(undefined)).toThrow(TypeError);
            });

            let message = "Test Message";
            let iNotify: INotification = service.notify(message);
            it("Should return a INotification object with expected values", () => {
                expect(iNotify).toHaveProperty("message");
                expect(iNotify).toHaveProperty("logLevel");

                expect(iNotify.message).toStrictEqual(message);
                expect(iNotify.logLevel).toStrictEqual(LogLevel.Log);
            });

            iNotify = undefined;
            service.$notification.subscribe((v) => {
                iNotify = v;
            });
            service.notify(message);

            it("Should trigger the $notification observable when called", () => {
                expect(iNotify).toBeDefined();
            });
        }],
        ["Notify Warning Method", () => {
            let service = new NotificationService();
            it("Should throw a TypeError if passed null or undefined", () => {
                expect(() => service.notifyWarning(null)).toThrow(TypeError);
                expect(() => service.notifyWarning(undefined)).toThrow(TypeError);
            });

            let message = "Test Warning Message";
            let iNotify: INotification = service.notifyWarning(message);

            it("Should return a INotification object with expected values", () => {
                expect(iNotify).toHaveProperty("message");
                expect(iNotify).toHaveProperty("logLevel");

                expect(iNotify.message).toStrictEqual(message);
                expect(iNotify.logLevel).toStrictEqual(LogLevel.Warning);
            });

            iNotify = undefined;
            service.$notification.subscribe((v) => {
                iNotify = v;
            });

            service.notifyWarning(message);
            it("Should trigger the $notification observable when called", () => {
                expect(iNotify).toBeDefined();
            });
        }],
        ["Notify Error Method", () => {
            let service = new NotificationService();
            it("Should throw a TypeError if passed null or undefined", () => {
                expect(() => service.notifyError(null)).toThrow(TypeError);
                expect(() => service.notifyError(undefined)).toThrow(TypeError);
            });

            let message = "Test Error Message";
            let iNotify: INotification = service.notifyError(message);

            it("Should return a INotification object with expected values", () => {
                expect(iNotify).toHaveProperty("message");
                expect(iNotify).toHaveProperty("logLevel");

                expect(iNotify.message).toStrictEqual(message);
                expect(iNotify.logLevel).toStrictEqual(LogLevel.Error);
            });

            iNotify = undefined;
            service.$notification.subscribe((v) => {
                iNotify = v;
            });

            service.notifyError(message);
            it("Should trigger the $notification observable when called", () => {
                expect(iNotify).toBeDefined();
            });
        }],
        ["Notification HTML Container", () => {
            const { window } = new JSDOM.JSDOM();

            let container: HTMLDivElement = window.document.createElement("DIV") as HTMLDivElement;
            let service = new NotificationService();
            service.notificationContainer = container;

            let message = "Test Message";

            let template = (title: string, cssClass: string, message: string) => /*html*/`
<div class="notification ${cssClass}">
    <div>
        <p>${title}</p>
        <span class="no-select" onclick="this.closest('.notification').style.display = 'none';">X</span>
    </div>
    <p>${message}</p>
</div>`.trim();

            let outputHTML = template("Notification", "", message);
            service.notify(message);

            it("Container should have 1 basic notification", () => {
                expect(container.innerHTML).toStrictEqual(outputHTML);
            });

            outputHTML += template("Warning Notification", "warning", message);
            service.notifyWarning(message);

            it("Container should have 2 notifications. 1 basic and 1 Warning", () => {
                expect(container.innerHTML).toStrictEqual(outputHTML);
            });

            outputHTML += template("Error Notification", "error", message);
            service.notifyError(message);

            it("Container should have 3 notifications. 1 basic, 1 warning, and 1 error", () => {
                expect(container.innerHTML).toStrictEqual(outputHTML);
            });

            //Cleanup window
            window.close();
        }]
    ]
});