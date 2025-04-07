/**
 * OrdenService
 * ------------------------------------------------------
 * Servicio encargado de la gestión de órdenes de servicio en la aplicación.
 * Permite la creación, actualización, eliminación y recuperación de órdenes de servicio,
 * así como la gestión de su estado, firma y generación de documentos PDF.
 */

// Importaciones necesarias
import {
  BadRequestException,
  ExceptionFilter,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';
import { PDFDocument } from 'pdf-lib';
import Decimal from 'decimal.js';


// Entidades y DTOs
import { Orden } from './entities/orden.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { CreateFirmaDto } from 'src/firma/firma/dto/create-firma.dto';

// Servicios relacionados
import { CampañasService } from 'src/campañas/campañas/campañas.service';
import { ProveedorService } from 'src/proveedores/proveedor/proveedor.service';
import { ContratosService } from 'src/contratos/contratos/contratos.service';
import { ServicioContratadoService } from '../servicio_contratado/servicio_contratado.service';
import { FirmaService } from '../../firma/firma/firma.service';

// Utilidades y helpers
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { IvaGetter } from 'src/helpers/iva.getter';
import { FolioServices } from './interfaces/servicios-para-folio';

// Enums e interfaces
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { ESTATUS_ORDEN_DE_SERVICIO } from './interfaces/estatus-orden-de-servicio';
import { TIPO_DE_DOCUMENTO } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { TipoProveedor } from 'src/proveedores/proveedor/interfaces/tipo-proveedor.interface';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import { ActivacionService } from 'src/campañas/activacion/activacion.service';
import { ServicioObjectDto } from '../servicio_contratado/dto/servicio-object.dto';
import { CreateContractedServiceDto } from '../servicio_contratado/dto/create-servicio_contratado.dto';
import { getResolvedYear } from 'src/helpers/get-resolved-year';


/**
 * Servicio para la gestión de órdenes de servicio.
 */
@Injectable()
export class OrdenService {
  constructor(
    @InjectRepository(Orden)
    private orderRepository: Repository<Orden>,

    @InjectRepository(ContratoMaestro)
    private masterContractRepository: Repository<ContratoMaestro>,

    @Inject(IvaGetter)
    private readonly ivaGetter: IvaGetter,

    private readonly signatureService: FirmaService,

    private readonly campaignService: CampañasService,

    private readonly activationService: ActivacionService,

    private readonly proveedorService: ProveedorService,

    private readonly contractService: ContratosService,

    private readonly contractedServiceService: ServicioContratadoService,
  ) { }


  async create(createOrderDto: CreateOrdenDto) {
    try {
      console.log(createOrderDto)
      const { campaniaId, proveedorId, contratoId, tipoDeServicio, serviciosContratados, fechaDeEmision, ...rest } = createOrderDto;

      const currentDate = new Date();

      // Buscar proveedor, contrato y campaña en paralelo
      const [provider, masterContract, campaign] = await Promise.all([
        this.proveedorService.findOne(proveedorId),
        this.contractService.findOne(contratoId),
        this.campaignService.findOne(campaniaId),
      ]);

      const amountDetails = await this.calculateOrderAmounts(serviciosContratados);

      const availableFunds = new Decimal(masterContract.montoDisponible).minus(new Decimal(masterContract.committedAmount));

      if (amountDetails.total.lessThan(availableFunds)) {
        await this.masterContractRepository.update(masterContract.id, {
          committedAmount: amountDetails.total.toNumber()
        });
      } else {

        const formattedServices = serviciosContratados.map(({ cantidad, uniqueId, servicio }) => ({
          quantity: cantidad,
          serviceName: servicio.nombreDeServicio,
          uniqueId: uniqueId
        }));

        return {
          status: "NOT_CREATED",
          data: {
            amount: amountDetails.subtotal.toString(),
            providerName: provider.razonSocial,
            serviceType: tipoDeServicio,
            services: formattedServices,
          }
        };
      }

      // Validar si el proveedor puede agregarse sin contrato
      if (!masterContract && provider.tipoProveedor !== TipoProveedor.SERVICIOS) {
        throw new BadRequestException('¡Solo los proveedores de servicios pueden agregarse sin contrato!');
      }

      // Obtener la última partida de la campaña (si existe)
      const match = campaign?.activaciones.at(-1)?.partida ?? null;

      const numberOfActivation = campaign?.activaciones.at(-1)?.numberOfActivation ?? 1

      // Generar el folio de la orden basado en el tipo de servicio
      const folio = await this.getCurrentFolio(tipoDeServicio);

      // Crear la orden
      const order = this.orderRepository.create({
        campaña: campaign,
        proveedor: provider,
        contratoMaestro: masterContract,
        partida: match,
        folio: folio,
        tipoDeServicio,
        fechaDeEmision: currentDate,
        numberOfActivation: numberOfActivation,
        iva: amountDetails.tax.toString(),
        total: amountDetails.total.toString(),
        subtotal: amountDetails.total.toString(),
        ...rest,
      });

      await this.orderRepository.save(order);

      try {
        await Promise.all(
          serviciosContratados.map(async (servicioContratado) => {
            const { cantidad, carteleraId, ...rest } = servicioContratado;
            await this.contractedServiceService.create({
              ...rest,
              cantidad,
              ordenId: order.id,
              carteleraId: isUUID(carteleraId) ? carteleraId : null,
            });
          })
        );

        const orderId = order.id;

        return orderId;

      } catch (error) {
        await this.remove(order.id);
        throw error;
      }
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();

      const currentYear = new Date().getFullYear();

      const ordenes = await this.orderRepository
        .createQueryBuilder('orden')
        .leftJoinAndSelect('orden.proveedor', 'proveedor')
        .leftJoinAndSelect('orden.campaña', 'campaña')
        .select([
          'orden.id',
          'orden.folio',
          'orden.tipoDeServicio',
          'orden.fechaDeEmision',
          'orden.fechaDeAprobacion',
          'orden.estatus',
          'orden.esCampania',
          'proveedor.nombreComercial',
          'proveedor.razonSocial',
          'campaña.nombre',
        ])
        .where('orden.esCampania = false')
        .andWhere('EXTRACT(YEAR FROM orden.fechaDeEmision) = :year', { year: currentYear })
        .orderBy('orden.fechaDeEmision', 'DESC')
        .take(paginationSetter.castPaginationLimit())
        .skip(paginationSetter.getSkipElements(pagina))
        .getMany();

      return ordenes;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getOrdersWithFilters(pageNumber: number, canAccessHistory: boolean, searchParams?: string, year?: string, status?: ESTATUS_ORDEN_DE_SERVICIO) {
    try {
      const resolvedYear = getResolvedYear(year, canAccessHistory);
      const paginationSetter = new PaginationSetter();

      const query = this.orderRepository
        .createQueryBuilder('orden')
        .leftJoinAndSelect('orden.proveedor', 'proveedor')
        .leftJoinAndSelect('orden.campaña', 'campaña')
        .select([
          'orden.id',
          'orden.folio',
          'orden.tipoDeServicio',
          'orden.fechaDeEmision',
          'orden.fechaDeAprobacion',
          'orden.estatus',
          'orden.esCampania',
          'proveedor.nombreComercial',
          'proveedor.razonSocial',
          'campaña.nombre',
        ])
        .where('orden.esCampania = false');

      if (searchParams) {
        query.andWhere(
          `(orden.folio ILIKE :search OR proveedor.rfc ILIKE :search)`,
          { search: `%${searchParams}%` }
        );
      }

      if (resolvedYear) {
        query.andWhere('EXTRACT(YEAR FROM orden.fechaDeEmision) = :year', {
          year: resolvedYear,
        });
      }

      if (status) {
        query.andWhere('orden.estatus = :status', { status });
      }

      query.orderBy('orden.fechaDeEmision', 'DESC');

      query
        .skip(paginationSetter.getSkipElements(pageNumber))
        .take(paginationSetter.castPaginationLimit());

      const ordenes = await query.getMany();

      return ordenes;

    } catch (error) {
      handleExceptions(error);
    }
  }


  async findAllBusqueda() {
    try {
      const ordenes = await this.orderRepository.find({
        relations: {
          proveedor: true,
          campaña: true,
        },
        select: {
          id: true,
          folio: true,
          tipoDeServicio: true,
          fechaDeEmision: true,
          estatus: true,
          esCampania: true,
          campaña: {
            nombre: true,
          },
          proveedor: {
            nombreComercial: true,
          },
        },
        where: {
          esCampania: false
        }
      });

      return ordenes;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: {
          proveedor: true,
          contratoMaestro: true,
          serviciosContratados: true,
          campaña: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`¡Orden con ID ${id} no encontrada!`);
      }
      const newData = {
        campaign: {
          campaignId: order.campaña.id,
          campaignName: order.campaña.nombre
        },
        provider: {
          providerId: order.proveedor.id,
          providerName: order.proveedor.razonSocial,
          providerRFC: order.proveedor.rfc,
          providerType: order.proveedor.tipoProveedor
        },
        masterContract: {
          masterContractId: order.contratoMaestro.id,
        },
        orderId: order.id,
        tax: order.iva,
        folio: order.folio,
        createdAt: order.fechaDeEmision,
        approvedAt: order.fechaDeAprobacion,
        isCampaign: order.esCampania,
        serviceType: order.tipoDeServicio,
        orderStatus: order.estatus,

        acquiredServices: order.serviciosContratados.map((service) => ({
          serviceType: order.tipoDeServicio,
          observations: service.observacion,
          quantity: service.cantidad,
          serviceId: service.id,
          serviceName: service.servicio.nombreDeServicio,
          unitPrice: service.servicio.tarifaUnitaria,
          tax: service.servicio.iva,
          isBorderTax: service.servicio.ivaFrontera,
          description: service.servicio.descripcionDelServicio,
          numberOfDays: service.calendarizacion,
          spotDetails: {
            versions: service.versionesSpot,
            impacts: service.impactosVersionSpot,
            numberOfDays: service.numeroDiasSpot,
          },
          govermentBillboard: service.cartelera

        })),
      };


      console.log(newData)
      return newData;

    } catch (error) {
      handleExceptions(error);
    }
  }

  async update(id: string, updateOrdenDto: UpdateOrdenDto) {
    try {

      const {
        campaniaId,
        proveedorId,
        contratoId,
        tipoDeServicio,
        serviciosContratados,
        ...rest
      } = updateOrdenDto;

      let newServices = [];

      const currentlyOrder = await this.orderRepository.findOne(
        {
          where: {
            id: id,
          },
          relations: { serviciosContratados: true }
        });

      if (!currentlyOrder) {
        throw new NotFoundException('No se encuentra la orden');
      }

      if (campaniaId) {
        currentlyOrder.campaña = await this.campaignService.findOne(campaniaId);
      }
      if (proveedorId) {
        currentlyOrder.proveedor = await this.proveedorService.findOne(proveedorId);
      }
      if (contratoId) {
        currentlyOrder.contratoMaestro = await this.contractService.findOne(contratoId);
      }

      Object.assign(currentlyOrder, { ...rest },);

      if (currentlyOrder.serviciosContratados) {
        for (const servicioContratado of currentlyOrder.serviciosContratados) {
          await this.contractedServiceService.remove(servicioContratado.id);
        }
      }

      if (serviciosContratados) {
        newServices = await Promise.all(
          serviciosContratados.map(async (updateService) => {
            return await this.contractedServiceService.create({
              ...updateService,
              ordenId: currentlyOrder.id,
            });
          }),
        );

        currentlyOrder.serviciosContratados = newServices;
      }
      const amountDetails = await this.calculateOrderAmounts(serviciosContratados);


      const availableFunds = new Decimal(currentlyOrder.contratoMaestro.montoDisponible).minus(new Decimal(currentlyOrder.contratoMaestro.committedAmount));

      if (amountDetails.total.lessThan(availableFunds)) {
        await this.masterContractRepository.update(currentlyOrder.contratoMaestro.id, {
          committedAmount: amountDetails.total.toNumber()
        });
      } else {
        throw new NotFoundException('¡No se pudo actualizar la orden debido a insuficiencia de fondos en los contratos!');
      }


      currentlyOrder.iva = amountDetails.tax.toString();

      currentlyOrder.total = amountDetails.total.toString();

      currentlyOrder.subtotal = amountDetails.subtotal.toString();

      await this.orderRepository.save(currentlyOrder);

      return { message: 'ORDEN ACTUALIZADA CON EXITO' };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async remove(orderId: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['contratoMaestro', 'serviciosContratados']
      });

      const orderStatus = order.estatus;

      if (orderStatus === ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE) {

        for (const servicioContratado of order.serviciosContratados) {
          await this.contractedServiceService.remove(servicioContratado.id);
        }

        const masterContractRepository = await this.contractService.findOne(order.contratoMaestro.id);

        const newCommittedAmount = new Decimal(masterContractRepository.committedAmount).minus(new Decimal(order.total)).toDecimalPlaces(4);

        await this.masterContractRepository.update(masterContractRepository.id, {
          committedAmount: newCommittedAmount.toNumber()
        })

        await this.orderRepository.remove(order);

        return { message: '¡La orden ha sido eliminada con éxito!' };
      }

      throw new BadRequestException('¡No es posible eliminar la orden debido a su estatus!');

    } catch (error) {
      handleExceptions(error);
    }
  }

  async findByRfc(rfc: string) {
    try {
      const estatus = ESTATUS_ORDEN_DE_SERVICIO.ACTIVA;
      const ordenes = await this.orderRepository
        .createQueryBuilder('ordenes')
        .innerJoinAndSelect('ordenes.proveedor', 'proveedor')
        .where('ordenes.estatus = :estatus', { estatus })
        .andWhere('proveedor.rfc LIKE :rfc', { rfc: `${rfc.toUpperCase()}%` })
        .getMany();

      if (ordenes.length === 0) return null;

      const ordenesPorProveedor = ordenes.reduce((acc, orden) => {
        const proveedorId = orden.proveedor.id;
        if (!acc[proveedorId]) {
          acc[proveedorId] = {
            proveedor: orden.proveedor,
            ordenes: [],
          };
        }

        const ordenSinProveedor = { ...orden };
        delete ordenSinProveedor.proveedor;
        acc[proveedorId].ordenes.push(ordenSinProveedor);
        return acc;
      }, {});

      const result = Object.values(ordenesPorProveedor);
      return result;
    } catch (error) {
      handleExceptions(error);
    }
  }

  async getCurrentFolio(serviceType: TIPO_DE_SERVICIO): Promise<string> {
    try {
      // 1. Obtener el año actual
      const currentYear = new Date().getFullYear();

      // 2. Traer los folios desde la base de datos
      const rawRecords = await this.orderRepository
        .createQueryBuilder('orden')
        .select('orden.folio', 'folio')
        .where('orden.tipoDeServicio = :serviceType', { serviceType })
        .andWhere('EXTRACT(YEAR FROM orden.fechaDeEmision) = :currentYear', { currentYear })
        .getRawMany<{ folio: string }>();

      // 3. Ordenar los registros por la parte numérica antes del primer guion
      rawRecords.sort((a, b) => {
        const numA = parseInt(a.folio.split('-')[0], 10);
        const numB = parseInt(b.folio.split('-')[0], 10);
        return numA - numB;
      });

      // 4. Calcular el siguiente número de folio
      //    Si no hay registros, comenzamos en 1
      //    Si existen, obtenemos el último folio y sumamos 1 a la parte numérica
      const latestFolio = rawRecords.at(-1)?.folio;  // "?.folio" retorna undefined si no hay elemento

      const newFolioNumber = latestFolio
        ? parseInt(latestFolio.split('-')[0], 10) + 1
        : 1;

      // 5. Obtener la abreviación para el tipo de servicio
      const folioServices = new FolioServices();

      const abbreviation = await folioServices.getAbbreviation(serviceType);

      // 6. Construir la cadena final del folio
      return `${newFolioNumber}-${abbreviation}-${currentYear}`;
    } catch (error) {
      console.error('Error al obtener el folio de orden:', error);
      throw new Error('No se pudo generar el folio de orden');
    }
  }

  async obtenerEstatusOrden(id: string) {
    try {
      const order = await this.findOne(id);
      return { ordenId: order.orderId, estatus: order.orderStatus };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async cancelarOrden(id: string) {
    try {
      const orden = await this.findOne(id);
      if (orden.orderStatus !== ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE) {
        await this.orderRepository.update(id, {
          estatus: ESTATUS_ORDEN_DE_SERVICIO.CANCELADA,
        });
        return { message: 'Orden cancelada exitosamente' };
      }
      throw new BadRequestException(
        'La orden no cuenta con estatus valido para su cancelacion, Eliminar orden',
      );
    } catch (error) {
      handleExceptions(error);
    }
  }

  async calculateOrderAmounts(contractedServicesList: CreateContractedServiceDto[]) {
    try {

      let tax = new Decimal(0);

      let subtotal = new Decimal(0);

      let total = new Decimal(0);

      let borderTax = false;

      contractedServicesList.forEach((contractedService) => {

        const service = plainToClass(ServicioObjectDto, contractedService.servicio);

        const quantity = new Decimal(contractedService.cantidad);

        const unitPrice = new Decimal(service.tarifaUnitaria);

        borderTax = service.ivaFrontera;

        if (quantity.isNaN() || unitPrice.isNaN()) {
          throw new Error('¡Error! La cantidad o la tarifa unitaria no son números válidos.');
        }

        const serviceSubtotal = unitPrice.times(quantity);

        subtotal = subtotal.plus(serviceSubtotal);
      });

      tax = new Decimal(await this.ivaGetter.getTax(subtotal.toString(), borderTax));

      total = subtotal.plus(tax);

      return {
        subtotal: subtotal,
        tax: tax,
        total: total,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async sendToSigningOrder(orderId: string, signatureAction: SIGNATURE_ACTION_ENUM) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });

      if (!order) {
        throw new NotFoundException(`¡La campaña con ID ${orderId} no fue encontrada!`);
      }

      // await this.validateCampaignStatusForSignatureAction(campaign.campaignStatus, signatureAction);

      const signatureObject = {
        isSigned: false,
        documentId: orderId,
        documentType: TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO,
        signatureAction: signatureAction
      };

      await this.signatureService.create(signatureObject);

      // order.estatus = ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE;

      // await this.orderRepository.save(order);

      return { message: '¡La orden ha sido enviada al módulo de firma!' };

    } catch (error) {
      handleExceptions(error);
    }
  }


  async getOrderInPDF(orderId: string) {

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["campaña"]
    });

    if (!order) {
      throw new BadRequestException(`¡No se encontró la orden con ID: ${orderId}!`);
    }

    const isCampaign = !!order.esCampania;

    const isFromCampaing = false;

    let activationId: string = "";

    if (isCampaign) {
      let lastActivation = await this.activationService.getLastActivation(order.campaña.id, orderId);

      activationId = lastActivation.id;
    }

    return await this.signatureService.downloadFile(orderId, TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO, isCampaign, isFromCampaing, activationId);
  }


  /**
 * Genera un documento PDF que contiene todas las órdenes de servicio asociadas a una campaña específica.
 * 
 * @async
 * @param {string} campaignId - El identificador único de la campaña para la cual se generará el PDF de órdenes.
 * @returns {Promise<Uint8Array | ExceptionFilter>} - Un `Uint8Array` que representa los bytes del PDF generado o `void` en caso de error.
 * 
 * @throws {BadRequestException} - Lanza una excepción si la campaña no existe o si no hay órdenes asociadas a la campaña.
 * @throws {Error} - Propaga cualquier error inesperado que ocurra durante la generación del PDF.
 * 
 * @description
 * 1. Busca la campaña en la base de datos utilizando el `campaignId`.
 * 2. Verifica que la campaña exista, de lo contrario, lanza una excepción.
 * 3. Obtiene las órdenes de servicio asociadas a la campaña y su partida.
 * 4. Si no hay órdenes encontradas, lanza una excepción.
 * 5. Crea un nuevo documento PDF.
 * 6. Itera sobre cada orden de servicio:
 *    - Descarga el archivo PDF de la orden de servicio.
 *    - Carga el PDF descargado y extrae sus páginas.
 *    - Agrega las páginas extraídas al documento PDF principal.
 * 7. Guarda y retorna los bytes del PDF combinado.
 * 8. Maneja posibles errores utilizando la función `handleExceptions`.
 */

  async generateCampaignOrdersInPDF(campaignId: string): Promise<Uint8Array> {
    try {

      // Buscar la campaña en la base de datos
      const campaign = await this.campaignService.findOne(campaignId);

      if (!campaign) {
        throw new BadRequestException(`¡No se encontró la campaña con ID: ${campaignId}!`);
      }

      // Buscar órdenes asociadas a la campaña y su activación a través de su partida
      const orders = await this.orderRepository.find({
        where: {
          campaña: { id: campaignId },
          partida: { id: campaign.activaciones[0].partida.id }
        }
      });

      const currentlyActivation = campaign.activaciones[0].id

      if (orders.length === 0) {
        throw new BadRequestException(`¡No hay órdenes asociadas a esta activación!`);
      }

      // Crear un documento PDF vacío
      const mergedPdf = await PDFDocument.create();

      // Iterar sobre cada orden y agregarla al PDF
      for (const order of orders) {
        const isCampaign = !!order.esCampania;

        // Descargar el archivo PDF de la orden de servicio
        const pdfBytes = await this.signatureService.downloadFile(order.id, TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO, isCampaign, true, currentlyActivation);

        // Cargar el PDF descargado
        const pdfLibDoc = await PDFDocument.load(pdfBytes);

        // Extraer las páginas y agregarlas al documento combinado
        const copiedPages = await mergedPdf.copyPages(pdfLibDoc, pdfLibDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      // Guardar el PDF final y retornar los bytes
      const mergedPdfBytes = await mergedPdf.save();
      return mergedPdfBytes;

    } catch (error) {
      handleExceptions(error);
    }
  }


  async getActiveOrdersByCampaignAndActivation(campaignId: string) {

    const orders = await this.orderRepository.find({
      where: {
        campaña: { id: campaignId },
      },
      order: {
        fechaDeEmision: 'DESC'
      },
      relations: {
        proveedor: true,
      },
    });

    return orders
  }

  async updateOrderStatus(orderId: string, status: ESTATUS_ORDEN_DE_SERVICIO) {
    try {
      const order = await this.orderRepository.findOne({ where: { id: orderId } });

      if (!order) {
        throw new Error(`La Orden con ID: ${orderId} no se encontró.`);
      }

      if (status === ESTATUS_ORDEN_DE_SERVICIO.ACTIVA) {
        await this.orderRepository.update(orderId, { estatus: status, fechaDeAprobacion: new Date() });
      }

      await this.orderRepository.update(orderId, { estatus: status });

      return { message: "¡El estatus de la orden se ha actualizado correctamente!", };

    } catch (error) {
      handleExceptions(error);
    }
  }

  /**
  * Obtiene las órdenes de servicio creadas por el módulo de campaña, filtrando por campaña, activación y estatus si se proporcionan.
  *
  * @param {string} campaignId - ID de la campaña de la cual se obtendrán las órdenes.
  * @param {string} [activationId] - ID opcional de la activación. Si no se proporciona, se utilizará la última activación de la campaña.
  * @param {ESTATUS_ORDEN_DE_SERVICIO} [orderStatus] - Estatus opcional de las órdenes a filtrar. Si se proporciona, solo se retornan las órdenes con ese estatus.
  *
  * @returns {Promise<OrderEntity[]>} - Lista de órdenes encontradas que coinciden con los criterios de búsqueda.
  *
  * @throws {Error} - Lanza un error si ocurre algún fallo al consultar la base de datos o si no se encuentra la activación.
  */
  async getOrdersCreatedByCampaignModule(campaignId: string, activationId?: string, orderStatus?: ESTATUS_ORDEN_DE_SERVICIO) {
    // Obtener la activación correspondiente
    const activation = activationId
      ? await this.activationService.findOne(activationId)
      : await this.activationService.getLastActivation(campaignId);

    // Construir condiciones dinámicamente
    const where: any = {
      campaña: { id: campaignId },
      esCampania: true,
      partida: { id: activation.partida.id }
    };

    // Si se proporciona orderStatus, lo agregamos al filtro
    if (orderStatus) {
      where.estatus = orderStatus;
    }

    const orders = await this.orderRepository.find({
      where,
      relations: ['contratoMaestro']
    });

    return orders;
  }


}
