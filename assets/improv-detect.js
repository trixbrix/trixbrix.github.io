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

  // Talk to an already-opened port. Returns parsed info or null on timeout.
  // The probe sends GET_DEVICE_INFO multiple times across the timeout window
  // because the device can be momentarily busy (BLE setup, button-task wait,
  // etc.) and may drop a single request. Multi-send + a generous timeout
  // gives consistent results across page reloads.
  async function queryImprovOnOpenPort(port, timeoutMs = 3000) {
    let writer = null;
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

  window.__trixbrixDetect = detectFirmware;
  // Lower-level: given an already-open port, send improv GET_DEVICE_INFO
  // and return parsed info or null. Used by the install-time guard so we
  // can introspect the user's picked port before esp-web-tools opens it.
  window.__trixbrixQueryImprov = queryImprovOnOpenPort;
})();
