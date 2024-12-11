import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { CreateServicioContratadoDto } from "src/ordenes/servicio_contratado/dto/create-servicio_contratado.dto";

export class CreateOrdenDto {
    
    @IsOptional()
    @IsEnum(TipoDeServicio)
    tipoDeServicio:TipoDeServicio

    @IsOptional()
    @IsString()
    @IsUUID()
    proveedorId:string;

    @IsOptional()
    @IsString()
    @IsUUID()
    campaniaId:string;

    @IsOptional()
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

    @IsOptional()
    @IsArray()
    @ValidateNested({each:true})
    @Type(() => CreateServicioContratadoDto)
    serviciosContratados:CreateServicioContratadoDto[]

    @IsString()
    @IsOptional()
    @IsUUID()
    facturaId:string;
}
