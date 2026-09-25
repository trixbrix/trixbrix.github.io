// Trixbrix firmware installer, built directly on esptool-js.
//
// Replaces the esp-web-tools install dialog, which is made for Wi-Fi devices:
// it offers "Connect to Wi-Fi" to anything that answers improv-serial, and
// its only settings control is a generic "Erase device" checkbox. Our
// controllers have no Wi-Fi, so the page runs the install itself and asks
// about settings in its own words.
//
// Same sequence as esp-web-tools' src/flash.ts: connect, pick the build for
// the detected chip, download the parts, write them, hard reset.

import { ESPLoader, Transport } from 'https://cdn.jsdelivr.net/npm/esptool-js@0.6.1/+esm';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class FlashError extends Error {
  // code: 'connect' | 'flashUnreadable' | 'unsupported' | 'download' | 'write'
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function hardReset(transport, esploader) {
  await transport.setRTS(true);
  await sleep(100);
  await esploader.after();
}

// port:           a closed SerialPort
// manifestUrl:    URL of manifest.json (part paths are relative to it)
// manifest:       the parsed manifest
// resetSettings:  true also erases the settings partition
//                 (manifest.settings_partition = { offset, size })
// eraseAll:       true erases the whole flash first (first install over
//                 someone else's firmware)
// onProgress:     ({ stage, percent }) with stage one of
//                 'connecting' | 'downloading' | 'erasing' | 'writing' | 'restarting'
export async function installFirmware({ port, manifestUrl, manifest, resetSettings, eraseAll = false, onProgress = () => {} }) {
  const transport = new Transport(port);
  const esploader = new ESPLoader({ transport, baudrate: 115200, enableTracing: false });

  try {
    onProgress({ stage: 'connecting' });
    let flashId;
    try {
      await esploader.main();
      flashId = (await esploader.readFlashId()) & 0xffffff;
    } catch (err) {
      throw new FlashError('connect', err && err.message ? err.message : String(err));
    }
    // A flash chip that doesn't answer reads back as all ones (or zeros).
    // On the Switch Controller this happens when GPIO12 is high at reset
    // (it senses USB power), which selects 1.8 V for a 3.3 V flash, until
    // the VDD_SDIO eFuse is burned. Writing would fail, so stop here.
    if (flashId === 0xffffff || flashId === 0) {
      throw new FlashError('flashUnreadable', `flash ID 0x${flashId.toString(16).padStart(6, '0')}`);
    }

    const chipFamily = esploader.chip.CHIP_NAME;
    const build = manifest.builds.find((b) => b.chipFamily === chipFamily);
    if (!build) throw new FlashError('unsupported', chipFamily);

    onProgress({ stage: 'downloading' });
    const fileArray = [];
    for (const part of build.parts) {
      const url = new URL(part.path, manifestUrl).toString();
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new FlashError('download', `${part.path}: HTTP ${resp.status}`);
      fileArray.push({ data: new Uint8Array(await resp.arrayBuffer()), address: part.offset });
    }

    const settings = manifest.settings_partition;
    if (resetSettings && settings) {
      // Writing 0xFF over the whole NVS partition is what an erase leaves
      // behind; the firmware then starts with factory defaults.
      fileArray.push({ data: new Uint8Array(settings.size).fill(0xff), address: settings.offset });
    }
    fileArray.sort((a, b) => a.address - b.address);

    if (eraseAll) {
      onProgress({ stage: 'erasing' });
      try {
        await esploader.eraseFlash();
      } catch (err) {
        throw new FlashError('write', err && err.message ? err.message : String(err));
      }
    }

    const totalSize = fileArray.reduce((sum, f) => sum + f.data.length, 0);
    let doneSize = 0;
    onProgress({ stage: 'writing', percent: 0 });
    try {
      await esploader.writeFlash({
        fileArray,
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const partDone = (written / total) * fileArray[fileIndex].data.length;
          if (written === total) {
            doneSize += partDone;
            return;
          }
          onProgress({ stage: 'writing', percent: Math.floor(((doneSize + partDone) / totalSize) * 100) });
        },
      });
    } catch (err) {
      throw new FlashError('write', err && err.message ? err.message : String(err));
    }
    onProgress({ stage: 'writing', percent: 100 });

    onProgress({ stage: 'restarting' });
  } finally {
    // Always leave the chip running its firmware, even after a failed connect
    // left it half-way into the bootloader (esp-web-tools does the same).
    try { await hardReset(transport, esploader); } catch {}
    try { await transport.disconnect(); } catch {}
  }
}
