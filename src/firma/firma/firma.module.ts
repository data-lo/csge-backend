import { Module } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { FirmaController } from './firma.controller';

@Module({
  controllers: [FirmaController],
  providers: [FirmaService],
})
export class FirmaModule {}
