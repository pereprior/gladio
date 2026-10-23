# Gladio

Gladio es un proyecto personal para observar cuotas deportivas, guardar su evolución y detectar candidatas que merezcan investigación. Su objetivo es generar pocos avisos, sustentados en datos comprobables, y aceptar que puede no haber ninguna oportunidad justificable.

La primera versión prevista combina cálculos deterministas en el portátil con revisión manual de informes en ChatGPT Plus. Una diferencia de cuota, una cuota baja o una explicación convincente de una IA no demuestran rentabilidad.

## Estado actual

El proyecto tiene un esqueleto ejecutable con NestJS 12, TypeScript 6 y Node.js 24, basado en las convenciones de LiLi-api. Incluye configuración de entorno, compilación, lint, formato y pruebas unitarias y E2E.

El arranque inicializa el contexto de Nest, muestra `Gladio initialized.` y lo cierra. Todavía no recoge cuotas ni tiene base de datos, servidor HTTP, llamadas a modelos o tareas periódicas.

El siguiente entregable es una matriz de cobertura que permita comprobar qué casas españolas y qué cuotas ofrece realmente cada proveedor. El detector y las notificaciones vienen después de esa comprobación.

La [hoja de ruta hasta 1.0.0](docs/roadmap-1.0.0.md) concreta los pasos, entregables y criterios de aceptación. La versión estable prevista incluye investigación manual, seguimiento y avisos experimentales al móvil; la rentabilidad del método requiere una evaluación independiente.

## Alcance

- Objetivo de cobertura: todas las casas que ofrezcan legalmente el mercado elegido en España, comprobando la versión española de cada una.
- Piloto propuesto: LaLiga, mercado 1X2 prepartido y una región del proveedor. Estos parámetros siguen siendo provisionales.
- Mercado propuesto: resultado tras 90 minutos más descuento, excluyendo prórroga y penaltis, con condiciones de liquidación equivalentes.
- Horario previsto: doce consultas ordinarias diarias, de las 09:00 a las 20:00, en `Europe/Madrid`. Las 21:00 cierran la ventana de consultas y avisos.
- Ejecución y almacenamiento locales en el portátil; modelos de OpenAI en la nube cuando se utilicen.
- Coste técnico inicial lo más próximo posible a cero. Sin apuestas, depósitos ni otras operaciones de dinero automáticas.

La cobertura parcial debe identificarse como tal. Una cuota internacional no se considera disponible en España por compartir marca con una casa española.

## Funcionamiento previsto

1. Comprobar el presupuesto de consultas y obtener cuotas.
2. Guardar respuestas, tiempos y evolución.
3. Rechazar anomalías y comparar mercados equivalentes frente a referencias ajustadas por margen.
4. Preparar un informe únicamente para las candidatas que superen los controles.
5. Investigar y revisar manualmente la evidencia y sus limitaciones.
6. Verificar otra vez el precio antes de cualquier aviso vigente.
7. Registrar señales, descartes, disponibilidad al revisar y resultados.

Las señales experimentales, las apuestas simuladas y las apuestas reales confirmadas se registrarán por separado.

## Datos y presupuesto

En la revisión inicial del **23 de octubre de 2026**, The Odds API publicaba un plan gratuito de 500 créditos mensuales. Una consulta de una competición, un mercado y una región permite presupuestar 360 créditos ordinarios en 30 días o 372 en 31 días. Las verificaciones, resultados, reintentos y cualquier otro endpoint consumible deben añadirse a ese cálculo.

Su catálogo `eu` no demuestra cobertura de versiones españolas ni de todas las casas objetivo. **The Odds API es un candidato a evaluar, no un proveedor definitivo.** No se han realizado consultas autenticadas ni comprobado cuotas reales desde España.

