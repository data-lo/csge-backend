import { Type} from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Min, IsObject, ValidateNested, IsUUID, isBoolean } from 'class-validator';
import { CaracteristicasDelServicioDto } from "./caracteristicas-del-servicio.dto";

export class CreateRenovacionDto {
    
    @IsString()
    descripcionDelServicio:string;

    @IsNumber({maxDecimalPlaces:4})
    @Min(0.0001)
    tarifaUnitaria:number;

    @IsNumber({maxDecimalPlaces:4})
    @IsOptional()
    @Min(0.0001)
    iva:number;

    @IsBoolean()
    ivaIncluido:boolean;

    @IsBoolean()
    ivaFrontera:boolean;

    @IsObject()
    @ValidateNested()
    @Type(() => CaracteristicasDelServicioDto)
    caracteristicasDelServicio:CaracteristicasDelServicioDto;

    @IsUUID()
    @IsString()
    servicioId:string;
}