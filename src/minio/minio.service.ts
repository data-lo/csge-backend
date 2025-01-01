import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { MinioFileI } from './interfaces/minio.file.interface';

@Injectable()
export class MinioService {

    minioClient:any;
    bucket:any;

    private setMinioClient(){
        console.log(process.env.MINIO_ACCESS_KEY);
        console.log(process.env.MINIO_SECRET_KEY);

        if(!process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY){
            throw new Error('LAS API KEYS DE MINIO SERVICE NO ESTAN CONFIGURADAS');
        }
        this.minioClient = new Minio.Client({
            endPoint: 'localhost',
            port:9000,
            useSSL:false,
            accessKey:process.env.MINIO_ACCESS_KEY,
            secretKey:process.env.MINIO_SECRET_KEY
        });
        if(!process.env.MINIO_BUCKET) throw new Error('NO SE ENCUETRA EL BUCKET DE MINIO');
        console.log(process.env.MINIO_BUCKET);
        this.bucket = process.env.MINIO_BUCKET;
        return;
    }

    private getMinioClient(){
        if(!this.minioClient){
            this.setMinioClient();
            return this.minioClient;
        }
        return this.minioClient;
    }

    async subirArchivosAMinio(files:MinioFileI[]){
        
        const minioClient = this.getMinioClient();
        const bucket = this.bucket;
        const exists = await minioClient.bucketExists(bucket);

        if(!exists) throw new Error('EL BUCKET DECLARADO EN LAS VARIABLES NO EXISTE, CREAR BUCKET');
        console.log('Bucket' + bucket + 'exists.');

        for(const file of files){
            await minioClient.putObject(bucket,file.name,file.file,function(err,etag){
                return console.log(err,etag);
            });
        }
        return {message:'ARCHIVOS SUBIDOS EXITOSAMENTE'}
    }
}

