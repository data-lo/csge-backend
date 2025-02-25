import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { PrinterService } from './printer.service';
import { ordenDeServicioPdf } from './reports/orden-de-servicio.report';
import { TextosService } from 'src/configuracion/textos/textos.service';
import { aprobacionDeFacturaPdf } from './reports/aprobacion-factura.report';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { campaignApprovalStructure } from './reports/campaign-approval-report';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Factura)
    private facturRepository: Repository<Factura>,

    @InjectRepository(Campaña)
    private campaignRepository: Repository<Campaña>,

    @InjectRepository(Orden)
    private ordenDeServicioRepository: Repository<Orden>,

    private readonly printerService: PrinterService,
    private textosService: TextosService,
  ) { }

  async construirOrdenDeServicio(id: string) {
    try {
      const orden = await this.ordenDeServicioRepository.findOne({
        where: { id: id },
        relations: {
          campaña: true,
          proveedor: true,
          serviciosContratados: true,
          contratoMaestro: true
        }
      });

      const textoEncabezado = await this.textosService.obtenerEncabezado();
      const textoPieDePagina = await this.textosService.obtenerPieDePagina();
      const definicionDeOrden = await ordenDeServicioPdf({
        ordenDeServicio: orden,
        textoEncabezado: textoEncabezado.texto,
        textoPieDePagina: textoPieDePagina.texto,
      });
      const document = this.printerService.createPdf(definicionDeOrden);
      return document;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async construirAprobacionDeFactura(id: string) {

    try {
      const facturaDb = await this.facturRepository.findOne({
        where: { id: id },
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
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }


}


