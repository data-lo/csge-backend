import { Module } from '@nestjs/common';
import { RespFirmaService } from './resp_firma.service';
import { RespFirmaController } from './resp_firma.controller';

@Module({
  controllers: [RespFirmaController],
  providers: [RespFirmaService],
})
export class RespFirmaModule {}
