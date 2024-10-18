import { Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultPassowrd } from './interfaces/usuarios.contrasenia.defecto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository:Repository<Usuario>,
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try{
      const dbUser = {
        password: bcrypt.hashSync(defaultPassowrd,10),
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

  async findOne(id:string) {
    try{
      const usuario = await this.usuarioRepository.findOneBy({id:id});
      if(!usuario){
        throw new NotFoundException('Usuario no encontrado');
      };
      delete usuario.password;
      delete usuario.puestoId;
      delete usuario.departamentoId;
      return usuario;

    }catch(error){
      handleExeptions(error);
    };
  }

  async update(id:string, updateUsuarioDto: UpdateUsuarioDto) {
    try{
      const updateResult = await this.usuarioRepository.update(id,updateUsuarioDto);
      if(updateResult.affected === 0){
        throw new NotFoundException('Usuario no encontrado');
      }
      return this.findOne(id);
    }catch(error){
      handleExeptions(error);
    }
  }

  async deactivate(id:string) {
    try{
      const deactivate = false;
      await this.usuarioRepository.update(id,
        {estatus:deactivate});
      return {message:'usuario desactivado'}
    }catch(error){
      handleExeptions(error);
    }
  }

  async updatePassword(updatePasswordDto:UpdatePasswordDto){
      const {userId, newPassword} = updatePasswordDto;
      const updatedPassword = bcrypt.hashSync(newPassword,10)
      await this.usuarioRepository.update(userId,{
        password:updatedPassword});
      return {"message":"contraseña actualizada"}
  }

  async login(loginUserDto:LoginUserDto){
    const {password,correo} = loginUserDto;
    const dbUser = (await this.usuarioRepository.findOneBy({correo:correo}));
    
    if(!dbUser){
      throw new UnauthorizedException('Usuario no encontrado')
    }
    
    if(await this.verificarPrimerInicioDeSesion(password,dbUser.password)){
      return {'defaultPassword':true};
    }

    if(!bcrypt.compareSync(password,dbUser.password)){
      throw new UnauthorizedException('Contraseña no valida')
    }
    
    if(dbUser.estatus === false){
      throw new UnauthorizedException('Usuario deshabilitado, contactar al administrador')
    }

    delete dbUser.password;
    return {message:'Inicio de sesion exitoso :)'}

  }

  async verificarPrimerInicioDeSesion(password:string,dbPassword:string){
    if(password === defaultPassowrd){
      if(bcrypt.compareSync(defaultPassowrd,dbPassword)){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    };
  }

  async reestablecer(userId:string){
    try{
      const updateResult = await this.usuarioRepository.update(userId,{
        password:bcrypt.hashSync(defaultPassowrd,10)
      });
      if(updateResult.affected === 0){
        throw new NotFoundException('Departamento no encontrado');
      }
      return {message:"Contraseña reestablecida"};
    }catch(error){
      handleExeptions(error);
    }
  }

  async remover_permisos(){
    
  }

  async agregar_permisos(){

  }
}
