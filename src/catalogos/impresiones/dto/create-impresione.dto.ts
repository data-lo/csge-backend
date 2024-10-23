import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateImpresioneDto {
    
    @IsString()
    medidaDeImpresion:string;

    @IsString()
    @IsUUID()
    @IsOptional()
    dimensionesId:string;

}
