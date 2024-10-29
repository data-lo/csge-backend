import { Module } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { MunicipioController } from './municipio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';

@Module({
  controllers: [MunicipioController],
  providers: [MunicipioService],
  imports:[TypeOrmModule.forFeature([Municipio])],
  exports:[MunicipioService]
})
export class MunicipioModule {}
