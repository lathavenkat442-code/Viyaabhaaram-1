import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ShoppingCart, Plus, Trash2, Languages, LogOut, BarChart3, Package, History, ArrowUpRight, ArrowDownLeft, Search, Camera, Calendar, X } from 'lucide-react';

// --- Types ---
interface User {
  name: string;
  mobile: string;
  email: string;
  isLoggedIn: boolean;
  password?: string;
}

interface Item {
  id: any;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  sizes?: string;
  colors?: string;
  created_at?: string;
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
    addItem: 'Add Item',
    itemName: 'Item Name',
    price: 'Price',
    stock: 'Stock',
    add: 'Save',
    newBill: 'New Bill',
    checkout: 'Checkout',
    login: 'Login',
    signUp: 'Sign Up',
    totalValue: 'Total Value'
  },
  ta: {
    appName: 'வியாபாரம்',
    dashboard: 'முகப்பு',
    inventory: 'சரக்கு',
    billing: 'பில்லிங்',
    addItem: 'பொருள் சேர்',
    itemName: 'பெயர்',
    price: 'விலை',
    stock: 'இருப்பு',
    add: 'சேமி',
    newBill: 'புதிய பில்',
    checkout: 'பில் போடு',
    login: 'உள்நுழை',
    signUp: 'பதிவு',
    totalValue: 'மொத்த மதிப்பு'
  }
};

