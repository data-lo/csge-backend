import { Module } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { TiemposController } from './tiempos.controller';

@Module({
  controllers: [TiemposController],
  providers: [TiemposService],
})
export class TiemposModule {}
