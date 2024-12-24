import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map} from 'rxjs/operators';
import { tzDate } from "@formkit/tempo";


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

        const timeZone = 'America/Chihuahua'; 

        if(obj && typeof obj === 'object'){
            for(const key of Object.keys(obj)){
                const value = obj[key];
                if(typeof value === 'string' && this.isISODate(value)){
                    console.log('Encontro una llave con fechas')
                    obj[key] = tzDate(value,timeZone)
                } else if (typeof obj[key] === 'object'){
                    this.formatDates(obj[key]);
                }
            }   
        };
    };

    private isISODate(value: string): boolean {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return isoDateRegex.test(value);
      }
}

