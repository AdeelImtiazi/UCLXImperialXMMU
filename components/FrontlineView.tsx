import React, { useState } from 'react';
import { Hospital, ItemType } from '../types';
import { Wifi, WifiOff, Package, Users, Activity, RefreshCw, LayoutGrid, LayoutList } from './Icons';
import TrendChart from './TrendChart';

interface FrontlineViewProps {
  hospital: Hospital;
  isOnline: boolean;
  toggleConnection: () => void;
  onUpdateStock: (departmentId: string, itemId: string, delta: number) => void;
  onUpdatePatients: (count: number) => void;
  onUpdateSpecialists: (departmentId: string, delta: number) => void;
  pendingUpdatesCount: number;
}

// Ratios to determine max stock based on hospital patient capacity
const STOCK_RATIOS: Record<string, number> = {
  [ItemType.INSULIN]: 0.5,     
  [ItemType.ANTIBIOTICS]: 1.0, 
  [ItemType.ANESTHESIA]: 0.2,  
  [ItemType.O2]: 0.8,          
  [ItemType.FLUIDS]: 2.0,      
  [ItemType.ANALGESICS]: 1.5   
};

const FrontlineView: React.FC<FrontlineViewProps> = ({
  hospital,
  isOnline,
  toggleConnection,
  onUpdateStock,
  onUpdateSpecialists,
  pendingUpdatesCount
}) => {
  const [flashingItem, setFlashingItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'grid'>('detailed');

  const handleUpdate = (departmentId: string, itemId: string, delta: number) => {
    onUpdateStock(departmentId, itemId, delta);
    setFlashingItem(itemId);
    setTimeout(() => setFlashingItem(null), 300);
  };

  const handleRestock = (departmentId: string, itemId: string, current: number, max: number) => {
    const delta = max - current;
    if (delta > 0) {
        handleUpdate(departmentId, itemId, delta);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
      
      {/* Top Header Bar */}
      <div className={`
        p-6 rounded-3xl glass-card border border-white/60 dark:border-white/5
        flex flex-col sm:flex-row justify-between items-center gap-6 transition-all duration-300
      `}>
        <div>
          <h2 className="text-3xl font-black text-natural-800 dark:text-natural-100 flex items-center gap-3 tracking-tight">
             {hospital.name} 
             <span className="text-[10px] font-bold uppercase tracking-widest bg-sage-500/20 text-sage-700 dark:text-sage-300 px-3 py-1 rounded-full border border-sage-500/20">Pharmacy</span>
          </h2>
          <div className="mt-2 flex items-center gap-2 text-natural-500 dark:text-natural-400 text-sm font-medium">
             <div className="bg-natural-100 dark:bg-natural-800 p-1.5 rounded-full text-natural-600 dark:text-natural-300">
                <Users className="w-4 h-4" />
             </div>
             CAPACITY: <span className="text-natural-900 dark:text-white font-bold">{hospital.maxPatients} PATIENTS</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-natural-100/50 dark:bg-natural-800/50 p-1 rounded-2xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
                <button 
                    onClick={() => setViewMode('detailed')}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'detailed' ? 'bg-white dark:bg-natural-700 text-sage-600 dark:text-sage-300 shadow-sm' : 'text-natural-400 hover:text-natural-600 dark:text-natural-500'}`}
                    title="Detailed View (Trends)"
                >
                    <LayoutList className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-natural-700 text-sage-600 dark:text-sage-300 shadow-sm' : 'text-natural-400 hover:text-natural-600 dark:text-natural-500'}`}
                    title="Grid View (Rapid Entry)"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
            </div>

            {!isOnline && (
                <div className="flex items-center gap-2 text-warning bg-warning/10 px-4 py-2.5 rounded-full border border-warning/20 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                    </span>
                    <span className="text-xs font-bold hidden sm:inline">{pendingUpdatesCount} QUEUED</span>
                </div>
            )}
            
            <button 
            onClick={toggleConnection}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 border backdrop-blur-md ${
                isOnline 
                ? 'bg-sage-500/10 text-sage-700 dark:text-sage-300 border-sage-500/30 hover:bg-sage-500/20' 
                : 'bg-natural-200/50 dark:bg-natural-800 text-natural-500 dark:text-natural-400 border-natural-300 dark:border-natural-700'
            }`}
            >
            {isOnline ? <><Wifi className="w-4 h-4" /> ONLINE</> : <><WifiOff className="w-4 h-4" /> OFFLINE</>}
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-12 pb-20">
        
        {hospital.departments.map(dept => (
            <div key={dept.id} className="animate-slide-up">
                {/* Department Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pl-2">
                    <h3 className="text-xl font-bold text-natural-800 dark:text-natural-200 tracking-tight flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-sage-500 shadow-glow-sage"></span>
                      {dept.name}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-natural-200 to-transparent dark:from-natural-800"></div>
                    
                    {/* Specialist Counter Control */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/50 dark:bg-natural-800/50 border border-white/60 dark:border-white/10 shadow-sm backdrop-blur-sm self-start md:self-auto">
                        <span className="text-natural-500 dark:text-natural-400 text-[10px] font-bold uppercase tracking-wider mr-2">{dept.specialistTitle}</span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onUpdateSpecialists(dept.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-natural-100 dark:bg-natural-700 text-natural-500 hover:bg-sage-100 hover:text-sage-600 transition-colors text-sm shadow-sm"
                            >
                                -
                            </button>
                            <span className="text-natural-800 dark:text-white font-mono font-bold w-6 text-center text-lg leading-none">{dept.specialistCount}</span>
                            <button 
                                onClick={() => onUpdateSpecialists(dept.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-natural-100 dark:bg-natural-700 text-natural-500 hover:bg-sage-100 hover:text-sage-600 transition-colors text-sm shadow-sm"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
                    {dept.inventory.map((item) => {
                        const maxStock = Math.floor(hospital.maxPatients * (STOCK_RATIOS[item.name] || 1));
                        const stockPercentage = (item.quantity / maxStock) * 100;
                        
                        // Status Logic
                        const daysSupply = item.quantity / item.dailyUsageRate;
                        const isCritical = daysSupply < 2;
                        const isLow = daysSupply < 5 && !isCritical;
                        const isFlashing = flashingItem === item.id;

                        // Colors based on status - Adjusted for Natural Theme
                        const statusColor = isCritical ? 'bg-danger' : isLow ? 'bg-warning' : 'bg-sage-500';
                        const statusText = isCritical ? 'text-danger' : isLow ? 'text-warning' : 'text-sage-600 dark:text-sage-400';
                        const glowClass = isCritical ? 'shadow-glow-danger' : isLow ? '' : 'shadow-glow-sage';

                        return (
                        <div 
                            key={item.id} 
                            className={`group relative glass-card hover:shadow-natural transition-all duration-500 ${
                                viewMode === 'detailed' ? 'grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden' : 'rounded-3xl flex flex-col overflow-hidden'
                            } ${isCritical ? 'border-danger/30' : 'border-white/60 dark:border-white/10'}`}
                        >
                            {/* LEFT: Controls */}
                            <div className={`
                                ${viewMode === 'detailed' ? 'lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r' : 'flex-1 border-b-0'}
                                p-8 border-natural-200 dark:border-natural-700/50 flex flex-col justify-between relative transition-colors duration-300
                                ${isFlashing ? 'bg-sage-50/50 dark:bg-sage-900/20' : ''}
                            `}>
                                {/* Status Indicator Dot */}
                                <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${statusColor} ${glowClass} transition-colors duration-500`}></div>
                                {isCritical && <div className="absolute top-6 right-10 text-[10px] font-bold text-danger animate-pulse">CRITICAL</div>}
                                
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2.5 rounded-xl shadow-sm ${isCritical ? 'bg-danger/10 text-danger' : 'bg-white/80 dark:bg-natural-800 text-natural-500'}`}>
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg text-natural-800 dark:text-natural-100 tracking-tight">{item.name}</h3>
                                    </div>
                                    
                                    <div className="flex items-baseline gap-2 mt-6">
                                        <span className={`text-5xl font-medium tracking-tighter ${statusText} dark:text-white transition-colors duration-300`}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-natural-400 text-xs font-bold uppercase tracking-wider">/ {maxStock} Max</span>
                                    </div>
                                    
                                    {/* Clean Progress Bar */}
                                    <div className="w-full bg-natural-100 dark:bg-natural-800 h-2 rounded-full mt-6 overflow-hidden">
                                        <div 
                                            className={`h-full ${statusColor} transition-all duration-700 ease-out rounded-full relative`}
                                            style={{ width: `${Math.min(100, stockPercentage)}%` }}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-50"></div>
                                        </div>
                                    </div>
                                    
                                    <div className={`mt-4 text-xs font-medium flex items-center gap-1.5 ${statusText} opacity-80`}>
                                        <Activity className="w-3.5 h-3.5" />
                                        {(item.quantity / item.dailyUsageRate).toFixed(1)} Days Supply
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-6 border-t border-natural-100 dark:border-natural-800/50">
                                    <button 
                                        onClick={() => handleUpdate(dept.id, item.id, -1)}
                                        className="flex-1 bg-white dark:bg-natural-800 hover:bg-natural-50 dark:hover:bg-natural-700 text-natural-800 dark:text-natural-200 py-3 rounded-xl text-2xl font-medium transition-all border border-natural-200 dark:border-natural-700 active:scale-95 shadow-sm flex justify-center items-center"
                                    >
                                        -
                                    </button>
                                    <button 
                                        onClick={() => handleRestock(dept.id, item.id, item.quantity, maxStock)}
                                        className="flex-[2] bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-400 hover:to-sage-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-sage-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Restock
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: Trend Graph - Only shown in Detailed View */}
                            {viewMode === 'detailed' && (
                                <div className="lg:col-span-8 xl:col-span-9 p-8 bg-white/30 dark:bg-natural-900/20 min-h-[280px] relative">
                                    <TrendChart 
                                        data={item.history} 
                                        label={`${item.name} Usage Trend`} 
                                        color={isCritical ? '#D67A7A' : isLow ? '#E6B368' : '#7EAA7E'} 
                                    />
                                    
                                    {/* Inline Stats for Desktop */}
                                    <div className="absolute top-8 right-8 hidden md:flex gap-10 text-xs font-mono">
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase text-natural-400 font-bold mb-1 tracking-widest">Max Cap</span>
                                            <span className="text-natural-700 dark:text-natural-300 font-bold text-lg">{maxStock}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase text-natural-400 font-bold mb-1 tracking-widest">Avg Usage</span>
                                            <span className="text-natural-700 dark:text-natural-300 font-bold text-lg">~{item.dailyUsageRate}/d</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        ))}
        
      </div>
    </div>
  );
};

export default FrontlineView;