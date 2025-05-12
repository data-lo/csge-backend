import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { FacturaService } from "./factura.service";
import { ContratosService } from "src/contratos/contratos/contratos.service";
import { OrdenService } from "../orden/orden.service";
import { INVOICE_STATUS } from "./interfaces/estatus-factura";
import { ESTATUS_ORDEN_DE_SERVICIO } from "../orden/interfaces/estatus-orden-de-servicio";
import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";
import { ContratosModificatoriosService } from "src/contratos/contratos_modificatorios/contratos_modificatorios.service";
import { TYPE_EVENT_INVOICE } from "./enums/type-event-invoice";

/**
 * Servicio encargado de manejar y procesar eventos relacionados a facturas.
 * Escucha diferentes eventos y ejecuta la lógica de actualización de contratos,
 * órdenes y estado de facturas.
 */
@Injectable()
export class FacturaEventosService {
  /** Logger del servicio para registrar información de ejecución y errores */
  private readonly logger = new Logger(FacturaEventosService.name);

  /**
   * Inyección de dependencias: FacturaService, OrdenService, ContratosService y ContratosModificatoriosService
   * @param invoiceService - Servicio para operaciones de facturas
   * @param orderService - Servicio para operaciones de órdenes
   * @param contractService - Servicio para actualización de contratos maestros
   * @param amendmentService - Servicio para actualización de contratos modificatorios
   */
  constructor(
    private readonly invoiceService: FacturaService,
    private readonly orderService: OrdenService,
    private readonly contractService: ContratosService,
    private readonly amendmentService: ContratosModificatoriosService,
  ) {}

