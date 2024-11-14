import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { EstatusFactura } from "../interfaces/estatus-factura";
import { Transform } from "class-transformer";

export class CreateFacturaDto {
    
    @IsArray({each:true,})
    ordenesDeServicio:string[];

    @IsUUID()
    @IsString()
    proveedorId:string;
    
    @IsString()
    pdf:string;

    @IsString()
    xml:string;

    @IsBoolean()
    validacionTestigo:boolean;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaValidacion:string;

    @IsOptional()
    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaAprobacion:string;

    @IsOptional()
    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaRecepcion:string;
    
    @IsOptional()
    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaPago:string;

    @IsEnum(EstatusFactura)
    @IsOptional()
    estatus:EstatusFactura;
    
    @IsOptional()
    @IsString()
    motivoDeCancelacion:string;

    @IsOptional()
    @IsNumber()
    iva:string;

    @IsOptional()
    @IsNumber()
    subtotal:string;

    @IsOptional()
    @IsNumber()
    total:string;

}
