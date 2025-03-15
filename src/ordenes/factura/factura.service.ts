import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import * as xmls2js from 'xml-js';
import { FacturaXml } from './interfaces/xml-json.factura.interface';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { INVOICE_STATUS } from './interfaces/estatus-factura';
import { ESTATUS_ORDEN_DE_SERVICIO } from '../orden/interfaces/estatus-orden-de-servicio';
import { CreateFirmaDto } from 'src/firma/firma/dto/create-firma.dto';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { FirmaService } from '../../firma/firma/firma.service';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class FacturaService {

  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    @InjectRepository(Proveedor)
    private proveedrRepository: Repository<Proveedor>,

    private readonly firmaService: FirmaService,
    private readonly minioService: MinioService,
  ) { }

  async create(createFacturaDto: CreateFacturaDto, usuarioTestigo: Usuario) {
    try {
      const {
        ordenesDeServicioIds,
        proveedorId,
        validacionTestigo,
        id,
        folio,
      } = createFacturaDto;

      let ordenesIds = []
      if (typeof ordenesDeServicioIds === 'string') {
        ordenesIds.push(ordenesDeServicioIds);
      } else {
        ordenesIds = ordenesDeServicioIds
      }

      const validacionBool = Boolean(validacionTestigo);

      if (!validacionBool) {
        console.log('ERROR EN VALIDACIÓN')
        throw new BadRequestException({ message: 'VALIDAR TESTIGO', id: id });
      }

      let ordenes: Orden[] = [];
      let subtotalDeOrdenes: Number = 0.0;

      for (const ordenId of ordenesIds) {
        const orden = await this.ordenRepository.findOneBy({ id: ordenId });
        if (!orden) {
          console.log('ERROR EN LOS IDS DE LAS ORDENES')
          throw new NotFoundException({
            message: `LA ORDEN CON EL ID: ${ordenId} NO SE ENCUENTRA`,
            id: id,
          });
        }

        if (orden.estatus != ESTATUS_ORDEN_DE_SERVICIO.ACTIVA) throw new BadRequestException('SOLO SE PUEDEN CAPTURAR FACTURAS PARA ORDENES ACTIVAS');
        subtotalDeOrdenes = Number(orden.subtotal) + Number(subtotalDeOrdenes);
        ordenes.push(orden);
      }

      const proveedor = await this.proveedrRepository.findOneBy({
        id: proveedorId,
      });
      if (!proveedor) {
        console.log('ERROR EN EL PROVEEDOR')
        throw new NotFoundException({
          message: 'NO SE ENCUENTRA EL PROVEEDOR',
          id: id,
        });
      }

      const facturaXmlData = await this.obtenerDatosDeArchivoXML(id);

      if (proveedor.rfc !== facturaXmlData.rfc)
        throw new BadRequestException({
          message: 'EL RFC DE LA FACTURA INGRESADA, Y DEL PROVEEDOR NO COINCIDEN',
          id: id,
        });

      if (subtotalDeOrdenes != facturaXmlData.subtotal) {
        throw new BadRequestException({
          message: `EL MONTO DE LAS ORDENES Y DEL DE LA FACTURA NO COINCIDEN, SUBTOTAL ORDEN: ${subtotalDeOrdenes}, SUBTOTAL FACTURA: ${facturaXmlData.subtotal}`,
          id: id,
        });
      }
      try {
        const factura = await this.facturaRepository.create({
          id: id,
          ordenesDeServicio: ordenes,
          proveedor: proveedor,
          subtotal: facturaXmlData.subtotal,
          iva: facturaXmlData.iva,
          total: facturaXmlData.total,
          validacionTestigo: validacionBool,
          usuarioTestigo: usuarioTestigo,
          folio: folio
        });
        await this.facturaRepository.save(factura);

        return {
          id: factura.id,
          rfc: facturaXmlData.rfc,
          subtotal: facturaXmlData.subtotal,
          iva: facturaXmlData.iva,
          total: facturaXmlData.total,
          conceptos: facturaXmlData.conceptos
        }

      } catch (error) {
        console.log('ERROR EN FACTURA CREATE')
        throw error;
      }
    } catch (error) {
      handleExceptions(error);
    }
  } d

  async findAllBusqueda() {
    try {
      const facturas = await this.facturaRepository.find({
        relations: {
          proveedor: true,
        },
      });
      const facturasFilter = facturas.map((factura) => {
        return {
          id: factura.id,
          total: factura.total,
          estatus: factura.estatus,
          proveedor: {
            nombre: factura.proveedor.razonSocial,
            rfc: factura.proveedor.rfc,
          },
        };
      });
      return facturasFilter;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const facturas = await this.facturaRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          proveedor: true,
        },
      });
      const facturasFilter = facturas.map((factura) => {
        return {
          id: factura.id,
          total: factura.total,
          estatus: factura.estatus,
          folio: factura.folio,
          proveedor: {
            nombre: factura.proveedor.razonSocial,
            rfc: factura.proveedor.rfc,
          },
        };
      });
      return facturasFilter;
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const factura = await this.facturaRepository.findOne({
        where: { id: id },
        relations: {
          proveedor: true,
          ordenesDeServicio: true,
        },
      });
      return factura;
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const factura = await this.findOne(id);
      if (factura) {
      }
    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async obtenerDatosDeArchivoXML(id: string) {
    try {

      const xml = await this.minioService.obtenerArchivosDescarga(id, 'xml');
      const xmlString = xml.toString('utf-8');

      const facturaJsonString = xmls2js.xml2json(xmlString, {
        compact: true,
        spaces: 4,
      });

      const facturaXml: FacturaXml = JSON.parse(facturaJsonString);
      const rfc = facturaXml['cfdi:Comprobante']['cfdi:Emisor']._attributes.Rfc;
      const subtotal = facturaXml['cfdi:Comprobante']._attributes.SubTotal;
      const total = facturaXml['cfdi:Comprobante']._attributes.Total;
      const iva =
        facturaXml['cfdi:Comprobante']['cfdi:Impuestos']._attributes
          .TotalImpuestosTrasladados;

      let conceptos = facturaXml['cfdi:Comprobante']['cfdi:Conceptos'];
      if (!Array.isArray(conceptos)) {
        conceptos = [conceptos];
      }

      const conceptosPrecargados = conceptos.map((concepto) => {
        const cantidad = concepto['cfdi:Concepto']._attributes.Cantidad;
        const conceptoData = concepto['cfdi:Concepto']._attributes.Descripcion;
        return {
          cantidad: cantidad,
          concepto: conceptoData,
        };
      });

      return {
        rfc: rfc,
        subtotal: Number(subtotal),
        total: Number(total),
        iva: Number(iva),
        conceptos: conceptosPrecargados,
      };
    } catch (error) {
      handleExceptions(error);
      throw new Error('Error al procesar el archivo XML');
    }
  }


  //Canela la factura ingresada
  async cancelarFactura(id: string, updateFacturaDto: UpdateFacturaDto) {
    try {
      const { motivoDeCancelacion } = updateFacturaDto;
      const factura = await this.facturaRepository.findOneBy({ id: id });
      if (!factura) throw new NotFoundException('Factura no encontrada');
      if (!motivoDeCancelacion)
        throw new BadRequestException(
          'Se debe de incluir el motivo de cancelación',
        );

      factura.motivoCancelacion = motivoDeCancelacion;
      const { message, value } = await this.minioService.eliminarArchivos(id);

      if (value) {
        await this.facturaRepository.save(factura);
        return { message: `Factura cancelada correctamente, ${message}` };
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateStatus(invoiceId: string, status: INVOICE_STATUS) {
    try {
      const invoice = await this.facturaRepository.findOneBy({ id: invoiceId });

      if (!invoice) throw new NotFoundException('¡Factura no encontrada!');

      invoice.estatus = status;

      await this.facturaRepository.update(invoiceId, invoice);

      return { message: '¡El estatus de la factura ha sido actualizado exitosamente!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatusDeFactura(id) {
    try {
      const factura = await this.facturaRepository.findOneBy(id);
      if (!factura) throw new NotFoundException('No se encontro la factura');
      return {
        id: factura.id,
        estatus: factura.estatus,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerDocumentoDeFacturaPdf(id: string) {
    try {
      const documento = await this.firmaService.downloadFile(id, TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA);
      return documento;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async cotejarFactura(facturaId: string, usuario: Usuario) {

    const documentoFirmaDto: CreateFirmaDto = {
      documentId: facturaId,
      tipoDeDocumento: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA ,
      estaFirmado: false,
    }

    const documentoFirma = ((await this.firmaService.create(documentoFirmaDto)).documentoAFirmar);
    const linkDeFacturaACotejar = await this.firmaService.documentSigning(usuario.id, documentoFirma.id);
    const factura = await this.facturaRepository.findOneBy({ id: facturaId });
    factura.usuarioTestigo = usuario;
    await this.facturaRepository.save(factura);
    return linkDeFacturaACotejar;
  }

}
