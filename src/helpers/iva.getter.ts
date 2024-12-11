import { Global, Injectable } from "@nestjs/common";
import { IvaService } from "src/configuracion/iva/iva.service";

@Injectable()
@Global()
export class IvaGetter {
    constructor(
        private readonly ivaService:IvaService,
    ){}

    async desglosarIva(tarifa:number,esIvaFrontera:boolean){
        
        let ivaPorcentaje:number = 0.0000;

        if(esIvaFrontera){
            ivaPorcentaje =  await this.obtenerIvaFrontera();
        }else{
            ivaPorcentaje = await this.obtenerIvaNacional();
        }
        
        const razonDeIva = 1.0000 + ivaPorcentaje;
        console.log(razonDeIva);
        
        const tarifaUnitariaSinIva = ( tarifa / razonDeIva);
        const ivaDesglosado = (tarifa - tarifaUnitariaSinIva);
        
        console.log('tarifa unitaria sin iva ',tarifaUnitariaSinIva)

        console.log('iva ',ivaDesglosado)
        return {
            tarifa:parseFloat(tarifaUnitariaSinIva.toFixed(4)),
            iva:parseFloat(ivaDesglosado.toFixed(4))
        }   
    }

    async obtenerIvaNacional(){
        const ivaNacional = await this.ivaService.obtenerIvaNacional()
        return (ivaNacional.porcentaje/100);
    }

    async obtenerIvaFrontera(){
        const ivaFrontera = await this.ivaService.obtenerIvaFrontera()
        return (ivaFrontera.porcentaje/100);
    }

};