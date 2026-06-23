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

const SettingsModal = ({ isOpen, onClose, categories, onRefresh }: { isOpen: boolean, onClose: () => void, categories: any[], onRefresh: () => void }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName, type: newCategoryType }]);
    if (!error) {
      setNewCategoryName('');
      onRefresh();
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setConfirmDeleteId(null);
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            System Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="flex space-x-2">
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Server Hosting" className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none" />
            <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">Add</button>
          </form>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Manage Existing Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-3 rounded-lg group">
                <div>
                  <span className="text-slate-200 font-medium">{cat.name}</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded ${cat.type === 'income' ? 'bg-emerald-900/50 text-emerald-400' : cat.type === 'transfer' ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'}`}>{cat.type}</span>
                </div>
                
                {confirmDeleteId === cat.id ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-red-400 font-medium">Delete?</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(cat.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none p-1">&times;</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onRefresh, categories }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, categories: any[] }) => {
  const [mode, setMode] = useState<'manual' | 'bank' | 'investment'>('manual');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0].name);
  }, [categories, category]);

  if (!isOpen) return null;

  // Manual Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedCat = categories.find(c => c.name === category);
    const txType = selectedCat ? selectedCat.type : 'expense';
    const numAmount = parseFloat(amount);

    const { error } = await supabase.from('transactions').insert([{
      date: new Date().toISOString().split('T')[0],
      description: desc,
      amount: numAmount,
      category: category,
      type: txType
    }]);

    setIsSubmitting(false);
    if (!error) {
      onRefresh(); onClose(); setDesc(''); setAmount('');
    }
  };

  // AI PDF Submit
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingAI(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Save each extracted transaction to Supabase
      for (const tx of data.transactions) {
        await supabase.from('transactions').insert([{
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          category: 'Uncategorized', // Leaves it uncategorized for you to assign in the UI
          type: tx.amount >= 0 ? 'income' : 'expense'
        }]);
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      alert("AI Processing Failed: " + err.message);
    }
    setIsParsingAI(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Add Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Manual</button>
          <button onClick={() => setMode('bank')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'bank' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Statement</button>
        </div>

        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (R)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none">
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium py-3 rounded-lg transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        ) : (
          <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all overflow-hidden group">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePdfUpload} 
              disabled={isParsingAI}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait z-10" 
            />
            {isParsingAI ? (
              <div className="animate-pulse">
                <div className="w-12 h-12 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium">Llama 3 is reading PDF...</p>
                <p className="text-slate-500 text-sm mt-1">Local processing takes a moment.</p>
              </div>
            ) : (
              <div className="group-hover:scale-105 transition-transform">
                <svg className="w-12 h-12 mx-auto text-slate-400 mb-4 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="text-slate-300 font-medium">Click or Drag & Drop PDF</p>
                <p className="text-slate-500 text-sm mt-1">Processed securely offline by Local AI</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function Fortune8() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'budgets' | 'transactions'>('transactions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // INLINE EDITING STATE
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: '', description: '', amount: '', category: '' });

  const fetchData = async () => {
    const { data: txData } = await supabase.from('transactions').select('*').order('id', { ascending: false });
    if (txData) setTransactions(txData);

    const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (catData) setCategories(catData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (t: any) => {
    setEditingId(t.id);
    setEditForm({ date: t.date, description: t.description, amount: t.amount.toString(), category: t.category });
  };

  const handleSaveEdit = async (id: number) => {
    const selectedCat = categories.find(c => c.name === editForm.category);
    const txType = selectedCat ? selectedCat.type : 'expense';
    
    const { error } = await supabase.from('transactions').update({
      date: editForm.date,
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      type: txType
    }).eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchData();
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const handleDeleteTx = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) fetchData();
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
            {['portfolio', 'budgets', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-emerald-500 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition-all flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="hidden sm:inline">Add Data</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {activeTab === 'portfolio' && (
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
               <p className="text-slate-400">Portfolio view (Requires database wiring)</p>
           </div>
        )}

        {activeTab === 'budgets' && (
           <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center">
               <p className="text-slate-400">Budget charts (Requires database wiring)</p>
           </div>
        )}

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
                <tr>
                  <th className="px-6 py-3 w-32">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 w-48">Category</th>
                  <th className="px-6 py-3 text-right w-32">Amount</th>
                  <th className="px-6 py-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No transactions yet.</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                      {editingId === t.id ? (
                        <>
                          <td className="px-4 py-3"><input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200" /></td>
                          <td className="px-4 py-3"><input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200" /></td>
                          <td className="px-4 py-3">
                            <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200">
                              <option value="Uncategorized">Uncategorized</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3"><input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-right" /></td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => handleSaveEdit(t.id)} className="text-emerald-500 hover:text-emerald-400 font-medium">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">{t.date}</td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{t.description}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${t.category === 'Uncategorized' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' : t.type === 'income' ? 'bg-emerald-900/50 text-emerald-400' : t.type === 'transfer' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-800 text-slate-300'}`}>
                              {t.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-400' : t.type === 'transfer' ? 'text-blue-400' : 'text-slate-300'}`}>
                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}R {Math.abs(t.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditClick(t)} className="text-slate-400 hover:text-emerald-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => handleDeleteTx(t.id)} className="text-slate-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>
      
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} categories={categories} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onRefresh={fetchData} categories={categories} />
    </div>
  );
}