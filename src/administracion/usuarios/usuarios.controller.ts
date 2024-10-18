import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('administracion/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  //Login
  @Post('login')
  login(@Body() login: LoginUserDto) {
    return this.usuariosService.login(login);
  }

  //actualizar contraseña
  @Post('update-password')
  updatePassword(@Body() updatePassword:UpdatePasswordDto) {
    return this.usuariosService.updatePassword(updatePassword);
  }

  @Get()
  findAll(
    @Query('pagina') pagina:string) {
    return this.usuariosService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.findOne(id);
  }

  //reestablecer contraseña
  @Get('/reestablecer/:id')
  reestablecer(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.reestablecer(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.usuariosService.deactivate(id);
  }
}
