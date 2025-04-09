import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContratosService } from './contratos.service';
import { OrdenService } from 'src/ordenes/orden/orden.service';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';


@Injectable()
export class ContractEventsService {
  private readonly logger = new Logger(ContractEventsService.name);

  constructor(
    private readonly orderService: OrdenService,

    private readonly contractService: ContratosService,

  ) { }

  /**
 * Escucha el evento 'update-contract-amounts-from-order' para actualizar los montos del contrato maestro
 * en función de los cambios realizados a través de una orden de servicio.
 */
  @OnEvent('update-contract-amounts-from-order', { async: true })
  async updateContractAmountsFromOrder(payload: { orderId: string; eventType: TYPE_EVENT_ORDER }) {
    this.logger.log(`🔄 Iniciando evento "update-contract-amounts-from-order" para la Orden: ${payload.orderId}`);

    try {
      const order = await this.orderService.findOne(payload.orderId);

      await this.contractService.updateContractAmountByOrder(
        payload.orderId,
        order.masterContract.masterContractId,
        payload.eventType
      );

      this.logger.log(`✅ Evento "update-contract-amounts-from-order" completado. Montos del contrato actualizados.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "update-contract-amounts-from-order" para la Orden ${payload.orderId}: ${error.message}`,
        error.stack
      );
    }
  }


  /**
   * Escucha el evento 'update-contract-amounts-from-campaign-orders' para actualizar
   * los montos de los contratos maestro en función de las órdenes generadas por una campaña.
   */
  @OnEvent('update-contract-amounts-from-campaign-orders', { async: true })
  async updateContractAmountsFromCampaignOrders(payload: { campaignId: string }) {
    this.logger.log(`🔄 Iniciando evento "update-contract-amounts-from-campaign-orders" para la Campaña: ${payload.campaignId}`);

    try {
      const orders = await this.orderService.getOrdersCreatedByCampaignModule(payload.campaignId);

      for (const order of orders) {
        await this.contractService.updateContractAmountByOrder(
          order.id,
          order.contratoMaestro.id,
          TYPE_EVENT_ORDER.ORDER_APPROVED
        );

        await this.orderService.updateOrderStatus(order.id, ESTATUS_ORDEN_DE_SERVICIO.ACTIVA);
      }

      this.logger.log(`✅ Evento "update-contract-amounts-from-campaign-orders" completado con éxito.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "update-contract-amounts-from-campaign-orders" para la Campaña ${payload.campaignId}: ${error.message}`,
        error.stack
      );
    }
  }


  @OnEvent('approval-campaign-orders', { async: true })
  async approveDiscountsForMultipleContracts(payload: { campaignId: string }) {
    this.logger.log(`🔄 Iniciando evento "approval-campaign-orders" para la Campaña: ${payload.campaignId}`);

    try {

      const orders = await this.orderService.getOrdersCreatedByCampaignModule(payload.campaignId);

      for (const order of orders) {
        await this.contractService.updateContractAmountByOrder(
          order.id,
          order.contratoMaestro.id,
          TYPE_EVENT_ORDER.ORDER_APPROVED
        );

        await this.orderService.updateOrderStatus(order.id, ESTATUS_ORDEN_DE_SERVICIO.ACTIVA)
      }

      this.logger.log(`✅ Evento "approval-campaign-orders" completado con éxito.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "approval-campaign-orders" para la Campaña ${payload.campaignId}: ${error.message}`,
        error.stack
      );
    }
  }



  @OnEvent('cancelled-campaign-orders', { async: true })
  async cancelDiscountsForMultipleContracts(payload: { campaignId: string }) {
    this.logger.log(`🔄 Iniciando evento "cancelled-campaign-orders" para la Campaña: ${payload.campaignId}`);

    try {

      const orders = await this.orderService.getOrdersCreatedByCampaignModule(payload.campaignId);

      for (const order of orders) {
        await this.contractService.updateContractAmountByOrder(
          order.id,
          order.contratoMaestro.id,
          TYPE_EVENT_ORDER.ORDER_CANCELLED
        );

        await this.orderService.updateOrderStatus(order.id, ESTATUS_ORDEN_DE_SERVICIO.CANCELADA)
      }

      this.logger.log(`✅ Evento "cancelled-campaign-orders" completado con éxito.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "cancelled-campaign-orders" para la Campaña ${payload.campaignId}: ${error.message}`,
        error.stack
      );
    }
  }


}
