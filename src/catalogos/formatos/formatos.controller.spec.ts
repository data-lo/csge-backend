import { Test, TestingModule } from '@nestjs/testing';
import { FormatosController } from './formatos.controller';
import { FormatosService } from './formatos.service';

describe('FormatosController', () => {
  let controller: FormatosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormatosController],
      providers: [FormatosService],
    }).compile();

    controller = module.get<FormatosController>(FormatosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
