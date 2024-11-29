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
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { DocumentoEvent } from 'src/ordenes/interfaces/documento-event';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Firma)
    private readonly firmaRepository: Repository<Firma>,
    private eventEmitter: EventEmitter2,
  ){}

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
      const documentoDeFirma = await this.firmaRepository.findOneBy({
        ticket:firmamex_id
      });

      documentoDeFirma.estaFirmado = true;
      documentoDeFirma.estatusDeFirma = EstatusDeFirma.APROBADA;
      
      const documentoId = documentoDeFirma.ordenOFacturaId;
      const tipoDeDocumento = documentoDeFirma.tipoDeDocumento;

      await this.firmaRepository.save(documentoDeFirma);
      if(tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO){
        this.emitter(documentoId,'orden');
      }else if(tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA){
        this.emitter(documentoId,'factura');
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  private handleDocumentRejected(webhook: DocumentRejected) {
    // Tu lógica aquí
  }

  private handleOriginalSigned(webhook: OriginalSigned) {
    // Tu lógica aquí
  }

  private handleUniversalSigned(webhook: UniversalSigned) {
    // Tu lógica aquí
  }

  private emitter(documentoId:string, evento:string) {
    this.eventEmitter.emit(
      `aprobacion.${evento}`,
      new DocumentoEvent(documentoId)
    )
  }
}
