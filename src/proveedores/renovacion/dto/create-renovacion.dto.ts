import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, Min, IsObject, ValidateNested, IsUUID, isBoolean } from 'class-validator';
import { CaracteristicasDelServicioDto } from "./caracteristicas-del-servicio.dto";

export class CreateRenovacionDto {

    @IsString()
    description: string;

    @IsString()
    unitPrice: string;

    @IsOptional()
    tax: string;

    @IsBoolean()
    isTaxIncluded: boolean;

    @IsBoolean()
    isBorderTax: boolean;

    @IsObject()
    @ValidateNested()
    @Type(() => CaracteristicasDelServicioDto)
    characteristicOfService: CaracteristicasDelServicioDto;

    @IsUUID()
    @IsString()
    serviceId: string;
}