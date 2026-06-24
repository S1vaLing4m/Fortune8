"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabase';

// --- STYLES & ANIMATIONS ---
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-slide {
      animation: fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    /* Mobile-safe bottom padding to account for fixed nav bar */
    .pb-safe { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }

    /* Custom scrollbar for tight data tables */
    .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 1); }
  `}</style>
);

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

// 1. SETUP WIZARD
const SetupWizard = ({ isOpen, onClose, onComplete, userSettings }: { isOpen: boolean, onClose: () => void, onComplete: (day: number) => void, userSettings: any }) => {
  const [step, setStep] = useState(1);
  const [startDayInput, setStartDayInput] = useState(userSettings?.budget_start_day?.toString() || '25');

  if (!isOpen) return null;

  const handleFinish = () => {
    const day = parseInt(startDayInput) || 1;
    onComplete(day);
    localStorage.setItem('fortune8_wizard_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-slide">
        
        {/* Header Progress */}
        <div className="flex w-full h-1.5 bg-slate-800">
          <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 text-center animate-fade-slide">
              <div className="w-16 h-16 bg-emerald-600/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-100 tracking-tight">Welcome to Fortune8</h2>
              <p className="text-slate-400">Your private, zero-cost financial command center. Before we track your net worth, let's configure how your money moves.</p>
              <button onClick={() => setStep(2)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all mt-4">
                Let's Begin &rarr;
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-slide">
              <h2 className="text-2xl font-bold text-slate-100">The Budget Cycle</h2>
              <p className="text-slate-400 text-sm">Most apps force you to budget from the 1st to the 31st. In reality, your budget starts the day you get paid. Let's sync the app with your real life.</p>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                <label className="block text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">Payday / Cycle Start Date</label>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Day</span>
                  <input 
                    type="number" min="1" max="31" 
                    value={startDayInput} 
                    onChange={(e) => setStartDayInput(e.target.value)} 
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-xl font-bold text-center focus:border-emerald-500 focus:outline-none" 
                  />
                  <span className="text-slate-500">of every month</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-slide">
              <h2 className="text-2xl font-bold text-slate-100">Net Worth Automation</h2>
              <p className="text-slate-400 text-sm">You shouldn't have to manually update your account balances. Fortune8 can automatically read your bank's notification emails via a private Make.com webhook.</p>
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 opacity-50 cursor-not-allowed">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Make.com Webhook URL (Coming Soon)</label>
                <input 
                  type="text" 
                  disabled
                  placeholder="https://hook.make.com/..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-500 focus:outline-none" 
                />
                <p className="text-xs text-slate-600 mt-2">We will configure this in Phase 5. For now, you can update your balances directly on the Portfolio tab.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">Back</button>
                <button onClick={handleFinish} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-colors">
                  Enter Command Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. SETTINGS MODAL
const SettingsModal = ({ isOpen, onClose, categories, userSettings, onRefresh, onUpdateSettings, onLaunchWizard }: { isOpen: boolean, onClose: () => void, categories: any[], userSettings: any, onRefresh: () => void, onUpdateSettings: (day: number) => void, onLaunchWizard: () => void }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState('Daily');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', bucket_group: '', type: '', oldName: '' });
  
  const [startDayInput, setStartDayInput] = useState(userSettings?.budget_start_day?.toString() || '1');

  useEffect(() => {
    if (userSettings) setStartDayInput(userSettings.budget_start_day?.toString() || '1');
  }, [userSettings]);

  if (!isOpen) return null;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(startDayInput);
    if (day >= 1 && day <= 31) {
      onUpdateSettings(day);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryGroup) return;

    const { error } = await supabase.from('categories').insert([{ 
      name: newCategoryName, bucket_group: newCategoryGroup, type: newCategoryType, budget_target: 0 
    }]);
    if (!error) { setNewCategoryName(''); onRefresh(); }
  };

  const handleDeleteCategory = async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) { setConfirmDeleteId(null); onRefresh(); }
  };

  const startEditing = (cat: any) => {
    setEditingCatId(cat.id);
    setEditForm({ name: cat.name, bucket_group: cat.bucket_group, type: cat.type, oldName: cat.name });
  };

  const saveCategoryEdit = async () => {
    if (!editForm.name) return;
    const { error: catError } = await supabase.from('categories')
      .update({ name: editForm.name, bucket_group: editForm.bucket_group, type: editForm.type })
      .eq('id', editingCatId);

    if (!catError) {
      if (editForm.name !== editForm.oldName || editForm.type !== categories.find(c=>c.id===editingCatId)?.type) {
        await supabase.from('transactions')
          .update({ category: editForm.name, type: editForm.type })
          .eq('category', editForm.oldName);
      }
      setEditingCatId(null);
      onRefresh();
    }
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = {};
    if (!acc[cat.type][cat.bucket_group]) acc[cat.type][cat.bucket_group] = [];
    acc[cat.type][cat.bucket_group].push(cat);
    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-slide">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            System Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* SYSTEM PREFERENCES */}
        <div className="mb-8 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-1 uppercase tracking-wider">System Preferences</h3>
              <p className="text-xs text-slate-500 mb-3 md:mb-0">Set your primary budget cycle rollover date (e.g. 25th for payday).</p>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <form onSubmit={handleSavePreferences} className="flex items-center gap-3 md:border-r border-slate-800 md:pr-4">
                <label className="text-sm text-slate-300">Start Day:</label>
                <input type="number" min="1" max="31" value={startDayInput} onChange={(e) => setStartDayInput(e.target.value)} className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-emerald-500 focus:outline-none" />
                <button type="submit" className="bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm border border-slate-700 hover:border-emerald-500">Save</button>
              </form>
              <button 
                onClick={() => { onClose(); onLaunchWizard(); }} 
                className="text-xs font-bold bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-lg border border-blue-800/50 transition-colors whitespace-nowrap"
              >
                Run Setup Wizard
              </button>
            </div>
          </div>
        </div>

        {/* ADD CATEGORY */}
        <div className="mb-8 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <h3 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g. Side Hustle" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none" />
            <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none w-full sm:w-40">
              <option value="expense">Expense (Orange)</option>
              <option value="income">Income (Green)</option>
              <option value="transfer">Transfer (Blue)</option>
            </select>
            <select value={newCategoryGroup} onChange={(e) => setNewCategoryGroup(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none w-full sm:w-40">
              <option value="Recurring">Group: Recurring</option>
              <option value="Daily">Group: Daily</option>
              <option value="Exceptions">Group: Exceptions</option>
            </select>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Add</button>
          </form>
        </div>

        {/* MANAGE CATEGORIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['expense', 'income', 'transfer'].map(type => (
            <div key={type} className="space-y-4">
              <h3 className={`font-bold uppercase tracking-wider border-b border-slate-800 pb-2 ${type === 'income' ? 'text-emerald-500' : type === 'transfer' ? 'text-blue-500' : 'text-orange-500'}`}>
                {type}s
              </h3>
              
              {groupedCategories[type] ? Object.entries(groupedCategories[type] as Record<string, any[]>).map(([group, cats]) => (
                <div key={group} className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">{group}</h4>
                  <div className="space-y-1">
                    {cats.map((cat: any) => (
                      <div key={cat.id} className="group py-1 border-b border-slate-800/30 last:border-0">
                        {editingCatId === cat.id ? (
                          <div className="flex flex-col gap-2 mt-1 mb-2 bg-slate-900 p-2 rounded border border-emerald-500/30">
                            <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-sm" />
                            <select value={editForm.type} onChange={e=>setEditForm({...editForm, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-sm">
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                              <option value="transfer">Transfer</option>
                            </select>
                            <select value={editForm.bucket_group} onChange={e=>setEditForm({...editForm, bucket_group: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-sm">
                              <option value="Recurring">Recurring</option>
                              <option value="Daily">Daily</option>
                              <option value="Exceptions">Exceptions</option>
                            </select>
                            <div className="flex gap-2 mt-1">
                              <button onClick={saveCategoryEdit} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded">Save</button>
                              <button onClick={()=>setEditingCatId(null)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-200 text-sm">{cat.name}</span>
                            {confirmDeleteId === cat.id ? (
                              <div className="flex items-center space-x-1">
                                <button onClick={() => handleDeleteCategory(cat.id)} className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">Yes</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors">No</button>
                              </div>
                            ) : (
                              <div className="flex space-x-2 opacity-0 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all">
                                <button onClick={() => startEditing(cat)} className="text-slate-500 hover:text-emerald-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button onClick={() => setConfirmDeleteId(cat.id)} className="text-slate-600 hover:text-red-500 leading-none pb-1 p-1">&times;</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )) : <p className="text-sm text-slate-600 italic">No categories mapped.</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. UPLOAD MODAL
const UploadModal = ({ isOpen, onClose, onRefresh, categories }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, categories: any[] }) => {
  const [mode, setMode] = useState<'manual' | 'ai-import' | 'sms-import'>('sms-import');
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  const categoryNames = categories.map(c => c.name).join(', ');
  
  const aiStatementPrompt = `Please read the attached bank statement and extract all transactions into a raw JSON array. Do not include any conversational text or markdown. Keys: "date" (YYYY-MM-DD), "description" (clean up vendor names), "amount" (number, negative for expenses, positive for income), and "category" (Guess from this list: [${categoryNames}]. Fallback: "Uncategorized").`;
  const aiSmsPrompt = `Please read these raw bank notifications and extract them into a raw JSON array. Do not include any conversational text or markdown. Keys: "date" (YYYY-MM-DD format based on the notification timestamp or context), "description" (clean up the vendor name), "amount" (number, negative for purchases/deductions, positive for deposits), and "category" (Guess strictly from this list: [${categoryNames}]. Fallback: "Uncategorized").`;

  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0].name);
  }, [categories, category]);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedCat = categories.find(c => c.name === category);
    const txType = selectedCat ? selectedCat.type : 'expense';
    
    const { error } = await supabase.from('transactions').insert([{
      date: new Date().toISOString().split('T')[0],
      description: desc,
      amount: parseFloat(amount),
      category: category,
      type: txType
    }]);

    setIsSubmitting(false);
    if (!error) { onRefresh(); onClose(); setDesc(''); setAmount(''); }
  };

  const handleAiSubmit = async () => {
    setIsSubmitting(true);
    setJsonError('');
    try {
      let cleanInput = jsonInput.trim();
      const startIndex = cleanInput.indexOf('[');
      const endIndex = cleanInput.lastIndexOf(']');
      if (startIndex === -1 || endIndex === -1) throw new Error("Could not find a valid JSON array '[]' in your input.");
      
      cleanInput = cleanInput.substring(startIndex, endIndex + 1);
      const transactions = JSON.parse(cleanInput);

      for (const tx of transactions) {
        let txType = tx.amount >= 0 ? 'income' : 'expense';
        const matchedCat = categories.find(c => c.name === tx.category);
        if (matchedCat) txType = matchedCat.type;

        await supabase.from('transactions').insert([{
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          category: tx.category || 'Uncategorized', 
          type: txType
        }]);
      }
      onRefresh(); onClose(); setJsonInput('');
    } catch (err: any) {
      setJsonError(err.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl p-6 shadow-2xl animate-fade-slide">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Add Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex space-x-2 mb-6 bg-slate-800 p-1 rounded-lg overflow-x-auto custom-scrollbar">
          <button onClick={() => setMode('manual')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Manual</button>
          <button onClick={() => setMode('sms-import')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${mode === 'sms-import' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Daily Notifications</button>
          <button onClick={() => setMode('ai-import')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${mode === 'ai-import' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Monthly Statement</button>
        </div>

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Amount (R)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none" />
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
        )}

        {(mode === 'ai-import' || mode === 'sms-import') && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">1. Ask your LLM</h3>
              <p className="text-xs text-slate-400 mb-3">Copy this prompt and supply it to your LLM platform with your {mode === 'sms-import' ? 'copied bank notifications' : 'Monthly Statement'}:</p>
              <div className="flex bg-slate-900 rounded p-2 relative">
                <p className="text-xs text-slate-300 flex-1 h-16 overflow-y-auto pr-2">{mode === 'sms-import' ? aiSmsPrompt : aiStatementPrompt}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(mode === 'sms-import' ? aiSmsPrompt : aiStatementPrompt)}
                  className="ml-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-2">2. Paste Result</h3>
              <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste the raw JSON array here..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-mono"
              />
              {jsonError && <p className="text-red-400 text-xs mt-2">{jsonError}</p>}
            </div>

            <button 
              onClick={handleAiSubmit} 
              disabled={isSubmitting || !jsonInput} 
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Importing...' : 'Import Data Pipeline'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. CATEGORY HISTORY MODAL
const CategoryHistoryModal = ({ isOpen, onClose, category, transactions, onUpdateBudget }: { isOpen: boolean, onClose: () => void, category: any, transactions: any[], onUpdateBudget: (id: number, target: number) => void }) => {
  const [timeFilter, setTimeFilter] = useState<'1M' | '6M' | '12M' | 'ALL'>('6M');
  const [budgetTargetStr, setBudgetTargetStr] = useState(category?.budget_target?.toString() || '0');

  useEffect(() => {
    if (category) setBudgetTargetStr(category.budget_target?.toString() || '0');
  }, [category]);

  const chartData = useMemo(() => {
    if (!category) return [];
    const catTxs = transactions.filter(t => t.category === category.name);
    
    const now = new Date();
    let cutoff = new Date(0); 
    if (timeFilter === '1M') cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    else if (timeFilter === '6M') cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    else if (timeFilter === '12M') cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const filteredTxs = catTxs.filter(t => new Date(t.date) >= cutoff);

    const grouped = filteredTxs.reduce((acc, t) => {
      const monthKey = t.date.substring(0, 7);
      acc[monthKey] = (acc[monthKey] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([month, spend]) => ({ month, spend }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions, category, timeFilter]);

  if (!isOpen || !category) return null;

  const handleSaveBudget = () => {
    onUpdateBudget(category.id, parseFloat(budgetTargetStr) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 shadow-2xl animate-fade-slide">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{category.name} History</h2>
            <p className="text-xs text-slate-400">Group: {category.bucket_group} | Type: {category.type}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Monthly Budget Target</h3>
            <p className="text-xs text-slate-500">Set a goal to track your spend.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">R</span>
            <input 
              type="number" 
              value={budgetTargetStr} 
              onChange={(e) => setBudgetTargetStr(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
            <button onClick={handleSaveBudget} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm transition-colors">Save</button>
          </div>
        </div>

        <div className="mb-4 flex space-x-2">
          {['1M', '6M', '12M', 'ALL'].map(f => (
            <button 
              key={f} 
              onClick={() => setTimeFilter(f as any)} 
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${timeFilter === f ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="h-64 w-full bg-slate-950 border border-slate-800 rounded-lg p-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">No transactions found for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `R${val}`} width={60} />
                <Tooltip 
                  formatter={(value: any) => `R ${Number(value || 0).toFixed(2)}`}
                  labelStyle={{ color: '#94a3b8' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  cursor={{fill: '#1e293b'}}
                />
                <Bar dataKey="spend" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN APPLICATION ---

export default function Fortune8() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'budgets' | 'transactions'>('transactions');
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [userSettings, setUserSettings] = useState<any>({ budget_start_day: 1 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: '', description: '', amount: '', category: '' });
  const [selectedTxIds, setSelectedTxIds] = useState<number[]>([]);

  const [sortField, setSortField] = useState<'date' | 'description' | 'category' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');

  const [budgetViewMode, setBudgetViewMode] = useState<'1M' | '6M' | '12M' | 'ALL'>('1M');
  const [budgetAnchorPeriod, setBudgetAnchorPeriod] = useState<string>('');
  
  const [selectedPieGroup, setSelectedPieGroup] = useState<string | null>(null);
  const [historyModalCat, setHistoryModalCat] = useState<any | null>(null);

  const fetchData = async () => {
    const { data: settingsData } = await supabase.from('user_settings').select('*');
    if (settingsData && settingsData.length > 0) setUserSettings(settingsData[0]);

    const { data: txData } = await supabase.from('transactions').select('*');
    if (txData) setTransactions(txData);

    const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (catData) setCategories(catData);

    const { data: accData } = await supabase.from('accounts').select('*').order('id', { ascending: true });
    if (accData) setAccounts(accData);
  };

  useEffect(() => { 
    fetchData(); 
    if (typeof window !== 'undefined' && localStorage.getItem('fortune8_wizard_seen') !== 'true') {
      setIsWizardOpen(true);
    }
  }, []);

  const handleUpdateSettings = async (startDay: number) => {
    await supabase.from('user_settings').upsert({ id: 1, budget_start_day: startDay });
    fetchData();
  };

  // --- CORE DATE LOGIC ---
  const getPeriodForDate = (dateStr: string, startDay: number) => {
    const d = new Date(dateStr);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    const day = d.getDate();

    if (startDay > 1 && day >= startDay) {
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const getNextPeriod = (p: string, offset: number) => {
    if (!p) return '';
    let [y, m] = p.split('-').map(Number);
    m += offset;
    while (m > 12) { m -= 12; y += 1; }
    while (m < 1) { m += 12; y -= 1; }
    return `${y}-${String(m).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!budgetAnchorPeriod) {
      const now = new Date().toISOString().split('T')[0];
      setBudgetAnchorPeriod(getPeriodForDate(now, userSettings.budget_start_day || 1));
    }
  }, [userSettings.budget_start_day, budgetAnchorPeriod]);

  const activePeriods = useMemo(() => {
    if (budgetViewMode === 'ALL') return [];
    const numMonths = budgetViewMode === '1M' ? 1 : budgetViewMode === '6M' ? 6 : 12;
    const periods = [];
    for (let i = 0; i < numMonths; i++) {
      periods.push(getNextPeriod(budgetAnchorPeriod, -i));
    }
    return periods;
  }, [budgetViewMode, budgetAnchorPeriod]);

  const formatPeriodName = (periodStr: string) => {
    if (!periodStr) return '';
    const [y, m] = periodStr.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const periodDisplay = useMemo(() => {
    if (budgetViewMode === 'ALL') return 'All-Time History';
    if (budgetViewMode === '1M') return formatPeriodName(budgetAnchorPeriod);
    const startPeriod = getNextPeriod(budgetAnchorPeriod, -(budgetViewMode === '6M' ? 5 : 11));
    return `${formatPeriodName(startPeriod)} - ${formatPeriodName(budgetAnchorPeriod)}`;
  }, [budgetViewMode, budgetAnchorPeriod]);

  const handlePrevPeriod = () => {
    const offset = budgetViewMode === '1M' ? 1 : budgetViewMode === '6M' ? 6 : 12;
    setBudgetAnchorPeriod(prev => getNextPeriod(prev, -offset));
  };
  const handleNextPeriod = () => {
    const offset = budgetViewMode === '1M' ? 1 : budgetViewMode === '6M' ? 6 : 12;
    setBudgetAnchorPeriod(prev => getNextPeriod(prev, offset));
  };

  // --- PROCESSING FOR TRANSACTIONS TAB ---
  const processedTransactions = useMemo(() => {
    let filtered = transactions;
    if (filterCategory !== 'All Categories') filtered = filtered.filter(t => t.category === filterCategory);
    
    return filtered.sort((a, b) => {
      let valA = a[sortField]; let valB = b[sortField];
      if (sortField === 'amount') { valA = Math.abs(valA); valB = Math.abs(valB); }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortField, sortDirection, filterCategory]);

  // --- PROCESSING FOR BUDGETS TAB ---
  const budgetPeriodTxs = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'expense') return false;
      if (budgetViewMode === 'ALL') return true;
      const p = getPeriodForDate(t.date, userSettings.budget_start_day);
      return activePeriods.includes(p);
    });
  }, [transactions, budgetViewMode, activePeriods, userSettings.budget_start_day]);

  const budgetPieData = useMemo(() => {
    const aggregated = budgetPeriodTxs.reduce((acc, t) => {
      const matchedCat = categories.find(c => c.name === t.category);
      const groupName = matchedCat?.bucket_group || 'Unmapped';
      acc[groupName] = (acc[groupName] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(aggregated)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [budgetPeriodTxs, categories]);

  const budgetCategoryData = useMemo(() => {
    let catsToShow = categories.filter(c => c.type === 'expense');
    if (selectedPieGroup) catsToShow = catsToShow.filter(c => c.bucket_group === selectedPieGroup);

    const allUniquePeriods = new Set(transactions.map(t => getPeriodForDate(t.date, userSettings.budget_start_day)));
    const numActiveMonths = budgetViewMode === 'ALL' 
      ? Math.max(1, allUniquePeriods.size) 
      : (budgetViewMode === '1M' ? 1 : budgetViewMode === '6M' ? 6 : 12);

    return catsToShow.map(cat => {
      const spent = budgetPeriodTxs.filter(t => t.category === cat.name).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const target = (cat.budget_target || 0) * numActiveMonths;
      return { ...cat, spent, target };
    }).sort((a, b) => b.spent - a.spent); 
  }, [categories, budgetPeriodTxs, selectedPieGroup, budgetViewMode, transactions, userSettings.budget_start_day]);

  const totalBudgetTarget = useMemo(() => budgetCategoryData.reduce((sum, c) => sum + c.target, 0), [budgetCategoryData]);
  const totalBudgetSpend = useMemo(() => budgetCategoryData.reduce((sum, c) => sum + c.spent, 0), [budgetCategoryData]);

  // --- PROCESSING FOR NET WORTH ---
  const assets = accounts.filter(a => a.type === 'asset');
  const liabilities = accounts.filter(a => a.type === 'liability');
  const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleUpdateBalance = async (id: number, newBalance: string) => {
    const num = parseFloat(newBalance);
    if (isNaN(num)) return;
    await supabase.from('accounts').update({ balance: num, updated_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  };

  const handleAddAccount = async (type: 'asset' | 'liability') => {
    const name = window.prompt(`Enter new ${type} name:`);
    if (!name) return;
    await supabase.from('accounts').insert([{ name, type, balance: 0 }]);
    fetchData();
  };

  const handleDeleteAccount = async (id: number) => {
    if (!window.confirm("Delete this account?")) return;
    await supabase.from('accounts').delete().eq('id', id);
    fetchData();
  };

  const handleUpdateCategoryBudget = async (id: number, target: number) => {
    await supabase.from('categories').update({ budget_target: target }).eq('id', id);
    fetchData();
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4'];

  // --- TRANSACTION ACTIONS ---
  const handleEditClick = (t: any) => { setEditingId(t.id); setEditForm({ date: t.date, description: t.description, amount: t.amount.toString(), category: t.category }); };
  const handleSaveEdit = async (id: number) => {
    const selectedCat = categories.find(c => c.name === editForm.category);
    const txType = selectedCat ? selectedCat.type : 'expense';
    await supabase.from('transactions').update({ date: editForm.date, description: editForm.description, amount: parseFloat(editForm.amount), category: editForm.category, type: txType }).eq('id', id);
    setEditingId(null); fetchData(); 
  };
  const handleDeleteTx = async (id: number) => { if (window.confirm("Delete transaction?")) { await supabase.from('transactions').delete().eq('id', id); fetchData(); } };
  const toggleSelectAll = () => { if (selectedTxIds.length === processedTransactions.length) setSelectedTxIds([]); else setSelectedTxIds(processedTransactions.map(t => t.id)); };
  const toggleSelectTx = (id: number) => { if (selectedTxIds.includes(id)) setSelectedTxIds(selectedTxIds.filter(itemId => itemId !== id)); else setSelectedTxIds([...selectedTxIds, id]); };
  const handleBatchDelete = async () => { if (window.confirm(`Delete ${selectedTxIds.length} transactions?`)) { await supabase.from('transactions').delete().in('id', selectedTxIds); setSelectedTxIds([]); fetchData(); } };
  const handleBatchCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatName = e.target.value; if (!newCatName) return;
    if (window.confirm(`Update ${selectedTxIds.length} transactions to "${newCatName}"?`)) { 
      const selectedCat = categories.find(c => c.name === newCatName);
      const txType = selectedCat ? selectedCat.type : 'expense';
      await supabase.from('transactions').update({ category: newCatName, type: txType }).in('id', selectedTxIds);
      setSelectedTxIds([]); fetchData(); 
    } else { e.target.value = ""; }
  };
  const handleSort = (field: any) => { if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDirection('asc'); } };

  const getCategoryBadgeClass = (categoryName: string, type: string) => {
    if (categoryName === 'Uncategorized') return 'bg-slate-800 text-slate-400 border border-slate-600';
    if (type === 'income') return 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50';
    if (type === 'transfer') return 'bg-blue-900/50 text-blue-400 border border-blue-700/50';
    return 'bg-orange-900/50 text-orange-400 border border-orange-700/50';
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans relative z-0 pb-safe">
      <GlobalStyles />
      <MatrixBackground />

      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white">F8</div>
            <h1 className="text-xl font-bold text-slate-100 tracking-wide">Fortune8</h1>
          </div>
          
          <nav className="hidden md:flex space-x-1 border border-slate-800 rounded-lg p-1 bg-slate-900/50">
            {['portfolio', 'budgets', 'transactions'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
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
        
        {/* TAB 1: PORTFOLIO */}
        {activeTab === 'portfolio' && (
           <div key="portfolio-tab" className="space-y-6 animate-fade-slide">
               <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
                   <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Net Worth</h2>
                   <div className={`text-5xl md:text-6xl font-black tracking-tight ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {netWorth >= 0 ? '' : '-'}R {Math.abs(netWorth).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                   </div>
                   <div className="flex justify-center gap-8 mt-6">
                      <div className="text-center">
                        <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Assets</span>
                        <span className="text-xl font-bold text-emerald-500">R {totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="w-px bg-slate-800"></div>
                      <div className="text-center">
                        <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Liabilities</span>
                        <span className="text-xl font-bold text-red-500">R {totalLiabilities.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ASSETS */}
                 <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                      <h3 className="font-bold text-emerald-400">Assets</h3>
                      <button onClick={() => handleAddAccount('asset')} className="text-xs bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400 px-3 py-1.5 rounded transition-colors">+ Add Asset</button>
                    </div>
                    <div className="p-2 space-y-1">
                      {assets.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">No assets configured.</p> : assets.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-3 rounded hover:bg-slate-800/50 group transition-colors">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleDeleteAccount(a.id)} className="text-slate-600 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">&times;</button>
                            <span className="font-medium text-slate-200">{a.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-sm">R</span>
                            <input 
                              type="number" 
                              defaultValue={a.balance} 
                              onBlur={(e) => handleUpdateBalance(a.id, e.target.value)}
                              className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-emerald-400 font-medium focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* LIABILITIES */}
                 <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                      <h3 className="font-bold text-red-400">Liabilities</h3>
                      <button onClick={() => handleAddAccount('liability')} className="text-xs bg-red-900/50 hover:bg-red-800/50 text-red-400 px-3 py-1.5 rounded transition-colors">+ Add Liability</button>
                    </div>
                    <div className="p-2 space-y-1">
                      {liabilities.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">No liabilities configured.</p> : liabilities.map(a => (
                        <div key={a.id} className="flex justify-between items-center p-3 rounded hover:bg-slate-800/50 group transition-colors">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleDeleteAccount(a.id)} className="text-slate-600 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">&times;</button>
                            <span className="font-medium text-slate-200">{a.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-sm">R</span>
                            <input 
                              type="number" 
                              defaultValue={a.balance} 
                              onBlur={(e) => handleUpdateBalance(a.id, e.target.value)}
                              className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-red-400 font-medium focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
           </div>
        )}

        {/* TAB 2: BUDGETS */}
        {activeTab === 'budgets' && (
           <div key="budgets-tab" className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 animate-fade-slide">
              
              {/* MASTER BUDGET HEADER */}
              <div className="flex flex-col mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {['1M', '6M', '12M', 'ALL'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setBudgetViewMode(mode as any)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${budgetViewMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total vs Target</p>
                    <p className={`text-2xl font-bold ${totalBudgetSpend > totalBudgetTarget && totalBudgetTarget > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                      R {totalBudgetSpend.toFixed(2)} <span className="text-slate-500 text-lg">/ R {totalBudgetTarget.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {budgetViewMode !== 'ALL' ? (
                  <div className="flex justify-center items-center gap-6">
                    <button onClick={handlePrevPeriod} className="p-3 hover:bg-slate-800 rounded-full text-slate-400 hover:text-emerald-400 transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-100 min-w-[200px] md:min-w-[300px] text-center tracking-tight">
                      {periodDisplay}
                    </h2>
                    <button onClick={handleNextPeriod} className="p-3 hover:bg-slate-800 rounded-full text-slate-400 hover:text-emerald-400 transition-colors">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-2">
                    <h2 className="text-3xl font-black text-slate-100 text-center tracking-tight">All-Time History</h2>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: INTERACTIVE PIE */}
                <div className="min-h-[400px] w-full bg-slate-950 rounded-lg border border-slate-800 relative">
                  {selectedPieGroup && (
                    <button 
                      onClick={() => setSelectedPieGroup(null)} 
                      className="absolute top-4 left-4 z-10 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors shadow"
                    >
                      &larr; Show All Groups
                    </button>
                  )}
                  {budgetPieData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                      <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 12H4M12 20V4"></path></svg>
                      No expenses for this period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={budgetPieData} 
                          cx="50%" cy="50%" 
                          innerRadius={90} outerRadius={130} 
                          paddingAngle={5} dataKey="value" stroke="none"
                          onClick={(data) => setSelectedPieGroup(selectedPieGroup === data.name ? null : (data.name || null))}
                          className="cursor-pointer outline-none"
                        >
                          {budgetPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              opacity={selectedPieGroup && selectedPieGroup !== entry.name ? 0.2 : 1}
                              className="transition-opacity duration-300 outline-none hover:opacity-80"
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `R ${Number(value || 0).toFixed(2)}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: '30px' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* RIGHT: CATEGORY LIST WITH PROGRESS BARS */}
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-slate-300 mb-6 border-b border-slate-800 pb-3 uppercase tracking-widest">
                    {selectedPieGroup ? `${selectedPieGroup} Breakdown` : 'All Expense Categories'}
                  </h3>
                  
                  {budgetCategoryData.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No categories active.</p>
                  ) : (
                    <div className="space-y-6">
                      {budgetCategoryData.map(cat => {
                        const percent = cat.target > 0 ? Math.min((cat.spent / cat.target) * 100, 100) : 0;
                        const isOver = cat.target > 0 && cat.spent > cat.target;
                        
                        return (
                          <div 
                            key={cat.id} 
                            onClick={() => setHistoryModalCat(cat)}
                            className="group cursor-pointer hover:bg-slate-900 p-3 -mx-3 rounded-lg transition-colors"
                          >
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors text-base">{cat.name}</span>
                              <span className={isOver ? 'text-red-400 font-bold' : 'text-slate-400'}>
                                R {cat.spent.toFixed(2)} {cat.target > 0 ? `/ R ${cat.target.toFixed(2)}` : ''}
                              </span>
                            </div>
                            {cat.target > 0 && (
                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                                <div 
                                  className={`h-2 rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
           </div>
        )}

        {/* TAB 3: TRANSACTIONS (Dual-Render Mobile List & Desktop Table) */}
        {activeTab === 'transactions' && (
          <div key="transactions-tab" className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden relative animate-fade-slide">
            
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 min-h-[72px] gap-3">
              {selectedTxIds.length > 0 ? (
                <div className="flex w-full items-center justify-between bg-emerald-900/20 border border-emerald-500/30 p-2 rounded-lg">
                  <span className="text-emerald-400 font-medium px-2 text-sm">{selectedTxIds.length} selected</span>
                  <div className="flex space-x-3 items-center">
                    <select onChange={handleBatchCategoryChange} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded focus:ring-emerald-500 focus:border-emerald-500 block p-1.5">
                      <option value="">Move...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button onClick={handleBatchDelete} className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded text-xs sm:text-sm transition-colors font-medium border border-red-500/30">
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2">
                  <option value="All Categories">All Categories</option>
                  <option value="Uncategorized">Uncategorized Only</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              )}
            </div>

            {/* MOBILE ONLY: Sort Bar */}
            <div className="md:hidden flex justify-between items-center p-3 bg-slate-900/50 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Sort</span>
                <select value={sortField} onChange={(e) => handleSort(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded focus:ring-emerald-500 focus:border-emerald-500 p-1 outline-none">
                  <option value="date">Date</option>
                  <option value="description">Description</option>
                  <option value="category">Category</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs transition-colors">
                {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>

            {/* MOBILE LIST RENDER */}
            <div className="md:hidden divide-y divide-slate-800/50">
              {processedTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No transactions found.</div>
              ) : (
                processedTransactions.map((t) => (
                  <div key={t.id} className={`p-3 flex items-center gap-3 w-full transition-colors ${selectedTxIds.includes(t.id) ? 'bg-slate-800/80' : 'hover:bg-slate-800/30'}`}>
                    <input type="checkbox" checked={selectedTxIds.includes(t.id)} onChange={() => toggleSelectTx(t.id)} className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-600 rounded cursor-pointer shrink-0" />
                    
                    {editingId === t.id ? (
                      <div className="flex flex-col gap-2 w-full pr-1">
                        <input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full text-xs p-2 bg-slate-950 border border-slate-700 rounded text-slate-200" />
                        <input type="text" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full text-xs p-2 bg-slate-950 border border-slate-700 rounded text-slate-200" />
                        <div className="flex gap-2">
                          <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="flex-1 text-xs p-2 bg-slate-950 border border-slate-700 rounded text-slate-200">
                            <option value="Uncategorized">Uncategorized</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                          <input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} className="w-24 text-xs p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-right" />
                        </div>
                        <div className="flex gap-2 justify-end mt-1">
                          <button onClick={() => handleSaveEdit(t.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                          <span className="text-sm font-medium text-slate-200 truncate">{t.description}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{t.date}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${getCategoryBadgeClass(t.category, t.type)}`}>{t.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-400' : t.type === 'transfer' ? 'text-blue-400' : 'text-orange-400'}`}>
                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}R {Math.abs(t.amount).toFixed(2)}
                          </span>
                          <div className="flex gap-3 mt-1.5">
                            <button onClick={() => handleEditClick(t)} className="text-slate-500 hover:text-emerald-400 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                            <button onClick={() => handleDeleteTx(t.id)} className="text-slate-500 hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP TABLE RENDER */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full text-sm text-left text-slate-400 whitespace-nowrap">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">
                      <input type="checkbox" checked={processedTransactions.length > 0 && selectedTxIds.length === processedTransactions.length} onChange={toggleSelectAll} className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-600 rounded focus:ring-emerald-600 cursor-pointer" />
                    </th>
                    <th className="px-4 py-3 w-32 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('date')}>Date {sortField === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('description')}>Description {sortField === 'description' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 w-48 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('category')}>Category {sortField === 'category' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 text-right w-32 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => handleSort('amount')}>Amount {sortField === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="px-4 py-3 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">No transactions found.</td></tr>
                  ) : (
                    processedTransactions.map((t) => (
                      <tr key={t.id} className={`border-b border-slate-800 transition-colors group ${selectedTxIds.includes(t.id) ? 'bg-slate-800/80' : 'hover:bg-slate-800/50'}`}>
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" checked={selectedTxIds.includes(t.id)} onChange={() => toggleSelectTx(t.id)} className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-600 rounded cursor-pointer" />
                        </td>
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
                            <td className="px-4 py-4">{t.date}</td>
                            <td className="px-4 py-4 text-slate-300 font-medium max-w-[200px] truncate" title={t.description}>{t.description}</td>
                            <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-xs ${getCategoryBadgeClass(t.category, t.type)}`}>{t.category}</span></td>
                            <td className={`px-4 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-400' : t.type === 'transfer' ? 'text-blue-400' : t.type === 'expense' ? 'text-orange-400' : 'text-slate-300'}`}>
                              {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}R {Math.abs(t.amount).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditClick(t)} className="text-slate-400 hover:text-emerald-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button onClick={() => handleDeleteTx(t.id)} className="text-slate-400 hover:text-red-500 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
          </div>
        )}

      </main>
      
      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 z-40 flex justify-around p-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {['portfolio', 'budgets', 'transactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`capitalize flex-1 text-center py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab ? 'text-emerald-400 bg-emerald-900/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <SetupWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onComplete={handleUpdateSettings} userSettings={userSettings} />
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} categories={categories} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onRefresh={fetchData} categories={categories} userSettings={userSettings} onUpdateSettings={handleUpdateSettings} onLaunchWizard={() => setIsWizardOpen(true)} />
      <CategoryHistoryModal isOpen={!!historyModalCat} onClose={() => setHistoryModalCat(null)} category={historyModalCat} transactions={transactions} onUpdateBudget={handleUpdateCategoryBudget} />
    </div>
  );
}