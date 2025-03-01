import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContratosService } from './contratos.service';
import { OrdenService } from 'src/ordenes/orden/orden.service';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';

@Injectable()
export class ContratosEventosService {
  constructor(
    private readonly orderService: OrdenService,

    private readonly contractService: ContratosService
  ) { }

  // 1.- Evento que se ejecuta al aprobar o cancelar una orden, 
  // modificando los montos de los contratos correspondientes.

  @OnEvent('modify-contract-amounts', { async: true })
  async applyDiscountsToContract(payload: { orderId: string, eventType: TYPE_EVENT_ORDER }) {
    try {
      console.log(`Iniciando evento "modify-contract-amounts" para la Orden: ${payload.orderId}`);

      const order = await this.orderService.findOne(payload.orderId);

      await this.contractService.updateContractAmountByOrder(
        payload.orderId,
        order.contratoMaestro.id,
        payload.eventType
      );

      console.log(`Evento "modify-contract-amounts" completado exitosamente. Montos del contrato actualizados.`);

    } catch (error) {
      console.error(`Error al procesar el evento "modify-contract-amounts" para la Orden: ${payload.orderId}.`, error);
    }
  }

  @OnEvent('approval-campaign-orders', { async: true })
  async applyDiscountsToMultiplyContracts(payload: { orderId: string }) {

  }

}
