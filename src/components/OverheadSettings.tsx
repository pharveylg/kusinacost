import { useState } from 'react';
import { useApp, usePersistedActions, formatPeso, defaultOverheadSettings, GUIDE_DEFS } from '../store';
import type { OverheadSettings, GuideAccessMap } from '../types';

export default function OverheadSettingsView() {
  const { state, dispatch } = useApp();
  const actions = usePersistedActions();
  const s = state.overheadSettings;

  const [lpgTankPrice, setLpgTankPrice] = useState(s.lpgTankPrice.toString());
  const [lpgTankKg, setLpgTankKg] = useState(s.lpgTankKg.toString());
  const [lpgBurnRate, setLpgBurnRate] = useState(s.lpgBurnRateKgPerHr.toString());
  const [elecPerKwh, setElecPerKwh] = useState(s.electricityPerKwh.toString());
  const [laborRate, setLaborRate] = useState(s.laborRatePerHour.toString());
  const [packDefault, setPackDefault] = useState(s.packagingPerServing.toString());
  const [saved, setSaved] = useState(false);

  // Derived displays
  const lpgCostPerKg = (parseFloat(lpgTankPrice) || 0) / (parseFloat(lpgTankKg) || 1);
  const lpgCostPerHour = lpgCostPerKg * (parseFloat(lpgBurnRate) || 0);
  const dailyWage = (parseFloat(laborRate) || 0) * 8;

  function handleSave() {
    const settings: OverheadSettings = {
      lpgTankPrice: parseFloat(lpgTankPrice) || 0,
      lpgTankKg: parseFloat(lpgTankKg) || 11,
      lpgBurnRateKgPerHr: parseFloat(lpgBurnRate) || 0.8,
      electricityPerKwh: parseFloat(elecPerKwh) || 0,
      laborRatePerHour: parseFloat(laborRate) || 0,
      packagingPerServing: parseFloat(packDefault) || 0,
    };
    actions.updateOverheadSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setLpgTankPrice(defaultOverheadSettings.lpgTankPrice.toString());
    setLpgTankKg(defaultOverheadSettings.lpgTankKg.toString());
    setLpgBurnRate(defaultOverheadSettings.lpgBurnRateKgPerHr.toString());
    setElecPerKwh(defaultOverheadSettings.electricityPerKwh.toString());
    setLaborRate(defaultOverheadSettings.laborRatePerHour.toString());
    setPackDefault(defaultOverheadSettings.packagingPerServing.toString());
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', view: 'dashboard' })}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 md:text-3xl">Settings</h1>
          <p className="text-xs text-gray-500">I-setup ang rates mo para accurate ang costing</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-sm font-bold text-blue-800">Bakit importante ito?</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              Ang mga rates na ito ay gagamitin sa lahat ng recipes para ma-compute ang actual na gastos sa gas, kuryente, at labor mo. Mas accurate = mas maganda ang pricing decisions mo.
            </p>
          </div>
        </div>
      </div>

      {/* ─── LPG / Gas ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <p className="text-sm font-bold text-gray-900">LPG / Gas Settings</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Tank Price (₱)</label>
            <p className="text-[10px] text-gray-400">Magkano isang tank?</p>
            <input type="number" value={lpgTankPrice} onChange={(e) => setLpgTankPrice(e.target.value)}
              placeholder="1050" min="0"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Tank Size (kg)</label>
            <p className="text-[10px] text-gray-400">Usually 11kg or 22kg</p>
            <input type="number" value={lpgTankKg} onChange={(e) => setLpgTankKg(e.target.value)}
              placeholder="11" min="1"
              className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Burn Rate (kg/hour)</label>
          <p className="text-[10px] text-gray-400">Typical household stove: 0.6–1.0 kg/hr. High-flame commercial: 1.5+</p>
          <input type="number" value={lpgBurnRate} onChange={(e) => setLpgBurnRate(e.target.value)}
            placeholder="0.8" min="0" step="0.1"
            className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div className="bg-red-50 rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-red-600">Cost per kg of LPG</span>
            <span className="font-bold text-red-700">{formatPeso(lpgCostPerKg)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-600">Cost per hour of cooking</span>
            <span className="font-bold text-red-700">{formatPeso(lpgCostPerHour)}</span>
          </div>
        </div>
      </div>

      {/* ─── Electricity ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <p className="text-sm font-bold text-gray-900">Electricity Rate</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Rate per kWh (₱)</label>
          <p className="text-[10px] text-gray-400">Check your Meralco/electric bill. Look for "Generation + Distribution" rate.</p>
          <input type="number" value={elecPerKwh} onChange={(e) => setElecPerKwh(e.target.value)}
            placeholder="12" min="0" step="0.01"
            className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div className="bg-yellow-50 rounded-xl p-3 space-y-1">
          <p className="text-xs text-yellow-800">
            📋 Example: A 700W rice cooker running for 30 mins = <span className="font-bold">{formatPeso((700 / 1000) * 0.5 * (parseFloat(elecPerKwh) || 0))}</span>
          </p>
        </div>
      </div>

      {/* ─── Labor ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">👷</span>
          <p className="text-sm font-bold text-gray-900">Labor Rate</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Hourly Rate (₱/hour)</label>
          <p className="text-[10px] text-gray-400">Tip: Daily wage ÷ 8 hours. NCR min wage ~₱645/day = ~₱81/hr</p>
          <input type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)}
            placeholder="75" min="0" step="1"
            className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>

        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex justify-between text-xs">
            <span className="text-blue-600">Equivalent daily wage (8 hrs)</span>
            <span className="font-bold text-blue-700">{formatPeso(dailyWage)}</span>
          </div>
        </div>
      </div>

      {/* ─── Packaging Default ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <p className="text-sm font-bold text-gray-900">Default Packaging</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500">Default cost per serving (₱)</label>
          <p className="text-[10px] text-gray-400">Styro container, plastic bag, spork, etc. Can override per recipe.</p>
          <input type="number" value={packDefault} onChange={(e) => setPackDefault(e.target.value)}
            placeholder="5" min="0" step="0.5"
            className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      </div>

      {/* ─── Guide Access Control ─── */}
      <GuideAccessSection />

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={handleSave}
          className="w-full py-4 rounded-2xl text-base font-bold bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-[0.98] transition-all">
          {saved ? '✅ Saved!' : '💾 Save Settings'}
        </button>
        <button onClick={handleReset}
          className="w-full py-3 text-sm font-semibold text-gray-500 text-center">
          ↩️ Reset to Defaults
        </button>
      </div>
    </div>
  );
}

