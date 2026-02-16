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
  image?: string;   // போட்டோ
  sizes?: string;   // அளவுகள் (S, M, L)
  colors?: string;  // நிறங்கள்
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

// --- Auth Component ---
const AuthScreen: React.FC<{ onLogin: (u: User) => void; language: 'ta' | 'en'; t: any }> = ({ onLogin, language, t }) => {
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
        if (existing) throw new Error('User already exists');
        const { error } = await supabase.from('users').insert([{ email, mobile, password, business_name: name }]);
        if (error) throw error;
        alert('Account Created!');
        onLogin({ email, name, mobile, isLoggedIn: true, password });
      } else {
        const { data, error } = await supabase.from('users').select('*').or(`email.eq.${email},mobile.eq.${email}`).eq('password', password).single();
        if (data) onLogin({ email: data.email, name: data.business_name, mobile: data.mobile, isLoggedIn: true, password: data.password });
        else alert('Invalid Credentials');
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

  // Handle Image Upload (Convert to Base64 String)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // Limit 1MB
        alert('Image too large (Max 1MB)'); return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Item to Supabase
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
      // Reset Form
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
      // Update Stock locally (Optimistic update)
      const newItems = [...items];
      for (const c of cart) {
        const idx = newItems.findIndex(i => i.id === c.item.id);
        if (idx > -1) newItems[idx].stock -= c.qty;
        // Also update Supabase background
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
        
        {/* Total Stats */}
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
        {/* DASHBOARD & HISTORY */}
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
                   {/* Bill Items Details */}
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

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Add Button */}
            <button onClick={() => setShowAddForm(!showAddForm)} className="w-full bg-indigo-600 text-white p-3 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg">
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
              {showAddForm ? 'Close Form' : t.addItem}
            </button>

            {/* Add Item Form */}
            {showAddForm && (
              <div className="bg-white p-5 rounded-3xl shadow-lg border border-indigo-50 space-y-3 animate-fade-in">
                {/* Image Upload */}
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

            {/* Items List */}
            <div className="grid gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                      <button onClick={() => {/* Delete logic needs supabase delete */}} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-green-600 font-bold">₹{item.price}</p>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">Stock: {item.stock}</span>
                      {item.sizes && <span className="bg-gray-100 px-2 py-1 rounded-md">{item.sizes}</span>}
                      {item.colors && <span className="bg-gray-100 px-2 py-1 rounded-md">{item.colors}</span>}
                    </div>
                    {item.created_at && <p className="text-[10px] text-gray-400 mt-1">Added: {new Date(item.created_at).toLocaleDateString()}</p>}
                  </div>
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

             <div className="h-64 overflow-y-auto space-y-2 pb-10">
               {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                 <div key={item.id} onClick={() => {
                   const existing = cart.find(c => c.item.id === item.id);
                   if (existing && existing.qty >= item.stock) { alert('Stock Empty'); return; }
                   setCart(prev => {
                     const exist = prev.find(c => c.item.id === item.id);
                     return exist ? prev.map(c => c.item.id === item.id ? {...c, qty: c.qty+1} : c) : [...prev, {item, qty:1}];
                   });
                 }} className="bg-white p-3 rounded-xl flex items-center gap-3 border border-gray-100 active:bg-indigo-50 cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="p-2 text-gray-300" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-700">{item.name}</h4>
                      <p className="text-xs text-gray-500">Stock: {item.stock}</p>
                    </div>
                    <span className="font-bold text-green-700">₹{item.price}</span>
                 </div>
               ))}
             </div>

             {/* Cart Summary */}
             {cart.length > 0 && (
               <div className="fixed bottom-24 left-4 right-4 bg-white p-5 rounded-3xl shadow-2xl border border-indigo-100 animate-slide-up">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800">{t.newBill} ({cart.length})</h3>
                   <button onClick={() => setCart([])} className="text-red-500 text-xs font-bold">Clear</button>
                 </div>
                 <div className="max-h-32 overflow-y-auto mb-4 text-sm space-y-2">
                   {cart.map((c, idx) => (
                     <div key={idx} className="flex justify-between">
                       <span>{c.item.name} x {c.qty}</span>
                       <span className="font-bold">₹{c.item.price * c.qty}</span>
                     </div>
                   ))}
                 </div>
                 <div className="flex justify-between items-center border-t pt-3 mb-4">
                   <span className="text-gray-500 font-bold">Total</span>
                   <span className="text-2xl font-black text-indigo-600">₹{cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0)}</span>
                 </div>
                 <button onClick={handleCheckout} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg active:scale-95
