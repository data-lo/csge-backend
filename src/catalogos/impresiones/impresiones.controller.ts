import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesImpresiones } from './valid-impresiones-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('catalogos/impresiones')
export class ImpresionesController {
  constructor(private readonly impresionesService: ImpresionesService) {}
  private readonly logger = new LoggerService(ImpresionesController.name);

  @Auth(...rolesImpresiones)
  @Post()
  create(@Body() createImpresioneDto: CreateImpresionDto) {
    return this.impresionesService.create(createImpresioneDto);
  }

  @Auth(...rolesImpresiones)
  @Get()
  findAll() {
    return this.impresionesService.findAll();
  }

  @Auth(...rolesImpresiones)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id:string) {
    return this.impresionesService.findOne(id);
  }

  @Auth(...rolesImpresiones)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id:string, @Body() updateImpresioneDto: UpdateImpresionDto) {
    return this.impresionesService.update(id, updateImpresioneDto);
  }

  @Auth(...rolesImpresiones)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id:string) {
    return this.impresionesService.remove(id);
  }
}
