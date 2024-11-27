import { Injectable } from '@nestjs/common';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { FirmamexService } from '../firmamex/firmamex.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { createWriteStream } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { FirmamexResponse } from './interfaces/firmamex-responde.interface';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { QR } from './interfaces/qr.c';

@Injectable()
export class FirmaService {
  constructor(

    @InjectRepository(Usuario)
    private usuarioRepository:Repository<Usuario>,
    @InjectRepository(Factura)
    private facturaRepository:Repository<Factura>,
    @InjectRepository(Orden)
    private ordenRepository:Repository<Orden>,
    private readonly firmamexService: FirmamexService
  ) {}


  async create(createFirmaDto: CreateFirmaDto) {
    try{
      const {
        documentoEnPdf, 
        ordenOFacturaId,
        tipoDeDocumento,
        ...rest
      } = createFirmaDto;

      let response:FirmamexResponse = null;
      
      const nombreDocumento = documentoEnPdf.info.Title;
      const documentoEnbase64 = await this.crearArchivoEnBase64(documentoEnPdf);
      
      //const usuarios = await this.obtenerUsuariosFirmantes(ordenOFacturaId,tipoDeDocumento);
      response = await this.enviarDocumentoAFirmamexSDK(documentoEnbase64,nombreDocumento);
      return response;

    }catch(error){
      handleExeptions(error);
    }

  }

  findAll() {
    return `This action returns all firma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} firma`;
  }

  update(id: number, updateFirmaDto: UpdateFirmaDto) {
    return `This action updates a #${id} firma`;
  }

  remove(id: number) {
    return `This action removes a #${id} firma`;
  }

  async deBase64aPdf(base64:string,nombreArchivo:string) {
    const pdfBuffer = Buffer.from(base64,'base64');
    const writeStream = createWriteStream(nombreArchivo);
    writeStream.write(pdfBuffer);
    writeStream.end();
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

  }

  async crearArchivoEnBase64(documento: PDFKit.PDFDocument) {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
      documento.on('data', (chunk) => chunks.push(chunk));
      documento.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const pdfBase64 = pdfBuffer.toString('base64');
        resolve(pdfBase64);
      });
      documento.on('error', (error) => reject(error));
      documento.end();
    });
  }

  async enviarDocumentoAFirmamexSDK(docBase64, docNombre:string):Promise<FirmamexResponse>{
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();
      const response = await serviciosFirmamex.request({
        b64_doc: {
          data: docBase64,
          name: docNombre,
        },
        qr:[QR]
      });
      return response;
    } catch (error) {
      console.log(error.response.data || error.message);
      handleExeptions(error);
    }
  }


  async obtenerUsuariosFirmantes(documentoId:string,tipoDeDocumento:TipoDeDocumento):Promise<Usuario[]>{
    try{
      let documentoDb: Orden | Factura = null;
      let usuarios:Usuario[] = []
      
      if(tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO){
        documentoDb = await this.ordenRepository.findOne({
          where:{id:documentoId}
        })
      
        usuarios = await this.usuarioRepository.find({
          where:{
            permisos:ValidPermises.FIRMA,
            estatus:true,
            tipoOrdenDeServicio:documentoDb.tipoDeServicio,
            documentosDeFirma:tipoDeDocumento
          }
        });
      }
      
      if(tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA){
        documentoDb = await this.facturaRepository.findOne({
          where:{id:documentoId}
        })
      }
      return usuarios;

    }catch(error){
      handleExeptions(error);
    }
  }

}
