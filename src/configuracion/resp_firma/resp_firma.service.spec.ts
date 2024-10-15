import { Test, TestingModule } from '@nestjs/testing';
import { RespFirmaService } from './resp_firma.service';

describe('RespFirmaService', () => {
  let service: RespFirmaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespFirmaService],
    }).compile();

    service = module.get<RespFirmaService>(RespFirmaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
