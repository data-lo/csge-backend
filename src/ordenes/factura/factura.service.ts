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
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { FirmaService } from '../../firma/firma/firma.service';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { MinioService } from 'src/minio/minio.service';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import * as XLSX from 'xlsx';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { PaymentRegister } from './interfaces/payment-register';

import { getResolvedYear } from 'src/helpers/get-resolved-year';

@Injectable()
export class FacturaService {

  constructor(
    private eventEmitter: EventEmitter2,

    @InjectRepository(Factura)
    private invoiceRepository: Repository<Factura>,

    @InjectRepository(Orden)
    private orderRepository: Repository<Orden>,

    @InjectRepository(Proveedor)
    private providerRepository: Repository<Proveedor>,

    private readonly signatureService: FirmaService,

    private readonly minioService: MinioService,
  ) { }

  async create(createFacturaDto: CreateFacturaDto, usuarioTestigo: Usuario) {
    try {
      const { orderIds, providerId, id, includeAdditionalTaxes, folio } = createFacturaDto;

      let orders = [];

      let subtotal = new Decimal(0);

      for (const ordenId of [orderIds]) {

        const orden = await this.orderRepository.findOneBy({ id: String(ordenId) });

        if (!orden) {
          throw new NotFoundException({ message: `¡La orden de servicio con ID ${ordenId} no se encontró!`, });
        }

        if (orden.estatus != ESTATUS_ORDEN_DE_SERVICIO.ACTIVA) {
          throw new BadRequestException('¡Solo se pueden crear facturas para órdenes de servicio activas!');
        }

        subtotal = subtotal.plus(new Decimal(orden.subtotal));

        orders.push(orden);
      }

      const provider = await this.providerRepository.findOneBy({ id: providerId });

      if (!provider) {
        throw new NotFoundException({ message: '¡El proveedor con ID no existe!', });
      }

      const invoiceMetadata = await this.obtenerDatosDeArchivoXML(id);

      if (provider.rfc !== invoiceMetadata.rfc)
        throw new BadRequestException({ message: '¡El RFC de la factura no coincide con el del proveedor!', });

      if (!subtotal.equals(new Decimal(invoiceMetadata.subtotal)) && includeAdditionalTaxes) {
        throw new BadRequestException({ message: `¡El subtotal de las órdenes no coincide con el de la factura!,`, });
      }

      const factura = await this.invoiceRepository.create({
        id: id,
        ordenesDeServicio: orders,
        proveedor: provider,
        subtotal: invoiceMetadata.subtotal,
        iva: invoiceMetadata.iva,
        total: invoiceMetadata.total,
        isWitnessValidated: true,
        createdAt: new Date(),
        usuarioTestigo: usuarioTestigo,
        folio: folio,
        status: INVOICE_STATUS.RECIBIDA
      });
      await this.invoiceRepository.save(factura);

      return {
        id: factura.id,
      }

    } catch (error) {
      handleExceptions(error);
    }
  }

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
          estatus: factura.status,
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


  async getInvoicesWithFilters(pageNumber: number, canAccessHistory: boolean, searchParams?: string, year?: string, status?: INVOICE_STATUS) {
    try {
      const resolvedYear = getResolvedYear(year, canAccessHistory);
      const paginationSetter = new PaginationSetter();

      const query = this.invoiceRepository
        .createQueryBuilder('factura')
        .leftJoinAndSelect('factura.proveedor', 'proveedor')

      if (searchParams) {
        query.andWhere(
          `(factura.folio ILIKE :search OR proveedor.rfc ILIKE :search)`,
          { search: `%${searchParams}%` }
        );
      }

      if (resolvedYear) {
        query.andWhere('EXTRACT(YEAR FROM factura.fechaDeEmision) = :year', {
          year: resolvedYear,
        });
      }

      if (status) {
        query.andWhere('factura.estatus = :status', { status });
      }

      query
        .skip(paginationSetter.getSkipElements(pageNumber))
        .take(paginationSetter.castPaginationLimit());

      const invoices = await query.getMany();

      const newData = invoices.map((invoice) => {
        return {
          id: invoice.id,
          total: invoice.total,
          status: invoice.status,
          folio: invoice.folio,
          paymentCount: invoice.paymentRegister.length,
          provider: {
            name: invoice.proveedor.razonSocial,
            rfc: invoice.proveedor.rfc,
          },
        };
      });

      return newData;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {

      const paginationSetter = new PaginationSetter();

      const invoices = await this.invoiceRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          proveedor: true,
        },
      });

