import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContratosService } from './contratos.service';
import { OrdenService } from 'src/ordenes/orden/orden.service';

@Injectable()
export class ContratosEventosService {
  private readonly logger = new Logger(ContratosEventosService.name);

  constructor(
    private readonly orderService: OrdenService,
    private readonly contractService: ContratosService
  ) {}

  // 📌 Evento que se ejecuta al aprobar o cancelar una orden,
  // modificando los montos de los contratos correspondientes.
  @OnEvent('modify-contract-amounts', { async: true })
  async applyDiscountsToContract(payload: { orderId: string; eventType: TYPE_EVENT_ORDER }) {
    this.logger.log(`🔄 Iniciando evento "modify-contract-amounts" para la Orden: ${payload.orderId}`);

    try {
      const order = await this.orderService.findOne(payload.orderId);
      await this.contractService.updateContractAmountByOrder(
        payload.orderId,
        order.contratoMaestro.id,
        payload.eventType
      );

      this.logger.log(`✅ Evento "modify-contract-amounts" completado. Montos del contrato actualizados.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "modify-contract-amounts" para la Orden ${payload.orderId}: ${error.message}`,
        error.stack
      );
    }
  }

  @OnEvent('approval-campaign-orders', { async: true })
  async applyDiscountsToMultiplyContracts(payload: { orderId: string }) {
    this.logger.log(`🔄 Iniciando evento "approval-campaign-orders" para la Orden: ${payload.orderId}`);

    try {
      // Implementar la lógica necesaria aquí

      this.logger.log(`✅ Evento "approval-campaign-orders" completado con éxito.`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "approval-campaign-orders" para la Orden ${payload.orderId}: ${error.message}`,
        error.stack
      );
    }
  }
}
