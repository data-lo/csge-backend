import { Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultPassowrd } from './interfaces/usuarios.contrasenia.defecto';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ActualizarPermisosDto } from './dto/actualizar-permisos.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository:Repository<Usuario>,
    private readonly jwtService:JwtService,
  
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    try{
      const dbUser = {
        password: bcrypt.hashSync(defaultPassowrd,10),
        ...createUsuarioDto
      }

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
      const usuarios = await this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.departamento','departamento')
      .leftJoinAndSelect('usuario.puesto','puesto')
      .select([
        'usuario.id',
        'usuario.estatus',
        'usuario.nombres',
        'usuario.primerApellido',
        'usuario.segundoApellido',
        'usuario.correo',
        'usuario.permisos',
        'departamento.nombre',
        'puesto.nombre'
      ])
      .orderBy('usuario.estatus', 'DESC') 
      .addOrderBy('usuario.primerApellido', 'ASC')
      .skip(paginationSetter.getSkipElements(pagina))
      .take(paginationSetter.castPaginationLimit())
      .getMany();

      return usuarios;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAllBusqueda(){
    try{
      const usuarios = await this.usuarioRepository.find({
        select:{
          estatus:true,
          nombres:true,
          primerApellido:true,
          segundoApellido:true,
          correo:true,
          permisos:true,
          puesto:{
            nombre:true
          },
          departamento:{
            nombre:true
          }
        }
      });
      return usuarios;
    }
    catch(error){
      handleExeptions(error);
    }
  }

  async findOne(userId:string) {
    try{
      const usuario = await this.usuarioRepository.findOneBy({id:userId});
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

  async update(userId:string, updateUsuarioDto: UpdateUsuarioDto) {
    try{
      const usuarioDb = await this.findOne(userId);
      if(usuarioDb){
        const updateResult = await this.usuarioRepository.update(userId,updateUsuarioDto);
        if(updateResult.affected === 0){
          throw new NotFoundException('Usuario no encontrado');
        }
        return this.findOne(userId);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async deactivate(id:string) {
    try{
      const deactivate = false;
      const usuarioDb = await this.findOne(id);
      if(usuarioDb){
        await this.usuarioRepository.update(id,
          {estatus:deactivate});
        return {message:'usuario desactivado'}
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async updatePassword(updatePasswordDto:UpdatePasswordDto){
    try{
      const {userId, newPassword} = updatePasswordDto;
      const updatedPassword = bcrypt.hashSync(newPassword,10)
      const usuarioDb = await this.findOne(userId);
      if(usuarioDb){
        await this.usuarioRepository.update(userId,{
          password:updatedPassword});
        return {"message":"contraseña actualizada"}
      }
    }catch(error){
      handleExeptions(error);
    }
      
  }

  async login(loginUserDto:LoginUserDto){
    try{
      const {password,correo} = loginUserDto;
      const dbUser = (await this.usuarioRepository.findOneBy({correo:correo}));
      
      if(!dbUser){
        throw new UnauthorizedException('Usuario no encontrado')
      }
      
      if(await this.verificarPrimerInicioDeSesion(password,dbUser.password)){
        return {
          'defaultPassword':true,
          'userId':dbUser.id
        };
      }
  
      if(!bcrypt.compareSync(password,dbUser.password)){
        throw new UnauthorizedException('Contraseña no valida')
      }
      
      if(dbUser.estatus === false){
        throw new UnauthorizedException('Usuario deshabilitado, contactar al administrador')
      }
  
      delete dbUser.password;
      return {
        user:{
          ... dbUser
        },
        token:{
          token:this.getJwtToken({id:dbUser.id})
        }
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async verificarPrimerInicioDeSesion(password:string,dbPassword:string){
    try{
      if(password === defaultPassowrd){
        if(bcrypt.compareSync(defaultPassowrd,dbPassword)){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      };
    }catch(error){
      handleExeptions(error);
    }
    
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

  async removerPermisos(actualizarPermisosDto:ActualizarPermisosDto){
    try{
      const {id,permisos} = actualizarPermisosDto;
      const usuarioDb = await this.findOne(id);
      
      if(usuarioDb.estatus === false){
        return {message:"Usuario desactivado. Activar usuario para hacer cambios"}
      }
      
      const permisosActualizados = usuarioDb.permisos.filter(
        (permiso) => !permisos.includes(permiso),
      );
      
      await this.usuarioRepository.update(id, { permisos: permisosActualizados });
      return { message: "Permisos removidos exitosamente", permisos_activos: permisosActualizados }
    
    }catch(error){
      handleExeptions(error);
    }
  }

  async agregarPermisos(actualizarPermisosDto: ActualizarPermisosDto) {
    try{
      const { id, permisos } = actualizarPermisosDto;
      const usuarioDb = await this.findOne(id);
  
      if (!usuarioDb) {
        return { message: "Usuario no encontrado" };
      }
  
      if (usuarioDb.estatus === false) {
        return { message: "Usuario desactivado. Activar usuario para hacer cambios" };
      }
  
      // Combinar los permisos existentes con los nuevos sin duplicados
      const permisosActualizadosSet = new Set([...usuarioDb.permisos, ...permisos]);
      const permisosActualizados = Array.from(permisosActualizadosSet);
  
      await this.usuarioRepository.update(id, { permisos: permisosActualizados });
      return { message: "Permisos agregados exitosamente", permisos: permisosActualizados };
    }catch(error){
      handleExeptions(error);
    }
  }
  
  async obtenerEstatus(userId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: userId },
        relations: [],
        select: ['id', 'estatus'],
      });
  
      return { usuario: usuario.id, estatus: usuario.estatus};
    } catch (error) {
      handleExeptions(error);
    }
  }

  async checkAuthStatus(usuario:Usuario){
    return {
      usuario,
      token:this.getJwtToken({id:usuario.id})
    }
  }

  private getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
