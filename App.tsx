import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ShoppingCart, Plus, Trash2, Languages, LogOut, BarChart3, Package, History, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

// --- Types ---
interface User {
  name: string;
  mobile: string;
  email: string; // Added email
  isLoggedIn: boolean;
  password?: string;
}

interface Item {
  id: any; // Changed to accept Supabase ID
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface Transaction {
  id: any;
  type: 'SALE' | 'PURCHASE';
  amount: number;
  items_data?: any;
  date: string;
}

// --- Translations ---
const translations = {
  en: {
    appName: 'Viyaabhaaram',
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    billing: 'Billing',
    history: 'History',
    addItem: 'Add Item',
    itemName: 'Item Name',
    price: 'Price',
    stock: 'Stock',
    category: 'Category',
    add: 'Add',
    totalValue: 'Total Value',
    lowStock: 'Low Stock',
    recentTrans: 'Recent Transactions',
    newBill: 'New Bill',
    checkout: 'Checkout',
    login: 'Login',
    signUp: 'Sign Up',
    logout: 'Logout',
    syncNotice: 'Online Cloud Storage Enabled',
    accountNotFound: 'Account Not Found',
  },
  ta: {
    appName: 'வியாபாரம்',
    dashboard: 'முகப்பு',
    inventory: 'சரக்கு',
    billing: 'பில்லிங்',
    history: 'வரலாறு',
    addItem: 'பொருள் சேர்',
    itemName: 'பொருள் பெயர்',
    price: 'விலை',
    stock: 'இருப்பு',
    category: 'வகை',
    add: 'சேர்',
    totalValue: 'மொத்த மதிப்பு',
    lowStock: 'குறைந்த இருப்பு',
    recentTrans: 'சமீபத்திய பரிவர்த்தனைகள்',
    newBill: 'புதிய பில்',
    checkout: 'பில் போடு',
    login: 'உள்நுழை',
    signUp: 'பதிவு செய்',
    logout: 'வெளியேறு',
    syncNotice: 'உங்கள் கணக்கு ஆன்லைனில் சேமிக்கப்படும்',
    accountNotFound: 'கணக்கு இல்லை',
  }
};

// --- Auth Component (Updated for Supabase) ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void; language: 'ta' | 'en'; t: any }> = ({ onLogin, language, t }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${mobile}`).single();
      if (existing) { alert('User already exists'); setLoading(false); return; }

      const { error } = await supabase.from('users').insert([{ email, mobile, password, business_name: name }]);
      if (error) throw error;
      
