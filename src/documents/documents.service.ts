import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { PrinterService } from './printer.service';
import { ordenDeServicioPdf } from './reports/orden-de-servicio.report';
import { TextosService } from 'src/configuracion/textos/textos.service';
import { aprobacionDeFacturaPdf } from './reports/aprobacion-factura.report';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { campaignDocumentStructure } from './reports/campaign-approval-report';
import * as QRCode from 'qrcode';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import { FirmaService } from 'src/firma/firma/firma.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Factura)
    private facturRepository: Repository<Factura>,

    @InjectRepository(Campaña)
    private campaignRepository: Repository<Campaña>,

    @InjectRepository(Orden)
    private ordenDeServicioRepository: Repository<Orden>,

    @InjectRepository(Firma)
    private signatureRepository: Repository<Firma>,

    private readonly printerService: PrinterService,

    private textosService: TextosService,
  ) { }


  async buildOrderDocument(orderId: string, isCampaign?: boolean, isFromCampaign?: boolean, activationId?: string) {

    try {
      const order = await this.ordenDeServicioRepository.findOne({
        where: { id: orderId },

        relations: {
          campaña: true,
          proveedor: true,
          serviciosContratados: true,
          contratoMaestro: true
        }
      });

      let qrCode: any;

      if (isCampaign) {
        const documentSigned = await this.checkDocumentSentForSigning(order.campaña.id, activationId);

        if (documentSigned) {
          if (documentSigned.isSigned && documentSigned.signedBy) {
            qrCode = await this.generatePdfWithQR({
              signatureAction: documentSigned.signatureAction,
              signedAt: new Date(documentSigned.signedBy.signedAt),
              signerRfc: documentSigned.signedBy.signerRfc,
              signerEmail: documentSigned.signedBy.signerEmail,
              url: documentSigned.firmamexDocumentUrl
            });
          }
        }
      }

      const textoEncabezado = await this.textosService.obtenerEncabezado();
      const textoPieDePagina = await this.textosService.obtenerPieDePagina();
      const definicionDeOrden = await ordenDeServicioPdf({
        ordenDeServicio: order,
        textoEncabezado: textoEncabezado.texto,
        textoPieDePagina: textoPieDePagina.texto,
        qrCode
      });

      if (isCampaign && isFromCampaign) {
        const pdfDoc = this.printerService.createPdf(definicionDeOrden);

        const pdfBytes = await new Promise<Uint8Array>((resolve, reject) => {
          const buffers: Buffer[] = [];
          pdfDoc.on('data', (chunk) => buffers.push(chunk));
          pdfDoc.on('end', () => resolve(new Uint8Array(Buffer.concat(buffers))));
          pdfDoc.on('error', (err) => reject(err));
          pdfDoc.end();
        });
        return pdfBytes;
      }

      const document = this.printerService.createPdf(definicionDeOrden);

      return document;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async buildInvoiceApprovalDocument(invoiceId: string) {
    try {
      const facturaDb = await this.facturRepository.findOne({
        where: { id: invoiceId },
        relations: {
          proveedor: true,
          usuarioTestigo: true
        }
      });

      const textoEncabezado = await this.textosService.obtenerEncabezado();

      const textoPieDePagina = await this.textosService.obtenerPieDePagina();

      const definicionDeFactura = await aprobacionDeFacturaPdf({
        facturaDb: facturaDb,
        textoEncabezado: textoEncabezado.texto,
        textoPieDePagina: textoPieDePagina.texto,
      });

      const document = this.printerService.createPdf(definicionDeFactura);

      return document;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async buildCampaignDocument(campaignId: string, signatureAction: SIGNATURE_ACTION_ENUM) {

    try {
      const campaing = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      const header = await this.textosService.obtenerEncabezado();

      const footer = await this.textosService.obtenerPieDePagina();

      const campaignStructure = await campaignDocumentStructure({
        campaing: campaing,
        header: header.texto,
        footer: footer.texto,
        signatureAction
      });

      const document = this.printerService.createPdf(campaignStructure);

      return document;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async generatePdfWithQR(values: { signedAt: Date, signerRfc: string, signerEmail: string, url: string, signatureAction: SIGNATURE_ACTION_ENUM }) {

    let action: string = "ACCIÓN NO VÁLIDA"

    if (values.signatureAction === SIGNATURE_ACTION_ENUM.APPROVE) {
      action = "APROBADA";
    } else {
      action = "CANCELADA";
    }

    const qrText = `LA ORDEN HA SIDO ${action} .\n USUARIO: ${values.signerRfc} (${values.signerEmail})\n FECHA Y HORA: ${values.signedAt} DOCUMENTO: ${values.url}`;

    try {
      const qrBase64 = await QRCode.toDataURL(qrText)

      return qrBase64;

    } catch (error) {
      console.error('Error generando el PDF con QR:', error);
    }
  }



  async checkDocumentSentForSigning(id: string, activationId?: string) {
    try {
      const whereClause: any = { documentId: id };

      if (activationId) {
        whereClause.activationId = activationId;
      }

      let document = await this.signatureRepository.findOne({
        where: { ...whereClause, signatureAction: SIGNATURE_ACTION_ENUM.CANCEL },
      });

      if (!document) {
        document = await this.signatureRepository.findOne({
          where: { ...whereClause, signatureAction: SIGNATURE_ACTION_ENUM.APPROVE },
        });
      }

      return document;

    } catch (error) {
      handleExceptions(error);
    }
  }


}


