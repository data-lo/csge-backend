import { Module } from '@nestjs/common';
import { FirmamexService } from './firmamex.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [FirmamexService],
  imports:[ConfigModule,HttpModule],
  exports:[FirmamexService]
})
export class FirmamexModule {}
