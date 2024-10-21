import { EstatusDeContrato } from "src/contratos/interfaces/estatus-de-contrato";
import { TipoDeContrato } from "src/contratos/interfaces/tipo-de-contrato";
import { TipoDeServicio } from '../../interfaces/tipo-de-servicio';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { Transform } from "class-transformer";

export class CreateContratoDto {
        
    @IsOptional()
    @IsUUID()
    proveedorId:string;
    
    @IsString()
    numeroDeContrato:string;
    
    @IsEnum(EstatusDeContrato)
    estatusDeContrato:EstatusDeContrato;

    @IsEnum(TipoDeContrato)
    tipoDeContrato:TipoDeContrato;

    @IsEnum(TipoDeServicio)
    tipoDeServicio:TipoDeServicio;

    @IsString()
    objetoContrato:string;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoMinimoContratado:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoMaximoContratado:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    ivaMontoMinimoContratado:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    ivaMontoMaximoContratado:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    monto_ejecido:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    monto_pagado:number;

    @IsOptional()
    @IsBoolean({})
    iva_frontera:boolean;

    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaInicial:string;

    
    @IsDate()
    @Transform(({value}) => {
        const [day, month, year] = value.split('-');
        return new Date(`${year}-${month}-${day}`)
    })
    fechaFinal:string;

    @IsUUID()
    @IsOptional()
    @IsArray({each:true})
    contratoModificatorioId:string[];

    @IsUUID()
    @IsOptional()
    @IsArray({each:true})
    ordenesDeServicioId:string[];

    @IsString()
    @IsOptional()
    motivoCancelacionId:string;
    
    @IsString()
    @IsOptional()
    linkContrato:string;
}
