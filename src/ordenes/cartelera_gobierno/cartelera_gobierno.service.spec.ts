import { Test, TestingModule } from '@nestjs/testing';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';

describe('CarteleraGobiernoService', () => {
  let service: CarteleraGobiernoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarteleraGobiernoService],
    }).compile();

    service = module.get<CarteleraGobiernoService>(CarteleraGobiernoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
