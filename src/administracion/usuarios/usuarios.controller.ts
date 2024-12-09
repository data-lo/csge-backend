import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ActualizarPermisosDto } from './dto/actualizar-permisos.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from './interfaces/usuarios.roles';
import { rolesAdministraccion } from '../valid-administracion-roles.ob';
import { LoggerService } from 'src/logger/logger.service';


@Controller('administracion/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }
  private readonly logger = new LoggerService(UsuariosController.name);

  @Auth(...rolesAdministraccion)
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    this.logger.log('Crear Usuario');
    return this.usuariosService.create(createUsuarioDto);
  }

  //inicio de sesion
  @Post('login')
  login(@Body() login: LoginUserDto) {
    this.logger.log('Login');
    return this.usuariosService.login(login);
  }

  //actualizar contraseña
  @Post('update-password')
  updatePassword(@Body() updatePassword: UpdatePasswordDto) {
    this.logger.log('Contraseña Actualizada');
    return this.usuariosService.updatePassword(updatePassword);
  }

  //remover permisos
  @Auth(...rolesAdministraccion)
  @Post('remover-permisos')
  removerPermisos(@Body() actualizarPermisosDto: ActualizarPermisosDto) {
    this.logger.log('remover permisos');
    return this.usuariosService.removerPermisos(actualizarPermisosDto);
  }

  //agregar permisos
  @Auth(...rolesAdministraccion)
  @Post('agregar-permisos')
  agregarPermisos(@Body() actualizarPermisosDto: ActualizarPermisosDto) {
    this.logger.log('Agregar permisos');
    return this.usuariosService.agregarPermisos(actualizarPermisosDto);
  }

  //obtener todos los usuarios
  @Get()
  findAll(
    @Query('pagina') pagina: string) {
      this.logger.log('Obtener Usuarios');
      return this.usuariosService.findAll(+pagina);
  }

  @Auth(...rolesAdministraccion)
  @Get('busqueda')
  findAllBusqueda() {
    this.logger.log('Obtener todos los usuarios');
    return this.usuariosService.findAllBusqueda();
  }

  //obtener un usuario
  @Auth(...rolesAdministraccion)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('Obtener un usuario');
    return this.usuariosService.findOne(id);
  }

  //reestablecer contraseña
  //@Auth(...rolesAdministracion)
  @Get('/reestablecer/:id')
  reestablecer(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('Reestablecer contraseña');
    return this.usuariosService.reestablecer(id);
  }

  //obtener el estatus de un usuario
  @Auth(...rolesAdministraccion)
  @Get('/obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('Obtener estatus de usuario');
    return this.usuariosService.obtenerEstatus(id);
  }

  //actualizar un usuario
  @Auth(...rolesAdministraccion)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    this.logger.log('Actualizar Usuario');
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  //desactivar un usuario
  @Auth(...rolesAdministraccion)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('Desactivar Usuario');
    return this.usuariosService.deactivate(id);
  }
}
