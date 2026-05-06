import React from 'react';
import { Edit2, LayoutGrid, Search } from 'lucide-react';
import { cx } from '../ui/AppPrimitives';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isAdmin: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  showUnavailable: boolean;
  onToggleUnavailable: (value: boolean) => void;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  isAdmin,
  isEditMode,
  onToggleEditMode,
  showUnavailable,
  onToggleUnavailable,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  const handleCategoryChange = onCategoryChange ?? (() => undefined);
  const canFilterCategories = categories.length > 0 && Boolean(onCategoryChange);

  return (
    <section className="mb-2 space-y-4 px-4 py-2">
      <div className="relative flex items-center w-full h-12 rounded-full bg-[#eeeeee] dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-[#bb001b]/20 transition-all">
        <span className="material-symbols-outlined absolute left-4 text-[#5d3f3d]">search</span>
        <input
          id="menu-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="O que você deseja comer hoje?"
          className="w-full h-full bg-transparent border-none pl-12 pr-4 font-['Inter'] text-[16px] text-[#1a1c1c] placeholder:text-[#5d3f3d] focus:ring-0 rounded-full"
        />
      </div>

      {canFilterCategories && (
        <div className="-mx-4 flex overflow-x-auto gap-1 px-4 py-2 hide-scrollbar items-center">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={cx(
                'flex-shrink-0 rounded-full px-5 py-2.5 font-["Inter"] text-[14px] font-semibold transition-all active:scale-95',
              selectedCategory === 'all'
                ? 'bg-[#bb001b] text-white shadow-sm'
                : 'bg-[#eeeeee] text-[#1a1c1c] hover:bg-[#e8e8e8] dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            Todos
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={cx(
                  'flex-shrink-0 rounded-full px-5 py-2.5 font-["Inter"] text-[14px] font-semibold transition-all active:scale-95',
                selectedCategory === category
                  ? 'bg-[#bb001b] text-white shadow-sm'
                  : 'bg-[#eeeeee] text-[#1a1c1c] hover:bg-[#e8e8e8] dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-soft transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(event) => onToggleUnavailable(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#bb001b] focus:ring-[#bb001b]"
            />
            Ver indisponíveis
          </label>

          <button
            type="button"
            onClick={onToggleEditMode}
            className={cx(
              'inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb001b] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
              isEditMode
                ? 'border-[#ffb3ad] bg-[#ffdad7] text-[#930013] dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            )}
          >
            {isEditMode ? (
              <>
                <LayoutGrid className="h-4 w-4" />
                Finalizar edição
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Editar cardápio
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};
