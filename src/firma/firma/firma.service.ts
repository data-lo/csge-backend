import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  FirmamexResponse,
  Sticker,
} from './interfaces/firmamex-responde.interface';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { QROrden, QRCotejo } from './interfaces/qr.c';
import { DocumentsService } from '../../documents/documents.service';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';
import { Firma } from './entities/firma.entity';
import { EstatusOrdenDeServicio } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import {
  coordenadasAprobacionFactura,
  coordenadasCotejador,
  coordenadasOrden,
} from './interfaces/stickers-coordenadas.objs';

@Injectable()
export class FirmaService {
  constructor(
    @InjectRepository(Firma)
    private firmaRepository: Repository<Firma>,

    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,

    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,

    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,

    private readonly firmamexService: FirmamexService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(createFirmaDto: CreateFirmaDto) {
    try {
      const { ordenOFacturaId, tipoDeDocumento} = createFirmaDto;

      const usuarios = await this.obtenerUsuariosFirmantes(
        ordenOFacturaId,
        tipoDeDocumento,
      );

      const documentoParaFirmar = this.firmaRepository.create({
        tipoDeDocumento: tipoDeDocumento,
        ordenOFacturaId: ordenOFacturaId,
        estaFirmado: false,
        usuariosFirmadores: usuarios,
      });

      await this.firmaRepository.save(documentoParaFirmar);
      return {
        message: 'Documento en espera de ser firmado',
        documentoAFirmar: documentoParaFirmar,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(usuarioId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['documentosParaFirmar'],
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const documentosPorFirmar = await this.firmaRepository
        .createQueryBuilder('documentosPorFirmar')
        .innerJoin(
          'documentosPorFirmar.usuariosFirmadores',
          'usuario',
          'usuario.id = :usuarioId',
          { usuarioId },
        )
        .where('documentosPorFirmar.estaFirmado = :estaFirmado', {
          estaFirmado: false,
        })
        .getMany();

      return documentosPorFirmar;
    } catch (error) {
      handleExeptions(error);
    }
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

        if (documentoDb.estatus !== EstatusOrdenDeServicio.PENDIENTE)
          throw new BadRequestException(
            'Solo se pueden mandar a aprobar ordenes con estatus de pendiente',
          );

        if (!documentoDb)
          throw new NotFoundException('No se encuentra la orden  de servicio');

        usuarios = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .where('usuario.estatus = :estatus', { estatus: true })
          .andWhere(':permiso = ANY(usuario.permisos)', {
            permiso: ValidPermises.FIRMA,
          })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', {
            tipoDocumento: TipoDeDocumento.ORDEN_DE_SERVICIO,
          })
          .andWhere(
            '(:tipoServicio = ANY(usuario.tipoOrdenDeServicio) OR :tipoTodos = ANY(usuario.tipoOrdenDeServicio))',
            {
              tipoServicio: documentoDb.tipoDeServicio,
              tipoTodos: TipoDeServicio.TODOS_LOS_SERVICIOS,
            },
          )
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
          .andWhere(':permiso = ANY(usuario.permisos)', {
            permiso: ValidPermises.FIRMA,
          })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', {
            tipoDocumento: TipoDeDocumento.APROBACION_DE_FACTURA,
          })
          .getMany();
      }
      return usuarios;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async firmarDocumento(usuarioId: string, documentoId: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id: usuarioId });
      const documento = await this.firmaRepository.findOne({
        where: { id: documentoId },
        relations: {
          usuariosFirmadores: true,
        }
      });

      if (!usuario) throw new NotFoundException('No se encontró el usuario');
      if (!documento)
        throw new NotFoundException('No se encontró el documento');

      const documentoEnPdf = await this.construir_pdf(
        documento.ordenOFacturaId,
        documento.tipoDeDocumento,
      );

      const stickers = await this.crearStickers(
        [usuario],
        documento.tipoDeDocumento,
        documento.usuariosFirmadores
      );
      const documentoEnBase64 = await this.crearArchivoEnBase64(documentoEnPdf);
      const response = await this.enviarDocumentoAFirmamexSDK(
        documentoEnBase64,
        documentoEnPdf.info.Title,
        stickers,
        documento.tipoDeDocumento,
      );
      documento.ticket = response.document_ticket;
      documento.documentoUrlFirmamex = response.document_url;
      await this.firmaRepository.save(documento);
      return documento.documentoUrlFirmamex;
    } catch (error) {
      handleExeptions(error);
    }
  }


  private async construir_pdf(
    documentoId,
    tipoDeDocumento: TipoDeDocumento,
  ): Promise<PDFKit.PDFDocument> {
    try {
      let documento = null;
      if (tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        documento =
          await this.documentsService.construirOrdenDeServicio(documentoId);
        return documento;
      } else if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        documento =
          await this.documentsService.construirAprobacionDeFactura(documentoId);
        return documento;
      }
    } catch (error) {
      console.log('error en costruir pdf');
      handleExeptions(error);
    }
  }

  async crearStickers(usuarios: Usuario[], tipoDeDocumento: TipoDeDocumento, usuariosFirmadores: Usuario[]): Promise<Sticker[]> {
    try {
      let rect = {};
      const stickers = [];

      if (tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        rect = coordenadasOrden;
      }
      if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        rect = coordenadasCotejador;
        const stickerAprobador = {
          authority: 'chihuahua',
          stickerType: 'rect',
          dataType: 'rfc',
          data: usuariosFirmadores[0].rfc,
          imageType: 'hash',
          page: 0,
          rect: coordenadasAprobacionFactura, 
        }
        stickers.push(stickerAprobador);
      }

      for (const usuario of usuarios) {
        const sticker = {
          authority: 'chihuahua',
          stickerType: 'rect',
          dataType: 'rfc',
          data: usuario.rfc,
          imageType: 'hash',
          page: 0,
          rect: rect,
        };
        stickers.push(sticker);
      }
      return stickers;
    } catch (error) {
      console.log('error en crearStickers');
      handleExeptions(error);
    }
  }

  //SERVICIOS_FIRMAMEX

  async enviarDocumentoAFirmamexSDK(
    docBase64,
    docNombre: string,
    stickers: Sticker[],
    tipoDeDocumento: TipoDeDocumento,
  ): Promise<FirmamexResponse> {
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();
      let QR = {};
      if (tipoDeDocumento === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        QR = QROrden;
      }
      if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
        QR = QRCotejo;
      }
      const response = await serviciosFirmamex.request({
        b64_doc: {
          data: docBase64,
          name: docNombre,
        },
        qr: [QR],
        stickers: stickers,
      });
      return response;
    } catch (error) {
      console.log('error en firmamex');
      console.log(error.response.data || error.message);
      handleExeptions(error);
    }
  }

  async obtenerDocumentosDeFrimamex() {
    try {
      const from = new Date('2024-11-27').getTime();
      const to = new Date().getTime();
      const serviciosFirmamex = await this.firmamexService.getServices();
      let documentos = await serviciosFirmamex.listDocuments(from, to);
      return documentos;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async eliminarDocumentoDeFimrmamex(documentTicket: string) {
    const serviciosFirmamex = await this.firmamexService.getServices();
    const response = await serviciosFirmamex.docs({
      ticket: documentTicket,
      action: 'delete',
    });
    return response;
  }

  async descargarDocumento(
    ordenOFacturaId: string,
    tipoDeDocumento: TipoDeDocumento,
  ) {
    try {
      let documento: any;
      const documentoEnFirma = await this.firmaRepository.findOne({
        where: { ordenOFacturaId: ordenOFacturaId },
      });
      
      console.log('documento en firma ',documentoEnFirma);
      if (!documentoEnFirma) {
        documento = await this.construir_pdf(ordenOFacturaId, tipoDeDocumento);
        console.log('regresa en construir pdf')
        return documento;
      }
      
      console.log(documentoEnFirma.ticket +'ok');
      if (!documentoEnFirma.ticket) {
        documento = await this.construir_pdf(ordenOFacturaId, tipoDeDocumento);
        return documento;
      }
      
      const serviciosFirmamex = await this.firmamexService.getServices();
      const documentoEnB64 = await serviciosFirmamex.getDocument(
        'original',
        documentoEnFirma.ticket,
      );
      
      const informacionDocumento = await serviciosFirmamex.getReport(
        documentoEnFirma.ticket,
      );

      documento = await this.deBase64aPdf(
        documentoEnB64.original,
        informacionDocumento.document.name,
      );
      
      return documento;
    } catch (error) {
      console.log(error);
      handleExeptions(error);
    }
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



  findOne(id: number) {
    return `This action returns a #${id} firma`;
  }

  update(id: number, updateFirmaDto: UpdateFirmaDto) {
    return `This action updates a #${id} firma`;
  }

  remove(id: number) {
    return `This action removes a #${id} firma`;
  }

}
