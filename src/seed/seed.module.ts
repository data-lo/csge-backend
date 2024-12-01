import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsuariosModule } from 'src/administracion/usuarios/usuarios.module';
import { PuestosModule } from 'src/administracion/puestos/puestos.module';
import { DepartamentosModule } from 'src/administracion/departamentos/departamentos.module';
import { FormatosModule } from 'src/catalogos/formatos/formatos.module';
import { CaracteristicasModule } from 'src/catalogos/caracteristicas/caracteristicas.module';
import { DimensionesModule } from 'src/catalogos/dimensiones/dimensiones.module';
import { ImpresionesModule } from 'src/catalogos/impresiones/impresiones.module';
import { LongitudesModule } from 'src/catalogos/longitudes/longitudes.module';
import { TiemposModule } from 'src/catalogos/tiempos/tiempos.module';
import { ColoresModule } from 'src/configuracion/colores/colores.module';
import { IvaModule } from 'src/configuracion/iva/iva.module';
import { TextosModule } from 'src/configuracion/textos/textos.module';
import { MunicipioModule } from 'src/proveedores/municipio/municipio.module';
import { ContactoModule } from 'src/proveedores/contacto/contacto.module';
import { ServicioModule } from 'src/proveedores/servicio/servicio.module';
import { DependenciaModule } from 'src/campañas/dependencia/dependencia.module';
import { ProveedorModule } from 'src/proveedores/proveedor/proveedor.module';
import { EstacionModule } from 'src/proveedores/estacion/estacion.module';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    UsuariosModule,
    PuestosModule,
    DepartamentosModule,
    CaracteristicasModule,
    DimensionesModule,
    FormatosModule,
    ImpresionesModule,
    LongitudesModule,
    TiemposModule,
    ColoresModule,
    IvaModule,
    TextosModule,
    MunicipioModule,
    ContactoModule,
    ServicioModule,
    DependenciaModule,
    ProveedorModule,
    EstacionModule,
    ContratosModule
  ]
})
export class SeedModule {}
