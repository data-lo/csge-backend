import { Injectable } from '@nestjs/common';
import { DocumentCompleted } from './interfaces/document-completed.webhook.notification';
import { DocumentRejected } from './interfaces/document-rejected.webhook.notification';
import { OriginalSigned } from './interfaces/original-signed.webhook.notification';
import { UniversalSigned } from './interfaces/universal_signed.webhook.notification';
import { InjectRepository } from '@nestjs/typeorm';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Firma)
    private readonly firmaRepository: Repository<Firma>,
  ) {}

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
        console.log('Unhandled notification type:', firmamexWebhook);
    }
  }

  private handleDocumentCompleted(webhook: DocumentCompleted) {
    console.log('Handling DocumentCompleted:', webhook);
    // Tu lógica aquí
  }

  private handleDocumentRejected(webhook: DocumentRejected) {
    console.log('Handling DocumentRejected:', webhook);
    // Tu lógica aquí
  }

  private handleOriginalSigned(webhook: OriginalSigned) {
    console.log('Handling OriginalSigned:', webhook);
    // Tu lógica aquí
  }

  private handleUniversalSigned(webhook: UniversalSigned) {
    console.log('Handling UniversalSigned:', webhook);
    // Tu lógica aquí
  }
}
