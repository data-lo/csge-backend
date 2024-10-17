import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultPassowrd } from './interfaces/usuarios.contrasenia.defecto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository:Repository<Usuario>,
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
      const dbUser = {
        password: defaultPassowrd,
        ...createUsuarioDto
      }
      console.log(dbUser)
      const usuario = this.usuarioRepository.create(dbUser);
      await this.usuarioRepository.save(dbUser)
      delete usuario.password;
      return usuario;
  }

  findAll(pagina:number) {
    return `This action returns all usuarios`;
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
