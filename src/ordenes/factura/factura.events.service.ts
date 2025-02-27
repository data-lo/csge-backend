import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FacturaService } from "./factura.service";
import { ContratosService } from "src/contratos/contratos/contratos.service";
import { OrdenService } from "../orden/orden.service";

@Injectable()
export class FacturaEventosService {
    constructor(
        private readonly invoiceService: FacturaService,
        private readonly orderService: OrdenService,
        private readonly contractService: ContratosService
    ) { }

    @OnEvent('invoice-approval-or-cancellation', { async: true })
    async applyDiscountsToContract(payload: { invoiceId: string, eventType: TYPE_EVENT_INVOICE }) {
        try {
            console.log(`Iniciando evento "${payload.eventType}" para la factura: ${payload.invoiceId}`);

            const invoice = await this.invoiceService.findOne(payload.invoiceId);

            for (const orderFromInvoice of invoice.ordenesDeServicio) {

                const order = await this.orderService.findOne(orderFromInvoice.id);

                await this.contractService.updateContractAmountByOrder(
                    order.id,
                    order.contratoMaestro.id,
                    payload.eventType
                );
            }
            console.log(`Evento "${payload.eventType}" completado exitosamente. Montos del contrato actualizados.`);

        } catch (error) {
            console.error(`Error al procesar el evento "${payload.eventType}" para la factura: ${payload.invoiceId}.`, error);
        }
    }
}