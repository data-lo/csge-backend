import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampañasService } from "./campañas.service";
import { TYPE_EVENT_CAMPAIGN } from "./enums/type-event-campaign";
import { CAMPAIGN_STATUS } from "./interfaces/estatus-campaña.enum";

@Injectable()
export class CampaignEventsService {
    constructor(
        private readonly campaignService: CampañasService
    ) { }

    @OnEvent('modified-campaign-status', { async: true })
    async modifiedCampaignStatus(payload: { campaignId: string, campaignStatus: CAMPAIGN_STATUS }) {
        try {
            console.log(`Iniciando evento "modified-campaign-status" para la la campaña: ${payload.campaignId}`);

            await this.campaignService.updateCampaignStatus(payload.campaignId, payload.campaignStatus);

            console.log(`Evento "modified-campaign-status" completado exitosamente. Estatus de la campaña modificado.`);
        } catch (error) {
            console.error(`Error al procesar el evento "modified-campaign-status" para la campaña: ${payload.campaignId}.`, error);
        }
    }
}