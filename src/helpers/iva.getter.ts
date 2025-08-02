import { Global, Injectable } from "@nestjs/common";
import { IvaService } from "src/configuracion/iva/iva.service";
import { Decimal } from "decimal.js";

@Injectable()
@Global()
export class IvaGetter {
    constructor(
        private readonly ivaService: IvaService,
    ) { }

    async getTax(value: string, esIvaFrontera: boolean) {

        let taxPercentage = new Decimal("0");

        if (esIvaFrontera) {
            taxPercentage = new Decimal(await this.getBorderTax());
        } else {
            taxPercentage = new Decimal(await this.getNationalTax());
        }

        const rateDecimal = new Decimal(value);

        const tax = rateDecimal.times(taxPercentage);

        return tax.toDecimalPlaces(2, Decimal.ROUND_DOWN);
    }

    async calculateTaxBreakdown(value: string, isBorderTax: boolean) {

        let taxPercentage = new Decimal(0);

        if (isBorderTax) {
            taxPercentage = new Decimal(await this.getBorderTax());
        } else {
            taxPercentage = new Decimal(await this.getNationalTax());
        }

        const tarifaDecimal = new Decimal(value);

        const razonDeIva = new Decimal(1).plus(taxPercentage);

        const tarifaUnitariaSinIva = tarifaDecimal.dividedBy(razonDeIva);

        const ivaDesglosado = tarifaDecimal.minus(tarifaUnitariaSinIva);

        return {
            unitPrice: tarifaUnitariaSinIva.toDecimalPlaces(2).toString(),
            tax: ivaDesglosado.toDecimalPlaces(2).toString()
        };
    }

    async getNationalTax() {
        const nationalTax = await this.ivaService.obtenerIvaNacional();

        return new Decimal(nationalTax.porcentaje).dividedBy(100).toString();
    }

    async getBorderTax() {
        const borderTax = await this.ivaService.obtenerIvaFrontera();
        return new Decimal(borderTax.porcentaje).dividedBy(100).toString();
    }
};
