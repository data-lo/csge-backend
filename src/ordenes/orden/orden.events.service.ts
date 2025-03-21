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


    @OnEvent('update-order-status', { async: true })
    async updateOrderStatusFromEvent(payload: { orderId: string; orderStatus: ESTATUS_ORDEN_DE_SERVICIO }) {
        this.logger.log(`🔄 Iniciando evento "update-order-status" para la Orden: ${payload.orderId}`);

        try {
            await this.orderService.updateOrderStatus(payload.orderId, payload.orderStatus);
            this.logger.log(`✅ Evento "update-order-status" completado. Estatus actualizado a ${payload.orderStatus}.`);
        } catch (error) {
            this.logger.error(
                `❌ Error en el evento "update-order-status" para la Orden ${payload.orderId}: ${error.message}`,
                error.stack
            );
        }
    }

    @OnEvent('remove-orders', { async: true })
    async removeOrders(payload: { orderIds: string[] }) {
        this.logger.log(`🔄 Iniciando evento "eliminate-orders" para las órdenes: ${payload.orderIds.join(', ')}`);

        try {
            for (const orderId of payload.orderIds) {
                await this.orderService.remove(orderId);
            }

            this.logger.log(`✅ Evento "eliminate-orders" completado. Órdenes eliminadas correctamente.`);
        } catch (error) {
            this.logger.error(
                `❌ Error en el evento "eliminate-orders" para las órdenes ${payload.orderIds.join(', ')}: ${error.message}`,
                error.stack
            );
        }
    }
}
