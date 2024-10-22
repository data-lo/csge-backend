import { EstatusDeContrato } from "src/contratos/interfaces/estatus-de-contrato";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { Transform } from "class-transformer";

export class CreateContratoModificatorioDto {
    
    @IsEnum(EstatusDeContrato)
    @IsOptional()
    estatusDeContrato:EstatusDeContrato;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoContratado:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    ivaMontoContratado:number;

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

    @IsString()
    @IsOptional()
    linkContrato:string;

    @IsUUID()
    @IsOptional()
    @IsArray({each:true})
    ordenesDeServicioId:string[];
}
