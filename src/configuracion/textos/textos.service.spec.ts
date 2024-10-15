import { Test, TestingModule } from '@nestjs/testing';
import { TextosService } from './textos.service';

describe('TextosService', () => {
  let service: TextosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextosService],
    }).compile();

    service = module.get<TextosService>(TextosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
