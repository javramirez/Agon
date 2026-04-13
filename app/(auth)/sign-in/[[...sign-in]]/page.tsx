'use client'

import { motion } from 'framer-motion'
import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

const PARTICLES = [
  { left: '5%', top: '15%', duration: 4.2, delay: 0 },
  { left: '20%', top: '70%', duration: 3.8, delay: 0.8 },
  { left: '45%', top: '25%', duration: 5.1, delay: 1.6 },
  { left: '70%', top: '80%', duration: 4.5, delay: 0.3 },
  { left: '85%', top: '20%', duration: 3.5, delay: 2.1 },
  { left: '92%', top: '55%', duration: 4.8, delay: 1.1 },
  { left: '30%', top: '45%', duration: 5.3, delay: 0.6 },
  { left: '60%', top: '10%', duration: 3.9, delay: 1.9 },
  { left: '10%', top: '90%', duration: 4.1, delay: 2.4 },
  { left: '75%', top: '40%', duration: 5.0, delay: 0.1 },
  { left: '50%', top: '60%', duration: 3.7, delay: 1.4 },
  { left: '15%', top: '35%', duration: 4.4, delay: 0.9 },
]

export default function SignInPage() {
  return (
    <>
      {/* ─── CLERK DARK OVERRIDE GLOBAL ─────────────────── */}
      <style>{`
        .cl-rootBox,
        .cl-card,
        .cl-cardBox,
        .cl-signIn-root,
        .cl-component,
        .cl-main,
        .cl-footer {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .cl-internal-b3fm6y {
          background: transparent !important;
        }
        .cl-headerTitle {
          font-family: 'Cinzel', serif !important;
          color: #f5f5f5 !important;
          font-size: 1.1rem !important;
          letter-spacing: 0.05em !important;
        }
        .cl-headerSubtitle {
          color: #888 !important;
          font-size: 0.75rem !important;
        }
        .cl-socialButtonsBlockButton {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #f5f5f5 !important;
          border-radius: 0.75rem !important;
          transition: all 0.2s !important;
        }
        .cl-socialButtonsBlockButton:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(245,158,11,0.3) !important;
        }
        .cl-dividerLine {
          background: rgba(255,255,255,0.08) !important;
        }
        .cl-dividerText {
          color: #666 !important;
          background: transparent !important;
        }
        .cl-formFieldLabel {
          color: rgba(255,255,255,0.6) !important;
          font-size: 0.7rem !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
        }
        .cl-formFieldInput {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #f5f5f5 !important;
          border-radius: 0.75rem !important;
          font-size: 0.875rem !important;
          transition: border-color 0.2s !important;
        }
        .cl-formFieldInput:focus {
          border-color: rgba(245,158,11,0.5) !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.1) !important;
          outline: none !important;
        }
        .cl-formButtonPrimary {
          background: #F59E0B !important;
          color: #000 !important;
          font-family: 'Cinzel', serif !important;
          font-weight: 700 !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase !important;
          font-size: 0.75rem !important;
          border-radius: 0.75rem !important;
          border: none !important;
          box-shadow: none !important;
          transition: background 0.2s !important;
        }
        .cl-formButtonPrimary:hover {
          background: rgba(245,158,11,0.85) !important;
        }
        .cl-footerActionText {
          color: #666 !important;
          font-size: 0.7rem !important;
        }
        .cl-footerActionLink {
          color: #F59E0B !important;
          font-size: 0.7rem !important;
        }
        .cl-footerActionLink:hover {
          color: rgba(245,158,11,0.8) !important;
        }
        .cl-footer {
          border-top: 1px solid rgba(255,255,255,0.06) !important;
        }
        .cl-badge {
          background: rgba(245,158,11,0.1) !important;
          color: #F59E0B !important;
          border: 1px solid rgba(245,158,11,0.2) !important;
        }
        .cl-identityPreviewText {
          color: #f5f5f5 !important;
        }
        .cl-identityPreviewEditButton {
          color: #F59E0B !important;
        }
        .cl-formFieldInputShowPasswordButton {
          color: #888 !important;
        }
        .cl-formFieldInputShowPasswordButton:hover {
          color: #f5f5f5 !important;
        }
        .cl-otpCodeFieldInput {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #f5f5f5 !important;
        }
        .cl-alert {
          background: rgba(239,68,68,0.1) !important;
          border: 1px solid rgba(239,68,68,0.2) !important;
        }
        .cl-alertText {
          color: #FCA5A5 !important;
        }
        .cl-logoImage, .cl-logoBox {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-[#080808] text-foreground flex flex-col overflow-hidden">
        {/* ─── FONDO ─────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,_rgba(245,158,11,0.05)_0%,_transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/10 to-transparent" />
        </div>

        {/* ─── PARTÍCULAS ────────────────────────────────── */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-amber/40"
              style={{ left: p.left, top: p.top }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* ─── HEADER ────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-8 max-w-5xl mx-auto w-full">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-widest hover:text-amber transition-colors duration-300"
          >
            AGON
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground font-body hover:text-amber transition-colors tracking-widest uppercase"
          >
            ← Volver
          </Link>
        </div>

        {/* ─── CONTENIDO ─────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 px-6 py-12 max-w-5xl mx-auto w-full min-h-0">
          {/* ── Izquierda — Lore ──────────────────────── */}
          <div className="flex-1 text-center lg:text-left space-y-8 max-w-sm">
            <div className="space-y-3">
              <p className="text-xs text-amber/80 tracking-widest uppercase font-body">
                El Olimpo te espera
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
                Inscribe tu
                <br />
                <span className="text-amber">kleos.</span>
              </h1>
            </div>

            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Solo los agonistas del Gran Agon pueden cruzar esta puerta. Cada acción que tomes será
              presenciada por los siete dioses del Olimpo y registrada para siempre en el Altis.
            </p>

            <div className="flex items-center gap-3 lg:justify-start justify-center">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber/40" />
              <span className="text-amber/50 text-sm font-display">⚖</span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber/40" />
            </div>

            <blockquote className="border-l-2 border-amber/30 pl-4 text-left">
              <p className="text-sm text-muted-foreground font-body italic leading-relaxed">
                &ldquo;La excelencia no se declara. Se inscribe en cada acto, en cada prueba
                superada, en cada día que el Altis graba tu nombre con gloria.&rdquo;
              </p>
            </blockquote>

            {/* Dioses miniatura */}
            <div className="hidden lg:flex items-center gap-3">
              <p className="text-xs text-muted-foreground/60 font-body whitespace-nowrap">
                Bajo la mirada de
              </p>
              <div className="flex -space-x-2">
                {[
                  { key: 'ares', src: '/dioses/ares.jpg' },
                  { key: 'apolo', src: '/dioses/apolo.png' },
                  { key: 'nike', src: '/dioses/nike.png' },
                  { key: 'hermes', src: '/dioses/hermes.png' },
                  { key: 'demeter', src: '/dioses/demeter.png' },
                  { key: 'morfeo', src: '/dioses/morfeo.jpg' },
                  { key: 'eris', src: '/dioses/eris.png' },
                ].map((dios) => (
                  <div
                    key={dios.key}
                    className="w-7 h-7 rounded-full border border-border bg-surface-1 overflow-hidden flex-shrink-0 ring-1 ring-black"
                  >
                    <img
                      src={dios.src}
                      alt={dios.key}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 font-body">y el Altis</p>
            </div>
          </div>

          {/* ── Derecha — Clerk ───────────────────────── */}
          <div className="relative flex-shrink-0">
            {/* Glow ambiental */}
            <div className="absolute -inset-4 bg-amber/3 blur-3xl rounded-full pointer-events-none" />

            {/* Wrapper que se adapta al tamaño real del widget */}
            <div
              className="relative rounded-2xl border border-white/8 overflow-hidden"
              style={{ background: 'rgba(12,12,12,0.95)' }}
            >
              {/* Línea dorada superior */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent z-10" />

              {/* Header custom */}
              <div className="pt-6 pb-2 px-6 text-center space-y-1">
                <p className="font-display text-base font-bold tracking-widest text-foreground uppercase">
                  Acceso al Agon
                </p>
                <p className="text-xs text-muted-foreground font-body">Solo agonistas autorizados</p>
              </div>

              {/* Separador */}
              <div className="mx-6 h-px bg-white/5 mb-1" />

              {/* Widget — sin padding lateral para respetar su ancho natural */}
              <SignIn
                appearance={{
                  variables: {
                    colorBackground: 'transparent',
                    colorInputBackground: 'rgba(255,255,255,0.04)',
                    colorInputText: '#f5f5f5',
                    colorText: '#f5f5f5',
                    colorTextSecondary: '#888888',
                    colorPrimary: '#F59E0B',
                    colorDanger: '#EF4444',
                    borderRadius: '0.75rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                  },
                  elements: {
                    card: 'shadow-none border-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    logoBox: 'hidden',
                  },
                }}
              />

              {/* Línea dorada inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent z-10" />
            </div>
          </div>
        </div>

        {/* ─── FOOTER ────────────────────────────────────── */}
        <div className="relative z-10 px-6 py-5 text-center border-t border-white/5">
          <p className="text-xs text-muted-foreground/30 font-body tracking-widest uppercase">
            Agon · 29 días · Dos agonistas · Los dioses y el Altis registran todo
          </p>
        </div>
      </div>
    </>
  )
}
