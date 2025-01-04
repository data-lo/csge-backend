import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { fileFilter } from 'src/helpers/fileFilter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';
import { rolesFactura } from './valid-facturas-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { randomUUID } from 'crypto';
import { MinioService } from 'src/minio/minio.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';

@Controller('ordenes/facturas')
export class FacturaController {
  constructor(
    private readonly facturaService: FacturaService,
    private readonly minioService: MinioService
  ) {}
  
  private readonly logger = new LoggerService(FacturaController.name);

  @Auth(...rolesFactura)
  @Post()
  @UseInterceptors(
    FilesInterceptor('archivosFactura', 2, {
      fileFilter: fileFilter,
    }),
  )
  async create(
    @UploadedFiles() archivosFactura: Express.Multer.File[],
    @Body() createFacturaDto: CreateFacturaDto,
    @GetUser() usuario:Usuario
  ) {

    const pdfFile = archivosFactura.find(
      (file) => file.mimetype === 'application/pdf',
    );
    const xmlFile = archivosFactura.find(
      (file) => file.mimetype === 'application/xml',
    );

    const uuid = randomUUID();
    const minioFiles = [
      {
        name:`pdf/${uuid}.pdf`,
        file:pdfFile.buffer
      },
      {
        name:`xml/${uuid}.xml`,
        file:xmlFile.buffer
      }
    ]
    try{
      await this.minioService.subirArchivosAMinio(minioFiles);
    }catch(error){
      this.logger.error('ERROR EN ARCHIVOS DE MINIO', error);
      handleExeptions(error);
    }

    createFacturaDto.id = uuid;
    console.log(createFacturaDto);
    return this.facturaService.create(createFacturaDto,usuario);
  }

  @Auth(...rolesFactura) 
  @Post('cotejar/:id')
  cotrejarFactura(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() usuario:Usuario
  )
    {
      return this.facturaService.cotejarFactura(id,usuario);
  } 

  @Auth(...rolesFactura)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.facturaService.findAll(+pagina);
  }

  @Auth(...rolesFactura)
  @Get('busqueda')
  findAllBusqueda() {
    return this.facturaService.findAllBusqueda();
  }

  @Auth(...rolesFactura)
  @Get('estatus/:id')
  findOneEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.facturaService.obtenerEstatusDeFactura(id);
  }

  @Auth(...rolesFactura)
  @Get('pdf/:id')
  async obtenerDocumentoEnPdf(
    @Res() res: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const pdfDoc = await this.facturaService.obtenerDocumentoDeFacturaPdf(id);
    if(pdfDoc.tipo = 'url'){
      res.send(pdfDoc.url);
    }else{
      res.setHeader('Content-Type', 'application/pdf');
      pdfDoc.pipe(res);
      pdfDoc.end();
    }
  }

  @Auth(...rolesFactura)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facturaService.findOne(id);
  }

  @Get('descargar/:id')
  async descargarArchivo(
    @Param('id') id: string,
    @Query('tipo') tipoArchivo: string,
    @Res() res: Response
  ){
    const buffer = await this.minioService.obtenerArchivosDescarga(id,tipoArchivo);
    const contentType = tipoArchivo === 'xml' ? 'application/xml' : 'application/pdf';  
    res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${id}.${tipoArchivo}"`
    });
    
    res.send(buffer);
  }

  @Auth(...rolesFactura)
  @Patch(':id')
  cancelarFactura(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturaService.cancelarFactura(id, updateFacturaDto);
  }


}
