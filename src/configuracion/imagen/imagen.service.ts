import { join } from 'path'
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImagenService{
  private readonly rutaDeCarga = join(__dirname,'../../../static/uploads/imagen');
  
  getImagen(){
    const imagen = readdirSync(this.rutaDeCarga)
    if(!imagen.length){
      return null;
    }
    return join(this.rutaDeCarga,imagen[0]);
  }


  eliminarImagenExistente(){
    const imagenesCargadas = readdirSync(this.rutaDeCarga);
    if(imagenesCargadas.length > 1){
      const rutaDeImagenCargada = join(this.rutaDeCarga,imagenesCargadas[0]);
      if(existsSync(rutaDeImagenCargada)){
        unlinkSync(rutaDeImagenCargada);
      }
    }else{
      return;
    }
  }

  eliminarImagen(){
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
  }
}
