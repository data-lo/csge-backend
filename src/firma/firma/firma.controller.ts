import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseEnumPipe } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { EstatusDeFirma } from './interfaces/estatus-de-firma.enum';

@Controller('firma')
export class FirmaController {
  constructor(private readonly firmaService: FirmaService) {}

  @Post()
  create(@Body() createFirmaDto: CreateFirmaDto) {
    return this.firmaService.create(createFirmaDto);
  }


  @Get('firmar-documento/:documentoId/:usuarioId/:estatusFirma')
  firmarDocumento(
    @Param('documentoId') documentoId: string,
    @Param('usuarioId') usuarioId: string,
    @Param('estatusFirma', new ParseEnumPipe(EstatusDeFirma)) estatusFirma: EstatusDeFirma
  ) {
    return this.firmaService.firmarDocumento(usuarioId,documentoId,estatusFirma);
  }

  @Get('documentos-firmamex')
  findAllDocumentosFirmamex() {
    return this.firmaService.obtenerDocumentosDeFrimamex();
  }

  @Get('descargar-documento/:id')
  descargarDocumentoDeFirmamex(
    @Param('id',ParseUUIDPipe) id:string
  ) {
    return this.firmaService.descargarDocumentoFirmamex(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firmaService.findOne(+id);
  }

  @Get(':id')
  findAll(@Param('id',ParseUUIDPipe) usuarioId:string) {
    return this.firmaService.findAll(usuarioId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirmaDto: UpdateFirmaDto) {
    return this.firmaService.update(+id, updateFirmaDto);
  }

  @Delete('eliminar-de-firmamex:id')
  removeDocumentoFirmamex(@Param('id',ParseUUIDPipe) id: string) {
    return this.firmaService.eliminarDocumentoDeFimrmamex(id);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmaService.remove(+id);
  }


}
