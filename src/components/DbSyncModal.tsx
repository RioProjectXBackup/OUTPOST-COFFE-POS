import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Cloud, 
  CloudOff, 
  Key, 
  HelpCircle, 
  Smartphone, 
  Laptop, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getStoredFirebaseConfig, saveFirebaseConfig, FirebaseConfig, isFirebaseConnected } from '../lib/firebase';

interface DbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}

export default function DbSyncModal({
  isOpen,
  onClose,
  onConfigChanged,
  isInstallable,
  onInstall
}: DbSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'firebase' | 'download'>('firebase');
  const [isConnected, setIsConnected] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Form states
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  // Load existing configuration on open
  useEffect(() => {
    if (isOpen) {
      const config = getStoredFirebaseConfig();
      if (config) {
        setApiKey(config.apiKey || '');
        setProjectId(config.projectId || '');
        setAuthDomain(config.authDomain || '');
        setStorageBucket(config.storageBucket || '');
        setMessagingSenderId(config.messagingSenderId || '');
        setAppId(config.appId || '');
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !apiKey) {
      alert('Project ID dan API Key wajib diisi!');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveFirebaseConfig(config);
    setIsConnected(true);
    onConfigChanged();
    alert('Koneksi database Firebase berhasil disimpan! Aplikasi akan menyinkronkan data secara otomatis.');
  };

  const handleDisconnect = () => {
    if (confirm('Apakah Anda yakin ingin memutuskan koneksi Firebase? Aplikasi akan kembali menggunakan penyimpanan lokal di perangkat ini.')) {
      saveFirebaseConfig(null);
      setApiKey('');
      setProjectId('');
      setAuthDomain('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setIsConnected(false);
      onConfigChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-green-900/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-brand-green-900" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
                Sinkronisasi & Unduh Aplikasi
              </h3>
              <p className="text-[11px] text-stone-500">Konfigurasi penyimpanan cloud dan instalasi POS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'firebase'
                ? 'bg-white text-brand-green-900 shadow-xs border border-stone-200/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Sinkronisasi Cloud (Firebase)</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'download'
                ? 'bg-white text-brand-green-900 shadow-xs border border-stone-200/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh POS (Instal Standalone)</span>
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
          
          {/* TAB 1: Firebase Sync config */}
          {activeTab === 'firebase' && (
            <div className="flex flex-col gap-5">
              
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isConnected 
                  ? 'bg-green-50/75 border-green-100 text-green-800' 
                  : 'bg-amber-50/75 border-amber-100 text-amber-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isConnected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isConnected ? <Cloud className="w-5 h-5 animate-pulse" /> : <CloudOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {isConnected ? 'Database Terkoneksi Cloud' : 'Mode Penyimpanan Lokal (Offline)'}
                    </h4>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {isConnected 
                        ? 'Semua data omzet, transaksi, dan menu disinkronkan secara real-time ke semua perangkat.' 
                        : 'Data hanya tersimpan di browser perangkat ini. Koneksikan Firebase agar data aman & tersinkron.'}
                    </p>
                  </div>
                </div>
                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                  >
                    Putuskan
                  </button>
                )}
              </div>

              {/* Form Config */}
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex items-center gap-1 text-xs font-extrabold text-stone-800">
                  <Key className="w-3.5 h-3.5" />
                  <span>Kredensial Firebase SDK</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Project ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: outpost-pos-123"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* API Key */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">API Key *</label>
                    <input
                      type="password"
                      required
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Auth Domain */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Auth Domain (Optional)</label>
                    <input
                      type="text"
                      placeholder="outpost-pos-123.firebaseapp.com"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all"
                    />
                  </div>

                  {/* App ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">App ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="1:123456789:web:abcdef"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Optional Advanced Collapse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Storage Bucket (Optional)</label>
                    <input
                      type="text"
                      placeholder="outpost-pos-123.appspot.com"
                      value={storageBucket}
                      onChange={(e) => setStorageBucket(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Messaging Sender ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      value={messagingSenderId}
                      onChange={(e) => setMessagingSenderId(e.target.value)}
                      className="px-3 py-2 bg-stone-50 focus:bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-xs text-brand-green-900 hover:text-brand-green-950 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Cara membuat database Firebase Gratis?</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-green-900 hover:bg-brand-green-950 text-white rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 shadow-md active:scale-98"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Hubungkan & Sinkronkan</span>
                  </button>
                </div>
              </form>

              {/* Guide Content */}
              {showGuide && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 flex flex-col gap-2 text-xs text-stone-600 leading-relaxed animate-in slide-in-from-top-2 duration-150">
                  <h5 className="font-extrabold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Panduan Setup Database Cloud Firebase:</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 ml-1">
                    <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-green-900 hover:underline font-bold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> lalu masuk dengan Akun Google Anda.</li>
                    <li>Klik <strong>"Add Project"</strong> (Tambah Proyek) dan berikan nama (misal: <code>outpost-pos</code>).</li>
                    <li>Setelah proyek siap, di menu sebelah kiri pilih <strong>Build &gt; Firestore Database</strong> lalu klik <strong>Create Database</strong>.</li>
                    <li>Pilih lokasi terdekat (misal: asia-southeast2 / Jakarta), lalu pilih <strong>"Start in Test Mode"</strong> agar aplikasi langsung bisa membaca & menulis data tanpa auth yang rumit.</li>
                    <li>Kembali ke halaman Dashboard Proyek, klik ikon <strong>"Web ( &lt;/&gt; )"</strong> untuk meregistrasikan aplikasi Anda.</li>
                    <li>Firebase akan menampilkan block kode konfigurasi SDK. Salin nilai <code>apiKey</code>, <code>projectId</code>, dll. dan tempel ke form di atas!</li>
                  </ol>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Download / PWA guide */}
          {activeTab === 'download' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row gap-5 items-center">
                <div className="w-24 h-24 rounded-2xl border border-stone-100 overflow-hidden shrink-0 shadow-lg p-2 bg-stone-50">
                  <img 
                    src="/outpost_logo.jpg" 
                    alt="Logo Outpost" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-sm font-extrabold text-stone-900">
                    Instal Aplikasi POS Outpost Coffee
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Aplikasi ini menggunakan teknologi <strong>PWA (Progressive Web App)</strong>. Anda bisa langsung mengunduh dan memasangnya di HP Android, iPhone, Tablet, maupun Laptop/PC Anda tanpa lewat App Store / Play Store. Berjalan lebih cepat, ringan, dan siap digunakan!
                  </p>
                </div>
              </div>

              {/* Install button */}
              <div className="flex flex-col items-center justify-center p-8 bg-stone-50 rounded-2xl border border-stone-150 text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-green-900/10 flex items-center justify-center text-brand-green-900">
                  <Download className="w-6 h-6 animate-bounce" />
                </div>
                
                {isInstallable ? (
                  <div className="flex flex-col items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Perangkat Anda Mendukung Instalasi Langsung!</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Klik tombol di bawah untuk mengunduh aplikasi ke perangkat ini.</p>
                    </div>
                    <button
                      onClick={() => {
                        onInstall();
                        onClose();
                      }}
                      className="px-6 py-3 bg-brand-green-900 hover:bg-brand-green-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pasang POS Outpost Coffee</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-stone-800">Siap Pasang di Layar Utama</p>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-md">
                      Jika tombol unduh tidak muncul, Anda dapat menggunakan menu bawaan browser Anda untuk menginstalnya secara manual (biasanya tombol + atau Tambah ke Layar Utama di menu browser).
                    </p>
                  </div>
                )}
              </div>

              {/* Platform Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Guide */}
                <div className="p-4 rounded-xl border border-stone-200/60 bg-white flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-800">Cara Instal di HP / Tablet</h5>
                    <ul className="text-[11px] text-stone-500 mt-1.5 space-y-1.5 list-disc list-inside">
                      <li><strong>Android (Chrome)</strong>: Tap tombol <span className="font-semibold text-stone-700">Titik Tiga</span> di kanan atas, pilih <span className="font-semibold text-stone-700">Instal Aplikasi</span>.</li>
                      <li><strong>iPhone/iPad (Safari)</strong>: Tap tombol <span className="font-semibold text-stone-700">Share / Bagikan</span> di bawah layar, scroll ke bawah dan pilih <span className="font-semibold text-stone-700">Tambahkan ke Layar Utama</span>.</li>
                    </ul>
                  </div>
                </div>

                {/* PC/Laptop Guide */}
                <div className="p-4 rounded-xl border border-stone-200/60 bg-white flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-800">Cara Instal di Laptop / Komputer</h5>
                    <ul className="text-[11px] text-stone-500 mt-1.5 space-y-1.5 list-disc list-inside">
                      <li><strong>Chrome / Edge / Opera</strong>: Klik ikon <span className="font-semibold text-stone-700">Monitor + Unduh</span> di sisi kanan bilah alamat (address bar) di bagian atas layar.</li>
                      <li>Atau buka Menu Browser &gt; pilih <span className="font-semibold text-stone-700">Instal POS Outpost Coffee</span>.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-end bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
