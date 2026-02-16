import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ShoppingCart, Plus, Trash2, Languages, LogOut, BarChart3, Package, History, ArrowUpRight, ArrowDownLeft, Search, Camera, Upload, Calendar, X } from 'lucide-react';

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
  description?: string;
  created_at?: string;
}

interface Transaction {
  id: any;
  type: 'SALE' | 'PURCHASE';
  amount: number;
  items_data?: any;
  date: string;
  customer_name?: string;
}

// --- Translations ---
const translations = {
  en: {
    appName: 'Viyaabhaaram',
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    billing: 'Billing',
    history: 'History',
    addItem: 'Add New Item',
    itemName: 'Item Name',
    price: 'Price',
    stock: 'Stock',
    category: 'Category',
    image: 'Product Image',
    sizes: 'Sizes (e.g. S, M, L)',
    colors: 'Colors (e.g. Red, Blue)',
    add: 'Save Item',
    totalValue: 'Total Value',
    recentTrans: 'Transaction History',
    newBill: 'New Bill',
    checkout: 'Checkout',
    login: 'Login',
    signUp: 'Sign Up',
    date: 'Date',
  },
  ta: {
    appName: 'வியாபாரம்',
    dashboard: 'முகப்பு',
    inventory: 'சரக்கு',
    billing: 'பில்லிங்',
    history: 'வரலாறு',
    addItem: 'புதிய பொருள் சேர்',
    itemName: 'பொருள் பெயர்',
    price: 'விலை',
    stock: 'இருப்பு',
    category: 'வகை',
    image: 'பொருள் புகைப்படம்',
    sizes: 'அளவுகள் (எ.கா: S, M, L)',
    colors: 'நிறங்கள் (எ.கா: சிவப்பு)',
    add: 'சேமி',
    totalValue: 'மொத்த மதிப்பு',
    recentTrans: 'பரிவர்த்தனை வரலாறு',
    newBill: 'புதிய பில்',
    checkout: 'பில் போடு',
    login: 'உள்நுழை',
    signUp: 'பதிவு செய்',
    date: 'தேதி',
  }
};

