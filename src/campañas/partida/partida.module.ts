import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';

@Module({
  controllers: [PartidaController],
  providers: [PartidaService],
  imports:[TypeOrmModule.forFeature([Partida])],
  exports:[PartidaService]
})
export class PartidaModule {}
