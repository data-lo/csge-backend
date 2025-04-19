import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PartidaService } from './partida.service';

import { handleExceptions } from "src/helpers/handleExceptions.function";

@Injectable()
export class MatchEventsService {

    constructor(
        private matchService: PartidaService
    ){}

  @OnEvent('match.amounts.updated', { async: true })
    async matchContractAmountsUpdated(payload: { orderId: string, amounts: { activeAmount: string, executedAmount: string, paidAmount: string, } }) {
        try {
            console.log(`Iniciando evento "match.amounts.updated" para la partida: ${payload.campaignId}`);

            // await this.campaignService.updateCampaignStatus(payload.campaignId, payload.campaignStatus);

            console.log(`Evento "campaign.status.update" completado exitosamente. Estatus de la campaña modificado.`);
        } catch (error) {
            console.error(`Error al procesar el evento "campaign.status.update" para la campaña: ${payload.campaignId}.`, error);
        }
    }
}