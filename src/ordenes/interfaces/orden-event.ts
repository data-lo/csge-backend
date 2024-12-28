export class OrdenEvent {
    ordenId:string;
    evento:string;
    constructor(
        ordenId:string,
        evento:string
    ){
        this.ordenId = ordenId;
        this.evento = evento;
    }
}