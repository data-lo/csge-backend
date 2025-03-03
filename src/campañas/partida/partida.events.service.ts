import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PartidaService } from './partida.service';
import { OrdenEvent } from "src/ordenes/interfaces/orden-event";
import { handleExceptions } from "src/helpers/handleExceptions.function";

@Injectable()
export class PartidaEventosService {

    constructor(
        private activacionService:PartidaService
    ){}

    @OnEvent('orden.aprobada')
    async ordenAprbada(orden:OrdenEvent){
        try{
            const {ordenId,evento} = orden;
            await this.activacionService.actualizarMontos(ordenId,evento);
        }catch(error){
            handleExceptions(error);
        }
        
    }

}