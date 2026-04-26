"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Shield,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Copy,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  getAlertCase,
  getSeverityConfig,
  getStatusConfig,
  getPlatformConfig,
  type CaseStatus,
  type AlertCase,
  type EscalationStatus,
} from "@/lib/mock/ctiData";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "artifacts" | "investigation" | "timeline" | "escalation";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",      label: "Resumen"       },
  { id: "artifacts",     label: "Artefactos"    },
  { id: "investigation", label: "Investigación" },
  { id: "timeline",      label: "Timeline"      },
  { id: "escalation",    label: "Escalamiento"  },
];

export interface AlertDetailDrawerProps {
  caseId: string | null;
  localStatus?: CaseStatus;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: CaseStatus) => void;
}

// ── Artifact type badge ───────────────────────────────────────────────────────

const ARTIFACT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  url:      { label: "URL",      bg: "bg-orange-50",  text: "text-orange-700" },
  ip:       { label: "IP",       bg: "bg-blue-50",    text: "text-blue-700"   },
  handle:   { label: "Handle",   bg: "bg-purple-50",  text: "text-purple-700" },
  keyword:  { label: "Keyword",  bg: "bg-amber-50",   text: "text-amber-700"  },
  hash:     { label: "Hash",     bg: "bg-slate-100",  text: "text-slate-600"  },
  location: { label: "Location", bg: "bg-teal-50",    text: "text-teal-700"   },
  email:    { label: "Email",    bg: "bg-pink-50",    text: "text-pink-700"   },
  domain:   { label: "Domain",   bg: "bg-indigo-50",  text: "text-indigo-700" },
};

// ── Escalation status display ─────────────────────────────────────────────────

const ESCALATION_CFG: Record<EscalationStatus, { label: string; dot: string; text: string }> = {
  not_escalated: { label: "No escalado",    dot: "bg-slate-300",  text: "text-slate-500"  },
  pending:       { label: "Pendiente",      dot: "bg-amber-400",  text: "text-amber-700"  },
  sent:          { label: "Enviado",        dot: "bg-blue-500",   text: "text-blue-700"   },
  acknowledged:  { label: "Acuse recibido", dot: "bg-purple-500", text: "text-purple-700" },
  resolved:      { label: "Resuelto",       dot: "bg-green-500",  text: "text-green-700"  },
};

// ── Validation status display ─────────────────────────────────────────────────

const VALIDATION_CFG = {
  auto_classified: { label: "Clasificado automáticamente", icon: Layers,        color: "text-brand-600"  },
  human_validated: { label: "Validado por analista",       icon: CheckCircle,   color: "text-green-600"  },
  pending_review:  { label: "Pendiente de revisión",       icon: AlertTriangle, color: "text-amber-600"  },
};

// ── Tab content components ────────────────────────────────────────────────────

function OverviewTab({ c, effectiveStatus }: { c: AlertCase; effectiveStatus: CaseStatus }) {
  const sev = getSeverityConfig(c.severity);
  const sta = getStatusConfig(effectiveStatus);
  const val = VALIDATION_CFG[c.validationStatus];
  const ValIcon = val.icon;

  const dt = new Date(c.timestamp).toLocaleString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Resumen ejecutivo
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">{c.summary}</p>
      </section>

      {/* Classification */}
      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Clasificación automática
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Tipo de riesgo",  value: c.riskType },
            { label: "Severidad",       value: <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span> },
            { label: "Confianza",       value: <span className="text-sm font-bold text-slate-800">{c.confidence}%</span> },
            { label: "Clasificador",    value: <span className="font-mono text-xs text-slate-600">{c.classifier}</span> },
            { label: "Validación",      value: <span className={`flex items-center gap-1 text-xs font-medium ${val.color}`}><ValIcon className="h-3.5 w-3.5"/>{val.label}</span> },
            { label: "Fuente",          value: <span className="text-xs font-semibold text-brand-700">Layers Guard</span> },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
              <div className="text-xs text-slate-700">{value}</div>
            </div>
          ))}
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Score de confianza</span><span>{c.confidence}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${c.confidence}%`,
                backgroundColor: c.confidence >= 90 ? "#22c55e" : c.confidence >= 75 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>
      </section>

      {/* Event data */}
      {(c.accountHandle || c.userContext || c.approximateLocation || c.sourceIp) && (
        <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Datos del evento
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {c.accountHandle && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Cuenta origen</p>
                <span className="font-mono text-xs text-slate-700">{c.accountHandle}</span>
              </div>
            )}
            {c.userContext && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Contexto usuario</p>
                <span className="text-xs text-slate-600">{c.userContext}</span>
              </div>
            )}
            {c.approximateLocation && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Localidad aprox.</p>
                <span className="text-xs text-slate-700">{c.approximateLocation}</span>
              </div>
            )}
            {c.sourceIp && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">IP aproximada</p>
                <span className="font-mono text-xs text-slate-700">{c.sourceIp}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Meta */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { icon: Clock,         label: "Detectado",  value: dt },
          { icon: User,          label: "Estado",     value: <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sta.bg} ${sta.text}`}>{sta.label}</span> },
          { icon: Shield,        label: "Plataforma", value: getPlatformConfig(c.platform).label },
          { icon: ArrowUpRight,  label: "Fuente",     value: c.source === "layers_guard" ? "Layers Guard" : c.source },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
            <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
              <div className="text-xs text-slate-700 font-medium mt-0.5">{value}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Ethical disclaimer */}
      <section className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Aviso: </span>
            La plataforma genera inteligencia de apoyo a la decisión. Cualquier acción operativa requiere validación humana autorizada.
          </p>
        </div>
      </section>
    </div>
  );
}

