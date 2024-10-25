import { Test, TestingModule } from '@nestjs/testing';
import { ServicioContratadoController } from './servicio_contratado.controller';
import { ServicioContratadoService } from './servicio_contratado.service';

describe('ServicioContratadoController', () => {
  let controller: ServicioContratadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicioContratadoController],
      providers: [ServicioContratadoService],
    }).compile();

    controller = module.get<ServicioContratadoController>(ServicioContratadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
