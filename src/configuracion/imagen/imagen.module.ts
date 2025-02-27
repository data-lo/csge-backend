import { Module } from '@nestjs/common';
import { ImagenController } from './imagen.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [ImagenController],
  imports:[ AuthModule, PassportModule,MinioModule]
})
export class ImagenModule {}
