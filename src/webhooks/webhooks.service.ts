import { BadRequestException, Injectable } from '@nestjs/common';
import { DocumentCompleted } from './interfaces/document-completed.webhook.notification';
import { DocumentRejected } from './interfaces/document-rejected.webhook.notification';
import { OriginalSigned } from './interfaces/original-signed.webhook.notification';
import { UniversalSigned } from './interfaces/universal_signed.webhook.notification';
import { InjectRepository } from '@nestjs/typeorm';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { Repository } from 'typeorm';
import { ESTATUS_DE_FIRMA } from 'src/firma/firma/interfaces/estatus-de-firma.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { DocumentoEvent } from 'src/ordenes/interfaces/documento-event';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import { CAMPAIGN_STATUS } from 'src/campañas/campañas/interfaces/estatus-campaña.enum';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Firma)
    private readonly signatureRepository: Repository<Firma>,

    private eventEmitter: EventEmitter2,
  ) { }

  recibirWebHook(
    firmamexWebhook: DocumentCompleted | DocumentRejected | OriginalSigned | UniversalSigned | any,) {
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

  private async handleDocumentCompleted(webhook: any) {
    try {
      const { firmamex_id } = webhook;

      const document = await this.signatureRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = document.ordenOFacturaId;

      if (document.tipoDeDocumento === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {
        this.eventEmitter.emit('modify-contract-amounts', { orderId: documentoId, eventType: TYPE_EVENT_ORDER.ORDER_APPROVED });

        this.eventEmitter.emit('modified-order-status', { orderId: documentoId, orderStatus: ESTATUS_ORDEN_DE_SERVICIO.ACTIVA });

      } else if (document.tipoDeDocumento === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
        this.eventEmitter.emit('invoice-approval-or-cancellation', { invoiceId: documentoId, eventType: TYPE_EVENT_INVOICE.INVOICE_APPROVED });

      } else if (document.tipoDeDocumento === TIPO_DE_DOCUMENTO.CAMPAÑA) {
        this.eventEmitter.emit('modified-campaign-status', { campaignId: documentoId, campaignStatus: CAMPAIGN_STATUS.APROBADA });

        this.eventEmitter.emit('approval-campaign-orders', { campaignId: documentoId });
      }

      document.estaFirmado = true;

      document.estatusDeFirma = ESTATUS_DE_FIRMA.APROBADA;

      await this.signatureRepository.save(document);

    } catch (error) {
      handleExceptions(error);
    }
  }

  private async handleOriginalSigned(response: OriginalSigned) {
    try {
      const { firmamex_id } = response;

      const signatureDocument = await this.signatureRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = signatureDocument.ordenOFacturaId;

      if (signatureDocument.tipoDeDocumento === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {

        signatureDocument.estaFirmado = false;

        signatureDocument.estatusDeFirma = ESTATUS_DE_FIRMA.PENDIENTE_DE_FIRMA;

        await this.signatureRepository.save(signatureDocument);

        this.emitter(documentoId, 'cotejada.facura');

      } else if (signatureDocument.tipoDeDocumento === TIPO_DE_DOCUMENTO.CAMPAÑA) {
        
        const values = {
          signedAt: new Date().toISOString(),
          signerRfc: response.signer_data.name,
          signerEmail: response.signer_data.email,
        };

        await this.signatureRepository.update(signatureDocument.id, {
          signedBy: values
        });
      }

    } catch (error) {
      handleExceptions(error);
    }
  }

  private async handleDocumentRejected(webhook: DocumentRejected) {
    try {
      const { firmamex_id } = webhook;
      const documentoDeFirma = await this.signatureRepository.findOneBy({
        ticket: firmamex_id
      });

      const documentoId = documentoDeFirma.ordenOFacturaId;
      const tipoDeDocumento = documentoDeFirma.tipoDeDocumento;

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {

        documentoDeFirma.estaFirmado = true;
        documentoDeFirma.estatusDeFirma = ESTATUS_DE_FIRMA.CANCELADA;

        this.emitter(documentoId, 'cancelacion.orden');
      } else if (tipoDeDocumento === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
        this.emitter(documentoId, 'cancelacion.factura');
      }
      await this.signatureRepository.save(documentoDeFirma);

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
