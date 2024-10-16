import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { Puesto } from './entities/puesto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagintionSetter } from 'src/helpers/pagination.getter';

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
      this.handleExceptions(error);
    }    
  }
  
  
  async findAll(pagina:number) {

    const paginationSetter = new PagintionSetter()
    try{
      return await this.puestoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit(),
      });
    
    }catch(error){
      console.log(error);
      this.handleExceptions(error);
    }
  }

  
  findOne(id: number) {
    return `This action returns a #${id} puesto`;
  }

  
  update(id: number, updatePuestoDto: UpdatePuestoDto) {
    return `This action updates a #${id} puesto`;
  }

  
  remove(id: number) {
    return `This action removes a #${id} puesto`;
  }
  
  
  private handleExceptions(error:any){
    throw new BadRequestException(error.detail);
  }

}
