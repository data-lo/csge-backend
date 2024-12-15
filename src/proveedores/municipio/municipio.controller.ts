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
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesMunicipios } from './valid-estaciones-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('proveedores/municipios')
export class MunicipioController {
  constructor(private readonly municipioService: MunicipioService) { }
  private readonly logger = new LoggerService(MunicipioController.name);

  //@Auth(...rolesMunicipios)
  @Post()
  create(@Body() createMunicipioDto: CreateMunicipioDto) {
    return this.municipioService.create(createMunicipioDto);
  }

  //@Auth(...rolesMunicipios)
  @Get()
  findAll() {
    return this.municipioService.findAll();
  }

  //@Auth(...rolesMunicipios)
  @Get('estatal')
  findEstatal() {
    return this.municipioService.findEstatal();
  }

  //@Auth(...rolesMunicipios)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.municipioService.findOne(id);
  }

  //@Auth(...rolesMunicipios)
  @Get('es-frontera/:id')
  esFrontera(@Param('id', ParseUUIDPipe) id: string) {
    return this.municipioService.esFrontera(id);
  }

  //@Auth(...rolesMunicipios)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMunicipioDto: UpdateMunicipioDto,
  ) {
    return this.municipioService.update(id, updateMunicipioDto);
  }

  //@Auth(...rolesMunicipios)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.municipioService.remove(id);
  }
}
