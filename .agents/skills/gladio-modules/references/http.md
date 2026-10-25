# Entrada y salida HTTP

Lee esta referencia solo cuando el encargo incluya endpoints. Gladio actualmente
arranca un contexto Nest sin listeners: no tiene controladores, autenticación,
`ValidationPipe`, DTO UUID compartido ni directorio OpenAPI. Las pautas siguientes
conservan el patrón heredado de LiLi como guía para una integración futura;
no autorizan crear esa infraestructura ni copiar sus rutas de auth.

Antes de implementar, comprueba la composición y configuración reales. Si ya
existen autenticación, guards, DTOs compartidos o respuestas públicas, revisa sus
implementaciones y reutilízalas. Mantén OpenAPI separado del código en YAML,
conforme a `AGENTS.md`, cuando se introduzca HTTP.

## Responsabilidad del controlador

- Coloca `<feature>.controller.ts` junto a `<feature>.module.ts` y regístralo
  en `controllers`. Inyecta servicios por constructor.
- Recibe parámetros y body en DTOs concretos, importa esas clases como valores
  y usa la validación global cuando esté configurada. No repitas una
  `ValidationPipe` local sin necesidad; no presupongas validadores instalados.
- Si existe identidad autenticada, obténla del mecanismo de sesión o actor
  establecido. No permitas elegir el propietario mediante un `userUuid` enviado
  en el body. La autenticación no sustituye filtrar el acceso al recurso.
  No añadas usuarios o autenticación por aplicar este ejemplo.
- Adapta entradas HTTP, llama a `execute` y construye la salida pública.
  Mantén reglas de negocio, consultas de persistencia y coordinación del dominio
  fuera del controlador.
- Define ruta, método y status según el contrato acordado. Aprovecha los guards
  globales cuando existan; no añadas un bypass como `@Public()` por comodidad.
- Usa `responses/` cuando haga falta una representación pública explícita.
  Devuelve solo campos del contrato, sin serializar automáticamente la entidad
  o el registro de persistencia. Añade un mapper de respuesta solo si la
  complejidad o reutilización de la conversión lo justifica.
- Documenta operaciones y schemas en el directorio OpenAPI acordado, con permisos,
  entradas, respuestas y errores. No añadas decoradores OpenAPI al código.

## Ejemplo ilustrativo

Este fragmento muestra cómo un futuro controlador podría invocar un servicio
para consultar una captura. No existen estos archivos ni se define aquí su
contrato final; los campos de salida son un ejemplo mínimo. El DTO de ruta y su
validación deben definirse con el mecanismo elegido al autorizar HTTP.

```ts
import { Controller, Get, Param } from '@nestjs/common';

import { FindCaptureDto } from '#src/captures/dto/find-capture.dto.js';
import { CaptureResponse } from '#src/captures/responses/capture.response.js';
import { FindCaptureService } from '#src/captures/services/find-capture/find-capture.service.js';

@Controller('captures')
export class CapturesController {
  constructor(private readonly findCapture: FindCaptureService) {}

  @Get(':uuid')
  async findByUuid(@Param() dto: FindCaptureDto): Promise<CaptureResponse> {
    const capture = await this.findCapture.execute(dto);

    return new CaptureResponse(capture.uuid, capture.receivedAt);
  }
}
```

La clase ilustrativa `CaptureResponse` viviría en `responses/capture.response.ts`:

```ts
export class CaptureResponse {
  constructor(
    public readonly uuid: string,
    public readonly receivedAt: string,
  ) {}
}
```

Los DTOs de ruta y body necesitan clases en runtime para validación; los contratos
que no se usan como valores pueden importarse como tipos. Una sesión obtenida por
un decorador, si llegara a existir, es un ejemplo de contrato importable como tipo.
Verifica el flujo HTTP con tests E2E: invocar servicios con almacenamiento real
no prueba rutas, guards ni validación de peticiones.
