import { Test, TestingModule } from '@nestjs/testing';
import { CampañasController } from './campañas.controller';
import { CampañasService } from './campañas.service';

describe('CampañasController', () => {
  let controller: CampañasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampañasController],
      providers: [CampañasService],
    }).compile();

    controller = module.get<CampañasController>(CampañasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
