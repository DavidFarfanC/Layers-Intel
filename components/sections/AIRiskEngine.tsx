"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

const inputs = [
  { label: "Datos Históricos de Crimen", color: "bg-blue-100 text-blue-700" },
  { label: "Incidentes Recientes", color: "bg-red-100 text-red-700" },
  { label: "Señales Sociales", color: "bg-purple-100 text-purple-700" },
  { label: "Fuentes OSINT", color: "bg-teal-100 text-teal-700" },
  { label: "Reportes Validados", color: "bg-amber-100 text-amber-700" },
];

const outputs = [
  { label: "Puntajes de Riesgo Dinámicos", icon: "📊" },
  { label: "Evaluaciones de Amenazas", icon: "⚡" },
  { label: "Pronósticos Predictivos", icon: "🔮" },
  { label: "Informes Ejecutivos", icon: "📋" },
];

export default function AIRiskEngine() {
  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <SectionLabel>Motor de Riesgo</SectionLabel>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-slate-900 mb-5"
            >
              Inteligencia construida sobre{" "}
              <span className="gradient-text">cinco capas de señales</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg text-slate-500 leading-relaxed mb-8"
            >
              Nuestro motor de riesgo combina datos históricos de crimen, incidentes
              recientes, señales sociales, fuentes OSINT y reportes validados para
              generar puntajes de riesgo dinámicos que se adaptan en tiempo real.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {inputs.map((input) => (
                <span
                  key={input.label}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${input.color}`}
                >
                  {input.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Button variant="primary" size="md">
                Explorar el Motor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Engine card */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-50/60 via-transparent to-transparent pointer-events-none" />

              {/* Center icon */}
              <div className="relative mb-8 flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute h-24 w-24 rounded-full border-2 border-dashed border-brand-200"
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 shadow-xl">
                  <BrainCircuit className="h-10 w-10 text-white" />
                </div>
                <span className="mt-3 text-sm font-semibold text-brand-700">
                  Motor de Riesgo IA
                </span>
                <span className="text-xs text-slate-400">
                  Procesando en tiempo real
                </span>
              </div>

              {/* Input nodes */}
              <div className="mb-6">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 text-center">
                  Entradas
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {inputs.map((inp, i) => (
                    <motion.div
                      key={inp.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${inp.color}`}
                    >
                      {inp.label}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-6 w-px bg-gradient-to-b from-brand-300 to-brand-600" />
                  <ArrowRight className="h-4 w-4 rotate-90 text-brand-600" />
                </div>
              </div>

              {/* Output cards */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3 text-center">
                  Salidas de Inteligencia
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {outputs.map((out, i) => (
                    <motion.div
                      key={out.label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                      className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2"
                    >
                      <span className="text-base">{out.icon}</span>
                      <span className="text-[11px] font-medium text-brand-800">
                        {out.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
