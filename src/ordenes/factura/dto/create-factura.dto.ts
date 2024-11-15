import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { EstatusFactura } from "../interfaces/estatus-factura";
import { Transform } from "class-transformer";

export class CreateFacturaDto {
    
    
    @IsUUID()
    @IsOptional()
    id:string;
    
    @IsOptional()
    @IsArray({each:true})
    ordenesDeServicioIds:string[];

    @IsUUID()
    @IsString()
    @IsOptional()
    proveedorId:string;
    
    @IsString()
    @IsOptional()
    pdf:string;

    @IsString()
    @IsOptional()
    xml:string;

    @IsBoolean()
    @IsOptional()
    validacionTestigo:boolean;

    @IsDate()
    @IsOptional()
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
    iva:number;

    @IsOptional()
    @IsNumber()
    subtotal:number;

    @IsOptional()
    @IsNumber()
    total:number;

}
