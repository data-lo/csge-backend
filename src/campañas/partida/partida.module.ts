import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';

@Module({
  controllers: [PartidaController],
  providers: [PartidaService],
})
export class PartidaModule {}
