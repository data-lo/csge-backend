import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContratosService } from './contratos.service';
import { OrdenService } from 'src/ordenes/orden/orden.service';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import { TIPO_DE_SERVICIO } from '../interfaces/tipo-de-servicio';
import { TYPE_EVENT_ORDER } from '../enums/type-event-order';
import { TYPE_EVENT_CAMPAIGN } from '../enums/type-event-campaign';
import { ContratosModificatoriosService } from '../contratos_modificatorios/contratos_modificatorios.service';


@Injectable()
export class ContractEventsService {
  private readonly logger = new Logger(ContractEventsService.name);

  constructor(
    private readonly orderService: OrdenService,

    private readonly contractService: ContratosService,

    private readonly amendmentService: ContratosModificatoriosService,

  ) { }

  /**
 * Escucha el evento 'order.contract.amounts.updated' para actualizar los montos del contrato maestro
 * en función de la orden de servicio.
 */
  @OnEvent('order.contract.amounts.updated', { async: true })

  async updateContractAmountsFromOrder(payload: { orderId: string; eventType: TYPE_EVENT_ORDER }) {

    this.logger.log(`🔄 Iniciando evento "order.contract.amounts.updated" para la Orden: ${payload.orderId}`);

    try {
      const order = await this.orderService.findOne(payload.orderId);

      if (order.usedAmendmentContracts) {
        for (const item of order.contractBreakdownList) {
          if (item.contractType === 'MASTER_CONTRACT') {
            await this.contractService.updateMasterContractAmountByOrder(
              item.amountToUse,
              order.serviceType as TIPO_DE_SERVICIO,
              item.id,
              payload.eventType,
            );
          } else {
            await this.amendmentService.updateAmendmentContractAmountByOrder(
              item.amountToUse,
              order.serviceType as TIPO_DE_SERVICIO,
              item.id,
              payload.eventType,
            );
          }
        }
      } else {
        await this.contractService.updateMasterContractAmountByOrder(
          order.total,
          order.serviceType as TIPO_DE_SERVICIO,
          order.masterContract.masterContractId,
          payload.eventType
        );
      }

      this.logger.log(`✅ Evento "order.contract.amounts.updated" completado. Montos del contrato actualizados.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "order.contract.amounts.updated" para la Orden ${payload.orderId}: ${error.message}`,
        error.stack
      );
    }
  }


  /**
* Escucha el evento 'campaign.contract.amounts.updated' para actualizar los montos del contrato maestro
* en función de las ordenes de servicio de una campaña.
*/
  @OnEvent('campaign.contract.amounts.updated', { async: true })
  async campaignContractAmountsUpdated(payload: { campaignId: string, eventType: TYPE_EVENT_CAMPAIGN }) {

    this.logger.log(`🔄 Iniciando evento "campaign.contract.amounts.updated" para la Campaña: ${payload.campaignId}`);

    let typeEventOrder: TYPE_EVENT_ORDER;
    let orderStatus: ESTATUS_ORDEN_DE_SERVICIO;

    if (payload.eventType === TYPE_EVENT_CAMPAIGN.CAMPAIGN_APPROVED) {
      typeEventOrder = TYPE_EVENT_ORDER.ORDER_APPROVED;
      orderStatus = ESTATUS_ORDEN_DE_SERVICIO.ACTIVA
    } else {
      typeEventOrder = TYPE_EVENT_ORDER.ORDER_CANCELLED;
      orderStatus = ESTATUS_ORDEN_DE_SERVICIO.CANCELADA
    }

    try {
      const orders = await this.orderService.getOrdersCreatedByCampaignModule(payload.campaignId);

      for (const order of orders) {
        if (order.usedAmendmentContracts) {
          for (const item of order.contractBreakdownList) {
            if (item.contractType === 'MASTER_CONTRACT') {
              await this.contractService.updateMasterContractAmountByOrder(
                item.amountToUse,
                order.serviceType as TIPO_DE_SERVICIO,
                item.id,
                typeEventOrder
              );
            } else {
              await this.amendmentService.updateAmendmentContractAmountByOrder(
                item.amountToUse,
                order.serviceType as TIPO_DE_SERVICIO,
                item.id,
                typeEventOrder
              );
            }
          }
        } else {
          await this.contractService.updateMasterContractAmountByOrder(
            order.total,
            order.serviceType as TIPO_DE_SERVICIO,
            order.masterContract.masterContractId,
            typeEventOrder
          );
        }

        await this.orderService.updateOrderStatus(order.orderId, orderStatus)
      }

      this.logger.log(`✅ Evento "campaign.contract.amounts.updated" completado con éxito.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "campaign.contract.amounts.updated" para la Campaña ${payload.campaignId}: ${error.message}`,
        error.stack
      );
    }
  }

  // @OnEvent('disabled-contracts', { async: true })
  // async disabledContracts(payload: { contractIds: string }) {

  //   this.logger.log(`🔄 Iniciando evento "disabled-contracts" para el Contrato Principal: ${payload.campaignId}`);

  //   try {

  //     const orders = await this.orderService.getOrdersCreatedByCampaignModule(payload.campaignId);

  //     for (const order of orders) {
  //       await this.contractService.updateContractAmountByOrder(
  //         order.id,
  //         order.contratoMaestro.id,
  //         TYPE_EVENT_ORDER.ORDER_APPROVED
  //       );

  //       await this.orderService.updateOrderStatus(order.id, ESTATUS_ORDEN_DE_SERVICIO.ACTIVA)
  //     }

  //     this.logger.log(`✅ Evento "approval-campaign-orders" completado con éxito.`);
  //   } catch (error) {
  //     this.logger.error(
  //       `❌ Error en el evento "approval-campaign-orders" para la Campaña ${payload.campaignId}: ${error.message}`,
  //       error.stack
  //     );
  //   }

}
