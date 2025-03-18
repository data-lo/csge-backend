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
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';
import { PDFDocument } from 'pdf-lib';

// Entidades y DTOs
import { Orden } from './entities/orden.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { CreateFirmaDto } from 'src/firma/firma/dto/create-firma.dto';
import { ServicioDto } from '../servicio_contratado/dto/servicio-json.dto';

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
import { Factura } from '../factura/entities/factura.entity';
// import { Factura } from '../factura/entities/factura.entity';


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
      const { campaniaId, proveedorId, contratoId, tipoDeServicio, serviciosContratados, fechaDeEmision, ...rest } = createOrderDto;
      console.log(serviciosContratados)
      const currentDate = new Date();

      // Buscar proveedor, contrato y campaña en paralelo
      const [provider, masterContractRepository, campaign] = await Promise.all([
        this.proveedorService.findOne(proveedorId),
        this.contractService.findOne(contratoId),
        this.campaignService.findOne(campaniaId),
      ]);


      let totalAmount: number = 0;
      let categorizedServices: any[] = [];

      for (const contractedService of serviciosContratados) {
        const serviceTotal = contractedService.cantidad *
          (Number(contractedService.servicio.tarifaUnitaria) + Number(contractedService.servicio.iva));

        totalAmount += serviceTotal;
        categorizedServices.push(contractedService);
      }

      const availableFunds = masterContractRepository.montoDisponible - masterContractRepository.committedAmount;

      if (availableFunds > totalAmount) {
        const newCommitedAmount = Number(totalAmount) + Number(masterContractRepository.committedAmount);

        await this.masterContractRepository.update(masterContractRepository.id, {
          committedAmount: newCommitedAmount
        });
      } else {

        const formattedServices = categorizedServices.map((contractedService: { cantidad: number, uniqueId: string, servicio: { nombreDeServicio: string, tarifaUnitaria: number, iva: number } }) => ({
          quantity: contractedService.cantidad,
          serviceName: contractedService.servicio.nombreDeServicio,
          uniqueId: contractedService.uniqueId
        }));

        return {
          status: "NOT_CREATED",
          data: {
            amount: totalAmount,
            providerName: provider.razonSocial,
            serviceType: tipoDeServicio,
            services: formattedServices,
          }
        };
      }

      // Validar si el proveedor puede agregarse sin contrato
      if (!masterContractRepository && provider.tipoProveedor !== TipoProveedor.SERVICIOS) {
        throw new BadRequestException('¡Solo los proveedores de servicios pueden agregarse sin contrato!');
      }

      // Obtener la última partida de la campaña (si existe)
      const match = campaign?.activaciones.at(-1)?.partida ?? null;

      // Generar el folio de la orden basado en el tipo de servicio
      const folio = await this.getCurrentFolio(tipoDeServicio);

      // Crear la orden
      const order = this.orderRepository.create({
        campaña: campaign,
        proveedor: provider,
        contratoMaestro: masterContractRepository,
        partida: match,
        folio: folio,
        tipoDeServicio,
        fechaDeEmision: currentDate,
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

        // Calcular montos de la orden
        await this.calcularMontosDeOrden(order.id);

        // Eliminar campos innecesarios antes de devolver la orden
        const camposAEliminar = ["contratoMaestro", "campaña.activaciones", "campaña.dependencias", "campaña.creadoEn", "campaña.actualizadoEn", "partida", "proveedor"];
        camposAEliminar.forEach((campo) => delete order[campo]);
        return order;

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
      const ordenes = await this.orderRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          proveedor: true,
          campaña: true,
        },
        select: {
          id: true,
          folio: true,
          tipoDeServicio: true,
          fechaDeEmision: true,
          fechaDeAprobacion: true,
          estatus: true,
          esCampania: true,
          campaña: {
            nombre: true,
          },
          proveedor: {
            nombreComercial: true,
            razonSocial: true,
          },
        },
        where: {
          esCampania: false
        },
        order: {
          fechaDeEmision: 'DESC',
        },
      });
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
      const orden = await this.orderRepository.findOne({
        where: { id },
        relations: {
          proveedor: true,
          contratoMaestro: true,
          serviciosContratados: true,
          campaña: true,
        },
      });

      if (!orden) throw new NotFoundException(`¡Orden con ID ${id} no encontrada!`);

      return orden;

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
          }, relations: {
            serviciosContratados: true
          }
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


      await this.orderRepository.save(currentlyOrder);
      await this.calcularMontosDeOrden(currentlyOrder.id);

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

        const newCommittedAmount = masterContractRepository.committedAmount - order.total;

        await this.masterContractRepository.update(masterContractRepository.id, {
          committedAmount: newCommittedAmount
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
      const orden = await this.findOne(id);
      return { ordenId: orden.id, estatus: orden.estatus };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async cancelarOrden(id: string) {
    try {
      const orden = await this.findOne(id);
      if (orden.estatus !== ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE) {
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

  async calcularMontosDeOrden(ordenId: string) {
    try {
      const orden = await this.findOne(ordenId);
      const { serviciosContratados } = orden;

      let iva = 0;
      let subtotal = 0;
      let total = 0.0;
      let ivaFrontera = false;

      serviciosContratados.forEach((servicioContratado) => {
        const servicio = plainToClass(ServicioDto, servicioContratado.servicio);
        const cantidad = servicioContratado.cantidad;
        const tarifaUnitaria = parseFloat(servicio.tarifaUnitaria);
        ivaFrontera = servicio.ivaFrontera;

        if (isNaN(cantidad) || isNaN(tarifaUnitaria)) {
          throw new Error('Cantidad, Tarifa Unitaria o Iva no son tipo Number');
        }

        const subtotalServicio = tarifaUnitaria * cantidad;
        subtotal += subtotalServicio;
      });

      iva = await this.ivaGetter.obtenerIva(subtotal, ivaFrontera);
      total = subtotal + iva;

      orden.subtotal = parseFloat(subtotal.toFixed(2));
      orden.iva = parseFloat(iva.toFixed(2));
      orden.total = parseFloat(total.toFixed(2));

      await this.orderRepository.save(orden);
      return {
        subtotal: orden.subtotal,
        iva: orden.iva,
        total: orden.total,
      };
    } catch (error) {
      handleExceptions(error);
    }
  }

  async mandarOrdenAFirmar(ordenId: string) {
    try {
      const ordenDb = await this.orderRepository.findOneBy({ id: ordenId });
      if (!ordenDb) throw new BadRequestException('LA ORDEN NO SE ENCUENTRA');

      const documentoFirmaDto: CreateFirmaDto = {
        documentId: ordenId,
        documentType: TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO,
        isSigned: false,
        signatureAction: SIGNATURE_ACTION_ENUM.APPROVE
      };

      try {
        const documentoEnFirma = await this.signatureService.findOne(ordenId);
        if (documentoEnFirma)
          throw new BadRequestException({
            status: '406',
            message: 'EL DOCUMENTO YA SE ENCUENTRA EN ESPERA DE FIRMA',
          });
      } catch (error) {
        if (error.response.status === '404') {
          return await this.signatureService.create(documentoFirmaDto);
        }
        throw error;
      }
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

  async generateCampaignOrdersInPDF(campaignId: string) {
    try {
      const campaign = await this.campaignService.findOne(campaignId);

      if (!campaign) {
        throw new BadRequestException(`¡No se encontró la campaña con ID: ${campaignId}!`);
      }

      const orders = await this.orderRepository.find({
        where: { campaña: { id: campaignId } }
      });

      if (orders.length === 0) {
        throw new BadRequestException(`¡No hay órdenes asociadas a la campaña con ID: ${campaignId}!`);
      }

      const mergedPdf = await PDFDocument.create();

      for (const order of orders) {
        const isCampaign = !!order.esCampania;

        const pdfBytes = await this.signatureService.downloadFile(order.id, TIPO_DE_DOCUMENTO.ORDEN_DE_SERVICIO, isCampaign, true);

        const pdfLibDoc = await PDFDocument.load(pdfBytes);

        const copiedPages = await mergedPdf.copyPages(pdfLibDoc, pdfLibDoc.getPageIndices());

        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();

      return mergedPdfBytes;
    } catch (error) {
      handleExceptions(error);
    }
  }


  async obtenerOrdenesPorCampaniaId(campaignId: string) {
    return await this.orderRepository.find({
      where: {
        campaña: { id: campaignId }
      },
      relations: {
        proveedor: true
      },
    });
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

  async getOrdersCreatedByCampaignModule(campaignId: string) {
    const activation = await this.activationService.getLastActivation(campaignId);

    const orders = await this.orderRepository.find({
      where: {
        campaña: { id: campaignId },
        esCampania: true,
        partida: { id: activation.partida.id }
      },
      relations: ['contratoMaestro']
    });

    return orders;
  }
}
