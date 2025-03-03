import {
  Controller, Get, Post, Res,
  UseInterceptors,
  UploadedFile,
  Delete,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/helpers/fileFilter';
import { LoggerService } from 'src/logger/logger.service';
import { rolesImagen } from './valid-imagen-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { MinioService } from 'src/minio/minio.service';
import { handleExceptions } from 'src/helpers/handleExceptions.function';



@Controller('configuracion/imagen')
export class ImagenController {

  constructor(
    private minioService: MinioService,
  ) { }

  private readonly logger = new LoggerService(ImagenController.name);
  private LOGO_NAME = 'GOBIERNO_DEL_ESTADO_LOGO';

  @Get()
  async findImage() {
    try {
      const ruta = await this.minioService.obtenerImagen();
      if (ruta) {
        return ruta
      }
      return { url: 'url/no_imagen' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  @Auth(...rolesImagen)
  @Post()
  @UseInterceptors(FileInterceptor('imagen', {
    fileFilter: fileFilter,
  }))
  async uploadProductImage(
    @UploadedFile() imagen: Express.Multer.File,
  ) {
    if (!imagen) throw new NotFoundException('NO SE ENCUENTRA LA IMAGEN');
    const extension = imagen.originalname.split('.').pop().toLowerCase();
    await this.minioService.eliminarImagenAnterior();
    const minioFile = [{
      file: imagen,
      name: `${this.LOGO_NAME}.${extension}`
    }];
    await this.minioService.subirArchivosAMinio(minioFile);
    return { message: 'IMAGEN SUBIDA EXITOSAMENTE' };

  }

  @Auth(...rolesImagen)
  @Delete()
  async eliminarImagen() {
    await this.minioService.eliminarImagenAnterior();
    return { message: 'IMAGEN ELIMINADA EXITOSAMENTE' };
  }
}
