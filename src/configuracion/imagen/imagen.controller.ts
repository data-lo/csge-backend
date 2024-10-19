import { Controller, Get, Post, Res, 
         UseInterceptors,
         UploadedFile,
         BadRequestException,
         Delete} from '@nestjs/common';
import { ImagenService } from './imagen.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from 'src/helpers/fileFilter';
import { fileNamer } from 'src/helpers/fileNamer';

@Controller('configuracion/imagen')
export class ImagenController {
  constructor(
    private readonly imagenService: ImagenService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  findImage(
    @Res() res:Response,
  ){
      const path = this.imagenService.getImagen();
      if(path === null){
        res.send({message:null});
      }else{
        res.sendFile(path);
      }
  }

  @Post()
  @UseInterceptors( FileInterceptor('imagen',{
    fileFilter:fileFilter,
    storage: diskStorage({
      destination:'./static/uploads/imagen',
      filename:fileNamer
    }),
  }))
  async uploadProductImage(
    @UploadedFile() file:Express.Multer.File,
  ){
      if(!file){
        throw new BadRequestException('Formatos de Imágen Aceptadas: jpg, png, jpeg');
      }
        await this.imagenService.eliminarImagenExistente();
        const secureUrl = `${this.configService.get('HOST_API')}/files/imagenes/${file.filename}`
        return{secureUrl};  
  }

  @Delete()
  async eliminarImagen(){
    await this.imagenService.eliminarImagen();
  }
}
