import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesTiempos } from './valid-tiempos-roles.ob';

@Controller('catalogos/tiempos')
export class TiemposController {
  
  constructor(private readonly tiemposService: TiemposService) {}
  private readonly logger = new LoggerService(TiemposController.name);

  //@Auth(...rolesTiempos)
  @Post()
  create(@Body() createTiempoDto: CreateTiempoDto) {
    return this.tiemposService.create(createTiempoDto);
  }

  //@Auth(...rolesTiempos)
  @Get()
  findAll() {
    return this.tiemposService.findAll();
  }

  //@Auth(...rolesTiempos)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.tiemposService.findOne(id);
  }

  //@Auth(...rolesTiempos)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateTiempoDto: UpdateTiempoDto) {
    return this.tiemposService.update(id, updateTiempoDto);
  }

  //@Auth(...rolesTiempos)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.tiemposService.remove(id);
  }
}
