import {
  Controller, Get, Post, Res,
  UseInterceptors,
  UploadedFile,
  Delete,
  NotFoundException
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/helpers/fileFilter';
import { LoggerService } from 'src/logger/logger.service';
import { rolesImagen } from './valid-imagen-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { MinioService } from 'src/minio/minio.service';

@Controller('configuracion/imagen')
export class ImagenController {

  constructor(
    private minioService: MinioService,
  ) { }

  private readonly logger = new LoggerService(ImagenController.name);

  private LOGO_NAME = 'GOBIERNO_DEL_ESTADO_LOGO';

  @Auth(...rolesImagen)
  @Get()
  async findImage() {
    return await this.minioService.getImage();
  }

  @Auth(...rolesImagen)
  @Post() 
  @UseInterceptors(FileInterceptor('imagen', { fileFilter: fileFilter, }))
  async uploadLogo(@UploadedFile() imagen: Express.Multer.File,) {
    return await this.minioService.uploadImage(imagen);
  }
}
