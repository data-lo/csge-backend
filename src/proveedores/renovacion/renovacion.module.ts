import { Module } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { RenovacionController } from './renovacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { IvaModule } from 'src/configuracion/iva/iva.module';
import { Servicio } from '../servicio/entities/servicio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { RenovacionEventosService } from './renovacion.events.service';


@Module({
  controllers: [RenovacionController],
  providers: [RenovacionService,RenovacionEventosService],
  imports: [
    TypeOrmModule.forFeature([Renovacion,Servicio]),
    IvaModule,
    AuthModule,
    PassportModule
  ],
  exports:[RenovacionService]
})
export class RenovacionModule {}
