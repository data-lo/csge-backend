import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }));
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();

/*
Este código es el punto de entrada de una aplicación NestJS y se encarga de inicializar y configurar el servidor. A continuación, se detalla su funcionamiento:

Importaciones necesarias:

NestFactory de @nestjs/core: Herramienta para crear una instancia de la aplicación NestJS.
AppModule de './app.module': Módulo raíz de la aplicación que consolida todos los módulos, controladores y proveedores.
ValidationPipe de @nestjs/common: Pipe que permite aplicar validaciones y transformaciones a los datos de entrada en las solicitudes HTTP.
Función asíncrona bootstrap():

Creación de la aplicación:
Se crea una instancia de la aplicación NestJS utilizando NestFactory.create(AppModule).
Configuración global de pipes:
Se aplica un ValidationPipe global mediante app.useGlobalPipes(), con las opciones:
whitelist: true: Filtra automáticamente las propiedades no definidas en los Data Transfer Objects (DTOs), evitando que propiedades no deseadas sean procesadas.
transform: true: Transforma los datos de entrada al tipo esperado según lo definido en los DTOs, facilitando la manipulación de datos con los tipos correctos.
Inicio del servidor:
Se inicia la aplicación para que escuche en el puerto especificado por process.env.SERVER_PORT, permitiendo configurar el puerto mediante variables de entorno.
Ejecución de la función bootstrap():

La función bootstrap() es llamada para iniciar el proceso de arranque de la aplicación y poner el servidor en funcionamiento.
Explicación detallada:

Importaciones y Configuración Inicial:

El código importa los módulos esenciales para el funcionamiento de una aplicación NestJS.
NestFactory es fundamental para la creación de la aplicación, mientras que AppModule actúa como el módulo principal que agrupa la lógica de negocio.
ValidationPipe es crucial para asegurar que los datos que ingresan a la aplicación cumplen con los formatos y tipos esperados.
Uso del ValidationPipe:

Validación de Datos:
Al establecer whitelist: true, el servidor sólo aceptará propiedades que estén explícitamente definidas en los DTOs, reforzando la seguridad y la integridad de los datos.
Transformación de Datos:
Con transform: true, los datos recibidos en las solicitudes son convertidos automáticamente al tipo definido en los DTOs, lo que simplifica el manejo de tipos en toda la aplicación.
Inicialización del Servidor:

El servidor es configurado para escuchar en un puerto definido externamente, lo que permite mayor flexibilidad y adaptabilidad a diferentes entornos (desarrollo, pruebas, producción).
El uso de await asegura que la aplicación esté completamente inicializada antes de comenzar a aceptar conexiones entrantes.
Consideraciones Adicionales:

Buenas Prácticas de Seguridad:
Aplicar validaciones y transformaciones a nivel global es una práctica recomendada para prevenir ataques como la inyección de propiedades no deseadas y asegurar que la aplicación maneje únicamente datos esperados.
Escalabilidad y Mantenibilidad:
Al centralizar la configuración y el arranque de la aplicación en un único punto (bootstrap()), se facilita el mantenimiento y futuras ampliaciones del código.
Utilizar variables de entorno para configuraciones sensibles o variables es una práctica que mejora la seguridad y la portabilidad del código entre diferentes ambientes.
*/
