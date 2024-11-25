import { Proveedor } from "../entities/proveedor.entity";


export class ProveedorEvent {
    payload: Proveedor;
    constructor(
        payload: { proveedor: Proveedor }
    ) {
        this.payload = payload.proveedor
    }
}