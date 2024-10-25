import {IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateDimensionDto {
    
    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    alto:number;

    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    ancho:number;

    @IsString()
    @IsUUID()
    longitudId:string;
}
