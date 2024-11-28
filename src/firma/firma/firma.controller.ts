import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';

@Controller('firma')
export class FirmaController {
  constructor(private readonly firmaService: FirmaService) {}

  @Post()
  create(@Body() createFirmaDto: CreateFirmaDto) {
    return this.firmaService.create(createFirmaDto);
  }

  @Get(':id')
  findAll(@Param('id',ParseUUIDPipe) usuarioId:string) {
    return this.firmaService.findAll(usuarioId);
  }

  @Get('firmar-documento/:documentoId/:usuarioId/:estatusFirma')
  firmarDocumento(
    @Param() params:{documentoId,usuarioId,estatusFirma}
  ) {
    const {documentoId,usuarioId,estatusFirma} = params;
    return this.firmaService.firmarDocumento(usuarioId,documentoId,estatusFirma);
  }

  @Get('documentos-firmamex')
  findAllDocumentosFirmamex() {
    return this.firmaService.obtenerDocumentosDeFrimamex();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firmaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirmaDto: UpdateFirmaDto) {
    return this.firmaService.update(+id, updateFirmaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmaService.remove(+id);
  }

  @Delete('eliminar-de-firmamex:id')
  removeDocumentoFirmamex(@Param('id') id: string) {
    return this.firmaService.eliminarDocumentoDeFimrmamex(id);
  }
}
