
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronDown, 
  Archive, 
  Trash2, 
  Edit2, 
  LayoutGrid, 
  List,
  ChevronUp,
  GripVertical
} from 'lucide-react';
import { 
  Card, 
  Button, 
  IconButton, 
  StatusBadge, 
  EmptyState,
  SectionHeader,
  cx
} from '../components/ui/AppPrimitives';
import { 
  fetchMenuItems, 
  fetchCategories, 
  MenuItemData, 
  CategoryData,
  archiveMenuItem,
  deleteMenuItem,
  hasMenuItemHistory,
  deleteCategory,
  updateCategory
} from '../lib/database';
import { ProductModal } from '../components/Menu/ProductModal';
import { CategoryModal } from '../components/Menu/CategoryModal';
import { AlertDialog } from '../components/ui/AlertDialog';
import { Alert } from '../components/ui/Alert';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';

type MenuTab = 'products' | 'categories';

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState<MenuTab>('products');
  const [products, setProducts] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItemData | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  
  // Confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete';
    item: MenuItemData | null;
    hasHistory?: boolean;
  }>({
    isOpen: false,
    type: 'archive',
    item: null
  });

  const [confirmCategoryModal, setConfirmCategoryModal] = useState<{
    isOpen: boolean;
    category: CategoryData | null;
  }>({
    isOpen: false,
    category: null
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant: 'success' | 'warning' | 'destructive';
  }>({
    show: false,
    title: '',
    description: '',
    variant: 'success'
  });

  const showNotification = (title: string, description: string, variant: 'success' | 'warning' | 'destructive' = 'success') => {
    setNotification({ show: true, title, description, variant });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        fetchMenuItems(),
        fetchCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (error) {
      console.error('Erro ao carregar dados do cardápio:', error);
      showNotification('Erro ao carregar', 'Não foi possível carregar os dados do cardápio. Verifique sua conexão.', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory && !p.is_archived;
  });

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
      <SectionHeader
        title="Gerenciamento de Cardápio"
        description="Organize seus produtos, categorias e opcionais."
        actions={
          <Button 
            icon={Plus} 
            onClick={() => {
              if (activeTab === 'products') {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              } else {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }
            }}
          >
            Novo {activeTab === 'products' ? 'Produto' : 'Categoria'}
          </Button>
        }
      />

      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-8 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 px-4 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <Alert 
                variant={notification.variant} 
                title={notification.title} 
                description={notification.description}
                className="shadow-2xl border-white/20 backdrop-blur-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/50 sm:self-start">
          <button
            onClick={() => setActiveTab('products')}
            className={cx(
              "flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-all",
              activeTab === 'products' 
                ? "bg-white text-primary-700 shadow-soft dark:bg-slate-800 dark:text-primary-200" 
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={cx(
              "flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-all",
              activeTab === 'categories' 
                ? "bg-white text-primary-700 shadow-soft dark:bg-slate-800 dark:text-primary-200" 
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <List className="h-4 w-4" />
            Categorias
          </button>
        </div>

        {activeTab === 'products' ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <Card className="overflow-hidden border-none p-0 shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Produto</th>
                        <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Categoria</th>
                        <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Preço</th>
                        <th className="px-6 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                        <th className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                                  <Utensils className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{product.name}</p>
                                <p className="max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">{product.description || 'Sem descrição'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {categories.find(c => c.id === product.category_id)?.name || product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge tone={product.available ? 'success' : 'warning'} dot>
                              {product.available ? 'Ativo' : 'Indisponível'}
                            </StatusBadge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <IconButton 
                                icon={Edit2} 
                                label="Editar" 
                                className="bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsProductModalOpen(true);
                                }} 
                              />
                              <IconButton 
                                icon={Archive} 
                                label="Arquivar" 
                                tone="warning" 
                                className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'archive',
                                    item: product
                                  });
                                }} 
                              />
                              <IconButton 
                                icon={Trash2} 
                                label="Excluir" 
                                tone="danger" 
                                className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                                onClick={async () => {
                                  const hasHistory = await hasMenuItemHistory(product.id);
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'delete',
                                    item: product,
                                    hasHistory
                                  });
                                }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={Utensils}
                title="Nenhum produto encontrado"
                description="Tente ajustar sua busca ou filtros."
                action={<Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Limpar Filtros</Button>}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categories Management */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <Card key={category.id} className="relative flex items-center justify-between p-4 shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{category.name}</p>
                        <p className="text-[10px] text-slate-500">Ordem: {category.sort_order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton icon={ChevronUp} label="Subir" disabled={index === 0} onClick={async () => {
                        // Simple reorder logic for fallback
                        const other = categories[index - 1];
                        await Promise.all([
                          updateCategory(category.id, { sort_order: other.sort_order }),
                          updateCategory(other.id, { sort_order: category.sort_order })
                        ]);
                        loadData();
                      }} />
                      <IconButton icon={ChevronDown} label="Descer" disabled={index === categories.length - 1} onClick={async () => {
                        const other = categories[index + 1];
                        await Promise.all([
                          updateCategory(category.id, { sort_order: other.sort_order }),
                          updateCategory(other.id, { sort_order: category.sort_order })
                        ]);
                        loadData();
                      }} />
                      <IconButton icon={Edit2} label="Editar" onClick={() => {
                        setEditingCategory(category);
                        setIsCategoryModalOpen(true);
                      }} />
                      <IconButton icon={Trash2} label="Excluir" tone="danger" onClick={() => {
                        setConfirmCategoryModal({
                          isOpen: true,
                          category: category
                        });
                      }} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={List}
                title="Nenhuma categoria criada"
                description="Crie categorias para organizar seu cardápio."
                action={<Button icon={Plus} onClick={() => {}}>Adicionar Categoria</Button>}
              />
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <AlertDialog
        isOpen={confirmModal.isOpen && confirmModal.type === 'archive'}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={async () => {
          if (confirmModal.item) {
            await archiveMenuItem(confirmModal.item.id);
            showNotification('Produto Arquivado', `O produto "${confirmModal.item.name}" foi movido para o arquivo com sucesso.`);
            loadData();
          }
        }}
        title="Arquivar Produto?"
        description={`O produto "${confirmModal.item?.name}" não será mais exibido no cardápio digital, mas você poderá restaurá-lo depois.`}
        confirmLabel="Arquivar"
        variant="warning"
      />

      <AlertDialog
        isOpen={confirmModal.isOpen && confirmModal.type === 'delete'}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={async () => {
          if (confirmModal.item) {
            if (confirmModal.hasHistory) {
              await archiveMenuItem(confirmModal.item.id);
              showNotification('Produto Arquivado', 'Este produto possui vendas registradas e foi arquivado para preservar o histórico.', 'warning');
            } else {
              await deleteMenuItem(confirmModal.item.id);
              showNotification('Produto Excluído', `"${confirmModal.item.name}" foi removido permanentemente.`, 'success');
            }
            loadData();
          }
        }}
        title={confirmModal.hasHistory ? "Arquivar Produto" : "Excluir Produto"}
        description={
          confirmModal.hasHistory 
            ? `Este produto já foi vendido e não pode ser excluído permanentemente. Ele será arquivado para manter seu histórico financeiro.`
            : `Tem certeza que deseja excluir "${confirmModal.item?.name}"? Esta ação não pode ser desfeita.`
        }
        confirmLabel={confirmModal.hasHistory ? "Entendi e Arquivar" : "Excluir"}
        variant="danger"
      />

      <AlertDialog
        isOpen={confirmCategoryModal.isOpen}
        onClose={() => setConfirmCategoryModal({ ...confirmCategoryModal, isOpen: false })}
        onConfirm={async () => {
          if (confirmCategoryModal.category) {
            await deleteCategory(confirmCategoryModal.category.id);
            showNotification('Categoria Excluída', `A categoria "${confirmCategoryModal.category.name}" foi removida.`);
            loadData();
          }
        }}
        title="Excluir Categoria?"
        description={`Tem certeza que deseja excluir a categoria "${confirmCategoryModal.category?.name}"? Os produtos vinculados ficarão sem categoria.`}
        confirmLabel="Excluir"
        variant="danger"
      />

      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        product={editingProduct} 
        categories={categories} 
        onSuccess={() => {
          loadData();
          showNotification('Sucesso', 'O produto foi salvo com sucesso no cardápio.', 'success');
        }} 
      />

      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        category={editingCategory} 
        onSuccess={() => {
          loadData();
          showNotification('Sucesso', 'A categoria foi salva com sucesso.', 'success');
        }} 
      />
    </main>
  );
}

// Icon helper for Utensils if not globally available
function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
