import { Orden } from "../orden/entities/orden.entity";

export class OrdenEvent {
    orden:Orden;
    constructor(
        orden:Orden
    ){
        this.orden = orden;
    }
}