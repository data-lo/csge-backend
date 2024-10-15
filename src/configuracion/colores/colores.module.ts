import { Module } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';

@Module({
  controllers: [ColoresController],
  providers: [ColoresService],
})
export class ColoresModule {}
