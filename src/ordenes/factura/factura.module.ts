import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { FirmaModule } from 'src/firma/firma/firma.module';
import { FacturaEventosService } from './factura.events.service';
import { MinioModule } from 'src/minio/minio.module';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { ContratoModificatorio } from 'src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity';
import { ServicioContratado } from '../servicio_contratado/entities/servicio_contratado.entity';
import { CarteleraGobierno } from '../cartelera_gobierno/entities/cartelera_gobierno.entity';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Dependencia } from 'src/campañas/dependencia/entities/dependencia.entity';
import { Activacion } from 'src/campañas/activacion/entities/activacion.entity';
import { Partida } from 'src/campañas/partida/entities/partida.entity';
import { Iva } from 'src/configuracion/iva/entities/iva.entity';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Factura,
      Orden,
      Proveedor,
      Contrato,
      ContratoMaestro,
      ContratoModificatorio,
      ServicioContratado,
      CarteleraGobierno,
      Campaña,
      Dependencia,
      Activacion,
      Partida,
      Iva,
    ]),
    AuthModule,
    PassportModule,
    FirmaModule,
    MinioModule,
    ContratosModule,
  ],
  controllers: [FacturaController],
  providers: [
    FacturaService,
    FacturaEventosService,
  ],
})
export class FacturaModule {}
