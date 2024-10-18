import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsuariosModule } from 'src/administracion/usuarios/usuarios.module';
import { PuestosModule } from 'src/administracion/puestos/puestos.module';
import { DepartamentosModule } from 'src/administracion/departamentos/departamentos.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    UsuariosModule,
    PuestosModule,
    DepartamentosModule]
})
export class SeedModule {}
