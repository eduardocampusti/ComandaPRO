import React, { useState, useEffect } from 'react';
import { Save, Check, Image as ImageIcon, Store } from 'lucide-react';
import { useSettings, palettes, generatePalette } from '../contexts/SettingsContext';

export default function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const currentPalette = formData.themeColor === 'custom' 
    ? generatePalette(formData.customThemeHex || '#10b981')
    : palettes[formData.themeColor] || palettes.emerald;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Configurações do Sistema</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Personalize a aparência e os dados do seu estabelecimento.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Seção: Aparência */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <Store className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Aparência da Marca</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cor Principal do Sistema
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.keys(palettes).map((colorKey) => (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setFormData({ ...formData, themeColor: colorKey })}
                      className={`relative w-12 h-12 rounded-xl transition-all ${
                        formData.themeColor === colorKey 
                          ? 'ring-2 ring-slate-800 dark:ring-white scale-110 shadow-md' 
                          : 'hover:scale-105 border border-slate-200 dark:border-slate-700'
                      }`}
                      style={{ backgroundColor: palettes[colorKey][500] }}
                      title={colorKey.toUpperCase()}
                    >
                      {formData.themeColor === colorKey && (
                        <Check className="absolute inset-0 m-auto w-6 h-6 text-white" />
                      )}
                    </button>
                  ))}
                  <div className="relative" title="Cor Customizada">
                    <input
                      type="color"
                      value={formData.customThemeHex || '#10b981'}
                      onChange={(e) => setFormData({ ...formData, themeColor: 'custom', customThemeHex: e.target.value })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <div 
                      className={`w-12 h-12 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center relative shadow-inner ${
                      formData.themeColor === 'custom' 
                        ? 'ring-2 ring-slate-800 dark:ring-white scale-110 shadow-md' 
                        : 'hover:scale-105'
                      }`}
                      style={{ 
                        background: formData.themeColor === 'custom' && formData.customThemeHex 
                          ? formData.customThemeHex 
                          : 'conic-gradient(from 90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1, #d946ef, #ef4444)'
                      }}
                    >
                      {formData.themeColor === 'custom' && (
                         <Check className="w-6 h-6 text-white drop-shadow-md" />
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Esta cor será usada em botões e elementos de destaque no sistema e no cardápio online.
                </p>

                {/* Preview de Harmonia Visual */}
                <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Harmonia Visual (Tons Automáticos)
                  </div>
                  <div className="p-5 space-y-5">
                    {/* Shades bar */}
                    <div className="flex w-full h-6 rounded-lg overflow-hidden shadow-sm">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                        <div key={shade} className="flex-1" style={{ backgroundColor: currentPalette[shade] }} title={`Tonalidade ${shade}`}></div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Secondary Action Preview */}
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm border border-transparent transition-all hover:opacity-90"
                        style={{ backgroundColor: currentPalette[100], color: currentPalette[800], borderColor: currentPalette[200] }}
                      >
                        Ação Secundária
                      </button>

                      {/* Accent Alert Preview */}
                      <div 
                        className="px-3 py-1.5 text-xs font-bold rounded-full"
                        style={{ backgroundColor: currentPalette[50], color: currentPalette[700], border: `1px solid ${currentPalette[200]}` }}
                      >
                        Aviso ou Badge
                      </div>

                      {/* Navigation Link Preview */}
                      <span 
                        className="text-sm font-medium hover:underline cursor-pointer ml-auto sm:ml-0"
                        style={{ color: currentPalette[600] }}
                      >
                        Link de navegação
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Logomarca (URL ou Upload)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full space-y-3">
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://exemplo.com/logo.png"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Ou</span>
                      <label className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                        <span>Fazer Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1024 * 1024) { // 1MB limit for firestore document safety
                                alert("A imagem deve ter no máximo 1MB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData({ ...formData, logoUrl: event.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logoUrl: '' })}
                          className="text-sm text-red-500 hover:text-red-700 ml-auto"
                        >
                          Remover logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pré-visualização da Logomarca
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Header Preview */}
                    <div className="space-y-2">
                       <span className="text-xs text-slate-500">No Cabeçalho</span>
                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center shadow-sm">
                         {formData.logoUrl ? (
                           <img 
                             src={formData.logoUrl} 
                             alt="Logo" 
                             className="h-8 w-auto object-contain"
                             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                           />
                         ) : (
                           <Store className="w-8 h-8 text-primary-500" />
                         )}
                         <span className="ml-2 font-bold text-slate-800 dark:text-white text-sm">
                           {formData.businessName || 'Meu Sistema'}
                         </span>
                       </div>
                    </div>
                    {/* Login Preview */}
                    <div className="space-y-2">
                       <span className="text-xs text-slate-500">Na Tela de Login</span>
                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center shadow-sm max-w-[200px] mx-auto sm:mx-0">
                         {formData.logoUrl ? (
                           <img 
                             src={formData.logoUrl} 
                             alt="Logo" 
                             className="h-16 w-auto object-contain mb-3"
                             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                           />
                         ) : (
                           <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-3">
                             <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                           </div>
                         )}
                         <span className="font-bold text-slate-800 dark:text-white text-center">
                           {formData.businessName || 'Meu Sistema'}
                         </span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Dados da Empresa */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <Store className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Dados do Estabelecimento</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nome do Comércio
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome Fantasia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  EndereçoCompleto
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Rua Exemplo, 123 - Centro"
                />
              </div>
            </div>
            
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-primary-700 disabled:bg-emerald-400 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : success ? (
                <Check className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Salvando...' : success ? 'Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
