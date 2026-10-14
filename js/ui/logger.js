// Sistema de logs, rastreamento de erros e diagnóstico do SA Map Studio
import { $, $$, esc, toast, copyText } from './common.js';

class LoggerSystem {
  constructor() {
    this.logs = [];
    this.maxLogs = 300;
    this.errorCount = 0;
    this.storageKey = 'samapstudio_error_logs';
    this.loadPersistedLogs();
    this.installGlobalHooks();
  }

  loadPersistedLogs() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.logs = parsed.slice(-100);
          this.errorCount = this.logs.filter(l => l.level === 'ERROR').length;
        }
      }
    } catch {
      // Falha ao ler localStorage é ignorada
    }
  }

  persistLogs() {
    try {
      const toSave = this.logs.slice(-100);
      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
    } catch {
      // Ignora erro de quota do localStorage
    }
  }

  installGlobalHooks() {
    // Captura erros globais de JS
    window.addEventListener('error', (event) => {
      const err = event.error || {};
      this.record({
        level: 'ERROR',
        message: event.message || (err && err.message) || 'Erro JavaScript desconhecido',
        source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : '',
        stack: err.stack || '',
      });
    });

    // Captura rejeições de Promises não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason || {};
      const msg = typeof reason === 'string' ? reason : (reason.message || JSON.stringify(reason));
      this.record({
        level: 'ERROR',
        message: `Unhandled Promise Rejection: ${msg}`,
        source: 'Promise',
        stack: reason.stack || '',
      });
    });

    // Intercepta console.error e console.warn preservando o console original
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);

    console.error = (...args) => {
      try {
        const msg = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
        const errObj = args.find(a => a instanceof Error);
        this.record({
          level: 'ERROR',
          message: msg,
          source: 'console.error',
          stack: errObj ? errObj.stack : '',
        }, false);
      } catch {}
      origError(...args);
    };

    console.warn = (...args) => {
      try {
        const msg = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
        this.record({
          level: 'WARN',
          message: msg,
          source: 'console.warn',
        }, false);
      } catch {}
      origWarn(...args);
    };
  }

  record(entry, sendToBackend = true) {
    const time = new Date().toISOString();
    const item = {
      time,
      level: entry.level || 'INFO',
      message: String(entry.message || ''),
      source: entry.source || '',
      stack: entry.stack || '',
    };

    this.logs.push(item);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (item.level === 'ERROR') {
      this.errorCount++;
      this.updateBadge();
    }

    this.persistLogs();

    if (sendToBackend && (item.level === 'ERROR' || item.level === 'WARN')) {
      this.sendToBackend(item);
    }
  }

  sendToBackend(item) {
    try {
      fetch('/api/log_error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: item.level,
          message: item.message,
          source: item.source,
          stack: item.stack,
          url: location.href,
        }),
      }).catch(() => {});
    } catch {}
  }

  updateBadge() {
    const badge = $('#logBadge');
    if (!badge) return;
    if (this.errorCount > 0) {
      badge.textContent = this.errorCount > 99 ? '99+' : this.errorCount;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  clear() {
    this.logs = [];
    this.errorCount = 0;
    try { localStorage.removeItem(this.storageKey); } catch {}
    this.updateBadge();
    try {
      fetch('/api/logs/clear', { method: 'POST' }).catch(() => {});
    } catch {}
  }

  async buildDiagnosticReport() {
    const now = new Date().toLocaleString('pt-BR');
    const ua = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height} (janela: ${window.innerWidth}x${window.innerHeight})`;
    let cfgInfo = 'N/A';
    try {
      const cfg = await (await fetch('/api/config')).json();
      cfgInfo = JSON.stringify(cfg, null, 2);
    } catch {}

    let backendLogs = [];
    try {
      const r = await (await fetch('/api/logs')).json();
      if (r && r.lines) backendLogs = r.lines;
    } catch {}

    let rep = `=== DIAGNÓSTICO DO SA MAP STUDIO ===\n`;
    rep += `Data/Hora: ${now}\n`;
    rep += `Resolução: ${screenSize}\n`;
    rep += `Navegador/WebView: ${ua}\n`;
    rep += `Configuração do Sistema:\n${cfgInfo}\n\n`;

    rep += `=== REGISTROS DE ERROS DO FRONTEND (${this.logs.length} entradas) ===\n`;
    if (this.logs.length === 0) {
      rep += `Nenhum erro registrado no frontend.\n`;
    } else {
      for (const l of this.logs) {
        rep += `[${l.time}] [${l.level}] ${l.message}`;
        if (l.source) rep += ` (${l.source})`;
        rep += '\n';
        if (l.stack) rep += `  Stack:\n${l.stack.split('\n').map(s => '    ' + s).join('\n')}\n`;
      }
    }

    rep += `\n=== REGISTROS DO SERVIDOR LOCAL (sa-map-studio.log) ===\n`;
    if (backendLogs.length === 0) {
      rep += `Nenhum registro encontrado no servidor local.\n`;
    } else {
      rep += backendLogs.join('\n') + '\n';
    }

    return rep;
  }
}

export const AppLogger = new LoggerSystem();

export function setupLogsDialog() {
  const btnLogs = $('#btnLogs');
  const dlgLogs = $('#dlgLogs');
  const viewer = $('#logsViewer');
  const btnCopy = $('#btnCopyLogs');
  const btnClear = $('#btnClearLogs');
  const btnOpenFolder = $('#btnOpenLogsFolder');

  AppLogger.updateBadge();

  const refreshViewer = async () => {
    if (!viewer) return;
    viewer.textContent = 'Carregando registros e diagnóstico...';
    try {
      const rep = await AppLogger.buildDiagnosticReport();
      viewer.textContent = rep;
      viewer.scrollTop = viewer.scrollHeight;
    } catch (e) {
      viewer.textContent = `Erro ao carregar diagnóstico: ${e.message}`;
    }
  };

  if (btnLogs && dlgLogs) {
    btnLogs.onclick = async () => {
      dlgLogs.showModal();
      await refreshViewer();
    };
  }

  if (btnCopy) {
    btnCopy.onclick = async () => {
      const text = viewer ? viewer.textContent : await AppLogger.buildDiagnosticReport();
      await copyText(text);
      toast('Registros de erro copiados para a área de transferência!', 'ok', 3500);
    };
  }

  if (btnClear) {
    btnClear.onclick = async () => {
      AppLogger.clear();
      await refreshViewer();
      toast('Registros limpos com sucesso.', 'info', 2500);
    };
  }

  if (btnOpenFolder) {
    btnOpenFolder.onclick = async () => {
      try {
        const res = await (await fetch('/api/open_folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'logs' }),
        })).json();
        if (res.ok) {
          toast('Pasta de registros aberta no Windows Explorer.', 'ok', 3000);
        } else {
          toast(res.error || 'Não foi possível abrir a pasta.', 'warn', 3000);
        }
      } catch (e) {
        toast('Erro ao abrir pasta de registros.', 'error', 3000);
      }
    };
  }

  if (dlgLogs) {
    const closeBtns = dlgLogs.querySelectorAll('#btnCloseLogs, #btnCloseLogsX, [value="close"]');
    closeBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        try { dlgLogs.close(); } catch (_) {}
      };
    });
  }
}
