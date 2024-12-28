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
import { Raw, Repository } from 'typeorm';
import { CampañasService } from 'src/campañas/campañas/campañas.service';
import { ProveedorService } from 'src/proveedores/proveedor/proveedor.service';
import { ContratosService } from 'src/contratos/contratos/contratos.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';
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

@Injectable()
export class OrdenService {
  constructor(
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,    
    @Inject(IvaGetter)
    private readonly ivaGetter: IvaGetter,
    
    private readonly firmaService:FirmaService,
    private readonly campañaService: CampañasService,
    private readonly proveedorService: ProveedorService,
    private readonly contratoService: ContratosService,
    private readonly servicioContratadoService: ServicioContratadoService,
  ) {}

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


      const campania = await this.campañaService.findOne(campaniaId);
      const proveedor = await this.proveedorService.findOne(proveedorId);
      const contratoMaestro = await this.contratoService.findOne(contratoId);  
      const partida = campania.activaciones.at(-1).partida;      
      const folio = await this.obtenerFolioDeOrden(tipoDeServicio);

      const orden = this.ordenRepository.create({
        campaña: campania,
        proveedor: proveedor,
        contratoMaestro: contratoMaestro,
        partida: partida,
        folio: folio,
        tipoDeServicio: tipoDeServicio,
        ...rest,
      });

      await this.ordenRepository.save(orden);
      
      try{
        for (const servicioContratado of serviciosContratados) {
          const {cantidad, carteleraId, ...rest} = servicioContratado;
          let cartelera = null;
          
          if(isUUID(carteleraId)){
            cartelera = carteleraId;
          }
          
          await this.servicioContratadoService.create({
            ...rest,
            cantidad: servicioContratado.cantidad,
            ordenId: orden.id,
            carteleraId: cartelera
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
      
      }catch(error){
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
          estatus: true,
          campaña: {
            nombre: true,
          },
          proveedor: {
            nombreComercial: true,
            razonSocial:true,
          }
        },
        order: {
          fechaDeEmision: 'ASC',
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
          campaña: {
            nombre: true,
          },
          proveedor: {
            nombreComercial: true,
          },
        },
      });
      return ordenes;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const orden = await this.ordenRepository.findOne({
        where: { id: id },
        relations: {
          proveedor: true,
          serviciosContratados: true,
          campaña: true,
        },
      });
      if (!orden) throw new NotFoundException('No se encuentra la orden');
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

      const orden = await this.findOne(id);

      if (!orden) {
        throw new NotFoundException('No se encuentra la orden');
      }

      if (campaniaId) {
        orden.campaña = await this.campañaService.findOne(campaniaId);
      }
      if (proveedorId) {
        orden.proveedor = await this.proveedorService.findOne(proveedorId);
      }
      if (contratoId) {
        orden.contratoMaestro = await this.contratoService.findOne(contratoId);
      }

      Object.assign(orden, rest);

      if (tipoDeServicio) {
        orden.tipoDeServicio = tipoDeServicio;
        for (const servicioContratado of orden.serviciosContratados) {
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
        orden.folio = await this.obtenerFolioDeOrden(tipoDeServicio);
      }

      if (serviciosContratados) {
        for (const servicioContratado of orden.serviciosContratados) {
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
        for (const servicioContratado of serviciosContratados) {
          await this.servicioContratadoService.create({
            ...servicioContratado,
            ordenId: orden.id,
          });
        }
      }

      await this.ordenRepository.save(orden);
      await this.calcularMontosDeOrden(orden.id);

      const ordenModificada = await this.findOne(id);

      delete ordenModificada.contratoMaestro;
      delete ordenModificada.campaña.activaciones;
      delete ordenModificada.campaña.dependencias;
      delete ordenModificada.campaña.creadoEn;
      delete ordenModificada.campaña.actualizadoEn;
      delete ordenModificada.partida;
      delete ordenModificada.proveedor;

      return ordenModificada;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const orden = await this.findOne(id);
      const estatus = orden.estatus;
      if (estatus === EstatusOrdenDeServicio.PENDIENTE) {
        for(const servicioContratado of orden.serviciosContratados){
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
        await this.ordenRepository.remove(orden);
        return { message: 'Orden eliminada exitosamente'};
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
      const estatus = EstatusOrdenDeServicio.ACTIVA
      const ordenes = await this.ordenRepository.createQueryBuilder('ordenes')
      .innerJoinAndSelect('ordenes.proveedor','proveedor')
      .where('ordenes.estatus = :estatus',{estatus})
      .andWhere('proveedor.rfc LIKE :rfc',{rfc:`${rfc.toUpperCase()}%`})
      .getMany();

      if(ordenes.length === 0) throw new BadRequestException('EL PROVEEDOR NO CUENTA CON ORDENES ACTIVAS');
      const proveedorDb = ordenes.at(0).proveedor;
      const ordenesDb = ordenes.map((orden) => {
        delete orden.proveedor;
        return orden;
      })
      return {
        proveedor:proveedorDb,
        ordenes:ordenesDb
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerFolioDeOrden(tipoDeServicio: TipoDeServicio) {
    try {
      const year = new Date().getFullYear();
      
      const ultimoFolio = await this.ordenRepository.createQueryBuilder('orden')
      .select('MAX(CAST(SUBSTRING(orden.folio, \'^[0-9]+\') AS INTEGER))', 'maxFolio')
      .where('orden.tipoDeServicio = :tipoDeServicio', { tipoDeServicio })
      .andWhere('EXTRACT(YEAR FROM orden.fechaDeEmision) = :year', { year })
      .getRawOne();
      
      const numeroDeFolio = ultimoFolio.maxFolio ? parseInt(ultimoFolio.maxFolio) + 1 : 1;
      const serviciosParaFolio = new ServiciosParaFolio();
      const abreviacionFolio = serviciosParaFolio.obtenerAbreviacion(tipoDeServicio);
      return `${numeroDeFolio}-${abreviacionFolio}-${year}`;    
    } catch (error) {
      handleExeptions(error);
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

      iva = await this.ivaGetter.obtenerIva(subtotal,ivaFrontera);
      total = subtotal + iva;

      orden.subtotal = parseFloat(subtotal.toFixed(4));
      orden.iva = parseFloat(iva.toFixed(4));
      orden.total = parseFloat(total.toFixed(4));
    
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

  async mandarOrdenAFirmar(ordenId:string){
    try{
      const ordenDb = await this.ordenRepository.findOneBy({id:ordenId});
      if(!ordenDb) throw new BadRequestException('LA ORDEN NO SE ENCUENTRA');
      const documentoFirmaDto:CreateFirmaDto = {
        ordenOFacturaId:ordenId,
        tipoDeDocumento:TipoDeDocumento.ORDEN_DE_SERVICIO,
        estaFirmado:false,
      }

      try{
        const documentoEnFirma = await this.firmaService.findOne(ordenId);
        if(documentoEnFirma) throw new BadRequestException({ 
          status: '406',
          message:'EL DOCUMENTO YA SE ENCUENTRA EN ESPERA DE FIRMA'
        });
      }catch(error){
        if(error.response.status === '404'){
          return await this.firmaService.create(documentoFirmaDto);
        }
        throw error;
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerOrdenEnPdf(id:string) {
    const documento = await this.firmaService.descargarDocumento(id,TipoDeDocumento.ORDEN_DE_SERVICIO);
    return documento;
  }

}
