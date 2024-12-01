import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";

import { Observable } from "rxjs";
import { map} from 'rxjs/operators'


@Injectable()
export class DateFormatterInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        if(['POST', 'PATCH'].includes(request.method)){
            this.formatDates(request.body);
        }
        return next.handle().pipe(
            map((data) => data)
        );
    }

    private formatDates(obj:any):void {
        if(obj && typeof obj === 'object'){
            for(const key of Object.keys(obj)){
                if(obj[key] instanceof Date){
                    obj[key] = obj[key].toISOString(); // Utilizar el formateador para agregar la hora;
                } else if (typeof obj[key] === 'object'){
                    this.formatDates(obj[key]);
                }
            }   
        }
    }
}

