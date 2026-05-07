import React from 'react';
import { PlusCircle } from 'lucide-react';
import { MenuItemData } from '../../lib/database';
import { MenuItemCard } from './MenuItemCard';

interface CategorySectionProps {
  title: string;
  items: MenuItemData[];
  isEditMode: boolean;
  isAdmin: boolean;
  onAddItem: (category: string) => void;
  onEditItem: (item: MenuItemData) => void;
  onAddToCart: (item: MenuItemData) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  items,
  isEditMode,
  isAdmin,
  onAddItem,
  onEditItem,
  onAddToCart,
  onToggleAvailability,
}) => {
  const headingId = React.useId();

  return (
    <section className="mb-8 last:mb-0" aria-labelledby={headingId}>
      <div className="mb-5 flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="truncate font-plus-jakarta-sans text-xl font-extrabold tracking-tight text-on-surface dark:text-white uppercase"
          >
            {title}
          </h2>
          <div className="h-1.5 w-10 bg-primary-600 rounded-full mt-1" />
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={() => onAddItem(title)}
            className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Adicionar
          </button>
        )}
      </div>

      {Array.isArray(items) && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {items.map((item) => (
            item && (
              <MenuItemCard
                key={item.id}
                item={item}
                isEditMode={isEditMode}
                isAdmin={isAdmin}
                onAdd={onAddToCart}
                onEdit={onEditItem}
                onToggleAvailability={onToggleAvailability}
              />
            )
          ))}
        </div>
      ) : (
        !isEditMode && (
          <div className="app-state py-10 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/30">
            <p className="text-sm font-medium text-on-surface-variant">Nenhum item disponível nesta categoria.</p>
          </div>
        )
      )}
    </section>
  );
};
