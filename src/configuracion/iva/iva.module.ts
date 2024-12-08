import { Module } from '@nestjs/common';
import { IvaService } from './iva.service';
import { IvaController } from './iva.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Iva } from './entities/iva.entity';
import { IvaGetter } from 'src/helpers/iva.getter';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Iva]), AuthModule, PassportModule],
  controllers: [IvaController],
  providers: [IvaService,IvaGetter],
  exports:[IvaService,IvaGetter]
})
export class IvaModule {}
