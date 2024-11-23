import { EstatusDeContrato } from "src/contratos/interfaces/estatus-de-contrato";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { Transform } from "class-transformer";

export class CreateContratoModificatorioDto {
    
    @IsUUID()
    @IsString()
    contratoId:string
    
    @IsEnum(EstatusDeContrato)
    @IsOptional()
    estatusDeContrato:EstatusDeContrato;

    @IsString()
    numeroDeContrato:string;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoMinimoContratado:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    ivaMontoMinimoContratado:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoMaximoContratado:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    ivaMontoMaximoContratado:number;

    @IsOptional()
    @IsBoolean()
    ivaFrontera:boolean;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoEjecido:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoPagado:number;

    @IsOptional()
    fechaInicial:Date;

    @IsOptional()
    fechaFinal:Date;

    @IsString()
    @IsOptional()
    linkContrato:string;

    @IsUUID()
    @IsOptional()
    @IsArray({each:true})
    ordenesDeServicioId:string[];
}
