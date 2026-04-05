# Deployment — Agon

Guía paso a paso para deployar Agon desde cero. Pensada para quien no participó en el desarrollo.

---

## Prerrequisitos

Cuentas necesarias:

- [GitHub](https://github.com) — repositorio del código
- [Vercel](https://vercel.com) — deploy + Vercel Blob
- [Clerk](https://clerk.com) — autenticación
- [Neon](https://neon.tech) — base de datos PostgreSQL
- [Anthropic](https://console.anthropic.com) — API de IA

---

## 1. Configurar Clerk

1. Crear aplicación en [dashboard.clerk.com](https://dashboard.clerk.com)
2. Nombre: `agon` — método de login: Email (u otro acordado)
3. Copiar desde **API Keys**:
   - `Publishable key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret key` → `CLERK_SECRET_KEY`
4. Crear las dos cuentas de usuario (Javier y Matías)
5. Desde **Users**, copiar el **User ID** de cada uno:
   - Javier → `CLERK_JAVIER_USER_ID`
   - Matías → `CLERK_MATIAS_USER_ID`

---

## 2. Configurar Neon

1. Crear proyecto en [console.neon.tech](https://console.neon.tech)
2. Nombre: `agon`
3. En **Connection Details**, seleccionar **Direct connection**
4. Copiar la URL → `DATABASE_URL`

> ⚠️ Usar la **Direct connection** (sin `-pooler` en el hostname) para `drizzle-kit push` y migraciones.

---

## 3. Configurar Vercel Blob

1. En [vercel.com](https://vercel.com), crear o usar un proyecto
2. **Storage** → **Create Database** → **Blob**
3. Nombre: `agon-blob` — Access: **Public**
4. Copiar `BLOB_READ_WRITE_TOKEN` desde Settings del store

---

## 4. Configurar variables de entorno locales

```bash
cp .env.example .env.local
```

Completar todas las variables en `.env.local` con los valores obtenidos.

---

## 5. Aplicar schema a la DB

```bash
npm install
npm run db:push
```

Verificar en Drizzle Studio que existen las tablas:

```bash
npm run db:studio
# Abrir https://local.drizzle.studio
```

Tablas esperadas (14): `agonistas`, `pruebas_diarias`, `kleos_log`, `llamas`, `inscripciones`, `agora_eventos`, `aclamaciones`, `correspondencia`, `hegemonias`, `senalamiento`, `semana_sagrada`, `prueba_extraordinaria`, `cronicas`, `ekecheiria`.

---

## 6. Deploy en Vercel

```bash
npm i -g vercel
vercel --prod
```

O desde la UI de Vercel:

1. **Add New Project** → importar repositorio de GitHub
2. Framework: Next.js (auto-detectado)
3. Agregar **todas** las variables de entorno (mismas claves que `.env.example`)
4. **Deploy**

---

## 7. Configurar Clerk para producción

En el dashboard de Clerk:

1. **Domains** → agregar el dominio de Vercel
2. **Paths / Redirect URLs** → incluir URLs de producción, por ejemplo:
   - `https://[tu-dominio]/sign-in`
   - `https://[tu-dominio]/dashboard`

---

## 8. Verificación post-deploy

Checklist mínimo:

- [ ] Login con cuenta de Javier → onboarding → dashboard
- [ ] Login con cuenta de Matías → onboarding → dashboard
- [ ] Marcar una prueba → kleos se actualiza
- [ ] Subir foto en gym/cardio → aparece en El Ágora
- [ ] `/admin` accesible solo para Javier
- [ ] Generar La Crónica desde admin → aparece en El Ágora

---

## Re-deploy

Cualquier push a la rama conectada en Vercel dispara un nuevo deploy.

Para forzar redeploy sin cambios de código:
`vercel --prod` o **Redeploy** desde el dashboard.

---

## Variables de entorno en Vercel

Los cambios en variables de entorno requieren un nuevo deploy para aplicarse en runtime.  
**Settings** → **Environment Variables** → editar → **Redeploy**.
