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
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';

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
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { IvaGetter } from 'src/helpers/iva.getter';
import { ServiciosParaFolio } from './interfaces/servicios-para-folio';

// Enums e interfaces
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { ESTATUS_ORDEN_DE_SERVICIO } from './interfaces/estatus-orden-de-servicio';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { TipoProveedor } from 'src/proveedores/proveedor/interfaces/tipo-proveedor.interface';

/**
 * Servicio para la gestión de órdenes de servicio.
 */
@Injectable()
export class OrdenService {
  constructor(
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    @Inject(IvaGetter)
    private readonly ivaGetter: IvaGetter,
    private readonly firmaService: FirmaService,
    private readonly campañaService: CampañasService,
    private readonly proveedorService: ProveedorService,
    private readonly contratoService: ContratosService,
    private readonly servicioContratadoService: ServicioContratadoService,
  ) { }


  async create(createOrderDto: CreateOrdenDto) {
    try {
      const { campaniaId, proveedorId, contratoId, tipoDeServicio, serviciosContratados, fechaDeEmision, ...rest } = createOrderDto;

      const currentDate = new Date();

      // Buscar proveedor, contrato y campaña en paralelo
      const [proveedor, masterContract, campaign] = await Promise.all([
        this.proveedorService.findOne(proveedorId),
        contratoId ? this.contratoService.findOne(contratoId) : null,
        campaniaId ? this.campañaService.findOne(campaniaId) : null,
      ]);

      // Validar si el proveedor puede agregarse sin contrato
      if (!masterContract && proveedor.tipoProveedor !== TipoProveedor.SERVICIOS) {
        throw new BadRequestException('SOLO LOS PROVEEDORES DE SERVICIOS SE PUEDEN AGREGAR SIN CONTRATO');
      }

      // Obtener la última partida de la campaña (si existe)
      const match = campaign?.activaciones.at(-1)?.partida ?? null;

      // Generar el folio de la orden basado en el tipo de servicio
      const folio = await this.getCurrentFolio(tipoDeServicio);

      // Crear la orden
      const order = this.ordenRepository.create({
        campaña: campaign,
        proveedor: proveedor,
        contratoMaestro: masterContract,
        partida: match,
        folio: folio,
        tipoDeServicio,
        fechaDeEmision: currentDate,
        ...rest,
      });

      await this.ordenRepository.save(order);

      try {
        // Registrar servicios contratados
        await Promise.all(
          serviciosContratados.map(async (servicioContratado) => {
            const { cantidad, carteleraId, ...rest } = servicioContratado;
            await this.servicioContratadoService.create({
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
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const ordenes = await this.ordenRepository.find({
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
      handleExeptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const ordenes = await this.ordenRepository.find({
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
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const orden = await this.ordenRepository.findOne({
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
      handleExeptions(error);
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

      const currentlyOrder = await this.ordenRepository.findOne(
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
        currentlyOrder.campaña = await this.campañaService.findOne(campaniaId);
      }
      if (proveedorId) {
        currentlyOrder.proveedor = await this.proveedorService.findOne(proveedorId);
      }
      if (contratoId) {
        currentlyOrder.contratoMaestro = await this.contratoService.findOne(contratoId);
      }

      Object.assign(currentlyOrder, { ...rest },);

      if (currentlyOrder.serviciosContratados) {
        for (const servicioContratado of currentlyOrder.serviciosContratados) {
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
      }

      if (serviciosContratados) {
        newServices = await Promise.all(
          serviciosContratados.map(async (updateService) => {
            return await this.servicioContratadoService.create({
              ...updateService,
              ordenId: currentlyOrder.id,
            });
          }),
        );

        currentlyOrder.serviciosContratados = newServices;
      }


      await this.ordenRepository.save(currentlyOrder);
      await this.calcularMontosDeOrden(currentlyOrder.id);

      return { message: 'ORDEN ACTUALIZADA CON EXITO' };
    } catch (error) {
      console.log(error);
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const orden = await this.findOne(id);
      const estatus = orden.estatus;
      if (estatus === ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE) {
        for (const servicioContratado of orden.serviciosContratados) {
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
        await this.ordenRepository.remove(orden);
        return { message: 'Orden eliminada exitosamente' };
      }
      throw new BadRequestException(
        'No es posible eliminar la orden debido a su estatus, cancelar orden',
      );
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findByRfc(rfc: string) {
    try {
      const estatus = ESTATUS_ORDEN_DE_SERVICIO.ACTIVA;
      const ordenes = await this.ordenRepository
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
      handleExeptions(error);
    }
  }

  async getCurrentFolio(serviceType: TIPO_DE_SERVICIO): Promise<string> {
    try {
      // 1. Obtener el año actual
      const currentYear = new Date().getFullYear();

      // 2. Traer los folios desde la base de datos
      const rawRecords = await this.ordenRepository
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
      const serviciosParaFolio = new ServiciosParaFolio();
      const abbreviation = await serviciosParaFolio.obtenerAbreviacion(serviceType);

      // 6. Construir la cadena final del folio
      return `${newFolioNumber}-${abbreviation}-${currentYear}`;
    } catch (error) {
      console.error('Error al obtener el folio de orden:', error);
      throw new Error('No se pudo generar el folio de orden');
    }
  }


  // async actualizarEstatusOrden(
  //   id: string,
  //   nuevoEstatus: ESTATUS_ORDEN_DE_SERVICIO,
  // ) {
  //   try {
  //     const orden = await this.findOne(id);
  //     if (orden) {
  //       await this.ordenRepository.update(id, {
  //         estatus: nuevoEstatus,
  //       });
  //     }
  //     return {
  //       id: orden.id,
  //       estatus: nuevoEstatus,
  //       message: 'Estatus actualizado correctamente',
  //     };
  //   } catch (error) {
  //     handleExeptions(error);
  //   }
  // }

  async obtenerEstatusOrden(id: string) {
    try {
      const orden = await this.findOne(id);
      return { ordenId: orden.id, estatus: orden.estatus };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async cancelarOrden(id: string) {
    try {
      const orden = await this.findOne(id);
      if (orden.estatus !== ESTATUS_ORDEN_DE_SERVICIO.PENDIENTE) {
        await this.ordenRepository.update(id, {
          estatus: ESTATUS_ORDEN_DE_SERVICIO.CANCELADA,
        });
        return { message: 'Orden cancelada exitosamente' };
      }
      throw new BadRequestException(
        'La orden no cuenta con estatus valido para su cancelacion, Eliminar orden',
      );
    } catch (error) {
      handleExeptions(error);
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

      await this.ordenRepository.save(orden);
      return {
        subtotal: orden.subtotal,
        iva: orden.iva,
        total: orden.total,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async mandarOrdenAFirmar(ordenId: string) {
    try {
      const ordenDb = await this.ordenRepository.findOneBy({ id: ordenId });
      if (!ordenDb) throw new BadRequestException('LA ORDEN NO SE ENCUENTRA');
      const documentoFirmaDto: CreateFirmaDto = {
        ordenOFacturaId: ordenId,
        tipoDeDocumento: TipoDeDocumento.ORDEN_DE_SERVICIO,
        estaFirmado: false,
      };

      try {
        const documentoEnFirma = await this.firmaService.findOne(ordenId);
        if (documentoEnFirma)
          throw new BadRequestException({
            status: '406',
            message: 'EL DOCUMENTO YA SE ENCUENTRA EN ESPERA DE FIRMA',
          });
      } catch (error) {
        if (error.response.status === '404') {
          return await this.firmaService.create(documentoFirmaDto);
        }
        throw error;
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerOrdenEnPdf(id: string) {
    const documento = await this.firmaService.descargarDocumento(
      id,
      TipoDeDocumento.ORDEN_DE_SERVICIO,
    );
    return documento;
  }

  async obtenerOrdenesPorCampaniaId(campaignId: string) {
    return await this.ordenRepository.find({
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
      const order = await this.ordenRepository.findOne({ where: { id: orderId } });

      if (!order) {
        throw new Error(`La Orden con ID: ${orderId} no se encontró.`);
      }

      if (status === ESTATUS_ORDEN_DE_SERVICIO.ACTIVA) {
        await this.ordenRepository.update(orderId, { estatus: status, fechaDeAprobacion: new Date() });
      }

      await this.ordenRepository.update(orderId, { estatus: status });

      return { message: "¡El estatus de la orden se ha actualizado correctamente!", };
    } catch (error) {
      handleExeptions(error);
    }
  }
}
