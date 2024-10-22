import { Test, TestingModule } from '@nestjs/testing';
import { ActivacionController } from './activacion.controller';
import { ActivacionService } from './activacion.service';

describe('ActivacionController', () => {
  let controller: ActivacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivacionController],
      providers: [ActivacionService],
    }).compile();

    controller = module.get<ActivacionController>(ActivacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
