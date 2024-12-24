import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrdenEvent } from 'src/ordenes/interfaces/orden-event';
import { ContratosService } from './contratos.service';

@Injectable()
export class ContratosEventosService {
  constructor(
    private readonly contratosService: ContratosService
  ) {}

  @OnEvent('orden.aprobada', { async: true })
  async ordenAprobada(orden: OrdenEvent) {
    
  }
}
