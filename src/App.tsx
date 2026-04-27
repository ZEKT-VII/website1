import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, ReactNode, MutableRefObject } from 'react';
import { 
  Terminal, 
  Sliders, 
  Radio, 
  Shield, 
  Cpu, 
  Tornado, 
  Waves, 
  RefreshCw, 
  Activity, 
  History, 
  User,
  Wifi,
  AlertTriangle,
  Play,
  RotateCcw,
  X,
  Power,
  Radar,
  Zap,
  AlertCircle,
  TrendingUp,
  Lock,
  Trash2,
  Copy,
  WifiOff,
  Gamepad2
} from 'lucide-react';
import { SystemMode } from './types';

import { DynamicBackground } from './DynamicBackground';
import { useSystemData } from './hooks/useSystemData';

import { RetroGameView } from './RetroGame';

export default function App() {
  const [mode, setMode] = useState<SystemMode>(SystemMode.CORE_FLUX);
  const [booting, setBooting] = useState(true);
  const [isMeltdown, setIsMeltdown] = useState(false);
  const [isShattered, setIsShattered] = useState(false);
  const [gravityForce, setGravityForce] = useState(0.5);
  const [isGravityNullified, setIsGravityNullified] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE' | 'SLOW'>('ONLINE');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const vortexRef = useRef({ x: 0, y: 0, isDragging: false });

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('OFFLINE');
      } else {
        const conn = (navigator as any).connection;
        if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g' || conn.rtt > 500)) {
          setNetworkStatus('SLOW');
        } else {
          setNetworkStatus('ONLINE');
        }
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const conn = (navigator as any).connection;
    if (conn) {
        conn.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (conn) {
          conn.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const triggerMeltdown = () => {
    setIsMeltdown(true);
    setTimeout(() => setIsMeltdown(false), 3000);
  };

  const triggerShatter = () => {
    setIsShattered(true);
    setTimeout(() => setIsShattered(false), 2000);
  };

  if (booting) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center font-display uppercase tracking-[1em]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-primary text-4xl font-black"
        >
          Initializing_Sequence
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen selection:bg-primary selection:text-black font-sans relative overflow-hidden ${isMeltdown ? 'animate-pulse invert grayscale contrast-200' : ''}`}>
      <div className="crt-overlay" />
      <div className="scanline" />
      <div className="wireframe-grid" />
      <DynamicBackground isMeltdown={isMeltdown} mode={mode} gravityForce={gravityForce} isGravityNullified={isGravityNullified} vortexRef={vortexRef} />

      {isShattered && (
        <div className="fixed inset-0 z-[100] grid grid-cols-8 grid-rows-8 pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
          {Array.from({ length: 64 }).map((_, i) => {
            const clipPaths = [
              "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              "polygon(20% 0, 100% 10%, 80% 100%, 0 80%)",
              "polygon(0 20%, 80% 0, 100% 80%, 20% 100%)",
              "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              "polygon(10% 10%, 90% 20%, 80% 90%, 20% 80%)"
            ];
            const randomClipPath = clipPaths[Math.floor(Math.random() * clipPaths.length)];
            return (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 }}
                animate={{ 
                  scale: [1, Math.random() * 0.5 + 0.5], 
                  opacity: [1, 0.8, 0], 
                  x: (Math.random() - 0.5) * window.innerWidth * 1.5, 
                  y: Math.random() * window.innerHeight + window.innerHeight * 0.2,
                  rotateX: (Math.random() - 0.5) * 720,
                  rotateY: (Math.random() - 0.5) * 720,
                  rotateZ: (Math.random() - 0.5) * 720
                }}
                transition={{ duration: 1.5 + Math.random() * 0.5, ease: "easeIn" }}
                className="bg-primary/20 border-2 border-primary backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,65,0.8)]"
                style={{ clipPath: randomClipPath }}
              />
            )
          })}
        </div>
      )}

      <motion.div 
        animate={{ opacity: isShattered ? 0 : 1, scale: isShattered ? 1.05 : 1, filter: isShattered ? 'blur(10px)' : 'blur(0px)' }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="pointer-events-auto w-full h-full">
          {/* TopAppBar */}
      {mode !== SystemMode.RETRO_GAME && (
      <nav className="fixed top-0 w-full h-12 z-50 flex justify-between items-center px-6 bg-black/90 backdrop-blur-md border-b-2 border-primary">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1], x: isMeltdown ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: isMeltdown ? 0.1 : 2, repeat: Infinity }}
            className="text-2xl font-black text-primary font-display tracking-tight"
          >
            PURE AURA
          </motion.div>
        </div>
        <div className="flex items-center gap-4 text-primary">
          <div className="flex items-center gap-2 px-3 py-1 border border-primary/30 mr-2" title="Network Status">
            {networkStatus === 'OFFLINE' ? (
              <WifiOff className="w-4 h-4 text-error" />
            ) : (
              <Wifi className={`w-4 h-4 ${networkStatus === 'SLOW' ? 'text-primary-dim' : 'text-primary'}`} />
            )}
            <span className={`text-[10px] font-bold font-mono tracking-wider ${networkStatus === 'OFFLINE' ? 'text-error' : networkStatus === 'SLOW' ? 'text-primary-dim' : 'text-primary'}`}>
              {networkStatus}
            </span>
          </div>
          <Radio 
            onClick={() => setShowRadar(!showRadar)}
            className={`w-5 h-5 cursor-pointer p-0.5 transition-colors ${showRadar ? 'bg-primary text-black' : 'hover:bg-primary hover:text-black'}`} 
          />
          <Sliders 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-5 h-5 cursor-pointer p-0.5 transition-colors ${showSettings ? 'bg-primary text-black' : 'hover:bg-primary hover:text-black'}`} 
          />
          <Terminal 
            onClick={() => setShowTerminal(!showTerminal)}
            className={`w-5 h-5 cursor-pointer p-0.5 transition-colors ${showTerminal ? 'bg-primary text-black' : 'hover:bg-primary hover:text-black'}`} 
          />
          <button 
            onClick={triggerShatter}
            className="cyber-button text-[10px] py-1 h-8"
          >EMERGENCY_SHATTER</button>
        </div>
      </nav>
      )}

      {/* SideNavBar */}
      {mode !== SystemMode.RETRO_GAME && (
      <aside className="fixed left-0 top-12 w-48 h-[calc(100vh-32px)] z-40 bg-black border-r-2 border-primary flex flex-col font-display text-[10px] font-bold uppercase tracking-wider">
        <div className="p-4 border-b border-primary/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center overflow-hidden">
               <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <div className="text-primary font-black truncate">OPERATOR_01</div>
               <div className="text-[8px] text-primary/70 truncate">SYS_STATUS: {isMeltdown ? 'MELTDOWN' : 'ACTIVE'}</div>
            </div>
          </div>
          <button 
            onClick={triggerMeltdown}
            className={`w-full mt-2 cyber-button text-[8px] py-1 ${isMeltdown ? 'animate-bounce !bg-error !text-black' : ''}`}
          >EMERGENCY_OVERRIDE</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavItem 
            active={mode === SystemMode.CORE_FLUX} 
            onClick={() => setMode(SystemMode.CORE_FLUX)}
            icon={<Terminal size={14} />}
            label="CORE_FLUX"
          />
          <NavItem 
            active={mode === SystemMode.NEURAL_SYNC} 
            onClick={() => setMode(SystemMode.NEURAL_SYNC)}
            icon={<Cpu size={14} />}
            label="NEURAL_SYNC"
          />
          <NavItem 
            active={mode === SystemMode.GRAVITY_NULL} 
            onClick={() => setMode(SystemMode.GRAVITY_NULL)}
            icon={<Waves size={14} />}
            label="GRAVITY_NULL"
          />
          <NavItem 
            active={mode === SystemMode.VORTEX_MGR} 
            onClick={() => setMode(SystemMode.VORTEX_MGR)}
            icon={<Tornado size={14} />}
            label="VORTEX_MGR"
          />
          <NavItem 
            active={mode === SystemMode.REALITY_SYNC} 
            onClick={() => setMode(SystemMode.REALITY_SYNC)}
            icon={<RefreshCw size={14} />}
            label="REALITY_SYNC"
          />
          <NavItem 
            active={mode === SystemMode.RETRO_GAME} 
            onClick={() => setMode(SystemMode.RETRO_GAME)}
            icon={<Gamepad2 size={14} />}
            label="RETRO_GAME"
          />
        </div>

        <div className="p-2 border-t border-primary/30 space-y-1">
          <div onClick={() => setShowDiagnostics(true)} className="flex items-center gap-2 p-2 text-primary/70 hover:bg-primary/20 cursor-pointer">
            <Activity size={12} />
            <span>DIAGNOSTICS</span>
          </div>
          <div onClick={() => setShowLogs(true)} className="flex items-center gap-2 p-2 text-primary/70 hover:bg-primary/20 cursor-pointer">
            <History size={12} />
            <span>LOGS</span>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className={`${mode === SystemMode.RETRO_GAME ? 'w-full h-full' : 'ml-48 mt-12 mb-8 h-[calc(100vh-80px)] p-6'} overflow-y-auto relative z-10`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {mode === SystemMode.CORE_FLUX && <CoreFluxView />}
            {mode === SystemMode.NEURAL_SYNC && <NeuralSyncView />}
            {mode === SystemMode.GRAVITY_NULL && <GravityNullView gravityForce={gravityForce} isGravityNullified={isGravityNullified} setGravityForce={setGravityForce} setIsGravityNullified={setIsGravityNullified} />}
            {mode === SystemMode.VORTEX_MGR && <VortexMgrView vortexRef={vortexRef} />}
            {mode === SystemMode.REALITY_SYNC && <RealitySyncView />}
            {mode === SystemMode.RETRO_GAME && <RetroGameView setMode={setMode} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Radar Overlay */}
      <AnimatePresence>
        {showRadar && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-16 right-6 w-48 h-48 bg-black/60 border border-primary/50 rounded-full z-40 overflow-hidden pointer-events-none"
          >
             <div className="absolute inset-0 rounded-full border border-primary/30 m-4"></div>
             <div className="absolute inset-0 rounded-full border border-primary/10 m-8"></div>
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-primary/20"></div>
             <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-primary/20"></div>
             
             {/* Radar Sweep */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
               className="absolute top-1/2 left-1/2 w-24 h-24 origin-top-left"
               style={{ background: 'conic-gradient(from 180deg at 0 0, rgba(0,255,65,0.4) 0deg, transparent 60deg)' }}
             />

             {/* Blips */}
             <motion.div 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 1] }}
               className="absolute top-10 left-12 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,65,1)]"
             />
             <motion.div 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 1], delay: 1 }}
               className="absolute bottom-16 right-10 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,65,1)]"
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-12 right-0 bottom-8 w-64 bg-black/95 border-l-2 border-primary z-40 p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-primary/30 pb-2 text-primary">
              <span className="uppercase font-bold tracking-widest text-[10px]">SYS_PREFERENCES</span>
              <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setShowSettings(false)} />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase">CRT_OVERLAY</div>
                <div className="flex gap-2">
                  <button className="flex-1 cyber-button !bg-primary !text-black py-1 text-[10px]">ON</button>
                  <button className="flex-1 cyber-button hover:!bg-primary/20 py-1 text-[10px]">OFF</button>
                </div>
              </div>
              
              <div>
                <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase">SCANLINES_INTENSITY</div>
                <input type="range" className="w-full h-1 bg-primary/20 appearance-none outline-none" min="0" max="100" defaultValue="50" />
              </div>
              
              <div>
                <div className="font-mono text-[10px] text-primary/70 mb-2 uppercase">AUDIO_FEEDBACK</div>
                <div className="flex gap-2">
                  <button className="flex-1 cyber-button py-1 text-[10px] hover:!bg-primary/20">ON</button>
                  <button className="flex-1 cyber-button !bg-primary !text-black py-1 text-[10px]">OFF</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Overlay */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-48 right-0 h-48 bg-black/90 border-t-2 border-primary z-40 p-4 font-mono text-xs text-primary/80 overflow-y-auto cyber-border"
          >
            <div className="flex justify-between items-center mb-2 border-b border-primary/30 pb-2">
              <span className="uppercase font-bold tracking-widest text-[10px]">Developer Console</span>
              <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setShowTerminal(false)} />
            </div>
            <div className="space-y-1">
              <div><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> SYS_BOOT_SEQ_INIT</div>
              <div><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> KERNEL LOADED TO 0x4F2A</div>
              <div><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> ESTABLISHING UPLINK... OK.</div>
              <div className="flex gap-2">
                <span className="text-primary font-bold">&gt;</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {mode !== SystemMode.RETRO_GAME && (
      <footer className="fixed bottom-0 w-full h-8 z-50 flex justify-between items-center px-4 bg-black border-t-2 border-primary font-mono text-[10px] text-primary/70">
        <div className="pulse-text font-bold">©2024 PURE_AURA // HW_MONITOR: 42.8GHz // TEMP: 31K</div>
        <div className="flex items-center gap-4">
          <FooterItem defaultValue="MEM_ADDR: 0x4F2A" />
          <FooterItem defaultValue="STACK_STATUS: OK" isAlert />
          <FooterItem defaultValue="KERNEL_V: 1.0.4" />
        </div>
      </footer>
      )}
        </div>
      </motion.div>

      {/* Diagnostics Modal */}
      <AnimatePresence>
        {showDiagnostics && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
          >
            <div className="bg-black/90 border-2 border-primary w-full max-w-2xl h-96 cyber-border flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-primary/30">
                 <div className="flex items-center gap-2 text-primary">
                    <Activity size={16} />
                    <span className="font-display font-bold text-sm tracking-widest uppercase">System Diagnostics</span>
                 </div>
                 <X className="w-5 h-5 cursor-pointer text-primary hover:text-white" onClick={() => setShowDiagnostics(false)} />
              </div>
              <div className="flex-1 p-6 flex items-center justify-center">
                 <div className="text-primary/50 font-mono text-xs uppercase animate-pulse">Running advanced diagnostic sweeps... (TBD)</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs Modal */}
      <AnimatePresence>
        {showLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
          >
            <div className="bg-black/90 border-2 border-primary w-full max-w-2xl h-96 cyber-border flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-primary/30">
                 <div className="flex items-center gap-2 text-primary">
                    <History size={16} />
                    <span className="font-display font-bold text-sm tracking-widest uppercase">Event Logs</span>
                 </div>
                 <X className="w-5 h-5 cursor-pointer text-primary hover:text-white" onClick={() => setShowLogs(false)} />
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-2">
                 <div className="text-primary/50 font-mono text-xs uppercase">Recent events will be logged here.</div>
                 {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="font-mono text-[10px] text-primary/70">
                       <span className="opacity-50">[{new Date(Date.now() - i * 100000).toLocaleTimeString()}]</span> EVENT_LOG_{i} - NORMAL
                    </div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FooterItem({ defaultValue, isAlert }: { defaultValue: string, isAlert?: boolean }) {
  const [text, setText] = useState(defaultValue);
  
  const handleClick = () => {
    setText("COPIED!");
    setTimeout(() => setText(defaultValue), 1000);
  };
  
  return (
    <span 
      onClick={handleClick}
      className={`hover:text-white cursor-pointer uppercase transition-colors ${isAlert ? 'text-primary animate-pulse' : ''}`}
    >
      {text}
    </span>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-primary/30 transition-all ${
        active 
        ? 'bg-primary text-black font-black' 
        : 'text-primary hover:bg-primary/20'
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

// --- Views ---

function CoreFluxView() {
  const sysData = useSystemData();
  const [cmdInput, setCmdInput] = useState('');
  const [cmdOutput, setCmdOutput] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExec = () => {
    if (!cmdInput.trim()) return;
    const lowerCmd = cmdInput.trim().toLowerCase();
    if (lowerCmd === 'clear') {
      setCmdOutput(null);
    } else if (lowerCmd === 'ping') {
      setCmdOutput('PONG: 4ms');
    } else {
      setCmdOutput(`UNKNOWN COMMAND: ${cmdInput}`);
    }
    setCmdInput('');
  };

  const getHeapPercentage = () => {
    if (!sysData.usedJSHeapSize || !sysData.jsHeapSizeLimit) return 0;
    return (sysData.usedJSHeapSize / sysData.jsHeapSizeLimit) * 100;
  };

  const cpuLoadSim = Math.floor(Math.random() * 20) + 10; // keep a bit of random for CPU since we can't get actual load

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b-2 border-primary pb-2">
        <div>
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter">CORE_FLUX DASHBOARD</h1>
          <p className="terminal-text text-primary/70 mt-1">MAIN_PROCESS_THREAD // UID: {sysData.platform.substring(0, 10).toUpperCase()} // ACTIVE_STREAMS: {sysData.resourceLogs.length}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] text-primary uppercase animate-pulse">SYS_LINK: {sysData.networkType.toUpperCase()}</div>
          <div className="font-mono text-xs mt-1 uppercase">CORES: {sysData.cpuCores}</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        <Panel className="col-span-8 row-span-2" title="SYS_OVERVIEW // GLOBAL_STATE" meta={sysData.deviceMemory ? `${sysData.deviceMemory}GB RAM` : '0x00A1'}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="EST_CPU_LOAD" val={`${cpuLoadSim}%`} progress={cpuLoadSim} />
            <StatCard label="MEM_HEAP" val={sysData.usedJSHeapSize ? formatBytes(sysData.usedJSHeapSize) : 'N/A'} progress={getHeapPercentage()} />
            <StatCard label="DOWNLINK" val={sysData.networkDownlink.toString()} progress={parseInt(sysData.networkDownlink) > 0 ? (parseInt(sysData.networkDownlink) / 10) * 100 : 0} />
          </div>
          <div className="flex-1 sub-panel-border relative overflow-hidden bg-black flex flex-col h-48">
             <div className="p-2 border-b border-primary/30 font-mono text-[10px] uppercase flex justify-between">
               <span>NETWORK_RESOURCE_STREAM</span>
               <span>RTT: {sysData.networkRtt}</span>
             </div>
             <div className="flex-1 p-4 flex items-end gap-1 overflow-x-hidden">
               {sysData.resourceLogs.map((log, i) => (
                 <motion.div 
                   key={i + log.name}
                   initial={{ height: 0 }}
                   animate={{ height: `${Math.min((log.duration / 1000) * 100 + 5, 100)}%` }}
                   transition={{ duration: 0.5 }}
                   className={`flex-1 min-w-2 border-t border-primary ${log.duration > 500 ? 'bg-error/80 border-error' : 'bg-primary/40'}`}
                   title={`${log.name}\n${log.duration.toFixed(2)}ms`}
                 />
               ))}
             </div>
          </div>
        </Panel>

        <Panel className="col-span-4 row-span-2 flex flex-col" title="SYS_ENV // BROWSER_DATA" meta="USER_AGENT">
          <div className="flex-1 space-y-2 overflow-y-auto mb-4 p-2">
            <div className="text-[10px] font-mono text-primary/80 break-all mb-4 border-b border-primary/20 pb-2">
              {sysData.userAgent}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="border border-primary/20 p-2">
                <div className="opacity-50">PLATFORM</div>
                <div className="text-primary truncate">{sysData.platform || 'UNKNOWN'}</div>
              </div>
              <div className="border border-primary/20 p-2">
                <div className="opacity-50">LOGICAL_CORES</div>
                <div className="text-primary">{sysData.cpuCores}</div>
              </div>
              <div className="border border-primary/20 p-2">
                <div className="opacity-50">LOCAL_STORAGE</div>
                <div className="text-primary">{formatBytes(sysData.localStorageSize)}</div>
              </div>
              <div className="border border-primary/20 p-2">
                <div className="opacity-50">SESSION_STORE</div>
                <div className="text-primary">{formatBytes(sysData.sessionStorageSize)}</div>
              </div>
              <div className="border border-primary/20 p-2">
                <div className="opacity-50">MAX_HEAP_SIZE</div>
                <div className="text-primary">{sysData.jsHeapSizeLimit ? formatBytes(sysData.jsHeapSizeLimit) : 'N/A'}</div>
              </div>
              <div className="border border-primary/20 p-2 col-span-2 mt-2">
                <div className="opacity-50 mb-2">ACTIVE_COOKIES_DETAILS ({sysData.cookies.length})</div>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {sysData.cookies.length === 0 ? <div className="text-primary/50 text-[10px]">NO_COOKIES_FOUND</div> : null}
                  {sysData.cookies.map((cookie, i) => (
                    <div key={i} className="border border-primary/10 p-2 bg-black/40 text-[10px]">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-primary break-all font-bold group-hover:text-white uppercase">{cookie.name}</div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(cookie.value)}
                          className="hover:bg-primary hover:text-black p-1 rounded transition-colors shrink-0 outline-none"
                          title="Copy Value"
                        >
                          <Copy size={10} />
                        </button>
                      </div>
                      <div className="text-primary/70 break-all mb-2 opacity-80 select-all font-mono">{cookie.value}</div>
                      <div className="flex justify-between items-end opacity-50 mt-1" style={{ fontSize: '8px' }}>
                        <span className="uppercase">DOM: {cookie.domain}</span>
                        <span className="uppercase">EXP: {cookie.expires}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-primary/30 pt-2 shrink-0">
            <div className="flex gap-2">
               <input 
                 type="text" 
                 value={cmdInput}
                 onChange={(e) => setCmdInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleExec();
                 }}
                 className="w-full bg-transparent border-b border-primary font-mono text-xs p-1 focus:outline-none placeholder-primary/30 uppercase" 
                 placeholder=">_ EXECUTE_CMD..." 
               />
               <button onClick={handleExec} className="cyber-button px-2 py-1 text-[10px]">EXEC</button>
            </div>
            {cmdOutput && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 font-mono text-[10px] text-primary"
              >
                &gt; {cmdOutput}
              </motion.div>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-auto shrink-0">
        <Panel title="LOCAL_DB // STORAGE" meta="SIZE" className="h-48">
           <div className="h-full flex flex-col justify-center p-4 gap-4">
             <div>
               <div className="flex justify-between font-mono text-[10px] opacity-50 mb-1">
                 <span>LOCAL_DB</span>
                 <span>{formatBytes(sysData.localStorageSize)}</span>
               </div>
               <div className="w-full h-2 bg-white/10"><div className="bg-primary h-full" style={{width: `${Math.min((sysData.localStorageSize / 5242880) * 100, 100)}%`}}/></div>
             </div>
             <div>
               <div className="flex justify-between font-mono text-[10px] opacity-50 mb-1">
                 <span>SESSION_CACHE</span>
                 <span>{formatBytes(sysData.sessionStorageSize)}</span>
               </div>
               <div className="w-full h-2 bg-white/10"><div className="bg-primary h-full" style={{width: `${Math.min((sysData.sessionStorageSize / 5242880) * 100, 100)}%`}}/></div>
             </div>
           </div>
        </Panel>
        <Panel title="PROCESS_CTRL // THREADS" meta="MAIN" className="h-48">
          <div className="flex flex-col gap-2 p-2">
            <button className="cyber-button flex justify-between items-center px-4" onClick={() => { localStorage.clear(); sessionStorage.clear(); }}>PURGE_CACHE <Trash2 size={14}/></button>
            <button className="cyber-button opacity-50 flex justify-between items-center px-4" onClick={() => window.location.reload()}>FORCE_REBOOT <RotateCcw size={14}/></button>
          </div>
        </Panel>
        <Panel title="NET_LOGS // RECENT" meta="RTT" className="h-48 overflow-y-auto">
           <div className="font-mono text-[10px] text-primary/70 leading-tight p-2 flex flex-col gap-1">
             {sysData.resourceLogs.slice().reverse().slice(0, 10).map((log, i) => (
               <div key={i} className="flex gap-2 border-b border-primary/10 pb-1">
                 <span className="opacity-50 shrink-0 w-12">{log.duration.toFixed(0)}ms</span>
                 <span className="truncate">{log.name.split('/').pop() || log.name}</span>
               </div>
             ))}
           </div>
        </Panel>
      </div>
    </div>
  );
}

function NeuralSyncView() {
  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b-2 border-primary pb-2">
        <h1 className="font-display font-black text-4xl uppercase tracking-tighter">NEURAL_SYNC // ACTIVE</h1>
        <div className="font-mono text-[10px] text-primary/70 flex gap-4">
          <span>BANDWIDTH: 99.8 TB/s</span>
          <span className="text-error animate-pulse">STRESS LEVEL: CRITICAL</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1">
        <Panel className="col-span-8" title="SYNAPSE_STRESS_MONITOR" meta="0x7A2F">
          <div className="space-y-6 p-4">
            <SynapseBar label="CLUSTER_A" val={45} />
            <SynapseBar label="CLUSTER_B" val={92} warning />
            <SynapseBar label="CLUSTER_C" val={12} />
          </div>
          <div className="mt-8 bg-black border border-primary/20 p-4 font-mono text-[10px] text-primary/50">
            0x0010: 4A 6F 68 6E 20 44 6F 65 00 00 00 00 00 00 00 00 <br/>
            0x0020: 4E 65 75 72 61 6C 20 4C 69 6E 6B 20 45 73 74 2E <br/>
            0x0030: <span className="text-error">FF FF FF FF 00 00 00 00 FA CE B0 0C 00 00 00 00</span>
          </div>
        </Panel>
        
        <Panel className="col-span-4" title="NEURAL_TOPOLOGY" meta="SEC: OMEGA">
           <div className="h-full relative overflow-hidden bg-black p-4">
             <div className="absolute top-4 left-4 border border-primary bg-black/80 p-2 font-mono text-[10px]">
               NODES: 14,092<br/>
               ACTIVE: 8,401<br/>
               DEAD: <span className="text-error">2</span>
             </div>
             <div className="flex items-center justify-center h-full">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                 className="w-48 h-48 border border-primary/30 rounded-full relative"
               >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-primary" />
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-primary" />
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-4 bg-primary" />
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-4 bg-primary" />
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 border border-primary/20 rounded-full"
                 />
                 <Wifi className="absolute inset-0 m-auto text-primary opacity-50" size={32} />
               </motion.div>
             </div>
           </div>
        </Panel>

        <Panel className="col-span-12" title="DATALINK_STREAM // RAW" meta="FILTER: OFF">
          <div className="p-4 h-48 overflow-y-auto space-y-2 font-mono text-xs">
            <LogEntry time="14:02:01.001" msg="INITIATING SYNC PROTOCOL 77-A... SUCCESS" />
            <LogEntry time="14:02:01.045" msg="BUFFER OVERFLOW IN SECTOR 4, DUMPING TO /DEV/NULL" />
            <LogEntry time="14:02:01.112" msg="FATAL: ANOMALY DETECTED IN CORTEX REGION. AUTO-CORRECTION FAILED." error />
            <LogEntry time="14:02:01.150" msg="RE-ROUTING NEURAL PATHWAYS... ETA 0.4s" />
            <LogEntry time="14:02:01.550" msg="PATHWAYS RE-ROUTED. STABILIZING..." />
            <LogEntry time="14:02:01.890" msg="SYNC INTEGRITY AT 99.9%. AWAITING MANUAL INPUT." />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function GravityNullView({ 
  gravityForce, 
  isGravityNullified, 
  setGravityForce, 
  setIsGravityNullified 
}: { 
  gravityForce: number; 
  isGravityNullified: boolean; 
  setGravityForce: (val: number) => void; 
  setIsGravityNullified: (val: boolean) => void; 
}) {
  const [elements, setElements] = useState([
    { id: 1, text: 'STRUCTURAL_INTEGRITY', type: 'PANEL', x: 0, y: 0, rotation: -2 },
    { id: 2, text: 'PHYSICS_ENGINE_OFFLINE', type: 'WARNING', x: 200, y: 100, rotation: 5 },
    { id: 3, text: 'IMMINENT_SEPARATION', type: 'ALERT', x: -100, y: 250, rotation: -5 },
    { id: 4, text: 'MASS_CONSTANTS_ANOMALOUS', type: 'INFO', x: 300, y: 300, rotation: 10 },
    { id: 5, text: 'Z_AXIS_DISSOLVING', type: 'PANEL', x: -200, y: -50, rotation: -8 },
  ]);

  const deployMagneticLocks = () => {
    setElements(elements.map(el => ({
      ...el,
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
      rotation: 0,
      type: 'INFO',
      text: el.text.replace('IMMINENT_', 'MITIGATED_').replace('OFFLINE', 'SYNCING').replace('DISSOLVING', 'STABLE')
    })));
  };

  return (
    <div className="h-full relative overflow-hidden cursor-move">
      <div className="absolute top-0 left-0 p-8 z-10 pointer-events-none">
        <h1 className="font-display font-black text-8xl text-error glitch" data-text="GRAVITY_NULL">GRAVITY_NULL</h1>
        <div className="flex items-center gap-4 mt-4">
           <span className="bg-error text-black px-3 py-1 font-mono text-xs font-bold uppercase">WARN_PHYSICS_ENGINE_FAIL</span>
           <span className="font-mono text-xs text-error font-bold uppercase">ERR_CODE: 0xGRAV_LOSS</span>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center relative">
         {/* Draggable bits */}
         {elements.map((el) => (
           <motion.div
             key={el.id}
             drag
             dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
             initial={{ x: el.x, y: el.y, rotate: el.rotation }}
             whileDrag={{ scale: 1.1, zIndex: 50 }}
             className={`absolute p-6 cyber-border backdrop-blur-md bg-black/60 shadow-2xl ${
               el.type === 'ALERT' ? 'border-error text-error' : 'border-primary text-primary'
             }`}
           >
             <div className="font-mono text-[10px] mb-2 opacity-50 flex justify-between">
                <span>OBJECT_ID: {el.id}</span>
                <Cpu size={10} />
             </div>
             <h2 className="font-display font-bold text-xl uppercase tracking-tighter">{el.text}</h2>
             <div className="mt-4 space-y-1">
               <div className="w-full h-1 bg-white/10 overflow-hidden">
                 <motion.div 
                   animate={{ width: `${Math.random() * 100}%` }}
                   transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror' }}
                   className={`h-full ${el.type === 'ALERT' ? 'bg-error' : 'bg-primary'}`}
                 />
               </div>
               <div className="flex justify-between font-mono text-[8px] opacity-30">
                 <span>STABILITY</span>
                 <span>FAILING</span>
               </div>
             </div>
             {el.id === 3 && (
               <button 
                 onClick={deployMagneticLocks}
                 className="mt-6 w-full bg-error text-black font-mono text-[10px] py-2 uppercase font-bold hover:bg-white"
               >
                 DEPLOY_MAGNETIC_LOCKS
               </button>
             )}
           </motion.div>
         ))}
      </div>

      <div className="absolute bottom-8 right-8 z-10 p-4 border border-primary/20 bg-black/40 backdrop-blur-sm max-w-sm">
        <h3 className="font-mono text-xs text-primary mb-2 uppercase">VECTOR_DRIFT_ANALYSIS</h3>
        <div className="flex gap-1 h-32 items-end">
           {Array.from({ length: 20 }).map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: `${Math.random() * 100}%`, backgroundColor: Math.random() > 0.8 ? '#ffb4ab' : '#00ff41' }}
               transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror', delay: i * 0.05 }}
               className="flex-1"
             />
           ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-10 p-4 border border-primary/20 bg-black/40 backdrop-blur-sm max-w-sm cyber-border">
        <h3 className="font-mono text-xs text-primary mb-4 uppercase font-bold textShadow-neon">GRAV_CONTROL_SYS</h3>
        <div className="flex flex-col gap-4">
           <div className="flex justify-between items-center font-mono text-[10px]">
              <span className="uppercase opacity-70">NULL_FIELDSTATUS</span>
              <button 
                onClick={() => setIsGravityNullified(!isGravityNullified)}
                className={`px-3 py-1 uppercase font-bold tracking-wider ${isGravityNullified ? 'bg-primary text-black' : 'bg-transparent border border-primary text-primary opacity-50 hover:opacity-100 hover:bg-primary/20'}`}
              >
                {isGravityNullified ? 'ENGAGED' : 'STANDBY'}
              </button>
           </div>
           
           <div className={`transition-opacity ${isGravityNullified ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex justify-between font-mono text-[10px] mb-2 uppercase">
               <span className="opacity-70">PULL_COEF</span>
               <span className="text-primary font-bold">{gravityForce.toFixed(2)} G</span>
             </div>
             <input 
               type="range" 
               min="0.1" 
               max="2.0" 
               step="0.1" 
               value={gravityForce}
               onChange={(e) => setGravityForce(parseFloat(e.target.value))}
               className="w-full accent-primary h-1 bg-primary/20 appearance-none cursor-pointer"
             />
             <div className="flex justify-between font-mono text-[8px] mt-1 opacity-40 uppercase">
               <span>MIN</span>
               <span>MAX</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function VortexMgrView({ vortexRef }: { vortexRef: MutableRefObject<{x: number, y: number, isDragging: boolean}> }) {
  const [isExploding, setIsExploding] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep base position updated when not dragging so things don't go out of sync
    const updatePos = () => {
       if (!vortexRef.current.isDragging && containerRef.current) {
           const rect = containerRef.current.getBoundingClientRect();
           vortexRef.current.x = rect.left + rect.width / 2;
           vortexRef.current.y = rect.top + rect.height / 2;
       }
    };
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, [vortexRef]);

  const triggerExplosion = () => {
    setIsExploding(true);
    setTimeout(() => setIsExploding(false), 1000);
  };

  return (
    <div className={`h-full flex items-center justify-center p-8 bg-black/20 relative transition-all ${isExploding ? 'scale-150 blur-lg' : ''}`}>
      {isExploding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 5] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-50 bg-white"
        />
      )}
      <div className="grid grid-cols-12 gap-8 w-full max-w-7xl h-full items-center">
        <div className="col-span-4 flex flex-col gap-6">
           <div className="font-mono text-xs text-primary/50 leading-relaxed uppercase">
             &gt; INIT VORTEX_MGR<br/>
             &gt; ALLOCATING TENSORS...<br/>
             &gt; ESTABLISHING ORBITAL LOCK<br/>
             &gt; SINGULARITY DEVIATION: 0.0034
           </div>
           
           <Panel title="NODE_ALPHA" meta="0x1A" className="mt-8">
             <div className="p-4 space-y-4">
               <div>
                 <div className="flex justify-between font-mono text-xs mb-1"><span>ENTROPY</span> <span className="text-error">94%</span></div>
                 <div className="w-full h-1 bg-white/10"><div className="bg-error h-full w-[94%]" /></div>
               </div>
               <div className="flex justify-between font-mono text-xs uppercase"><span>FLUX_CAP</span> <span className="text-primary animate-pulse">STABLE</span></div>
             </div>
           </Panel>

           <Panel title="GRAV_LENSING" meta="ACTIVE" className="mt-4">
              <div className="p-4 flex gap-1 h-12 items-end">
                {[40, 70, 20, 90, 50, 80].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                    className="flex-1 bg-primary"
                  />
                ))}
              </div>
           </Panel>
        </div>

        <div className="col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center" ref={containerRef}>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 border border-primary/20 border-dashed rounded-full"
             />
             <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-8 border border-primary/40 border-dotted rounded-full"
             />
             <motion.div 
                drag
                dragMomentum={false}
                onDragStart={() => { vortexRef.current.isDragging = true; }}
                onDrag={(e, info) => {
                   vortexRef.current.x = info.point.x;
                   vortexRef.current.y = info.point.y;
                }}
                onDragEnd={() => { vortexRef.current.isDragging = false; }}
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center text-primary group cursor-grab active:cursor-grabbing z-50 relative"
             >
               <Tornado className="w-16 h-16 mb-2 group-hover:rotate-180 transition-transform duration-500 opacity-50" />
               <span className="font-display font-black text-2xl uppercase tracking-[0.2em] opacity-50 textShadow-neon">CORE_VRTX</span>
             </motion.div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6">
          <Panel title="RAW_TELEMETRY" meta="0x4FA">
            <div className="p-4">
              <div className="font-mono text-[10px] text-primary/50 mb-1 flex justify-between"><span>MASS_INJECTION</span> <span>KG/S</span></div>
              <div className="font-display text-4xl text-primary font-black">4,892.<span className="text-xl">01</span></div>
            </div>
            <div className="p-4 border-t border-primary/20">
               <div className="font-mono text-[10px] text-primary/50 mb-1 flex justify-between"><span>EVENT_HORIZON_PROX</span> <span>MM</span></div>
               <div className="font-display text-4xl text-error font-black flex items-center gap-3">
                 <AlertCircle className="animate-pulse" /> 0.04
               </div>
               <button 
                 onClick={triggerExplosion}
                 className="w-full mt-4 cyber-button !border-error !text-error hover:!bg-error hover:!text-black"
               >INIT_EXPLOSION</button>
            </div>
          </Panel>

          <Panel title="LIVE_STREAM" meta="TAIL -F" className="flex-1">
             <div className="p-4 font-mono text-[10px] opacity-70 space-y-1">
               <div><span className="text-primary">[SYS]</span> VORTEX MGR INITIALIZED</div>
               <div><span className="text-primary">[SYS]</span> ALLOCATING ORBITAL PATHS</div>
               <div className="text-error"><span className="text-error">[ERR]</span> ANOMALY DETECTED S-7</div>
               <div><span className="text-primary">[SYS]</span> COMPENSATING...</div>
               <div><span className="text-primary">[SYS]</span> MASS INJECTION STEADY</div>
               <div><span className="text-primary">[SYS]</span> PING: 4ms</div>
             </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RealitySyncView() {
  const [logs, setLogs] = useState<string[]>([
     "[14:02:01] ERR: Grid desync detected.",
     "[14:02:05] Auto-recovery protocol initiated.",
     "[14:02:10] Beam 1 locked to node Alpha.",
     "[14:02:12] WARN: Beam 2 slippage detected.",
     "[14:02:22] Awaiting manual intervention..."
  ]);
  const [magForceS, setMagForceS] = useState(12);
  const [isSweeping, setIsSweeping] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const initiateSweep = () => {
    setIsSweeping(true);
    addLog("Initiating Tractor Sweep...");
    setTimeout(() => {
      setIsSweeping(false);
      addLog("Tractor Sweep complete. Found 2 anomalous signatures.");
    }, 2000);
  };

  const boostMagForce = () => {
    setMagForceS(prev => Math.min(100, prev + 25));
    addLog("Mag Force S boosted.");
  };

  const hardReset = () => {
    setMagForceS(0);
    addLog("HARD RESET initiated. Mag Force cleared.");
    setTimeout(() => {
      setMagForceS(12);
      addLog("System restarting... baseline established.");
    }, 1500);
  };

  const isMagStable = magForceS > 70;

  return (
    <div className="h-full flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b-2 border-primary pb-2">
        <div>
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter">REALITY_SYNC : RECOVERY</h1>
          <p className="terminal-text text-primary/70 mt-1">EXECUTING TRACTOR BEAM ALIGNMENT // MAG-FORCE STABILIZATION PROTOCOL</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 font-mono text-[10px] font-bold uppercase border ${isMagStable ? 'bg-primary text-black border-primary' : 'bg-error text-black border-error'}`}>{isMagStable ? 'SYSTEM STABLE' : 'SYSTEM UNSTABLE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        <Panel className="col-span-8 flex flex-col" title="GRID_TOPOLOGY_MONITOR" meta="0x8A42">
          <div className="flex-1 p-8 flex items-center justify-center relative bg-black/40">
             <div className="absolute inset-0 bg-primary/5 opacity-10 flex items-center justify-center">
                <Radar className={`w-64 h-64 ${isSweeping ? 'animate-spin' : 'animate-ping'}`} />
             </div>
             <div className="relative w-full h-full border border-primary/20 flex flex-col items-center justify-center gap-8">
                <RealityBeam active />
                <RealityBeam active={isMagStable} error={!isMagStable} />
                <RealityBeam active />
             </div>
             <div className={`absolute bottom-4 left-4 font-mono text-[10px] font-bold uppercase space-y-1 ${isMagStable ? 'text-primary' : 'text-error'}`}>
               <div>&gt; TRACTOR_BEAM_01: MISALIGNED (DEVIATION: 4.2rad)</div>
               <div>&gt; TRACTOR_BEAM_02: {isMagStable ? 'LOCKED' : 'SLIPPAGE'}</div>
               <div>&gt; TRACTOR_BEAM_03: SEEKING...</div>
             </div>
          </div>
          <div className="grid grid-cols-2">
             <div className="border-t border-r border-primary/20 p-4">
                <div className="flex justify-between font-mono text-[10px] mb-2"><span>MAG_FORCE_N</span> <span>ADDR: 0xMF1</span></div>
                <div className="w-full h-2 bg-white/10"><div className="h-full bg-primary w-[84%]" /></div>
                <div className="flex justify-between mt-2 font-mono text-[10px]"><span>STABILITY</span> <span className="text-primary-dim uppercase font-bold">MARGINAL</span></div>
             </div>
             <div className="border-t border-primary/20 p-4">
                <div className="flex justify-between font-mono text-[10px] mb-2"><span>MAG_FORCE_S</span> <span>ADDR: 0xMF2</span></div>
                <div className="w-full h-2 bg-white/10"><div className={`h-full ${isMagStable ? 'bg-primary' : 'bg-error'}`} style={{ width: `${magForceS}%` }} /></div>
                <div className="flex justify-between mt-2 font-mono text-[10px]"><span>STABILITY</span> <span className={`${isMagStable ? 'text-primary' : 'text-error'} uppercase font-bold animate-pulse`}>{isMagStable ? 'STABLE' : 'CRITICAL'}</span></div>
             </div>
          </div>
        </Panel>

        <div className="col-span-4 flex flex-col gap-6">
          <Panel title="RECOVERY_CTRL" meta="CMD_AUTH: REQ">
             <div className="p-4 space-y-4">
                <button onClick={initiateSweep} className="cyber-button w-full flex justify-between items-center px-4">INITIATE TRACTOR SWEEP <Radar size={14} /></button>
                <button onClick={boostMagForce} className="cyber-button w-full flex justify-between items-center px-4">BOOST MAG_FORCE_S <Zap size={14} /></button>
                <button onClick={hardReset} className="cyber-button w-full !bg-error !text-black !border-error mt-4 flex justify-between items-center px-4">FORCE HARD RESET <Power size={14} /></button>
             </div>
          </Panel>
          <Panel className="flex-1" title="SYNC_LOG" meta="TAIL -F">
            <div className="p-4 font-mono text-[10px] text-primary/60 space-y-2 overflow-y-auto max-h-64 flex flex-col-reverse">
                {logs.slice().reverse().map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className={`${log.includes('ERR') || log.includes('WARN') ? 'text-error font-bold' : ''}`}>{log}</span>
                    </div>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RealityBeam({ active, error }: { active?: boolean, error?: boolean }) {
  return (
    <div className={`w-[80%] h-0.5 relative ${active ? 'bg-primary' : 'bg-white/20'}`}>
      <motion.div 
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 transform rotate-45 ${error ? 'bg-error' : 'bg-primary'}`}
      />
      {error && (
        <motion.div 
          animate={{ opacity: [0, 1] }} 
          transition={{ duration: 0.1, repeat: Infinity, repeatType: 'mirror' }}
          className="absolute -top-12 left-1/4 h-12 w-[1px] bg-error border-l border-dashed border-error" 
        />
      )}
    </div>
  );
}

// --- Helper Components ---

function Panel({ children, title, meta, className }: { children: ReactNode, title: string, meta: string, className?: string }) {
  return (
    <div className={`cyber-border bg-black/80 backdrop-blur-sm flex flex-col ${className}`}>
      <div className="bg-primary text-black font-mono text-[10px] font-bold uppercase px-3 py-1 flex justify-between items-center shrink-0">
        <span>{title}</span>
        <span className="opacity-50">{meta}</span>
      </div>
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, val, progress }: { label: string, val: string, progress: number }) {
  return (
    <div className="border border-primary/20 p-3 bg-black/40">
      <div className="font-mono text-[10px] text-primary/70 mb-1 uppercase tracking-tight">{label}</div>
      <div className="font-display text-2xl font-black text-primary">{val}</div>
      <div className="w-full h-1 bg-white/10 mt-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
}

function AlertItem({ type, time, msg }: { type: string, time: string, msg: string }) {
  const isError = type === 'CRITICAL';
  return (
    <div className={`border border-primary/20 p-2 bg-black/20 border-l-4 ${isError ? 'border-l-error bg-error/5' : 'border-l-primary'}`}>
       <div className="flex justify-between items-center mb-1">
         <span className={`font-mono text-[10px] font-bold ${isError ? 'text-error' : 'text-primary'}`}>{type}</span>
         <span className="font-mono text-[8px] opacity-30">{time}</span>
       </div>
       <p className="font-mono text-[10px] text-primary uppercase leading-tight italic">{msg}</p>
    </div>
  );
}

function SynapseBar({ label, val, warning }: { label: string, val: number, warning?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs text-primary/70 w-24 shrink-0 uppercase">{label}</span>
      <div className="flex-1 h-4 bg-white/5 border border-primary/20 relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          className={`h-full ${warning ? 'bg-error pulse-text' : 'bg-primary'}`}
        />
      </div>
      <span className={`font-mono text-xs w-16 text-right font-bold ${warning ? 'text-error' : 'text-primary'}`}>{val}% {warning && 'WARN'}</span>
    </div>
  );
}

function LogEntry({ time, msg, error }: { time: string, msg: string, error?: boolean }) {
  return (
    <div className={`flex gap-4 border-l-2 pl-3 py-0.5 ${error ? 'border-error bg-error/5 text-error' : 'border-primary text-primary opacity-80'}`}>
       <span className="font-mono text-[10px] opacity-40 w-20 shrink-0">{time}</span>
       <span className="font-mono text-[10px] uppercase tracking-tighter">{msg}</span>
    </div>
  );
}
