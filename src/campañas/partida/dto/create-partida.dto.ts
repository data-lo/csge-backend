import { IsNumber, IsOptional, Min } from "class-validator";

export class CreatePartidaDto {
    
    @IsNumber({maxDecimalPlaces:2})
    @Min(0.01)
    montoActivo:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.00)
    montoEjercido:number;

    @IsNumber({maxDecimalPlaces:2})
    @Min(0.00)
    montoPagado:number;
}
