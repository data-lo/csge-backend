import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PartidaService } from './partida.service';
import { OrdenEvent } from "src/ordenes/interfaces/orden-event";
import { handleExeptions } from "src/helpers/handleExceptions.function";

@Injectable()
export class PartidaEventosService {

    constructor(
        private activacionService:PartidaService
    ){}

    @OnEvent('orden.aprobada')
    async ordenAprbada(orden:OrdenEvent){
        try{
            const {campaña,total} = orden.orden;
            console.log('en partida events, campania ', campaña, 'total ', total);
            try{
                await this.activacionService.actualizarMontos(campaña.id,total,'orden.aprobada');
            }
            catch(error){
                return;
            }
            
        }catch(error){
            handleExeptions(error);
        }
        
    }

}