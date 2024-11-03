import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID} from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";

export class CreateServicioDto {
    
    @IsEnum(TipoDeServicio)
    tipoDeServicio:TipoDeServicio;

    @IsString()
    nombreDeServicio:string;

    @IsBoolean()
    @IsOptional()
    estatus:boolean;

    @IsUUID()
    @IsString()
    estacionId:string;
}
