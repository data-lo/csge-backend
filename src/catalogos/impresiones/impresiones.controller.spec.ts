import { Test, TestingModule } from '@nestjs/testing';
import { ImpresionesController } from './impresiones.controller';
import { ImpresionesService } from './impresiones.service';

describe('ImpresionesController', () => {
  let controller: ImpresionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpresionesController],
      providers: [ImpresionesService],
    }).compile();

    controller = module.get<ImpresionesController>(ImpresionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
