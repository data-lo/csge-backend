import { Module } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { EstacionController } from './estacion.controller';

@Module({
  controllers: [EstacionController],
  providers: [EstacionService],
})
export class EstacionModule {}
