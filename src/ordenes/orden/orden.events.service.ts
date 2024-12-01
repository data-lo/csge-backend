import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DocumentoEvent } from "../interfaces/documento-event";
import { EstatusOrdenDeServicio } from "./interfaces/estatus-orden-de-servicio";
import { InjectRepository } from "@nestjs/typeorm";
import { Orden } from "./entities/orden.entity";
import { Repository } from "typeorm";


@Injectable()
export class OrdenEventosService {
    constructor(
        @InjectRepository(Orden)
        private ordenRepository:Repository<Orden>,
    ){}

    @OnEvent('aprobacion.orden',{async:true})
    async ordenAprobada(event: DocumentoEvent) {
        const orden = await this.ordenRepository.findOneBy({ id: event.documentoId });
        if (orden) {
          orden.fechaDeAprobacion = new Date();
          orden.estatus = EstatusOrdenDeServicio.ACTIVA;
          await this.ordenRepository.save(orden);
        }
    }
      
}