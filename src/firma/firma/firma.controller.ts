import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseEnumPipe, Query } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesFirma } from './valid-firma-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { SIGNATURE_ACTION_ENUM } from './enums/signature-action-enum';

@Controller('firma')
export class FirmaController {
  constructor(private readonly signatureService: FirmaService) { }
  private readonly logger = new LoggerService(FirmaController.name);

  @Auth(...rolesFirma)
  @Post()
  create(@Body() createFirmaDto: CreateFirmaDto) {
    return this.signatureService.create(createFirmaDto);
  }

  @Get('sign-document/:documentId')
  signDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('signatureAction') signatureAction: SIGNATURE_ACTION_ENUM,
    @GetUser() user: Usuario
  ) {
    return this.signatureService.documentSigning(user.id, documentId);
  }
  
  

  // @Auth(...rolesFirma)
  // @Get('firmar-campania/:campaniaId')
  // firmarCampania(
  //   @Param('campaniaId', ParseUUIDPipe) campaniaId: string,
  //   @GetUser() usuario: Usuario
  // ) {
  //   return this.signatureService.firmarCampania(usuario.id, campaniaId);
  // }

  @Auth(...rolesFirma)
  @Get('documentos-firmamex')
  findAllDocumentosFirmamex() {
    return this.signatureService.obtenerDocumentosDeFrimamex();
  }

  @Auth(...rolesFirma)
  @Get('verify-sent-for-signing/:id')
  verifyIfOrderOrInvoiceWasSentForSigning(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.signatureService.checkDocumentSentForSigning(id);
  }

  @Auth(...rolesFirma)
  @Get('descargar-documento/:id')
  descargarDocumentoDeFirmamex(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Query('tipo-de-documento', new ParseEnumPipe(TIPO_DE_DOCUMENTO)) tipoDeDocumento: TIPO_DE_DOCUMENTO
  ) {
    return this.signatureService.downloadFile(documentId, tipoDeDocumento);
  }

  @Auth(...rolesFirma)
  @Get('ordenes')
  findAllOrdebes(
    @GetUser() usuario: Usuario
  ) {
    return this.signatureService.findAllOrdenes(usuario.id);
  }

  @Auth(...rolesFirma)
  @Get('facturas')
  findAllInvoices(@GetUser() user: Usuario) {
    return this.signatureService.getPendingSignatureDocuments(user.id);
  }

  @Auth(...rolesFirma)
  @Get('campanias')
  findAllCampanias(
    @GetUser() usuario: Usuario
  ) {
    return this.signatureService.findAllCampanias(usuario.id);
  }


  @Auth(...rolesFirma)
  @Delete('eliminar-de-firmamex/:id')
  removeDocumentoFirmamex(@Param('id', ParseUUIDPipe) id: string) {
    return this.signatureService.eliminarDocumentoDeFimrmamex(id);
  }

}