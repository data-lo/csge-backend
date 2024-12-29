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
  @Min(0)
  montoMinimoContratado: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMaximoContratado: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ivaMontoMinimoContratado: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
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
