import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { INVOICE_STATUS } from "../interfaces/estatus-factura";
import { Transform } from "class-transformer";

export class CreateFacturaDto {


    @IsOptional()
    id: string;

    @IsOptional()
    orderIds: string[];

    @IsOptional()
    includeAdditionalTaxes: Boolean

    @IsString()
    @IsOptional()
    providerId: string;

    @IsString()
    @IsOptional()
    pdf: string;

    @IsString()
    @IsOptional()
    xml: string;

    @IsString()
    @IsOptional()
    folio: string;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaAprobacion: string;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaPago: string;

    @IsEnum(INVOICE_STATUS)
    @IsOptional()
    estatus: INVOICE_STATUS;

    @IsOptional()
    @IsString()
    motivoDeCancelacion: string;

    @IsOptional()
    @IsNumber()
    iva: number;

    @IsOptional()
    @IsNumber()
    subtotal: number;

    @IsOptional()
    @IsNumber()
    total: number;
}
