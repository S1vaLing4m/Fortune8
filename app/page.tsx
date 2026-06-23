"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';

// --- MOCK DATA FOR CHARTS ---
const budgetData = [
  { name: 'Groceries', value: 3200, color: '#10b981' }, 
  { name: 'Dining Out', value: 1500, color: '#ef4444' }, 
  { name: 'Transport', value: 800, color: '#3b82f6' }, 
  { name: 'Utilities', value: 1200, color: '#f59e0b' }, 
];

// --- COMPONENTS ---

const MatrixBackground = () => {
  const [columns, setColumns] = useState<string[][]>([]);

  useEffect(() => {
    const chars = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷', '$', '¥', '€', '₿', '£'];
    const colCount = Math.floor(window.innerWidth / 30);
    const newCols = Array.from({ length: colCount }, () => 
      Array.from({ length: 25 }, () => chars[Math.floor(Math.random() * chars.length)])
    );
    setColumns(newCols);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 flex justify-around overflow-hidden bg-slate-950 pointer-events-none opacity-20">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col text-emerald-500/30 text-xl font-mono leading-none pt-4" style={{ marginTop: `${Math.random() * -100}px` }}>
          {col.map((char, j) => (
            <span key={j} className="my-2" style={{ opacity: Math.random() * 0.8 + 0.2 }}>{char}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onRefresh, categories }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, categories: any[] }) => {
  const [mode, setMode] = useState<'manual' | 'bank' | 'investment'>('manual');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select the first category when modal opens
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const numAmount = parseFloat(amount);
    const { error } = await supabase.from('transactions').insert([{
      date: new Date().toISOString().split('T')[0],
      description: desc,
      amount: numAmount,
      category: category,
      type: numAmount >= 0 ? 'income' : 'expense'
    }]);

    setIsSubmitting(false);

    if (!error) {
      onRefresh(); 
      onClose();   
      setDesc(''); 
      setAmount('');
    } else {
      alert("Database Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Add Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Manual Entry</button>
          <button onClick={() => setMode('bank')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'bank' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Bank Statement</button>
        </div>

        {mode === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-600" placeholder="e.g. Woolworths" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (R)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-600" placeholder="-450.00" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none">
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium py-3 rounded-lg transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        ) : (
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all cursor-pointer">
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-slate-300 font-medium">Drag & drop PDF here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function Fortune8() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'budgets' | 'transactions' | 'settings'>('transactions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolioView, setPortfolioView] = useState<'overview' | 'bank' | 'investments' | 'networth'>('overview');
  
  // Real Database State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');

  const fetchData = async () => {
    // Fetch Transactions
    const { data: txData } = await supabase.from('transactions').select('*').order('id', { ascending: false });
    if (txData) setTransactions(txData);

    // Fetch Categories
    const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (catData) setCategories(catData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName, type: newCategoryType }]);
    if (!error) {
      setNewCategoryName('');
      fetchData(); // Refresh list
    } else {
      alert("Error adding category: " + error.message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert("Error deleting category: " + error.message);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans relative z-0">
      <MatrixBackground />

      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white">F8</div>
            <h1 className="text-xl font-bold text-slate-100 tracking-wide">Fortune8</h1>
          </div>
          
          <nav className="hidden md:flex space-x-1 border border-slate-800 rounded-lg p-1 bg-slate-900/50">
            {['portfolio', 'budgets', 'transactions', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition-all flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Data</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* TAB 1: PORTFOLIO */}
        {activeTab === 'portfolio' && (
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
               <p className="text-slate-400">Portfolio view (Requires database wiring)</p>
           </div>
        )}

        {/* TAB 2: BUDGETS */}
        {activeTab === 'budgets' && (
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
               <p className="text-slate-400">Budget charts (Requires database wiring)</p>
           </div>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2">
                <option>All Categories</option>
                {categories.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Category</th><th className="px-6 py-3 text-right">Amount</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">No transactions yet.</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">{t.date}</td>
                      <td className="px-6 py-4 text-slate-300 font-medium">{t.description}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs">{t.category}</span></td>
                      <td className={`px-6 py-4 text-right font-medium ${t.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {t.amount > 0 ? '+' : ''}R {Math.abs(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SETTINGS (NEW!) */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Manage Categories</h2>
            
            <form onSubmit={handleAddCategory} className="flex space-x-2 mb-8">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none" />
              <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">Add</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-slate-300">{cat.name} <span className="text-xs text-slate-500 ml-1">({cat.type})</span></span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400 text-xl leading-none">&times;</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} categories={categories} />
    </div>
  );
}