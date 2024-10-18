import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuariosModule } from './administracion/usuarios/usuarios.module';
import { PuestosModule } from './administracion/puestos/puestos.module';
import { DepartamentosModule } from './administracion/departamentos/departamentos.module';
import { IvaModule } from './configuracion/iva/iva.module';
import { TextosModule } from './configuracion/textos/textos.module';
import { RespFirmaModule } from './configuracion/resp_firma/resp_firma.module';
import { ColoresModule } from './configuracion/colores/colores.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.cloud',
      isGlobal:true,
    }),
    TypeOrmModule.forRoot({
      type:"postgres",
      url:process.env.DATABASE_URL,
      ssl:true,
      synchronize:true,
      autoLoadEntities:true
      }),
    UsuariosModule, 
    PuestosModule, 
    DepartamentosModule, 
    IvaModule, 
    TextosModule, 
    RespFirmaModule, 
    ColoresModule,
    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}