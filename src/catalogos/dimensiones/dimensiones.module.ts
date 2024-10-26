import { Module } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { DimensionesController } from './dimensiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dimension } from './entities/dimension.entity';
import { LongitudesModule } from '../longitudes/longitudes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dimension]),
  LongitudesModule],
  exports:[DimensionesService],
  controllers: [DimensionesController],
  providers: [DimensionesService],
})
export class DimensionesModule {}
