import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.contratosModificatoriosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contratosModificatoriosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.update(+id, updateContratosModificatorioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contratosModificatoriosService.remove(+id);
  }
}
