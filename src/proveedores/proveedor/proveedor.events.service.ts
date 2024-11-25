import { Injectable } from "@nestjs/common";
import { ProveedorService } from "./proveedor.service";
import { OnEvent } from "@nestjs/event-emitter";
import { ContratoEvent } from "src/contratos/interfaces/contrato-evento";

@Injectable()
export class ProveedorEventosService {
    constructor(
        private readonly proveedorService:ProveedorService,
    ){}


    @OnEvent('contrato.liberado',{async:true})
    async activarProveedor(event:ContratoEvent){
        const proveedorId = event.payload.proveedor.id;
        await this.proveedorService.activarProveedor(proveedorId);
        return;
    }

}