import { Test, TestingModule } from '@nestjs/testing';
import { CampañasService } from './campañas.service';

describe('CampañasService', () => {
  let service: CampañasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampañasService],
    }).compile();

    service = module.get<CampañasService>(CampañasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
