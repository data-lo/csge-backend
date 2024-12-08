import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { PartidaEventosService } from './partida.events.service';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PartidaController],
  providers: [PartidaService, PartidaEventosService],
  imports: [TypeOrmModule.forFeature([Partida]), PassportModule, AuthModule],
  exports: [PartidaService]
})
export class PartidaModule { }
