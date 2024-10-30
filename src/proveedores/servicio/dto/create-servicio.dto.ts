import { IsBoolean, IsEnum, IsOptional} from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";

export class CreateServicioDto {
    
    @IsEnum(TipoDeServicio)
    tipoDeServicio:TipoDeServicio;

    @IsBoolean()
    @IsOptional()
    estatus:boolean;
}
