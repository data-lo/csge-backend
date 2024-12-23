import { IsArray, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { ServicioDto } from "./servicio-json.dto";
import { Type } from "class-transformer";

export class CreateServicioContratadoDto {
    
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => ServicioDto,)
    servicio:ServicioDto

    @IsOptional()
    @IsArray()
    calendarizacion:Date[];

    @IsOptional()
    cantidad:number;

    @IsString()
    @IsOptional()
    observacion:string;

    @IsOptional()
    fechaInicio:Date;

    @IsOptional()
    fechaFinal:Date;

    @IsNumber()
    @IsInt()
    @IsOptional()
    versionesSpot:number;
    
    @IsNumber()
    @IsInt()
    @IsOptional()
    impactosVersionSpot:number;

    @IsNumber()
    @IsInt()
    @IsOptional()
    numeroDiasSpot:number;

    @IsOptional()
    carteleraId:string;

    @IsUUID()
    @IsOptional()
    ordenId:string;
}
