import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScreenById, getPublicPath, getScreenshotPath, STITCH_SCREENS } from './stitchScreens';

type ViewMode = 'design' | 'screenshot' | 'split';

export default function StitchViewer() {
  const { screenId } = useParams<{ screenId: string }>();
  const [mode, setMode] = useState<ViewMode>('design');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const screen = getScreenById(screenId ?? '');
  const [lastScreenId, setLastScreenId] = useState(screenId);

  if (screenId !== lastScreenId) {
    setLastScreenId(screenId);
    setIframeLoaded(false);
  }

  useEffect(() => {
    if (screen?.component) {
      setIframeLoaded(true);
    }
  }, [screen]);

  if (!screen) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white font-sans">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold">Tela não encontrada</h1>
        <p className="text-gray-400">ID: <code className="bg-gray-800 px-2 py-1 rounded">{screenId}</code></p>
        <Link
          to="/design-review"
          className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          ← Voltar ao Design Review
        </Link>
      </div>
    );
  }

  const currentIndex = STITCH_SCREENS.findIndex((s) => s.id === screen.id);
  const prevScreen = currentIndex > 0 ? STITCH_SCREENS[currentIndex - 1] : null;
  const nextScreen = currentIndex < STITCH_SCREENS.length - 1 ? STITCH_SCREENS[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toolbar */}
      <div className="shrink-0 bg-gray-900 border-b border-gray-800 flex items-center gap-3 px-4 py-2 z-50">
        {/* Logo / Back */}
        <Link
          to="/design-review"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Design Review</span>
        </Link>

        <div className="w-px h-5 bg-gray-700" />

        {/* Screen info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{screen.label}</p>
          <p className="text-gray-500 text-xs truncate hidden sm:block">{screen.description}</p>
        </div>

        {/* Device badge */}
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
          {screen.deviceType === 'mobile' ? '📱 Mobile' : screen.deviceType === 'both' ? '🖥️📱 Ambos' : '🖥️ Desktop'}
        </span>

        {/* View mode toggle */}
        <div className="shrink-0 flex bg-gray-800 rounded-lg p-1 gap-1 border border-gray-700">
          {(
            [
              { value: 'design', label: 'Implementação' },
              { value: 'screenshot', label: 'Referência' },
              { value: 'split', label: 'Comparar' },
            ] as { value: ViewMode; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                mode === value
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* External link */}
        <a
          href={getPublicPath(screen)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-800"
          title="Abrir em nova aba"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Design frame */}
        {(mode === 'design' || mode === 'split') && (
          <div className={`relative flex flex-col ${mode === 'split' ? 'w-1/2 border-r border-gray-800' : 'w-full'}`}>
            {mode === 'split' && (
              <div className="shrink-0 bg-gray-900/80 text-xs text-gray-400 font-semibold text-center py-1.5 border-b border-gray-800 tracking-wider uppercase">
                Implementação (iframe)
              </div>
            )}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Carregando design...</span>
                </div>
              </div>
            )}
            <div className="flex-1 w-full overflow-auto bg-white">
              {screen.component ? (
                <screen.component />
              ) : (
                <iframe
                  key={screen.id}
                  src={getPublicPath(screen)}
                  className="w-full h-full border-0"
                  title={screen.label}
                  onLoad={() => setIframeLoaded(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* Screenshot frame */}
        {(mode === 'screenshot' || mode === 'split') && (
          <div className={`relative flex flex-col bg-gray-900 ${mode === 'split' ? 'w-1/2' : 'w-full'}`}>
            {mode === 'split' && (
              <div className="shrink-0 bg-gray-900/80 text-xs text-gray-400 font-semibold text-center py-1.5 border-b border-gray-800 tracking-wider uppercase">
                Referência (screen.png)
              </div>
            )}
            <div className="flex-1 overflow-auto flex items-start justify-center p-4">
              <img
                src={getScreenshotPath(screen)}
                alt={`Referência visual: ${screen.label}`}
                className="max-w-full shadow-2xl rounded"
                style={{ maxHeight: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 py-2">
        <div>
          {prevScreen ? (
            <Link
              to={`/design/${prevScreen.id}`}
              onClick={() => setIframeLoaded(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {prevScreen.label}
            </Link>
          ) : (
            <span />
          )}
        </div>

        <span className="text-gray-600 text-xs font-mono">
          {currentIndex + 1} / {STITCH_SCREENS.length}
        </span>

        <div>
          {nextScreen ? (
            <Link
              to={`/design/${nextScreen.id}`}
              onClick={() => setIframeLoaded(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              {nextScreen.label}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
