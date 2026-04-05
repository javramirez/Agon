# Arquitectura — Agon

## Stack elegido y justificación

### Next.js 15 (App Router)

Elegido por la combinación de Server Components para queries directas a DB sin pasar por API, y Client Components para interactividad en tiempo real. El App Router permite colocación de `loading.tsx` y `error.tsx` por ruta, lo que encaja con el diseño de estados de carga del universo Agon.

### Neon (PostgreSQL) en lugar de Supabase

**Desviación justificada del stack estándar Day One.**  
Los slots de Supabase free tier estaban agotados. Neon ofrece PostgreSQL serverless compatible con Drizzle ORM, con conexión directa para migraciones y driver compatible con serverless. Sin diferencias funcionales para este proyecto.

### Clerk en lugar de Supabase Auth

**Desviación justificada del stack estándar Day One.**  
Clerk simplifica la autenticación con 2 usuarios fijos. El middleware de Clerk permite autorizar por `userId` en variables de entorno (`CLERK_JAVIER_USER_ID`, `CLERK_MATIAS_USER_ID`), suficiente y explícito para un proyecto privado de 2 personas.

### Drizzle ORM en lugar de Prisma

Drizzle tiene buena integración con Neon serverless y genera tipos TypeScript inferidos desde el schema. Para un schema con muchas tablas relacionadas, la inferencia reduce errores en queries.

### Vercel Blob para imágenes

Integración nativa con Vercel. Las fotos de gym/cardio no requieren procesamiento complejo: almacenamiento y URL pública. Free tier suficiente para 2 usuarios × 29 días.

### Anthropic API (Claude Haiku) para La Crónica

Claude Haiku es eficiente en costo/calidad para texto corto (120–150 palabras). La Crónica se dispara desde el panel admin (`POST /api/cronica`); no hay cron automático en el MVP.

---

## Diagrama de componentes

```
Browser
  └── Next.js App Router
        ├── Server Components (datos, auth)
        │     ├── Clerk (autenticación)
        │     ├── Neon / Drizzle (queries)
        │     └── Anthropic API (La Crónica)
        └── Client Components (interactividad)
              ├── Polling (usePulso — 15s)
              ├── Polling (useCorrespondencia — 5s)
              └── Vercel Blob (upload fotos)
```

---

## Decisiones de diseño

### Polling en lugar de WebSockets

El tiempo real del dashboard usa polling cada 15 segundos. Alternativas como WebSockets o Supabase Realtime añadirían complejidad sin beneficio proporcional para 2 usuarios. El polling es predecible y fácil de depurar.

### Fechas como `date` (YYYY-MM-DD)

Las fechas de pruebas diarias se almacenan como tipo `date` en PostgreSQL. Simplifica las queries por día y reduce problemas de timezone cuando ambos agonistas comparten huso horario.

### Kleos recalculado en cada update

En cada actualización de pruebas del día se recalcula el kleos del día y el total del agonista según reglas en servidor. Garantiza consistencia y evita drift entre cliente y base de datos.

### 2 usuarios en variables de entorno

Los IDs de Clerk de los agonistas están en env. Para exactamente 2 usuarios fijos, es más simple que una tabla de roles.

### Nivel verificado en servidor

Tras cada `POST /api/pruebas`, el servidor recalcula nivel y kleos. El cliente no puede forzar un nivel superior al que refleja la DB.

---

## Trade-offs considerados

| Decisión | Alternativa | Por qué se eligió esta |
| --- | --- | --- |
| Polling 15s | WebSockets | Simplicidad, sin servidor persistente |
| Clerk (2 usuarios) | Supabase Auth | Slots free tier agotados |
| Neon | Supabase | Slots free tier agotados |
| Kleos recalculado | Kleos solo incremental | Consistencia y reglas únicas en servidor |
| Admin manual (crónica, semana sagrada) | Cron automático | MVP — 29 días, activación consciente |
| `date` por día | `timestamp` solo | Queries y comparaciones por día más simples |
