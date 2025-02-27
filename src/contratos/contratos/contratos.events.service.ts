import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContratosService } from './contratos.service';
import { OrdenService } from 'src/ordenes/orden/orden.service';

@Injectable()
export class ContratosEventosService {
  constructor(
    private readonly orderService: OrdenService,

    private readonly contractService: ContratosService
  ) { }

  @OnEvent('order-approval-or-cancellation', { async: true })
  async applyDiscountsToContract(payload: { orderId: string, eventType: TYPE_EVENT_ORDER }) {
    try {
      console.log(`Iniciando evento "${payload.eventType}" para la Orden: ${payload.orderId}`);

      const order = await this.orderService.findOne(payload.orderId);

      await this.contractService.updateContractAmountByOrder(
        payload.orderId,
        order.contratoMaestro.id,
        payload.eventType
      );

      console.log(`Evento "${payload.eventType}" completado exitosamente. Montos del contrato actualizados.`);

    } catch (error) {
      console.error(`Error al procesar el evento "${payload.eventType}" para la Orden: ${payload.orderId}.`, error);
    }
  }

  @OnEvent('approval-campaign-orders', { async: true })
  async applyDiscountsToMultiplyContracts(payload: { orderId: string }) {

  }

}