function GuideAccessSection() {
  const { state } = useApp();
  const actions = usePersistedActions();
  const guideAccess = state.guideAccess || {};
  const [savedMsg, setSavedMsg] = useState(false);
  const [newEmails, setNewEmails] = useState<Record<string, string>>({});

  function getEmails(guideId: string): string[] {
    return guideAccess[guideId] || [];
  }

  function addEmail(guideId: string) {
    const email = (newEmails[guideId] || '').trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    const current = getEmails(guideId);
    if (current.includes(email)) return;
    const updated: GuideAccessMap = { ...guideAccess, [guideId]: [...current, email] };
    actions.updateGuideAccess(updated);
    setNewEmails((prev) => ({ ...prev, [guideId]: '' }));
    flashSaved();
  }

  function removeEmail(guideId: string, email: string) {
    const current = getEmails(guideId);
    const updated: GuideAccessMap = { ...guideAccess, [guideId]: current.filter((e) => e !== email) };
    actions.updateGuideAccess(updated);
    flashSaved();
  }

  function clearRestriction(guideId: string) {
    const updated: GuideAccessMap = { ...guideAccess };
    delete updated[guideId];
    actions.updateGuideAccess(updated);
    flashSaved();
  }

  function flashSaved() {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-bold text-gray-900">Guide Access Control</p>
          <p className="text-[10px] text-gray-500">
            Restrict masterclass guides to specific email addresses. Leave empty to allow everyone.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-xs text-green-700 text-center font-semibold">
          ✅ Access updated!
        </div>
      )}

      {GUIDE_DEFS.map((guide) => {
        const emails = getEmails(guide.id);
        const isRestricted = emails.length > 0;
        return (
          <div key={guide.id} className="border border-gray-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">{guide.label}</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isRestricted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {isRestricted ? `${emails.length} allowed` : 'Open to all'}
              </span>
            </div>

            {/* Email list */}
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {emails.map((email) => (
                  <span key={email} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                    {email}
                    <button onClick={() => removeEmail(guide.id, email)} className="text-red-500 hover:text-red-700 font-bold ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Add email */}
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmails[guide.id] || ''}
                onChange={(e) => setNewEmails((prev) => ({ ...prev, [guide.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(guide.id); } }}
                placeholder="Add email address..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={() => addEmail(guide.id)}
                className="px-3 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg shrink-0 active:scale-95 transition-transform"
              >
                + Add
              </button>
            </div>

            {isRestricted && (
              <button
                onClick={() => clearRestriction(guide.id)}
                className="text-[11px] text-gray-500 hover:text-red-600 font-semibold"
              >
                🔓 Remove all restrictions (open to everyone)
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
