import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MinioService],
  imports:[ConfigModule],
  exports:[MinioService]
})
export class MinioModule {}
