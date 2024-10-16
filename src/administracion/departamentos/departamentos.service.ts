import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { Repository } from 'typeorm';
import { PagintionSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class DepartamentosService{
  
  constructor(
    @InjectRepository(Departamento)
    private departamentoRepository:Repository<Departamento>,
  ){}

  async create(createDepartamentoDto: CreateDepartamentoDto) {
    try{
    
      const departamento = this.departamentoRepository.create(
        createDepartamentoDto
      );
      await this.departamentoRepository.save(departamento);
      return departamento;
    
    }catch(error){
      this.handleExceptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PagintionSetter()
      return await this.departamentoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit()
      });
    
    }catch(error){
      this.handleExceptions(error);
    }
  }

  findOne(id:number) {
    return `This action returns a #${id} departamento`;
  }

  update(id: number, updateDepartamentoDto: UpdateDepartamentoDto) {
    return `This action updates a #${id} departamento`;
  }

  remove(id: number) {
    return `This action removes a #${id} departamento`;
  }


  private handleExceptions(error:any){
    throw new BadRequestException(error.detail);
  }

}
