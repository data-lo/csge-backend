import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './administracion/usuarios/usuarios.module';
import { PuestosModule } from './administracion/puestos/puestos.module';
import { DepartamentosModule } from './administracion/departamentos/departamentos.module';
import { IvaModule } from './configuracion/iva/iva.module';
import { TextosModule } from './configuracion/textos/textos.module';
import { RespFirmaModule } from './configuracion/resp_firma/resp_firma.module';
import { ColoresModule } from './configuracion/colores/colores.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.cloud',
      isGlobal:true,
    }),
    UsuariosModule, 
    PuestosModule, 
    DepartamentosModule, 
    IvaModule, 
    TextosModule, 
    RespFirmaModule, 
    ColoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



/*
1. Importaciones:
NestJS y Configuración:

import { Module } from '@nestjs/common';
Importa el decorador @Module, utilizado para definir módulos en NestJS.
import { ConfigModule } from '@nestjs/config';
Importa el ConfigModule, que facilita la gestión de variables de entorno y configuraciones globales.
Controladores y Servicios Principales:

import { AppController } from './app.controller';
Importa el controlador principal de la aplicación, responsable de manejar las solicitudes HTTP entrantes.
import { AppService } from './app.service';
Importa el servicio principal que contiene la lógica de negocio básica.
Módulos de Administración:

import { UsuariosModule } from './administracion/usuarios/usuarios.module';
Módulo para la gestión de usuarios.
import { PuestosModule } from './administracion/puestos/puestos.module';
Módulo que maneja la información de puestos laborales.
import { DepartamentosModule } from './administracion/departamentos/departamentos.module';
Módulo encargado de administrar departamentos.
Módulos de Configuración:

import { IvaModule } from './configuracion/iva/iva.module';
Módulo para configurar el Impuesto al Valor Agregado (IVA).
import { TextosModule } from './configuracion/textos/textos.module';
Módulo para manejar textos configurables en la aplicación.
import { RespFirmaModule } from './configuracion/resp_firma/resp_firma.module';
Módulo relacionado con responsables de firma.
import { ColoresModule } from './configuracion/colores/colores.module';
Módulo para la configuración de colores en la aplicación.
2. Definición del Módulo Principal (AppModule):
El decorador @Module configura los elementos clave del módulo:

imports:

Lista de módulos que se importan para ser utilizados dentro de AppModule.
Configuración del ConfigModule:
ConfigModule.forRoot({ ... }) inicializa el módulo de configuración:
envFilePath: '.env.dev' especifica el archivo de variables de entorno a utilizar, facilitando la gestión de diferentes entornos (desarrollo, pruebas, producción).
isGlobal: true indica que el módulo de configuración es global y estará disponible en toda la aplicación sin necesidad de importarlo en otros módulos.
Módulos Importados:
UsuariosModule, PuestosModule, DepartamentosModule, IvaModule, TextosModule, RespFirmaModule, ColoresModule son agregados para integrar sus funcionalidades en la aplicación principal.
controllers:

[AppController] define el controlador que manejará las solicitudes HTTP para este módulo.
providers:

[AppService] lista los proveedores (servicios) que estarán disponibles para inyección de dependencias en otros componentes.
3. Exportación del Módulo:
export class AppModule {} exporta la clase AppModule para que pueda ser utilizada por el resto de la aplicación, especialmente al iniciar el servidor en el archivo principal (main.ts).
Explicación detallada:

Gestión Centralizada de Configuraciones:

Al utilizar ConfigModule con isGlobal: true, se garantiza que las variables de entorno y configuraciones estén accesibles en cualquier parte de la aplicación, sin necesidad de importar el módulo de configuración en cada módulo individual.
Organización Modular:

La aplicación está estructurada de manera modular, separando las funcionalidades en módulos específicos (e.g., usuarios, puestos, departamentos). Esto mejora la mantenibilidad y escalabilidad, permitiendo que equipos de desarrollo trabajen en paralelo en diferentes módulos sin conflictos.
Controladores y Servicios:

AppController actúa como el punto de entrada para las rutas definidas en la aplicación principal.
AppService proporciona métodos que pueden ser utilizados por el controlador u otros servicios para ejecutar la lógica de negocio.
Uso de Variables de Entorno:

Especificar envFilePath: '.env.dev' permite que la aplicación cargue variables de entorno desde un archivo .env.dev, facilitando la configuración de parámetros que varían entre entornos (por ejemplo, claves de API, configuraciones de base de datos).
Integración de Módulos de Configuración:

Los módulos como IvaModule, TextosModule, RespFirmaModule y ColoresModule permiten configurar aspectos específicos de la aplicación, proporcionando flexibilidad y personalización sin modificar el núcleo de la aplicación.
Consideraciones Adicionales:

Escalabilidad:

Al tener una arquitectura modular, es más sencillo agregar nuevas funcionalidades o modificar las existentes sin afectar otras partes de la aplicación.
Inyección de Dependencias:

NestJS utiliza un sistema de inyección de dependencias que permite que los servicios (providers) sean fácilmente accesibles en cualquier parte de la aplicación, promoviendo un código más limpio y testeable.
*/