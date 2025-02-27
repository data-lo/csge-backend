import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { ContratoModificatorio } from '../contratos_modificatorios/entities/contratos_modificatorio.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ContratosEventosService } from './contratos.events.service';
import { ContratoMaestro } from './entities/contrato.maestro.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { OrdenService } from 'src/ordenes/orden/orden.service';
import { IvaGetter } from 'src/helpers/iva.getter';
import { FirmaModule } from 'src/firma/firma/firma.module';
import { FirmaService } from 'src/firma/firma/firma.service';
import { ServicioContratadoService } from 'src/ordenes/servicio_contratado/servicio_contratado.service';
import { CampañasService } from 'src/campañas/campañas/campañas.service';
import { ProveedorService } from 'src/proveedores/proveedor/proveedor.service';
import { IvaService } from 'src/configuracion/iva/iva.service';
import { ServicioContratado } from 'src/ordenes/servicio_contratado/entities/servicio_contratado.entity';
import { CarteleraGobierno } from 'src/ordenes/cartelera_gobierno/entities/cartelera_gobierno.entity';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Dependencia } from 'src/campañas/dependencia/entities/dependencia.entity';
import { ActivacionService } from 'src/campañas/activacion/activacion.service';
import { Activacion } from 'src/campañas/activacion/entities/activacion.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { PartidaService } from 'src/campañas/partida/partida.service';
import { Iva } from 'src/configuracion/iva/entities/iva.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contrato, 
      ContratoModificatorio, 
      ContratoMaestro, 
      Proveedor,
      ServicioContratado, 
      CarteleraGobierno,
      Campaña,
      Dependencia,
      Activacion,
      Partida,
      Orden,
      Iva,
    ]),
    AuthModule,
    PassportModule,
    FirmaModule,
  ],
  controllers: [ContratosController],
  providers: [
    ContratosService,
    ContratosEventosService,
    OrdenService,
    IvaGetter,
    ActivacionService,
    ServicioContratadoService,
    CampañasService,
    ProveedorService,
    IvaService,
    PartidaService
  ],
  exports: [ // 🔹 Exportamos los servicios para que otros módulos los usen sin crear nuevas instancias
    ContratosService, 
    ContratosEventosService, 
    OrdenService,
    IvaGetter,
    ActivacionService,
    ServicioContratadoService,
    CampañasService,
    ProveedorService,
    IvaService,
    PartidaService,
    TypeOrmModule
  ],
})
export class ContratosModule {}
