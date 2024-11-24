import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { PrinterService } from './printer.service';
import { ordenDeServicioPdf } from './reports/orden-de-servicio.report';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Factura)
    private facturRepository: Repository<Factura>,
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
    const definicionDeOrden = await ordenDeServicioPdf({ordenDeServicio:orden});
    const document = this.printerService.createPdf(definicionDeOrden);
    return document;
  }

  construirAprobacionDeFactura(){

  }
}
