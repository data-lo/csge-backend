import { Global, Injectable } from "@nestjs/common";
import { IvaService } from "src/configuracion/iva/iva.service";

@Injectable()
@Global()
export class IvaGetter {
    constructor(
        private readonly ivaService:IvaService,
    ){}

    async desglosarIva(tarifa:number,esIvaFrontera:boolean){
        let iva:number = 0.00
        if(esIvaFrontera){
            iva = (tarifa * await this.obtenerIvaFrontera());
        }else{
            iva = (tarifa * await this.obtenerIvaNacional());
        }
        const tarifaSinIva = tarifa - iva;
        return {
            tarifa:parseFloat(tarifaSinIva.toFixed(2)),
            iva:parseFloat(iva.toFixed(2))
        }   
    }

    async obtenerIvaNacional(){
        const ivaNacional = await this.ivaService.obtenerIvaNacional()
        return ivaNacional.porcentaje/100;
    }

    async obtenerIvaFrontera(){
        const ivaFrontera = await this.ivaService.obtenerIvaFrontera()
        return ivaFrontera.porcentaje/100;
    }


};