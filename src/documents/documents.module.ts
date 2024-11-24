import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { PrinterService } from './printer.service';
import { TextosModule } from 'src/configuracion/textos/textos.module';

@Module({
  providers: [DocumentsService,PrinterService],
  imports:[TypeOrmModule.forFeature([Orden,Factura]),TextosModule],
  exports:[DocumentsService]
})
export class DocumentsModule {}
