import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class ServicioService {
  
  constructor(
    @InjectRepository(Servicio)
    private servicioRepository:Repository<Servicio>,
  ){}

  async create(createServicioDto: CreateServicioDto) {
    try{  
      const servicio = this.servicioRepository.create(createServicioDto);
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
        relations:{
          renovaciones:true
        }
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
      return servicio;
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

  async renovarServicio(){
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

}
