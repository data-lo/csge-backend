import { Module } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { ImpresionesController } from './impresiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Impresion } from './entities/impresion.entity';
import { DimensionesModule } from '../dimensiones/dimensiones.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Impresion]),
    DimensionesModule],
  controllers: [ImpresionesController],
  providers: [ImpresionesService],
})
export class ImpresionesModule {}
