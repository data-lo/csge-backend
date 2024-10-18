import { Injectable } from '@nestjs/common';
import { DepartamentosService } from 'src/administracion/departamentos/departamentos.service';
import { PuestosService } from 'src/administracion/puestos/puestos.service';
import { UsuariosService } from 'src/administracion/usuarios/usuarios.service';
import { departamentosData} from './data/departamentos.data';
import { puestosData } from './data/puestos.data';
import { plainToClass } from 'class-transformer';
import { CreatePuestoDto } from 'src/administracion/puestos/dto/create-puesto.dto';
import { CreateDepartamentoDto } from '../administracion/departamentos/dto/create-departamento.dto';
import { usuariosData } from './data/usuarios.data';
import { CreateUsuarioDto } from '../administracion/usuarios/dto/create-usuario.dto';

@Injectable()
export class SeedService {

  constructor(
    private readonly usuariosService:UsuariosService,
    private readonly puestosService:PuestosService,
    private readonly departamentosService:DepartamentosService
  ){}
  
  async seed(){
    this.insertarUsuarios();
  }

  async insertarPuestos(){
   await puestosData.forEach(puesto => {
    const puestoDto = plainToClass(CreatePuestoDto,puesto);
    this.puestosService.create(puestoDto)
   });
  }

  async insertarDepartamentos(){
    await departamentosData.forEach(departamento => {
      const departamentoDto = plainToClass(CreateDepartamentoDto,departamento);
      this.departamentosService.create(departamentoDto)
    });
  }

  async insertarUsuarios(){
    await usuariosData.forEach(usuario => {
      const usuarioDto = plainToClass(CreateUsuarioDto,usuario);
      this.usuariosService.create(usuarioDto)
    });
  }
}
