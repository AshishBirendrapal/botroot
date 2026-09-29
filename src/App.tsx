import React, { useState, useEffect } from 'react';
import {
  Sprout,
  TrendingUp,
  MapPin,
  Truck,
  Calculator,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Server,
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  IndianRupee,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

interface MandiPrice {
  id: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
}

interface ComparisonResult {
  bestMandi: {
    mandi: MandiPrice;
    distanceKm: number;
    breakdown: {
      grossSale: number;
      transportCost: number;
      handlingCost: number;
      mandiCess: number;
      netRealization: number;
      effectiveRatePerQuintal: number;
    };
  };
  allMandis: Array<{
    mandi: MandiPrice;
    distanceKm: number;
    breakdown: {
      grossSale: number;
      transportCost: number;
      netRealization: number;
      effectiveRatePerQuintal: number;
    };
    isHighestNetRealization: boolean;
    rank: number;
  }>;
  recommendationSummary: string;
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'mandi' | 'calculator' | 'buyerOffers' | 'apiConsole'>('mandi');
  
  // Mandi Explorer State
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Net Realization Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcCrop, setCalcCrop] = useState<string>('Wheat');
  const [farmerDistrict, setFarmerDistrict] = useState<string>('Sitapur');
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Buyer Offers State
  const [buyerOffers, setBuyerOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // API Tester State
  const [apiResponse, setApiResponse] = useState<string>('Select an API above to test live backend endpoints.');

  // Fetch Health Check on Load
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.error('Health fetch failed', err));
  }, []);

  // Fetch Mandi Prices
  const fetchPrices = () => {
    setLoadingPrices(true);
    const params = new URLSearchParams();
    if (selectedCrop) params.append('crop', selectedCrop);
    if (selectedDistrict) params.append('district', selectedDistrict);

    fetch(`/api/mandi/prices?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPrices(data.data);
        }
      })
      .finally(() => setLoadingPrices(false));
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedDistrict]);

  // Run Net Realization Optimizer
  const runComparison = () => {
    setCalculating(true);
    fetch('/api/mandi/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: calcCrop,
        quantityQuintals: Number(calcQuantity),
        farmerDistrict: farmerDistrict,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComparisonData(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setCalculating(false));
  };

  useEffect(() => {
    if (activeTab === 'calculator') {
      runComparison();
    }
  }, [activeTab]);

  // Fetch Buyer Offers
  const fetchBuyerOffers = () => {
    setLoadingOffers(true);
    fetch('/api/buyers/offers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBuyerOffers(data.data);
        }
      })
      .finally(() => setLoadingOffers(false));
  };

  useEffect(() => {
    if (activeTab === 'buyerOffers') {
      fetchBuyerOffers();
    }
  }, [activeTab]);

  // Test Endpoint
  const testApi = async (method: string, path: string, body?: any) => {
    try {
      setApiResponse(`Sending ${method} request to ${path}...`);
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const res = await fetch(path, options);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-emerald-900 text-white border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-emerald-950 shadow-inner">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Mitti2Market</h1>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-800 text-amber-300 font-semibold border border-emerald-700">
                  Uttar Pradesh Backend
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Direct Agri-Commerce, APMC Mandi Intelligence & Net Realization Engine
              </p>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-200">
                Backend: <strong className="text-white">{healthStatus ? healthStatus.status : 'Connecting...'}</strong>
              </span>
              <span className="text-emerald-400">|</span>
              <span className="text-emerald-200">
                {healthStatus?.database?.mode || 'Express API Port 3000'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-emerald-800/80">
          <nav className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('mandi')}
              className={`py-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'mandi'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-emerald-200 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> UP Mandi Prices
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'calculator'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-emerald-200 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" /> Net Realization Optimizer
            </button>
            <button
              onClick={() => setActiveTab('buyerOffers')}
              className={`py-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'buyerOffers'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-emerald-200 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Direct Buyer Demands
            </button>
            <button
              onClick={() => setActiveTab('apiConsole')}
              className={`py-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'apiConsole'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-emerald-200 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" /> Live Backend API Console
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* TAB 1: Mandi Price Intelligence */}
        {activeTab === 'mandi' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filter Mandis:</span>
                </div>
                <div>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">All Crops</option>
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Paddy">Paddy / Rice (धान)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Gram">Gram / Chana (चना)</option>
                    <option value="Maize">Maize (मक्का)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Onion">Onion (प्याज)</option>
                    <option value="Jaggery (Gur)">Jaggery / Gur (गुड़)</option>
                  </select>
                </div>

                <div>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">All UP Districts</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Agra">Agra</option>
                    <option value="Meerut">Meerut</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Sitapur">Sitapur</option>
                    <option value="Farrukhabad">Farrukhabad</option>
                    <option value="Mathura">Mathura</option>
                    <option value="Muzaffarnagar">Muzaffarnagar</option>
                    <option value="Jhansi">Jhansi</option>
                    <option value="Banda">Banda</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchPrices}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  Showing {prices.length} Mandi Records
                </span>
              </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prices.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-emerald-400 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{item.commodity}</h3>
                      <p className="text-xs text-slate-500">{item.variety || 'Standard Quality'}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {item.district}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 my-3 border border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Modal Rate (APMC):</span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        ₹{item.modalPrice}
                        <span className="text-xs font-normal text-slate-500"> / Quintal</span>
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1 border-t border-slate-200/60 pt-1">
                      <span>Min: ₹{item.minPrice}</span>
                      <span>Max: ₹{item.maxPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.market}
                    </span>
                    <span>{item.arrivalDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Net Realization Optimizer Engine */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="max-w-3xl">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-400/30">
                  Decision Engine
                </span>
                <h2 className="text-2xl font-bold mt-2">
                  Mandi Net Realization & Distance Optimization Engine
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  High mandi prices don't always mean high profit. We calculate distance, transport fuel costs, APMC cess, and handling charges across UP mandis to tell you exactly where you take home the highest net earnings.
                </p>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div>
                  <label className="text-xs text-emerald-200 block mb-1 font-medium">Crop for Sale</label>
                  <select
                    value={calcCrop}
                    onChange={(e) => setCalcCrop(e.target.value)}
                    className="w-full bg-slate-900/80 border border-emerald-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Paddy">Paddy / Rice (धान)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Gram">Gram / Chana (चना)</option>
                    <option value="Maize">Maize (मक्का)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-emerald-200 block mb-1 font-medium">
                    Quantity (in Quintals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-emerald-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-emerald-200 block mb-1 font-medium">
                    Farmer's Location (UP District)
                  </label>
                  <select
                    value={farmerDistrict}
                    onChange={(e) => setFarmerDistrict(e.target.value)}
                    className="w-full bg-slate-900/80 border border-emerald-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Sitapur">Sitapur (Sidhauli)</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Agra">Agra</option>
                    <option value="Meerut">Meerut</option>
                    <option value="Varanasi">Varanasi</option>
                    <option value="Aligarh">Aligarh</option>
                    <option value="Jhansi">Jhansi</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={runComparison}
                  disabled={calculating}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  {calculating ? 'Analyzing Mandis...' : 'Find Highest Net Realization Mandi'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {comparisonData && (
              <div className="space-y-6">
                {/* #1 Recommendation Highlight Card */}
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>#1 Highest Net Realization Recommendation</span>
                  </div>

                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">
                        {comparisonData.bestMandi.mandi.market} ({comparisonData.bestMandi.mandi.district})
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Distance from {farmerDistrict}: <strong>{comparisonData.bestMandi.distanceKm} km</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase font-semibold">Take-Home Net Realization</div>
                      <div className="text-3xl font-black text-emerald-700">
                        ₹{comparisonData.bestMandi.breakdown.netRealization.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-emerald-800 font-medium">
                        Effective ₹{comparisonData.bestMandi.breakdown.effectiveRatePerQuintal} / Quintal
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-200 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 block">Gross Sale:</span>
                      <strong className="text-slate-900 text-sm">
                        ₹{comparisonData.bestMandi.breakdown.grossSale.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 block">Transport Cost:</span>
                      <strong className="text-rose-600 text-sm">
                        -₹{comparisonData.bestMandi.breakdown.transportCost.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 block">Handling & Bagging:</span>
                      <strong className="text-slate-700 text-sm">
                        -₹{comparisonData.bestMandi.breakdown.handlingCost.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                      <span className="text-slate-500 block">Mandi Cess (1.5%):</span>
                      <strong className="text-slate-700 text-sm">
                        -₹{comparisonData.bestMandi.breakdown.mandiCess.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-amber-900 italic bg-amber-100/70 p-2 rounded-lg">
                    {comparisonData.recommendationSummary}
                  </p>
                </div>

                {/* Ranked Comparison Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Complete Mandi Comparison Ranking ({comparisonData.allMandis.length} Mandis Evaluated)
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Mandi / District</th>
                          <th className="px-4 py-3">Distance</th>
                          <th className="px-4 py-3">Mandi Rate</th>
                          <th className="px-4 py-3">Gross Sale</th>
                          <th className="px-4 py-3">Transport Cost</th>
                          <th className="px-4 py-3">Net Realization</th>
                          <th className="px-4 py-3">Effective Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {comparisonData.allMandis.map((item) => (
                          <tr
                            key={item.mandi.id}
                            className={item.isHighestNetRealization ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'}
                          >
                            <td className="px-4 py-3">
                              {item.isHighestNetRealization ? (
                                <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">#1 Best</span>
                              ) : (
                                `#${item.rank}`
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div>{item.mandi.market}</div>
                              <div className="text-xs text-slate-500 font-normal">{item.mandi.district}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.distanceKm} km</td>
                            <td className="px-4 py-3 text-slate-900">₹{item.mandi.modalPrice}/Qtl</td>
                            <td className="px-4 py-3 text-slate-700">₹{item.breakdown.grossSale.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-rose-600">₹{item.breakdown.transportCost.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-emerald-700 font-bold">
                              ₹{item.breakdown.netRealization.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-slate-800">₹{item.breakdown.effectiveRatePerQuintal}/Qtl</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Direct Buyer Demands */}
        {activeTab === 'buyerOffers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Verified Agribusiness Buyer Procurement</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Farmers can sell directly to verified wholesale traders and grain processors without mandi commissions.
                  </p>
                </div>
                <button
                  onClick={fetchBuyerOffers}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOffers ? 'animate-spin' : ''}`} /> Refresh Offers
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {buyerOffers.map((offer) => (
                  <div key={offer._id} className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-lg">{offer.cropRequired}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                            {offer.variety || 'All Varieties'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{offer.companyName}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500">Offered Price</div>
                        <div className="text-xl font-black text-emerald-700">₹{offer.offeredPricePerQuintal}</div>
                        <div className="text-xs text-slate-500">per Quintal</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Target Quantity:</span>
                        <strong>{offer.quantityRequiredQuintals} Quintals</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Pickup from Farm:</span>
                        <strong className={offer.pickupProvided ? 'text-emerald-700' : 'text-amber-700'}>
                          {offer.pickupProvided ? 'Yes (Farmgate pickup)' : 'No (Farmer delivers)'}
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 mb-3">
                      <strong>Delivery Depot:</strong> {offer.deliveryLocation}
                    </div>

                    {offer.notes && (
                      <p className="text-xs text-slate-500 italic mb-4">"{offer.notes}"</p>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">Contact: {offer.buyerMobile}</span>
                      <button
                        onClick={() => alert(`Connect request initiated for ${offer.companyName} at ${offer.buyerMobile}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Contact Buyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Live Backend API Console */}
        {activeTab === 'apiConsole' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Interactive Backend API Tester</h2>
              <p className="text-sm text-slate-500 mb-4">
                Execute live requests against the Mitti2Market Express backend endpoints directly from your browser.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => testApi('GET', '/api/health')}
                  className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 transition"
                >
                  GET /api/health
                </button>
                <button
                  onClick={() => testApi('GET', '/api/docs')}
                  className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 transition"
                >
                  GET /api/docs
                </button>
                <button
                  onClick={() => testApi('GET', '/api/mandi/prices?crop=Wheat&district=Lucknow')}
                  className="text-xs font-semibold px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition"
                >
                  GET /api/mandi/prices (Filtered)
                </button>
                <button
                  onClick={() => testApi('GET', '/api/mandi/commodities')}
                  className="text-xs font-semibold px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition"
                >
                  GET /api/mandi/commodities
                </button>
                <button
                  onClick={() =>
                    testApi('POST', '/api/mandi/calculate-net-realization', {
                      mandiRate: 2480,
                      quantityQuintals: 100,
                      distanceKm: 45,
                      freightRatePerKmQuintal: 2.5,
                      handlingChargePerQuintal: 25,
                      mandiCessPercent: 1.5,
                    })
                  }
                  className="text-xs font-semibold px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition"
                >
                  POST /api/mandi/calculate-net-realization
                </button>
                <button
                  onClick={() =>
                    testApi('POST', '/api/auth/login', {
                      mobile: '9876543210',
                      password: 'farmer123',
                    })
                  }
                  className="text-xs font-semibold px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg transition"
                >
                  POST /api/auth/login (Farmer Demo)
                </button>
                <button
                  onClick={() =>
                    testApi('POST', '/api/auth/login', {
                      mobile: '9000000000',
                      password: 'admin123',
                    })
                  }
                  className="text-xs font-semibold px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg transition"
                >
                  POST /api/auth/login (Admin Demo)
                </button>
              </div>

              {/* Console Output */}
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 shadow-inner">
                <pre>{apiResponse}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Mitti2Market - Uttar Pradesh Agriculture Market Integration Backend • Running on Port 3000
      </footer>
    </div>
  );
}
