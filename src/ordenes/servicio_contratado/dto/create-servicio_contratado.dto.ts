import { IsObject, IsOptional, ValidateNested } from "class-validator";
import { ServicioDto } from "./servicio-json.dto";
import { Type } from "class-transformer";

export class CreateServicioContratadoDto {
    
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => ServicioDto,)
    servicio:ServicioDto

    calendarizacion:string;

    observacion:string;

    fechaInicio:string;

    fechaFinal:string;

    versionesSpot:number;
    
    impactosVersionSpot:number;

    numeroDiasSpot:number;


}
