import { Injectable } from "@nestjs/common";
import { RenovacionService } from "./renovacion.service";
import { OnEvent } from "@nestjs/event-emitter";
import { ServicioEvent } from "../servicio/interfaces/servicio-event";
import { handleExceptions } from "src/helpers/handleExceptions.function";

@Injectable()
export class RenovacionEventosService {
    constructor(
        private renovacionService:RenovacionService
    ){}

    @OnEvent('servicio.desactivado',{async:true})
    async desactivarUltimaRenovacion(servicioEvent:ServicioEvent){
        try{
            await this.renovacionService.desactivarUltimaRenovacion(servicioEvent.servicioId);
            return;
        }
        catch(error){
            handleExceptions(error);
        }
    }

    @OnEvent('servicio.activado',{async:true})
    async activarUltimaRenovacion(servicioEvent:ServicioEvent){
        try{
            await this.renovacionService.activarUltimaRenovacion(servicioEvent.servicioId);
            return;
        }
        catch(error){
            handleExceptions(error);
        }
    }
}