import { Test, TestingModule } from '@nestjs/testing';
import { RespFirmaController } from './resp_firma.controller';
import { RespFirmaService } from './resp_firma.service';

describe('RespFirmaController', () => {
  let controller: RespFirmaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespFirmaController],
      providers: [RespFirmaService],
    }).compile();

    controller = module.get<RespFirmaController>(RespFirmaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
