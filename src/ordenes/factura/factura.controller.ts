import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  InternalServerErrorException,
  Query,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { fileFilter } from 'src/helpers/fileFilter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from 'src/helpers/fileNamer';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';
import { rolesFactura } from './valid-facturas-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';

@Controller('ordenes/facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}
  private readonly logger = new LoggerService(FacturaController.name);

  @Auth(...rolesFactura)
  @Post()
  @UseInterceptors(
    FilesInterceptor('archivosFactura', 2, {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: (req, file, callback) => {
          const isPdf = file.mimetype === 'application/pdf';
          const folder = isPdf
            ? './static/uploads/pdf'
            : './static/uploads/xml';
          callback(null, folder);
        },
        filename: fileNamer,
      }),
    }),
  )
  async create(
    @UploadedFiles() archivosFactura: Express.Multer.File[],
    @Body() createFacturaDto: CreateFacturaDto,
    @GetUser() usuario:Usuario
  ) {
    const uuid = archivosFactura[0].filename.split('.')[0];

    if (!uuid)
      throw new InternalServerErrorException(
        'No se logro generar el UUID para los archivos',
      );

    const pdfFile = archivosFactura.find(
      (file) => file.mimetype === 'application/pdf',
    );
    const xmlFile = archivosFactura.find(
      (file) => file.mimetype === 'application/xml',
    );

    if (!pdfFile || !xmlFile) {
      throw new BadRequestException(
        'Ambos archivos (XML Y PDF) son requeridos',
      );
    }

    createFacturaDto.id = uuid;
    createFacturaDto.xml = xmlFile.path;
    createFacturaDto.pdf = pdfFile.path;
    return this.facturaService.create(createFacturaDto,usuario);
  }

  @Auth(...rolesFactura) 
  @Post('mandar-aprobar/:id')
  aprobarFactura(
    @Param('id',ParseUUIDPipe) id: string,
  )
    {
      return this.facturaService.mandarFacturaAFirmar(id);
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
    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Auth(...rolesFactura)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facturaService.findOne(id);
  }

  @Auth(...rolesFactura)
  @Get('descargar/:id/:type')
  async descargarArchivo(@Param() params, @Res() res: Response) {
    const id = params.id;
    const tipoArchivo = params.type;
    const path = await this.facturaService.obtenerArchivosDescarga(
      id,
      tipoArchivo,
    );
    if (path === null) {
      res.send({ message: null });
    } else {
      res.sendFile(path);
    }
  }

  @Auth(...rolesFactura)
  @Patch(':id')
  cancelarFactura(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFacturaDto: UpdateFacturaDto,
  ) {
    return this.facturaService.cancelarFactura(id, updateFacturaDto);
  }


  //COTEJAR FACTURA MEDIANTE FIRMA, BAJO LA LOGICA DE 2 FIRMAS MEDIANTE FIRMAMEX
  //@Auth(...rolesFactura)
  //@Post('cotejar/:id')
  //async aprobarFactura(
  //  @Param('id',ParseUUIDPipe) facturaId: string,
  //  @GetUser() usuario:Usuario
  //){
  //  return await this.facturaService.cotejarFactura(usuario,facturaId);
  //}


}
