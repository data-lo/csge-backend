import { Module } from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { FormatosController } from './formatos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formato } from './entities/formato.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Formato]),
  AuthModule,
  PassportModule
  ],
  exports:[FormatosService],
  controllers: [FormatosController],
  providers: [FormatosService],
})
export class FormatosModule {}
