import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FacturaService } from "./factura.service";
import { ContratosService } from "src/contratos/contratos/contratos.service";
import { OrdenService } from "../orden/orden.service";
import { INVOICE_STATUS } from "./interfaces/estatus-factura";
import { ESTATUS_ORDEN_DE_SERVICIO } from "../orden/interfaces/estatus-orden-de-servicio";

@Injectable()
export class FacturaEventosService {

    private readonly logger = new Logger(FacturaEventosService.name);

    constructor(
        private readonly invoiceService: FacturaService,

        private readonly orderService: OrdenService,

        private readonly contractService: ContratosService
    ) { }

    @OnEvent('invoice-update-contract-amounts-from-order', { async: true })
    async applyDiscountsToContract(payload: { invoiceId: string, eventType: TYPE_EVENT_INVOICE }) {
        try {
            console.log(`Iniciando evento "invoice-update-contract-amounts-from-order" para la factura: ${payload.invoiceId}`);

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
            console.log(`Evento "invoice-update-contract-amounts-from-order" completado exitosamente. Montos del contrato actualizados.`);
        } catch (error) {
            console.error(`Error al procesar el evento "${payload.eventType}" para la factura: ${payload.invoiceId}.`, error);
        }
    }


    @OnEvent('process-invoice-payment-orders', { async: true })
    async processPaymentsForContractsAndOrders(payload: { invoiceIds: string[] }) {

        this.logger.log(`🔄 Iniciando evento "process-invoice-payment-orders" para múltiples facturas`);
        console.log(payload.invoiceIds)
        try {

            for (const invoiceId of payload.invoiceIds) {

                const orders = await this.invoiceService.getOrdersRelatedToInvoice(invoiceId);

                for (const order of orders) {
                    await this.contractService.updateContractAmountByOrder(
                        order.orderId,
                        order.masterContractId,
                        TYPE_EVENT_INVOICE.INVOICE_PAID
                    );

                    await this.orderService.updateOrderStatus(order.orderId, ESTATUS_ORDEN_DE_SERVICIO.PAGADA);
                }
                await this.invoiceService.updateStatus(invoiceId, INVOICE_STATUS.PAGADA);
            }

            this.logger.log(`✅ Evento "process-invoice-payment-orders" completado con éxito.`);
        } catch (error) {
            this.logger.error(
                `❌ Error en el evento "process-invoice-payment-orders" para múltiples facturas`,
                error.stack
            );
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