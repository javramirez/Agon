# API: Agon

Documentación de los endpoints bajo `/app/api`.  
**Autenticación:** casi todos usan `auth()` de Clerk; sin sesión válida → `401` JSON `{ error: '...' }`.

**Autorización de agonistas:** el `middleware` aplica la política de instancia vigente (lista blanca / membresía por duelo según implementación; ver PROMPT 03). Quien no esté autorizado para la ruta → `/unauthorized` en páginas; `fetch` a `/api/*` puede recibir redirección HTML según el caso.

---

## Pruebas

### `POST /api/pruebas`

Actualiza un campo de la prueba del **día actual** del agonista autenticado.

**Body (JSON):**

```json
{ "campo": "soloAgua", "valor": true }
{ "campo": "pasos", "valor": 12500 }
```

**Campos válidos:** `soloAgua` | `sinComidaRapida` | `pasos` | `horasSueno` | `paginasLeidas` | `sesionesGym` | `sesionesCardio`

**Response (ejemplo):**

```json
{
  "ok": true,
  "kleos": 145,
  "diaPerfecto": false,
  "inscripcionDesbloqueada": "la_llama_viva",
  "nivelSubido": { "nivelAnterior": "atleta", "nivelNuevo": "agonista" }
}
```

---

## Fotos

### `POST /api/fotos`

Sube imagen a Vercel Blob y asocia URL a la prueba del día (gym o cardio).

**Body:** `multipart/form-data`: `foto` (File), `tipo`: `gym` | `cardio`

**Response:** `{ "url": "https://..." }`

---

## Pulso

### `GET /api/pulso`

Estado en tiempo casi real para el dashboard: fila completa de cada agonista en DB más la **prueba de hoy** (o `null`).

**Response (forma):**

- `agonista`: objeto agonista (campos de `agonistas`) + `pruebas`: prueba de hoy o `null`
- `antagonista`: igual, o `null` si no hay segundo agonista en DB

---

## El Ágora

### `GET /api/agora`

Lista eventos del feed + datos para refrescar tarjetas (eventos, aclamaciones del día, tipos por evento). Ver implementación en `app/api/agora/route.ts`.

### `POST /api/aclamaciones`

Aclama un evento. **Límite:** 5 aclamaciones por día y agonista.

**Body:** `{ "eventoId": "uuid", "tipo": "fuego" }`  
**Tipos:** `fuego` | `sin_piedad` | `agonia` | `digno_del_altis` | `el_agon_te_juzga`

### `GET /api/aclamaciones`

Cuenta aclamaciones del agonista **hoy**.

**Response:** `{ "usadas": number, "disponibles": number }`

---

## Correspondencia

### `GET /api/correspondencia`

Lista mensajes recientes del chat.

### `POST /api/correspondencia`

**Body:** `{ "contenido": "..." }` (longitud máxima acotada en el handler)

---

## El Oráculo

### `POST /api/oraculo`

Sella el mensaje del día 1. Solo una vez por agonista.

**Body:** `{ "mensaje": "..." }`

---

## Provocaciones

### `POST /api/provocaciones`

Publica provocación en El Ágora (restricciones de nivel en el handler).

**Body:** `{ "mensaje": "..." }`

---

## Señalamiento

### `GET /api/senalamiento`

Estado del Señalamiento (usado / recibido, etc.).

### `POST /api/senalamiento`

Ejecuta el Señalamiento (restricciones de nivel y una sola vez por Gran Agon según lógica de negocio).

---

## Ekecheiria

### `GET /api/ekecheiria`

Estado de la tregua.

### `POST /api/ekecheiria`

**Body:** `{ "motivo": "..." }` (y fechas según validación del servidor)

---

## Inscripciones

### `GET /api/inscripciones`

Inscripciones desbloqueadas del agonista actual.

### `POST /api/inscripciones`

Desbloqueo manual / administrativo según implementación.

**Body:** `{ "inscripcionId": "..." }`

---

## Hegemonía

### `GET /api/hegemonia`

Recalcula la semana actual, devuelve lista de hegemonías.

**Response:** `{ "hegemonias": [...] }`

### `POST /api/hegemonia`

Calcula y persiste la hegemonía de la semana actual (respuesta acorde al handler).

---

## La Crónica

### `GET /api/cronica`

Lista crónicas recientes.

### `POST /api/cronica`

Genera la crónica de la semana con IA. **Solo rol admin** según el handler.

---

## Prueba extraordinaria

### `GET /api/prueba-extraordinaria`

Prueba extraordinaria activa de la semana / período.

### `POST /api/prueba-extraordinaria`

Marca completada u otra acción según el handler.

---

## Veredicto

### `GET /api/veredicto`

Datos para La Ceremonia del Veredicto.

---

## Perfil

### `GET /api/perfil`

Estadísticas del perfil: nivel, llamas, kleos por semana, hábitos, hegemonías, etc.

---

## Altis (estadísticas)

### `GET /api/altis/stats`

Heatmap, comparativa de hábitos, evolución de kleos, mejores días, rachas máximas y `getStatsCompletos` para ambos agonistas.

---

## Auth sync

### `POST /api/auth/sync`

Fuerza `getOrCreateAgonista` y devuelve el agonista. Útil tras primer login.

**Response:** `{ "agonista": { ... } }`

---

## Admin

Todos requieren rol de administrador de la instancia; si no → `403`.

### `GET /api/admin/semana-sagrada`

Estado de la Semana Sagrada activa.

### `POST /api/admin/semana-sagrada`

Activa Semana Sagrada (multiplicador / evento según implementación).

### `DELETE /api/admin/semana-sagrada`

Desactiva la Semana Sagrada activa.

### `POST /api/admin/prueba-extraordinaria`

Crea o activa reto extraordinario (cuerpo según `app/api/admin/prueba-extraordinaria/route.ts`).

---

*Para detalles de validación exactos, códigos de error y campos opcionales, revisar el archivo `route.ts` de cada ruta.*
