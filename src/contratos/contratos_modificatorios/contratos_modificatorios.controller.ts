import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';

@Controller('contratos-modificatorios')
export class ContratosModificatoriosController {
  constructor(private readonly contratosModificatoriosService: ContratosModificatoriosService) {}

  @Post()
  create(@Body() createContratosModificatorioDto: CreateContratoModificatorioDto) {
    return this.contratosModificatoriosService.create(createContratosModificatorioDto);
  }

  @Get()
  findAll(
    @Query('pagina') pagina:number
  ) {
    return this.contratosModificatoriosService.findAll(pagina);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.update(id, updateContratosModificatorioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.remove(id);
  }
}
