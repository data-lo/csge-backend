import { IsOptional, IsString} from 'class-validator';

export class CaracteristicasDelServicioDto{
    @IsString()
    @IsOptional()
    nombreFormato: string;

    @IsString()
    @IsOptional()
    tipoFormato: string;

    @IsString()
    @IsOptional()
    tipoUnidad: string;

    @IsString()
    @IsOptional()
    pieza: string;

    @IsString()
    @IsOptional()
    paginasPrensa: string;

    @IsString()
    @IsOptional()
    seccionPrensa: string;

    @IsString()
    @IsOptional()
    webPublicacion: string;

    @IsString()
    @IsOptional()
    programa: string;

    @IsString()
    @IsOptional()
    alto: string;

    @IsString()
    @IsOptional()
    ancho: string;

    @IsString()
    @IsOptional()
    unidad: string;

    @IsString()
    @IsOptional()
    simbolo: string;

    @IsString()
    @IsOptional()
    medidaDeImpresion: string;
}