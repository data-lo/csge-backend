import { Module } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { LongitudesController } from './longitudes.controller';

@Module({
  controllers: [LongitudesController],
  providers: [LongitudesService],
})
export class LongitudesModule {}
