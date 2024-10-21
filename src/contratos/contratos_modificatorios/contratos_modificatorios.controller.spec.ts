import { Test, TestingModule } from '@nestjs/testing';
import { ContratosModificatoriosController } from './contratos_modificatorios.controller';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';

describe('ContratosModificatoriosController', () => {
  let controller: ContratosModificatoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContratosModificatoriosController],
      providers: [ContratosModificatoriosService],
    }).compile();

    controller = module.get<ContratosModificatoriosController>(ContratosModificatoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
