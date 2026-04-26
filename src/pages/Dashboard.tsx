import { LayoutGrid, Utensils, ClipboardList, ChefHat, Wallet, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const modules = [
    { icon: <LayoutGrid className="w-6 h-6" />, name: 'Mesas', status: 'Gerenciar QR Codes', color: 'bg-blue-500', path: '/tables' },
    { icon: <ChefHat className="w-6 h-6" />, name: 'Cozinha', status: 'Gestão de preparo', color: 'bg-purple-500', path: '/orders' },
    { icon: <Wallet className="w-6 h-6" />, name: 'Caixa', status: 'Contas e pagamentos', color: 'bg-indigo-500', path: '/cashier' },
    { icon: <BarChart3 className="w-6 h-6" />, name: 'Relatórios', status: 'Ver desempenho', color: 'bg-slate-700', path: '/reports' },
  ];

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Bem-vindo, {user?.displayName?.split(' ')[0] || 'Usuário'}</h2>
        <p className="text-slate-500 dark:text-slate-400">O sistema está operando normalmente. Veja o resumo dos módulos abaixo.</p>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link 
            key={index}
            to={module.path}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group block"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${module.color} p-3 rounded-xl text-white shadow-lg shadow-opacity-20`}>
                {module.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                Acessar Módulo
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1 dark:text-white">{module.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{module.status}</p>
          </Link>
        ))}
      </div>

      {/* Architecture Notice */}
      <div className="mt-12 p-6 bg-primary-50 dark:bg-primary-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl transition-colors">
        <h4 className="text-emerald-900 dark:text-primary-400 font-bold mb-2 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Status da Arquitetura
        </h4>
        <p className="text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed">
          A documentação técnica foi gerada com sucesso em <code className="bg-emerald-100 dark:bg-emerald-800/50 px-1 rounded">ARCHITECTURE.md</code>. 
          O sistema está pronto para a implementação do backend e integração com Firebase conforme planejado.
        </p>
      </div>
    </main>
  );
}
