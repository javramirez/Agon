export const AGONISTAS = {
  JAVIER: {
    clerkId: process.env.CLERK_JAVIER_USER_ID!,
    nombre: 'Javier',
  },
  MATIAS: {
    clerkId: process.env.CLERK_MATIAS_USER_ID!,
    nombre: 'Matías',
  },
} as const
