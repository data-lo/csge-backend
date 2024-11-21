import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampaniaEvent } from "../campañas/interfaces/campaña-evento";
import { PartidaService } from './partida.service';

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
}