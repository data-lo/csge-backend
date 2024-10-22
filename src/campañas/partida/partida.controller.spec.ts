import { Test, TestingModule } from '@nestjs/testing';
import { PartidaController } from './partida.controller';
import { PartidaService } from './partida.service';

describe('PartidaController', () => {
  let controller: PartidaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartidaController],
      providers: [PartidaService],
    }).compile();

    controller = module.get<PartidaController>(PartidaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
