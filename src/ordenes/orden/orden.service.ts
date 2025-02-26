import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { Repository } from 'typeorm';
import { CampañasService } from 'src/campañas/campañas/campañas.service';
import { ProveedorService } from 'src/proveedores/proveedor/proveedor.service';
import { ContratosService } from 'src/contratos/contratos/contratos.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { ServiciosParaFolio } from './interfaces/servicios-para-folio';
import { ServicioContratadoService } from '../servicio_contratado/servicio_contratado.service';
import { EstatusOrdenDeServicio } from './interfaces/estatus-orden-de-servicio';
import { plainToClass } from 'class-transformer';
import { ServicioDto } from '../servicio_contratado/dto/servicio-json.dto';
import { FirmaService } from '../../firma/firma/firma.service';
import { CreateFirmaDto } from 'src/firma/firma/dto/create-firma.dto';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { isUUID } from 'class-validator';
import { IvaGetter } from 'src/helpers/iva.getter';
import { TipoProveedor } from 'src/proveedores/proveedor/interfaces/tipo-proveedor.interface';
import { foliosResponse } from './interfaces/folios-interface';

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

  async create(createOrdenDto: CreateOrdenDto) {
    try {
      const {
        campaniaId,
        proveedorId,
        contratoId,
        tipoDeServicio,
        serviciosContratados,
        ...rest
      } = createOrdenDto;

      let campania = null;
      let contratoMaestro = null;

      if (campaniaId) {
        campania = await this.campañaService.findOne(campaniaId);
      }

      if (contratoId) {
        contratoMaestro = await this.contratoService.findOne(contratoId);
      }

      const proveedor = await this.proveedorService.findOne(proveedorId);

      if (!contratoMaestro) {
        if (proveedor.tipoProveedor !== TipoProveedor.SERVICIOS) {
          throw new BadRequestException('SOLO LOS PROVEEDORES DE SERVICIOS SE PUEDEN AGREGAR SIN CONTRATO');
        }
      }

      const partida = campania.activaciones.at(-1).partida;
      const folio = await this.obtenerFolioDeOrden(tipoDeServicio);
      const orden = this.ordenRepository.create({
        campaña: campania,
        proveedor: proveedor,
        contratoMaestro: contratoMaestro,
        partida: partida,
        folio: folio,
        tipoDeServicio,
        ...rest,
      });

      await this.ordenRepository.save(orden);

      try {
        for (const servicioContratado of serviciosContratados) {
          const { cantidad, carteleraId, ...rest } = servicioContratado;
          let cartelera = null;
          if (isUUID(carteleraId)) {
            cartelera = carteleraId;
          }
          await this.servicioContratadoService.create({
            ...rest,
            cantidad: servicioContratado.cantidad,
            ordenId: orden.id,
            carteleraId: cartelera,
          });
        }

        const montos = await this.calcularMontosDeOrden(orden.id);

        delete orden.contratoMaestro;
        delete orden.campaña.activaciones;
        delete orden.campaña.dependencias;
        delete orden.campaña.creadoEn;
        delete orden.campaña.actualizadoEn;
        delete orden.partida;
        delete orden.proveedor;

        orden.subtotal = Number(montos.subtotal.toFixed(2));
        orden.iva = Number(montos.iva.toFixed(2));
        orden.total = Number(montos.total.toFixed(2));

        return orden;
      } catch (error) {
        await this.remove(orden.id);
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
      if (estatus === EstatusOrdenDeServicio.PENDIENTE) {
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
    console.log(rfc)
    try {
      const estatus = EstatusOrdenDeServicio.ACTIVA;
      const ordenes = await this.ordenRepository
        .createQueryBuilder('ordenes')
        .innerJoinAndSelect('ordenes.proveedor', 'proveedor')
        .where('ordenes.estatus = :estatus', { estatus })
        .andWhere('proveedor.rfc LIKE :rfc', { rfc: `${rfc.toUpperCase()}%` })
        .getMany();

      console.log(ordenes)
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

  async obtenerFolioDeOrden(TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    try {
      let ultimosFolios: foliosResponse[];
      const year = new Date().getFullYear();
      ultimosFolios = await this.ordenRepository
        .createQueryBuilder('orden')
        .select("orden.folio", "folio")
        .where('orden.tipoDeServicio = :TIPO_DE_SERVICIO', { TIPO_DE_SERVICIO })
        .andWhere('EXTRACT(YEAR FROM orden.fechaDeEmision) = :year', { year })
        .getRawMany();

      // Verificar si ultimosFolios es nulo o vacío
      let numeroDeFolio: number;
      if (!ultimosFolios || ultimosFolios.length === 0) {
        numeroDeFolio = 1;
      } else {
        const ultimoFolio = ultimosFolios[ultimosFolios.length - 1];
        const numero = ultimoFolio.folio.split('-')[0];
        numeroDeFolio = parseInt(numero) + 1;
      }

      const serviciosParaFolio = new ServiciosParaFolio();
      const abreviacionFolio = await serviciosParaFolio.obtenerAbreviacion(TIPO_DE_SERVICIO);
      const folio = `${numeroDeFolio}-${abreviacionFolio}-${year}`;

      return folio;
    } catch (error) {
      console.error("Error al obtener el folio de orden:", error);
      throw new Error("No se pudo generar el folio de orden");
    }
  }

  async actualizarEstatusOrden(
    id: string,
    nuevoEstatus: EstatusOrdenDeServicio,
  ) {
    try {
      const orden = await this.findOne(id);
      if (orden) {
        await this.ordenRepository.update(id, {
          estatus: nuevoEstatus,
        });
      }
      return {
        id: orden.id,
        estatus: nuevoEstatus,
        message: 'Estatus actualizado correctamente',
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

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
      if (orden.estatus !== EstatusOrdenDeServicio.PENDIENTE) {
        await this.ordenRepository.update(id, {
          estatus: EstatusOrdenDeServicio.CANCELADA,
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
}
