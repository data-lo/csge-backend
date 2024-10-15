import { Test, TestingModule } from '@nestjs/testing';
import { IvaService } from './iva.service';

describe('IvaService', () => {
  let service: IvaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IvaService],
    }).compile();

    service = module.get<IvaService>(IvaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
