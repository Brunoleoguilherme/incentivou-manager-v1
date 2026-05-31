import ModulePage from "@/components/ModulePage";

export default function Page() {
  return (
    <ModulePage
      title="Configurações"
      subtitle="Gestão de usuários, permissões, planos, branding e parâmetros da plataforma."
      items={[
        "Usuários e perfis",
        "Permissões por plano",
        "Configuração de tenants",
        "Identidade visual",
        "Parâmetros fiscais",
        "Integrações",
        "Notificações",
        "Segurança",
      ]}
      kpis={[
        ["Usuários", "42"],
        ["Perfis", "8"],
        ["Planos", "6"],
        ["Integrações", "5"],
      ]}
    />
  );
}

