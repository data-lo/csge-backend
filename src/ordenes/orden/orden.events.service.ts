import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { DocumentoEvent } from "../interfaces/documento-event";
import { EstatusOrdenDeServicio } from "./interfaces/estatus-orden-de-servicio";
import { InjectRepository } from "@nestjs/typeorm";
import { Orden } from "./entities/orden.entity";
import { Repository } from "typeorm";
import { OrdenEvent } from "../interfaces/orden-event";
import { OrdenService } from './orden.service';
import { handleExeptions } from "src/helpers/handleExceptions.function";


@Injectable()
export class OrdenEventosService {
    constructor(
        @InjectRepository(Orden)
        private ordenService:OrdenService,
        private eventEmitter:EventEmitter2
    ){}


    // emitir los evenetos orden.pagada, orden.cancelada y orden.facturada
    // para la actualizacion de los montos del contrato

    @OnEvent('aprobacion.orden',{async:true})
    async ordenAprobada(event: DocumentoEvent){
        try{
            const {documentoId} = event;
            const APROBADA = EstatusOrdenDeServicio.ACTIVA;
            await this.ordenService.actualizarEstatusOrden(documentoId,APROBADA);
            this.emitter('aprobada', documentoId);
        }catch(error){
            handleExeptions(error);
        }
    }

    private emitter(evento:string,ordenId:string){
        const EVENTO = `orden.${evento}`;
        this.eventEmitter.emit(
            EVENTO,
            new OrdenEvent(ordenId,EVENTO)
        );
    
    }
}