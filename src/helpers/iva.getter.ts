import { Global, Injectable } from "@nestjs/common";
import { IvaService } from "src/configuracion/iva/iva.service";
import { Decimal } from "decimal.js";

@Injectable()
@Global()
export class IvaGetter {
    constructor(
        private readonly ivaService: IvaService,
    ) { }

    async obtenerIva(tarifa: string | Decimal, esIvaFrontera: boolean) {
        let ivaPorcentaje = new Decimal(0);

        if (esIvaFrontera) {
            ivaPorcentaje = new Decimal(await this.obtenerIvaFrontera());
        } else {
            ivaPorcentaje = new Decimal(await this.obtenerIvaNacional());
        }

        const tarifaDecimal = new Decimal(tarifa);
        const iva = tarifaDecimal.times(ivaPorcentaje);

        return iva.toDecimalPlaces(4).toString();
    }

    async desglosarIva(tarifa: string | Decimal, esIvaFrontera: boolean) {
        let ivaPorcentaje = new Decimal(0);

        if (esIvaFrontera) {
            ivaPorcentaje = new Decimal(await this.obtenerIvaFrontera());
        } else {
            ivaPorcentaje = new Decimal(await this.obtenerIvaNacional());
        }

        const tarifaDecimal = new Decimal(tarifa);
        const razonDeIva = new Decimal(1).plus(ivaPorcentaje);
        const tarifaUnitariaSinIva = tarifaDecimal.dividedBy(razonDeIva);
        const ivaDesglosado = tarifaDecimal.minus(tarifaUnitariaSinIva);

        return {
            tarifa: tarifaUnitariaSinIva.toDecimalPlaces(4).toString(),
            iva: ivaDesglosado.toDecimalPlaces(4).toString()
        };
    }

    async obtenerIvaNacional() {
        const ivaNacional = await this.ivaService.obtenerIvaNacional();
        return new Decimal(ivaNacional.porcentaje).dividedBy(100).toString();
    }

    async obtenerIvaFrontera() {
        const ivaFrontera = await this.ivaService.obtenerIvaFrontera();
        return new Decimal(ivaFrontera.porcentaje).dividedBy(100).toString();
    }
};
