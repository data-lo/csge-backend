import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './administracion/usuarios/usuarios.module';
import { PuestosModule } from './administracion/puestos/puestos.module';
import { DepartamentosModule } from './administracion/departamentos/departamentos.module';
import { IvaModule } from './configuracion/iva/iva.module';
import { TextosModule } from './configuracion/textos/textos.module';
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
import { FirmaModule } from './firma/firma/firma.module';
import { OrdenModule } from './ordenes/orden/orden.module';
import { FacturaModule } from './ordenes/factura/factura.module';
import { ServicioContratadoModule } from './ordenes/servicio_contratado/servicio_contratado.module';
import { CarteleraGobiernoModule } from './ordenes/cartelera_gobierno/cartelera_gobierno.module';
import { LoggerModule } from './logger/logger.module';
import { DocumentsModule } from './documents/documents.module';
import { FirmamexModule } from './firma/firmamex/firmamex.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { MinioModule } from './minio/minio.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';

import { CustomFilterModule } from './customer-filter/customer-filter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: false,
      synchronize: true,
      autoLoadEntities: true,
    }),
    EventEmitterModule.forRoot({
      delimiter: '.'
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true
    }),
    UsuariosModule,
    PuestosModule,
    DepartamentosModule,
    IvaModule,
    TextosModule,
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
    RenovacionModule,
    FirmaModule,
    OrdenModule,
    FacturaModule,
    ServicioContratadoModule,
    CarteleraGobiernoModule,
    LoggerModule,
    DocumentsModule,
    FirmamexModule,
    WebhooksModule,
    MinioModule,
    CronJobsModule,
    CustomFilterModule,
  ],
  providers: [],
})
export class AppModule {}