// --- Auth Component ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void; language: string; t: any }> = ({ onLogin, language, t }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'REGISTER') {
        const { data: existing } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${mobile}`).single();
        if (existing) throw new Error('User exists');
        const { error } = await supabase.from('users').insert([{ email, mobile, password, business_name: name }]);
        if (error) throw error;
        alert('Registered!');
        onLogin({ email, name, mobile, isLoggedIn: true });
      } else {
        const { data } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${email}`).eq('password', password).single();
        if (data) onLogin({ email: data.email, name: data.business_name, mobile: data.mobile, isLoggedIn: true });
        else alert('Invalid Login');
      }
    } catch (err: any) { alert(err.message || 'Error'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-4xl font-black mb-4">{t.appName}</h1>
      <div className="bg-white text-gray-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-center">{mode === 'LOGIN' ? t.login : t.signUp}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'REGISTER' && (
            <>
              <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
              <input type="text" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
            </>
          )}
          <input type="text" placeholder="Email/Mobile" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl" required />
          <button disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">
            {loading ? '...' : (mode === 'LOGIN' ? t.login : t.signUp)}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="w-full mt-4 text-sm text-indigo-600 font-bold">
          {mode === 'LOGIN' ? 'Create Account' : 'Back to Login'}
        </button>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'ta' | 'en'>('ta');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Cart
  const [cart, setCart] = useState<{item: Item, qty: number}[]>([]);

  // Load Data
  useEffect(() => {
    if (user?.email) {
      supabase.from('items').select('*').eq('user_email', user.email).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setItems(data); });
      supabase.from('transactions').select('*').eq('user_email', user.email).order('date', { ascending: false })
        .then(({ data }) => { if (data) setTransactions(data); });
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewItemImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !user) return;
    const { data } = await supabase.from('items').insert([{
      user_email: user.email, name: newItemName, price: parseFloat(newItemPrice), stock: parseInt(newItemStock)||0, image: newItemImage, category: 'General'
    }]).select();
    
    if (data) {
      setItems([data[0], ...items]);
      setNewItemName(''); setNewItemPrice(''); setNewItemStock(''); setNewItemImage(''); setShowAddForm(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    const total = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);
    const { data } = await supabase.from('transactions').insert([{
      user_email: user.email, type: 'SALE', amount: total, items_data: cart, date: new Date().toISOString()
    }]).select();

    if (data) {
      const newItems = [...items];
      for (const c of cart) {
        const idx = newItems.findIndex(i => i.id === c.item.id);
        if (idx > -1) {
          newItems[idx].stock -= c.qty;
          await supabase.from('items').update({ stock: newItems[idx].stock }).eq('id', c.item.id);
        }
      }
      setItems(newItems);
      setTransactions([data[0], ...transactions]);
      setCart([]);
      alert('Bill Created!');
    }
  };

  const t = translations[language];

  if (!user) return <AuthScreen onLogin={setUser} language={language} t={t} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-xl sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">{user.name}</h1>
          <p className="text-xs opacity-80">{user.email}</p>
        </div>
        <button onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')} className="bg-white/20 p-2 rounded-full">
          <Languages size={20} />
        </button>
      </header>

      <main className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs">{t.totalValue}</p>
                <p className="text-2xl font-bold">₹{items.reduce((a, b) => a + (b.price * b.stock), 0)}</p>
              </div>
              <BarChart3 className="text-indigo-200" size={32} />
            </div>
            <h3 className="font-bold text-gray-800">History</h3>
            {transactions.map(tr => (
              <div key={tr.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between mb-2">
                <div>
                  <p className="font-bold">Sale</p>
                  <p className="text-xs text-gray-400">{new Date(tr.date).toLocaleDateString()}</p>
                </div>
                <p className="text-green-600 font-bold">+ ₹{tr.amount}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <button onClick={() => setShowAddForm(!showAddForm)} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2">
              {showAddForm ? <X /> : <Plus />} {t.addItem}
            </button>
            
            {showAddForm && (
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-100 space-y-3">
                 <div className="flex justify-center">
                   <label className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative">
                     {newItemImage ? <img src={newItemImage} className="w-full h-full object-cover" /> : <Camera className="text-gray-400" />}
                     <input type="file" className="hidden" onChange={handleImageUpload} />
                   </label>
                 </div>
                 <input placeholder={t.itemName} value={newItemName} onChange={e=>setNewItemName(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg" />
                 <div className="flex gap-2">
                   <input type="number" placeholder={t.price} value={newItemPrice} onChange={e=>setNewItemPrice(e.target.value)} className="w-1/2 p-2 bg-gray-50 rounded-lg" />
                   <input type="number" placeholder={t.stock} value={newItemStock} onChange={e=>setNewItemStock(e.target.value)} className="w-1/2 p-2 bg-gray-50 rounded-lg" />
                 </div>
                 <button onClick={handleAddItem} className="w-full bg-green-600 text-white p-2 rounded-lg font-bold">{t.add}</button>
              </div>
            )}

            {items.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="p-4 text-gray-300" />}
                </div>
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-green-600 font-bold">₹{item.price}</p>
                  <p className="text-xs text-gray-500">Stock: {item.stock}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
             <div className="h-64 overflow-y-auto space-y-2">
               {items.map(item => (
                 <div key={item.id} onClick={() => setCart(c => [...c, {item, qty: 1}])} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer">
                   <span>{item.name}</span>
                   <span className="font-bold text-green-600">₹{item.price}</span>
                 </div>
               ))}
             </div>
             {cart.length > 0 && (
               <div className="bg-white p-4 rounded-2xl shadow-xl border border-indigo-100 fixed bottom-24 left-4 right-4">
                 <h3 className="font-bold mb-2">{t.newBill} ({cart.length})</h3>
                 <div className="flex justify-between items-center border-t pt-2 mb-3">
                   <span>Total</span>
                   <span className="text-2xl font-black text-indigo-600">₹{cart.reduce((s, i) => s + (i.item.price * i.qty), 0)}</span>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setCart([])} className="flex-1 bg-red-100 text-red-600 p-3 rounded-xl font-bold">Clear</button>
                   <button onClick={handleCheckout} className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold">{t.checkout}</button>
                 </div>
               </div>
             )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-2 flex justify-around rounded-t-3xl shadow-lg z-30">
        <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><BarChart3 /></button>
        <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl ${activeTab === 'inventory' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><Package /></button>
        <button onClick={() => setActiveTab('billing')} className={`p-3 rounded-xl ${activeTab === 'billing' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}><ShoppingCart /></button>
        <button onClick={() => setUser(null)} className="p-3 text-red-300"><LogOut /></button>
      </nav>
    </div>
  );
}

export default App;
