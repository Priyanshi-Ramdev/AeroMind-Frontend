import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, CreditCard, Award } from 'lucide-react';

export const RetailConsole: React.FC = () => {
  const { activeRetailTransactions } = useStore();

  // 1. Hourly Revenue Accumulation
  const getHourlySales = () => {
    const hourlyRevenue: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyRevenue[i] = 0;
    }

    activeRetailTransactions.forEach((rt) => {
      if (!rt.timestamp) return;
      const hour = new Date(rt.timestamp.replace(' ', 'T')).getHours();
      hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + rt.amountUsd;
    });

    let runningSum = 0;
    return Object.entries(hourlyRevenue).map(([hour, val]) => {
      runningSum += val;
      return {
        hour: `${hour.padStart(2, '0')}:00`,
        hourlySales: Math.round(val),
        cumulativeSales: Math.round(runningSum)
      };
    });
  };



  // 3. Top Shops
  const getShopSales = () => {
    const shopSales: Record<string, number> = {};
    activeRetailTransactions.forEach((rt) => {
      const shop = rt.shopName || 'Duty Free';
      shopSales[shop] = (shopSales[shop] || 0) + rt.amountUsd;
    });

    return Object.entries(shopSales)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const hourlySalesData = getHourlySales();
  const shopSalesData = getShopSales();

  // General Metrics
  const totalSales = activeRetailTransactions.reduce((sum, item) => sum + item.amountUsd, 0);
  const totalTxCount = activeRetailTransactions.length;
  const avgTxValue = totalTxCount > 0 ? totalSales / totalTxCount : 0;
  
  // Best Shop
  const bestShop = shopSalesData[0] ? `${shopSalesData[0].name} ($${shopSalesData[0].value.toLocaleString()})` : 'N/A';

  return (
    <div className="space-y-6 p-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Total USD Revenue</span>
            <span className="text-2xl font-extrabold text-emerald-400 tracking-widest font-mono block mt-1">
              ${Math.round(totalSales).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Accumulated Sales Today</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Transactions</span>
            <span className="text-2xl font-extrabold text-white tracking-widest font-mono block mt-1">
              {totalTxCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Approved Invoices</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Average Basket Value</span>
            <span className="text-2xl font-extrabold text-white tracking-widest font-mono block mt-1">
              ${avgTxValue.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Per Ticket Average</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Busiest Store</span>
            <span className="text-sm font-bold text-amber-400 block mt-2 line-clamp-1">
              {bestShop}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Top Sales Station</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Line Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-1">Hourly Revenue Accrual Trend</h3>
            <p className="text-xs text-slate-400 mb-6">Cumulative commercial sales performance today</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlySalesData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={9} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="cumulativeSales" name="Sales ($)" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Shops Bar Chart */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-1">Top Stores by Revenue</h3>
            <p className="text-xs text-slate-400 mb-6">Sales ranking across DEL shopping terminals</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shopSalesData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={8} className="font-mono" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} className="font-mono" width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '11px' }}
                />
                <Bar dataKey="value" name="Sales ($)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Transaction Board */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white tracking-wide mb-1">Live Transaction Ledger</h3>
        <p className="text-xs text-slate-400 mb-4">Real-time invoice telemetry from terminal cashier networks</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-blue-500/10 text-slate-500">
                <th className="py-2.5">TRANSACTION ID</th>
                <th>SHOP NAME</th>
                <th>CATEGORY</th>
                <th>ITEM DESCRIPTION</th>
                <th>QTY</th>
                <th>AMOUNT (USD)</th>
                <th>PAYMENT</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5 text-slate-300">
              {activeRetailTransactions.slice(-8).reverse().map((rt) => (
                <tr key={rt.transactionId} className="hover:bg-blue-500/5 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{rt.transactionId}</td>
                  <td className="text-slate-100 font-medium">{rt.shopName}</td>
                  <td>
                    <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                      {rt.category}
                    </span>
                  </td>
                  <td>{rt.item}</td>
                  <td>{rt.quantity}</td>
                  <td className="text-emerald-400 font-bold">${rt.amountUsd.toFixed(2)}</td>
                  <td>{rt.paymentMethod}</td>
                  <td className="text-slate-400">{rt.timestamp.split(' ')[1]}</td>
                </tr>
              ))}
              {activeRetailTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500">
                    No transactions captured in current simulated time window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
