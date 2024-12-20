import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { DesactivarRenovacionDto } from './dto/desactivar-renovacion.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { IvaGetter } from 'src/helpers/iva.getter';
import { Servicio } from '../servicio/entities/servicio.entity';

@Injectable()
export class RenovacionService {

  constructor(
    @InjectRepository(Renovacion)
    private readonly renovacionRepository:Repository<Renovacion>,
    @Inject(IvaGetter)
    private readonly ivaGetter:IvaGetter,  
    @InjectRepository(Servicio)
    private readonly servicioRepository:Repository<Servicio>
  ){}

  async create(createRenovacionDto: CreateRenovacionDto) {
    try{  
      
      let {tarifaUnitaria, ivaFrontera, servicioId, iva, ...rest} = createRenovacionDto;
      if(servicioId){
        const servicioDb = await this.servicioRepository.findOne(
          {
            where:{id:servicioId},
            relations:{renovaciones:true}
          }
        );
        servicioDb.renovaciones[-1].estatus = false;
        await this.servicioRepository.save(servicioDb);

        if(createRenovacionDto.ivaIncluido){
          const ivaDesglosado = await this.ivaGetter.desglosarIva(tarifaUnitaria,ivaFrontera);
          tarifaUnitaria = ivaDesglosado.tarifa,
          iva = ivaDesglosado.iva
        }

        if(!createRenovacionDto.ivaIncluido){
          iva = await this.ivaGetter.obtenerIva(tarifaUnitaria,ivaFrontera);
        }
        
        const renovacion = this.renovacionRepository.create({
          servicio:servicioDb,
          tarifaUnitaria:tarifaUnitaria,
          fechaDeCreacion: new Date(),
          iva:iva,
          ...rest
        });
        await this.renovacionRepository.save(renovacion);
        delete renovacion.servicio;
        return renovacion;
      }
      throw new NotFoundException('El servicio no se encuentra');
    
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

  async remove(id: string) {
    try{
      const renovacionDb = await this.findOne(id);
      if(renovacionDb){
        await this.renovacionRepository.delete(id);
        return {message:'Renovacion eliminada existosamente'};
      }
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async obtenerEstatus(id:string){
    try{
      const renovacionDb = await this.findOne(id);
      if(renovacionDb){
        return {renovacionId:`${id}`,estatus:renovacionDb.estatus};
      }
    }catch(error:any){
      handleExeptions(error)
    }
  }

  async desactivarRenovacion(desactivarRenovacionDto:DesactivarRenovacionDto){
    try{
      const {renovacionId} = desactivarRenovacionDto;
      const renovacionDb = await this.findOne(renovacionId);
      if(renovacionDb){
        await this.renovacionRepository.update(renovacionId,{estatus:false});
        const renovacion = await this.findOne(renovacionId);
        return {message:'Renovacion desactivada exitosamente',estaus:renovacion.estatus};
      }

    }catch(error:any){
      handleExeptions(error)
    }
  }
}
