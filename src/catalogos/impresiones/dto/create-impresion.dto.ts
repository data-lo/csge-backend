import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateImpresionDto {
    
    @IsString()
    medidaDeImpresion:string;

    @IsString()
    @IsUUID()
    @IsOptional()
    dimensionesId:string;

}
