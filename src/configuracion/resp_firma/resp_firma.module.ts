import { Module } from '@nestjs/common';
import { RespFirmaService } from './resp_firma.service';
import { RespFirmaController } from './resp_firma.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsableFirma } from './entities/resp_firma.entity';
import { UsuariosModule } from 'src/administracion/usuarios/usuarios.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([ResponsableFirma]),
    UsuariosModule
  ],
  exports:[TypeOrmModule],
  controllers: [RespFirmaController],
  providers: [RespFirmaService],
})
export class RespFirmaModule {}
