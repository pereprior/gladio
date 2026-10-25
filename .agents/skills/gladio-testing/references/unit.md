# Unitarios

Los ejemplos actuales son
[`environment.config.spec.ts`](../../../../src/config/environment.config.spec.ts)
para funciones puras y
[`bootstrap.e2e-spec.ts`](../../../../test/bootstrap.e2e-spec.ts) para montaje y
cierre de un módulo Nest. Este último es un E2E, no un unitario de servicio.
Gladio aún no tiene un spec de servicio con colaboradores mockeados o una promesa
pendiente: aplica las pautas siguientes cuando exista ese sujeto, sin depender
de ejemplos OIDC de otro proyecto ni imponer un número de grupos.

## Montaje del sujeto

- Ubica los unitarios junto al código como `src/**/*.spec.ts`.
- Para servicios y otros sujetos Nest con inyección de dependencias, usa
  `Test.createTestingModule()` en un `beforeEach` asíncrono. Registra el sujeto y
  sus dependencias con tokens de runtime y `useValue`; obtén el sujeto con
  `module.get` y cierra el módulo en `afterEach`.
- Importa como valores las clases o tokens usados en `provide`; reserva
  `import type` para tipos. No importes `AppModule` ni conectes a una base de datos
  real para probar un servicio aislado.
- Usa mocks tipados de los métodos consumidos. Prefiere el tipo del método del
  colaborador; si un futuro adaptador usa un cliente con métodos genéricos, usa sus tipos
  de argumentos y resultados, generados cuando corresponda, para describir el contrato asíncrono que necesitas.
  Evita `as unknown as` para convertir objetos incompletos en servicios enteros.
- Reinicia los mocks en `beforeEach`. Si se reutiliza un mock entre casos,
  `mockReset()` evita que se hereden respuestas o implementaciones anteriores;
  limpiar solo las llamadas no basta para eso.
- Comparte en el hook la configuración fija de DI. Configura las respuestas
  de mocks y las fixtures dentro del test que las necesita. Los casos que
  rechazan antes de usar un colaborador no necesitan su respuesta exitosa.
- Las funciones puras y utilidades sin DI pueden probarse directamente: no montes
  un módulo Nest que no aporte nada a su contrato.

## Comprobaciones

- Separa salida del servicio, argumentos relevantes de colaboradores, rechazos
  tempranos, errores públicos y efectos cuando sean comportamientos distintos.
- Verifica argumentos y número de llamadas cuando formen parte del contrato;
  por ejemplo, consumir una sola vez o reservar el coste correcto. No compruebes
  detalles internos solo porque el mock los deja visibles.
- En un rechazo temprano, verifica que no se inicia el trabajo que debe evitarse.
  Un `rejects` sin esa comprobación puede pasar aunque haya efectos indebidos.
- Para fechas o expiración, fija el tiempo en los tests que lo necesitan con
  `vi.useFakeTimers()` y `vi.setSystemTime()`. Restaura con `vi.useRealTimers()` en
  teardown. No uses pausas reales para simular expiraciones.
- Usa `Promise.withResolvers()` cuando debas comprobar que una operación espera a
  otra. Arranca la llamada, conecta su expectativa de resultado, comprueba que el
  siguiente colaborador no se ha llamado, resuelve la promesa y espera el final.
- Configura fallos de cada colaborador relevante por separado. Cuando compruebes
  clase y mensaje de una excepción, reutiliza la misma promesa para evitar
  ejecutar la acción dos veces.
- Mantén explícito el límite de la prueba: una respuesta mockeada del adaptador
  demuestra cómo reacciona el servicio; no demuestra consultas, restricciones,
  atomicidad o carreras reales en la base de datos.

Cuando el sujeto lo requiera, prioriza reserva concurrente, timeouts con resultado
incierto, reinicio y cambio de ciclo, coste desconocido, idempotencia del horario,
`Europe/Madrid` y cambios estacionales, frescura, mercados incompletos,
correspondencia de selecciones y duplicados. Usa cálculos verificables y comprueba
que una discrepancia no se presenta automáticamente como valor esperado positivo.
