import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FacturaService } from "./factura.service";
import { ContratosService } from "src/contratos/contratos/contratos.service";
import { OrdenService } from "../orden/orden.service";
import { INVOICE_STATUS } from "./interfaces/estatus-factura";
import { ESTATUS_ORDEN_DE_SERVICIO } from "../orden/interfaces/estatus-orden-de-servicio";

@Injectable()
export class FacturaEventosService {
    constructor(
        private readonly invoiceService: FacturaService,
        private readonly orderService: OrdenService,
        private readonly contractService: ContratosService
    ) { }

    @OnEvent('invoice-modify-contract-amounts', { async: true })
    async applyDiscountsToContract(payload: { invoiceId: string, eventType: TYPE_EVENT_INVOICE }) {
        try {
            console.log(`Iniciando evento "invoice-modify-contract-amounts" para la factura: ${payload.invoiceId}`);
            
            const invoice = await this.invoiceService.findOne(payload.invoiceId);

            for (const orderFromInvoice of invoice.ordenesDeServicio) {
                const order = await this.orderService.findOne(orderFromInvoice.id);

                let orderStatus: ESTATUS_ORDEN_DE_SERVICIO;

                if (payload.eventType === TYPE_EVENT_INVOICE.INVOICE_REVIEWED) {
                    orderStatus = ESTATUS_ORDEN_DE_SERVICIO.COTEJADA
                } else if (payload.eventType === TYPE_EVENT_INVOICE.INVOICE_CANCELLED) {
                    orderStatus = ESTATUS_ORDEN_DE_SERVICIO.CANCELADA
                }

                await this.orderService.updateOrderStatus(order.id, orderStatus);

                await this.contractService.updateContractAmountByOrder(
                    order.id,
                    order.contratoMaestro.id,
                    payload.eventType
                );
            }
            console.log(`Evento "invoice-modify-contract-amounts" completado exitosamente. Montos del contrato actualizados.`);
        } catch (error) {
            console.error(`Error al procesar el evento "${payload.eventType}" para la factura: ${payload.invoiceId}.`, error);
        }
    }

    @OnEvent('invoice-status-modified', { async: true })
    async handleInvoiceStatusModified(payload: { invoiceId: string, status: INVOICE_STATUS }) {
        try {
            console.log(`Iniciando evento "invoice-status-modified" para la factura: ${payload.invoiceId}`);

            await this.invoiceService.updateStatus(payload.invoiceId, payload.status)

            console.log(`Evento "invoice-status-modified" completado exitosamente. Montos del contrato actualizados.`);
        } catch (error) {
            console.error(`Error al procesar el evento "invoice-status-modified" para la factura: ${payload.invoiceId}.`, error);
        }
    }
}