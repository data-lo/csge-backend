import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ServicioService } from "./servicio.service";


@Injectable()
export class StationEventsService {
    constructor(
        private servicioService: ServicioService,
    ){ }

    // @OnEvent('contrato.desactivado',{async:true})
    // async desactivarServicioTipo(contrato:ContratoEvent){
        
    // }

}