// --- Auth Component (With Forgot Password) ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void; language: 'ta' | 'en'; t: any }> = ({ onLogin, language, t }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [step, setStep] = useState<'VERIFY' | 'RESET'>('VERIFY');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${email}`).eq('password', password).single();
      if (data) {
        onLogin({ email: data.email, name: data.business_name, mobile: data.mobile, isLoggedIn: true, password: data.password });
      } else {
        alert(language === 'ta' ? 'தவறான தகவல்கள்' : 'Invalid Credentials');
      }
    } catch (err) { alert('Login Error'); } finally { setLoading(false); }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${mobile}`).single();
      if (existing) throw new Error('User already exists');

      const { error } = await supabase.from('users').insert([{ email, mobile, password, business_name: name }]);
      if (error) throw error;
      alert('Account Created!');
      onLogin({ email, name, mobile, isLoggedIn: true, password });
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // Forgot Password - Verify
  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase.from('users').select('*').eq('email', email).eq('mobile', mobile).single();
      if (data) setStep('RESET');
      else alert(language === 'ta' ? 'தகவல்கள் பொருந்தவில்லை.' : 'Details do not match.');
    } catch (err) { alert('Error checking user'); } finally { setLoading(false); }
  };

  // Forgot Password - Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('users').update({ password: newPassword }).eq('email', email).eq('mobile', mobile);
      if (!error) {
        alert(language === 'ta' ? 'பாஸ்வேர்ட் மாற்றப்பட்டது!' : 'Password Reset Successful!');
        setMode('LOGIN'); setStep('VERIFY'); setPassword('');
      } else throw error;
    } catch (err) { alert('Error updating password'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-4xl font-black mb-4">{t.appName}</h1>
      <div className="bg-white text-gray-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in">
        <h2 className="text-xl font-bold mb-6 text-center">
          {mode === 'LOGIN' && t.login}
          {mode === 'REGISTER' && t.signUp}
          {mode === 'FORGOT' && (step === 'VERIFY' ? 'Find Account' : 'Reset Password')}
        </h2>

        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Email / Mobile" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <div className="text-right">
              <button type="button" onClick={() => {setMode('FORGOT'); setStep('VERIFY'); setEmail(''); setMobile('');}} className="text-sm text-indigo-500 font-bold hover:text-indigo-700">
                {language === 'ta' ? 'பாஸ்வேர்ட் மறந்துவிட்டதா?' : 'Forgot Password?'}
              </button>
            </div>
            <button disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg">
              {loading ? 'Logging in...' : t.login}
            </button>
          </form>
        )}

        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="Business Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <input type="text" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <input type="text" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
            <button disabled={loading} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg">
              {loading ? 'Creating...' : t.signUp}
            </button>
          </form>
        )}

        {mode === 'FORGOT' && (
          <div className="space-y-4">
            {step === 'VERIFY' ? (
              <form onSubmit={handleVerifyUser} className="space-y-4">
                <p className="text-xs text-gray-500 text-center mb-2">Enter Registered Mobile & Email</p>
                <input type="text" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
                <input type="text" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
                <button disabled={loading} className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold shadow-lg">Verify</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                 <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full p-4 bg-gray-100 rounded-xl font-bold outline-none" required />
                 <button disabled={loading} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold shadow-lg">Update Password</button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <button onClick={() => {setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setStep('VERIFY');}} className="text-indigo-600 font-bold text-sm">
            {mode === 'LOGIN' ? 'Create New Account' : 'Back to Login'}
          </button>
        </div>
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
  
  // Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemSizes, setNewItemSizes] = useState('');
  const [newItemColors, setNewItemColors] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Billing State
  const [cart, setCart] = useState<{item: Item, qty: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[language];

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (user?.email) {
        const { data: itemsData } = await supabase.from('items').select('*').eq('user_email', user.email).order('created_at', { ascending: false });
        if (itemsData) setItems(itemsData);

        const { data: transData } = await supabase.from('transactions').select('*').eq('user_email', user.email).order('date', { ascending: false });
        if (transData) setTransactions(transData);
      }
    };
    if (user) loadData();
  }, [user]);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { alert('Image too large (Max 1MB)'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setNewItemImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Add Item
  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice || !user) return;
    const itemPayload = {
      user_email: user.email,
      name: newItemName,
      price: parseFloat(newItemPrice),
      stock: parseInt(newItemStock) || 0,
      category: 'General',
      sizes: newItemSizes,
      colors: newItemColors,
      image: newItemImage
    };

    const { data, error } = await supabase.from('items').insert([itemPayload]).select();
    if (!error && data) {
      setItems([data[0], ...items]);
      setNewItemName(''); setNewItemPrice(''); setNewItemStock(''); 
      setNewItemSizes(''); setNewItemColors(''); setNewItemImage('');
      setShowAddForm(false);
      alert(language === 'ta' ? 'பொருள் சேர்க்கப்பட்டது!' : 'Item Added!');
    } else {
      alert('Error adding item. Check connection.');
    }
  };

  // Create Bill
  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    const total = cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);
    
    const transPayload = {
      user_email: user.email,
      type: 'SALE',
      amount: total,
      items_data: cart,
      date: new Date().toISOString()
    };
    const { data: transData, error } = await supabase.from('transactions').insert([transPayload]).select();

    if (!error && transData) {
      const newItems = [...items];
      for (const c of cart) {
        const idx = newItems.findIndex(i => i.id === c.item.id);
        if (idx > -1) newItems[idx].stock -= c.qty;
        await supabase.from('items').update({ stock: newItems[idx].stock }).eq('id', c.item.id);
      }
      setItems(newItems);
      setTransactions([transData[0], ...transactions]);
      setCart([]);
      alert(language === 'ta' ? 'பில் போடப்பட்டது!' : 'Bill Created!');
    }
  };

  if (!user) return <AuthScreen onLogin={setUser} language={language} t={t} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-black tamil-font">{user.name}</h1>
            <p className="text-indigo-200 text-xs">{user.mobile}</p>
          </div>
          <button onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')} className="bg-white/20 p-2 rounded-full">
            <Languages size={20} />
          </button>
        </div>
        
        {activeTab === 'dashboard' && (
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mt-2 flex justify-between items-center">
            <div>
              <p className="text-indigo-200 text-xs">{t.totalValue}</p>
              <p className="text-3xl font-bold">₹{items.reduce((acc, i) => acc + (i.price * i.stock), 0)}</p>
            </div>
            <BarChart3 size={32} className="text-indigo-200 opacity-50" />
          </div>
        )}
      </header>

      <main className="p-4">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <History size={20} /> {t.recentTrans}
            </h3>
            {transactions.length === 0 ? <p className="text-gray-400 text-center text-sm py-10">No history found.</p> : 
              transactions.map(tr => (
                <div key={tr.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${tr.type === 'SALE' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                         {tr.type === 'SALE' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                       </div>
                       <div>
                         <p className="font-bold text-gray-800">{tr.type === 'SALE' ? 'Sale Bill' : 'Purchase'}</p>
                         <p className="text-xs text-gray-400 flex items-center gap-1">
                           <Calendar size={10} /> {new Date(tr.date).toLocaleString()}
                         </p>
                       </div>
                     </div>
                     <span className={`font-bold text-lg ${tr.type === 'SALE' ? 'text-green-600' : 'text-orange-600'}`}>
                       {tr.type === 'SALE' ? '+' : '-'} ₹{tr.amount}
                     </span>
                   </div>
                   {tr.items_data && (
                     <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 space-y-1">
                       {tr.items_data.map((i: any, idx: number) => (
                         <div key={idx} className="flex justify-between">
                           <span>{i.item.name} (x{i.qty})</span>
                           <span>₹{i.item.price * i.qty}</span>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              ))
            }
          </div>
        )}

        {/* INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <button onClick={() => setShowAddForm(!showAddForm)} className="w-full bg-indigo-600 text-white p-3 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg">
              {showAddForm ? <X size={20} /> : <Plus size={20} />} {showAddForm ? 'Close' : t.addItem}
            </button>

            {showAddForm && (
              <div className="bg-white p-5 rounded-3xl shadow-lg border border-indigo-50 space-y-3 animate-fade-in">
                <div className="flex justify-center mb-2">
                  <label className="w-24 h-24 bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 overflow-hidden relative">
                    {newItemImage ? <img src={newItemImage} className="w-full h-full object-cover" /> : <Camera className="text-gray-400" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                <input placeholder={t.itemName} value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl outline-none" />
                <div className="flex gap-2">
                  <input type="number" placeholder={t.price} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none" />
                  <input type="number" placeholder={t.stock} value={newItemStock} onChange={e => setNewItemStock(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none" />
                </div>
                <div className="flex gap-2">
                   <input placeholder={t.sizes} value={newItemSizes} onChange={e => setNewItemSizes(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none text-sm" />
                   <input placeholder={t.colors} value={newItemColors} onChange={e => setNewItemColors(e.target.value)} className="w-1/2 bg-gray-50 p-3 rounded-xl outline-none text-sm" />
                </div>
                <button onClick={handleAddItem} className="w-full bg-green-600 text-white p-3 rounded-xl font-bold shadow-md">{t.add}</button>
              </div>
            )}

            <div className="grid gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                      <button onClick={() => {/* Delete */}} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-green-600 font-bold">₹{item.price}</p>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Qty: {item.stock}</span>
                      {item.sizes && <span className="bg-gray-100 px-2 py-1 rounded-md">{item.sizes}</span>}
                    </div>
                  </div>
                </div>
              )
