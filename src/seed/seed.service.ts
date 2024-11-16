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
import { ColoresService } from 'src/configuracion/colores/colores.service';
import { TextosService } from 'src/configuracion/textos/textos.service';
import { IvaService } from '../configuracion/iva/iva.service';
import { CreateColorDto } from 'src/configuracion/colores/dto/create-color.dto';
import { camposTextoData } from './data/configuracion/campos-texto.data';
import { CreateTextoDto } from 'src/configuracion/textos/dto/create-texto.dto';
import { ivaData } from './data/configuracion/iva.data';
import { CreateIvaDto } from 'src/configuracion/iva/dto/create-iva.dto';
import { municipiosData } from './data/proveedores/municipios.data';
import { CreateMunicipioDto } from '../proveedores/municipio/dto/create-municipio.dto';
import { MunicipioService } from 'src/proveedores/municipio/municipio.service';
import { ContactoService } from 'src/proveedores/contacto/contacto.service';
import { contactosData } from './data/proveedores/contactos.data';
import { CreateContactoDto } from 'src/proveedores/contacto/dto/create-contacto.dto';
import { ServiciosData } from './data/proveedores/servicios.data';
import { CreateServicioDto } from 'src/proveedores/servicio/dto/create-servicio.dto';
import { ServicioService } from 'src/proveedores/servicio/servicio.service';
import { DependenciasData } from './data/campañas/dependencias.data';
import { CreateDependenciaDto } from 'src/campañas/dependencia/dto/create-dependencia.dto';
import { DependenciaService } from 'src/campañas/dependencia/dependencia.service';
import { proveedoresData } from './data/proveedores/proveedores.data';
import { ProveedorParcialDto } from 'src/proveedores/proveedor/dto/proveedor-parcial.dto';
import { TipoProveedor } from 'src/proveedores/proveedor/interfaces/tipo-proveedor.interface';
import { ProveedorService } from 'src/proveedores/proveedor/proveedor.service';
import { EstacionService } from 'src/proveedores/estacion/estacion.service';

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

    private readonly coloresService:ColoresService,
    private readonly textosService:TextosService,
    private readonly ivaService:IvaService,

    private readonly municipioService:MunicipioService,
    private readonly contactosService:ContactoService,
    private readonly serviciosService:ServicioService,

    private readonly proveedoresService:ProveedorService,
    private readonly estacionService:EstacionService,

    //modulo campañas

    private readonly dependenciaService:DependenciaService,

  ){}
  
  async seedDb(){
    try{
      await this.seedAdministracion();
      await this.seedCatalogos();
      await this.seedConfiguracion();
      return {message:'Datos insertados en la DB'}
    }catch(error){
      handleExeptions(error);
    }
  }

  async seedAdministracion(){
    try{
      await this.insertarDepartamentos();
      await this.insertarPuestos();
      await this.insertarUsuarios();
      return {message:'Datos de Usuarios, Departamentos y Puestos insertados correctamente'};
    }catch(error:any){
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
    
      await this.insertarTiempo();
      await this.insertarLongitud();
      await this.insertarMedidaDeImpresion();
      await this.insertarFormato();
      await this.insertarDimensiones();
      //await this.insertarCaracterisitcas();
      return {message:'Datos de catalgos insertados correctamente'};
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
      let unidadDb;
      let unidadId:string;
      for(const dimension of dimensionesData){
        const {unidad, ...rest} = dimension;
        
        unidadDb = await this.longitudService.findOneByUnidad(unidad);
        unidadId = unidadDb.id;
        console.log(unidadId);
        let dimensionDto = plainToClass(CreateDimensionDto,{
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
    return{message:'Datos de Colores, Campos de texto e Iva Insertados Correctamente'}
  };

  async insertarColores(){
    try{
      for(const color of coloresData){
        const colorDto = plainToClass(CreateColorDto,color);
        await this.coloresService.create(colorDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarCamposDeTexto(){
    try{
      for(const texto of camposTextoData){
        const textoDto = plainToClass(CreateTextoDto,texto);
        await this.textosService.create(textoDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarIva(){
    try{
      for(const iva of ivaData){
        const ivaDto = plainToClass(CreateIvaDto,iva)
        await this.ivaService.create(ivaDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }


  async seedProveedores(){
    await this.insertarProveedores();
    //await this.insertarMunicipios();
    //await this.insertarContactos();
    //await this.insertarServicios();
    //await this.insertarEstaciones();
    
    return {message:"Datos de Municipios y Contactos insertados correctamente"};
  }

  async insertarMunicipios(){
    try{
      for(const municipio of municipiosData){
        const municipioDto = plainToClass(
          CreateMunicipioDto,{
            nombre:municipio.nombre.toUpperCase(),
            frontera:municipio.frontera,
            codigoInegi:municipio.codigoInegi
          }
        );
        await this.municipioService.create(municipioDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarContactos(){
    try{
      for(const contacto of contactosData){
        const {nombre,correoElectronico, observaciones,telefono} = contacto;
        if(observaciones){
          observaciones.toUpperCase()
        }
        const contactoDto = plainToClass(CreateContactoDto,{
          nombre:nombre.toUpperCase(),
          telefono:telefono,
          correoElectronico:correoElectronico.toUpperCase(),
          observaciones:observaciones
        });
        await this.contactosService.create(contactoDto);
      }
      return;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async insertarServicios(){
    try{
      for(const servicio of ServiciosData){
        const {nombreDeServicio, ...rest} = servicio;
        const servicioDto = plainToClass(CreateServicioDto,{
          nombreDeServicio:servicio.nombreDeServicio.toUpperCase(),
          ...rest
        });
        await this.serviciosService.create(servicioDto);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async insertarEstaciones(){

  }

  async insertarProveedores(){
    try{
      for(const proveedor of proveedoresData){
        const proveedorDto = plainToClass(
          ProveedorParcialDto,{
            rfc:proveedor.rfc.replaceAll(" ","").replaceAll("-","").trim(),
            razonSocial:proveedor.razonSocial.toUpperCase().trim(),
            tipoProveedor:TipoProveedor.PUBLICIDAD
          }
        )
        console.log(proveedorDto.rfc);
        await this.proveedoresService.create(proveedorDto);
      }
      return 'proveedores insertados exitosamente';
    }catch(error){

    }
  }

  async seedCampañas(){
    await this.insertarDependencias();
    return {message:'Dependencias insertadas correctamente'};
  }

  async insertarDependencias(){
    try{
      for(const dependencia of DependenciasData){
        const dependenciaDto = plainToClass(CreateDependenciaDto,{
          nombre:dependencia.nombre.toUpperCase()
        });
        await this.dependenciaService.create(dependenciaDto);
      }
      return;
    }catch(error){
      handleExeptions(error);
    }
  }
}