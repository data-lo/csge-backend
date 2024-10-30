import { Transform, Type} from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Min, IsObject, ValidateNested } from 'class-validator';
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

    @IsDate()
    @IsOptional()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaDeCreacion:Date;

    @IsBoolean()
    @IsOptional()
    estatus:boolean;

    @IsObject()
    @ValidateNested()
    @Type(() => CaracteristicasDelServicioDto)
    caracteristicasDelServicio:CaracteristicasDelServicioDto;
}