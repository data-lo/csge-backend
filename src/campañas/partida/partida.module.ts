import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { PartidaEventosService } from './partida.events.service';

@Module({
  controllers: [PartidaController],
  providers: [PartidaService,PartidaEventosService],
  imports:[TypeOrmModule.forFeature([Partida])],
  exports:[PartidaService]
})
export class PartidaModule {}
