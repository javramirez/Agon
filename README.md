# AGON

> "La excelencia no se declara. Se inscribe."

Plataforma de gamificación para el Gran Agon: un desafío personal de 29 días de disciplina entre dos agonistas. Registro de hábitos diarios, sistema de kleos (XP), niveles, inscripciones (logros), batalla en tiempo real, y La Ceremonia del Veredicto final.

---

## El universo

| Término | Significado |
| --- | --- |
| **El Gran Agon** | El desafío completo de 29 días |
| **Agonista** | Cada participante |
| **Antagonista** | El rival de cada agonista |
| **Kleos** | Puntos acumulados (gloria ganada con actos) |
| **Las Pruebas** | Los 7 hábitos diarios a completar |
| **El Altis** | El scoreboard: registro del Gran Agon |
| **El Ágora** | El feed social compartido |
| **La Hegemonía** | El ganador de cada semana |
| **Las Inscripciones** | Los logros desbloqueados |
| **El Oráculo** | Mensaje sellado del día 1, revelado el día 29 |
| **La Ekecheiria** | La tregua sagrada (Cláusula 69) |
| **El Señalamiento** | Poder de desafío al antagonista (1 vez) |

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Base de datos | Neon (PostgreSQL serverless) |
| ORM | Drizzle ORM |
| Storage | Vercel Blob (fotos de gym/cardio) |
| IA | Anthropic API: Claude Haiku (La Crónica del Período) |
| Deploy | Vercel |

---

## Documentación técnica

| Documento | Contenido |
| --- | --- |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Decisiones de stack, diagrama lógico, trade-offs |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy desde cero (Clerk, Neon, Vercel, verificación) |
| [docs/API.md](docs/API.md) | Todos los endpoints `/api/*` |
| [docs/database-schema.sql](docs/database-schema.sql) | Esquema SQL de referencia (fuente de verdad: `lib/db/schema.ts`) |

---

## Instalación local

### Prerrequisitos

- Node.js 18+
- Cuenta en [Clerk](https://clerk.com)
- Cuenta en [Neon](https://neon.tech)
- Cuenta en [Vercel](https://vercel.com) (para Blob)
- Cuenta en [Anthropic](https://console.anthropic.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/[usuario]/agon.git
cd agon

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar todas las variables en .env.local

# 4. Aplicar schema a la DB
npm run db:push

# 5. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # Linting con ESLint
npm run db:push      # Aplicar schema a Neon (sin migraciones)
npm run db:studio    # Abrir Drizzle Studio (explorador de DB)
npm run db:generate  # Generar archivos de migración
```

---

## Variables de entorno

Ver [.env.example](.env.example) para la lista completa con comentarios.

Las variables críticas son:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk frontend
- `CLERK_SECRET_KEY`: Clerk backend
- `RESEND_API_KEY`: email (invitaciones duelo; ver `.env.example`)
- `DATABASE_URL`: Neon Direct Connection URL
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `ANTHROPIC_API_KEY`: Para La Crónica del Período

Las fechas de inicio y fin del Gran Agon viven en la tabla `retos` (`fecha_inicio`, `fecha_fin`), no en variables de entorno públicas.

---

## Estructura del proyecto

```
agon/
├── app/
│   ├── (auth)/sign-in/          # Login Clerk
│   ├── (protected)/             # Rutas protegidas (solo agonistas)
│   │   ├── dashboard/           # Las Pruebas del día
│   │   ├── altis/               # Scoreboard y estadísticas
│   │   ├── agora/               # El Ágora
│   │   ├── correspondencia/     # Chat directo
│   │   ├── poderes/             # Provocaciones, Señalamiento, Ekecheiria
│   │   ├── inscripciones/       # Logros
│   │   ├── cronicas/            # Crónicas IA
│   │   ├── perfil/              # Perfil del agonista
│   │   ├── oraculo/             # Oráculo sellado
│   │   ├── contrato/            # Cláusulas
│   │   ├── veredicto/           # Ceremonia final
│   │   └── admin/               # Panel admin (rol TBD)
│   ├── api/                     # API Routes
│   ├── onboarding/              # Onboarding + Oráculo día 1
│   └── unauthorized/            # Usuario no autorizado
├── components/
│   ├── agon/                    # UI del universo Agon
│   └── layout/                  # Navbar, MobileNav
├── hooks/                       # usePulso, useCorrespondencia, etc.
├── lib/
│   ├── auth/                    # Sesión Clerk + helpers (PROMPT 03)
│   ├── cronica/                 # Generación de crónicas con IA
│   ├── db/                      # schema, queries, constants
│   └── inscripciones/           # Triggers de logros
├── docs/                        # Documentación técnica
├── middleware.ts                # Clerk + lista blanca de agonistas
└── types/                       # Tipos TypeScript
```

---

## El Gran Agon en producción

**URL:** [agon.vercel.app](https://agon.vercel.app)  
**Período:** 6 de abril - 4 de mayo de 2026
**Participantes:** definidos por instancia / onboarding (migración multi-instancia en curso).
