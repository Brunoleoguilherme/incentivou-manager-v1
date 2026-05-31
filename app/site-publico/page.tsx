// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SitePublicoAdmin() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState({
    ativo: true,
    titulo: '',
    subtitulo: '',
    textoLgpd: '',
    whatsapp: '',
    emailDestino: '',
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_config')
      .select('valor')
      .eq('chave', 'simulador_publico')
      .single();

    if (!error && data?.valor) {
      setConfig(data.valor);
    }

    setLoading(false);
  }

  function atualizar(campo, valor) {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setSalvando(true);

    const { error } = await supabase
      .from('site_config')
      .upsert({
        chave: 'simulador_publico',
        valor: config,
        atualizado_em: new Date().toISOString(),
      }, {
        onConflict: 'chave',
      });

    setSalvando(false);

    if (error) {
      console.error(error);
      alert('Erro ao salvar alterações.');
      return;
    }

    alert('Site público atualizado com sucesso!');
  }

  if (loading) {
    return <main className="page">Carregando...</main>;
  }

  return (
    <main className="page">
      <section className="top">
        <div>
          <span>IncentiVou Manager</span>
          <h1>Site Público</h1>
          <p>
            Altere aqui os textos e configurações da página pública do simulador.
          </p>
        </div>

        <a href="/simulador" target="_blank">
          Ver página pública
        </a>
      </section>

      <section className="card">
        <label className="toggle">
          <input
            type="checkbox"
            checked={config.ativo}
            onChange={(e) => atualizar('ativo', e.target.checked)}
          />
          Simulador público ativo
        </label>

        <label>
          Título da página
          <input
            value={config.titulo || ''}
            onChange={(e) => atualizar('titulo', e.target.value)}
          />
        </label>

        <label>
          Subtítulo / texto de apresentação
          <textarea
            value={config.subtitulo || ''}
            onChange={(e) => atualizar('subtitulo', e.target.value)}
          />
        </label>

        <label>
          Texto de consentimento LGPD
          <textarea
            value={config.textoLgpd || ''}
            onChange={(e) => atualizar('textoLgpd', e.target.value)}
          />
        </label>

        <div className="grid">
          <label>
            WhatsApp de contato
            <input
              value={config.whatsapp || ''}
              onChange={(e) => atualizar('whatsapp', e.target.value)}
              placeholder="Ex: 5531999999999"
            />
          </label>

          <label>
            E-mail de destino
            <input
              value={config.emailDestino || ''}
              onChange={(e) => atualizar('emailDestino', e.target.value)}
              placeholder="contato@incentivou.com.br"
            />
          </label>
        </div>

        <button onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #07152f;
          color: white;
          padding: 36px;
          font-family: Arial, sans-serif;
        }

        .top {
          max-width: 1000px;
          margin: 0 auto 24px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .top span {
          color: #20d68b;
          font-weight: 900;
        }

        .top h1 {
          margin: 6px 0;
          font-size: 36px;
        }

        .top p {
          margin: 0;
          color: #d8e3f8;
        }

        .top a {
          background: #20d68b;
          color: #04111f;
          padding: 14px 18px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 900;
        }

        .card {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          color: #101827;
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 20px 70px rgba(0,0,0,.35);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-weight: 800;
        }

        .toggle {
          flex-direction: row;
          align-items: center;
          background: #eef8f4;
          padding: 16px;
          border-radius: 16px;
          color: #075f3f;
        }

        input,
        textarea {
          border: 1px solid #d3dbea;
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
        }

        textarea {
          min-height: 120px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        button {
          background: linear-gradient(135deg, #20d68b, #12b76a);
          color: #04111f;
          border: 0;
          border-radius: 16px;
          padding: 16px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .page {
            padding: 20px;
          }

          .top {
            flex-direction: column;
            align-items: flex-start;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}