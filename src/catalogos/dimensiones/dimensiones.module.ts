import { Module } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { DimensionesController } from './dimensiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dimension } from './entities/dimension.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dimension])],
  controllers: [DimensionesController],
  providers: [DimensionesService],
})
export class DimensionesModule {}
