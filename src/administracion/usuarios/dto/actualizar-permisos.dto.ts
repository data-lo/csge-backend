import { IsArray, IsEnum, IsUUID } from "class-validator";
import { ValidPermises } from "../interfaces/usuarios.permisos";

export class ActualizarPermisosDto{

    @IsUUID()
    id:string;
    
    @IsArray()
    @IsEnum(ValidPermises,{each:true})
    permisos:ValidPermises[];
}