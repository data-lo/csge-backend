import { Module } from '@nestjs/common';
import { TextosService } from './textos.service';
import { TextosController } from './textos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Texto } from './entities/texto.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Texto])],
  exports:[TypeOrmModule],
  controllers: [TextosController],
  providers: [TextosService],
})
export class TextosModule {}
