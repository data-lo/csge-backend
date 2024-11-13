import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';
import { ServiciosParaFolio } from './interfaces/servicios-para-folio';
import { ServicioContratadoService } from '../servicio_contratado/servicio_contratado.service';
import { EstatusOrdenDeServicio } from './interfaces/estatus-orden-de-servicio';

@Injectable()
export class OrdenService {
  
  constructor(
    @InjectRepository(Orden)
    private ordenRepository:Repository<Orden>,

    private readonly campañaService:CampañasService,
    private readonly proveedorService:ProveedorService,
    private readonly contratoService:ContratosService,
    private readonly servicioContratadoService:ServicioContratadoService

  ){}

  async create(createOrdenDto: CreateOrdenDto) {
    try{
      const {
        campañaId, 
        proveedorId, 
        contratoId, 
        tipoDeServicio,
        serviciosContratados,
        ...rest} = createOrdenDto;
      
      const campaña = await this.campañaService.findOne(campañaId);
      const proveedor = await this.proveedorService.findOne(proveedorId);
      const contrato = await this.contratoService.findOne(contratoId);
      const partida = campaña.activaciones.at(-1).partida;

      const folio = await this.obtenerFolioDeOrden(tipoDeServicio);

      const orden = this.ordenRepository.create({
        campaña:campaña,
        proveedor:proveedor,
        contrato:contrato,
        partida:partida,
        folio:folio,
        tipoDeServicio:tipoDeServicio,
        ...rest
      
      });

      await this.ordenRepository.save(orden);
      
      for(const servicioContratado of serviciosContratados){
        await this.servicioContratadoService.create({
          ...servicioContratado,
          orden:orden
        });
      }
      
      await this.calcularMontosDeOrden(orden);
      
      delete orden.contrato;
      delete orden.campaña.activaciones;
      delete orden.campaña.dependencias;
      delete orden.campaña.creadoEn;
      delete orden.campaña.actualizadoEn;
      delete orden.partida;
      delete orden.proveedor;

      return orden;

    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter();
      const ordenes = await this.ordenRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:{
          proveedor:true,
          campaña:true
        },
        select:{
          id:true,
          folio:true,
          tipoDeServicio:true,
          fechaDeEmision:true,
          campaña:{
            nombre:true
          },
          proveedor:{
            nombreComercial:true
          }
        }
      });
      return ordenes;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const orden = await this.ordenRepository.findOne({
        where:{id:id},
        relations:{
          proveedor:true,
          serviciosContratados:true,
          campaña:true,
        }
      });
      if(!orden) throw new NotFoundException('No se encuentra la orden');
      return orden;
    }catch(error){
      handleExeptions(error);
    }
  }


  async update(id: string, updateOrdenDto: UpdateOrdenDto) {
    try{
      const {
        campañaId,
        proveedorId,
        contratoId,
        tipoDeServicio,
        serviciosContratados,
        ...rest
      } = updateOrdenDto;

      const orden = await this.findOne(id);

      if(!orden){
        throw new NotFoundException('No se encuentra la orden');
      }

      if(campañaId){
        orden.campaña = await this.campañaService.findOne(campañaId);
      }
      if(proveedorId){
        orden.proveedor = await this.proveedorService.findOne(proveedorId);
      }
      if(contratoId){
        orden.contrato = await this.contratoService.findOne(contratoId);
      }

      Object.assign(orden,rest);

      if(tipoDeServicio){
        orden.tipoDeServicio = tipoDeServicio;
        for(const servicioContratado of orden.serviciosContratados)
          await this.servicioContratadoService.remove(servicioContratado.id);
      }

      if(serviciosContratados){
        for(const servicioContratado of serviciosContratados){
          await this.servicioContratadoService.create({
            ...servicioContratado,
            orden:orden
          });
        }
      }

      await this.ordenRepository.save(orden);
      return await this.findOne(id);

    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const orden = await this.findOne(id);
      const estatus = orden.estatus;
      if(estatus === EstatusOrdenDeServicio.PENDIENTE){
        for(const servicioContratado of orden.serviciosContratados){
          await this.servicioContratadoService.remove(servicioContratado.id);
        }
        await this.ordenRepository.delete(id);
        return {message:'Orden eliminada exitosamente'};
      }
      throw new BadRequestException('No es posible eliminar la orden debido a su estatus, cancelar orden');
    }catch(error){
      handleExeptions(error);
    }
  }


  async obtenerFolioDeOrden(tipoDeServicio:TipoDeServicio){
    try{
      const ordenesPrevias = await this.ordenRepository.findAndCountBy({
      tipoDeServicio:tipoDeServicio,
      });
      
      const numeroDeFolio = ordenesPrevias[1]+1;
      const serviciosParaFolio = new ServiciosParaFolio();
      const abreviacionFolio = serviciosParaFolio.obtenerAbreviacion(tipoDeServicio);
      const year = new Date().getFullYear();
      return `${numeroDeFolio}-${abreviacionFolio}-${year}`

    }catch(error){
      handleExeptions(error);
    }
  }

  async actualizarEstatusOrden(id:string, nuevoEstatus:EstatusOrdenDeServicio){
   try{ 
    const orden = await this.findOne(id);
    if(orden){
      await this.ordenRepository.update(id,{
        estatus:nuevoEstatus
      });
    }
    return await this.findOne(id);
   }catch(error){
    handleExeptions(error);
   }
  }

  async obtenerEstatusOrden(id:string){
    try{
      const orden = await this.findOne(id);
      return {ordenId:orden.id,estatus:orden.estatus};
    }catch(error){
     handleExeptions(error);
    }
  }

  async cancelarOrden(id:string){
    try{

    }catch(error){
     handleExeptions(error);
    }
  }

  

  async calcularMontosDeOrden(orden:Orden){
    try{
      const serviciosContratados = orden.serviciosContratados;
      let subtotal, iva, total = 0.00;
      serviciosContratados.forEach((servicio) => {
        
      });
    }catch(error){
     handleExeptions(error);
    }
  }

}
