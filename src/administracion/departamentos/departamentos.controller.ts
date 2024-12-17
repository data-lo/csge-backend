import { Controller, Get, Post, Body, Patch, 
         Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from '../usuarios/interfaces/usuarios.roles';
import { rolesAdministraccion } from '../valid-administracion-roles.ob';

//@Auth(...rolesAdministraccion)
@Controller('administracion/departamentos')
export class DepartamentosController {
  
  constructor(
    private readonly departamentosService: DepartamentosService,
  ) {}
  private readonly logger = new LoggerService(DepartamentosController.name);
  @Post()
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    this.logger.log('Crear departamento');
    return this.departamentosService.create(createDepartamentoDto);
  }

  @Get()
  findAll(){
    this.logger.log('Obtener departamentos');
    return this.departamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    this.logger.log('Otener departamento por Id');
    return this.departamentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateDepartamentoDto: UpdateDepartamentoDto) {
    this.logger.log('Actualizar departamento');
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    this.logger.log('Eliminar departamento');
    return this.departamentosService.remove(id);
  }
}
