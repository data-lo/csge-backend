import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivacionDto } from './dto/create-activacion.dto';
import { UpdateActivacionDto } from './dto/update-activacion.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Activacion } from './entities/activacion.entity';
import { Repository } from 'typeorm';
import { Partida } from '../partida/entities/partida.entity';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { Campaña } from '../campañas/entities/campaña.entity';
import { localeTimeFormatter } from 'src/helpers/localeTimeZoneFormater.function';

@Injectable()
export class ActivacionService {

  constructor(
    @InjectRepository(Activacion)
    private activacionRepository:Repository<Activacion>,
    @InjectRepository(Partida)
    private partidaRepository:Repository<Partida>,
    @InjectRepository(Campaña)
    private campañaRepository:Repository<Campaña>
  
  ){}

  async create(createActivacionDto: CreateActivacionDto) {
    try{
      const {partidaId, campañaId, ...rest} = createActivacionDto;
      const campañaDb = await this.campañaRepository.findOneBy({id:campañaId});
      if(!campañaDb) throw new NotFoundException('Campaña no encontrada');
      const partidaDb = await this.partidaRepository.findOneBy({id:partidaId})
      if(!partidaDb) throw new NotFoundException('Partida no encontrada');
      
      const fechaDeCreacion = new Date();

      const activacion = this.activacionRepository.create({
        partida:partidaDb,
        campaña:campañaDb,
        fechaDeCreacion:localeTimeFormatter(fechaDeCreacion),
        ...rest
      });

      await this.activacionRepository.save(activacion);
      return activacion;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const activaciones = await this.activacionRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina)
      });
      return activaciones;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string) {
    try{
      const activacion = await this.activacionRepository.findOneBy({
        id:id
      });
      if(!activacion) throw new NotFoundException('No se encuentra la activacion');
      return activacion;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id:string, updateActivacionDto: UpdateActivacionDto) {
    try{
      const activacionDb = await this.findOne(id);
      Object.assign(activacionDb,updateActivacionDto);
      const updatedActivacion = await this.activacionRepository.save(activacionDb);
      return updatedActivacion;
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id:string) {
    try{
      const activacion = await this.findOne(id);
      await this.activacionRepository.remove(activacion);
      return {message:'Activacion eliminada correctamente'};
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const activacion = await this.findOne(id);
      return {id:activacion.id,estatus:activacion.estatus};
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivar(id:string){
    try{
      const activacionDb = await this.activacionRepository.findOneBy({id:id});
      if(!activacionDb) throw new NotFoundException('No se encuentra la activacion');
      activacionDb.estatus = false;
      await this.activacionRepository.save(activacionDb);
      return {estatus:true,message:'Activacion Desactivada Exitosamente'};
    }catch(error){
      handleExeptions(error);
    }
  }
}
