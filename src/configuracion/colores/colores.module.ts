import { Module } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Color])],
  exports:[TypeOrmModule],
  controllers: [ColoresController],
  providers: [ColoresService],
})
export class ColoresModule {}
