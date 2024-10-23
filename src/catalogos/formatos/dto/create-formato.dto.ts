import { IsEnum, IsString } from "class-validator";
import { TipoFormato } from "../interfaces/tipo.formato";

export class CreateFormatoDto {
    
    @IsString()
    nombre:string;

    @IsEnum(TipoFormato)
    tipo:TipoFormato
}
