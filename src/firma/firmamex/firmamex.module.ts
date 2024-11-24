import { Module } from '@nestjs/common';
import { FirmamexService } from './firmamex.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [FirmamexService],
  imports:[ConfigModule],
  exports:[FirmamexService]
})
export class FirmamexModule {}
