import { Module } from '@nestjs/common';
import { ActivacionService } from './activacion.service';
import { ActivacionController } from './activacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from '../partida/entities/partida.entity';
import { Activacion } from './entities/activacion.entity';
import { Campaña } from '../campañas/entities/campaña.entity';
import { ActivacionEventosService } from './activacion.events.service';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [ActivacionController],
  providers: [ActivacionService, ActivacionEventosService],
  imports: [TypeOrmModule.forFeature([Partida, Activacion, Campaña]),
  AuthModule,
  PassportModule,
  ],
  exports: [ActivacionService],
})
export class ActivacionModule {}
