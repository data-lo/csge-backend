import { Transform} from "class-transformer";
import { IsBoolean, IsDate, IsJSON, IsNumber, IsObject, IsOptional, IsString, Min} from "class-validator";

export class CreateRenovacionDto {
    
    @IsString()
    descripcionDelServicio:string;

    caracteristicasDelServicio:string;

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
}
