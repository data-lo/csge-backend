import { Module } from '@nestjs/common';
import { TextosService } from './textos.service';
import { TextosController } from './textos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Texto } from './entities/texto.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Texto]), AuthModule, PassportModule],
  exports:[TypeOrmModule,TextosService],
  controllers: [TextosController],
  providers: [TextosService],
})
export class TextosModule {}
