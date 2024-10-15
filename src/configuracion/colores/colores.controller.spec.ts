import { Test, TestingModule } from '@nestjs/testing';
import { ColoresController } from './colores.controller';
import { ColoresService } from './colores.service';

describe('ColoresController', () => {
  let controller: ColoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColoresController],
      providers: [ColoresService],
    }).compile();

    controller = module.get<ColoresController>(ColoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
