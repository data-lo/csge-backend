import { Module } from '@nestjs/common';
import { ActivacionService } from './activacion.service';
import { ActivacionController } from './activacion.controller';

@Module({
  controllers: [ActivacionController],
  providers: [ActivacionService],
})
export class ActivacionModule {}
