import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { UpdateRenovacionDto } from './dto/update-renovacion.dto';
import { DesactivarRenovacionDto } from './dto/desactivar-renovacion.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { IvaGetter } from 'src/helpers/iva.getter';

@Injectable()
export class RenovacionService {

  constructor(
    @InjectRepository(Renovacion)
    private readonly renovacionRepository:Repository<Renovacion>,
    
    @Inject(IvaGetter)
    private readonly ivaGetter:IvaGetter
  ){}

  async create(createRenovacionDto: CreateRenovacionDto) {
    try{
      const {tarifaUnitaria, ivaFrontera} = createRenovacionDto;
      if(createRenovacionDto.ivaIncluido){
        const ivaDesglosado = await this.ivaGetter.desglosarIva(tarifaUnitaria,ivaFrontera);
        createRenovacionDto.tarifaUnitaria = ivaDesglosado.tarifa,
        createRenovacionDto.iva = ivaDesglosado.iva
      }
      console.log(createRenovacionDto.caracteristicasDelServicio);
      const renovacion = this.renovacionRepository.create(createRenovacionDto);
      await this.renovacionRepository.save(renovacion);
      return renovacion;

    }catch(error:any){
      handleExeptions(error)
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter();
      const renovaciones = await this.renovacionRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return renovaciones;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async findOne(id: string) {
    try{
      const renovacion = await this.renovacionRepository.findOneBy({id:id})
      if(!renovacion) throw new NotFoundException('No se encuentra la renovacion');
      return renovacion;
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async update(id: string, updateRenovacionDto: UpdateRenovacionDto) {
    try{

    }catch(error:any){
      handleExeptions(error)
    }
  }

  async remove(id: string) {
    try{

    }catch(error:any){
      handleExeptions(error)
    }
  }

  async obtenerEstatus(id:string){
    try{

    }catch(error:any){
      handleExeptions(error)
    }
  }

  async desactivarRenovacion(desactivarRenovacionDto:DesactivarRenovacionDto){
    try{

    }catch(error:any){
      handleExeptions(error)
    }
  }

}
