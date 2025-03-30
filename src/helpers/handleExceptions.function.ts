import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  HttpException,
} from "@nestjs/common";
import { QueryFailedError, TypeORMError } from "typeorm"; 

export const handleExceptions = (error: any) => {
console.log(error)
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof QueryFailedError) {
    if (error.message.includes('Provided "skip" value is not a number')) {
      throw new BadRequestException({
        message: "El parámetro 'skip' debe ser un número válido.",
        errorCode: "TYPEORM_INVALID_SKIP",
      });
    }
  }

  if (error.message) {
    throw new BadRequestException({
      message: error.message,
      detail: error.detail || null,
      errorCode: error.code || null,
    });
  }

  if (error.detail) {
    throw new BadRequestException({
      message: error.detail,
      errorCode: error.code || null,
    });
  }

  if (error.code) {
    switch (error.code) {
      case '23505': // Violación de constraint UNIQUE
        throw new ConflictException({
          message: '¡Error: Registro duplicado detectado!',
          errorCode: '23505',
        });

      case '23503': // Violación de clave foránea
        throw new BadRequestException({
          message: '¡Error: Violación de clave foránea!',
          errorCode: '23503',
        });

      case '23502': // Campo nulo
        throw new BadRequestException({
          message: '¡Error: Falta uno o más campos obligatorios!',
          errorCode: '23502',
        });

      default:
        throw new InternalServerErrorException({
          message: '¡Error inesperado en la base de datos!',
          errorCode: error.code,
        });
    }
  }

  if (error.status === 404) {
    throw new NotFoundException({
      message: error.message || 'Recurso no encontrado',
      errorCode: '404',
    });
  }

  throw new InternalServerErrorException({
    message: 'Error interno del servidor',
    detail: error.message || null,
  });
};
