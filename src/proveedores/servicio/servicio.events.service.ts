import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ServicioService } from "./servicio.service";
import { ContratoEvent } from "src/contratos/interfaces/contrato-evento";

@Injectable()
export class EstacionEventosService {
    constructor(
        private servicioService: ServicioService,
    ){ }

    @OnEvent('contrato.desactivado',{async:true})
    async desactivarServicioTipo(contrato:ContratoEvent){
        
    }

}