import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),
    AuthModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return {
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '2h'
        }
      }
    }
  })],
  exports: [TypeOrmModule, UsuariosService],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }
