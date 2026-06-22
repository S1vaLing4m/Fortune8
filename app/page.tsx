"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

// --- MOCK DATA ---
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

const UploadModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [mode, setMode] = useState<'bank' | 'investment'>('bank');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-100">Add Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="flex space-x-2 mb-6 bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode('bank')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'bank' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Bank Statement</button>
          <button onClick={() => setMode('investment')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'investment' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Investment Update</button>
        </div>

        {mode === 'bank' ? (
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-emerald-500 hover:bg-slate-800/50 transition-all cursor-pointer">
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-slate-300 font-medium">Drag & drop PDF here</p>
            <p className="text-slate-500 text-sm mt-1">or click to browse</p>
          </div>
        ) : (
          <div>
            <textarea className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" placeholder="Paste raw email text or portfolio summary here..."></textarea>
            <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors">Process Text</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function Fortune8() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'budgets' | 'transactions'>('portfolio');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolioView, setPortfolioView] = useState<'overview' | 'bank' | 'investments' | 'networth'>('overview');

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

          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-900/20 transition-all flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Data</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* TAB 1: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div onClick={() => setPortfolioView('bank')} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 cursor-pointer hover:border-emerald-500/50 transition-all">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Total Bank Balance</h3>
                <p className="text-3xl font-bold text-white">R 45,230</p>
              </div>
              <div onClick={() => setPortfolioView('investments')} className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 cursor-pointer hover:border-emerald-500/50 transition-all">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Total Investments</h3>
                <p className="text-3xl font-bold text-white">R 128,400</p>
              </div>
              <div onClick={() => setPortfolioView('networth')} className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6 cursor-pointer hover:border-emerald-500 transition-all">
                <h3 className="text-emerald-400/80 text-sm font-medium mb-2">Net Worth</h3>
                <p className="text-3xl font-bold text-emerald-400">R 173,630</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 min-h-[400px]">
              {portfolioView !== 'overview' && (
                <button onClick={() => setPortfolioView('overview')} className="mb-6 text-sm text-emerald-500 hover:text-emerald-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  <span>Return to Cash Flow Overview</span>
                </button>
              )}
              
              {portfolioView === 'overview' && (
                 <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-lg">
                   <p className="text-slate-400 font-medium mb-2">Cash Flow Overview</p>
                   <p className="text-slate-600 text-sm">Interactive visualization will render here.</p>
                 </div>
              )}
              {portfolioView === 'bank' && <p className="text-slate-300">Bank Accounts drill-down list...</p>}
              {portfolioView === 'investments' && <p className="text-slate-300">Investment breakdown list...</p>}
              {portfolioView === 'networth' && <p className="text-slate-300">Capital split visualization...</p>}
            </div>
          </div>
        )}

        {/* TAB 2: BUDGETS */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
               
               <div>
                 <h2 className="text-lg font-bold text-white mb-6">Spending Breakdown</h2>
                 <div className="flex justify-center items-center h-[250px]">
                    <PieChart width={300} height={250}>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {budgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                        itemStyle={{ color: '#f1f5f9' }}
                      />
                    </PieChart>
                 </div>
               </div>

               <div>
                 <h2 className="text-lg font-bold text-white mb-6">Monthly Targets</h2>
                 <div className="space-y-6">
                   <div>
                     <div className="flex justify-between text-sm mb-2"><span className="text-slate-300">Groceries</span><span className="text-slate-400">R 3,200 / R 4,000</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '80%' }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2"><span className="text-slate-300">Dining Out (Cursive)</span><span className="text-slate-400">R 1,500 / R 1,200</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-sm mb-2"><span className="text-slate-300">Transport</span><span className="text-slate-400">R 800 / R 1,500</span></div>
                     <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '53%' }}></div></div>
                   </div>
                 </div>
               </div>

            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2">
                <option>All Categories</option>
                <option>Groceries</option>
                <option>Income</option>
              </select>
              <button className="text-sm font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">Review Uncategorized (3)</button>
            </div>
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Category</th><th className="px-6 py-3 text-right">Amount</th></tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">Jun 20</td><td className="px-6 py-4 text-slate-300 font-medium">Woolworths Olympus</td><td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs">Groceries</span></td><td className="px-6 py-4 text-right">-R 450.00</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">Jun 18</td><td className="px-6 py-4 text-slate-300 font-medium">Salary Deposit</td><td className="px-6 py-4"><span className="px-2 py-1 bg-slate-800 rounded text-xs">Income</span></td><td className="px-6 py-4 text-right text-emerald-400">+R 24,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </main>
      
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}