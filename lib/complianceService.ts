import { supabase } from './supabaseClient';

export async function getComplianceData() {
  if (!supabase) {
    return {
      documentos: [],
      alertas: [],
      projetos: [],
    };
  }

  const [documentosRes, alertasRes, projetosRes] = await Promise.all([
    supabase.from('manager_documentos').select('*'),
    supabase.from('manager_alertas').select('*'),
    supabase.from('manager_projetos').select('*'),
  ]);

  return {
    documentos: documentosRes.data || [],
    alertas: alertasRes.data || [],
    projetos: projetosRes.data || [],
  };
}