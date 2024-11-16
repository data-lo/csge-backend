import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class FindAllInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const user = request.user; 
      const body = request.body;
  
      return next.handle().pipe(
        map((data: any[]) => {
          const currentYear = new Date().getFullYear();
  
          // Filtrar según permisos
          if (user.permisos?.includes('soloActivos')) {
            data = data.filter((item) => item.estatus === true);
          }
  
          // Filtrar por año anterior
          data = data.filter(
            (item) =>
              new Date(item.fechaActualizacion).getFullYear() === currentYear - 1,
          );
  
          // Filtrar por rango de fechas
          if (body.fechaInicio && body.fechaFin) {
            const fechaInicio = new Date(body.fechaInicio);
            const fechaFin = new Date(body.fechaFin);
            data = data.filter((item) => {
              const fecha = new Date(item.fecha);
              return fecha >= fechaInicio && fecha <= fechaFin;
            });
          }
  
          return data;
        }),
      );
    }
  }
  