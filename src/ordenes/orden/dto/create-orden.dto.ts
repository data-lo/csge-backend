import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { CreateServicioContratadoDto } from "src/ordenes/servicio_contratado/dto/create-servicio_contratado.dto";

export class CreateOrdenDto {
    
    
    @IsEnum(TipoDeServicio)
    tipoDeServicio:TipoDeServicio

    @IsString()
    @IsUUID()
    proveedorId:string;
    
    @IsString()
    @IsUUID()
    campaniaId:string;

    @IsString()
    @IsUUID()
    contratoId:string;

    @IsOptional()
    fechaDeEmision:Date;

    @IsString()
    @IsOptional()
    motivoDeCancelacion:string;

    @IsString()
    @IsOptional()
    ordenAnteriorCancelada:string;

    @IsArray()
    @ValidateNested({each:true})
    @Type(() => CreateServicioContratadoDto)
    serviciosContratados:CreateServicioContratadoDto[]

    @IsString()
    @IsOptional()
    @IsUUID()
    facturaId:string;
}
