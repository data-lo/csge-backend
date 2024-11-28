import { Transform, Type} from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min, IsObject, ValidateNested, IsUUID } from 'class-validator';
import { CaracteristicasDelServicioDto } from "./caracteristicas-del-servicio.dto";

export class CreateRenovacionDto {
    
    @IsString()
    descripcionDelServicio:string;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    tarifaUnitaria:number;

    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    @Min(0.01)
    iva:number;

    @IsBoolean()
    ivaIncluido:boolean;

    @IsBoolean()
    ivaFrontera:boolean;

    
    @IsOptional()
    fechaDeCreacion:Date;

    @IsBoolean()
    @IsOptional()
    estatus:boolean;

    @IsObject()
    @ValidateNested()
    @Type(() => CaracteristicasDelServicioDto)
    caracteristicasDelServicio:CaracteristicasDelServicioDto;

    @IsUUID()
    @IsString()
    servicioId:string;
}