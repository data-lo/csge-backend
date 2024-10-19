import { Module } from '@nestjs/common';
import { ImagenService } from './imagen.service';
import { ImagenController } from './imagen.controller';

@Module({
  controllers: [ImagenController],
  providers: [ImagenService],
})
export class ImagenModule {}
