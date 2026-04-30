// Trixbrix Software — runtime i18n
// Strings are organized by language. Apply with applyI18n() on DOMContentLoaded.
// Use [data-i18n="key"] on elements for textContent, [data-i18n-html="key"] for innerHTML.

(function() {
  const SUPPORTED = ['en', 'de', 'fr', 'es', 'pl', 'nl'];
  const LANG_NAMES = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pl: 'Polski',
    nl: 'Nederlands',
  };

  const T = {
    en: {
      'nav.allDevices':       '← All devices',
      'brand.sub':            'Software',
      'landing.eyebrow':      'Firmware updates',
      'landing.heading':      'Update your Trixbrix device.',
      'landing.tagline':      'Plug your controller into the computer with its USB cable, pick it from the list below, and click <strong>Install firmware</strong>. The whole thing takes about a minute — nothing to download, nothing to install on your computer.',
      'landing.pick':         'Pick a device',
      'browser.heading':      "This browser can't update devices",
      'browser.body':         'The update tool only works in Google Chrome or Microsoft Edge. Please open this page in one of those, then come back here.',
      'device.eyebrow':       'Firmware update',
      'install.heading':      'Install firmware',
      'install.step1':        'Plug your controller into the computer with the USB cable.',
      'install.step2':        'Click <strong>Install firmware</strong>.',
      'install.step3':        'A small window will pop up asking you to pick a device — choose the one that appeared when you plugged in (usually the only option), then click <em>Connect</em>.',
      'install.tip':          '<strong>Tip:</strong> if you see more than one option in the list, look for a name containing <code>USB-SERIAL</code>, <code>CP210x</code>, or <code>CH340</code>.',
      'install.button':       'Install firmware',
      'erase.label':          'Also factory-reset',
      'erase.warningTitle':   'This wipes all saved settings.',
      'erase.warningBody.aio':'Working mode, paired LEGO Powered Up network ID, switch color, and port assignments will be erased. The device boots up as if brand new. Only use this for a true factory reset or to recover from a corrupted state.',
      'erase.warningBody.sc': 'Paired LEGO Powered Up network ID and switch color will be erased. The device boots up as if brand new. Only use this for a true factory reset or to recover from a corrupted state.',
      'versions.heading':     'Version history',
      'versions.empty':       'No versions published yet.',
      'versions.loading':     'Loading…',
      'versions.current':     'current',
      'versions.error':       'Could not load version history:',
      'versions.noNotes':     'No release notes.',
      'footer.allDevices':    'All devices',
      'footer.usbOnly':       'USB only · Chromium browsers only',
      'footer.madeBy':        'Made by',
      'footer.poweredBy':     'Powered by',
      'theme.toggle':         'Toggle dark mode',
      'lang.label':           'Language',
      'card.aio.desc':        'Battery-powered Bluetooth servo controller for LEGO train switches. Powered Up compatible.',
      'card.sc.desc':         'Compact Bluetooth servo controller for a single LEGO train switch. Powered Up compatible.',
      'device.aio.tagline':   'Battery-powered Bluetooth servo controller for LEGO train switches. Follow the three steps below to install the latest firmware on your controller.',
      'device.sc.tagline':    'Compact Bluetooth servo controller for a single LEGO train switch. Follow the three steps below to install the latest firmware on your controller.',
    },

    de: {
      'nav.allDevices':       '← Alle Geräte',
      'brand.sub':            'Software',
      'landing.eyebrow':      'Firmware-Updates',
      'landing.heading':      'Aktualisiere dein Trixbrix-Gerät.',
      'landing.tagline':      'Schließe deinen Controller mit dem USB-Kabel an den Computer an, wähle ihn aus der Liste unten und klicke auf <strong>Firmware installieren</strong>. Das Ganze dauert etwa eine Minute — du musst nichts herunterladen oder installieren.',
      'landing.pick':         'Wähle ein Gerät',
      'browser.heading':      'Dieser Browser kann keine Geräte aktualisieren',
      'browser.body':         'Das Update-Tool funktioniert nur in Google Chrome oder Microsoft Edge. Bitte öffne diese Seite in einem davon und komm dann hierher zurück.',
      'device.eyebrow':       'Firmware-Update',
      'install.heading':      'Firmware installieren',
      'install.step1':        'Verbinde deinen Controller mit dem USB-Kabel mit dem Computer.',
      'install.step2':        'Klicke auf <strong>Firmware installieren</strong>.',
      'install.step3':        'Ein kleines Fenster fragt, welches Gerät du verwenden möchtest — wähle das, das beim Anstecken erschienen ist (meist die einzige Option), und klicke auf <em>Verbinden</em>.',
      'install.tip':          '<strong>Tipp:</strong> Wenn du mehr als eine Option siehst, suche nach einem Namen, der <code>USB-SERIAL</code>, <code>CP210x</code> oder <code>CH340</code> enthält.',
      'install.button':       'Firmware installieren',
      'erase.label':          'Auch auf Werkseinstellungen zurücksetzen',
      'erase.warningTitle':   'Dadurch werden alle gespeicherten Einstellungen gelöscht.',
      'erase.warningBody.aio':'Betriebsmodus, gekoppelte LEGO Powered Up Netzwerk-ID, Weichenfarbe und Anschlusszuweisungen werden gelöscht. Das Gerät startet wie neu. Verwende dies nur für ein echtes Zurücksetzen oder zur Wiederherstellung nach einem Fehler.',
      'erase.warningBody.sc': 'Die gekoppelte LEGO Powered Up Netzwerk-ID und die Weichenfarbe werden gelöscht. Das Gerät startet wie neu. Verwende dies nur für ein echtes Zurücksetzen oder zur Wiederherstellung nach einem Fehler.',
      'versions.heading':     'Versionsverlauf',
      'versions.empty':       'Noch keine Versionen veröffentlicht.',
      'versions.loading':     'Lädt…',
      'versions.current':     'aktuell',
      'versions.error':       'Versionsverlauf konnte nicht geladen werden:',
      'versions.noNotes':     'Keine Versionshinweise.',
      'footer.allDevices':    'Alle Geräte',
      'footer.usbOnly':       'Nur USB · Nur Chromium-Browser',
      'footer.madeBy':        'Hergestellt von',
      'footer.poweredBy':     'Bereitgestellt durch',
      'theme.toggle':         'Dunkelmodus umschalten',
      'lang.label':           'Sprache',
      'card.aio.desc':        'Akkubetriebener Bluetooth-Servocontroller für LEGO-Eisenbahnweichen. Powered Up-kompatibel.',
      'card.sc.desc':         'Kompakter Bluetooth-Servocontroller für eine einzelne LEGO-Eisenbahnweiche. Powered Up-kompatibel.',
      'device.aio.tagline':   'Akkubetriebener Bluetooth-Servocontroller für LEGO-Eisenbahnweichen. Folge den drei Schritten unten, um die neueste Firmware auf deinem Controller zu installieren.',
      'device.sc.tagline':    'Kompakter Bluetooth-Servocontroller für eine einzelne LEGO-Eisenbahnweiche. Folge den drei Schritten unten, um die neueste Firmware auf deinem Controller zu installieren.',
    },

    fr: {
      'nav.allDevices':       '← Tous les appareils',
      'brand.sub':            'Logiciel',
      'landing.eyebrow':      'Mises à jour du firmware',
      'landing.heading':      'Mettez à jour votre appareil Trixbrix.',
      'landing.tagline':      "Branchez votre contrôleur à l'ordinateur avec son câble USB, choisissez-le dans la liste ci-dessous et cliquez sur <strong>Installer le firmware</strong>. L'opération prend environ une minute — rien à télécharger, rien à installer sur votre ordinateur.",
      'landing.pick':         'Choisissez un appareil',
      'browser.heading':      'Ce navigateur ne peut pas mettre à jour les appareils',
      'browser.body':         "L'outil de mise à jour ne fonctionne que dans Google Chrome ou Microsoft Edge. Veuillez ouvrir cette page dans l'un de ces navigateurs, puis revenez ici.",
      'device.eyebrow':       'Mise à jour du firmware',
      'install.heading':      'Installer le firmware',
      'install.step1':        "Branchez votre contrôleur à l'ordinateur avec le câble USB.",
      'install.step2':        'Cliquez sur <strong>Installer le firmware</strong>.',
      'install.step3':        "Une petite fenêtre s'ouvrira pour vous demander de choisir un appareil — sélectionnez celui qui est apparu lors du branchement (généralement la seule option), puis cliquez sur <em>Connecter</em>.",
      'install.tip':          '<strong>Astuce :</strong> si vous voyez plusieurs options dans la liste, cherchez un nom contenant <code>USB-SERIAL</code>, <code>CP210x</code> ou <code>CH340</code>.',
      'install.button':       'Installer le firmware',
      'erase.label':          "Réinitialiser aussi aux paramètres d'usine",
      'erase.warningTitle':   'Cela efface tous les paramètres enregistrés.',
      'erase.warningBody.aio':"Le mode de fonctionnement, l'identifiant réseau LEGO Powered Up associé, la couleur d'aiguillage et les affectations de ports seront effacés. L'appareil redémarrera comme neuf. À utiliser uniquement pour une vraie remise à zéro ou pour récupérer d'un état corrompu.",
      'erase.warningBody.sc': "L'identifiant réseau LEGO Powered Up associé et la couleur d'aiguillage seront effacés. L'appareil redémarrera comme neuf. À utiliser uniquement pour une vraie remise à zéro ou pour récupérer d'un état corrompu.",
      'versions.heading':     'Historique des versions',
      'versions.empty':       'Aucune version publiée pour le moment.',
      'versions.loading':     'Chargement…',
      'versions.current':     'actuelle',
      'versions.error':       "Impossible de charger l'historique des versions :",
      'versions.noNotes':     'Pas de notes de version.',
      'footer.allDevices':    'Tous les appareils',
      'footer.usbOnly':       'USB uniquement · Navigateurs Chromium uniquement',
      'footer.madeBy':        'Créé par',
      'footer.poweredBy':     'Propulsé par',
      'theme.toggle':         'Basculer le mode sombre',
      'lang.label':           'Langue',
      'card.aio.desc':        "Contrôleur de servo Bluetooth sur batterie pour aiguillages de train LEGO. Compatible Powered Up.",
      'card.sc.desc':         "Contrôleur de servo Bluetooth compact pour un seul aiguillage de train LEGO. Compatible Powered Up.",
      'device.aio.tagline':   "Contrôleur de servo Bluetooth sur batterie pour aiguillages de train LEGO. Suivez les trois étapes ci-dessous pour installer le dernier firmware sur votre contrôleur.",
      'device.sc.tagline':    "Contrôleur de servo Bluetooth compact pour un seul aiguillage de train LEGO. Suivez les trois étapes ci-dessous pour installer le dernier firmware sur votre contrôleur.",
    },

    es: {
      'nav.allDevices':       '← Todos los dispositivos',
      'brand.sub':            'Software',
      'landing.eyebrow':      'Actualizaciones de firmware',
      'landing.heading':      'Actualiza tu dispositivo Trixbrix.',
      'landing.tagline':      'Conecta tu controlador al ordenador con su cable USB, elígelo en la lista de abajo y haz clic en <strong>Instalar firmware</strong>. Todo el proceso dura aproximadamente un minuto — no hay que descargar ni instalar nada en tu ordenador.',
      'landing.pick':         'Elige un dispositivo',
      'browser.heading':      'Este navegador no puede actualizar dispositivos',
      'browser.body':         'La herramienta de actualización solo funciona en Google Chrome o Microsoft Edge. Por favor, abre esta página en uno de ellos y vuelve aquí.',
      'device.eyebrow':       'Actualización de firmware',
      'install.heading':      'Instalar firmware',
      'install.step1':        'Conecta tu controlador al ordenador con el cable USB.',
      'install.step2':        'Haz clic en <strong>Instalar firmware</strong>.',
      'install.step3':        'Aparecerá una pequeña ventana pidiendo que elijas un dispositivo — selecciona el que apareció al conectarlo (suele ser la única opción) y haz clic en <em>Conectar</em>.',
      'install.tip':          '<strong>Consejo:</strong> si ves más de una opción en la lista, busca un nombre que contenga <code>USB-SERIAL</code>, <code>CP210x</code> o <code>CH340</code>.',
      'install.button':       'Instalar firmware',
      'erase.label':          'Restablecer también a valores de fábrica',
      'erase.warningTitle':   'Esto borrará todos los ajustes guardados.',
      'erase.warningBody.aio':'Se borrarán el modo de funcionamiento, el ID de red LEGO Powered Up emparejado, el color del desvío y las asignaciones de puertos. El dispositivo arrancará como nuevo. Úsalo solo para un restablecimiento real o para recuperarse de un estado corrupto.',
      'erase.warningBody.sc': 'Se borrarán el ID de red LEGO Powered Up emparejado y el color del desvío. El dispositivo arrancará como nuevo. Úsalo solo para un restablecimiento real o para recuperarse de un estado corrupto.',
      'versions.heading':     'Historial de versiones',
      'versions.empty':       'Aún no se han publicado versiones.',
      'versions.loading':     'Cargando…',
      'versions.current':     'actual',
      'versions.error':       'No se pudo cargar el historial de versiones:',
      'versions.noNotes':     'Sin notas de versión.',
      'footer.allDevices':    'Todos los dispositivos',
      'footer.usbOnly':       'Solo USB · Solo navegadores Chromium',
      'footer.madeBy':        'Hecho por',
      'footer.poweredBy':     'Impulsado por',
      'theme.toggle':         'Alternar modo oscuro',
      'lang.label':           'Idioma',
      'card.aio.desc':        'Controlador de servo Bluetooth a batería para desvíos de tren LEGO. Compatible con Powered Up.',
      'card.sc.desc':         'Controlador de servo Bluetooth compacto para un único desvío de tren LEGO. Compatible con Powered Up.',
      'device.aio.tagline':   'Controlador de servo Bluetooth a batería para desvíos de tren LEGO. Sigue los tres pasos a continuación para instalar el firmware más reciente en tu controlador.',
      'device.sc.tagline':    'Controlador de servo Bluetooth compacto para un único desvío de tren LEGO. Sigue los tres pasos a continuación para instalar el firmware más reciente en tu controlador.',
    },

    pl: {
      'nav.allDevices':       '← Wszystkie urządzenia',
      'brand.sub':            'Oprogramowanie',
      'landing.eyebrow':      "Aktualizacje firmware'u",
      'landing.heading':      'Zaktualizuj swoje urządzenie Trixbrix.',
      'landing.tagline':      'Podłącz kontroler do komputera kablem USB, wybierz go z listy poniżej i kliknij <strong>Zainstaluj firmware</strong>. Cały proces trwa około minuty — niczego nie musisz pobierać ani instalować na komputerze.',
      'landing.pick':         'Wybierz urządzenie',
      'browser.heading':      'Ta przeglądarka nie może aktualizować urządzeń',
      'browser.body':         'Narzędzie do aktualizacji działa tylko w Google Chrome lub Microsoft Edge. Otwórz tę stronę w jednej z tych przeglądarek i wróć tutaj.',
      'device.eyebrow':       "Aktualizacja firmware'u",
      'install.heading':      'Zainstaluj firmware',
      'install.step1':        'Podłącz kontroler do komputera kablem USB.',
      'install.step2':        'Kliknij <strong>Zainstaluj firmware</strong>.',
      'install.step3':        'Pojawi się małe okienko z prośbą o wybór urządzenia — wybierz to, które pojawiło się po podłączeniu (zwykle jedyna opcja) i kliknij <em>Połącz</em>.',
      'install.tip':          '<strong>Wskazówka:</strong> jeśli na liście widzisz więcej niż jedną opcję, szukaj nazwy zawierającej <code>USB-SERIAL</code>, <code>CP210x</code> lub <code>CH340</code>.',
      'install.button':       'Zainstaluj firmware',
      'erase.label':          'Przywróć też ustawienia fabryczne',
      'erase.warningTitle':   'Spowoduje to usunięcie wszystkich zapisanych ustawień.',
      'erase.warningBody.aio':'Usunięte zostaną: tryb pracy, sparowane ID sieci LEGO Powered Up, kolor zwrotnicy oraz przypisania portów. Urządzenie uruchomi się jak nowe. Używaj tylko do faktycznego przywrócenia ustawień fabrycznych lub odzyskania z uszkodzonego stanu.',
      'erase.warningBody.sc': 'Usunięte zostaną: sparowane ID sieci LEGO Powered Up i kolor zwrotnicy. Urządzenie uruchomi się jak nowe. Używaj tylko do faktycznego przywrócenia ustawień fabrycznych lub odzyskania z uszkodzonego stanu.',
      'versions.heading':     'Historia wersji',
      'versions.empty':       'Nie opublikowano jeszcze żadnej wersji.',
      'versions.loading':     'Wczytywanie…',
      'versions.current':     'aktualna',
      'versions.error':       'Nie można wczytać historii wersji:',
      'versions.noNotes':     'Brak informacji o zmianach.',
      'footer.allDevices':    'Wszystkie urządzenia',
      'footer.usbOnly':       'Tylko USB · Tylko przeglądarki Chromium',
      'footer.madeBy':        'Stworzone przez',
      'footer.poweredBy':     'Napędzane przez',
      'theme.toggle':         'Przełącz tryb ciemny',
      'lang.label':           'Język',
      'card.aio.desc':        'Akumulatorowy kontroler servo Bluetooth do zwrotnic kolejowych LEGO. Kompatybilny z Powered Up.',
      'card.sc.desc':         'Kompaktowy kontroler servo Bluetooth do pojedynczej zwrotnicy kolejowej LEGO. Kompatybilny z Powered Up.',
      'device.aio.tagline':   'Akumulatorowy kontroler servo Bluetooth do zwrotnic kolejowych LEGO. Wykonaj poniższe trzy kroki, aby zainstalować najnowszy firmware na swoim kontrolerze.',
      'device.sc.tagline':    'Kompaktowy kontroler servo Bluetooth do pojedynczej zwrotnicy kolejowej LEGO. Wykonaj poniższe trzy kroki, aby zainstalować najnowszy firmware na swoim kontrolerze.',
    },

    nl: {
      'nav.allDevices':       '← Alle apparaten',
      'brand.sub':            'Software',
      'landing.eyebrow':      'Firmware-updates',
      'landing.heading':      'Werk je Trixbrix-apparaat bij.',
      'landing.tagline':      'Sluit je controller met de USB-kabel aan op de computer, kies hem uit de lijst hieronder en klik op <strong>Firmware installeren</strong>. Het hele proces duurt ongeveer een minuut — niets om te downloaden, niets om op je computer te installeren.',
      'landing.pick':         'Kies een apparaat',
      'browser.heading':      'Deze browser kan geen apparaten bijwerken',
      'browser.body':         'De update-tool werkt alleen in Google Chrome of Microsoft Edge. Open deze pagina in een daarvan en kom dan hier terug.',
      'device.eyebrow':       'Firmware-update',
      'install.heading':      'Firmware installeren',
      'install.step1':        'Sluit je controller met de USB-kabel aan op de computer.',
      'install.step2':        'Klik op <strong>Firmware installeren</strong>.',
      'install.step3':        'Er verschijnt een klein venster waarin je een apparaat moet kiezen — kies degene die verscheen toen je de controller aansloot (meestal de enige optie) en klik op <em>Verbinden</em>.',
      'install.tip':          '<strong>Tip:</strong> als je meer dan één optie in de lijst ziet, zoek dan naar een naam met <code>USB-SERIAL</code>, <code>CP210x</code> of <code>CH340</code>.',
      'install.button':       'Firmware installeren',
      'erase.label':          'Ook fabrieksinstellingen herstellen',
      'erase.warningTitle':   'Dit wist alle opgeslagen instellingen.',
      'erase.warningBody.aio':'Bedrijfsmodus, gekoppelde LEGO Powered Up-netwerk-ID, wisselkleur en poorttoewijzingen worden gewist. Het apparaat start op alsof het nieuw is. Gebruik dit alleen voor een echte fabrieksreset of om te herstellen van een corrupte staat.',
      'erase.warningBody.sc': 'De gekoppelde LEGO Powered Up-netwerk-ID en wisselkleur worden gewist. Het apparaat start op alsof het nieuw is. Gebruik dit alleen voor een echte fabrieksreset of om te herstellen van een corrupte staat.',
      'versions.heading':     'Versiegeschiedenis',
      'versions.empty':       'Er zijn nog geen versies gepubliceerd.',
      'versions.loading':     'Laden…',
      'versions.current':     'huidig',
      'versions.error':       'Kan versiegeschiedenis niet laden:',
      'versions.noNotes':     'Geen release-notities.',
      'footer.allDevices':    'Alle apparaten',
      'footer.usbOnly':       'Alleen USB · Alleen Chromium-browsers',
      'footer.madeBy':        'Gemaakt door',
      'footer.poweredBy':     'Mogelijk gemaakt door',
      'theme.toggle':         'Donkere modus wisselen',
      'lang.label':           'Taal',
      'card.aio.desc':        'Bluetooth-servocontroller op batterij voor LEGO-treinwissels. Powered Up-compatibel.',
      'card.sc.desc':         'Compacte Bluetooth-servocontroller voor één enkele LEGO-treinwissel. Powered Up-compatibel.',
      'device.aio.tagline':   'Bluetooth-servocontroller op batterij voor LEGO-treinwissels. Volg de drie stappen hieronder om de nieuwste firmware op je controller te installeren.',
      'device.sc.tagline':    'Compacte Bluetooth-servocontroller voor één enkele LEGO-treinwissel. Volg de drie stappen hieronder om de nieuwste firmware op je controller te installeren.',
    },
  };

  function detectLang() {
    const stored = (function() {
      try { return localStorage.getItem('trixbrix-lang'); } catch(e) { return null; }
    })();
    if (stored && SUPPORTED.indexOf(stored) >= 0) return stored;
    const url = new URLSearchParams(window.location.search).get('lang');
    if (url && SUPPORTED.indexOf(url) >= 0) return url;
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(nav) >= 0) return nav;
    return 'en';
  }

  function get(key, lang) {
    lang = lang || document.documentElement.lang || 'en';
    return (T[lang] && T[lang][key]) || (T.en && T.en[key]) || key;
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = get(key, lang);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = get(key, lang);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', get(key, lang));
      el.setAttribute('title', get(key, lang));
    });
    // dispatch event so page-specific code (e.g. version history) can re-render
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = 'en';
    try { localStorage.setItem('trixbrix-lang', lang); } catch(e) {}
    applyLang(lang);
    const sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
  }

  function buildSwitcher() {
    const sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.innerHTML = SUPPORTED.map(l =>
      `<option value="${l}">${LANG_NAMES[l]}</option>`
    ).join('');
    sel.value = document.documentElement.lang;
    sel.addEventListener('change', () => setLang(sel.value));
  }

  // Apply once DOM is parsed
  function init() {
    const lang = detectLang();
    document.documentElement.lang = lang;
    applyLang(lang);
    buildSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.__T__ = get;
  window.__setLang__ = setLang;
  window.__I18N__ = T;
})();
