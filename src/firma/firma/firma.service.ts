import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';
import { FirmamexService } from '../firmamex/firmamex.service';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
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
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { QROrden, QRCotejo, QR_APPROVAL_CAMPAIGN } from './interfaces/qr.c';
import { DocumentsService } from '../../documents/documents.service';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Firma } from './entities/firma.entity';
import { ESTATUS_ORDEN_DE_SERVICIO } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import {
  coordenadasAprobacionFactura,
  coordenadasCancelador,
  coordenadasCotejador,
  coordenadasOrden,
  COORDINATES_IN_DOCUMENT_CAMPAIGN,
} from './interfaces/stickers-coordenadas.objs';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Console } from 'console';


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

    @InjectRepository(Campaña)
    private campaniaRepository: Repository<Campaña>,

    private readonly firmamexService: FirmamexService,
    private readonly documentsService: DocumentsService,
  ) { }

  async create(createFirmaDto: CreateFirmaDto) {
    try {
      const { ordenOFacturaId, tipoDeDocumento } = createFirmaDto;

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
      handleExceptions(error);
    }
  }

  async findAllOrdenes(usuarioId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['documentosParaFirmar'],
      });

      if (!usuario) throw new NotFoundException('¡Usuario no encontrado!');

      const ordenesConDocumentosPorFirmar = await this.ordenRepository
        .createQueryBuilder('orden')
        .leftJoinAndMapOne(
          'orden.documento',
          Firma,
          'documento',
          'documento.orden_o_factura_id = orden.id',
        )
        .innerJoin(
          'usuarios_documentos_firma',
          'usuario_documento',
          'usuario_documento.documento_firma_id = documento.id',
        )
        .where('usuario_documento.usuario_id = :usuarioId', { usuarioId })
        .andWhere('documento.esta_firmado = :estaFirmado', {
          estaFirmado: false,
        })
        .andWhere('documento.tipo_de_documento = :tipoDocumento', {
          tipoDocumento: TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO,
        })
        .getMany();

      return ordenesConDocumentosPorFirmar;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAllFacturas(usuarioId: string) {
    try {
      try {
        const usuario = await this.usuarioRepository.findOne({
          where: { id: usuarioId },
          relations: ['documentosParaFirmar'],
        });

        if (!usuario) throw new NotFoundException('¡Usuario no encontrado!');

        const facturasConDocumentosPorFirmar = await this.facturaRepository
          .createQueryBuilder('factura')
          .leftJoinAndMapOne(
            'factura.documento',
            Firma,
            'documento',
            'documento.orden_o_factura_id = factura.id',
          )
          .innerJoin(
            'usuarios_documentos_firma',
            'usuario_documento',
            'usuario_documento.documento_firma_id = documento.id',
          )
          .where('usuario_documento.usuario_id = :usuarioId', { usuarioId })
          .andWhere('documento.esta_firmado = :estaFirmado', {
            estaFirmado: false,
          })
          .andWhere('documento.tipo_de_documento = :tipoDocumento', {
            tipoDocumento: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA,
          })
          .getMany();

        return facturasConDocumentosPorFirmar;
      } catch (error) {
        handleExceptions(error);
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAllCampanias(usuarioId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['documentosParaFirmar'],
      });

      if (!usuario) throw new NotFoundException('¡Usuario no encontrado!');

      const campaniaConDocumentosPorFirmar = await this.campaniaRepository
        .createQueryBuilder('campania')
        .leftJoinAndMapOne(
          'campania.documento',
          Firma,
          'documento',
          'documento.orden_o_factura_id = campania.id',
        )
        .innerJoin(
          'usuarios_documentos_firma',
          'usuario_documento',
          'usuario_documento.documento_firma_id = documento.id',
        )
        .where('usuario_documento.usuario_id = :usuarioId', { usuarioId })
        .andWhere('documento.esta_firmado = :estaFirmado', {
          estaFirmado: false,
        })
        .andWhere('documento.tipo_de_documento = :tipoDocumento', {
          tipoDocumento: TIPO_DE_DOCUMENTO.CAMPAÑA,
        })
        .getMany();

      return campaniaConDocumentosPorFirmar;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerUsuariosFirmantes(
    documentoId: string,
    tipoDeDocumento: TIPO_DE_DOCUMENTO,
  ): Promise<Usuario[]> {
    try {
      let documentoDb: Orden | Factura = null;
      let usuarios: Usuario[] = [];

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {
        documentoDb = await this.ordenRepository.findOne({
          where: { id: documentoId },
        });

        if (documentoDb.estatus !== ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE)
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
            tipoDocumento: TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO,
          })
          .andWhere(
            '(:tipoServicio = ANY(usuario.tipoOrdenDeServicio) OR :tipoTodos = ANY(usuario.tipoOrdenDeServicio))',
            {
              tipoServicio: documentoDb.tipoDeServicio,
              tipoTodos: TIPO_DE_SERVICIO.TODOS_LOS_SERVICIOS,
            },
          )
          .getMany();
      }

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
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
            tipoDocumento: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA,
          })
          .getMany();
      }

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.CAMPAÑA) {
        usuarios = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .where('usuario.estatus = :estatus', { estatus: true })
          .andWhere(':permiso = ANY(usuario.permisos)', {
            permiso: ValidPermises.FIRMA,
          })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', {
            tipoDocumento: TIPO_DE_DOCUMENTO.CAMPAÑA,
          })
          .getMany();
      }
      return usuarios;
    } catch (error) {
      console.log('ERROR EN USUARIOS FIRMANTES');
      handleExceptions(error);
    }
  }

  async documentSigning(userId: string, documentId: string) {
    try {
      // Buscar el usuario en la base de datos por su ID
      const user = await this.usuarioRepository.findOneBy({ id: userId });

      // Buscar el documento en la base de datos con sus relaciones (usuarios firmadores)
      const document = await this.firmaRepository.findOne({
        where: { id: documentId },
        relations: { usuariosFirmadores: true },
      });

      // Si el usuario no existe, lanzar una excepción
      if (!user) throw new NotFoundException('¡No se encuentra el usuario!');

      // Si el documento no existe, lanzar una excepción
      if (!document) throw new NotFoundException('¡No se encuentra el documento en el módulo de firma!');

      if (document.firmamexDocumentUrl === "sin_url") {
        // Construir el documento en formato PDF a partir de su orden o factura
        const documentInPdf = await this.construir_pdf(document.ordenOFacturaId, document.tipoDeDocumento);

        // Generar stickers para la firma digital del documento
        const stickers = await this.createStickers([user], document.tipoDeDocumento, document.usuariosFirmadores);

        // Convertir el documento PDF a formato Base64
        const documentInBase64 = await this.crearArchivoEnBase64(documentInPdf);

        // Enviar el documento al servicio de firma digital (Firmamex SDK)
        const response = await this.submitDocumentToFirmamexSDK(
          documentInBase64,
          documentInPdf.info.Title,
          stickers,
          document.tipoDeDocumento,
        );

        // Guardar los datos de la firma en el documento
        document.ticket = response.document_ticket;

        document.firmamexDocumentUrl = response.document_url;

        // Guardar los cambios en la base de datos
        await this.firmaRepository.save(document);
      }

      // Retornar la URL del documento generado en los servidor de Gobierno del Estado
      return document.firmamexDocumentUrl;

    } catch (error) {
      // Manejo de errores centralizado
      handleExceptions(error);
    }
  }

  private async construir_pdf(documentId, documentType: TIPO_DE_DOCUMENTO, isCampaign?: boolean, isFromCampaign?: boolean): Promise<PDFKit.PDFDocument> {
    try {

      let document = null;

      if (documentType === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {
        document = await this.documentsService.buildOrderDocument(documentId, isCampaign, isFromCampaign);

      } else if (documentType === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
        document = await this.documentsService.buildInvoiceApprovalDocument(documentId);

      } else {
        document = await this.documentsService.buildCampaignApprovalDocument(documentId);
      }
      console.log(document)
      return document;
    } catch (error) {
      console.log('error en costruir pdf');
      handleExceptions(error);
    }
  }

  private async createStickers(usuarios: Usuario[], documentType: TIPO_DE_DOCUMENTO, usuariosFirmadores: Usuario[],): Promise<Sticker[]> {
    try {
      let rect = {};

      const stickers = [];

      if (documentType === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {
        rect = coordenadasOrden;
      }

      if (documentType === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
        rect = coordenadasCotejador;
        const stickerAprobador = {
          authority: 'chihuahua',
          stickerType: 'rect',
          dataType: 'rfc',
          data: usuariosFirmadores[0].rfc,
          imageType: 'hash',
          page: 0,
          rect: coordenadasAprobacionFactura,
        };
        stickers.push(stickerAprobador);
      }

      if (documentType === TIPO_DE_DOCUMENTO.CAMPAÑA) {
        rect = COORDINATES_IN_DOCUMENT_CAMPAIGN;
      }

      for (const usuario of usuarios) {
        const sticker = {
          authority: 'chihuahua',
          stickerType: 'rect',
          dataType: 'rfc',
          email: 'bmsaenz@chihuahua.gob.mx',
          data: usuario.rfc,
          imageType: 'hash',
          page: 0,
          rect: rect,
        };
        stickers.push(sticker);
      }

      return stickers;

    } catch (error) {
      handleExceptions(error);
    }
  }


  // Servicios de Firmamex

  async submitDocumentToFirmamexSDK(
    docBase64,
    docNombre: string,
    stickers: Sticker[],
    tipoDeDocumento: TIPO_DE_DOCUMENTO,
  ): Promise<FirmamexResponse> {
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();

      let QR = {};

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO) {
        QR = QROrden;
      }

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA) {
        QR = QRCotejo;
      }

      if (tipoDeDocumento === TIPO_DE_DOCUMENTO.CAMPAÑA) {
        QR = QR_APPROVAL_CAMPAIGN;
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
      handleExceptions(error);
    }
  }

  async crearExpediente(nombreDeCampania: { name: string }) {
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();

      const { document_set } = await serviciosFirmamex.createDocumentSet(nombreDeCampania);

      return document_set;
    } catch (error) {
      console.log('ERROR EN CREAR EXPEDIENTE', error.message);
      console.log(error);
      handleExceptions(error);
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
      handleExceptions(error);
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

  async descargarDocumento(documentId: string, documentType: TIPO_DE_DOCUMENTO, isCampaign?: boolean, isFromCampaign?: boolean) {
    try {
      let document: any;

      const documentForSignature = await this.firmaRepository.findOne({
        where: { ordenOFacturaId: documentId },
      });

      if (!documentForSignature) {
        document = await this.construir_pdf(documentId, documentType, isCampaign, isFromCampaign);
        return document;
      }

      if (!documentForSignature.ticket) {
        document = await this.construir_pdf(documentId, documentType, isCampaign, isFromCampaign);
        return document;
      }

      return {
        tipo: 'url',
        url: documentForSignature.firmamexDocumentUrl
      };

    } catch (error) {
      console.log(error);
      handleExceptions(error);
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

  async cancelarDocumento(usuarioId: string, ordenOFacturaId: string) {
    try {
      const usuarioDb = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
      });
      if (!usuarioDb) throw new NotFoundException('USUARIO NO ENCONTRADO');
      const documentoEnFirmaDb = await this.firmaRepository.findOne({
        where: { ordenOFacturaId: ordenOFacturaId },
        relations: { usuariosFirmadores: true },
      });
      if (!documentoEnFirmaDb)
        throw new NotFoundException('NO SE ENCUENTRA EL DOCUMENTO EN FIRMA');
      if (documentoEnFirmaDb.estaFirmado)
        throw new BadRequestException(
          'EL DOCUMENTO DEBE ENCONTRARSE FIRMADO PARA CANCELARC',
        );
      const serviciosFirmamex = await this.firmamexService.getServices();

      const documentoEnB64 = await serviciosFirmamex.getDocument(
        'original',
        documentoEnFirmaDb.ticket,
      );

      const stickerCancelacion = {
        authority: 'chihuahua',
        stickerType: 'rect',
        dataType: 'rfc',
        data: usuarioDb.rfc,
        imageType: 'hash',
        page: 0,
        rect: coordenadasCancelador,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(ordenOFacturaId: string) {
    try {
      const documentoDb = await this.firmaRepository.findOneBy({
        ordenOFacturaId: ordenOFacturaId,
      });
      if (!documentoDb)
        throw new BadRequestException({
          status: '404',
          message: 'EL DOCUMENTO NO SE ENCUENTRA EN ESPERA DE FIRMA',
        });
      return documentoDb;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateFirmaDto: UpdateFirmaDto) {
    return `This action updates a #${id} firma`;
  }

  remove(id: number) {
    return `This action removes a #${id} firma`;
  }

  async checkOrderOrInvoiceSentForSigning(id: string) {
    try {
      const invoice = await this.firmaRepository.findOne({
        where: { ordenOFacturaId: id },
      });

      return {
        wasSentToSigning: invoice ? true : false,
      };

    } catch (error) {
      throw new Error("Error al buscar la factura");
    }
  }


}

