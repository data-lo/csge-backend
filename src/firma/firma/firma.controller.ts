import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseEnumPipe } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesFirma } from './valid-firma-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';

@Controller('firma')
export class FirmaController {
  constructor(private readonly firmaService: FirmaService) {}
  private readonly logger = new LoggerService(FirmaController.name);

  @Auth(...rolesFirma)
  @Post()
  create(@Body() createFirmaDto: CreateFirmaDto) {
    return this.firmaService.create(createFirmaDto);
  }

  @Auth(...rolesFirma)
  @Get('firmar-documento/:documentoId')
  firmarDocumento(
    @Param('documentoId',ParseUUIDPipe) documentoId: string,
    @GetUser() usuario:Usuario
  ) {
    return this.firmaService.firmarDocumento(usuario.id,documentoId);
  }

  @Auth(...rolesFirma)
  @Get('documentos-firmamex')
  findAllDocumentosFirmamex() {
    return this.firmaService.obtenerDocumentosDeFrimamex();
  }

  @Auth(...rolesFirma)
  @Get('descargar-documento/:id')
  descargarDocumentoDeFirmamex(
    @Param('id',ParseUUIDPipe) id:string
  ) {
    return this.firmaService.descargarDocumentoFirmamex(id);
  }

  @Auth(...rolesFirma)
  @Get()
  findAll(
    @GetUser() usuario:Usuario
  ) {
    return this.firmaService.findAll(usuario.id);
  }

  @Auth(...rolesFirma)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirmaDto: UpdateFirmaDto) {
    return this.firmaService.update(+id, updateFirmaDto);
  }

  @Auth(...rolesFirma)
  @Delete('eliminar-de-firmamex/:id')
  removeDocumentoFirmamex(@Param('id',ParseUUIDPipe) id: string) {
    return this.firmaService.eliminarDocumentoDeFimrmamex(id);
  }

  @Auth(...rolesFirma)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmaService.remove(+id);
  }
}
