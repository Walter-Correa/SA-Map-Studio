// Sistema de logs, rastreamento de erros e diagnóstico do SA Map Studio
import { $, $$, esc, toast, copyText } from './common.js';
import { t } from './i18n.js';

function isServerRelevantError(line) {
  if (!line || typeof line !== 'string') return false;
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Ignorar banners, delimitadores e mensagens puramente informativas
  if (trimmed.startsWith('===') || trimmed.startsWith('---') || trimmed.startsWith('***')) return false;
  if (/^SA Map Studio/i.test(trimmed)) return false;
  if (/^Endereço:\s*http/i.test(trimmed)) return false;
  if (/^Pasta do (GTA|programa):/i.test(trimmed)) return false;
  if (/\[INFO\]/i.test(trimmed)) return false;
  if (/Servidor iniciado/i.test(trimmed)) return false;
  if (/Nenhum erro/i.test(trimmed)) return false;

  // Status HTTP de erro 4xx / 5xx (ex: "-> 501", "-> 404", "-> 500")
  if (/->\s*[45]\d{2}\b/.test(trimmed)) return true;

  // Tags explícitas de erro/aviso
  if (/\[(ERROR|ERRO|WARN|WARNING|AVISO|FAIL|FATAL)\]/i.test(trimmed)) return true;

  // Exceções e tracebacks do Python
  if (/^(Traceback|Exception|Error:|SyntaxError|TypeError|ValueError|IndexError|KeyError|NameError|FileNotFoundError|OSError|RuntimeError)/i.test(trimmed)) return true;
  if (/^\s*File\s+".*",\s*line\s+\d+/i.test(trimmed)) return true;

  // Palavras-chave críticas de falha
  if (/\b(erro|error|falha|failed|crash|exception)\b/i.test(trimmed)) return true;

  return false;
}

class LoggerSystem {
  constructor() {
    this.logs = [];
    this.maxLogs = 300;
    this.backendErrors = [];
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

    if (item.level === 'ERROR' || item.level === 'WARN') {
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

  async syncBackendLogs() {
    try {
      const res = await (await fetch('/api/logs')).json();
      if (res && Array.isArray(res.lines)) {
        this.backendErrors = res.lines.filter(l => isServerRelevantError(l));
        this.updateBadge();
      }
    } catch {}
  }

  get alertCount() {
    const frontendAlerts = this.logs.filter(l => l.level === 'ERROR' || l.level === 'WARN').length;
    return frontendAlerts + this.backendErrors.length;
  }

  get hasErrors() {
    const hasFrontError = this.logs.some(l => l.level === 'ERROR');
    const hasBackError = this.backendErrors.some(l => /->\s*5\d{2}\b|\[(ERROR|ERRO|FATAL)\]|Exception|Traceback/i.test(l));
    return hasFrontError || hasBackError;
  }

  updateBadge() {
    const badge = $('#logBadge');
    const btn = $('#btnLogs');
    if (!badge) return;
    const count = this.alertCount;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.hidden = false;
      if (this.hasErrors) {
        badge.style.background = '#e0533c'; // vermelho para erros
      } else {
        badge.style.background = '#f59e0b'; // âmbar para avisos
      }
      if (btn) {
        btn.title = this.hasErrors
          ? `${count} erro(s) ou alerta(s) no sistema. Clique para ver diagnóstico.`
          : `${count} aviso(s) no sistema. Clique para ver diagnóstico.`;
      }
    } else {
      badge.hidden = true;
      if (btn) {
        btn.title = 'Registros de erros e diagnóstico do sistema';
      }
    }
  }

  async clear() {
    this.logs = [];
    this.backendErrors = [];
    try { localStorage.removeItem(this.storageKey); } catch {}
    this.updateBadge();
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
    } catch {}
    this.updateBadge();
  }

  async buildDiagnosticReport() {
    await this.syncBackendLogs();

    const frontendErrors = this.logs.filter(l => l.level === 'ERROR' || l.level === 'WARN');
    const backendErrors = this.backendErrors;

    if (frontendErrors.length === 0 && backendErrors.length === 0) {
      return t('Nenhum erro foi detectado e reportado até o momento.');
    }

    const sections = [];

    if (frontendErrors.length > 0) {
      let fText = `=== ${t('ERROS E AVISOS DO FRONTEND ({0})', frontendErrors.length)} ===\n`;
      for (const l of frontendErrors) {
        fText += `[${l.time}] [${l.level}] ${l.message}`;
        if (l.source) fText += ` (${l.source})`;
        fText += '\n';
        if (l.stack) {
          fText += `  Stack:\n${l.stack.split('\n').map(s => '    ' + s).join('\n')}\n`;
        }
      }
      sections.push(fText.trimEnd());
    }

    if (backendErrors.length > 0) {
      let bText = `=== ${t('ERROS DO SERVIDOR LOCAL ({0})', backendErrors.length)} ===\n`;
      bText += backendErrors.join('\n');
      sections.push(bText.trimEnd());
    }

    return sections.join('\n\n');
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
  AppLogger.syncBackendLogs();
  setInterval(() => {
    AppLogger.syncBackendLogs();
  }, 10000);

  const refreshViewer = async () => {
    if (!viewer) return;
    viewer.textContent = t('Carregando registros e diagnóstico');
    try {
      const rep = await AppLogger.buildDiagnosticReport();
      viewer.textContent = rep;
      viewer.scrollTop = viewer.scrollHeight;
    } catch (e) {
      viewer.textContent = t('Erro ao carregar diagnóstico: {0}', e.message);
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
      toast('Registros copiados para a área de transferência!', 'ok', 3500);
    };
  }

  if (btnClear) {
    btnClear.onclick = async () => {
      await AppLogger.clear();
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
