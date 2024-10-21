import { IsEnum, IsNumber, Max, Min } from "class-validator";
import { Territorio } from "../interfaces/territorios";
import { Transform, Type } from "class-transformer";

export class CreateIvaDto {
    
    @Type(()=>Number)
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    @Max(1)
    @Transform(({value}) => value/100)
    porcentaje:number

    @IsEnum(Territorio)
    territorio:Territorio
}
