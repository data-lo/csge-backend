import { Module } from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { FormatosController } from './formatos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formato } from './entities/formato.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Formato])],
  exports:[FormatosService],
  controllers: [FormatosController],
  providers: [FormatosService],
})
export class FormatosModule {}
