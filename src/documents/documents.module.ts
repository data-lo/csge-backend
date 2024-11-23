import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { PrinterService } from './printer.service';

@Module({
  providers: [DocumentsService,PrinterService],
  imports:[TypeOrmModule.forFeature([Orden,Factura])],
  exports:[DocumentsService]
})
export class DocumentsModule {}
