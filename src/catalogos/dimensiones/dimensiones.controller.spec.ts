import { Test, TestingModule } from '@nestjs/testing';
import { DimensionesController } from './dimensiones.controller';
import { DimensionesService } from './dimensiones.service';

describe('DimensionesController', () => {
  let controller: DimensionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DimensionesController],
      providers: [DimensionesService],
    }).compile();

    controller = module.get<DimensionesController>(DimensionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
