export interface IConfiguration {

    searchContainerId?: string;
    actionControllers?: Array<new (...args: any[]) => any>;

}