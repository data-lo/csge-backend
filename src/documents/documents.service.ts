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
import { campaignApprovalStructure } from './reports/campaign-approval-report';
import * as QRCode from 'qrcode';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Firma } from 'src/firma/firma/entities/firma.entity';
import { url } from 'inspector';

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


  async buildOrderDocument(orderId: string, isCampaign?: boolean, isFromCampaign?: boolean) {
    console.log(isFromCampaign)
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
        const documentSigned = await this.signatureRepository.findOne({
          where: { ordenOFacturaId: order.campaña.id }
        });
      
        if (documentSigned) {
          if (documentSigned.estaFirmado && documentSigned.signedBy) {
            qrCode = await this.generatePdfWithQR({
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

  async buildCampaignApprovalDocument(campaignId: string) {

    try {
      const campaing = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });

      const header = await this.textosService.obtenerEncabezado();

      const footer = await this.textosService.obtenerPieDePagina();

      const definicionDeFactura = await campaignApprovalStructure({
        campaing: campaing,
        header: header.texto,
        footer: footer.texto,
      });

      const document = this.printerService.createPdf(definicionDeFactura);

      return document;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async generatePdfWithQR(values: { signedAt: Date, signerRfc: string, signerEmail: string, url: string }) {

    const qrText = `Orden aprobada junto con la campaña.\nAprobado por: ${values.signerRfc} (${values.signerEmail})\nFecha y hora: ${values.signedAt} Documento de aprobación: ${values.url}`;

    try {
      const qrBase64 = await QRCode.toDataURL(qrText);

      return qrBase64;

    } catch (error) {
      console.error('Error generando el PDF con QR:', error);
    }
  }





}


