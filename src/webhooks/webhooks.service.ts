import { BadRequestException, Injectable } from '@nestjs/common';
import { DocumentCompleted } from './interfaces/document-completed.webhook.notification';
import { DocumentRejected } from './interfaces/document-rejected.webhook.notification';
import { OriginalSigned } from './interfaces/original-signed.webhook.notification';
import { UniversalSigned } from './interfaces/universal_signed.webhook.notification';
import { InjectRepository } from '@nestjs/typeorm';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { Repository } from 'typeorm';
import { EstatusDeFirma } from 'src/firma/firma/interfaces/estatus-de-firma.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { DocumentoEvent } from 'src/ordenes/interfaces/documento-event';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Firma)
    private readonly firmaRepository: Repository<Firma>,

    private eventEmitter: EventEmitter2,
  ) { }

  recibirWebHook(
    firmamexWebhook:
      | DocumentCompleted
      | DocumentRejected
      | OriginalSigned
      | UniversalSigned
      | any,
  ) {
    switch (firmamexWebhook.notification_type) {
      case 'document_completed':
        this.handleDocumentCompleted(firmamexWebhook);
        break;
      case 'document_rejected':
        this.handleDocumentRejected(firmamexWebhook);
        break;
      case 'original_signed':
        this.handleOriginalSigned(firmamexWebhook);
        break;
      case 'universal_signed':
        this.handleUniversalSigned(firmamexWebhook);
        break;
      default:
        //console.log('Unhandled notification type:', firmamexWebhook);  
        return;

    }
  }

  private async handleDocumentCompleted(webhook: DocumentCompleted) {
    try {
      const { firmamex_id } = webhook;

      const document = await this.firmaRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = document.ordenOFacturaId;

      if (document.tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        this.eventEmitter.emit('modify-contract-amounts', { orderId: documentoId, eventType: TYPE_EVENT_ORDER.ORDER_APPROVED });

        this.eventEmitter.emit('modified-order-status', { orderId: documentoId, orderStatus: ESTATUS_ORDEN_DE_SERVICIO.ACTIVA });

      } else if (document.tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        this.eventEmitter.emit('invoice-approval-or-cancellation', { invoiceId: documentoId, eventType: TYPE_EVENT_INVOICE.INVOICE_APPROVED });
      }

      document.estaFirmado = true;

      document.estatusDeFirma = EstatusDeFirma.APROBADA;

      await this.firmaRepository.save(document);

    } catch (error) {
      handleExceptions(error);
    }
  }

  private async handleOriginalSigned(webhook: OriginalSigned) {
    try {
      const { firmamex_id } = webhook;
      const documentoDeFirma = await this.firmaRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = documentoDeFirma.ordenOFacturaId;

      if (documentoDeFirma.tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        documentoDeFirma.estaFirmado = false;
        documentoDeFirma.estatusDeFirma = EstatusDeFirma.PENDIENTE_DE_FIRMA;
        await this.firmaRepository.save(documentoDeFirma);
        this.emitter(documentoId, 'cotejada.facura');
      }
    } catch (error) {
      //eliminar documento de firmamex
      handleExceptions(error);
    }
  }

  private async handleDocumentRejected(webhook: DocumentRejected) {
    try {
      const { firmamex_id } = webhook;
      const documentoDeFirma = await this.firmaRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = documentoDeFirma.ordenOFacturaId;
      const tipoDeDocumento = documentoDeFirma.tipoDeDocumento;

      if (tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        
        documentoDeFirma.estaFirmado = true;
        documentoDeFirma.estatusDeFirma = EstatusDeFirma.CANCELADA;

        this.emitter(documentoId, 'cancelacion.orden');
      } else if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        this.emitter(documentoId, 'cancelacion.factura');
      }
      await this.firmaRepository.save(documentoDeFirma);

    } catch (error) {
      handleExceptions(error);
    }
  }

  private handleUniversalSigned(webhook: UniversalSigned) {
    // Tu lógica aquí
  }

  private emitter(documentoId: string, evento: string) {
    this.eventEmitter.emit(
      `${evento}`,
      new DocumentoEvent(documentoId)
    )
  }
}
