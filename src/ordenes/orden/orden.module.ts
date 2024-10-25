import { Module } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { OrdenController } from './orden.controller';

@Module({
  controllers: [OrdenController],
  providers: [OrdenService],
})
export class OrdenModule {}
