---
name: gladio-modules
description: Crea o amplía módulos funcionales de Gladio con servicios por operación y fronteras explícitas de dominio, persistencia e integración; añade entidades, DTOs, repositorios, adaptadores y mappers cuando sean necesarios. Úsala al implementar módulos nuevos o nuevas operaciones; incluye la integración HTTP cuando forme parte del encargo.
---

# Módulos de Gladio

Conserva la organización por funcionalidad y la separación de responsabilidades
heredadas de LiLi, adaptadas al dominio y a las operaciones solicitadas.
Gladio tiene un contexto Nest sin HTTP, módulos de negocio ni persistencia;
esta guía no autoriza añadirlos fuera del encargo.

## Antes de implementar

- Lee `AGENTS.md`, `package.json`, el módulo objetivo, si existe, y los ejemplos actuales
  citados abajo. Comprueba las rutas: el código actual y las instrucciones
  del usuario prevalecen sobre esta skill.
- Identifica operaciones, entradas, salidas, reglas, propietario de los datos y
  límites de persistencia. Un módulo nuevo no implica un CRUD completo.
- Usa `nestjs-best-practices` para decisiones específicas de NestJS, respetando
  las convenciones del proyecto, y `gladio-testing` al trabajar con tests.

## Estructura

Crea cada carpeta solo cuando tenga contenido y una responsabilidad real.
Los nombres siguientes son ilustrativos.

```text
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts                 # Si necesita entrada HTTP
├── dto/
│   ├── create-<resource>.dto.ts
│   └── update-<resource>-details.dto.ts
├── entities/
│   └── <resource>.entity.ts
├── exceptions/
│   ├── <resource>.exception.ts
│   └── <resource>-not-found.exception.ts
├── mappers/
│   └── <resource>.mapper.ts
├── repositories/
│   ├── <resource>.repository.ts
│   └── <storage>-<resource>.repository.ts
├── services/
│   └── create-<resource>/
│       ├── create-<resource>.service.ts
│       └── create-<resource>.service.spec.ts
├── types/data/
│   ├── create-<resource>.data.ts
│   └── update-<resource>.data.ts
├── responses/                             # Si necesita salida HTTP propia
├── utils/                                 # Cálculos puros del dominio
└── config/                                # Configuración propia, si existe
```

Usa archivos en kebab-case y nombres TypeScript en inglés. El módulo posee sus
DTOs, entidades, excepciones y utilidades. Lleva a `src/shared/` solo elementos
realmente compartidos; reutiliza los existentes cuando encajen.

## Flujo y responsabilidades

```text
Entrada HTTP → Controller → Service.execute → Repository abstracto
                                            → Adaptador de persistencia → Base de datos
Salida HTTP  ← Response   ← Entity          ← Mapper            ← Registro
```

El contexto Nest, la CLI o una planificación autorizada invocan las mismas
operaciones de aplicación; el flujo de persistencia solo existe si se necesita.
Para HTTP autorizado, lee [references/http.md](references/http.md), que conserva
las pautas de controladores como guía condicional, no como capacidad existente.

### Servicios por operación

- Crea un servicio `@Injectable()` por operación, con método público `execute`
  y dependencias por constructor. Coloca servicio y spec en `services/<operation>/`.
  Evita un servicio único que acumule todo el módulo.
- Nombra las modificaciones `Update...Service`; el DTO puede usar otro verbo,
  como `RefreshCaptureDto`.
- El servicio coordina consultas, normaliza entradas, establece valores iniciales
  y comprueba reglas de negocio. Usa el repositorio abstracto, sin acceder al
  motor de almacenamiento ni al transporte del proveedor.
  Separa transporte, presupuesto y cálculo matemático; una petición consumible
  requiere reserva persistente y atómica previa, coste conocido y reconciliación,
  incluso durante la primera prueba real, según `AGENTS.md`.
- Reutiliza otro servicio cuando aporte comportamiento real de aplicación.
  Un servicio de búsqueda puede centralizar acceso y error de ausencia;
  otro de actualización puede invocarlo antes de combinar datos y validar.
  Estos son ejemplos de responsabilidad, no servicios existentes en Gladio.
- Conserva la distinción entre `undefined` (no modificar) y `null` (vaciar si
  el contrato lo permite) en actualizaciones parciales.
- Usa contratos de entrada que representen la operación y sus identificadores;
  no fuerces DTOs de UUID sobre entradas con otro significado ni añadas usuarios
  o un `ParamUuidDto` inexistente por herencia de LiLi.
- Cuando autorización, auditoría o varias interfaces requieran un actor explícito,
  modela actor + acción + payload + handler conforme al contrato autorizado
  y a `AGENTS.md`. No exige un dispatcher, CQRS ni capas adicionales por defecto.

### Entidades, DTOs y datos

- Usa clases con campos `public readonly` declarados en el constructor para
  entidades del dominio. No conviertas la entidad en un DTO validado ni
  en una copia de todos los campos de la tabla.
