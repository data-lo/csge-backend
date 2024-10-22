import { Module } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { RenovacionController } from './renovacion.controller';

@Module({
  controllers: [RenovacionController],
  providers: [RenovacionService],
})
export class RenovacionModule {}
