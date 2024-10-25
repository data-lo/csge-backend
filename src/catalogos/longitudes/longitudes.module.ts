import { Module } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { LongitudesController } from './longitudes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Longitud } from './entities/longitud.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Longitud])],
  exports:[LongitudesService],
  controllers: [LongitudesController],
  providers: [LongitudesService],
})
export class LongitudesModule {}
