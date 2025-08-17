
/* Acode plugin: Localhost + phpMyAdmin (Android)
 * This plugin provides a side panel to:
 *  - choose an htdocs folder path
 *  - show quick setup commands for Termux (one-time)
 *  - start/stop helpers (manual scripts) and open phpMyAdmin
 *
 * NOTE: Running PHP + MariaDB on Android requires native binaries.
 * This plugin does NOT embed binaries; it helps you set up Termux minimally
 * and opens http://127.0.0.1 when the server is running.
 */
 (function() {
  const PLUGIN_NS = "acode-localhost-manager";
  const STORAGE_KEY = PLUGIN_NS + ":settings";

  class LocalhostManager {
    constructor() {
      this.$panel = null;
      this.settings = {
        htdocs: "/storage/emulated/0/htdocs",
        host: "127.0.0.1",
        port: 8080
      };
    }

    async init() {
      try {
        const raw = await appSettings.value.get(STORAGE_KEY);
        if (raw) this.settings = JSON.parse(raw);
      } catch (e) {}

      this.$panel = this.createPanel();
      acode.add(sidebarApps, {
        id: PLUGIN_NS,
        name: "Localhost",
        icon: "activity",
        action: () => this.toggle()
      });
    }

    async destroy() {
      if (this.$panel) this.$panel.remove();
      acode.remove(sidebarApps, PLUGIN_NS);
    }

    toggle() {
      if (!this.$panel.isConnected) document.body.appendChild(this.$panel);
      this.$panel.classList.toggle('hidden');
    }

    save() {
      appSettings.value.set(STORAGE_KEY, JSON.stringify(this.settings));
      this.render();
    }

    openUrl(path = "/") {
      const url = `http://${this.settings.host}:${this.settings.port}${path}`;
      // open in Acode's internal browser
      try {
        acode.exec("open url", url);
      } catch (e) {
        window.open(url, "_blank");
      }
    }

    createPanel() {
      const wrap = document.createElement("div");
      wrap.id = PLUGIN_NS + "-panel";
      wrap.style.position = "fixed";
      wrap.style.top = "0";
      wrap.style.right = "0";
      wrap.style.width = "360px";
      wrap.style.height = "100%";
      wrap.style.background = "var(--primary-color)";
      wrap.style.color = "var(--secondary-text-color)";
      wrap.style.zIndex = "9999";
      wrap.style.boxShadow = "0 0 20px rgba(0,0,0,0.35)";
      wrap.style.overflowY = "auto";
      wrap.classList.add('hidden');

      wrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--border-color)">
          <div style="font-weight:700">Localhost Manager</div>
          <button id="closePanel" class="btn primary">×</button>
        </div>
        <div style="padding:12px">
          <div class="section">
            <div class="label">htdocs path</div>
            <input id="htdocsInput" type="text" style="width:100%;padding:8px;border-radius:8px" />
            <div style="font-size:12px;opacity:.8;margin-top:4px">
              Example: /storage/emulated/0/htdocs (you can change to any folder)
            </div>
          </div>

          <div class="section" style="margin-top:14px">
            <div class="label">Host & Port</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <input id="hostInput" type="text" />
              <input id="portInput" type="number" />
            </div>
          </div>

          <div class="section" style="margin-top:14px">
            <button id="saveBtn" class="btn primary">Save settings</button>
          </div>

          <hr style="margin:16px 0;border-color:var(--border-color)"/>

          <div class="section">
            <div style="font-weight:600;margin-bottom:6px">One‑time setup (minimal Termux)</div>
            <div style="font-size:12px;opacity:.9">
              1) Install <b>Termux</b> (F‑Droid) and open it once.<br/>
              2) Run <b>setup.sh</b> from this plugin's <i>scripts</i> folder (see README).<br/>
              3) Use <b>start.sh</b> to start PHP + MariaDB + phpMyAdmin. <br/>
              When running, click the buttons below.
            </div>
          </div>

          <div class="section" style="margin-top:14px;display:grid;grid-template-columns:1fr;gap:8px">
            <button id="openRoot" class="btn">Open http://127.0.0.1</button>
            <button id="openPMA" class="btn">Open phpMyAdmin</button>
            <button id="openHtdocs" class="btn">Open htdocs index</button>
          </div>

          <div class="section" style="margin-top:18px">
            <div style="font-size:12px;opacity:.8">
              Tip: Put your project files in the selected htdocs folder.
              The server uses PHP's built‑in server and MariaDB.
            </div>
          </div>
        </div>
      `;

      const $ = (id) => wrap.querySelector(id);
      $("#closePanel").onclick = () => wrap.classList.add('hidden');
      $("#saveBtn").onclick = () => {
        this.settings.htdocs = $("#htdocsInput").value.trim() || this.settings.htdocs;
        this.settings.host = $("#hostInput").value.trim() || this.settings.host;
        this.settings.port = parseInt($("#portInput").value, 10) || this.settings.port;
        this.save();
      };
      $("#openRoot").onclick = () => this.openUrl("/");
      $("#openPMA").onclick = () => this.openUrl("/phpmyadmin/");
      $("#openHtdocs").onclick = () => this.openUrl("/index.php");

      this.render = () => {
        $("#htdocsInput").value = this.settings.htdocs;
        $("#hostInput").value = this.settings.host;
        $("#portInput").value = this.settings.port;
      };
      this.render();

      return wrap;
    }
  }

  const plugin = new LocalhostManager();

  if (window.acode) {
    plugin.init();
    acode.setPluginExports(PLUGIN_NS, plugin);
  } else {
    document.addEventListener("deviceready", () => plugin.init());
  }
})();
