import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, InternalServerErrorException, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { fileFilter } from 'src/helpers/fileFilter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from 'src/helpers/fileNamer';
import { Response } from 'express';

@Controller('ordenes/facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}


  @Post()
  @UseInterceptors( 
    FilesInterceptor('archivosFactura',2,{
      fileFilter:fileFilter,
      storage:diskStorage({
        destination:(req,file,callback) => {
          const isPdf = file.mimetype === 'application/pdf';
          const folder = isPdf ? './static/uploads/pdf':'./static/uploads/xml';
          callback(null, folder);
        },
        filename:fileNamer,
      }),
    })
  )
  async create(
    @UploadedFiles() archivosFactura: Express.Multer.File[],
    @Body( ) createFacturaDto: CreateFacturaDto,
    ){
      
      const uuid = archivosFactura[0].filename.split('.')[0];
      
      if(!uuid) throw new InternalServerErrorException('No se logro generar el UUID para los archivos');
      
      const pdfFile = archivosFactura.find((file)=> file.mimetype === 'application/pdf');
      const xmlFile = archivosFactura.find((file)=> file.mimetype === 'application/xml');
      
      if(!pdfFile || !xmlFile){
        throw new BadRequestException('Ambos archivos (XML Y PDF) son requeridos');
      } 
      
      createFacturaDto.id = uuid;
      createFacturaDto.xml = xmlFile.path;
      createFacturaDto.pdf = pdfFile.path;
      return this.facturaService.create(createFacturaDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string){
    return this.facturaService.findAll(+pagina);
  }

  @Get('busqueda')
  findAllBusqueda(){
    return this.facturaService.findAllBusqueda();
  }

  @Get('estatus/:id')
  findOneEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.facturaService.obtenerEstatusDeFactura(id);
  }
  
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facturaService.findOne(id);
  }

  @Get('descargar/:id/:type')
  async descargarArchivo(
    @Param( ) params,
    @Res() res:Response
  ){
    const id = params.id;
    const tipoArchivo = params.type;  
    const path = await this.facturaService.obtenerArchivosDescarga(id,tipoArchivo);
      if(path === null){
        res.send({message:null});
      }else{
        res.sendFile(path);
      }
  }

  @Patch(':id')
  cancelarFactura(@Param('id',ParseUUIDPipe) id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.cancelarFactura(id, updateFacturaDto);
  }

}
