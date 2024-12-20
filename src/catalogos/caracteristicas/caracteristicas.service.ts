import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCaracteristicaDto } from './dto/create-caracteristica.dto';
import { UpdateCaracteristicaDto } from './dto/update-caracteristica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Caracteristica } from './entities/caracteristica.entity';
import { Repository } from 'typeorm';
import { FormatosService } from '../formatos/formatos.service';
import { ImpresionesService } from '../impresiones/impresiones.service';
import { DimensionesService } from '../dimensiones/dimensiones.service';
import { LongitudesService } from '../longitudes/longitudes.service';
import { TiemposService } from '../tiempos/tiempos.service';
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { TipoUnidad } from './interfaces/tipo-unidad.interface';
import { flattenCaracteristica } from '../../helpers/flattenCaracterisitcas.function';


@Injectable()
export class CaracteristicasService {

  constructor(
    @InjectRepository(Caracteristica)
    private caracteristicasRepository:Repository<Caracteristica>,
    private formatoService:FormatosService,
    private impresionService:ImpresionesService,
    private dimensionesService:DimensionesService,
    private longitudService:LongitudesService,
    private tiemposService:TiemposService
  ){}
  
  async create(createCaracteristicaDto: CreateCaracteristicaDto) {
    try{
      let formatoDb, impresionDb, dimensionDb, unidadDb = null;
      const{
        formatoId,
        impresionId,
        dimensionesId,
        unidadId,
        tipoUnidad,
        ...rest
      } = createCaracteristicaDto;

      if(formatoId) formatoDb = await this.formatoService.findOne(formatoId);
      if(impresionId) impresionDb = await this.impresionService.findOne(impresionId);
      if(dimensionesId) dimensionDb = await this.dimensionesService.findOne(dimensionesId);

      if(tipoUnidad === TipoUnidad.LONGITUD){
        unidadDb = await this.longitudService.findOne(unidadId);
        if(unidadDb){
          unidadDb = unidadId;
        }
      }

      if(tipoUnidad === TipoUnidad.TIEMPO){
        unidadDb = await this.tiemposService.findOne(unidadId);
        if(unidadDb){
          unidadDb = unidadId;
        }
      }
      
      const caracterisiticas = this.caracteristicasRepository.create({
        formatoId:formatoDb,
        impresionId:impresionDb,
        dimensionId:dimensionDb,
        unidadId:unidadId,
        tipoUnidad:tipoUnidad,
        ...rest
      });

      await this.caracteristicasRepository.save(caracterisiticas);

      const {nombre, tipo, ...restFlatten} = flattenCaracteristica(caracterisiticas);
      return {
        nombreFormato:nombre,
        tipoFormato:tipo,
        ...restFlatten
      };

      }catch(error:any){
        handleExeptions(error);
      }
  }

  async findAll() {
    try{
      const caracteristicas = await this.caracteristicasRepository.find({});
      return caracteristicas;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const caracteristica = await this.caracteristicasRepository.findOne({
        where:{id:id},
        relations:{
          dimensionId:true,
          formatoId:true,
          impresionId:true,
        }
      });
      if(!caracteristica) throw new NotFoundException('No se encontro la caracterisitca');
      
      let unidad = null;
      
      if(caracteristica.tipoUnidad === TipoUnidad.LONGITUD){
        unidad = await this.longitudService.findOne(caracteristica.unidadId);
      }
      if(caracteristica.tipoUnidad === TipoUnidad.TIEMPO){  
        unidad = await this.tiemposService.findOne(caracteristica.unidadId);
      }
      
      const {unidadId, ...rest} = caracteristica;
      return {...rest,unidadId:unidad};
    
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async update(id: string, updateCaracteristicaDto: UpdateCaracteristicaDto) {
    try {
      
      const caracteristicaDb = await this.caracteristicasRepository.findOneBy({id:id});
      if (!caracteristicaDb) {
        throw new NotFoundException(`Característica no encontrada`);
      }
  
      
      let formatoDb, impresionDb, dimensionDb, unidadDb = null;
      const { formatoId, impresionId, dimensionesId, unidadId, tipoUnidad, ...rest } = updateCaracteristicaDto;
  
    
      if (formatoId) formatoDb = await this.formatoService.findOne(formatoId);
      if (impresionId) impresionDb = await this.impresionService.findOne(impresionId);
      if (dimensionesId) dimensionDb = await this.dimensionesService.findOne(dimensionesId);
  
      if (tipoUnidad === TipoUnidad.LONGITUD && unidadId) {
        unidadDb = await this.longitudService.findOne(unidadId);
        if (unidadDb) {
          unidadDb = unidadId;
        }
      }
  
      if (tipoUnidad === TipoUnidad.TIEMPO && unidadId) {
        unidadDb = await this.tiemposService.findOne(unidadId);
        if (unidadDb) {
          unidadDb = unidadId;
        }
      }
  
      const updatedCaracteristica = this.caracteristicasRepository.merge(caracteristicaDb, {
        formatoId: formatoDb ?? caracteristicaDb.formatoId,
        impresionId: impresionDb ?? caracteristicaDb.impresionId,
        dimensionId: dimensionDb ?? caracteristicaDb.dimensionId,
        unidadId: unidadDb ?? caracteristicaDb.unidadId,
        tipoUnidad: tipoUnidad ?? caracteristicaDb.tipoUnidad,
        ...rest
      });
  
      await this.caracteristicasRepository.save(updatedCaracteristica);
      return flattenCaracteristica(updatedCaracteristica);
  
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const caracterisicaDb = await this.caracteristicasRepository.findOneBy({id:id});
      if(!caracterisicaDb) throw new NotFoundException('No se econtro la caracteristica');
      await this.caracteristicasRepository.delete({id:id});
      return {message:'caracteristica eliminada correctamente'};
    }catch(error:any){
      handleExeptions(error);
    }
  }
}
