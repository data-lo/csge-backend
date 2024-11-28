import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { FirmamexService } from '../firmamex/firmamex.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { createWriteStream } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { ArrayContains, Repository } from 'typeorm';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { FirmamexResponse } from './interfaces/firmamex-responde.interface';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { QR } from './interfaces/qr.c';
import { DocumentsService } from '../../documents/documents.service';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';
import { Firma } from './entities/firma.entity';

@Injectable()
export class FirmaService {
  constructor(
    
    @InjectRepository(Firma)
    private firmaRepository:Repository<Firma>,
    
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    
    private readonly firmamexService: FirmamexService,
    private readonly documentsService: DocumentsService,
  ) { }

  async create(createFirmaDto: CreateFirmaDto) {
    try {
      const { ordenOFacturaId, tipoDeDocumento, ...rest } = createFirmaDto;

      const usuarios = await this.obtenerUsuariosFirmantes(
        ordenOFacturaId,
        tipoDeDocumento,
      );
      
      const documentoParaFirmar = this.firmaRepository.create({
        ordenOFacturaId:ordenOFacturaId,
        estaFirmado:false,
        usuariosFirmadores:usuarios
      })

      await this.firmaRepository.save(documentoParaFirmar);
      return {
        message:'Documento en espera de ser firmado',
        data:documentoParaFirmar
      }
    } catch (error) {
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

  async obtenerUsuariosFirmantes(
    documentoId: string,
    tipoDeDocumento: TipoDeDocumento,
  ): Promise<Usuario[]> {
    try {
      let documentoDb: Orden | Factura = null;
      let usuarios: Usuario[] = [];

      if (tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        documentoDb = await this.ordenRepository.findOne({
          where: { id: documentoId },
        });

        if (!documentoDb)
          throw new NotFoundException('No se encuentra la orden  de servicio');

        usuarios = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .where('usuario.estatus = :estatus', { estatus: true })
          .andWhere(':permiso = ANY(usuario.permisos)', { permiso: ValidPermises.FIRMA })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', { tipoDocumento: TipoDeDocumento.ORDEN_DE_SERVICIO })
          .andWhere('(:tipoServicio = ANY(usuario.tipoOrdenDeServicio) OR :tipoTodos = ANY(usuario.tipoOrdenDeServicio))', {
            tipoServicio: documentoDb.tipoDeServicio,
            tipoTodos: TipoDeServicio.TODOS_LOS_SERVICIOS
          })
          .getMany();


      } else if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        documentoDb = await this.facturaRepository.findOne({
          where: { id: documentoId },
        });
        if (!documentoDb)
          throw new NotFoundException('No se encuentra la factura');

        usuarios = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .where('usuario.estatus = :estatus', { estatus: true })
          .andWhere(':permiso = ANY(usuario.permisos)', { permiso: ValidPermises.FIRMA })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', { tipoDocumento: TipoDeDocumento.APROBACION_DE_FACTURA })
          .getMany();
      }
      return usuarios;
    } catch (error) {
      handleExeptions(error);
    }
  }

  //CONSTRUCCIÓN DE DOCUMENTOS EN PDF

  async construir_pdf(
    documentoId,
    tipoDeDocumento: TipoDeDocumento,
  ): Promise<PDFKit.PDFDocument> {
    let documento = null;
    if ((tipoDeDocumento = TipoDeDocumento.ORDEN_DE_SERVICIO)) {
      documento =
        await this.documentsService.construirOrdenDeServicio(documentoId);
      return documento;
    } else if ((tipoDeDocumento = TipoDeDocumento.APROBACION_DE_FACTURA)) {
      documento =
        await this.documentsService.construirAprobacionDeFactura(documentoId);
      return documento;
    }
  }

  //SERVICIOS_FIRMAMEX

  async enviarDocumentoAFirmamexSDK(
    docBase64,
    docNombre: string,
  ): Promise<FirmamexResponse> {
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();
      const response = await serviciosFirmamex.request({
        b64_doc: {
          data: docBase64,
          name: docNombre,
        },
        qr: [QR],
      });
      return response;
    } catch (error) {
      console.log(error.response.data || error.message);
      handleExeptions(error);
    }
  }

  async obtenerDocumentosDeFrimamex() {
    try {
      const from = new Date('2024-11-27').getTime();
      const to = new Date('2024-11-27').getTime();
      const serviciosFirmamex = await this.firmamexService.getServices();
      let documentos = await serviciosFirmamex.listDocuments(from, to);
      while (documentos.nextToken) {
        documentos = await serviciosFirmamex.listDocuments(
          from,
          to,
          documentos.nextTocken,
        );
      }
      return documentos;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async eliminarDocumentoDeFimrmamex(ticket: string) {
    const serviciosFirmamex = await this.firmamexService.getServices();
    const response = await serviciosFirmamex.docs({
      ticket: ticket,
      action: 'delete',
    });
    return response;
  }

  //CONVERSIÓN DE BASE_64 A PDF

  async deBase64aPdf(base64: string, nombreArchivo: string) {
    const pdfBuffer = Buffer.from(base64, 'base64');
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
}
