import { ESTATUS_DE_CONTRATO } from "src/contratos/interfaces/estatus-de-contrato";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";


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

  // 📆 Fechas
  @IsOptional()
  fechaInicial: Date;

  @IsOptional()
  fechaFinal: Date;
}