Los precios y condiciones son información fechada que debe verificarse antes de implementar una integración. Véanse el [plan del proveedor](https://the-odds-api.com/), la [documentación V4](https://the-odds-api.com/liveapi/guides/v4/index.html) y su [catálogo de casas](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html).

## Arquitectura

La base es un único proceso NestJS sin servidor HTTP, con TypeScript estricto, ESM e imports locales compatibles con NodeNext. Se utiliza pnpm y un lockfile propio. La organización seguirá módulos por funcionalidad, añadiendo cada responsabilidad cuando se implemente.

SQLite e informes Markdown/JSON siguen siendo propuestas para la siguiente fase; todavía no hay adaptador de persistencia ni proveedor elegido.

ChatGPT Plus se utilizaría para revisar informes manualmente. No incluye una API ilimitada. La investigación automática, el uso programático de modelos y los avisos al móvil se evaluarían en fases posteriores.

## Validación

Primero se comprobarán cobertura española, equivalencia de mercados, frescura y consumo. Si los datos sirven, se propone una simulación prospectiva de 6–8 semanas con reglas registradas y resultados completos, incluidos los descartes. Ese periodo permite evaluar el funcionamiento; por sí solo no demuestra rentabilidad.

El presupuesto de ocio es de **100 € de dinero nuevo al mes entre todas las casas**, separado del coste técnico. Los límites iniciales propuestos son 2 € habituales por apuesta y 10 € expuestos simultáneamente, sin aumentar importes para recuperar pérdidas.

## Desarrollo y continuidad

[AGENTS.md](AGENTS.md) contiene el contexto completo, las restricciones, las decisiones provisionales, la ruta de implementación y las pautas de mantenimiento para cualquier persona o agente que continúe el proyecto. Debe mantenerse actualizado junto con los cambios relevantes.

Requisitos: **Node.js 24 o superior** y **pnpm 12.8.1**, fijado en `package.json`. `.node-version` selecciona la rama 24 para desarrollo y CI.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

No hacen falta credenciales para ejecutar el esqueleto. `.env` es opcional; se puede crear a partir de `.env.example`. La configuración carga `.env` en desarrollo y `.env.<NODE_ENV>` en otros entornos. Para seleccionar otro entorno, hay que establecer `NODE_ENV` antes de arrancar, por ejemplo `NODE_ENV=production pnpm start`.

| Comando                             | Función                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                          | Compilar y volver a ejecutar al cambiar el código            |
| `pnpm start:debug`                  | Desarrollo con el inspector de Node                          |
| `pnpm typecheck`                    | Comprobar tipos sin emitir JavaScript                        |
| `pnpm lint` / `pnpm lint:fix`       | Revisar estilo y reglas de TypeScript / aplicar correcciones |
| `pnpm format` / `pnpm format:check` | Aplicar / comprobar formato                                  |
| `pnpm test:unit`                    | Ejecutar unitarios                                           |
| `pnpm test:e2e`                     | Compilar y comprobar integración y arranque del ejecutable   |
| `pnpm test`                         | Compilar y ejecutar todos los tests                          |
| `pnpm test:watch`                   | Ejecutar unitarios en modo watch                             |
| `pnpm test:coverage`                | Compilar, ejecutar tests y generar cobertura                 |
| `pnpm run ci`                       | Tipos, lint, compilación, tests, cobertura y formato         |

La cobertura se genera en `coverage/`. La configuración exige un mínimo del 80 % por métrica sobre el código incluido; este umbral no sustituye pruebas de comportamientos útiles. El workflow de GitHub Actions ejecuta las mismas comprobaciones en pushes y pull requests a `main`, sin servicios externos ni secretos.

```text
src/
  main.ts                        Arranque local y cierre del contexto
  app.module.ts                  Composición de módulos
  config/                        Selección del archivo de entorno y sus tests
test/
  setup.ts                       Metadata y silenciamiento de logs de Nest
  bootstrap.e2e-spec.ts           Composición real y arranque compilado
.github/workflows/ci.yml          Verificación de desarrollo
```

`dist/`, `coverage/`, dependencias, credenciales y datos locales están excluidos de Git. `pnpm-lock.yaml` y las plantillas de entorno sí forman parte del proyecto.
