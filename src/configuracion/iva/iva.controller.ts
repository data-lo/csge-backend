import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { IvaService } from './iva.service';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesIva } from './valid-iva-roles.ob';

@Controller('configuracion/iva')
export class IvaController {
  constructor(private readonly ivaService: IvaService) {}
  private readonly logger = new LoggerService(IvaController.name);

  @Auth(...rolesIva)
  @Post()
  create(@Body() createIvaDto: CreateIvaDto) {
    return this.ivaService.create(createIvaDto);
  }

  @Auth(...rolesIva)
  @Get('nacional')
  findIvaNacional() {
    return this.ivaService.obtenerIvaNacional();
  }

  @Auth(...rolesIva)
  @Get('frontera')
  findIvaFrontera() {
    return this.ivaService.obtenerIvaFrontera();
  }

  @Auth(...rolesIva)
  @Get()
  findAll() {
    return this.ivaService.findAll();
  }

  @Auth(...rolesIva)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.ivaService.findOne(id);
  }

  @Auth(...rolesIva)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateIvaDto: UpdateIvaDto) {
    return this.ivaService.update(id, updateIvaDto);
  }
}

