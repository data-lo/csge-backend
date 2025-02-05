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
import { handleExeptions } from 'src/helpers/handleExceptions.function';


@Auth(...rolesImagen)
@Controller('configuracion/imagen')
export class ImagenController {
  constructor(
    private minioService: MinioService,
  ) { }

  private readonly logger = new LoggerService(ImagenController.name);
  private LOGO_NAME = 'GOBIERNO_DEL_ESTADO_LOGO';
  @Get()
  async findImage(
    @Res() res: Response,
  ) {
    try {
      const { buffer, contentType } = await this.minioService.obtenerImagen(this.LOGO_NAME);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    } catch (error) {
      handleExeptions(error);
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
    await this.minioService.eliminarImagenAnterior(this.LOGO_NAME);
    const minioFile = [{
      file: imagen,
      name: `${this.LOGO_NAME}.${extension}`
    }];
    await this.minioService.subirArchivosAMinio(minioFile);
    return { message: 'IMAGEN SUBIDA EXITOSAMENTE' };
  }

  @Delete()
  async eliminarImagen() {
    await this.minioService.eliminarImagenAnterior(this.LOGO_NAME);
    return { message: 'IMAGEN ELIMINADA EXITOSAMENTE' };
  }
}
