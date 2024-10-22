import { Module } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CampañasController } from './campañas.controller';

@Module({
  controllers: [CampañasController],
  providers: [CampañasService],
})
export class CampañasModule {}
