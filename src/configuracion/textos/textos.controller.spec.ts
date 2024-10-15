import { Test, TestingModule } from '@nestjs/testing';
import { TextosController } from './textos.controller';
import { TextosService } from './textos.service';

describe('TextosController', () => {
  let controller: TextosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextosController],
      providers: [TextosService],
    }).compile();

    controller = module.get<TextosController>(TextosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
