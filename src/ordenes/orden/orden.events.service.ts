import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { DocumentoEvent } from "../interfaces/documento-event";
import { ESTATUS_ORDEN_DE_SERVICIO } from "./interfaces/estatus-orden-de-servicio";
import { OrdenEvent } from "../interfaces/orden-event";
import { OrdenService } from './orden.service';
import { handleExeptions } from "src/helpers/handleExceptions.function";


@Injectable()
export class OrdenEventosService {
    constructor(
        private readonly orderService: OrdenService,
        private eventEmitter: EventEmitter2
    ) { }

    // 1. Este evento modifica el estado de la 
    // orden cuando es aprobada, pagada, facturada o cancelada.

    @OnEvent('modified-order-status', { async: true })
    async changeOrderStatus(payload: { orderId: string, orderStatus: ESTATUS_ORDEN_DE_SERVICIO.ACTIVA }) {
        try {
            console.log(`Iniciando evento "modified-order-status" para la Orden: ${payload.orderId}`);

            await this.orderService.updateOrderStatus(payload.orderId, payload.orderStatus);

            console.log(`Evento "modified-order-status" completado exitosamente. Estatus de la orden actualizado.`);
        } catch (error) {
            console.error(`Error al procesar el evento "modified-order-status" para la Orden: ${payload.orderId}.`, error);
        }
    }
}