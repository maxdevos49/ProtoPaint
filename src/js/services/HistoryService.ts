import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";


export interface Undoable<D> {

    pushState(data: D): void;

    getState(): D;

}

class Test {
    test: number;
    other: number;
}

@service()
export class HistoryService {

    constructor() {

    }


    public addHistoryGroup(): void {

    }

    public addHistory(): void {

    }

    public undo(times: number = 1): void {

    }

    public redo(times: number = 1): void {

    }

}