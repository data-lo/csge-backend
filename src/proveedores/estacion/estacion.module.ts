import { Module } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { EstacionController } from './estacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { MunicipioModule } from '../municipio/municipio.module';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { StationEventsService } from './estacion.events.service';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';

@Module({
  controllers: [EstacionController],
  providers: [EstacionService, StationEventsService],
  imports: [TypeOrmModule.forFeature([Estacion,Proveedor]),
    MunicipioModule,
    AuthModule,
    PassportModule,
    ContratosModule
  ],
  exports:[
    EstacionService,
    StationEventsService
  ]
})
export class EstacionModule {}
