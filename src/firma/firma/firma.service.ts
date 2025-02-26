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
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { Firma } from './entities/firma.entity';
import { EstatusOrdenDeServicio } from 'src/ordenes/orden/interfaces/estatus-orden-de-servicio';
import {
  coordenadasAprobacionFactura,
  coordenadasCancelador,
  coordenadasCotejador,
  coordenadasOrden,
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
      handleExeptions(error);
    }
  }

  async findAllOrdenes(usuarioId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['documentosParaFirmar'],
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

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
          tipoDocumento: TipoDeDocumento.ORDEN_DE_SERVICIO,
        })
        .getMany();

      return ordenesConDocumentosPorFirmar;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAllFacturas(usuarioId: string) {
    try {
      try {
        const usuario = await this.usuarioRepository.findOne({
          where: { id: usuarioId },
          relations: ['documentosParaFirmar'],
        });

        if (!usuario) throw new NotFoundException('Usuario no encontrado');

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
            tipoDocumento: TipoDeDocumento.APROBACION_DE_FACTURA,
          })
          .getMany();

        return facturasConDocumentosPorFirmar;
      } catch (error) {
        handleExeptions(error);
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAllCampanias(usuarioId: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: usuarioId },
        relations: ['documentosParaFirmar'],
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

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
          tipoDocumento: TipoDeDocumento.CAMPAÑA,
        })
        .getMany();

      return campaniaConDocumentosPorFirmar;
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
              tipoTodos: TIPO_DE_SERVICIO.TODOS_LOS_SERVICIOS,
            },
          )
          .getMany();
      }

      if (tipoDeDocumento === TipoDeDocumento.APROBACION_DE_FACTURA) {
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

      if (tipoDeDocumento === TipoDeDocumento.CAMPAÑA) {
        usuarios = await this.usuarioRepository
          .createQueryBuilder('usuario')
          .where('usuario.estatus = :estatus', { estatus: true })
          .andWhere(':permiso = ANY(usuario.permisos)', {
            permiso: ValidPermises.FIRMA,
          })
          .andWhere(':tipoDocumento = ANY(usuario.documentosDeFirma)', {
            tipoDocumento: TipoDeDocumento.CAMPAÑA,
          })
          .getMany();
      }
      return usuarios;
    } catch (error) {
      console.log('ERROR EN USUARIOS FIRMANTES');
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
        },
      });

      if (!usuario) throw new NotFoundException('No se encontró el usuario');

      if (!documento) throw new NotFoundException('No se encontró el documento');

      const documentoEnPdf = await this.construir_pdf(
        documento.ordenOFacturaId,
        documento.tipoDeDocumento,
      );

      const stickers = await this.crearStickers(
        [usuario],
        documento.tipoDeDocumento,
        documento.usuariosFirmadores,
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
    documentId,
    documentType: TipoDeDocumento,
  ): Promise<PDFKit.PDFDocument> {
    try {
      let document = null;
      if (documentType === TipoDeDocumento.ORDEN_DE_SERVICIO) {
        document = await this.documentsService.construirOrdenDeServicio(documentId);
        return document;

      } else if (documentType === TipoDeDocumento.APROBACION_DE_FACTURA) {
        document = await this.documentsService.construirAprobacionDeFactura(documentId);
        return document;

      } else {
        document = await this.documentsService.buildCampaignApprovalDocument(documentId);
        return document;
      }
    } catch (error) {
      console.log('error en costruir pdf');
      handleExeptions(error);
    }
  }

  private async crearStickers(
    usuarios: Usuario[],
    tipoDeDocumento: TipoDeDocumento,
    usuariosFirmadores: Usuario[],
  ): Promise<Sticker[]> {
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
        };
        stickers.push(stickerAprobador);
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
      console.log('error en crearStickers');
      handleExeptions(error);
    }
  }

  async firmarCampania(usuarioId: string, firmaId: string) {
    try {

      const firmamexService = await this.firmamexService.getServices();

      const user = await this.usuarioRepository.findOneBy({ id: usuarioId });

      if (!user) throw new NotFoundException('¡No se encuentra el usuario!');

      const signatureCampaign = await this.firmaRepository.findOneBy({ id: firmaId });

      if (!signatureCampaign) throw new NotFoundException('¡No se encuentra la campaña en el módulo de firma!');

      const campaing = await this.campaniaRepository.findOneBy({ id: signatureCampaign.ordenOFacturaId });

      if (!campaing) throw new NotFoundException('¡No se encuentra la campaña!');

      const orders = await this.ordenRepository
        .createQueryBuilder('orden')
        .where('orden.campañaId = :campaniaId', { campaniaId: campaing.id })
        .andWhere('orden.cotizada_en_campania = :esCampania', { esCampania: true })
        .getMany();

      const QR = QROrden;

      if (!orders) throw new NotFoundException('¡No se encontraron órdenes de servicio!');

      const dossier = await this.crearExpediente({ name: campaing.nombre });

      signatureCampaign.ticket = dossier;

      const response = await this.firmaRepository.save(signatureCampaign);

      for (const order of orders) {
        const orderPDF = await this.construir_pdf(order.id, TipoDeDocumento.ORDEN_DE_SERVICIO);

        const stickers = await this.crearStickers([user], TipoDeDocumento.ORDEN_DE_SERVICIO, signatureCampaign.usuariosFirmadores);

        const documentInBase64 = await this.crearArchivoEnBase64(orderPDF);

        const response = await firmamexService.request({
          b64_doc: {
            data: documentInBase64,
            name: order.folio
          },
          qr: [QR],
          document_set: dossier,
          stickers: stickers,
        });

      }

      const file =

        console.log("Si llega aquí");

      // const documentSetData = await services.getDocumentSet(documentSet);


      // const closeDossier = await firmamexService.closeDocumentSet({
      //   documentSet: dossier,
      //   workflow: {
      //     remind_every: '1d',
      //     language: 'es',
      //     ordered: true
      //   }
      // });

      // console.log(closeDossier);

      return "Ok";

    } catch (error) {
      handleExeptions(error);
    }
  }

  // Servicios de Firmamex

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

  async crearExpediente(nombreDeCampania: { name: string }) {
    try {
      const serviciosFirmamex = await this.firmamexService.getServices();

      const { document_set } = await serviciosFirmamex.createDocumentSet(nombreDeCampania);

      return document_set;
    } catch (error) {
      console.log('ERROR EN CREAR EXPEDIENTE', error.message);
      console.log(error);
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

  async descargarDocumento(documentId: string, documentType: TipoDeDocumento,) {
    try {
      let document: any;

      const documentForSignature = await this.firmaRepository.findOne({
        where: { ordenOFacturaId: documentId },
      });

      if (!documentForSignature) {
        document = await this.construir_pdf(documentId, documentType);
        return document;
      }

      if (!documentForSignature.ticket) {
        document = await this.construir_pdf(documentId, documentType);
        return document;
      }

      return {
        tipo: 'url',
        url: documentForSignature.documentoUrlFirmamex
      };

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
      handleExeptions(error);
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

