import { Transform } from "class-transformer";
import { IsDecimal, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateDimensionDto {
    
    @IsDecimal({
        decimal_digits:'2'
    })
    @IsOptional()
    alto:number;

    @IsDecimal({
        decimal_digits:'2'
    })
    @IsOptional()
    ancho:number;

    @IsString()
    @IsUUID()
    longitudId:string;
}
