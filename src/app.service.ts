import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Backend Software de Ordenes de Servicio';
  }
}
