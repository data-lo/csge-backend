import { Test, TestingModule } from '@nestjs/testing';
import { ImagenController } from './imagen.controller';
import { ImagenService } from './imagen.service';

describe('ImagenController', () => {
  let controller: ImagenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagenController],
      providers: [ImagenService],
    }).compile();

    controller = module.get<ImagenController>(ImagenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