  /**
   * Maneja el evento 'invoice.contract.amounts.updated'.
   * Actualiza los montos de los contratos (maestro o modificatorio) asociados a cada orden
   * de la factura especificada, según el tipo de evento (revisado, cancelado, pagado).
   *
   * @OnEvent decorador para suscribirse a eventos emitidos con este nombre
   * @param payload.invoiceId - ID de la factura afectada
   * @param payload.eventType - Tipo de evento que desencadena la actualización de montos
   */
  @OnEvent('invoice.reviewed.cancelled', { async: true })
  async invoiceContractAmountsUpdated(payload: { invoiceId: string; eventType: TYPE_EVENT_INVOICE }) {
    try {
      this.logger.log(`🔄 Iniciando evento "invoice.contract.amounts.updated" para la factura: ${payload.invoiceId}`);

      // Obtener entidad factura con sus órdenes relacionadas
      const invoice = await this.invoiceService.findOne(payload.invoiceId);

      // Recorrer todas las órdenes vinculadas a la factura
      for (const orderFromInvoice of invoice.orders) {
        const order = await this.orderService.findOne(orderFromInvoice.id);

        // Determinar nuevo estado de la orden según el tipo de evento
        let orderStatus: ESTATUS_ORDEN_DE_SERVICIO;
        switch (payload.eventType) {
          case TYPE_EVENT_INVOICE.INVOICE_REVIEWED:
            orderStatus = ESTATUS_ORDEN_DE_SERVICIO.COTEJADA;
            break;
          case TYPE_EVENT_INVOICE.INVOICE_CANCELLED:
            orderStatus = ESTATUS_ORDEN_DE_SERVICIO.CANCELADA;
            break;
        }

        // Si se usan contratos modificatorios, se actualiza cada ítem individualmente
        if (orderFromInvoice.usedAmendmentContracts) {
          for (const item of order.contractBreakdownList) {
            if (item.contractType === 'MASTER_CONTRACT') {
              await this.contractService.updateMasterContractAmountByOrder(
                item.amountToUse,
                order.serviceType as TIPO_DE_SERVICIO,
                item.id,
                payload.eventType,
              );
            } else {
              await this.amendmentService.updateAmendmentContractAmountByOrder(
                item.amountToUse,
                order.serviceType as TIPO_DE_SERVICIO,
                item.id,
                payload.eventType,
              );
            }
          }
        } else {
          // Si no, sólo actualizar contrato maestro con el total de la orden
          await this.contractService.updateMasterContractAmountByOrder(
            order.total,
            order.serviceType as TIPO_DE_SERVICIO,
            order.masterContract.masterContractId,
            payload.eventType,
          );
        }

        // Actualizar estado de la orden en base al evento
        await this.orderService.updateOrderStatus(order.orderId, orderStatus);
      }

      this.logger.log(`✅ Evento "invoice.contract.amounts.updated" completado exitosamente para la factura: ${payload.invoiceId}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al procesar evento "invoice.contract.amounts.updated" para factura ${payload.invoiceId}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento 'invoice.paid'.
   * Procesa múltiples facturas pagadas, actualizando montos de contrato y estado
   * de órdenes, y finalmente el estado de la factura.
   *
   * @param payload.invoiceIds - Arreglo de IDs de facturas que fueron pagadas
   */
  @OnEvent('invoice.paid', { async: true })
  async invoicesPaidUpdated(payload: { invoiceIds: string[] }) {
    this.logger.log(`🔄 Iniciando evento "invoice.paid" para facturas: ${payload.invoiceIds.join(', ')}`);
    try {
      // Recorrer cada factura y sus órdenes relacionadas
      for (const invoiceId of payload.invoiceIds) {
        const orders = await this.invoiceService.getOrdersRelatedToInvoice(invoiceId);

        for (const order of orders) {
          if (order.usedAmendmentContracts) {
            // Actualizar por ítem si usa contratos modificatorios
            for (const item of order.contractBreakdownList) {
              if (item.contractType === 'MASTER_CONTRACT') {
                await this.contractService.updateMasterContractAmountByOrder(
                  item.amountToUse,
                  order.serviceType as TIPO_DE_SERVICIO,
                  item.id,
                  TYPE_EVENT_INVOICE.INVOICE_PAID,
                );
              } else {
                await this.amendmentService.updateAmendmentContractAmountByOrder(
                  item.amountToUse,
                  order.serviceType as TIPO_DE_SERVICIO,
                  item.id,
                  TYPE_EVENT_INVOICE.INVOICE_PAID,
                );
              }
            }
          } else {
            // Contrato maestro completo si no hay breakdown
            await this.contractService.updateMasterContractAmountByOrder(
              order.totalOrder,
              order.serviceType as TIPO_DE_SERVICIO,
              order.masterContractId,
              TYPE_EVENT_INVOICE.INVOICE_PAID,
            );
          }

          // Marcar orden como pagada
          await this.orderService.updateOrderStatus(order.orderId, ESTATUS_ORDEN_DE_SERVICIO.PAGADA);
        }

        // Actualizar estado de la factura a PAGADA
        await this.invoiceService.updateStatus(invoiceId, INVOICE_STATUS.PAGADA);
      }

      this.logger.log(`✅ Evento "invoice.paid" completado con éxito para facturas: ${payload.invoiceIds.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `❌ Error en el evento "invoice.paid" para facturas: ${payload.invoiceIds.join(', ')}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento 'invoice.status.update'.
   * Actualiza el estatus de una única factura.
   *
   * @param payload.invoiceId - ID de la factura a actualizar
   * @param payload.status - Nuevo estado de la factura
   */
  @OnEvent('invoice.status.update', { async: true })
  async handleInvoiceStatusModified(payload: { invoiceId: string; status: INVOICE_STATUS }) {
    try {
      this.logger.log(`🔄 Iniciando evento "invoice.status.update" para factura: ${payload.invoiceId}`);

      // Actualiza el estado de la factura en la base de datos
      await this.invoiceService.updateStatus(payload.invoiceId, payload.status);

      this.logger.log(`✅ Evento "invoice.status.update" completado para factura: ${payload.invoiceId}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al procesar evento "invoice.status.update" para factura: ${payload.invoiceId}`,
        error.stack,
      );
    }
  }
}
