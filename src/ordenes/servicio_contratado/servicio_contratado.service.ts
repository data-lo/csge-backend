import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicioContratadoDto } from './dto/create-servicio_contratado.dto';
import { UpdateServicioContratadoDto } from './dto/update-servicio_contratado.dto';
import { Repository } from 'typeorm';
import { ServicioContratado } from './entities/servicio_contratado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { CarteleraGobierno } from '../cartelera_gobierno/entities/cartelera_gobierno.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class ServicioContratadoService {

  constructor(
    @InjectRepository(ServicioContratado)
    private servicioContratadoRepository:Repository<ServicioContratado>,
    @InjectRepository(CarteleraGobierno)
    private carteleraGobiernoRepository:Repository<ServicioContratado>
  ){}

  async create(createServicioContratadoDto: CreateServicioContratadoDto) {
    try{
      let cartelera = null;
      const {carteleraId, ...rest} = createServicioContratadoDto;
      if(carteleraId){
        cartelera = await this.carteleraGobiernoRepository.findOneBy({id:carteleraId});
        if(!cartelera) throw new NotFoundException('No se encuentra la cartelera');
      }
      const servicioContratado = this.servicioContratadoRepository.create({
        cartelera:cartelera,
        ...rest
      });
      await this.servicioContratadoRepository.save(servicioContratado);

      return servicioContratado;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll( pagina:number ) {
    try{
      const paginationSetter = new PaginationSetter()
      const serviciosContratados = await this.servicioContratadoRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:{
          cartelera:true
        }
      });
      return serviciosContratados;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const servicioContratado = await this.servicioContratadoRepository.findOne({
        where:{id:id},
        relations:{
          cartelera:true
        }
      });
      if(!servicioContratado) throw new NotFoundException('No se encuentra el servicio contratado');
      return servicioContratado;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateServicioContratadoDto: UpdateServicioContratadoDto) {
    try{
      const servicioContratado = await this.findOne(id);
      if(servicioContratado){
        const {servicio, carteleraId, ...rest} = updateServicioContratadoDto;
        let cartelera = null;
        
        if(carteleraId){
          cartelera = await this.carteleraGobiernoRepository.findOneBy({id:carteleraId});
          if(!cartelera) throw new NotFoundException('No se encuentra la cartelerea');
        }
        await this.servicioContratadoRepository.update(id,{
          servicio:Object(servicio),
          cartelera:cartelera,
          ...rest
        });
      }
      return await this.findOne(id);
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const servicioContratado = await this.findOne(id);
      if(servicioContratado){
        await this.servicioContratadoRepository.delete(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
