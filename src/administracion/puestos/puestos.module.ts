import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Puesto]),
  AuthModule,
  PassportModule,
  ],
  exports:[TypeOrmModule,PuestosService],
  controllers: [PuestosController],
  providers: [PuestosService],
})
export class PuestosModule {}
