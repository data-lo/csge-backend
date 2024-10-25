import { Test, TestingModule } from '@nestjs/testing';
import { CarteleraGobiernoController } from './cartelera_gobierno.controller';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';

describe('CarteleraGobiernoController', () => {
  let controller: CarteleraGobiernoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarteleraGobiernoController],
      providers: [CarteleraGobiernoService],
    }).compile();

    controller = module.get<CarteleraGobiernoController>(CarteleraGobiernoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
