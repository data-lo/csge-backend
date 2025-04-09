import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as Minio from 'minio';
import { MinioFileI } from './interfaces/minio.file.interface';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { FILE_STATUS } from './enums/file-status-enum';


@Injectable()
export class MinioService {

  minioClient: any;
  INVOICE_BUCKET: any;
  LOGO_BUCKET: any
  LOGO_NAME = 'GOBIERNO_DEL_ESTADO_LOGO';
  MINIO_HOST: any
  MINIO_PORT: any
  MINIO_API: any

  private setMinioClient() {

    if (!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
      throw new Error('¡Las API keys del servicio de MinIO no están configuradas!');
    }

    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_HOST,
      port: Number(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });

    if (!process.env.MINIO_BUCKET_INVOICES || !process.env.MINIO_BUCKET_LOGOS) {
      throw new Error('¡Los buckets de MinIO no están definidos en las variables de entorno!');
    }

    this.INVOICE_BUCKET = process.env.MINIO_BUCKET_INVOICES;

    this.LOGO_BUCKET = process.env.MINIO_BUCKET_LOGOS;

    this.MINIO_HOST = process.env.MINIO_HOST;

    this.MINIO_PORT = process.env.MINIO_PORT;

    this.MINIO_API = process.env.MINIO_API;

    console.log(process.env.MINIO_API)

    return;
  }

  private getBucketByType(type: 'invoices' | 'logos') {
    switch (type) {
      case 'invoices':
        return this.INVOICE_BUCKET;
      case 'logos':
        return this.LOGO_BUCKET;
      default:
        throw new Error('¡El tipo de bucket proporcionado no es válido!');
    }
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

      const bucket = this.getBucketByType('logos');

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
      handleExceptions(error);
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
      const bucket = this.INVOICE_BUCKET;
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
      handleExceptions(error);
    }
  }

  // async getImage(): Promise<{ status: FILE_STATUS; url: string }> {
  //   try {
  //     const minioClient = this.getMinioClient();

  //     const bucket = this.LOGO_BUCKET;

  //     const bucketExists = await minioClient.bucketExists(bucket);
  //     if (!bucketExists) {
  //       throw new NotFoundException('¡No se encontró el bucket de logos!');
  //     }

  //     const objectsStream = minioClient.listObjectsV2(bucket, '', true);

  //     return new Promise((resolve, reject) => {
  //       let found = false;

  //       objectsStream.on('data', (object) => {
  //         if (!found) {
  //           found = true;
  //           const url = `${this.MINIO_API}/${bucket}/${object.name}`;
  //           resolve({ status: FILE_STATUS.FILE_FOUND, url });
  //         }
  //       });

  //       objectsStream.on('end', () => {
  //         if (!found) {
  //           resolve({ status: FILE_STATUS.FILE_NOT_FOUND, url: '' });
  //         }
  //       });

  //       objectsStream.on('error', (error) => {
  //         reject(error);
  //       });
  //     });
  //   } catch (error) {
  //     handleExceptions(error);
  //   }
  // }

  async getImage(): Promise<{ status: FILE_STATUS; url: string }> {
    try {
      const minioClient = this.getMinioClient();
      const bucket = this.LOGO_BUCKET;

      const bucketExists = await minioClient.bucketExists(bucket);
      if (!bucketExists) {
        throw new NotFoundException('¡No se encontró el bucket de logos!');
      }

      const extensions = ['jpg', 'jpeg', 'png'];

      for (const ext of extensions) {
        const fileName = `${this.LOGO_NAME}.${ext}`;

        try {
          await minioClient.statObject(bucket, fileName);

          const signedUrl = await minioClient.presignedGetObject(bucket, fileName, 600);

          return { status: FILE_STATUS.FILE_FOUND, url: signedUrl };
        } catch (err) {
          continue;
        }
      }

      return { status: FILE_STATUS.FILE_NOT_FOUND, url: '' };
    } catch (error) {
      handleExceptions(error);
    }
  }



  // async uploadLogo(file: Express.Multer.File): Promise<{ message: string }> {
  //   try {
  //     const minioClient = this.getMinioClient();

  //     const bucket = this.LOGO_BUCKET;

  //     // 1. Eliminar el logo anterior (único archivo en el bucket)
  //     const objectsStream = minioClient.listObjectsV2(bucket, '', true);

  //     await new Promise<void>((resolve, reject) => {
  //       let found = false;

  //       objectsStream.on('data', async (object) => {
  //         if (!found) {
  //           found = true;
  //           try {
  //             await minioClient.removeObject(bucket, object.name);
  //             resolve();
  //           } catch (error) {
  //             reject(error);
  //           }
  //         }
  //       });

  //       objectsStream.on('end', () => {
  //         if (!found) resolve(); // No había logo, continuar igual
  //       });

  //       objectsStream.on('error', (err) => reject(err));
  //     });

  //     // 2. Subir el nuevo logo (usando nombre fijo + extensión original)
  //     const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';

  //     const fileName = `${this.LOGO_NAME}.${extension}`;

  //     await minioClient.putObject(bucket, fileName, file.buffer);

  //     return { message: '¡Logo actualizado exitosamente!' };
  //   } catch (error) {
  //     handleExceptions(error);
  //   }
  // }

  async uploadImage(file: Express.Multer.File): Promise<{ status: FILE_STATUS }> {

    const extension = file.originalname.split('.').pop()?.toLowerCase();

    if (!['jpg', 'jpeg', 'png'].includes(extension)) {
      throw new BadRequestException('La extensión del archivo no es válida. Solo se permiten imágenes .jpg, .jpeg o .png.');
    }

    try {
      const minioClient = this.getMinioClient();
      const bucket = this.LOGO_BUCKET;

      // Lista de extensiones a eliminar
      const extensions = ['jpg', 'jpeg', 'png'];

      // 1. Eliminar todas las versiones anteriores del logo
      for (const ext of extensions) {
        const oldFileName = `${this.LOGO_NAME}.${ext}`;
        try {
          await minioClient.removeObject(bucket, oldFileName);
        } catch (error) {
          if (error.code !== 'NotFound') {
            throw error;
          }
        }
      }

      const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';

      const fileName = `${this.LOGO_NAME}.${extension}`;

      await minioClient.putObject(bucket, fileName, file.buffer);

      return {
        status: FILE_STATUS.FILE_CREATED
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

}
