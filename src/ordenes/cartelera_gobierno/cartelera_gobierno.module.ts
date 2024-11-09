import { Module } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CarteleraGobiernoController } from './cartelera_gobierno.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarteleraGobierno } from './entities/cartelera_gobierno.entity';

@Module({
  controllers: [CarteleraGobiernoController],
  providers: [CarteleraGobiernoService],
  imports:[TypeOrmModule.forFeature([CarteleraGobierno])],
  exports: [CarteleraGobiernoService]
})
export class CarteleraGobiernoModule {}
