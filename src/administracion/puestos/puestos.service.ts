import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Puesto } from './entities/puesto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { handleExeptions } from '../../helpers/handleExceptions.function';

@Injectable()
export class PuestosService {
  constructor(
    @InjectRepository(Puesto)
    private puestoRepository:Repository<Puesto>,
  ){}

  async create(createPuestoDto: CreatePuestoDto) {
    try{
      const puesto = this.puestoRepository.create(
        createPuestoDto
      );
      await this.puestoRepository.save(puesto);
      return puesto;
    }catch(error){
      handleExeptions(error);
    }    
  }
  
  
  async findAll(){ 
    try{
      return await this.puestoRepository.find();
    }catch(error){
      handleExeptions(error);
    }
  }

  
  async findOne(id:string) {
    try{
      const puesto = await this.puestoRepository.findOneBy({id:id});
      if(!puesto){
        throw new NotFoundException('Puesto no encontrado');
      };
      return puesto;
    }catch(error){
      handleExeptions(error);
    };
  }

  async findByTerm(term:string) {
    try{
      const puesto = await this.puestoRepository.findOneBy({nombre:term});
      if(!puesto){
        throw new NotFoundException('Puesto no encontrado');
      };
      return puesto;
    }catch(error){
      handleExeptions(error);
    };
  }

  async update(id: string, updatePuestoDto: UpdatePuestoDto) {
    try{
      const puesto = await this.findOne(id);
      if(puesto){
        const updateResult = await this.puestoRepository.update(id,updatePuestoDto);
        if(updateResult.affected === 0){
          throw new NotFoundException('Puesto no encontrado');
        }
        return this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  
  async remove(id: string) {
    try{
      const puesto = await this.findOne(id);
      if(puesto){
        await this.puestoRepository.delete({id:id});
        return {deleted:true,message:'Puesto eliminado'}
      }
    }catch(error){
      handleExeptions(error);
    }
  }
  
}