      const newData = invoices.map((invoice) => {
        return {
          id: invoice.id,
          total: invoice.total,
          status: invoice.status,
          folio: invoice.folio,
          paymentCount: invoice.paymentRegister.length,
          provider: {
            name: invoice.proveedor.razonSocial,
            rfc: invoice.proveedor.rfc,
          },
        };
      });

      return newData;

    } catch (error: any) {
      handleExceptions(error);
    }
  }

  async findOne(idOrFolio: string, isFolio: boolean = false) {
    try {
      const whereClause = isFolio ? { folio: idOrFolio } : { id: idOrFolio };

      const invoice = await this.invoiceRepository.findOne({
        where: whereClause,
        relations: {
          proveedor: true,
          ordenesDeServicio: true,
        },
      });

      if (!invoice) {
        if (isFolio) return null;

        throw new NotFoundException('¡Factura no encontrada!');
      }

      const newData = {
        id: invoice.id,
        folio: invoice.folio,
        subtotal: invoice.subtotal,
        tax: invoice.iva,
        total: invoice.total,
        status: invoice.status,
        createdAt: invoice.createdAt,
        approvedAt: invoice.approvedAt,
        reviewedAt: invoice.reviewedAt,
        payments: Array.isArray(invoice.paymentRegister)
          ? invoice.paymentRegister.map((payment) => ({
            paidAmount: payment.paidAmount,
            checkNumber: payment.checkNumber,
            registeredAt: payment.registeredAt,
          }))
          : [],
        provider: {
          id: invoice.proveedor.id,
          providerNumber: invoice.proveedor.phone,
          name: invoice.proveedor.razonSocial,
          rfc: invoice.proveedor.rfc,
        },
        orders: invoice.ordenesDeServicio.map((order) => ({
          id: order.id,
          serviceType: order.tipoDeServicio,
          status: order.estatus,
          folio: order.folio,
          emittedAt: order.fechaDeEmision,
          approvedAt: order.fechaDeAprobacion,
          subtotal: order.subtotal,
          tax: order.iva,
          total: order.total,
          contractBreakdownList: order.contractBreakdownList,
          usedAmendmentContracts: order.usedAmendmentContracts
        })),
      };

      return newData;
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

      // const conceptosPrecargados = conceptos.map((concepto) => {
      //   const cantidad = concepto['cfdi:Concepto']._attributes.Cantidad;
      //   const conceptoData = concepto['cfdi:Concepto']._attributes.Descripcion;
      //   return {
      //     cantidad: cantidad,
      //     concepto: conceptoData,
      //   };
      // });

      return {
        rfc: rfc,
        subtotal: Number(subtotal),
        total: Number(total),
        iva: Number(iva),
        // conceptos: conceptosPrecargados,
      };
    } catch (error) {
      handleExceptions(error);
      throw new Error('Error al procesar el archivo XML');
    }
  }


  async sendInvoiceToCancelSigning(invoiceId: string, cancellationReason: string) {
    try {

      const invoice = await this.invoiceRepository.findOneBy({
        id: invoiceId
      });

      if (!invoice) {
        throw new NotFoundException('¡Factura no encontrada!');
      }

      if (!cancellationReason) {
        throw new BadRequestException('¡Para cancelar la factura se debe de incluir el motivo de cancelación!',);
      }

      invoice.cancellationReason = cancellationReason;

      await this.invoiceRepository.save(invoice);

      const signatureObject = {
        isSigned: false,
        documentId: invoiceId,
        documentType: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA,
        signatureAction: SIGNATURE_ACTION_ENUM.CANCEL
      };

      await this.signatureService.create(signatureObject);

      return { message: '¡La factura ha sido cancelada correctamente!' };

    } catch (error) {
      handleExceptions(error);
    }
  }

  async updateStatus(invoiceId: string, status: INVOICE_STATUS) {
    try {
      const invoice = await this.invoiceRepository.findOneBy({ id: invoiceId });

      if (!invoice) {
        throw new NotFoundException('¡Factura no encontrada!');
      }

      if (status === INVOICE_STATUS.PAGADA || status === INVOICE_STATUS.PARTIAL_PAY) {
        return;
      }

      if (status === INVOICE_STATUS.CONTEJADA) {
        invoice.reviewedAt = new Date();
      }

      if (status === INVOICE_STATUS.APROBADA) {
        invoice.approvedAt = new Date();
      }

      invoice.status = status;

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
        estatus: factura.status,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async obtenerDocumentoDeFacturaPdf(id: string) {
    try {
      const documento = await this.signatureService.downloadFile(id, TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA);
      return documento;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async checkInvoice(facturaId: string, usuario: Usuario) {

    const signatureObject = {
      documentId: facturaId,
      documentType: TIPO_DE_DOCUMENTO.APROBACION_DE_FACTURA,
      isSigned: false,
      signatureAction: SIGNATURE_ACTION_ENUM.APPROVE
    }

    const document = ((await this.signatureService.create(signatureObject)).documentoAFirmar);

    const url = await this.signatureService.documentSigning(usuario.id, { documentIds: [document.id] });

    const factura = await this.invoiceRepository.findOneBy({ id: facturaId });

    factura.usuarioTestigo = usuario;

    await this.invoiceRepository.save(factura);

    return url;
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

      let wasPaid = 0;
      let paidInvoiceCount = 0;
      const invoiceIds: string[] = [];

      for (const row of jsonData) {

        const invoice = await this.findOne(row.invoiceNumber, true);

        if (!invoice) continue;

        const isProcessableStatus = [
          INVOICE_STATUS.APROBADA,
          INVOICE_STATUS.PARTIAL_PAY
        ].includes(invoice.status);


        if (!isProcessableStatus) continue;

        const totalInvoiceAmount = new Decimal(invoice.total);
        const paidAmount = new Decimal(row.paidAmount);
        const existingPayments = Array.isArray(invoice.payments) ? invoice.payments : [];

        const currentPaidTotal = existingPayments.reduce(
          (sum, payment) => sum.plus(payment.paidAmount),
          new Decimal(0)
        );

        // Si ya está completamente pagada
        if (currentPaidTotal.greaterThanOrEqualTo(totalInvoiceAmount)) {
          wasPaid++;
          continue;
        }

        // Si ya está registrado este pago exacto
        const alreadyRegistered = existingPayments.some(item =>
          Number(item.paidAmount) === Number(row.paidAmount) &&
          item.checkNumber === row.checkNumber
        );

        if (alreadyRegistered) {
          wasPaid++;
          continue;
        }

        // Registrar nuevo pago
        const newPayment: PaymentRegister = {
          paidAmount: paidAmount.toString(),
          checkNumber: row.checkNumber,
          registeredAt: new Date()
        };

        const updatedPayments = [...existingPayments, newPayment];

        const updatedTotalPaid = currentPaidTotal.plus(paidAmount);

        const isFullyPaid = updatedTotalPaid.greaterThanOrEqualTo(totalInvoiceAmount);

        const newStatusInvoice = isFullyPaid ? INVOICE_STATUS.PAGADA : INVOICE_STATUS.PARTIAL_PAY;

        const newStatusOrder = isFullyPaid ? ESTATUS_ORDEN_DE_SERVICIO.PAGADA : ESTATUS_ORDEN_DE_SERVICIO.PARTIAL_PAY;

        await this.invoiceRepository.update(invoice.id, {
          paymentRegister: updatedPayments,
          status: newStatusInvoice
        });

        for (const order of invoice.orders) {
          await this.orderRepository.update(order.id, {
            estatus: newStatusOrder
          });
        }

        if (isFullyPaid) {
          invoiceIds.push(invoice.id);
        }

        paidInvoiceCount++;
      }

      if (invoiceIds.length > 0) {
        this.eventEmitter.emit('invoice.paid', { invoiceIds });

        this.eventEmitter.emit('invoice.match.paid', { invoiceIds });
      }

      return {
        message: '¡Archivo procesado correctamente!',
        data: {
          alreadyPaidInvoiceCount: wasPaid,
          paidInvoiceCount,
          notPaidInvoiceCount: jsonData.length - paidInvoiceCount - wasPaid
        }
      };

    } catch (error) {
      console.log(error)
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
      usedAmendmentContracts: order.usedAmendmentContracts,
      contractBreakdownList: order.contractBreakdownList,
      orderId: order.id,
      totalOrder: order.total,
      serviceType: order.tipoDeServicio,
      masterContractId: order.contratoMaestro.id
    }));

    return ordersArray;
  }

}
