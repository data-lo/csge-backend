import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstacionService } from '../estacion/estacion.service';
import { flattenCaracteristica } from 'src/helpers/flattenCaracterisitcas.function';

@Injectable()
export class ServicioService {
  
  constructor(
    @InjectRepository(Servicio)
    private servicioRepository:Repository<Servicio>,
    private estacionService:EstacionService,
  ){}

  async create(createServicioDto: CreateServicioDto) {
    try{  
      const {estacionId,...rest} = createServicioDto;
      const estacionDb = await this.estacionService.findOne(createServicioDto.estacionId);
      const servicio = this.servicioRepository.create({
        estacion:estacionDb,
        ...rest
      });
      
      await this.servicioRepository.save(servicio);
      return servicio;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const servicios = await this.servicioRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:['renovaciones']
      });
      return servicios;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const servicio = await this.servicioRepository.findOne({
        where:{id:id},
        relations:{
          renovaciones:true
        }
      });
      
      if(!servicio) throw new NotFoundException('No se encuentra el servicio');
      const index = servicio.renovaciones.length
      const ultimaRenovacion = servicio.renovaciones[index-1];
      
      delete ultimaRenovacion.fechaDeCreacion;
      delete servicio.renovaciones;
      
      servicio.renovaciones = [ultimaRenovacion];
      return flattenCaracteristica(servicio)
      
      }catch(error){
        handleExeptions(error);
    }
  }

  async update(id: string, updateServicioDto: UpdateServicioDto) {
    try{
      const servicio = await this.findOne(id);
      if(servicio){
        await this.servicioRepository.update(id,updateServicioDto);
        return this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarServicio(id:string){
    try{
      const servicio = await this.findOne(id);
      if(servicio){
        await this.servicioRepository.update(id,{
          estatus:false
        });
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async activarServicio(id:string){
    try{
      const servicio = await this.findOne(id);
      if(servicio){
        await this.servicioRepository.update(id,{
          estatus:true
        });
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const servicio = await this.findOne(id);
      return {
        id:servicio.id,
        estatus:servicio.estatus
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async renovarServicio(){
    try{

    }catch(error){
      handleExeptions(error);
    }
  }
}
