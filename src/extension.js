/**
 * Ghostly VSCode Extension
 * Editor-native memory for terminal commands
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createHash } = require('crypto');

// Storage path
const STORAGE_DIR = path.join(os.homedir(), '.ghostly');
const MEMORY_FILE = path.join(STORAGE_DIR, 'memory.json');

/**
 * Ensure storage exists
 */
function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ events: [], episodes: [] }));
  }
}

/**
 * Load memory
 */
function loadMemory() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

/**
 * Save memory
 */
function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get project hash from workspace
 */
function getProjectHash() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return 'unknown';
  
  const rootPath = workspaceFolders[0].uri.fsPath;
  return createHash('md5').update(rootPath).digest('hex').substring(0, 8);
}

/**
 * Capture command
 */
function captureCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }
  
  const selection = editor.selection;
  const command = editor.document.getText(selection);
  
  if (!command) {
    vscode.window.showWarningMessage('No text selected');
    return;
  }
  
  const memory = loadMemory();
  const projectHash = getProjectHash();
  
  const episode = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    project_hash: projectHash,
    summary: command.split(' ')[0],
    fix: command,
    keywords: command.split(' ')[0]
  };
  
  memory.episodes.push(episode);
  saveMemory(memory);
  
  vscode.window.showInformationMessage(`Saved: ${episode.summary}`);
}

/**
 * Search memories
 */
function searchMemories() {
  vscode.window.showInputBox({ prompt: 'Search memories:' }).then(query => {
    if (!query) return;
    
    const memory = loadMemory();
    const projectHash = getProjectHash();
    
    const results = memory.episodes
      .filter(e => e.project_hash === projectHash)
      .filter(e => 
        e.summary?.toLowerCase().includes(query.toLowerCase()) ||
        e.fix?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(-10);
    
    if (results.length === 0) {
      vscode.window.showInformationMessage('No memories found');
      return;
    }
    
    const items = results.reverse().map(r => ({
      label: r.summary || r.fix?.substring(0, 30),
      detail: r.fit,
      episode: r
    }));
    
    vscode.window.showQuickPick(items).then(item => {
      if (item) {
        vscode.env.clipboard.writeText(item.episode.fix);
        vscode.window.showInformationMessage('Copied to clipboard!');
      }
    });
  });
}

/**
 * Show past fixes for current project
 */
function showMemory() {
  const memory = loadMemory();
  const projectHash = getProjectHash();
  
  const episodes = memory.episodes
    .filter(e => e.project_hash === projectHash)
    .slice(-10);
  
  if (episodes.length === 0) {
    vscode.window.showInformationMessage('No memories for this project');
    return;
  }
  
  // Create webview
  const panel = vscode.window.createWebviewPanel(
    'ghostlyMemory',
    'Ghostly Memory',
    vscode.ViewColumn.Two,
    {}
  );
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: system-ui; padding: 20px; }
        h2 { color: #0078d4; }
        .episode { 
          background: #1e1e1e; 
          padding: 10px; 
          margin: 10px 0; 
          border-radius: 5px;
          cursor: pointer;
        }
        .episode:hover { background: #2d2d2d; }
        .fix { color: #4ec9b0; font-family: monospace; }
      </style>
    </head>
    <body>
      <h2>Ghostly Memory</h2>
      <p>Project: ${projectHash}</p>
      ${episodes.map((e, i) => `
        <div class="episode" onclick="copy(${i})">
          <div><strong>${e.summary}</strong></div>
          <div class="fix">${e.fix}</div>
        </div>
      `).join('')}
      <script>
        const fixes = ${JSON.stringify(episodes.map(e => e.fix))};
        function copy(i) {
          navigator.clipboard.writeText(fixes[i]);
        }
      </script>
    </body>
    </html>
  `;
  
  panel.webview.html = html;
}

/**
 * Activate extension
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('ghostly.capture', captureCommand),
    vscode.commands.registerCommand('ghostly.search', searchMemories),
    vscode.commands.registerCommand('ghostly.showMemory', showMemory)
  );
  
  vscode.window.showInformationMessage('Ghostly Memory active! (Cmd+Shift+M)');
}

/**
 * Deactivate
 */
function deactivate() {}

module.exports = { activate, deactivate };
