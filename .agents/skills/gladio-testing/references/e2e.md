# E2E

El ejemplo actual es
[`bootstrap.e2e-spec.ts`](../../../../test/bootstrap.e2e-spec.ts).
Lee su montaje, cierre y ejecución del proceso compilado antes de añadir un E2E.
Gladio todavía no tiene HTTP ni base de datos: el flujo real actual comprueba la
composición de Nest y el arranque sin credenciales. Las pautas de HTTP,
persistencia y sesiones se conservan de forma condicional para cuando formen
parte del encargo; no implican introducirlas para poder escribir un E2E.

## Montaje y aislamiento

- Ubica los E2E en `test/**/*.e2e-spec.ts`.
- Arranca `AppModule` mediante `Test.createTestingModule()`, compila e inicializa
  el contexto como en el ejemplo y ciérralo incluso si falla una aserción.
  Para el ejecutable, lanza `dist/main.js` como proceso real tras compilar, con
  entorno explícito y timeout limitado. No abras puertos para estos flujos.
- Si se autoriza HTTP, crea la aplicación y aplica su configuración real
  compartida con producción; `configureApp` no existe actualmente en Gladio.
  Usa `app.listen(0)` y `app.getUrl()` para evitar fijar un puerto de test.
- Usa la aplicación real y, cuando el flujo incluya persistencia, almacenamiento
  real y aislado de test. Mockea las fronteras externas que no deban ejecutarse,
  como un proveedor de cuotas, mediante `overrideProvider(...).useValue(...)`.
  No mockees servicios internos o el adaptador de almacenamiento en un test que
  debe demostrar el flujo completo. No uses claves reales ni consumas créditos
  en los E2E ordinarios.
- Comparte el arranque en `beforeAll` y cierra la aplicación en `afterAll`
  cuando el montaje se comparta; para montaje por caso, usa `finally` o `afterEach`.
  Reinicia mocks y limpia los datos pertinentes entre casos, respetando las
  relaciones de claves foráneas. Mantén también la limpieza final.
- Verifica que `NODE_ENV=test` selecciona `.env.test` y que cualquier almacén
  afectado es exclusivo de test antes de borrar datos. Actualmente no hay base
  de datos E2E. Si se introduce SQLite, usa archivos temporales aislados y cierra
  sus conexiones antes de eliminarlos. Adapta la limpieza a las entidades del
  flujo; no copies borrados de otro dominio ni uses resets o eliminación de
  volúmenes como limpieza habitual.
- La configuración actual no desactiva `fileParallelism` y no comparte una base
  de datos. Si futuros tests comparten almacenamiento, aísla sus recursos o
  justifica desactivar el paralelismo. No uses casos concurrentes que compitan
  con la limpieza de otros tests ni actives paralelismo sin aislamiento adecuado.

## Flujos visibles

- Agrupa los casos en `describe` por endpoint o rama funcional. Conserva un
  recorrido completo cuando aporte confianza en la integración; separa las
  garantías específicas de cabeceras, validación o persistencia.
- Si hay HTTP, usa `fetch` inline con métodos, URLs, headers y datos visibles. Para comprobar
  redirecciones, especifica `redirect: 'manual'` y verifica estado y destino.
- En flujos con cookies, extrae las cookies reales de la respuesta. Usa
  `headers.getSetCookie()` para distinguir cada cookie y envía solo su par
  nombre/valor al continuar el flujo. Comprueba los atributos de la cookie
  correspondiente, sin mezclar varias cabeceras `Set-Cookie`.
- Usa datos deterministas permitidos por la configuración de test. El URL local
  del servidor en un puerto dinámico y el origen configurado de la aplicación
  cumplen funciones diferentes; no intercambies sus expectativas.
- Comprueba la respuesta pública completa cuando el esquema tenga campos
  definidos; así detectas campos sensibles o inesperados añadidos accidentalmente.
- Consulta el almacenamiento real cuando demuestre un efecto relevante que HTTP no prueba bien,
  como ausencia de gasto tras un rechazo o unicidad de una captura. Relaciona
  el dato consultado con el escenario; no inspecciones columnas internas sin
  una razón contractual.
- Si se implementan sesiones, para logout o rechazos de operaciones mutables, prueba el efecto con la cookie
  anterior: debe dejar de funcionar tras revocación y seguir funcionando cuando
  la operación se rechaza sin modificar la sesión.
- No exageres garantías de concurrencia. `Promise.all` permite enviar varias
  peticiones juntas; una carrera específica exige controlar o demostrar el
  solapamiento relevante. Mantén el nombre ajustado a la prueba ejecutada.
- Explica el límite de las fronteras mockeadas: el E2E prueba el flujo local,
  pero no valida credenciales, conectividad, consumo ni cobertura española real
  del proveedor. Si en el futuro se prueba auth con un proveedor mockeado, tampoco
  demuestra autenticación real con ese proveedor.
