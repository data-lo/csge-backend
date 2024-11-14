import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { fileFilter } from 'src/helpers/fileFilter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from 'src/helpers/fileNamer';

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
  create(
    @UploadedFiles() archivosFactura: Express.Multer.File[],
    @Body() createFacturaDto: CreateFacturaDto
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
  findAll() {
    return this.facturaService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturaService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.update(+id, updateFacturaDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturaService.remove(+id);
  }

}
