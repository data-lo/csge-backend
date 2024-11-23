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
    private readonly printerService: PrinterService,
  ) {}

  async construirOrdenDeServicio(id:string) {

    const orden = await this.ordenDeServicioRepository.findOneBy({id:id});
    const definicionDeOrden = ordenDeServicioPdf({ordenDeServicio:orden});
    const document = this.printerService.createPdf(definicionDeOrden);
    return document;
  }

  construirAprobacionDeFactura(){

  }
}
