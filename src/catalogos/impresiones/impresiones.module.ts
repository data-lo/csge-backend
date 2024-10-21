import { Module } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { ImpresionesController } from './impresiones.controller';

@Module({
  controllers: [ImpresionesController],
  providers: [ImpresionesService],
})
export class ImpresionesModule {}
