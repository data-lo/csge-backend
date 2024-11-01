import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { Repository } from 'typeorm';
import { MunicipioService } from '../municipio/municipio.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';


@Injectable()
export class EstacionService {

  constructor(
    @InjectRepository(Estacion)
    private estacionRepository:Repository<Estacion>,
    private readonly municipioService:MunicipioService
  ){}

  async create(createEstacionDto: CreateEstacionDto) {
    try{
      
      const{municipiosIds,...rest} = createEstacionDto; 

      let municipios = [];
      for(const municipio of municipiosIds){
        const municipioDb = await this.municipioService.findOne(municipio)
        municipios.push(municipioDb);
      }

      const estacion = this.estacionRepository.create({
        municipios:municipios,
        ...rest
      });

      await this.estacionRepository.save(estacion);
      return estacion;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try{
      const paginationSetter = new PaginationSetter;
      const estaciones = await this.estacionRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:{
          municipios:true,
        }
      });
      return estaciones;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const estacion = await this.estacionRepository.findOne({
        where:{id:id},
        relations:{
          municipios:true,
          contactos:true,
          servicios:{
            renovaciones:true
          }
        }
      });
      if(!estacion) throw new BadRequestException('La estacion no se encuentra');
      return estacion;
    }catch(error){
      handleExeptions(error);
    }
  }  

  async update(id: string, updateEstacionDto: UpdateEstacionDto) {
    try{

      const {municipiosIds, ...rest} = updateEstacionDto;
      const estacionDb = await this.estacionRepository.findOne({
        where:{id:id},
        relations:{
          municipios:true
        }
      });

      if(!estacionDb) throw new NotFoundException('La estacion no se encuentra');
      
      Object.assign(estacionDb,rest);
      if(municipiosIds && municipiosIds.length > 0){
        
        const municipios = await Promise.all(
          municipiosIds.map(municipioId => 
            this.municipioService.findOne(municipioId)
          )
        );

        estacionDb.municipios = municipios;
      }
      
      if(municipiosIds && municipiosIds.length === 0){
        estacionDb.municipios = [];
      };

      await this.estacionRepository.save(estacionDb);
      return  await this.findOne(id);

    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarEstacion(id:string){
    try{
      const estacion = await this.findOne(id);
      if(estacion){
        await this.estacionRepository.update(id,{
          estatus:false
        });
        return await this.findOne(id)
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  agregarContacto(){

  }

  eliminarContacto(){

  }

  agregarServicio(){

  }

  eliminarServicio(){

  }

  agregarLugarDeOperacion(){

  }

  eliminarLugarDeOperacion(){

  }


}
