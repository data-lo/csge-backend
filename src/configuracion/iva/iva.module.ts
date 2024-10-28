import { Module } from '@nestjs/common';
import { IvaService } from './iva.service';
import { IvaController } from './iva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Iva } from './entities/iva.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Iva])],
  controllers: [IvaController],
  providers: [IvaService],
  exports:[IvaService]
})
export class IvaModule {}
