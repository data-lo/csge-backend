import { ESTATUS_DE_CONTRATO } from "src/contratos/interfaces/estatus-de-contrato";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { EXTENSION_TYPE_ENUM } from "../enums/extension-type-enum";
import { TIPO_DE_CONTRATO } from "src/contratos/interfaces/tipo-de-contrato";


export class CreateContratoModificatorioDto {
  // 🔗 Relaciones
  @IsUUID()
  @IsString()
  contratoId: string;

  @IsUUID()
  @IsOptional()
  @IsArray({ each: true })
  ordenesDeServicioId: string[];

  // 📄 Información general del contrato
  @IsString()
  numeroDeContrato: string;

  @IsEnum(ESTATUS_DE_CONTRATO)
  @IsOptional()
  estatusDeContrato: ESTATUS_DE_CONTRATO;

  @IsOptional()
  @IsBoolean()
  ivaFrontera: boolean;

  @IsOptional()
  @IsString()
  linkContrato: string;

  @IsEnum(EXTENSION_TYPE_ENUM)
  extensionType: EXTENSION_TYPE_ENUM;

  @IsEnum(TIPO_DE_CONTRATO)
  masterContractType: TIPO_DE_CONTRATO; 

  // 💰 Montos (tipo string por precisión)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  montoMinimoContratado: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  montoMaximoContratado: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  ivaMontoMinimoContratado: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  ivaMontoMaximoContratado: number;
  
  @IsString()
  @IsOptional()
  cancellationReason: string;

  // 📆 Fechas
  @IsOptional()
  fechaInicial: Date;

  @IsOptional()
  fechaFinal: Date;
}