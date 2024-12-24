import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { DocumentoEvent } from "../interfaces/documento-event";
import { EstatusOrdenDeServicio } from "./interfaces/estatus-orden-de-servicio";
import { InjectRepository } from "@nestjs/typeorm";
import { Orden } from "./entities/orden.entity";
import { Repository } from "typeorm";
import { OrdenEvent } from "../interfaces/orden-event";


@Injectable()
export class OrdenEventosService {
    constructor(
        @InjectRepository(Orden)
        private ordenRepository:Repository<Orden>,
        private eventEmitter:EventEmitter2
    ){}


    // emitir los evenetos orden.pagada, orden.cancelada y orden.facturada
    // para la actualizacion de los montos del contrato

    @OnEvent('aprobacion.orden',{async:true})
    async ordenAprobada(event: DocumentoEvent) {
        
    }

    private emitter(evento:string,orden:Orden){
        this.eventEmitter.emit(
            `orden.${evento}`,
            new OrdenEvent(orden)
        )
    }
}