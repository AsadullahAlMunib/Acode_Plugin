/* Localhost + phpMyAdmin Plugin for Acode Mobile App */

class LocalhostManager {
  constructor() {
    this.id = "acode-localhost-manager";
    this.baseUrl = "";
    this.settings = {
      htdocs: "/storage/emulated/0/htdocs",
      host: "127.0.0.1",
      port: 8080
    };
    this.$container = null;
  }

  async init($page, cacheFile, cacheFileUrl) {
    this.loadSettings();
    this.registerCommands();
    this.registerSidebarApp();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(`${this.id}:settings`);
      if (saved) {
        this.settings = Object.assign(this.settings, JSON.parse(saved));
      }
    } catch (e) {
      console.error("LocalhostManager: Failed to load settings", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(`${this.id}:settings`, JSON.stringify(this.settings));
      if (window.toast) {
        window.toast("Localhost settings saved!");
      }
    } catch (e) {
      console.error("LocalhostManager: Failed to save settings", e);
    }
  }

  registerIcon() {
    if (window.acode && typeof acode.addIcon === "function") {
      acode.addIcon("localhost-icon", this.baseUrl + "icon.png");
    }
  }

  registerSidebarApp() {
    this.registerIcon();
    const sidebarApps = acode.require("sidebarApps");
    if (sidebarApps) {
      sidebarApps.add(
        "localhost-icon",
        this.id,
        "Localhost",
        (container) => {
          this.$container = container;
          this.renderUI(container);
        }
      );
    }
  }

  registerCommands() {
    if (window.editorManager && editorManager.editor) {
      editorManager.editor.commands.addCommand({
        name: "localhost_open_phpmyadmin",
        description: "Localhost: Open phpMyAdmin",
        exec: () => this.openUrl("/phpmyadmin/"),
      });
      editorManager.editor.commands.addCommand({
        name: "localhost_open_root",
        description: "Localhost: Open Server Root",
        exec: () => this.openUrl("/"),
      });
      editorManager.editor.commands.addCommand({
        name: "localhost_open_htdocs",
        description: "Localhost: Open htdocs index",
        exec: () => this.openUrl("/index.php"),
      });
    }
  }

  unregisterCommands() {
    if (window.editorManager && editorManager.editor) {
      editorManager.editor.commands.removeCommand("localhost_open_phpmyadmin");
      editorManager.editor.commands.removeCommand("localhost_open_root");
      editorManager.editor.commands.removeCommand("localhost_open_htdocs");
    }
  }

  openUrl(path = "/") {
    const url = `http://${this.settings.host}:${this.settings.port}${path}`;
    try {
      if (window.acode && typeof acode.exec === "function") {
        acode.exec("open-url", url);
      } else {
        window.open(url, "_blank");
      }
    } catch (e) {
      window.open(url, "_blank");
    }
  }

