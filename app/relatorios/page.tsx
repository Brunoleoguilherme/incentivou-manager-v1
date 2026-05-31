import ModulePage from "@/components/ModulePage";

export default function Page() {
  return (
    <ModulePage
      title="Relatórios"
      subtitle="Relatórios executivos, financeiros, ESG e operacionais para empresas, proponentes, captadores e gestores."
      items={[
        "Relatório executivo",
        "Relatório para patrocinador",
        "Relatório ESG",
        "Relatório financeiro",
        "Relatório de captação",
        "Relatório de prestação",
        "Exportação PDF",
        "Exportação Excel",
      ]}
      kpis={[
        ["Relatórios gerados", "312"],
        ["PDFs", "186"],
        ["Excels", "92"],
        ["Automáticos", "34"],
      ]}
    />
  );
}

