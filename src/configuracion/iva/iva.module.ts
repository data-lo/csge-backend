import { Module } from '@nestjs/common';
import { IvaService } from './iva.service';
import { IvaController } from './iva.controller';

@Module({
  controllers: [IvaController],
  providers: [IvaService],
})
export class IvaModule {}
