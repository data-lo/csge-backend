import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesAdministraccion } from '../valid-modules-roles.ob';

@Controller('administracion/puestos')
export class PuestosController {
  constructor(private readonly puestosService: PuestosService) {}

  private readonly logger = new LoggerService(PuestosController.name);

  @Auth(...rolesAdministraccion)
  @Post()
  create(@Body() createPuestoDto: CreatePuestoDto) {
    this.logger.log('crear puesto');
    return this.puestosService.create(createPuestoDto);
  }

  @Get()
  @Auth(...rolesAdministraccion)
  findAll() {
    this.logger.log('obtener puestos');
    return this.puestosService.findAll();
  }

  @Get(':id')
  @Auth(...rolesAdministraccion)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('obtener puesto');
    return this.puestosService.findOne(id);
  }

  @Patch(':id')
  @Auth(...rolesAdministraccion)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePuestoDto: UpdatePuestoDto,
  ) {
    this.logger.log('modificar puesto');
    return this.puestosService.update(id, updatePuestoDto);
  }

  @Delete(':id')
  @Auth(...rolesAdministraccion)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('eliminar puesto por');
    return this.puestosService.remove(id);
  }
}
