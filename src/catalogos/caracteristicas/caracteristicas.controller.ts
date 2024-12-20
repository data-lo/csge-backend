import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CaracteristicasService } from './caracteristicas.service';
import { CreateCaracteristicaDto } from './dto/create-caracteristica.dto';
import { UpdateCaracteristicaDto } from './dto/update-caracteristica.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesCaracteristicas } from './valid-modules-caracterisitcas-roles.ob';

@Auth(...rolesCaracteristicas)
@Controller('catalogos/caracteristicas')
export class CaracteristicasController {
  constructor(private readonly caracteristicasService: CaracteristicasService) {}

  @Post()
  create(@Body() createCaracteristicaDto: CreateCaracteristicaDto) {
    return this.caracteristicasService.create(createCaracteristicaDto);
  }

  @Get()
  findAll() {
    return this.caracteristicasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.caracteristicasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCaracteristicaDto: UpdateCaracteristicaDto) {
    return this.caracteristicasService.update(id, updateCaracteristicaDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.caracteristicasService.remove(id);
  }
}
