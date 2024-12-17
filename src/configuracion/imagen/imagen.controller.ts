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
import { LoggerService } from 'src/logger/logger.service';
import { rolesImagen } from './valid-imagen-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';


//@Auth(...rolesImagen)
@Controller('configuracion/imagen')
export class ImagenController {
  constructor(
    private readonly imagenService: ImagenService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new LoggerService(ImagenController.name);
  

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

  //@Auth(...rolesImagen)
  @Post()
  @UseInterceptors( FileInterceptor ('imagen',{
    fileFilter:fileFilter,
    storage: diskStorage({
      destination:'./static/uploads/imagen',
      filename:fileNamer
    }),
  }))
  async uploadProductImage(
    @UploadedFile() imagen:Express.Multer.File,
  ){
      if(!imagen){
        throw new BadRequestException('Formatos de Imágen Aceptadas: jpg, png, jpeg');
      }
      await this.imagenService.eliminarImagenExistente();
      const secureUrl = `${this.configService.get('HOST_API')}/files/imagenes/${imagen.filename}`
      return{secureUrl};  
  }

  @Delete()
  async eliminarImagen(){
    await this.imagenService.eliminarImagen();
  }
}
