import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as Minio from 'minio';
import { MinioFileI } from './interfaces/minio.file.interface';
import { handleExeptions } from 'src/helpers/handleExceptions.function';


@Injectable()
export class MinioService {
  
  minioClient: any;
  bucket: any;
  LOGO_NAME = 'GOBIERNO_DEL_ESTADO_LOGO';
  MINIO_HOST: any
  MINIO_PORT: any

  private setMinioClient() {
    if (!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
      throw new Error('LAS API KEYS DE MINIO SERVICE NO ESTAN CONFIGURADAS');
    }

    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_HOST,
      port: Number(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    
    if (!process.env.MINIO_BUCKET)
      throw new Error('NO SE ENCUETRA EL BUCKET DE MINIO');

    this.bucket = process.env.MINIO_BUCKET;
    this.MINIO_HOST = process.env.MINIO_HOST;
    this.MINIO_PORT = process.env.MINIO_PORT;
    return;
  }

  private getMinioClient() {
    if (!this.minioClient) {
      this.setMinioClient();
      return this.minioClient;
    }
    return this.minioClient;
  }

  async subirArchivosAMinio(files: MinioFileI[]) {
    try {
      const minioClient = this.getMinioClient();
      const bucket = this.bucket;
      const exists = await minioClient.bucketExists(bucket);

      if (!exists)
        throw new Error(
          'EL BUCKET DECLARADO EN LAS VARIABLES NO EXISTE, CREAR BUCKET',
        );

      for (const file of files) {
        await minioClient.putObject(
          bucket,
          file.name,
          file.file.buffer,
          function (err, etag) {
            return;
          },
        );
      }
      return { message: 'ARCHIVOS SUBIDOS EXITOSAMENTE' };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerArchivosDescarga(
    id: string,
    tipoArchivo: string,
  ): Promise<Buffer> {
    try {
      if (tipoArchivo !== 'xml' && tipoArchivo !== 'pdf') {
        throw new BadRequestException('Archivo no admitido');
      }
      const minioClient = this.getMinioClient();
      const bucket = this.bucket;
      const exists = await minioClient.bucketExists(bucket);

      if (!exists) {
        throw new Error('EL BUCKET DECLARADO EN LAS VARIABLES NO EXISTE');
      }

      const rutaCompleta = `${tipoArchivo}/${id}.${tipoArchivo}`;

      try {
        await minioClient.statObject(bucket, rutaCompleta);
      } catch (error) {
        throw new BadRequestException(
          'No se encontró el archivo en el servidor',
        );
      }

      const dataStream = await minioClient.getObject(bucket, rutaCompleta);

      return new Promise((resolve, reject) => {
        const chunks: any[] = [];

        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', (error) => reject(error));
      });
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerImagen() {
    try {
      const extensionesValidas = ['jpg', 'jpeg', 'png'];
      const minioClient = this.getMinioClient();
      const minioHost = this.MINIO_HOST;
      const minioPort = this.MINIO_PORT;
      const bucket = this.bucket;

      const exists = await minioClient.bucketExists(bucket);

      if (!exists) {
        throw new NotFoundException('NO SE ENCONTRO EL BUCKET');
      }
      let file: string | null = null;
      let rutaCompleta = null;
      let extension = null;

      for (const ext of extensionesValidas) {
        const rutaRelativa = `${this.LOGO_NAME}.${ext}`;
        try {
          await minioClient.statObject(bucket, rutaRelativa);
          file = rutaRelativa;
          extension = ext;
          rutaCompleta = `http://${minioHost}:${minioPort}/${bucket}/${this.LOGO_NAME}.${extension}`;
          break;
        } catch (error) {
          continue;
        }
      }
      if (!rutaCompleta) {
        throw new NotFoundException('NO SE ENCONTRO LA IMAGEN');
      }
      return rutaCompleta;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async eliminarImagenAnterior(): Promise<void> {
    try {
      const extensionesValidas = ['jpg', 'jpeg', 'png'];
      const minioClient = this.getMinioClient();
      const bucket = this.bucket;

      for (const ext of extensionesValidas) {
        try {
          const rutaCompleta = `${this.LOGO_NAME}.${ext}`;
          await minioClient.removeObject(bucket, rutaCompleta);
        } catch (error) {
          if (error.code !== 'NotFound') {
            throw error;
          }
        }
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async eliminarArchivos(id) {
    return { message: 'ARCHIVOS ELIMINADOS EXITOSAMENTE', value: true };
  }
}
