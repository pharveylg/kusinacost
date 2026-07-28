import { useApp, usePersistedActions } from './store';
import { useAuth } from './lib/auth';
import { isFirebaseConfigured } from './lib/firebase';
import Dashboard from './components/Dashboard';
import IngredientsList from './components/IngredientsList';
import IngredientForm from './components/IngredientForm';
import RecipesList from './components/RecipesList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import SalesList from './components/SalesList';
import SaleForm from './components/SaleForm';
import OverheadSettingsView from './components/OverheadSettings';
import PizzaMasterclass from './components/PizzaMasterclass';
import MexicanMasterclass from './components/MexicanMasterclass';
import ChefEjMasterclass from './components/ChefEjMasterclass';
import AuthScreen from './components/AuthScreen';

function AppContent() {
  const { state, dispatch } = useApp();
  const { user, loading, signOut } = useAuth();
  const { view } = state;

  // Show auth screen if Firebase is configured but user not signed in
  const showAuth = isFirebaseConfigured && !user;

  // Diagnostic banner — helps confirm whether Firebase env vars actually
  // made it into this build. If this shows up, the app is running in
  // local-only mode and login will never appear.
  const firebaseWarningBanner = !isFirebaseConfigured && (
    <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-xs sm:text-sm font-semibold text-center py-2 px-3">
      ⚠️ Firebase is not configured in this deployment — running in local-only mode (no login). Add
      VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID in Vercel → Settings → Environment
      Variables, then redeploy.
    </div>
  );

  if (showAuth) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      );
    }
    return <AuthScreen />;
  }

  const activeTab =
    view === 'dashboard'
      ? 'home'
      : view === 'ingredients' || view === 'add-ingredient' || view === 'edit-ingredient'
      ? 'ingredients'
      : view === 'sales' || view === 'add-sale' || view === 'edit-sale'
      ? 'sales'
      : view === 'settings'
      ? 'settings'
      : 'recipes';

  const showBottomNav = ![
    'add-ingredient', 'edit-ingredient',
    'add-recipe', 'edit-recipe',
    'recipe-detail',
    'add-sale', 'edit-sale',
    'settings',
  ].includes(view);

  const focusedView = [
    'add-ingredient', 'edit-ingredient',
    'add-recipe', 'edit-recipe',
    'add-sale', 'edit-sale',
    'settings',
  ].includes(view);

  const contentWidth = focusedView
    ? 'max-w-4xl'
    : view === 'recipe-detail'
    ? 'max-w-5xl'
    : 'max-w-7xl';

  function renderView() {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'ingredients':
        return <IngredientsList />;
      case 'add-ingredient':
        return <IngredientForm />;
      case 'edit-ingredient':
        return <IngredientForm editId={state.selectedIngredientId} />;
      case 'recipes':
        return <RecipesList />;
      case 'recipe-detail':
        return <RecipeDetail />;
      case 'add-recipe':
        return <RecipeForm />;
      case 'edit-recipe':
        return <RecipeForm editId={state.selectedRecipeId} />;
      case 'sales':
        return <SalesList />;
      case 'add-sale':
        return <SaleForm />;
      case 'edit-sale':
        return <SaleForm editId={state.selectedSaleId} />;
      case 'settings':
        return <OverheadSettingsView />;
      case 'masterclass':
        return <PizzaMasterclass />;
      case 'mexican-masterclass':
        return <MexicanMasterclass />;
      case 'chef-ej-masterclass':
        return <ChefEjMasterclass />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {firebaseWarningBanner}
      <DesktopSidebar activeTab={activeTab} view={view} onNavigate={(nextView) => dispatch({ type: 'SET_VIEW', view: nextView })} />

      <div className={`min-w-0 flex-1 md:ml-64 ${!isFirebaseConfigured ? 'pt-9 sm:pt-8' : ''}`}>
        <div className="bg-slate-50 h-[env(safe-area-inset-top)] md:hidden" />

        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-xl md:flex lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">KusinaCost Workspace</p>
            <p className="text-sm text-slate-500">Food costing, production, and actual sales</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-sale' })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Record Sale
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-recipe' })}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
            >
              + New Recipe
            </button>
            {isFirebaseConfigured && user && (
              <button
                onClick={() => signOut()}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 transition hover:bg-slate-50"
              >
                {user.email?.split('@')[0]} · Sign out
              </button>
            )}
          </div>
        </header>

        <main className={`${contentWidth} mx-auto px-4 pt-4 sm:px-6 md:px-8 md:py-8 lg:px-10 ${showBottomNav ? 'pb-24' : 'pb-8'}`}>
          {renderView()}
        </main>
      </div>

      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
          <div className="max-w-lg mx-auto flex items-stretch">
            <NavTab
              icon={
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
              label="Home"
              active={activeTab === 'home'}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
            />
            <NavTab
              icon={
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              }
              label="Ingredients"
              active={activeTab === 'ingredients'}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'ingredients' })}
            />

            {/* Center Add Button */}
            <div className="flex items-center justify-center px-1.5 -mt-5">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'add-recipe' })}
                className="w-13 h-13 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-200 flex items-center justify-center active:scale-90 transition-transform"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <NavTab
              icon={
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
              label="Sales"
              active={activeTab === 'sales'}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'sales' })}
            />
            <NavTab
              icon={
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              }
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'settings' })}
            />
          </div>
          <div className="bg-white h-[env(safe-area-inset-bottom)]" />
        </nav>
      )}

      {/* User account pill — show in dashboard only when Firebase is configured */}
      {isFirebaseConfigured && user && view === 'dashboard' && (
        <div className="fixed top-2 right-2 z-30 md:hidden">
          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 shadow-sm active:scale-95 transition-transform"
          >
            {user.email?.split('@')[0]} · Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function DesktopSidebar({
  activeTab,
  view,
  onNavigate,
}: {
  activeTab: string;
  view: string;
  onNavigate: (view: 'dashboard' | 'ingredients' | 'recipes' | 'sales' | 'settings' | 'masterclass' | 'mexican-masterclass' | 'chef-ej-masterclass') => void;
}) {
  const navItems = [
    { id: 'home', view: 'dashboard' as const, label: 'Overview', icon: '⌂' },
    { id: 'ingredients', view: 'ingredients' as const, label: 'Ingredients', icon: '◇' },
    { id: 'recipes', view: 'recipes' as const, label: 'Recipes', icon: '▤' },
    { id: 'sales', view: 'sales' as const, label: 'Sales', icon: '₱' },
    { id: 'settings', view: 'settings' as const, label: 'Cost Settings', icon: '⚙' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-slate-950 text-white md:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-2xl font-extrabold tracking-tight">Kusina<span className="text-orange-400">Cost</span></p>
        <p className="mt-1 text-xs text-slate-400">Know every peso in every plate.</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Business</p>
        {navItems.map((item) => {
          const active = activeTab === item.id && view !== 'masterclass' && view !== 'mexican-masterclass';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                active ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/40' : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Masterclasses</p>
        <button
          onClick={() => onNavigate('masterclass')}
          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${view === 'masterclass' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
        >
          Pizza Making
        </button>
        <button
          onClick={() => onNavigate('mexican-masterclass')}
          className={`mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${view === 'mexican-masterclass' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
        >
          Flavors of Mexico
        </button>
        <button
          onClick={() => onNavigate('chef-ej-masterclass')}
          className={`mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${view === 'chef-ej-masterclass' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
        >
          Chef EJ Recipes
        </button>
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => onNavigate('recipes')}
          className="w-full rounded-xl bg-white/8 px-4 py-3 text-left text-xs text-slate-300 transition hover:bg-white/12"
        >
          <span className="block font-bold text-white">Production ready</span>
          Cost, scale, price, and sell.
        </button>
      </div>
    </aside>
  );
}

function NavTab({ icon, label, active, onClick, disabled }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : active
          ? 'text-orange-600'
          : 'text-gray-400 active:text-gray-600'
      }`}
    >
      {icon}
      <span className={`text-[10px] font-semibold ${active ? 'text-orange-600' : disabled ? 'text-gray-300' : 'text-gray-400'}`}>
        {label}
      </span>
    </button>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}

// Re-export for the components that need it
export { usePersistedActions };
