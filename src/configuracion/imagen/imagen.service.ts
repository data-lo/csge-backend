import { join } from 'path'
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { handleExeptions } from '../../helpers/handleExceptions.function';

@Injectable()
export class ImagenService{
  private readonly rutaDeCarga = join(__dirname,'../../../static/uploads/imagen');
  
  getImagen(){
    try{
      const imagen = readdirSync(this.rutaDeCarga)
      if(!imagen.length){
        return null;
      }
      return join(this.rutaDeCarga,imagen[0]);
    }catch(error:any){
      handleExeptions(error);
    }
  }


  eliminarImagenExistente(){
    try{
      const imagenesCargadas = readdirSync(this.rutaDeCarga);
      if(imagenesCargadas.length > 1){
        const rutaDeImagenCargada = join(this.rutaDeCarga,imagenesCargadas[0]);
        if(existsSync(rutaDeImagenCargada)){
          unlinkSync(rutaDeImagenCargada);
        }
      }else{
        return;
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  eliminarImagen(){
    try{
      const imagenesCargadas = readdirSync(this.rutaDeCarga);
      if(imagenesCargadas.length = 1){
        const rutaDeImagenCargada = join(this.rutaDeCarga,imagenesCargadas[0]);
        if(existsSync(rutaDeImagenCargada)){
          unlinkSync(rutaDeImagenCargada);
          return {message:"Imagen eliminada"};
        }
      }else{
        return;
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
