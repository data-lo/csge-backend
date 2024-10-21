import { Test, TestingModule } from '@nestjs/testing';
import { LongitudesController } from './longitudes.controller';
import { LongitudesService } from './longitudes.service';

describe('LongitudesController', () => {
  let controller: LongitudesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LongitudesController],
      providers: [LongitudesService],
    }).compile();

    controller = module.get<LongitudesController>(LongitudesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
