import { Module } from '@nestjs/common';
import { IvaService } from './iva.service';
import { IvaController } from './iva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Iva } from './entities/iva.entity';
import { IvaGetter } from 'src/helpers/iva.getter';

@Module({
  imports:[TypeOrmModule.forFeature([Iva])],
  controllers: [IvaController],
  providers: [IvaService,IvaGetter],
  exports:[IvaService,IvaGetter]
})
export class IvaModule {}
