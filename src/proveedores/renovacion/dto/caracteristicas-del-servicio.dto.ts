import { IsOptional, IsString} from 'class-validator';

export class CaracteristicasDelServicioDto{
    
    @IsOptional()
    @IsString()
    tipoFormato:string;

    @IsOptional()
    @IsString()
    tipoUnidad:string;

    @IsOptional()
    @IsString()
    unidad:string;

    @IsOptional()
    @IsString()
    simbolo:string;

    @IsOptional()
    @IsString()
    pieza:string;

    @IsOptional()
    @IsString()
    medidaImpresion:string;

    @IsOptional()
    @IsString()
    medidaTiempo:string;

    @IsOptional()
    @IsString()
    medidaImpresionId:string;

    @IsOptional()
    @IsString()
    medidaTiempoId:string;

    @IsOptional()
    @IsString()
    ancho:string;

    @IsOptional()
    @IsString()
    alto:string;
    
    @IsOptional()
    @IsString()
    seccionPrensa:string;

    @IsOptional()
    @IsString()
    webPublicacion:string;

    @IsOptional()
    @IsString()
    paginasPresna:string;

    @IsOptional()
    @IsString()
    programa:string;
}