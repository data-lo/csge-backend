import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampaniaEvent } from "../campañas/interfaces/campaña-evento";
import { PartidaService } from './partida.service';
import { OrdenEvent } from "src/ordenes/interfaces/orden-event";

@Injectable()
export class PartidaEventosService {

    constructor(
        private activacionService:PartidaService
    ){}

    @OnEvent('campania.eliminada',{async:true})
    async eliminarActivacion(event:CampaniaEvent){
        const partidaId = event.payload.activaciones.at(0).partida.id;
        await this.activacionService.delete(partidaId);
        return;
    }

    @OnEvent('orden.aprobada')
    async ordenAprbada(orden:OrdenEvent){
        const {campaña,total} = orden.orden;
        await this.activacionService.actualizarMontos(campaña.id,total,'orden.aprobada');
    }

}