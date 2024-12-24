import { EstatusDeContrato } from 'src/contratos/interfaces/estatus-de-contrato';
import { TipoDeContrato } from 'src/contratos/interfaces/tipo-de-contrato';
import { TipoDeServicio } from '../../interfaces/tipo-de-servicio';
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

  @IsOptional()
  @IsUUID()
  proveedorId: string;

  @IsString()
  numeroDeContrato: string;

  @IsEnum(EstatusDeContrato)
  @IsOptional()
  estatusDeContrato: EstatusDeContrato;

  @IsEnum(TipoDeContrato)
  tipoDeContrato: TipoDeContrato;

  @IsArray()
  tipoDeServicios: TipoDeServicio[];

  @IsString()
  objetoContrato: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  montoMinimoContratado: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  montoMaximoContratado: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  ivaMontoMinimoContratado: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  ivaMontoMaximoContratado: number;

  @IsOptional()
  @IsBoolean({})
  ivaFrontera: boolean;

  @IsDate()
  fechaInicial: Date;

  @IsDate()
  fechaFinal: Date;
  
  @IsString()
  @IsOptional()
  motivoCancelacion: string;

  @IsString()
  @IsOptional()
  linkContrato: string;
}
