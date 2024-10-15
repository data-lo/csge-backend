import { Test, TestingModule } from '@nestjs/testing';
import { IvaController } from './iva.controller';
import { IvaService } from './iva.service';

describe('IvaController', () => {
  let controller: IvaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IvaController],
      providers: [IvaService],
    }).compile();

    controller = module.get<IvaController>(IvaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
