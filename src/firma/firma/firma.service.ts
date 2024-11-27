import { Injectable } from '@nestjs/common';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { FirmamexService } from '../firmamex/firmamex.service';

import { handleExeptions } from 'src/helpers/handleExceptions.function';


@Injectable()
export class FirmaService {

  constructor(
    private readonly firmamex: FirmamexService,
  ) {}

  create(createFirmaDto: CreateFirmaDto) {
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

  async enviarDocumentoAFirmamexII(documento: PDFKit.PDFDocument) {
    try {
      const documentoBase64 = await this.crearArchivoEnBase64(documento);
      const nombreDocumento = documento.name;

      const serviciosFirmamex = await this.firmamex.getServices();
      const response = await serviciosFirmamex.request({
        b64_doc: {
          data: documentoBase64,
          name: nombreDocumento
        }
      });

      console.log(response);
      return { message: 'succes' };
    } catch (error) {
      console.log(error.response.data || error.message);
      handleExeptions(error);
    }
  }

  async enviarDocumentoAFirmamex(documento: PDFKit.PDFDocument) {
    try {
      const documentoBase64 = await this.crearArchivoEnBase64(documento);
      const nombreDocumento = documento.name;
      const response =  await this.firmamex.sendHttp(documentoBase64,nombreDocumento);
      return response;
      
    } catch (error) {
      console.log(error.response.data || error.message);
      handleExeptions(error);
    }
  }

}
