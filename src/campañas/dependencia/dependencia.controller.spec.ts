import { Test, TestingModule } from '@nestjs/testing';
import { DependenciaController } from './dependencia.controller';
import { DependenciaService } from './dependencia.service';

describe('DependenciaController', () => {
  let controller: DependenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependenciaController],
      providers: [DependenciaService],
    }).compile();

    controller = module.get<DependenciaController>(DependenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
