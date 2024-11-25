import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampaniaEvent } from "../campañas/interfaces/campaña-evento";
import { ActivacionService } from './activacion.service';

@Injectable()
export class ActivacionEventosService {

    constructor(
        private activacionService:ActivacionService
    ){}

    @OnEvent('campania.eliminada',{async:true})
    async eliminarActivacion(event:CampaniaEvent){
        const activacionId = event.payload.activaciones.at(0).id;
        const activacionesLenght = event.payload.activaciones.length
        console.log(activacionId,activacionesLenght);
        await this.activacionService.remove(activacionId);
        return;
    }

}