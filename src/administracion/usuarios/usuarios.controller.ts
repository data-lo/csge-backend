import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ActualizarPermisosDto } from './dto/actualizar-permisos.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from './interfaces/usuarios.roles';

@Controller('administracion/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  //crear usuario
  @Post()
  @Auth(ValidRoles.SUPERADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  //inicio de sesion
  @Post('login')
  login(@Body() login: LoginUserDto) {
    return this.usuariosService.login(login);
  }

  //actualizar contraseña
  @Post('update-password')
  updatePassword(@Body() updatePassword:UpdatePasswordDto) {
    return this.usuariosService.updatePassword(updatePassword);
  }

  //remover permisos
  @Post('remover-permisos')
  removerPermisos(@Body() actualizarPermisosDto:ActualizarPermisosDto) {
    return this.usuariosService.removerPermisos(actualizarPermisosDto);
  }

  //agregar permisos
  @Post('agregar-permisos')
  agregarPermisos(@Body() actualizarPermisosDto:ActualizarPermisosDto) {
    return this.usuariosService.agregarPermisos(actualizarPermisosDto);
  }

  //obtener todos los usuarios
  @Get()
  findAll(
    @Query('pagina') pagina:string) {
    return this.usuariosService.findAll(+pagina);
  }

  //obtener un usuario
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  //reestablecer contraseña
  @Get('/reestablecer/:id')
  reestablecer(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.reestablecer(id);
  }

  //obtener el estatus de un usuario
  @Get('/obtener-estatus/:id')
  obtenerEstatus(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.obtenerEstatus(id);
  }

  //actualizar un usuario
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  //desactivar un usuario
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.deactivate(id);
  }
}
