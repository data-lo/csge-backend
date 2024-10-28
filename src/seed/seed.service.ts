import { Injectable } from '@nestjs/common';
import { DepartamentosService } from 'src/administracion/departamentos/departamentos.service';
import { PuestosService } from 'src/administracion/puestos/puestos.service';
import { UsuariosService } from 'src/administracion/usuarios/usuarios.service';
import { departamentosData} from './data/administracion/departamentos.data';
import { puestosData } from './data/administracion/puestos.data';
import { plainToClass } from 'class-transformer';
import { CreateDepartamentoDto } from '../administracion/departamentos/dto/create-departamento.dto';
import { usuariosData } from './data/administracion/usuarios.data';
import { CreateUsuarioDto } from '../administracion/usuarios/dto/create-usuario.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { CreatePuestoDto } from 'src/administracion/puestos/dto/create-puesto.dto';
import { longitudData } from './data/catalogos/longitud.data';
import { FormatosService } from 'src/catalogos/formatos/formatos.service';
import { CaracteristicasService } from 'src/catalogos/caracteristicas/caracteristicas.service';
import { DimensionesService } from 'src/catalogos/dimensiones/dimensiones.service';
import { LongitudesService } from 'src/catalogos/longitudes/longitudes.service';
import { ImpresionesService } from 'src/catalogos/impresiones/impresiones.service';
import { TiemposService } from 'src/catalogos/tiempos/tiempos.service';
import { CreateLongitudDto } from 'src/catalogos/longitudes/dto/create-longitud.dto';
import { medidaDeImpresionData } from './data/catalogos/medida-de-impresion.data';
import { CreateImpresionDto } from 'src/catalogos/impresiones/dto/create-impresion.dto';
import { formatoData } from './data/catalogos/formato.data';
import { CreateFormatoDto } from 'src/catalogos/formatos/dto/create-formato.dto';
import { tiemposData } from './data/catalogos/tiempo.data';
import { CreateTiempoDto } from 'src/catalogos/tiempos/dto/create-tiempo.dto';
import { dimensionesData } from './data/catalogos/dimensiones.data';
import { CreateDimensionDto } from 'src/catalogos/dimensiones/dto/create-dimension.dto';
import { coloresData } from './data/configuracion/colores.data';

@Injectable()
export class SeedService {

  constructor(
    private readonly usuariosService:UsuariosService,
    private readonly puestosService:PuestosService,
    private readonly departamentosService:DepartamentosService,
    
    private readonly caracteristicasService:CaracteristicasService,
    private readonly dimensionsService:DimensionesService,
    private readonly formatosService:FormatosService,
    private readonly longitudService:LongitudesService,
    private readonly medidaDeImpresionService:ImpresionesService,
    private readonly tiemposService:TiemposService,

    private readonly colore

  ){}
  
  async seed(){
    try{
      //await this.insertarDepartamentos();
      //await this.insertarPuestos();
      //await this.insertarUsuarios();
      await this.seedCatalogos();
      
      return {message:'Datos Insertados Correctamente'};
    }catch(error){
      handleExeptions(error);
    }
  }

  async insertarPuestos(){
    try{
      for(const puesto of puestosData){
        const puestoDto = plainToClass(CreatePuestoDto,puesto);
        await this.puestosService.create(puestoDto);
      }
      return;
    }catch(error){
      handleExeptions(error);
    }
  }

  async insertarDepartamentos(){
    try{
      for(const departamento of departamentosData){
        const departamentoDto = plainToClass(CreateDepartamentoDto,departamento);
        await this.departamentosService.create(departamentoDto);
      };
      return;
    }catch(error){
      handleExeptions(error);
    }
  }


  async insertarUsuarios() {
    try {
      for (const usuario of usuariosData) {
        const { departamentoId, puestoId, ...rest } = usuario;
        const departamento = await this.departamentosService.findByTerm(departamentoId);
        const puesto = await this.puestosService.findByTerm(puestoId);
  
        const usuarioDto = plainToClass(CreateUsuarioDto, {
          departamentoId: departamento.id,
          puestoId: puesto.id,
          ...rest  
        });
  
        await this.usuariosService.create(usuarioDto);
      }
      return;
    } catch (error) {
      handleExeptions(error);
    }
  }
  
  async seedCatalogos(){
    try{
    
      //await this.insertarTiempo();
      //await this.insertarLongitud();
      //await this.insertarMedidaDeImpresion();
      //await this.insertarFormato();
      await this.insertarDimensiones();
      //await this.insertarCaracterisitcas();
    
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarCaracterisitcas(){
    try{
      //relacion con los opcionales de las caracteristicas
    }catch(error:any){
      handleExeptions(error);
    }
  } 
  
  async insertarDimensiones(){
    try{
      for(const dimension of dimensionesData){
        const {unidad, ...rest} = dimension;
        
        const unidadDb = await this.longitudService.findOneByUnidad(unidad);
        const unidadId = unidadDb.id;

        

        const dimensionDto = plainToClass(CreateDimensionDto,{
          unidad:unidadId,
          ...rest
        });

        await this.dimensionsService.create(dimensionDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }


  async insertarFormato(){
    try{
      for(const formato of formatoData){
        const formatoDto = plainToClass(CreateFormatoDto,formato);
        await this.formatosService.create(formatoDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarLongitud(){
    try{
      for(const longitud of longitudData){
        const longitudDto = plainToClass(CreateLongitudDto,longitud);
        await this.longitudService.create(longitudDto); 
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarMedidaDeImpresion(){
    try{
      for(const medidaDeImpresion of medidaDeImpresionData){
        const medidaDeImpresionDto = plainToClass(CreateImpresionDto,medidaDeImpresion);
        await this.medidaDeImpresionService.create(medidaDeImpresionDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  } 

  async insertarTiempo(){
    try{
      for(const tiempo of tiemposData){
        const tiempoDto = plainToClass(CreateTiempoDto,tiempo);
        await this.tiemposService.create(tiempoDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }


  async seedConfiguracion(){
    await this.insertarColores();
    await this.insertarCamposDeTexto();
    await this.insertarIva();
  };

  async insertarColores(){
    try{
      for(const color of coloresData){
        
      }
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarCamposDeTexto(){
    try{
      
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarIva(){
    try{
      
      
    }catch(error:any){
      handleExeptions(error);
    }
  }
}