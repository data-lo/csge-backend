import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { CreateLongitudDto } from './dto/create-longitud.dto';
import { UpdateLongitudDto } from './dto/update-longitud.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesImpresiones } from '../impresiones/valid-impresiones-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('catalogos/longitudes')
export class LongitudesController {
  constructor(private readonly longitudesService: LongitudesService) {}
  private readonly logger = new LoggerService(LongitudesController.name);

  //@Auth(...rolesImpresiones)
  @Post()
  create(@Body() createLongitudeDto: CreateLongitudDto) {
    return this.longitudesService.create(createLongitudeDto);
  }

  //@Auth(...rolesImpresiones)
  @Get()
  findAll() {
    return this.longitudesService.findAll();
  }

  //@Auth(...rolesImpresiones)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.longitudesService.findOne(id);
  }

  //@Auth(...rolesImpresiones)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateLongitudeDto: UpdateLongitudDto) {
    return this.longitudesService.update(id, updateLongitudeDto);
  }

  //@Auth(...rolesImpresiones)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.longitudesService.remove(id);
  }
}
