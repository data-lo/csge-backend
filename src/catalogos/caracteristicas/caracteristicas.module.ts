import { Module } from '@nestjs/common';
import { CaracteristicasService } from './caracteristicas.service';
import { CaracteristicasController } from './caracteristicas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caracteristica } from './entities/caracteristica.entity';
import { Formato } from '../formatos/entities/formato.entity';
import { Dimension } from '../dimensiones/entities/dimension.entity';
import { Impresion } from '../impresiones/entities/impresion.entity';
import { Longitud } from '../longitudes/entities/longitud.entity';
import { Tiempo } from '../tiempos/entities/tiempo.entity';
import { DimensionesModule } from '../dimensiones/dimensiones.module';
import { ImpresionesModule } from '../impresiones/impresiones.module';
import { FormatosModule } from '../formatos/formatos.module';
import { LongitudesModule } from '../longitudes/longitudes.module';
import { TiemposModule } from '../tiempos/tiempos.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([
    Caracteristica,
    Dimension,
    Impresion,
    Formato,
    Longitud,
    Tiempo
  ]),
  DimensionesModule,
  ImpresionesModule,
  FormatosModule,
  LongitudesModule,
  TiemposModule,
  AuthModule,
  PassportModule
],
  exports:[CaracteristicasService],
  controllers: [CaracteristicasController],
  providers: [CaracteristicasService],
})
export class CaracteristicasModule {}
