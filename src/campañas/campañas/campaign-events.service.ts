import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CampañasService } from "./campañas.service";
import { CAMPAIGN_STATUS } from "./interfaces/estatus-campaña.enum";

/**
 * Servicio que maneja eventos relacionados al estado de campañas.
 */
@Injectable()
export class CampaignEventsService {
  private readonly logger = new Logger(CampaignEventsService.name);

  constructor(
    private readonly campaignService: CampañasService,
  ) {}

  /**
   * Listener para el evento 'campaign.status.update'.
   * Actualiza el estado de la campaña correspondiente.
   *
   * @param payload.campaignId - ID de la campaña a actualizar
   * @param payload.campaignStatus - Nuevo estado de la campaña
   */
  @OnEvent('campaign.status.update', { async: true })
  async modifiedCampaignStatus(
    payload: { campaignId: string; campaignStatus: CAMPAIGN_STATUS }
  ) {
    this.logger.log(
      `🔄 Iniciando evento "campaign.status.update" para la campaña: ${payload.campaignId}`
    );
    try {
      await this.campaignService.updateCampaignStatus(
        payload.campaignId,
        payload.campaignStatus,
      );
      
      this.logger.log(
        `✅ Evento "campaign.status.update" completado exitosamente. Estatus de la campaña modificado.`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error al procesar el evento "campaign.status.update" para la campaña: ${payload.campaignId}`,
        error.stack,
      );
    }
  }
}
