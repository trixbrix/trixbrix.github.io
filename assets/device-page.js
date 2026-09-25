// Guided install/update flow shared by the device pages.
//
// One panel, one state at a time: connect -> identify (improv + ROM boot
// log, see improv-detect.js) -> offer the right action -> install with
// esptool-js (flasher.js) -> check the version the controller reports.

import { installFirmware } from './flasher.js?v=20260925f';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T = (k) => (window.__T__ ? window.__T__(k) : k);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// cfg:
//   expectedFirmware  improv firmware name of this page's device
//   expectedLabel     product name shown to the user
//   otherPages        { [improv firmware name]: { path, label } }
//   settingsKeys      i18n keys of the settings this device keeps
//   manifestUrl       URL of this device's manifest.json
export function startFlow(cfg) {
  const el = (id) => document.getElementById(id);
  const panel = el('flow-panel');
  const visual = el('flow-visual');
  const title = el('flow-title');
  const desc = el('flow-description');
  const settingsBox = el('flow-settings');
  const tip = el('flow-tip');
  const primary = el('install-btn');
  const gotoBtn = el('goto-other-btn');
  const differentBtn = el('check-different-btn');
  const legacyBtn = el('legacy-override-btn');

  let manifest = null;
  let port = null;
  let state = { kind: 'empty' };
  let resetChoice = false; // false = keep settings

  const busy = () => state.kind === 'detecting' || state.kind === 'installing';
  const target = () => (manifest && manifest.version ? manifest.version : '?');
  const hasFirmwareToKeep = () =>
    ['detected', 'oldFirmware', 'legacy'].includes(state.kind);

  function setState(next) {
    state = next;
    render();
  }

  // ---- identification ---------------------------------------------------
  async function identify(p) {
    let result = null;
    try {
      await p.open({ baudRate: 115200, bufferSize: 8192 });
      result = await window.__trixbrixIdentify(p);
    } catch {} finally {
      try { await p.close(); } catch {}
    }
    return result;
  }

  function stateFromResult(result) {
    if (result && result.kind === 'improv') {
      if (result.info.firmware === cfg.expectedFirmware) {
        return { kind: 'detected', version: result.info.version };
      }
      return { kind: 'wrongDevice', firmware: result.info.firmware };
    }
    if (result && result.kind === 'blank') return { kind: 'blank' };
    if (result && result.kind === 'noImprov') return { kind: 'oldFirmware' };
    if (result && result.kind === 'foreign') return { kind: 'foreign' };
    if (result && result.kind === 'flashUnreadable') return { kind: 'flashUnreadable' };
    return { kind: 'noResponse' };
  }

  async function check(p) {
    port = p;
    resetChoice = false;
    setState({ kind: 'detecting' });
    setState(stateFromResult(await identify(p)));
  }

  async function pickAndCheck() {
    let p;
    try {
      p = await navigator.serial.requestPort();
    } catch {
      return; // chooser closed without a pick
    }
    await check(p);
  }

  // ---- install ------------------------------------------------------------
  async function install() {
    if (!manifest) return;
    const resetSettings = hasFirmwareToKeep() && resetChoice;
    const eraseAll = state.kind === 'foreign';
    const factory = state.kind === 'blank' || eraseAll;
    const version = target();
    setState({ kind: 'installing', stage: 'connecting' });
    try {
      await installFirmware({
        port,
        manifestUrl: cfg.manifestUrl,
        manifest,
        resetSettings,
        eraseAll,
        onProgress: (p) => setState({ kind: 'installing', ...p }),
      });
    } catch (err) {
      if (err.code === 'flashUnreadable') {
        setState({ kind: 'flashUnreadable', detail: err.message });
      } else {
        setState({ kind: 'installError', code: err.code || 'write', message: err.message || String(err) });
      }
      return;
    }

    // Ask the freshly started firmware for its version.
    setState({ kind: 'installing', stage: 'verifying' });
    await sleep(1000);
    const result = await identify(port);
    const reported = result && result.kind === 'improv' && result.info.firmware === cfg.expectedFirmware
      ? result.info.version : null;
    setState({ kind: 'done', version, verified: reported === version, resetSettings, factory });
  }

  // ---- rendering ----------------------------------------------------------
  const icon = (symbol, tone) =>
    `<div class="flow-icon" data-tone="${tone || 'info'}" aria-hidden="true">${symbol}</div>`;
  const versionPair = (from, to) => `<div class="flow-version-display update">
      <span class="version-num from">v${esc(from)}</span>
      <span class="version-arrow" aria-hidden="true">→</span>
      <span class="version-num to">v${esc(to)}</span>
    </div>`;
  const versionOk = (v) => `<div class="flow-version-display ok">
      <span class="version-num">v${esc(v)}</span>
      <span class="check" aria-hidden="true">✓</span>
    </div>`;

  function renderSettings() {
    const items = cfg.settingsKeys.map((k) => `<li>${T(k)}</li>`).join('');
    settingsBox.innerHTML = `
      <fieldset class="settings-choice">
        <legend>${T('settings.legend')}</legend>
        <label class="settings-option">
          <input type="radio" name="flow-settings" value="keep" ${resetChoice ? '' : 'checked'}>
          <span>
            <strong>${T('settings.keep.label')}</strong>
            <span class="settings-hint">${T('settings.keep.hint')}</span>
          </span>
        </label>
        <label class="settings-option">
          <input type="radio" name="flow-settings" value="reset" ${resetChoice ? 'checked' : ''}>
          <span>
            <strong>${T('settings.reset.label')}</strong>
            <span class="settings-hint">${T('settings.reset.hint')}</span>
            <ul class="settings-list">${items}</ul>
            <span class="settings-hint">${T('settings.reset.after')}</span>
          </span>
        </label>
      </fieldset>`;
    settingsBox.querySelectorAll('input[name="flow-settings"]').forEach((input) => {
      input.addEventListener('change', () => {
        resetChoice = input.value === 'reset' && input.checked;
      });
    });
    settingsBox.hidden = false;
  }

  function render() {
    panel.dataset.state = state.kind;
    tip.hidden = true;
    settingsBox.hidden = true;
    gotoBtn.hidden = true;
    differentBtn.hidden = true;
    legacyBtn.hidden = true;
    primary.hidden = false;
    primary.disabled = false;
    differentBtn.textContent = T('flow.checkDifferent');

    const v = target();
    const expected = `<strong>${esc(cfg.expectedLabel)}</strong>`;

    switch (state.kind) {
      case 'empty':
        visual.innerHTML = icon('⚡', 'info');
        title.textContent = T('flow.initial.title');
        desc.innerHTML = T('flow.initial.description');
        primary.textContent = T('flow.initial.button');
        tip.innerHTML = T('install.tip');
        tip.hidden = false;
        break;

      case 'detecting':
        visual.innerHTML = icon('⏳', 'info');
        title.textContent = T('flow.detecting.title');
        desc.innerHTML = T('flow.detecting.description');
        primary.textContent = T('flow.detecting.title');
        primary.disabled = true;
        break;

      case 'detected': {
        const upToDate = state.version === v;
        visual.innerHTML = upToDate ? versionOk(state.version) : versionPair(state.version, v);
        title.textContent = T(upToDate ? 'flow.upToDate.title' : 'flow.updateAvailable.title');
        desc.innerHTML = T(upToDate ? 'flow.upToDate.description' : 'flow.updateAvailable.description');
        primary.textContent = T(upToDate ? 'flow.upToDate.button' : 'flow.updateAvailable.button')
          .replace('{version}', `v${v}`);
        renderSettings();
        differentBtn.hidden = false;
        break;
      }

      case 'oldFirmware':
        visual.innerHTML = versionPair('?', v);
        title.textContent = T('flow.oldFirmware.title');
        desc.innerHTML = T('flow.oldFirmware.description').replace('{expected}', expected);
        primary.textContent = T('flow.updateAvailable.button').replace('{version}', `v${v}`);
        renderSettings();
        differentBtn.hidden = false;
        break;

      // Empty chip, or the program the chip maker ships on the module: to the
      // customer both mean "the software isn't installed yet". A foreign
      // program is erased first (install() sets eraseAll).
      case 'blank':
      case 'foreign':
        visual.innerHTML = icon('✦', 'ok');
        title.textContent = T('flow.blank.title');
        desc.innerHTML = T('flow.blank.description');
        primary.textContent = T('flow.blank.button').replace('{version}', `v${v}`);
        differentBtn.hidden = false;
        break;

      case 'wrongDevice': {
        visual.innerHTML = icon('⚠', 'warn');
        title.textContent = T('flow.wrongDevice.title');
        desc.innerHTML = T('flow.wrongDevice.description')
          .replace('{detected}', `<strong>${esc(state.firmware)}</strong>`)
          .replace('{expected}', expected);
        primary.hidden = true;
        const other = cfg.otherPages[state.firmware];
        if (other) {
          gotoBtn.hidden = false;
          gotoBtn.href = other.path;
          gotoBtn.textContent = T('flow.wrongDevice.gotoButton').replace('{label}', other.label);
        }
        differentBtn.hidden = false;
        break;
      }

      case 'noResponse':
        visual.innerHTML = icon('?', 'warn');
        title.textContent = T('flow.noResponse.title');
        desc.innerHTML = T('flow.noResponse.description');
        primary.textContent = T('flow.noResponse.retryButton');
        legacyBtn.hidden = false;
        legacyBtn.textContent = T('flow.noResponse.legacyButton');
        differentBtn.hidden = false;
        break;

      case 'legacy':
        visual.innerHTML = icon('⚠', 'warn');
        title.textContent = T('flow.legacy.title');
        desc.innerHTML = T('flow.legacy.description').replace('{expected}', expected);
        primary.textContent = T('flow.updateAvailable.button').replace('{version}', `v${v}`);
        renderSettings();
        differentBtn.hidden = false;
        break;

      case 'installing': {
        const pct = state.stage === 'writing' ? (state.percent || 0) : null;
        visual.innerHTML = pct === null
          ? icon('⏳', 'info')
          : `<div class="flow-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
               <div class="flow-progress-num">${pct}%</div>
               <div class="flow-progress-bar"><span style="width:${pct}%"></span></div>
             </div>`;
        title.textContent = T(`install.stage.${state.stage}`);
        desc.innerHTML = T('install.keepConnected');
        primary.hidden = true;
        break;
      }

      case 'done':
        visual.innerHTML = state.verified ? versionOk(state.version) : icon('✓', 'ok');
        title.textContent = T('flow.done.title').replace('{version}', `v${state.version}`);
        desc.innerHTML = [
          T(state.verified ? 'flow.done.verified' : 'flow.done.unverified').replace('{version}', `v${state.version}`),
          T(state.factory ? 'flow.done.settingsFactory'
            : state.resetSettings ? 'flow.done.settingsReset' : 'flow.done.settingsKept'),
        ].join(' ');
        primary.hidden = true;
        differentBtn.hidden = false;
        differentBtn.textContent = T('flow.done.another');
        break;

      // The controller's memory can't be read, so neither the page nor the
      // customer can fix it. The small print is for our own workshop.
      case 'flashUnreadable':
        visual.innerHTML = icon('⚠', 'error');
        title.textContent = T('flow.flashUnreadable.title');
        desc.innerHTML = `${T('flow.flashUnreadable.description')}
          <span class="flow-error-detail">${T('flow.flashUnreadable.service')}${state.detail ? ` (${esc(state.detail)})` : ''}</span>`;
        primary.textContent = T('flow.noResponse.retryButton');
        differentBtn.hidden = false;
        break;

      case 'installError':
        visual.innerHTML = icon('⚠', 'error');
        title.textContent = T('flow.installError.title');
        desc.innerHTML = `${T(state.code === 'connect' ? 'flow.installError.connect' : 'flow.installError.generic')}
          <span class="flow-error-detail">${esc(state.message)}</span>`;
        primary.textContent = T('flow.noResponse.retryButton');
        differentBtn.hidden = false;
        break;
    }
  }

  // ---- wiring ---------------------------------------------------------------
  primary.addEventListener('click', async () => {
    if (busy()) return;
    switch (state.kind) {
      case 'detected':
      case 'oldFirmware':
      case 'blank':
      case 'foreign':
      case 'legacy':
        await install();
        break;
      case 'noResponse':
      case 'installError':
      case 'flashUnreadable':
        if (port) await check(port); else await pickAndCheck();
        break;
      default:
        await pickAndCheck();
    }
  });
  differentBtn.addEventListener('click', () => { if (!busy()) pickAndCheck(); });
  legacyBtn.addEventListener('click', () => { if (!busy()) setState({ kind: 'legacy' }); });
  document.addEventListener('i18n:changed', render);

  if ('serial' in navigator) {
    // A port authorized on an earlier visit is checked right away.
    navigator.serial.getPorts().then((ports) => {
      if (ports.length === 1 && state.kind === 'empty') check(ports[0]);
    }).catch(() => {});
    // connect/disconnect only fire for ports authorized on this origin.
    navigator.serial.addEventListener('connect', (e) => {
      if (!busy()) check(e.target);
    });
    navigator.serial.addEventListener('disconnect', (e) => {
      if (busy() || e.target !== port) return;
      port = null;
      setState({ kind: 'empty' });
    });
  } else {
    primary.disabled = true;
  }

  render();

  return {
    setManifest(m) {
      manifest = m;
      render();
    },
  };
}
