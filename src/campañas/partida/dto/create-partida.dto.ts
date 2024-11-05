import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreatePartidaDto {
    
    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoActivo:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.00)
    montoEjercido:number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.00)
    montoPagado:number;
}
