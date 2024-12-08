import { Module } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { TiemposController } from './tiempos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tiempo } from './entities/tiempo.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Tiempo]),
    AuthModule,
    PassportModule
  ],
  exports:[TiemposService],
  controllers: [TiemposController],
  providers: [TiemposService],
})
export class TiemposModule {}