function ArtifactsTab({ c }: { c: AlertCase }) {
  function copy(val: string) {
    navigator.clipboard.writeText(val).catch(() => {});
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">{c.artifacts.length} indicadores extraídos</p>
      {c.artifacts.map((a, i) => {
        const badge = ARTIFACT_BADGE[a.type] ?? ARTIFACT_BADGE["keyword"];
        return (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
                <span className="font-mono text-xs text-slate-700 break-all">{a.value}</span>
              </div>
              <button
                onClick={() => copy(a.value)}
                className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Copiar"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{a.description}</p>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${a.confidence}%`,
                    backgroundColor: a.confidence >= 90 ? "#22c55e" : a.confidence >= 75 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                Confianza: <span className="font-semibold text-slate-600">{a.confidence}%</span>
              </span>
            </div>
          </div>
        );
      })}
      {c.artifacts.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">Sin artefactos extraídos para este caso.</div>
      )}
    </div>
  );
}

function InvestigationTab({ c }: { c: AlertCase }) {
  const inv = c.investigation;
  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Hallazgos principales</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{inv.findings}</p>
      </section>

      {inv.correlatedEvidence.length > 0 && (
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Evidencia correlacionada</h4>
          <ul className="space-y-2">
            {inv.correlatedEvidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <ChevronRight className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
                {e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {inv.observedSignals.length > 0 && (
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Señales observadas</h4>
          <div className="space-y-2">
            {inv.observedSignals.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                <p className="text-xs text-slate-600">{s}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-red-50 border border-red-100 p-4">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-red-400 mb-2">Vector de riesgo</h4>
        <p className="text-sm text-red-700 leading-relaxed">{inv.riskVector}</p>
      </section>

      <section className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-brand-600" />
          <h4 className="text-xs font-semibold text-brand-800">Recomendación</h4>
        </div>
        <p className="text-xs text-brand-700 leading-relaxed whitespace-pre-line">{inv.recommendation}</p>
      </section>
    </div>
  );
}

function TimelineTab({ c }: { c: AlertCase }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-slate-400 mb-4">{c.timeline.length} eventos registrados</p>
      <ol className="relative ml-4 border-l-2 border-slate-200 space-y-5">
        {c.timeline.map((ev, i) => {
          const isCompleted = ev.status === "completed";
          const isActive    = ev.status === "active";
          return (
            <li key={i} className="pl-5 relative">
              <span
                className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  isCompleted ? "border-green-400 bg-green-50"
                  : isActive  ? "border-brand-400 bg-brand-50"
                  :             "border-slate-200 bg-white"
                }`}
              >
                {isCompleted && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                {isActive    && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />}
              </span>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono text-slate-400">{ev.time === "Pendiente" ? "Pendiente" : new Date(ev.time).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                {isActive  && <span className="text-[9px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">ACTIVO</span>}
                {!isCompleted && !isActive && <span className="text-[9px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">PENDIENTE</span>}
              </div>
              <p className="text-xs font-semibold text-slate-800">{ev.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{ev.description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EscalationTab({
  c,
  effectiveStatus,
  onStatusChange,
}: {
  c: AlertCase;
  effectiveStatus: CaseStatus;
  onStatusChange: (newStatus: CaseStatus) => void;
}) {
  const esc    = c.escalation;
  const escCfg = ESCALATION_CFG[esc.status];
  const sta    = getStatusConfig(effectiveStatus);

  return (
    <div className="space-y-5">
      {/* Escalation info */}
      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Información de escalamiento</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Socio sugerido",  value: esc.suggestedPartner },
            { label: "Estado",          value: <span className={`flex items-center gap-1.5 text-xs font-semibold ${escCfg.text}`}><span className={`h-1.5 w-1.5 rounded-full ${escCfg.dot}`}/>{escCfg.label}</span> },
            { label: "SLA",             value: esc.sla },
            { label: "Reportes enviados", value: <span className="font-bold text-slate-800">{esc.reportsSent}</span> },
            { label: "Último envío",    value: esc.lastSent ? new Date(esc.lastSent).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "No enviado" },
            { label: "Estado del caso", value: <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sta.bg} ${sta.text}`}>{sta.label}</span> },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
              <div className="text-xs text-slate-700">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Action buttons */}
      <section>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Acciones disponibles</h4>
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onStatusChange("escalated")}
            disabled={effectiveStatus === "escalated" || effectiveStatus === "closed"}
            className="flex items-center justify-between w-full rounded-xl bg-purple-600 text-white px-4 py-3 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Escalar caso</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange("in_review")}
            disabled={effectiveStatus === "in_review" || effectiveStatus === "closed"}
            className="flex items-center justify-between w-full rounded-xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Marcar en revisión</span>
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange("in_progress")}
            disabled={effectiveStatus === "in_progress" || effectiveStatus === "closed"}
            className="flex items-center justify-between w-full rounded-xl bg-amber-500 text-white px-4 py-3 text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Marcar en proceso</span>
            <Clock className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange("closed")}
            disabled={effectiveStatus === "closed"}
            className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-white text-slate-600 px-4 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Cerrar caso</span>
            <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Aviso ético: </span>
            La plataforma genera inteligencia de apoyo a la decisión. Cualquier acción operativa requiere validación humana autorizada.
          </p>
        </div>
      </section>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function AlertDetailDrawer({
  caseId,
  localStatus,
  onClose,
  onStatusChange,
}: AlertDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Close on Escape
  useEffect(() => {
    if (!caseId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [caseId, onClose]);

  // Reset tab when case changes
  useEffect(() => {
    setActiveTab("overview");
  }, [caseId]);

  const alertCase = caseId ? getAlertCase(caseId) : null;
  const effectiveStatus: CaseStatus = localStatus ?? alertCase?.status ?? "open";

  return (
    <AnimatePresence>
      {alertCase && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl overflow-hidden"
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            {(() => {
              const sev  = getSeverityConfig(alertCase.severity);
              const sta  = getStatusConfig(effectiveStatus);
              const plat = getPlatformConfig(alertCase.platform);
              const dt   = new Date(alertCase.timestamp).toLocaleString("es-MX", {
                day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit",
              });

              return (
                <div className="shrink-0 border-b border-slate-100">
                  <div className="flex items-start gap-3 px-5 py-4">
                    {/* Severity colour bar */}
                    <div
                      className="mt-1 w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: sev.dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-[10px] text-slate-400">{alertCase.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{sev.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sta.bg} ${sta.text}`}>{sta.label}</span>
                        <span className="text-[10px] font-medium" style={{ color: plat.color }}>{plat.label}</span>
                        <span className="text-[10px] text-slate-400 ml-auto shrink-0">{dt}</span>
                      </div>
                      <h2 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                        {alertCase.riskType}
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tab bar */}
                  <div className="flex overflow-x-auto scrollbar-hide px-4 gap-0 border-t border-slate-100">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-brand-500 text-brand-700"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Scrollable tab content ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {activeTab === "overview"      && <OverviewTab      c={alertCase} effectiveStatus={effectiveStatus} />}
              {activeTab === "artifacts"     && <ArtifactsTab     c={alertCase} />}
              {activeTab === "investigation" && <InvestigationTab c={alertCase} />}
              {activeTab === "timeline"      && <TimelineTab      c={alertCase} />}
              {activeTab === "escalation"    && (
                <EscalationTab
                  c={alertCase}
                  effectiveStatus={effectiveStatus}
                  onStatusChange={(s) => onStatusChange(alertCase.id, s)}
                />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
