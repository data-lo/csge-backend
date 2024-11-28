import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { PrinterService } from './printer.service';
import { ordenDeServicioPdf } from './reports/orden-de-servicio.report';
import { TextosService } from 'src/configuracion/textos/textos.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Factura)
    private facturRepository: Repository<Factura>,
    private textosService:TextosService,

    @InjectRepository(Orden)
    private ordenDeServicioRepository: Repository<Orden>,
    private readonly printerService: PrinterService
  ) {}

  async construirOrdenDeServicio(id:string) {

    const orden = await this.ordenDeServicioRepository.findOne({
      where:{id:id},
      relations:{
        campaña:true,
        proveedor:true,
        serviciosContratados:true,
        contrato:true
      }
    });
    const textoEncabezado = await this.textosService.obtenerEncabezado();
    const textoPieDePagina = await this.textosService.obtenerPieDePagina();
    const definicionDeOrden = await ordenDeServicioPdf({
      ordenDeServicio:orden,
      textoEncabezado:textoEncabezado.texto,
      textoPieDePagina:textoPieDePagina.texto,
    });
    const document = this.printerService.createPdf(definicionDeOrden);
    return document;
  }

  async construirAprobacionDeFactura(id:string){
    const factura = await this.facturRepository.findOne({
      where:{id:id}
    })
  }
}
