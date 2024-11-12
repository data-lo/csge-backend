import { IsEnum, IsString, IsUUID } from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";

export class CreateOrdenDto {
    
    @IsEnum(TipoDeServicio)
    tipoDeOrden:TipoDeServicio

    @IsString()
    @IsUUID()
    proveedorId:string;

    @IsString()
    @IsUUID()
    campañaId:string;

    @IsString()
    @IsUUID()
    contratoId:string;

    fechaDeEmision:string;

    motivoDeCancelacion:string;

    ordenAnteriorCancelada:string;

    facturaId:string;
}
