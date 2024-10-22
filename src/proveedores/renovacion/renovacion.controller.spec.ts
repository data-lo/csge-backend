import { Test, TestingModule } from '@nestjs/testing';
import { RenovacionController } from './renovacion.controller';
import { RenovacionService } from './renovacion.service';

describe('RenovacionController', () => {
  let controller: RenovacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RenovacionController],
      providers: [RenovacionService],
    }).compile();

    controller = module.get<RenovacionController>(RenovacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
