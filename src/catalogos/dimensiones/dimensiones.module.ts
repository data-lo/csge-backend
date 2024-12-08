import { Module } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { DimensionesController } from './dimensiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dimension } from './entities/dimension.entity';
import { LongitudesModule } from '../longitudes/longitudes.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Dimension]),
  LongitudesModule,
  AuthModule,
  PassportModule
],
  exports:[DimensionesService],
  controllers: [DimensionesController],
  providers: [DimensionesService],
})
export class DimensionesModule {}
