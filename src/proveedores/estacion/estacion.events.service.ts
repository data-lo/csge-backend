import { Injectable } from "@nestjs/common";
import { EstacionService } from './estacion.service';
import { OnEvent } from "@nestjs/event-emitter";
import { ProveedorEvent } from "../proveedor/interfaces/proveedor-evento";


@Injectable()
export class EstacionEventosService {
    
    constructor(
        private estacionService:EstacionService,
    ){}
    @OnEvent('proveedor.desactivado',{async:true})
    async desactivarEstacion(event:ProveedorEvent){
        const estaciones = event.payload.estaciones;
        for(const estacion of estaciones){
            await this.estacionService.desactivarEstacion(estacion.id);
        }
        return;
    }
}