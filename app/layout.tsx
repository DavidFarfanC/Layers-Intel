import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layers Intel — Plataforma de Inteligencia de Riesgo con IA",
  description:
    "Layers Intel transforma señales territoriales, sociales y digitales en inteligencia de riesgo accionable para gobiernos, empresas y equipos de seguridad pública.",
  keywords: [
    "inteligencia de riesgo",
    "analítica con IA",
    "mapas de calor de incidentes",
    "inteligencia de amenazas digitales",
    "seguridad pública",
    "OSINT",
  ],
  openGraph: {
    title: "Layers Intel — Plataforma de Inteligencia de Riesgo con IA",
    description:
      "Transforma señales territoriales, sociales y digitales en inteligencia accionable.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