- Los DTOs validan la forma de entrada con los validadores existentes cuando los haya.
  No instales validadores ni crees una capa HTTP solo para aplicar este patrón. Las reglas
  que dependen del estado o de otras entidades pertenecen a la aplicación.
- Los tipos `Create...Data` y `Update...Data` viven en `types/data/` y expresan
  el contrato de persistencia. No uses inputs del motor como contrato del servicio
  ni hagas que la entidad implemente el tipo de creación.
- Extrae conversiones a mappers y cálculos puros a utils cuando tengan una
  responsabilidad clara. Evita repartir lógica sencilla entre muchos helpers.

### Repositorios y mappers

- Para módulos con persistencia, usa una clase abstracta como
  contrato y token de DI, con solo los métodos que necesitan sus operaciones.
- Implementa el contrato en un adaptador del almacenamiento elegido, inyectando
  su conexión o cliente. El adaptador posee consultas y devuelve entidades; los
  inputs y registros del motor quedan dentro de la frontera de persistencia.
  SQLite es una propuesta pendiente; Prisma y `PrismaService` no existen ni son
  requisitos. No introduzcas una dependencia sin necesidad y alcance autorizado.
- Usa un mapper con `toEntity`, `toListEntity` si se necesita, `toCreateInput`
  y `toUpdateInput`. Son conversiones, no lugares para permisos o reglas de negocio.
- En datos de un usuario, filtra consultas y mutaciones por propietario además
  del identificador. Aplica la visibilidad del dominio; no copies automáticamente
  `deletedAt`, borrado lógico ni una estrategia de eliminación de otro dominio.
- Decide atomicidad según las invariantes del dominio. Leer y después escribir
  no garantiza seguridad ante concurrencia; usa transacciones o condiciones de
  escritura cuando se necesiten. No atribuyas transacciones ni reintentos al
  ejemplo sin comprobar su código actual.
- Un módulo sin persistencia no necesita repositorio, adaptador ni mapper de BD.

### Excepciones y logging

- Define una familia de excepciones del módulo cuando se necesite: base y variantes para errores
  esperados como ausencia, conflicto o validación.
- Conserva excepciones esperadas y transforma fallos inesperados en el error
  público genérico del módulo, sin exponer mensajes internos del motor de
  almacenamiento ni del proveedor.
- Usa el `Logger` de Nest existente con el nombre del servicio y contexto de la
  operación: inicio, éxito, rechazo esperado y fallo. Gladio no tiene `AppLogger`;
  no crees uno solo por esta guía. No registres payloads completos, secretos ni
  datos personales innecesarios. Redacta la clave del proveedor, también cuando
  viaje como parámetro de una URL y en errores o informes.

### Composición de Nest

- Importa los módulos que proporcionan dependencias, registra servicios y enlaza
  contrato y adaptador con
  `{ provide: ResourceRepository, useClass: StorageResourceRepository }`.
- Importa el repositorio abstracto como valor cuando sea token del constructor;
  `import type` elimina ese token en runtime. Sigue los imports `#src/...js`.
- Registra el controlador en `controllers` cuando exista. Exporta solo lo que
  consuman otros módulos; no exportes todos los providers por defecto.
- Integra el módulo en la composición correspondiente. Importa el módulo dueño
  de un servicio en vez de volver a declarar su provider en otro módulo.

## Ejemplos que consultar

Rutas relativas a la raíz del repositorio:

- `src/app.module.ts`: composición actual con `ConfigModule`.
- `src/main.ts`: contexto de aplicación sin listeners y cierre de recursos.
- `src/config/environment.config.ts`: selección de archivos de entorno.
- `src/config/environment.config.spec.ts`: función pura probada directamente.
- `test/bootstrap.e2e-spec.ts`: composición Nest y arranque compilado.

No hay ejemplos locales de servicios de negocio, repositorios o mappers todavía.
Aplica las responsabilidades descritas sin presentar nombres ilustrativos como
archivos existentes ni depender de otro checkout. No copies reglas de LiLi sobre
tareas, subtareas, usuarios, estados o fechas ni refactorices otras funcionalidades
como parte de crear un módulo.

## Verificación

Prueba operaciones y reglas nuevas con `gladio-testing`. Si hay endpoints, cubre
validación HTTP, acceso a recursos y respuestas; autenticación cuando exista
y sea parte del contrato. No añadas specs
que solo revaliden el comportamiento de class-validator en DTOs.

Ejecuta primero tests relevantes y después `pnpm typecheck`, `pnpm lint` y
`pnpm format:check`. Usa `pnpm run ci` para cambios sustanciales. Si cambia el
esquema, usa el mecanismo de migraciones elegido y documentado en `AGENTS.md`;
no hay comandos de migración ni ORM actuales. Si el mecanismo genera migraciones,
no sustituyas esa generación por SQL manual. Documenta ubicación, esquema,
copia consistente y restauración al introducir SQLite. Informa de verificaciones realizadas y resultados.
