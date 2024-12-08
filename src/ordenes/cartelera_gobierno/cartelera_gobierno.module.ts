import { Module } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CarteleraGobiernoController } from './cartelera_gobierno.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarteleraGobierno } from './entities/cartelera_gobierno.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [CarteleraGobiernoController],
  providers: [CarteleraGobiernoService],
  imports:[TypeOrmModule.forFeature([CarteleraGobierno]),
    AuthModule,
    PassportModule
  ],
  exports: [CarteleraGobiernoService]
})
export class CarteleraGobiernoModule {}
