import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Estacion } from '../estacion/entities/estacion.entity';
import { EstacionModule } from '../estacion/estacion.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Proveedor } from '../proveedor/entities/proveedor.entity';

@Module({
  controllers: [ServicioController],
  providers: [ServicioService],
  imports: [TypeOrmModule.forFeature([Servicio, Estacion, Proveedor]),
    EstacionModule,
    AuthModule,
    PassportModule
  ],
  exports: [
    ServicioService,
    TypeOrmModule.forFeature([Servicio]),
  ]
})
export class ServicioModule { }
