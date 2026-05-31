import ProjectDossier from '@/components/ProjectDossier';

export default function ProjetoDetalhePage({ params }: { params: { id: string } }) {
  return <ProjectDossier projetoId={params.id} />;
}
