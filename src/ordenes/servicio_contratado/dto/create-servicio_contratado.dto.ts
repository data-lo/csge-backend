import { IsArray, IsDate, IsInt, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { ServicioDto } from "./servicio-json.dto";
import { Transform, Type } from "class-transformer";
import { Orden } from "src/ordenes/orden/entities/orden.entity";

export class CreateServicioContratadoDto {
    
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => ServicioDto,)
    servicio:ServicioDto

    @IsOptional()
    @IsArray()
    @Transform(({value}) => {
        return value.map((dateString:string) => {
            const [day, month, year] = dateString.split('-');
            return new Date(`${year}-${month}-${day}`);
        });
    })
    @IsDate({each:true})
    calendarizacion:Date[];

    @IsNumber()
    cantidad:number;

    @IsString()
    @IsOptional()
    observacion:string;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaInicio:string;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaFinal:string;

    @IsNumber()
    @IsPositive()
    @IsInt()
    @IsOptional()
    versionesSpot:number;
    
    @IsNumber()
    @IsPositive()
    @IsInt()
    @IsOptional()
    impactosVersionSpot:number;

    @IsNumber()
    @IsPositive()
    @IsInt()
    @IsOptional()
    numeroDiasSpot:number;

    @IsUUID()
    @IsString()
    @IsOptional()
    carteleraId:string;

    @IsUUID()
    @IsOptional()
    ordenId:string;
}
