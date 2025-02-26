import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
    private usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,

  ) { }

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const dbUser = {
        password: bcrypt.hashSync(defaultPassowrd, 10),
        ...createUsuarioDto
      }

      const usuario = this.usuarioRepository.create(dbUser);
      await this.usuarioRepository.save(usuario)

      delete usuario.password;
      return usuario;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter()
      const usuarios = await this.usuarioRepository.createQueryBuilder('usuario')
        .leftJoinAndSelect('usuario.departamento', 'departamento')
        .leftJoinAndSelect('usuario.puesto', 'puesto')
        .select([
          'usuario.id',
          'usuario.estatus',
          'usuario.nombres',
          'usuario.primerApellido',
          'usuario.segundoApellido',
          'usuario.correo',
          'usuario.permisos',
          'usuario.documentosDeFirma',
          'usuario.tipoOrdenDeServicio',
          'departamento.nombre',
          'puesto.nombre'
        ])
        .orderBy('usuario.estatus', 'DESC')
        .addOrderBy('usuario.primerApellido', 'ASC')
        .skip(paginationSetter.getSkipElements(pagina))
        .take(paginationSetter.castPaginationLimit())
        .getMany();

      return usuarios;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const usuarios = await this.usuarioRepository.find({
        select: {
          estatus: true,
          nombres: true,
          primerApellido: true,
          segundoApellido: true,
          correo: true,
          permisos: true,
          documentosDeFirma: true,
          tipoOrdenDeServicio:true,
          puesto: {
            nombre: true
          },
          departamento: {
            nombre: true
          }
        }
      });
      return usuarios;
    }
    catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(userId: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id: userId });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      };
      delete usuario.password;
      delete usuario.puestoId;
      delete usuario.departamentoId;
      return usuario;
    } catch (error) {
      handleExeptions(error);
    };
  }

  async update(userId: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuarioDb = await this.findOne(userId);
      Object.assign(usuarioDb, updateUsuarioDto);
      const updatedResult = await this.usuarioRepository.save(usuarioDb);
      if (!updatedResult) throw new InternalServerErrorException('NO SE ENCUENTRA EL USUARIO');
      return updatedResult;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async deactivate(id: string) {
    try {

      const usuarioDb = await this.findOne(id);
      usuarioDb.estatus = false;
      await this.usuarioRepository.save(usuarioDb);
      return { message: 'usuario desactivado' }

    } catch (error) {
      handleExeptions(error);
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    try {
      const { userId, newPassword } = updatePasswordDto;
      const updatedPassword = bcrypt.hashSync(newPassword, 10)
      const usuarioDb = await this.findOne(userId);

      usuarioDb.password = updatedPassword;

      await this.usuarioRepository.save(usuarioDb)
      return { message: "CONTRASEÑA ACTUALIADA EXISTOSAMENTE" };

    } catch (error) {
      handleExeptions(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, correo } = loginUserDto;
      const dbUser = (await this.usuarioRepository.findOneBy({ correo: correo.toUpperCase() }));

      if (!dbUser) {
        throw new UnauthorizedException('Usuario no encontrado')
      }

      if (await this.verificarPrimerInicioDeSesion(password, dbUser.password)) {
        return {
          'defaultPassword': true,
          'userId': dbUser.id
        };
      }

      if (!bcrypt.compareSync(password, dbUser.password)) {
        throw new UnauthorizedException('Contraseña no valida')
      }

      if (dbUser.estatus === false) {
        throw new UnauthorizedException('Usuario deshabilitado, contactar al administrador')
      }

      delete dbUser.password;
      const currentTime = new Date();

      const gmtMinus6Offset = -6 * 60;

      const expirationTimeGMTMinus6 = new Date(currentTime.getTime() + 6 * 60 * 60 * 1000 + gmtMinus6Offset * 60 * 1000);

      return {
        user: {
          id: dbUser.id,
          rol: dbUser.rol,
        },
        token: this.getJwtToken({ id: dbUser.id }),
        expiresIn: expirationTimeGMTMinus6.toISOString(),

      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async verificarPrimerInicioDeSesion(password: string, dbPassword: string) {
    try {
      if (password === defaultPassowrd) {
        if (bcrypt.compareSync(defaultPassowrd, dbPassword)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      };
    } catch (error) {
      handleExeptions(error);
    }

  }

  async reestablecer(userId: string) {
    try {
      const usuarioDb = await this.usuarioRepository.findOneBy({ id: userId });
      usuarioDb.password = bcrypt.hashSync(defaultPassowrd, 10);
      await this.usuarioRepository.save(usuarioDb);
      return { message: "Contraseña reestablecida" };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async removerPermisos(actualizarPermisosDto: ActualizarPermisosDto) {
    try {
      const { id, permisos } = actualizarPermisosDto;
      const usuarioDb = await this.usuarioRepository.findOneBy({ id: id });
      if (!usuarioDb) throw new NotFoundException('NO SE ENCUENTRA EL USUARIO');
      if (usuarioDb.estatus === false) throw new BadRequestException('EL USUARIO SE ENCUENTRA DESACTIVADO, ACTIVAR USUARIO');

      const permisosActualizados = usuarioDb.permisos.filter(
        (permiso) => !permisos.includes(permiso),
      );

      usuarioDb.permisos = permisosActualizados;
      await this.usuarioRepository.save(usuarioDb);
      return { message: 'PERMISOS REMOVIDOS EXITOSAMENTE' };

    } catch (error) {
      handleExeptions(error);
    }
  }

  async agregarPermisos(actualizarPermisosDto: ActualizarPermisosDto) {
    try {
      const { id, permisos } = actualizarPermisosDto;
      const usuarioDb = await this.findOne(id);

      if (!usuarioDb) throw new NotFoundException('USUARIO NO ENCONTRADO');
      if (!usuarioDb.estatus) throw new BadRequestException('EL USUARIO SE ENCUENTRA DESACTIVADO');

      const permisosActualizadosSet = new Set([...usuarioDb.permisos, ...permisos]);
      const permisosActualizados = Array.from(permisosActualizadosSet);

      usuarioDb.permisos = permisosActualizados;
      await this.usuarioRepository.save(usuarioDb);
      return { message: 'PERMISOS ACTUALIZADOS EXITOSAMENTE' };

    } catch (error) {
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
      if (!usuario) throw new NotFoundException('Usuario no encontrado');
      return { usuario: usuario.id, estatus: usuario.estatus };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async checkAuthStatus(usuario: Usuario) {
    return {
      usuario,
      token: this.getJwtToken({ id: usuario.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
