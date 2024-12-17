import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DocumentoEvent } from "../interfaces/documento-event";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Factura } from './entities/factura.entity';
import { EstatusFactura } from "./interfaces/estatus-factura";


@Injectable()
export class FacturaEventosService {
    constructor(
        @InjectRepository(Factura)
        private facturaRepository:Repository<Factura>,
    ){}

    @OnEvent('aprobacion.factura',{async:true})
    async facturaCotejada(event: DocumentoEvent) {
        const factura = await this.facturaRepository.findOneBy({ id: event.documentoId });
        if (factura) {
            factura.estatus = EstatusFactura.APROBADA;
            await this.facturaRepository.save(factura);
        }
    }

    async emitter(){

    }
      
}