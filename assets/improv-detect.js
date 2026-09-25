// Trixbrix firmware detection via improv-serial.
//
// Opens the chosen ESP32 USB-serial port at 115200 baud, sends an improv
// GET_DEVICE_INFO RPC, parses the response, and returns
// { firmware, version, chipFamily, deviceName } — or null if the device
// didn't respond (likely older firmware without improv-serial).
//
// Closes the port cleanly so esp-web-tools can reopen it for flashing.

(function() {
  const MAGIC = [0x49, 0x4D, 0x50, 0x52, 0x4F, 0x56]; // "IMPROV"
  const TYPE_RPC_RESULT = 0x04;
  const CMD_GET_DEVICE_INFO = 0x03;

  // Pre-built request: IMPROV \x01 \x03 \x02 \x03 \x00 0xE6 (12 bytes)
  // ver=1, type=RPC_COMMAND(3), len=2, [cmd=GET_DEVICE_INFO(3), datalen=0], checksum=0xE6
  const GET_DEVICE_INFO_REQUEST = new Uint8Array([
    0x49, 0x4D, 0x50, 0x52, 0x4F, 0x56,
    0x01, 0x03, 0x02, 0x03, 0x00, 0xE6,
  ]);

  function parseImprovResponse(buf) {
    // Scan for IMPROV magic anywhere in buffer (boot logs may precede it).
    outer:
    for (let start = 0; start <= buf.length - 11; start++) {
      for (let i = 0; i < 6; i++) {
        if (buf[start + i] !== MAGIC[i]) continue outer;
      }
      const len = buf[start + 8];
      const end = start + 9 + len + 1; // header(9) + data(len) + checksum(1)
      if (buf.length < end) continue;

      // Verify checksum
      let sum = 0;
      for (let i = start; i < start + 9 + len; i++) sum = (sum + buf[i]) & 0xFF;
      if (sum !== buf[start + 9 + len]) continue;

      const type = buf[start + 7];
      if (type !== TYPE_RPC_RESULT) continue;

      const data = buf.slice(start + 9, start + 9 + len);
      if (data.length < 2) continue;
      const cmd = data[0];
      const cmdLen = data[1];
      if (cmd !== CMD_GET_DEVICE_INFO) continue;

      // data[2..2+cmdLen) is a sequence of (len, bytes) strings:
      // firmware_name, version, chip_family, device_name
      const strings = [];
      let p = 2;
      while (p < 2 + cmdLen && p < data.length) {
        const slen = data[p++];
        if (p + slen > data.length) break;
        strings.push(new TextDecoder().decode(data.slice(p, p + slen)));
        p += slen;
      }
      if (strings.length >= 4) {
        return {
          firmware: strings[0],
          version: strings[1],
          chipFamily: strings[2],
          deviceName: strings[3],
        };
      }
    }
    return null;
  }

  // Bytes the last improv query read. Opening the port restarts the ESP32 on
  // most setups, so this often already holds the ROM boot log.
  let lastImprovRaw = new Uint8Array(0);

  // Talk to an already-opened port. Returns parsed info or null on timeout.
  // The probe sends GET_DEVICE_INFO multiple times across the timeout window
  // because the device can be momentarily busy (BLE setup, button-task wait,
  // etc.) and may drop a single request. Multi-send + a generous timeout
  // gives consistent results across page reloads.
  async function queryImprovOnOpenPort(port, timeoutMs = 3000) {
    let writer = null;
    lastImprovRaw = new Uint8Array(0);
    let reader = null;
    let result = null;

    async function sendRequest() {
      try {
        const w = port.writable.getWriter();
        await w.write(GET_DEVICE_INFO_REQUEST);
        w.releaseLock();
      } catch {
        // ignore — locked by the active reader/writer; we'll catch the response anyway
      }
    }

    // Schedule three sends across the window: at t=0, t=400ms, t=1200ms.
    const start = Date.now();
    const sendSchedule = [0, 400, 1200];
    let scheduledIndex = 0;

    try {
      // Initial send
      await sendRequest();
      scheduledIndex = 1;

      reader = port.readable.getReader();
      const deadline = start + timeoutMs;
      let buf = new Uint8Array(0);

      while (Date.now() < deadline) {
        const remaining = deadline - Date.now();
        // Stop reading briefly to schedule the next request if its time has come.
        const nextSendAt = scheduledIndex < sendSchedule.length
          ? start + sendSchedule[scheduledIndex]
          : Infinity;
        const sliceMs = Math.max(50, Math.min(remaining, nextSendAt - Date.now()));

        let timeoutId;
        const timeoutP = new Promise((_, rej) => {
          timeoutId = setTimeout(() => rej(new Error('timeout')), sliceMs);
        });
        let r;
        try {
          r = await Promise.race([reader.read(), timeoutP]);
          clearTimeout(timeoutId);
        } catch {
          clearTimeout(timeoutId);
          // slice timeout: maybe time to send another request
          if (scheduledIndex < sendSchedule.length && Date.now() >= start + sendSchedule[scheduledIndex]) {
            try {
              reader.releaseLock();
              await sendRequest();
              reader = port.readable.getReader();
            } catch {}
            scheduledIndex++;
          }
          continue;
        }
        if (r.done) break;

        const v = r.value;
        const newBuf = new Uint8Array(buf.length + v.length);
        newBuf.set(buf);
        newBuf.set(v, buf.length);
        buf = newBuf;
        lastImprovRaw = buf;

        result = parseImprovResponse(buf);
        if (result) break;
      }
    } finally {
      if (reader) {
        try { await reader.cancel(); } catch {}
        try { reader.releaseLock(); } catch {}
      }
      if (writer) {
        try { writer.releaseLock(); } catch {}
      }
    }
    return result;
  }

  // Top-level: opens a port (either provided, or via requestPort), runs the
  // query, closes the port, returns the parsed info (or null).
  async function detectFirmware({ port, useExisting } = {}) {
    let chosen = port;
    let openedHere = false;

    if (!chosen) {
      if (useExisting) {
        const existing = await navigator.serial.getPorts();
        if (existing.length === 1) chosen = existing[0];
      }
      if (!chosen) {
        chosen = await navigator.serial.requestPort();
      }
    }

    if (!chosen.readable) {
      await chosen.open({ baudRate: 115200 });
      openedHere = true;
    }

    let info;
    try {
      info = await queryImprovOnOpenPort(chosen);
    } finally {
      if (openedHere) {
        try { await chosen.close(); } catch {}
      }
    }
    return info;
  }

  // Restart the ESP32 into normal boot and read what the ROM bootloader
  // prints. Works on any ESP32 board with the usual DTR/RTS -> EN/IO0
  // transistor pair (CP2102N on our controllers): RTS alone pulls EN low,
  // DTR stays released so IO0 stays high and the chip boots from flash.
  //
  // Returns the text that arrived; classifyBootLog() reads it:
  //   'blank'       — flash is empty: the ROM loops on "invalid header:
  //                   0xffffffff" (or a bootloader finds no app partition)
  //   'hasFirmware' — a bootloader handed over to an app ("entry 0x...")
  //   null          — nothing recognisable arrived (wrong port, bad cable)
  const BLANK_PATTERNS = [/invalid header: 0xffffffff/i, /No bootable app partitions/i];
  const FIRMWARE_PATTERNS = [/entry 0x[0-9a-f]{8}/i];

  function classifyBootLog(text) {
    if (BLANK_PATTERNS.some((re) => re.test(text))) return 'blank';
    if (FIRMWARE_PATTERNS.some((re) => re.test(text))) return 'hasFirmware';
    return null;
  }

  // The ROM prints the segment table of the 2nd stage bootloader it loads.
  // Every Trixbrix build so far (Arduino-ESP32 via espressif32@3.5.0) ships
  // the same bootloader: segments 1044 / 10124 / 5828 bytes, entry
  // 0x400806a8. Anything else is someone else's firmware, e.g. the ESP-AT
  // firmware Espressif pre-flashes on ESP32-WROOM-32E modules.
  // Only consulted when improv is silent. A future build with a different
  // bootloader must be added here, or a controller that doesn't answer
  // improv before the restart would be treated as foreign (full erase);
  // scripts/publish-device.sh warns when the bootloader changes.
  const TRIXBRIX_BOOTLOADER = [/load:0x40078000,len:10124\b/, /entry 0x400806a8\b/];

  function isTrixbrixBootloader(text) {
    return TRIXBRIX_BOOTLOADER.every((re) => re.test(text));
  }

  async function probeBootLogOnOpenPort(port, timeoutMs = 2000) {
    const sleep = (ms) => new Promise((r) => setTimeout(() => r(null), ms));
    const decoder = new TextDecoder('latin1');
    let reader = null;
    let pending = null; // an unresolved reader.read() is reused, never dropped
    let text = '';

    // Read for up to `ms`; returns the chunk, or null on timeout / end.
    async function readFor(ms) {
      if (!pending) pending = reader.read();
      const r = await Promise.race([pending, sleep(ms)]);
      if (!r) return null;
      pending = null;
      return r.done ? null : r.value;
    }

    try {
      reader = port.readable.getReader();
      // Drop anything left over from the improv query before resetting.
      while (await readFor(30)) {}

      await port.setSignals({ dataTerminalReady: false, requestToSend: true });
      await sleep(100);
      await port.setSignals({ dataTerminalReady: false, requestToSend: false });

      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const chunk = await readFor(Math.max(20, deadline - Date.now()));
        if (!chunk) continue;
        text += decoder.decode(chunk, { stream: true });
        if (classifyBootLog(text)) break;
      }
    } catch {
      // setSignals unsupported or port lost: report "nothing recognisable"
    } finally {
      if (reader) {
        try { await reader.cancel(); } catch {}
        try { reader.releaseLock(); } catch {}
      }
    }
    return text;
  }

  // Full identification of an already-open port:
  //   { kind: 'improv', info }  — our firmware answered improv
  //   { kind: 'blank' }         — factory-fresh chip, nothing in flash
  //   { kind: 'noImprov' }      — Trixbrix firmware from before improv (pre-v2)
  //   { kind: 'foreign' }       — someone else's firmware (e.g. factory ESP-AT)
  //   { kind: 'noResponse' }    — no improv and no readable boot log
  //
  // The restart also wakes a controller that went back to deep sleep after
  // being plugged in while off, so improv is asked once more after it.
  async function identifyOnOpenPort(port) {
    let info = await queryImprovOnOpenPort(port);
    if (info) return { kind: 'improv', info };
    const seenOnOpen = new TextDecoder('latin1').decode(lastImprovRaw);
    const seenAfterReset = await probeBootLogOnOpenPort(port);
    const bootLog = seenOnOpen + seenAfterReset;

    const boot = classifyBootLog(bootLog);
    if (boot === 'blank') return { kind: 'blank' };
    if (boot === 'hasFirmware') {
      // Only our firmware can answer improv after the restart; don't wait
      // for someone else's.
      if (!isTrixbrixBootloader(bootLog)) return { kind: 'foreign' };
      info = await queryImprovOnOpenPort(port, 4000);
      if (info) return { kind: 'improv', info };
      return { kind: 'noImprov' };
    }
    return { kind: 'noResponse' };
  }

  window.__trixbrixDetect = detectFirmware;
  // Restart + read the boot log on an already-open port. See above.
  window.__trixbrixProbeBootLog = probeBootLogOnOpenPort;
  // improv, then boot log, then improv again. Used by the device pages.
  window.__trixbrixIdentify = identifyOnOpenPort;
  // Lower-level: given an already-open port, send improv GET_DEVICE_INFO
  // and return parsed info or null.
  window.__trixbrixQueryImprov = queryImprovOnOpenPort;
})();
