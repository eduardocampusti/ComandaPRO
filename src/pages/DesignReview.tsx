import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { STITCH_SCREENS, getPublicPath, getScreenshotPath, type StitchScreen } from './stitch/stitchScreens';

type CardMode = 'grid' | 'list';
type FilterType = 'all' | 'desktop' | 'mobile';

function ScreenCard({ screen }: { screen: StitchScreen }) {
  const [hover, setHover] = useState(false);

  const deviceColors: Record<string, string> = {
    desktop: 'bg-blue-950 text-blue-300 border-blue-800',
    mobile: 'bg-green-950 text-green-300 border-green-800',
    both: 'bg-amber-950 text-amber-300 border-amber-800',
  };

  const deviceLabel: Record<string, string> = {
    desktop: '🖥️ Desktop',
    mobile: '📱 Mobile',
    both: '🖥️📱 Ambos',
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 transition-all duration-300 hover:border-red-700 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Preview thumbnail */}
      <div className="relative overflow-hidden bg-gray-950" style={{ aspectRatio: '16/10' }}>
        <img
          src={getScreenshotPath(screen)}
          alt={screen.label}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-200 ${hover ? 'opacity-100' : 'opacity-0'}`}
        >
          <Link
            to={`/design/${screen.id}`}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg"
          >
            Abrir Tela
          </Link>
          <Link
            to={`/design/${screen.id}?mode=split`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Comparar
          </Link>
        </div>
      </div>

      {/* Card info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{screen.label}</h3>
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{screen.description}</p>
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${deviceColors[screen.deviceType]}`}
          >
            {deviceLabel[screen.deviceType]}
          </span>
        </div>

        {/* Action links */}
        <div className="flex gap-2 mt-3">
          <Link
            to={`/design/${screen.id}`}
            className="flex-1 text-center py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-xs font-medium transition-colors"
          >
            Ver Design
          </Link>
          <a
            href={getPublicPath(screen)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
            title="Abrir HTML original"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function DesignReview() {
  const [cardMode, setCardMode] = useState<CardMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = STITCH_SCREENS.filter((s) => {
    const matchesFilter =
      filter === 'all' ||
      s.deviceType === filter ||
      s.deviceType === 'both';
    const matchesSearch =
      search === '' ||
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      className="min-h-screen bg-gray-950 text-white"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5h16v2H4zm0 4h16v2H4zm0 4h10v2H4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none italic tracking-tighter">COMANDA PRO</h1>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest">Design Review</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-800" />

          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar tela..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 shrink-0">
            {(['all', 'desktop', 'mobile'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  filter === f ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>

          {/* Grid/List toggle */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setCardMode('grid')}
              className={`p-1.5 rounded transition-colors ${cardMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setCardMode('list')}
              className={`p-1.5 rounded transition-colors ${cardMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-gray-900/50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-gray-400 text-xs">
              <strong className="text-white">{filtered.length}</strong> de{' '}
              <strong className="text-white">{STITCH_SCREENS.length}</strong> telas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-gray-400 text-xs">
              <strong className="text-white">{STITCH_SCREENS.filter((s) => s.deviceType !== 'mobile').length}</strong> desktop
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400 text-xs">
              <strong className="text-white">{STITCH_SCREENS.filter((s) => s.deviceType !== 'desktop').length}</strong> mobile
            </span>
          </div>
          <div className="ml-auto">
            <span className="text-gray-600 text-xs">
              Fonte:{' '}
              <code className="text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                design-stitch/*/code.html
              </code>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-lg font-medium">Nenhuma tela encontrada</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-3 text-red-500 text-sm hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : cardMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((screen) => (
              <ScreenCard key={screen.id} screen={screen} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((screen, index) => (
              <div
                key={screen.id}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors group"
              >
                {/* Number */}
                <span className="shrink-0 w-8 text-center text-gray-600 text-sm font-mono">{String(index + 1).padStart(2, '0')}</span>

                {/* Thumbnail */}
                <div className="shrink-0 w-16 h-10 rounded overflow-hidden bg-gray-800 border border-gray-700">
                  <img
                    src={getScreenshotPath(screen)}
                    alt={screen.label}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">{screen.label}</h3>
                  <p className="text-gray-500 text-xs truncate">{screen.description}</p>
                </div>

                {/* Route */}
                <code className="shrink-0 text-[10px] text-gray-600 bg-gray-800 px-2 py-1 rounded hidden md:block">
                  /design/{screen.id}
                </code>

                {/* Device */}
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border bg-gray-800 text-gray-400 border-gray-700">
                  {screen.deviceType}
                </span>

                {/* Actions */}
                <div className="shrink-0 flex gap-2">
                  <Link
                    to={`/design/${screen.id}`}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-colors"
                  >
                    Abrir
                  </Link>
                  <Link
                    to={`/design/${screen.id}`}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium transition-colors hidden sm:block"
                  >
                    Comparar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-gray-700 text-xs">
          COMANDA PRO — Design Review •{' '}
          <span className="text-gray-600">{STITCH_SCREENS.length} telas importadas do Google Stitch</span>
        </p>
      </footer>
    </div>
  );
}
