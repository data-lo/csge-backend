import { ESTATUS_DE_CONTRATO } from 'src/contratos/interfaces/estatus-de-contrato';
import { TIPO_DE_CONTRATO } from 'src/contratos/interfaces/tipo-de-contrato';
import { TIPO_DE_SERVICIO } from '../../interfaces/tipo-de-servicio';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateContratoDto {

  @IsUUID()
  proveedorId: string;

  @IsString()
  numeroDeContrato: string;

  @IsEnum(ESTATUS_DE_CONTRATO)
  @IsOptional()
  estatusDeContrato: ESTATUS_DE_CONTRATO;

  @IsEnum(TIPO_DE_CONTRATO)
  tipoDeContrato: TIPO_DE_CONTRATO;

  @IsArray()
  tipoDeServicios: TIPO_DE_SERVICIO[];

  @IsString()
  objetoContrato: string;

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

  @IsOptional()
  @IsBoolean({})
  ivaFrontera: boolean;

  @IsOptional()
  @IsDate()
  fechaInicial: Date;

  @IsOptional()
  @IsDate()
  fechaFinal: Date;
  
  @IsString()
  @IsOptional()
  motivoCancelacion: string;

  @IsString()
  @IsOptional()
  linkContrato: string;
}
