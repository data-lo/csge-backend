import { Controller, Get} from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}
  @Get('seed')
  seed(){
    return this.seedService.seed();
  }
};
