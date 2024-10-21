import { Module } from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { FormatosController } from './formatos.controller';

@Module({
  controllers: [FormatosController],
  providers: [FormatosService],
})
export class FormatosModule {}
