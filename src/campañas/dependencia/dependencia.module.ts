import { Module } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dependencia]),
    AuthModule,
    PassportModule,
  ],
  exports: [DependenciaService],
  controllers: [DependenciaController],
  providers: [DependenciaService],
})
export class DependenciaModule {}
