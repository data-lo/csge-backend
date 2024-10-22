import { Module } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { TiemposController } from './tiempos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tiempo } from './entities/tiempo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tiempo])],
  controllers: [TiemposController],
  providers: [TiemposService],
})
export class TiemposModule {}
