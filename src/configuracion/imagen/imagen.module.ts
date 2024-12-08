import { Module } from '@nestjs/common';
import { ImagenService } from './imagen.service';
import { ImagenController } from './imagen.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [ImagenController],
  providers: [ImagenService],
  imports:[ AuthModule, PassportModule]
})
export class ImagenModule {}
