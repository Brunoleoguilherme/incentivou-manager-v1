'use client';

import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import { getComplianceData } from '@/lib/complianceService';
import {
  AlertTriangle,
  Clock3,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

export default function CompliancePage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);

  useEffect(() => {
    async function carregar() {
      const data = await getComplianceData();

      setDocumentos(data.documentos);
      setAlertas(data.alertas);
      setProjetos(data.projetos);
    }

    carregar();
  }, []);

  const aprovados = documentos.filter(
    (d) => d.status === 'aprovado'
  ).length;

  const score = documentos.length
    ? Math.round((aprovados / documentos.length) * 100)
    : 0;

  return (
    <PortalShell portal="admin">
      <div className="space-y-8">

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                Compliance documental
              </p>

              <h2 className="mt-2 text-5xl font-black text-slate-950">
                Central de validação técnica
              </h2>

              <p className="mt-3 max-w-3xl text-lg font-semibold text-slate-600">
                Acompanhe documentos, certidões,
                pendências, riscos e validações dos
                projetos em andamento.
              </p>
            </div>

            <div className="rounded-3xl bg-[#041b43] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Score Geral
              </p>

              <h3 className="text-5xl font-black">
                {score}%
              </h3>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">

          <Card
            icon={<FileCheck2 />}
            label="Documentos"
            value={documentos.length}
          />

          <Card
            icon={<Clock3 />}
            label="Em análise"
            value={
              documentos.filter(
                (d) => d.status === 'em_analise'
              ).length
            }
          />

          <Card
            icon={<AlertTriangle />}
            label="Alertas"
            value={alertas.length}
          />

          <Card
            icon={<ShieldCheck />}
            label="Projetos"
            value={projetos.length}
          />

        </section>

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black">
              Documentos
            </h3>

            <div className="mt-6 space-y-4">

              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black">
                      {doc.nome}
                    </h4>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
                      {doc.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Tipo: {doc.tipo}
                  </p>
                </div>
              ))}

            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black">
              Pendências Prioritárias
            </h3>

            <div className="mt-6 space-y-4">

              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                >
                  <h4 className="font-black">
                    {alerta.titulo}
                  </h4>

                  <p className="mt-2 text-sm">
                    {alerta.mensagem}
                  </p>

                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Prazo: {alerta.prazo}
                  </p>
                </div>
              ))}

            </div>
          </div>

        </section>

      </div>
    </PortalShell>
  );
}

function Card({
  icon,
  label,
  value,
}: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-emerald-600">
        {icon}
      </div>

      <p className="mt-4 text-sm font-black text-slate-500">
        {label}
      </p>

      <h3 className="text-4xl font-black">
        {value}
      </h3>
    </div>
  );
}