import { Module } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { LongitudesController } from './longitudes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Longitud } from './entities/longitud.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Longitud]),
  AuthModule,
  PassportModule,
  ],
  exports:[LongitudesService],
  controllers: [LongitudesController],
  providers: [LongitudesService],
})
export class LongitudesModule {}
