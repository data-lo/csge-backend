import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";
import { CreateServicioContratadoDto } from "src/ordenes/servicio_contratado/dto/create-servicio_contratado.dto";

export class CreateOrdenDto {
    
    
    @IsEnum(TIPO_DE_SERVICIO)
    tipoDeServicio:TIPO_DE_SERVICIO

    @IsString()
    @IsUUID()
    proveedorId:string;
    
    @IsOptional()
    @IsString()
    @IsUUID()
    campaniaId:string;

    @IsOptional()
    contratoId:string;

    @IsOptional()
    fechaDeEmision:Date;

    @IsString()
    @IsOptional()
    motivoDeCancelacion:string;

    @IsString()
    @IsOptional()
    ordenAnteriorCancelada:string;

    @IsBoolean()
    @IsOptional()
    esCampania:boolean;

    @IsArray()
    @ValidateNested({each:true})
    @Type(() => CreateServicioContratadoDto)
    serviciosContratados:CreateServicioContratadoDto[]

    @IsString()
    @IsOptional()
    @IsUUID()
    facturaId:string;
}