  copyToClipboard(text, message = "Copied to clipboard!") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (window.toast) window.toast(message);
      }).catch(() => {
        this.fallbackCopy(text, message);
      });
    } else {
      this.fallbackCopy(text, message);
    }
  }

  fallbackCopy(text, message) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      if (window.toast) window.toast(message);
    } catch (err) {
      alert("Copy failed. Text: " + text);
    }
    document.body.removeChild(textarea);
  }

  renderUI(container) {
    container.innerHTML = "";
    container.style.padding = "12px";
    container.style.overflowY = "auto";
    container.style.height = "100%";
    container.style.boxSizing = "border-box";
    container.style.color = "var(--popup-text-color, var(--secondary-text-color, #ffffff))";

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .localhost-card {
        background: var(--secondary-color, rgba(255,255,255,0.05));
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 14px;
        border: 1px solid var(--border-color, rgba(255,255,255,0.1));
      }
      .localhost-title {
        font-weight: bold;
        font-size: 15px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .localhost-label {
        font-size: 12px;
        opacity: 0.85;
        margin-bottom: 4px;
        margin-top: 8px;
      }
      .localhost-input {
        width: 100%;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--border-color, #444444);
        background: var(--primary-color, #1e1e1e);
        color: var(--popup-text-color, #ffffff);
        box-sizing: border-box;
        font-size: 13px;
      }
      .localhost-btn {
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        border: none;
        background: var(--button-background-color, #3a86ff);
        color: var(--button-text-color, #ffffff);
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .localhost-btn-secondary {
        background: var(--secondary-color, rgba(255,255,255,0.1));
        color: var(--popup-text-color, #ffffff);
        border: 1px solid var(--border-color, rgba(255,255,255,0.2));
      }
      .localhost-btn:active {
        opacity: 0.8;
      }
      .localhost-code {
        background: rgba(0,0,0,0.3);
        padding: 6px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
        margin-top: 4px;
        word-break: break-all;
        cursor: pointer;
        border: 1px dashed var(--border-color, rgba(255,255,255,0.2));
      }
      .localhost-code:hover {
        background: rgba(0,0,0,0.5);
      }
    `;
    container.appendChild(styleEl);

    const content = document.createElement("div");
    content.innerHTML = `
      <div class="localhost-card">
        <div class="localhost-title">🖥️ Server Configuration</div>

        <div class="localhost-label">htdocs Path</div>
        <input id="lh-htdocs" class="localhost-input" type="text" value="${this.settings.htdocs}" placeholder="/storage/emulated/0/htdocs"/>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
          <div>
            <div class="localhost-label">Host</div>
            <input id="lh-host" class="localhost-input" type="text" value="${this.settings.host}" placeholder="127.0.0.1"/>
          </div>
          <div>
            <div class="localhost-label">Port</div>
            <input id="lh-port" class="localhost-input" type="number" value="${this.settings.port}" placeholder="8080"/>
          </div>
        </div>

        <button id="lh-save-btn" class="localhost-btn">Save Configuration</button>
      </div>

      <div class="localhost-card">
        <div class="localhost-title">🚀 Quick Actions</div>
        <button id="lh-open-pma" class="localhost-btn">Open phpMyAdmin</button>
        <button id="lh-open-root" class="localhost-btn localhost-btn-secondary">Open Server Root</button>
        <button id="lh-open-htdocs" class="localhost-btn localhost-btn-secondary">Open htdocs index</button>
      </div>

      <div class="localhost-card">
        <div class="localhost-title">📱 Termux Helper Commands</div>
        <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px;">
          Click any command below to copy it to clipboard:
        </div>

        <div class="localhost-label">1. One-time Setup:</div>
        <div id="cmd-setup" class="localhost-code">bash ${this.settings.htdocs}/scripts/setup.sh "${this.settings.htdocs}"</div>

        <div class="localhost-label">2. Start Server (MariaDB + PHP):</div>
        <div id="cmd-start" class="localhost-code">bash ${this.settings.htdocs}/scripts/start.sh "${this.settings.htdocs}" ${this.settings.port}</div>

        <div class="localhost-label">3. Stop Server:</div>
        <div id="cmd-stop" class="localhost-code">bash ${this.settings.htdocs}/scripts/stop.sh "${this.settings.htdocs}"</div>
      </div>
    `;

    container.appendChild(content);

    // Event handlers
    content.querySelector("#lh-save-btn").onclick = () => {
      this.settings.htdocs = content.querySelector("#lh-htdocs").value.trim() || "/storage/emulated/0/htdocs";
      this.settings.host = content.querySelector("#lh-host").value.trim() || "127.0.0.1";
      this.settings.port = parseInt(content.querySelector("#lh-port").value, 10) || 8080;
      this.saveSettings();
      this.renderUI(container);
    };

    content.querySelector("#lh-open-pma").onclick = () => this.openUrl("/phpmyadmin/");
    content.querySelector("#lh-open-root").onclick = () => this.openUrl("/");
    content.querySelector("#lh-open-htdocs").onclick = () => this.openUrl("/index.php");

    content.querySelector("#cmd-setup").onclick = (e) => this.copyToClipboard(e.target.innerText, "Setup command copied!");
    content.querySelector("#cmd-start").onclick = (e) => this.copyToClipboard(e.target.innerText, "Start command copied!");
    content.querySelector("#cmd-stop").onclick = (e) => this.copyToClipboard(e.target.innerText, "Stop command copied!");
  }

  destroy() {
    this.unregisterCommands();
    const sidebarApps = acode.require("sidebarApps");
    if (sidebarApps) {
      sidebarApps.remove(this.id);
    }
  }
}

if (window.acode) {
  const localhostManager = new LocalhostManager();
  acode.setPluginInit(localhostManager.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    localhostManager.baseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    await localhostManager.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(localhostManager.id, () => {
    localhostManager.destroy();
  });
}