      alert('Account Created!');
      onLogin({ email, name, mobile, isLoggedIn: true, password });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${email}`).eq('password', password).single();
      if (data) {
        onLogin({ email: data.email, name: data.business_name, mobile: data.mobile, isLoggedIn: true, password: data.password });
      } else {
        alert('Invalid Credentials');
      }
    } catch (err) { alert('Login Error'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-4xl font-black mb-4">{t.appName}</h1>
      <div className="bg-white text-gray-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-center">{mode === 'LOGIN' ? t.login : t.signUp}</h2>
        <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'REGISTER' && (
            <>
              <input type="text" placeholder="Business Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
              <input type="text" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
            </>
          )}
          <input type="text" placeholder="Email / Mobile" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
          <button disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-lg">
            {loading ? '...' : (mode === 'LOGIN' ? t.login : t.signUp)}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="w-full mt-4 text-sm text-indigo-600 font-bold">
          {mode === 'LOGIN' ? 'Create New Account' : 'Back to Login'}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'ta' | 'en'>('ta');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  
  // Billing State
  const [cart, setCart] = useState<{item: Item, qty: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[language];

  // 1. Load Data from Supabase on Login
  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const { data: itemsData } = await supabase.from('items').select('*').eq('user_email', user.email);
        if (itemsData) setItems(itemsData);

        const { data: transData } = await supabase.from('transactions').select('*').eq('user_email', user.email).order('date', { ascending: false });
        if (transData) setTransactions(transData);
      }
    };
    if (user) loadData();
  }, [user]);

  // 2. Add Item to Supabase
  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !newItemStock || !user) return;
    const itemPayload = {
      user_email: user.email,
      name: newItemName,
      price: parseFloat(newItemPrice),
      stock: parseInt(newItemStock),
      category: 'General'
    };

    const { data, error } = await supabase.from('items').insert([itemPayload]).select();
    if (!error && data) {
      setItems([...items, data[0]]);
      setNewItemName(''); setNewItemPrice(''); setNewItemStock('');
      alert(language === 'ta' ? 'பொருள் சேர்க்கப்பட்டது!' : 'Item Added!');
    } else {
      alert('Error adding item');
    }
  };

  // 3. Delete Item from Supabase
  const handleDeleteItem = async (id: any) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // 4. Create Bill (Transaction) in Supabase
  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    const total = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);
    
    // A. Add Transaction
    const transPayload = {
      user_email: user.email,
      type: 'SALE',
      amount: total,
      items_data: cart,
      date: new Date().toISOString()
    };
    const { data: transData, error: transError } = await supabase.from('transactions').insert([transPayload]).select();

    // B. Update Stock
    if (!transError && transData) {
      for (const cartItem of cart) {
        const newStock = cartItem.item.stock - cartItem.qty;
        await supabase.from('items').update({ stock: newStock }).eq('id', cartItem.item.id);
      }
      
      // Refresh local state
      const { data: updatedItems } = await supabase.from('items').select('*').eq('user_email', user.email);
      if (updatedItems) setItems(updatedItems);
      
      setTransactions([transData[0], ...transactions]);
      setCart([]);
      alert(language === 'ta' ? 'பில் போடப்பட்டது!' : 'Bill Created!');
    }
  };

  const addToCart = (item: Item) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      if (existing.qty < item.stock) {
        setCart(cart.map(c => c.item.id === item.id ? {...c, qty: c.qty + 1} : c));
      } else {
        alert('Stock Limit Reached');
      }
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  if (!user) {
    return <AuthScreen onLogin={setUser} language={language} t={t} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-[2.5rem] shadow-xl sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tamil-font">{user.name}</h1>
            <p className="text-indigo-200 text-xs">{user.mobile}</p>
          </div>
          <button onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')} className="bg-white/20 p-2 rounded-full">
            <Languages size={20} />
          </button>
        </div>
        
        {/* Quick Stats */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-indigo-200 text-xs mb-1">{t.totalValue}</p>
              <p className="text-2xl font-bold">₹{items.reduce((acc, i) => acc + (i.price * i.stock), 0)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-indigo-200 text-xs mb-1">Total Sales</p>
              <p className="text-2xl font-bold">₹{transactions.reduce((acc, t) => acc + t.amount, 0)}</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-800 text-lg">{t.recentTrans}</h3>
             </div>
             <div className="space-y-3">
               {transactions.length === 0 ? <p className="text-gray-400 text-center text-sm">No transactions yet.</p> : 
                 transactions.map(tr => (
                   <div key={tr.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tr.type === 'SALE' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {tr.type === 'SALE' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Sale</p>
                          <p className="text-xs text-gray-400">{new Date(tr.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tr.type === 'SALE' ? 'text-green-600' : 'text-orange-600'}`}>
                        {tr.type === 'SALE' ? '+' : '-'} ₹{tr.amount}
                      </span>
                   </div>
                 ))
               }
             </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-lg border border-indigo-50">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> {t.addItem}
              </h3>
              <div className="space-y-3">
                <input placeholder={t.itemName} value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <div className="flex gap-3">
                  <input type="number" placeholder={t.price} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  <input type="number" placeholder={t.stock} value={newItemStock} onChange={e => setNewItemStock(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <button onClick={handleAddItem} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-md active:scale-95 transition-all">{t.add}</button>
              </div>
            </div>

            <div className="grid gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-xs text-gray-500">Stock: {item.stock} | ₹{item.price}</p>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
             <div className="relative">
               <Search className="absolute left-3 top-3 text-gray-400" size={20} />
               <input placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white p-3 pl-10 rounded-xl shadow-sm outline-none" />
             </div>

             <div className="h-48 overflow-y-auto space-y-2">
               {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                 <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-3 rounded-xl flex justify-between items-center border border-gray-100 active:bg-indigo-50 cursor-pointer">
                    <span className="font-bold text-gray-700">{item.name}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">₹{item.price}</span>
                 </div>
               ))}
             </div>

             {cart.length > 0 && (
               <div className="bg-white p-5 rounded-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 mt-4">
                 <h3 className="font-bold text-gray-800 mb-3">{t.newBill}</h3>
                 <div className="space-y-2 mb-4">
                   {cart.map((c, idx) => (
                     <div key={idx} className="flex justify-between text-sm">
                       <span>{c.item.name} x {c.qty}</span>
                       <span className="font-bold">₹{c.item.price * c.qty}</span>
                     </div>
                   ))}
                 </div>
                 <div className="flex justify-between items-center border-t pt-3 mb-4">
                   <span className="text-gray-500 font-bold">Total</span>
                   <span className="text-2xl font-black text-indigo-600">₹{cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0)}</span>
                 </div>
                 <button onClick={handleCheckout} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                   {t.checkout}
                 </button>
               </div>
             )}
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-2 flex justify-around items-center rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}>
          <BarChart3 size={24} />
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-2xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}>
          <Package size={24} />
        </button>
        <button onClick={() => setActiveTab('billing')} className={`p-3 rounded-2xl transition-all ${activeTab === 'billing' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}>
          <ShoppingCart size={24} />
        </button>
        <button onClick={() => setUser(null)} className="p-3 text-red-300 hover:text-red-500 transition-all">
          <LogOut size={24} />
        </button>
      </nav>
    </div>
  );
}

export default App;
            
