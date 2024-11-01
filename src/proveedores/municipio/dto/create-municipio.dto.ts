import { IsBoolean, IsString } from "class-validator";

export class CreateMunicipioDto {
    
    @IsString()
    nombre:string;

    @IsString()
    codigoInegi:string;

    @IsBoolean()
    frontera:boolean;
}
