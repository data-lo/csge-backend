import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ESTATUS_ORDEN_DE_SERVICIO } from "./interfaces/estatus-orden-de-servicio";
import { OrdenService } from './orden.service';

@Injectable()
export class OrderEventsService {
    private readonly logger = new Logger(OrderEventsService.name);

    constructor(
        private readonly orderService: OrdenService,
    ) { }

    @OnEvent('modified-order-status', { async: true })
    async changeOrderStatus(payload: { orderId: string, orderStatus: ESTATUS_ORDEN_DE_SERVICIO.ACTIVA }) {
        this.logger.log(`🔄 Iniciando evento "modified-order-status" para la Orden: ${payload.orderId}`);
        
        try {
            await this.orderService.updateOrderStatus(payload.orderId, payload.orderStatus);
            this.logger.log(`✅ Evento "modified-order-status" completado. Estatus actualizado a ${payload.orderStatus}.`);
        } catch (error) {
            this.logger.error(`❌ Error en el evento "modified-order-status" para la Orden ${payload.orderId}: ${error.message}`, error.stack);
        }
    }
}
