import { Test, TestingModule } from '@nestjs/testing';
import { EstacionController } from './estacion.controller';
import { EstacionService } from './estacion.service';

describe('EstacionController', () => {
  let controller: EstacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstacionController],
      providers: [EstacionService],
    }).compile();

    controller = module.get<EstacionController>(EstacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
