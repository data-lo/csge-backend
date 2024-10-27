import { Injectable } from '@nestjs/common';
import { DepartamentosService } from 'src/administracion/departamentos/departamentos.service';
import { PuestosService } from 'src/administracion/puestos/puestos.service';
import { UsuariosService } from 'src/administracion/usuarios/usuarios.service';
import { departamentosData} from './data/administracion/departamentos.data';
import { puestosData } from './data/administracion/puestos.data';
import { plainToClass } from 'class-transformer';
import { CreatePuestoDto } from 'src/administracion/puestos/dto/create-puesto.dto';
import { CreateDepartamentoDto } from '../administracion/departamentos/dto/create-departamento.dto';
import { usuariosData } from './data/administracion/usuarios.data';
import { CreateUsuarioDto } from '../administracion/usuarios/dto/create-usuario.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';

@Injectable()
export class SeedService {

  constructor(
    private readonly usuariosService:UsuariosService,
    private readonly puestosService:PuestosService,
    private readonly departamentosService:DepartamentosService
  ){}
  
  async seed(){
    try{
      await this.insertarDepartamentos()
      await this.insertarPuestos()
      await this.insertarUsuarios()
      return {message:'Datos Insertados Correctamente'};
    }catch(error){
      handleExeptions(error);
    }
  }

  async insertarPuestos(){
    try{
       await puestosData.forEach(async puesto => {
        const puestoDto = plainToClass(CreatePuestoDto,puesto);
        await this.puestosService.create(puestoDto)
       });
    }catch(error){
      handleExeptions(error);
    }
  }

  async insertarDepartamentos(){
    try{
        await departamentosData.forEach(async departamento => {
        const departamentoDto = plainToClass(CreateDepartamentoDto,departamento);
        await this.departamentosService.create(departamentoDto)
      });
    }catch(error){
      handleExeptions(error);
    }
  }


  async insertarUsuarios() {
    try {
      for (const usuario of usuariosData) {
        const { departamentoId, puestoId, ...rest } = usuario;
        console.log(departamentoId);
        console.log(puestoId);
  
        const departamento = await this.departamentosService.findByTerm(departamentoId);
        const puesto = await this.puestosService.findByTerm(puestoId);
  
        console.log(departamento.id);
        console.log(puesto.id);
  
        const usuarioDto = plainToClass(CreateUsuarioDto, {
          departamentoId: departamento.id,
          puestoId: puesto.id,
          ...rest  
        });
  
        await this.usuariosService.create(usuarioDto);
      }
    } catch (error) {
      
      handleExeptions(error);
    }
  }
  
}
