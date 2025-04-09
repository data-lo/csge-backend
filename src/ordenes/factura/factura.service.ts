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
import { In, Repository } from 'typeorm';
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
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import * as XLSX from 'xlsx';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { PaymentRegister } from './interfaces/payment-register';

@Injectable()
export class FacturaService {

  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Factura)
    private invoiceRepository: Repository<Factura>,

    @InjectRepository(Orden)
    private orderRepository: Repository<Orden>,

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
        throw new BadRequestException({ message: 'VALIDAR TESTIGO', id: id });
      }

      let ordenes: Orden[] = [];
      let subtotalDeOrdenes: Number = 0.0;

      for (const ordenId of ordenesIds) {
        const orden = await this.orderRepository.findOneBy({ id: ordenId });
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
        const factura = await this.invoiceRepository.create({
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
        await this.invoiceRepository.save(factura);

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
      const facturas = await this.invoiceRepository.find({
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
      const facturas = await this.invoiceRepository.find({
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
      const factura = await this.invoiceRepository.findOne({
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
      const factura = await this.invoiceRepository.findOneBy({ id: id });
      if (!factura) throw new NotFoundException('Factura no encontrada');
      if (!motivoDeCancelacion)
        throw new BadRequestException(
          'Se debe de incluir el motivo de cancelación',
        );

      factura.motivoCancelacion = motivoDeCancelacion;
      // const { message, value } = await this.minioService.eliminarArchivos(id);

      // if (value) {
        await this.invoiceRepository.save(factura);
        return { message: `Factura cancelada correctamente,` };
      // }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateStatus(invoiceId: string, status: INVOICE_STATUS) {
    try {
      const invoice = await this.invoiceRepository.findOneBy({ id: invoiceId });

      if (!invoice) throw new NotFoundException('¡Factura no encontrada!');

      invoice.estatus = status;

      await this.invoiceRepository.update(invoiceId, invoice);

      return { message: '¡El estatus de la factura ha sido actualizado exitosamente!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerEstatusDeFactura(id) {
    try {
      const factura = await this.invoiceRepository.findOneBy(id);
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
      documentType: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA,
      isSigned: false,
      signatureAction: SIGNATURE_ACTION_ENUM.APPROVE
    }

    const documentoFirma = ((await this.firmaService.create(documentoFirmaDto)).documentoAFirmar);
    const linkDeFacturaACotejar = await this.firmaService.documentSigning(usuario.id, documentoFirma.id);
    const factura = await this.invoiceRepository.findOneBy({ id: facturaId });
    factura.usuarioTestigo = usuario;
    await this.invoiceRepository.save(factura);
    return linkDeFacturaACotejar;
  }

  async readFileEBSUpdateStatusAndMarkPaid(file: Express.Multer.File) {
    try {

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length < 2) {
        throw new Error("El archivo no tiene suficientes filas");
      }

      const jsonData = rawData.slice(1).map(row => ({
        policyId: Number(row[0]) || null,
        batchNameGL: String(row[1] || ""),
        invoiceNumber: String(row[2] || ""),
        ineNumber: row[3] ? String(row[3]) : undefined,
        travelActivities: row[4] ? String(row[4]) : undefined,
        accountingDate: this.excelDateToJSDate(row[5]),
        paidAmount: Number(row[6]) || 0,
        batchName: String(row[7] || ""),
        invoiceDate: this.excelDateToJSDate(row[8]),
        providerName: String(row[9] || ""),
        description: String(row[10] || ""),
        invoiceAmount: Number(row[11]) || 0,
        groupFolio: Number(row[12]) || null,
        checkNumber: Number(row[13]) || null,
        checkDate: this.excelDateToJSDate(row[14]),
        bankAccount: String(row[15] || ""),
        checkAmount: Number(row[16]) || 0,
        accountingAccount: String(row[17] || ""),
        debit: Number(row[18]) || 0,
        credit: Number(row[19]) || 0
      }));

      let paidInvoiceCount: number = 0;

      for (const row of jsonData) {
        const invoice = await this.invoiceRepository.findOne({
          where: { folio: row.invoiceNumber }
        });

        if (!invoice) continue;

        const isProcessableStatus = [
          INVOICE_STATUS.CONTEJADA,
          INVOICE_STATUS.APROBADA,
          INVOICE_STATUS.PARTIAL_PAY
        ].includes(invoice.estatus);

        if (!isProcessableStatus) continue;

        const totalInvoiceAmount = new Decimal(invoice.total);
        const paidAmount = new Decimal(row.paidAmount);
        const isFullyPaid = paidAmount.equals(totalInvoiceAmount);

        const newStatus = isFullyPaid ? INVOICE_STATUS.PAGADA : INVOICE_STATUS.PARTIAL_PAY;

        const existingPayments = invoice.paymentRegister || [];

        const alreadyRegistered = existingPayments.some(item =>
          new Date(item.paymentRegisteredAt).getTime() === new Date(row.accountingDate).getTime() &&
          Number(item.paidAmount) === Number(row.paidAmount) &&
          item.checkNumber === row.checkNumber
        );

        if (alreadyRegistered) continue;

        const newPayment: PaymentRegister = {
          paidAmount: paidAmount.toString(),
          checkNumber: row.checkNumber,
          paymentRegisteredAt: new Date()
        };

        const updatedPayments = [...existingPayments, newPayment];

        await this.invoiceRepository.update(invoice.id, {
          paymentRegister: updatedPayments,
          estatus: newStatus
        });

        paidInvoiceCount += 1;

      }

      return {
        message: '¡Archivo procesado correctamente! ',
        data: {
          notPaidInvoiceCout: jsonData.length - paidInvoiceCount,
          paidInvoiceCount: paidInvoiceCount
        }
      };

    } catch (error) {
      throw new Error("No se pudo procesar el archivo Excel. Contacta al administrador o revisa los registros del sistema.");
    }
  }

  private excelDateToJSDate(serial: number): Date | null {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const date_info = utc_days * 86400 * 1000;
    return new Date(date_info);
  }

  async getOrdersRelatedToInvoice(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['ordenesDeServicio']
    });

    if (!invoice) {
      throw new Error(`¡No se encontró ninguna factura con el ID: ${invoiceId}!`);
    }

    if (!invoice.ordenesDeServicio.length) {
      return [];
    }

    const orderIds = invoice.ordenesDeServicio.map(order => order.id);

    const ordersWithMasterContracts = await this.orderRepository.find({
      where: { id: In(orderIds) },
      relations: ["contratoMaestro"]
    });

    const ordersArray = ordersWithMasterContracts.map(order => ({
      orderId: order.id,
      masterContractId: order.contratoMaestro.id
    }));

    return ordersArray;
  }

}
