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
import { AuthModule } from './auth/auth.module';
import { ImagenModule } from './configuracion/imagen/imagen.module';
import { ContratosModule } from './contratos/contratos/contratos.module';
import { ContratosModificatoriosModule } from './contratos/contratos_modificatorios/contratos_modificatorios.module';
import { CaracteristicasModule } from './catalogos/caracteristicas/caracteristicas.module';
import { DimensionesModule } from './catalogos/dimensiones/dimensiones.module';
import { FormatosModule } from './catalogos/formatos/formatos.module';
import { ImpresionesModule } from './catalogos/impresiones/impresiones.module';
import { LongitudesModule } from './catalogos/longitudes/longitudes.module';
import { TiemposModule } from './catalogos/tiempos/tiempos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal:true,
    }),
    TypeOrmModule.forRoot({
      type:"postgres",
      database:process.env.DB_NAME,
      host:process.env.DB_HOST,
      username:process.env.DB_USERNAME,
      password:process.env.DB_PASSWORD,
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
    SeedModule, 
    AuthModule, 
    ImagenModule,
    ContratosModule,
    ContratosModificatoriosModule,
    CaracteristicasModule,
    DimensionesModule,
    FormatosModule,
    ImpresionesModule,
    LongitudesModule,
    TiemposModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}