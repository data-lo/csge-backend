import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampañasService } from "./campañas.service";
import { CAMPAIGN_STATUS } from "./interfaces/estatus-campaña.enum";

@Injectable()
export class CampaignEventsService {
    constructor(
        private readonly campaignService: CampañasService
    ) { }

    @OnEvent('campaign.status.update', { async: true })
    async modifiedCampaignStatus(payload: { campaignId: string, campaignStatus: CAMPAIGN_STATUS }) {
        try {
            console.log(`Iniciando evento "campaign.status.update" para la la campaña: ${payload.campaignId}`);

            await this.campaignService.updateCampaignStatus(payload.campaignId, payload.campaignStatus);

            console.log(`Evento "campaign.status.update" completado exitosamente. Estatus de la campaña modificado.`);
        } catch (error) {
            console.error(`Error al procesar el evento "campaign.status.update" para la campaña: ${payload.campaignId}.`, error);
        }
    }
}