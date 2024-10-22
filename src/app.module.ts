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
import { CampañasModule } from './campañas/campañas/campañas.module';
import { DependenciaModule } from './campañas/dependencia/dependencia.module';
import { ActivacionModule } from './campañas/activacion/activacion.module';
import { PartidaModule } from './campañas/partida/partida.module';
import { ProveedorModule } from './proveedores/proveedor/proveedor.module';
import { ContactoModule } from './proveedores/contacto/contacto.module';
import { MunicipioModule } from './proveedores/municipio/municipio.module';
import { ServicioModule } from './proveedores/servicio/servicio.module';
import { EstacionModule } from './proveedores/estacion/estacion.module';
import { RenovacionModule } from './proveedores/renovacion/renovacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
      isGlobal:true,
    }),
    TypeOrmModule.forRoot({
      type:"postgres",
      database:process.env.DB_NAME,
      host:process.env.DB_HOST,
      username:process.env.DB_USERNAME,
      password:process.env.DB_PASSWORD,
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
    TiemposModule,
    CampañasModule,
    DependenciaModule,
    ActivacionModule,
    PartidaModule,
    ProveedorModule,
    ContactoModule,
    MunicipioModule,
    ServicioModule,
    EstacionModule,
    RenovacionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}