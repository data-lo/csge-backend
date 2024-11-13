import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
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
    campañaId:string;

    @IsString()
    @IsUUID()
    contratoId:string;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaDeEmision:string;

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
