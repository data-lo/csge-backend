import { Module } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { DimensionesController } from './dimensiones.controller';

@Module({
  controllers: [DimensionesController],
  providers: [DimensionesService],
})
export class DimensionesModule {}
