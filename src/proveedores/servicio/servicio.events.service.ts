import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ProveedorEvent } from "../proveedor/interfaces/proveedor-evento";
import { ServicioService } from "./servicio.service";

@Injectable()
export class EstacionEventosService {
 constructor(
    private servicioService:ServicioService,
 ){}

 @OnEvent('proveedor.desactivado',{async:true})
 async desactivarServicio(event:ProveedorEvent){
    const estaciones = event.payload.estaciones;
    for(const estacion of estaciones){
        const servicios = estacion.servicios;
        for(const servicio of servicios){
            const servicioId = servicio.id
            await this.servicioService.desactivarServicio(servicioId);
        }
    }    
 }
}