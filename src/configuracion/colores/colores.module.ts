import { Module } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Color]),
  AuthModule,
  PassportModule
  ],
  exports:[ColoresService],
  controllers: [ColoresController],
  providers: [ColoresService],
})
export class ColoresModule {}
