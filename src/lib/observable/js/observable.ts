
//#region Decorator Helpers

/* class decorator */
export function staticImplements<T>() {
    return <U extends T>(constructor: U) => { constructor };
}

export function enumerable(value: boolean): MethodDecorator {
    return function (target: object, propertyKey: string | Symbol, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

//#endregion

//#region Interfaces

export interface IStaticObservable<T> {
    new(subscriber: (observer: ISubscriptionObserver<T>) => (() => void) | ISubscription): IObservable<T>;

    // Converts items to an Observable
    of<R>(...items: R[]): IObservable<R>;

    // Converts an observable or iterable to an Observable
    from<R>(observable: IObservable<R>): IObservable<R>;
}
export interface IObservable<T> {

    // Subscribes to the sequence with callbacks or a observer
    subscribe(onNext: (value: T) => void | IObserver<T>, onError?: (error: any) => void, onComplete?: () => void): ISubscription;

    //Extras
    forEach(fn: (value: T) => void): Promise<void>;
    map<R>(fn: (value: T) => R): IObservable<R>;
    filter(fn: (value: T) => boolean): IObservable<T>;

}

export interface ISubscriberFunction<T> {
    (observer: ISubscriptionObserver<T>): void | (() => void) | ISubscription;
}

export interface IStaticSubscription {
    new(observer: IObserver<any>, subscriber: ISubscriberFunction<any>): ISubscription
}
export interface ISubscription {

    // Cancels the subscription
    unsubscribe(): void;

    // A boolean value indicating whether the subscription is closed
    closed: boolean;
}

export interface IObserver<T> {

    // Receives the subscription object when `subscribe` is called
    start?(subscription: ISubscription): any;

    // Receives the next value in the sequence
    next?(value: T): void;

    // Receives the sequence error
    error?(errorValue: any): void;

    // Receives a completion notification
    complete?(): void;
}

export interface ISubscriptionObserver<T> {

    // Sends the next value in the sequence
    next(value: T): void;

    // Sends the sequence error
    error(errorValue: any): void;

    // Sends the completion notification
    complete(): void;

    // A boolean value indicating whether the subscription is closed
    closed: boolean;
}



//#endregion

//#region class Observable

const hasSymbols = () => typeof Symbol === 'function';
//@ts-ignore
const hasSymbol: (value: string) => any = (name: string) => hasSymbols() && Boolean(Symbol[name]);


@staticImplements<IStaticObservable<any>>()
export class Observable<T> implements IObservable<T>{

    private readonly _subscriber: ISubscriberFunction<T>;

    //@ts-ignore
    [Symbol.observable]() { return this }

    constructor(subscriber: ISubscriberFunction<T>) {

        // The stream subscriber must be a function
        if (typeof subscriber !== "function")
            throw new TypeError("Observable initializer must be a function");

        this._subscriber = subscriber;
    }

    //#region Subscribe()
    public subscribe(observer: IObserver<T> | ((value: T) => void), ...args: Function[]): Subscription {

        if (typeof observer === "function") {
            observer = {
                next: observer as (value: T) => void,
                error: args[0] as (error: any) => void,
                complete: args[1] as () => void
            };
        }
        else if (typeof observer !== "object") {
            observer = {};
        }

        return new Subscription(observer, this._subscriber);
    }

    //#endregion

    //#region Observable.of()

    public static of<R>(...items: R[]): Observable<R> {

        let C: new (observer: ISubscriberFunction<R>) => Observable<R> = typeof this === "function" ? this : Observable;

        return new C(observer => {

            for (let i = 0; i < items.length; ++i) {

                observer.next(items[i]);

                if (observer.closed)
                    return;
            }

            observer.complete();

            return;
        });
    }

    //#endregion

    //#region Observable.from()

    public static from<R>(x: Observable<R>): Observable<R> {

        let C: new (observer: ISubscriberFunction<R>) => Observable<R> = typeof this === "function" ? this : Observable;

        if (x == null)
            throw new TypeError(x + " is not an object");

        //@ts-ignore
        let method = getClassMethod<Observable<R>, () => Observable<R>>(x, Symbol.observable);

        if (method) {

            let observable = method.call(x);

            if (Object(observable) !== observable)
                throw new TypeError(observable + " is not an object");

            if (observable.constructor === C)
                return observable;

            return new C(observer => observable.subscribe(observer));
        }

        method = getClassMethod(x, Symbol.iterator);

        if (!method)
            throw new TypeError(x + " is not observable");

        return new C(observer => {

            //@ts-ignore
            for (let item of method.call(x)) {

                observer.next(item);

                if (observer.closed)
                    return;
            }

            observer.complete();

            return;
        });

    }

    //#endregion

    //#region this.ForEach()

    public forEach(fn: (value: T, done?: () => void) => void): Promise<void> {

        return new Promise((resolve, reject) => {
            if (typeof fn !== 'function') {
                reject(new TypeError(fn + ' is not a function'));
                return;
            }

            function done() {
                subscription.unsubscribe();
                resolve();
            }

            let subscription = this.subscribe({
                next(value) {
                    try {
                        fn(value, done);//Not sure of "done" purpose
                    } catch (e) {
                        reject(e);
                        subscription.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
        });
    }
    //#endregion

    //#region this.map()

    public map<R>(fn: (value: T) => R): Observable<R> {
        if (typeof fn !== 'function')
            throw new TypeError(fn + ' is not a function');

        let C = getSpecies(this);

        return new C((observer: IObserver<T>) => this.subscribe({
            next(value) {
                try {
                    //@ts-ignore i give up D:
                    value = fn(value)
                }
                catch (e) {
                    return observer.error(e)
                }
                observer.next(value);
            },
            error(e) { observer.error(e) },
            complete() { observer.complete() },
        }));
    }

    //#endregion

    //#region this.filter()

    public filter(fn: (value: T) => boolean): Observable<T> {
        if (typeof fn !== 'function')
            throw new TypeError(fn + ' is not a function');

        let C = getSpecies(this);

        return new C((observer: IObserver<T>) => this.subscribe({
            next(value) {
                try {
                    if (!fn(value)) return;
                }
                catch (e) {
                    return observer.error(e)
                }
                observer.next(value);
            },
            error(e) { observer.error(e) },
            complete() { observer.complete() },
        }));
    }

    //#endregion
}

//#endregion

//#region class Subscription

@staticImplements<IStaticSubscription>()
export class Subscription implements ISubscription {
    private _cleanup: () => void | undefined;
    private _observer: IObserver<any> | undefined;

    @enumerable(false)
    public get closed(): boolean {
        return this.subscriptionClosed()
    }

    constructor(observer: IObserver<any>, subscriber: ISubscriberFunction<any>) {
        this._cleanup = undefined;
        this._observer = observer;

        try {
            let start = getClassMethod<IObserver<any>, (subscription: ISubscription) => any>(observer, "start");

            if (start)
                start.call(observer, this);
        }
        catch (e) {
            console.error(e);
        }

        if (this.subscriptionClosed())
            return;

        let subObserver = new SubscriptionObserver(this);

        try {

            // Call the subscriber function
            let cleanupsub = subscriber.call(undefined, subObserver) as ISubscription;
            let cleanup: () => void;

            // The return value must be undefined, null, a subscription object, or a function
            if (cleanupsub != null) {
                if (typeof cleanupsub.unsubscribe === "function")
                    cleanup = () => { this.unsubscribe() };
                else if (typeof cleanupsub !== "function")
                    throw new TypeError(cleanupsub + " is not a function");

                this._cleanup = cleanup;
            }

        } catch (e) {

            // If an error occurs during startup, then send the error
            // to the observer.
            observer.error(e);
            return;
        }

        // If the stream is already finished, then perform cleanup
        if (this.subscriptionClosed()) {
            this.cleanupSubscription();
        }

    }

    @enumerable(false)
    public unsubscribe(): void {
        if (this.subscriptionClosed())
            return;

        this._observer = undefined;
        this.cleanupSubscription();
    }

    //#region Helper Methods

    private subscriptionClosed() {
        return this._observer === undefined;
    }

    private cleanupSubscription() {
        // Assert:  observer._observer is undefined
        let cleanup = this._cleanup;

        if (!cleanup)
            return;

        // Drop the reference to the cleanup function so that we won't call it
        // more than once
        this._cleanup = undefined;

        // Call the cleanup function
        try {
            cleanup();
        }
        catch (e) {
            console.error(e);
        }
    }

    //#endregion

}

//#endregion

//#region class SubscriptionObserver
export class SubscriptionObserver<T> implements ISubscriptionObserver<T>{
    private _subscription: Subscription;
    get closed(): boolean {
        return this._subscription.closed;
    }
    constructor(subscription: Subscription) {
        this._subscription = subscription;
    }

    //#region next()

    @enumerable(false)
    public next(value: T): void {

        // If the stream if closed, then return undefined
        if (this._subscription.closed)
            return undefined;

        //@ts-ignore
        let observer = this._subscription._observer;

        try {
            let m = getClassMethod<IObserver<T>, (value: T) => void>(observer, "next");

            // If the observer doesn't support "next", then return undefined
            if (!m)
                return undefined;

            // Send the next value to the sink
            m.call(observer, value);
        }
        catch (e) {
            //    console.error(e);
        }
        return undefined;
    }

    //#endregion

    //#region error()

    @enumerable(false)
    public error(value: any): void {

        // If the stream is closed, throw the error to the caller
        if (this._subscription.closed)
            return undefined;

        //@ts-ignore
        let observer = this._subscription._observer;

        try {
            let m = getClassMethod<IObserver<T>, (error: any) => void>(observer, "error");

            // If the sink does not support "error", then return undefined
            if (m)
                m.call(observer, value);

        } catch (e) {
            console.error(e);
        }

        this._subscription.unsubscribe();

        return undefined;
    }

    //#endregion

    //#region complete()

    @enumerable(false)
    public complete(): void {

        // If the stream is closed, then return undefined
        if (this._subscription.closed)
            return undefined;

        //@ts-ignore
        let observer = this._subscription._observer;

        try {

            let m = getClassMethod<IObserver<T>, () => void>(observer, "complete");

            // If the sink does not support "complete", then return undefined
            if (m)
                m.call(observer);

        } catch (e) {
            console.error(e);
        }

        this._subscription.unsubscribe();

        return undefined;
    }

    //#endregion


}

//#endregion

//#region class Subject

export class Subject<T> {

    private _start?: () => T;
    private _observers: Set<IObserver<T>>;
    private readonly _observable: Observable<T>;

    constructor() {
        this._observers = new Set();

        this._observable = new Observable((observer) => {
            this.captureObserver(observer);
            if (this._start)
                observer.next(this._start());

            return () => {
                this.deleteObserver(observer);
            };
        });
    }

    //#region Start()

    public start(value: () => T): void {
        this._start = value;
    }

    //#endregion

    //#region next()

    @enumerable(false)
    public next(value: T): void {
        this.send((o) => o.next(value));
    }

    //#endregion

    //#region Error()

    @enumerable(false)
    public error(e: any): void {
        this.send((o) => o.error(e));
    }

    //#endregion

    //#region Complete()

    @enumerable(false)
    public complete(): void {
        this.send((o) => o.complete());
    }

    //#endregion

    //#region toObservable()

    @enumerable(false)
    public toObservable(): Observable<T> {
        return this._observable;
    }

    //#endregion

    //#region Private Helpers
    private send(selector: (o: IObserver<T>) => void) {
        if (this._observers.size === 0)
            return;

        this._observers.forEach(selector);
    }

    private captureObserver(observer: IObserver<T>) {
        this._observers.add(observer);
    }

    private deleteObserver(observer: IObserver<T>) {
        this._observers.delete(observer);
    }

    //#endregion
}

//#endregion

//#region Helpers Functions

export function getClassMethod<T, TValue>(obj: T, key: string | Symbol): TValue | undefined {

    let value: TValue = (obj as any)[key as unknown as string];

    if (value == null)
        return undefined;

    if (typeof value !== "function")
        throw new TypeError(value + " is not a function");

    return value;
}

function getSpecies(obj: any): new (...args: any[]) => any {
    let ctor = obj.constructor;
    if (ctor !== undefined) {
        ctor = ctor[(hasSymbol("species") ? Symbol[name] : '@@' + name) as unknown as any];
        if (ctor === null) {
            ctor = undefined;
        }
    }
    return ctor !== undefined ? ctor : Observable;
}

//#endregion

//# Observable Factories

export function fromEvent<T extends Event, TValue>(targetElement: HTMLElement, event: string, selector: (event: T) => TValue, defaultValue?: TValue): Observable<TValue> {

    return new Observable<TValue>(o => {

        if (defaultValue)
            o.next(defaultValue);

        let handler: any = (e: T) => {
            o.next(selector(e));
        };

        targetElement.addEventListener(event, handler, false);

        //cleanup
        return () => {
            targetElement.removeEventListener(event, handler, false);
        }
    });
}

export function fromProperty<T>(target: T, propertyKey: keyof T, setter?: (value: any) => any): Observable<any> {
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

    if (!descriptor)
        throw new Error(`The property key: "${propertyKey}" is not valid`);

    //these are captured by the getter/setters
    let subject = new Subject<any>();
    let value = descriptor.value;//get original value

    subject.start(() => value);

    //define getter
    let get = () => value;

    //define setter
    let set = (newValue: any) => {
        value = (!setter) ? newValue : setter(newValue);
        subject.next(value);
    }

    //update property
    Object.defineProperty(target, propertyKey, {
        get: get,
        set: set
    })

    return subject.toObservable();
}