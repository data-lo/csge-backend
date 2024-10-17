import { Injectable, Delete } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultPassowrd } from './interfaces/usuarios.contrasenia.defecto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository:Repository<Usuario>,
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try{
      const dbUser = {
        password: defaultPassowrd,
        ...createUsuarioDto
      }
      console.log(dbUser)
      const usuario = this.usuarioRepository.create(dbUser);
      await this.usuarioRepository.save(usuario)
      delete usuario.password;
      return usuario;
    
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      return await this.usuarioRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit(),
        relations:{
          departamento:true,
          puesto:true
        }
      })
    }catch(error){
      handleExeptions(error);
    }
  }

  findOne(id:string) {
    return `This action returns a #${id} usuario`;
  }

  update(id:string, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id:string) {
    return `This action removes a #${id} usuario`;
  }
}
