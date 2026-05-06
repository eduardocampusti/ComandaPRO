import React, { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { uploadImage } from '../lib/database';
import { compressImage } from '../lib/image-utils';

export default function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(settings);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage(null);

    try {
      await updateSettings(formData);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar configuracoes:', error);
      const msg = error.message || 'Nao foi possivel salvar as configuracoes. Tente novamente em instantes.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.id = 'stitch-settings-icons';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    if (!document.getElementById(link.id)) document.head.appendChild(link);

    const font1 = document.createElement('link');
    font1.id = 'stitch-settings-fonts';
    font1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap';
    font1.rel = 'stylesheet';
    if (!document.getElementById(font1.id)) document.head.appendChild(font1);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ffdad7] border-t-[#bb001b]" />
          <p className="mt-4 font-plus-jakarta-sans text-lg font-black text-[#1a1c1c]">
            Carregando configuracoes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stitch-scope-configura_es_do_sistema_comanda_pro w-full">
      <style>{`
        .stitch-scope-configura_es_do_sistema_comanda_pro {
          --primary: #bb001b;
          --on-primary: #ffffff;
          --primary-container: #e6182a;
          --on-primary-container: #fffbff;
          --on-primary-fixed-variant: #930013;
          --primary-fixed: #ffdad7;
          
          --secondary: #5f5e5e;
          --on-secondary: #ffffff;
          --secondary-container: #e4e2e1;
          --on-secondary-container: #656464;
          --secondary-fixed: #e4e2e1;
          --secondary-fixed-dim: #c8c6c6;
          
          --tertiary: #795600;
          --on-tertiary: #ffffff;
          --tertiary-container: #986d00;
          --on-tertiary-container: #fffbff;
          
          --background: #f9f9f9;
          --on-background: #1a1c1c;
          
          --surface: #f9f9f9;
          --on-surface: #1a1c1c;
          --surface-variant: #e2e2e2;
          --on-surface-variant: #5d3f3d;
          --surface-tint: #c0001c;
          --surface-dim: #dadada;
          --surface-bright: #f9f9f9;
          
          --outline: #926e6b;
          --outline-variant: #e7bcb9;
          
          --surface-container-lowest: #ffffff;
          --surface-container-low: #f3f3f3;
          --surface-container: #eeeeee;
          --surface-container-high: #e8e8e8;
          --surface-container-highest: #e2e2e2;
          
          --error: #ba1a1a;
          --on-error: #ffffff;
          --error-container: #ffdad6;
          --on-error-container: #93000a;

          background-color: var(--background);
          color: var(--on-background);
          font-family: 'Inter', sans-serif;
          width: 100%;
        }

        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; line-height: 1.2; font-weight: 800; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; line-height: 1.3; font-weight: 700; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-lg { font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.6; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-md { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.5; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-body-sm { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.4; font-weight: 400; }
        .stitch-scope-configura_es_do_sistema_comanda_pro .font-label-bold { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.0; font-weight: 600; }

        .stitch-scope-configura_es_do_sistema_comanda_pro .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-style: normal;
          display: inline-block;
          line-height: 1;
        }

        .stitch-scope-configura_es_do_sistema_comanda_pro input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(187, 0, 27, 0.2);
        }
      `}</style>

      <form onSubmit={handleSubmit} className="p-4 md:p-8 w-full max-w-[1200px] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-h1 text-[#1a1c1c] tracking-tight">Configuracoes do Sistema</h1>
            <p className="font-body-md text-[#5f5e5e] mt-2">Gerencie as preferencias, dados do estabelecimento e personalize sua experiencia.</p>
          </div>
          <button 
            type="submit" 
            disabled={!isDirty || saving}
            className="inline-flex items-center justify-center gap-2 bg-[#bb001b] text-white font-label-bold px-6 py-3 rounded-full hover:bg-[#930013] transition-colors shadow-lg shadow-[#bb001b]/20 active:scale-95 duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
            ) : success ? (
              <span className="material-symbols-outlined text-[18px]">check</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {saving ? 'Salvando...' : success ? 'Salvo' : 'Salvar Alteracoes'}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>
        )}

        <div className="mb-8 border-b border-[#e8e8e8] overflow-x-auto">
          <nav className="-mb-px flex space-x-8">
            <a className="border-[#bb001b] text-[#bb001b] whitespace-nowrap py-4 px-1 border-b-2 font-label-bold flex items-center gap-2" href="#" aria-current="page">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              Dados do Restaurante
            </a>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-[#e8e8e8] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bb001b] to-[#c0001c] opacity-80"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#eeeeee] flex items-center justify-center text-[#5f5e5e]">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </div>
                <h2 className="font-h3 text-[#1a1c1c]">Informacoes Gerais</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="block font-label-bold text-[#5d3f3d]">Nome do Estabelecimento <span className="text-[#ba1a1a]">*</span></label>
                  <input 
                    className="w-full bg-[#f9f9f9] border border-[#e8e8e8] rounded-lg px-4 py-3 font-body-md text-[#1a1c1c] transition-all shadow-sm" 
                    type="text" 
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="SaaS Gourmet Premium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-[#5d3f3d]">CNPJ</label>
                  <input 
                    className="w-full bg-[#f9f9f9] border border-[#e8e8e8] rounded-lg px-4 py-3 font-body-md text-[#1a1c1c] transition-all shadow-sm" 
                    placeholder="00.000.000/0001-00" 
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-label-bold text-[#5d3f3d]">Telefone de Contato</label>
                  <input 
                    className="w-full bg-[#f9f9f9] border border-[#e8e8e8] rounded-lg px-4 py-3 font-body-md text-[#1a1c1c] transition-all shadow-sm" 
                    placeholder="(11) 99999-9999" 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-[#e8e8e8] relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#eeeeee] flex items-center justify-center text-[#5f5e5e]">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <h2 className="font-h3 text-[#1a1c1c]">Endereco de Operacao</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="block font-label-bold text-[#5d3f3d]">Endereco completo</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-[#f9f9f9] border border-[#e8e8e8] rounded-lg pl-10 pr-4 py-3 font-body-md text-[#1a1c1c] transition-all shadow-sm" 
                      placeholder="Rua Exemplo, 123 - Centro" 
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-[#5f5e5e]">map</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-[#e8e8e8] flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#eeeeee] flex items-center justify-center text-[#5f5e5e]">
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </div>
                <h2 className="font-h3 text-[#1a1c1c]">Identidade Visual</h2>
              </div>
              <p className="font-body-sm text-[#5f5e5e] mb-4">Faca upload da logo do seu restaurante para exibi-la nos recibos, cardapio digital e area do cliente.</p>
              
              <div className="mt-2 flex-1 flex flex-col justify-center rounded-xl border-2 border-dashed border-[#e7bcb9] px-6 py-6 hover:border-[#bb001b]/50 hover:bg-[#ffdad7]/20 transition-all cursor-pointer group relative overflow-hidden">
                {formData.logoUrl ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <img src={formData.logoUrl} alt="Logo preview" className="max-h-24 object-contain" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="text-sm font-label-bold text-[#ba1a1a] hover:text-[#93000a]"
                    >
                      Remover imagem
                    </button>
                  </div>
                ) : (
                  <div className="text-center relative z-10">
                    {uploadingLogo ? (
                      <div className="animate-spin mb-3">
                        <span className="material-symbols-outlined text-[48px] text-[#bb001b]">sync</span>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-[48px] text-[#c8c6c6] group-hover:text-[#bb001b] transition-colors mb-3 block">cloud_upload</span>
                    )}
                    <div className="mt-2 flex flex-col items-center text-sm leading-6 text-[#5d3f3d]">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-label-bold text-[#bb001b] hover:text-[#930013]">
                        <span>Fazer upload de arquivo</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          className="sr-only" 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Validação de tamanho inicial (20MB para permitir processamento)
                            if (file.size > 20 * 1024 * 1024) {
                              setErrorMessage('O arquivo original é muito grande. Tente uma imagem com menos de 20MB.');
                              return;
                            }

                            try {
                              setUploadingLogo(true);
                              setErrorMessage(null);
                              
                              // Comprime a imagem antes de enviar (redimensiona para max 1200px)
                              const compressedBlob = await compressImage(file);
                              const processedFile = new File([compressedBlob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                              });

                              const url = await uploadImage(processedFile, 'products');
                              setFormData({ ...formData, logoUrl: url });
                            } catch (error: any) {
                              console.error('Erro ao fazer upload da logo:', error);
                              setErrorMessage(error.message || 'Falha ao fazer upload da imagem. Verifique sua conexão e tente novamente.');
                            } finally {
                              setUploadingLogo(false);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="font-body-sm text-[#5f5e5e] mt-1">PNG, JPG, SVG (Otimização automática)</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[#eeeeee]">
                <h3 className="font-label-bold text-[#1a1c1c] mb-2">Tema Principal</h3>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={formData.customThemeHex || '#bb001b'}
                    onChange={(e) => setFormData({ ...formData, themeColor: 'custom', customThemeHex: e.target.value })}
                    className="h-10 w-16 cursor-pointer border-0 bg-transparent rounded-lg"
                  />
                  <span className="text-sm font-label-bold text-[#5d3f3d]">
                    Cor personalizada: {formData.customThemeHex || '#bb001b'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-xl border border-[#ffdad6] bg-[#ffdad6]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-h3 text-[#ba1a1a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              Zona de Perigo
            </h3>
            <p className="font-body-sm text-[#5d3f3d] mt-1">Acoes destrutivas relativas a sua conta e dados do restaurante.</p>
          </div>
          <button type="button" className="px-5 py-2.5 bg-transparent border border-[#ba1a1a] text-[#ba1a1a] rounded-lg font-label-bold hover:bg-[#ba1a1a] hover:text-[#ffffff] transition-colors whitespace-nowrap">
            Desativar Conta
          </button>
        </div>
      </form>
    </div>
  );
}
