import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PartidaService } from "./partida.service";

import { TYPE_EVENT_ORDER } from "src/contratos/enums/type-event-order";
import { TYPE_EVENT_INVOICE } from "src/ordenes/factura/enums/type-event-invoice";

/**
 * Servicio encargado de manejar eventos relacionados al "match"
 * de montos entre facturas y órdenes.
 */
@Injectable()
export class MatchEventsService {
    private readonly logger = new Logger(MatchEventsService.name);

    constructor(
        private readonly matchService: PartidaService,
    ) { }

    /**
     * Maneja el evento de actualización de montos de "match"
     * para una orden o factura individual.
     * @param payload.orderOrInvoiceId - ID de la orden o factura
     * @param payload.eventType - Tipo de evento (factura u orden)
     * @param payload.isInvoice - True si es factura, false si es orden
     */
    @OnEvent('invoice.order.match.amounts.updated', { async: true })
    async matchAmountsUpdated(
        payload: { orderOrInvoiceId: string; eventType: TYPE_EVENT_INVOICE | TYPE_EVENT_ORDER; isInvoice: boolean }
    ) {
        this.logger.log(
            `🔄 Iniciando evento "invoice.order.match.amounts.updated" para: ${payload.orderOrInvoiceId}`
        );
        try {
            await this.matchService.updateAmounts(
                payload.orderOrInvoiceId,
                payload.eventType,
                payload.isInvoice,
            );
            this.logger.log(`✅ Evento completado exitosamente.`);
        } catch (error) {
            this.logger.error(
                `❌ Error en evento "invoice.order.match.amounts.updated" para ID: ${payload.orderOrInvoiceId}`,
                error.stack,
            );
        }
    }

    /**
     * Maneja el evento de facturas pagadas para procesar
     * múltiples facturas y actualizar sus montos de "match".
     * @param payload.invoiceIds - Arreglo de IDs de facturas pagadas
     */
    @OnEvent('invoice.match.paid', { async: true })
    async invoiceMatchPaid(payload: { invoiceIds: string[] }) {
        this.logger.log(
            `🔄 Iniciando evento "invoice.match.paid" para facturas: ${payload.invoiceIds.join(', ')}`
        );
        try {
            for (const invoiceId of payload.invoiceIds) {
                await this.matchService.updateAmounts(
                    invoiceId,
                    TYPE_EVENT_INVOICE.INVOICE_PAID,
                    true,
                );
            }
            this.logger.log(`✅ Evento "invoice.match.paid" completado exitosamente.`);
        } catch (error) {
            this.logger.error(
                `❌ Error en evento "invoice.match.paid" para facturas: ${payload.invoiceIds.join(', ')}`,
                error.stack,
            );
        }
    }
}
