import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Logger } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesDimensiones } from './valid-modules-dimensiones-roles.ob';
import { LoggerService } from 'src/logger/logger.service';

@Controller('catalogos/dimensiones')
export class DimensionesController {
  constructor(private readonly dimensionesService: DimensionesService) {}
  private readonly logger = new LoggerService(DimensionesController.name);

  //@Auth(...rolesDimensiones)
  @Post()
  create(@Body() createDimensionDto: CreateDimensionDto) {
    this.logger.log('Crear Dimension');
    return this.dimensionesService.create(createDimensionDto);
  }

  //@Auth(...rolesDimensiones)
  @Get()
  findAll() {
    return this.dimensionesService.findAll();
  }

  //@Auth(...rolesDimensiones)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dimensionesService.findOne(id);
  }

  //@Auth(...rolesDimensiones)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id:string, @Body() updateDimensionDto: UpdateDimensionDto) {
    return this.dimensionesService.update(id, updateDimensionDto);
  }

  //@Auth(...rolesDimensiones)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.dimensionesService.remove(id);
  }
}
