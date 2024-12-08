import { Module } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { MunicipioController } from './municipio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [MunicipioController],
  providers: [MunicipioService],
  imports: [TypeOrmModule.forFeature([Municipio]),
  AuthModule,
  PassportModule  
],
  exports: [MunicipioService],
})
export class MunicipioModule {}
