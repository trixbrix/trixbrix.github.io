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
      'install.step4':        'When asked <em>Erase device?</em>, leave the box unchecked to keep your saved settings (paired remote, switch color, port assignments). Then click <em>Next</em> and <em>Install</em>.',
      'install.tip':          '<strong>Tip:</strong> if you see more than one option in the list, look for a name containing <code>USB-SERIAL</code>, <code>CP210x</code>, or <code>CH340</code>.',
      'install.button':       'Install firmware',
      'install.verifyFirst': "Click <strong>Check what's installed</strong> above to verify your device before installing.",
      'detect.button':        "Check what's installed",
      'detect.detecting':     'Checking the device…',
      'detect.onDevice':      'On your device',
      'detect.willInstall':   'Will install',
      'detect.upToDate':      "You're already on the latest firmware — no update needed.",
      'detect.outdated':      'A newer firmware is available. Click <strong>Install firmware</strong> below to update; your saved settings will be kept.',
      'detect.legacyDetected':'v1 firmware detected — that is the only release without version reporting. Your device will update normally; when the flashing tool asks <em>Erase device?</em>, leave the box unchecked to keep your saved settings.',
      'detect.wrongDevice':   "Wrong device for this page. You plugged in {detected}, but this page installs firmware for {expected}. Open the {link} page instead.",
      'detect.unknownDevice': "Connected device reports itself as {detected}. This page installs firmware for {expected}. Make sure you've picked the right device in the chooser.",
      'detect.connectFailed': "Couldn't read the device. Try unplugging and replugging it, then click again.",
      'detect.tryAgain':      'Check again',
      'detect.emptyPrompt':   "Want to know what's already on your device?",
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
      'card.aio.desc':        'Universal device for remote control of switches, signals, and barriers — using the same Powered Up remote that operates your trains.',
      'card.sc.desc':         'Universal device for controlling original LEGO switches using the same Powered Up remote that operates your trains.',
      'device.aio.tagline':   'Universal device for remote control of switches, signals, and barriers using the same Powered Up remote that operates your trains. Works with the Powered Up app and can run in automatic mode using train detectors.',
      'device.sc.tagline':    'Universal device that lets you control original LEGO switches using the same Powered Up remote that operates your trains. Works with the Powered Up app — no modifications to the switch required.',
      'shop.viewProduct':     'View in shop',
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
      'install.step4':        'Wenn die Frage <em>Gerät löschen?</em> erscheint, lasse das Häkchen leer, um deine gespeicherten Einstellungen (gekoppelte Fernbedienung, Weichenfarbe, Anschlusszuweisungen) zu behalten. Klicke dann auf <em>Weiter</em> und <em>Installieren</em>.',
      'install.tip':          '<strong>Tipp:</strong> Wenn du mehr als eine Option siehst, suche nach einem Namen, der <code>USB-SERIAL</code>, <code>CP210x</code> oder <code>CH340</code> enthält.',
      'install.button':       'Firmware installieren',
      'install.verifyFirst': 'Klicke oben auf <strong>Prüfen, was installiert ist</strong>, um dein Gerät vor der Installation zu überprüfen.',
      'detect.button':        'Prüfen, was installiert ist',
      'detect.detecting':     'Gerät wird geprüft…',
      'detect.onDevice':      'Auf deinem Gerät',
      'detect.willInstall':   'Wird installiert',
      'detect.upToDate':      'Du hast bereits die neueste Firmware — kein Update nötig.',
      'detect.outdated':      'Eine neuere Firmware ist verfügbar. Klicke unten auf <strong>Firmware installieren</strong>, um zu aktualisieren; deine gespeicherten Einstellungen bleiben erhalten.',
      'detect.legacyDetected':'v1-Firmware erkannt — das ist die einzige Version ohne Versionsmeldung. Dein Gerät wird normal aktualisiert; wenn das Flash-Tool nach <em>Gerät löschen?</em> fragt, lasse das Häkchen leer, um die gespeicherten Einstellungen zu behalten.',
      'detect.wrongDevice':   'Falsches Gerät für diese Seite. Du hast {detected} angeschlossen, aber diese Seite installiert Firmware für {expected}. Öffne stattdessen die Seite {link}.',
      'detect.unknownDevice': 'Das angeschlossene Gerät meldet sich als {detected}. Diese Seite installiert Firmware für {expected}. Stelle sicher, dass du das richtige Gerät ausgewählt hast.',
      'detect.connectFailed': 'Das Gerät konnte nicht gelesen werden. Stecke es aus und wieder ein, dann klicke erneut.',
      'detect.tryAgain':      'Erneut prüfen',
      'detect.emptyPrompt':   'Möchtest du wissen, was bereits auf deinem Gerät ist?',
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
      'card.aio.desc':        'Universalgerät zur Fernsteuerung von Weichen, Signalen und Schranken — mit derselben Powered Up-Fernbedienung, die deine Züge steuert.',
      'card.sc.desc':         'Universalgerät zur Steuerung originaler LEGO-Weichen mit derselben Powered Up-Fernbedienung, die deine Züge steuert.',
      'device.aio.tagline':   'Universalgerät zur Fernsteuerung von Weichen, Signalen und Schranken mit derselben Powered Up-Fernbedienung, die deine Züge steuert. Funktioniert mit der Powered Up-App und kann im Automatikmodus mit Zugdetektoren laufen.',
      'device.sc.tagline':    'Universalgerät, das die Steuerung originaler LEGO-Weichen mit derselben Powered Up-Fernbedienung ermöglicht, die deine Züge steuert. Funktioniert mit der Powered Up-App — keine Modifikationen an der Weiche erforderlich.',
      'shop.viewProduct':     'Im Shop ansehen',
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
      'install.step4':        "Quand la question <em>Effacer l'appareil ?</em> apparaît, laissez la case décochée pour conserver vos paramètres enregistrés (télécommande appairée, couleur d'aiguillage, affectations de ports). Puis cliquez sur <em>Suivant</em> et <em>Installer</em>.",
      'install.tip':          '<strong>Astuce :</strong> si vous voyez plusieurs options dans la liste, cherchez un nom contenant <code>USB-SERIAL</code>, <code>CP210x</code> ou <code>CH340</code>.',
      'install.button':       'Installer le firmware',
      'install.verifyFirst': "Cliquez sur <strong>Vérifier ce qui est installé</strong> ci-dessus pour vérifier votre appareil avant l'installation.",
      'detect.button':        "Vérifier ce qui est installé",
      'detect.detecting':     "Vérification de l'appareil…",
      'detect.onDevice':      'Sur votre appareil',
      'detect.willInstall':   'Sera installé',
      'detect.upToDate':      "Vous avez déjà la dernière version du firmware — pas de mise à jour nécessaire.",
      'detect.outdated':      'Une nouvelle version du firmware est disponible. Cliquez sur <strong>Installer le firmware</strong> ci-dessous pour mettre à jour ; vos paramètres enregistrés seront conservés.',
      'detect.legacyDetected':"Firmware v1 détecté — c'est la seule version sans rapport de version. Votre appareil sera mis à jour normalement ; quand l'outil de flash demande <em>Effacer l'appareil ?</em>, laissez la case décochée pour conserver vos paramètres enregistrés.",
      'detect.wrongDevice':   "Mauvais appareil pour cette page. Vous avez branché {detected}, mais cette page installe le firmware pour {expected}. Ouvrez plutôt la page {link}.",
      'detect.unknownDevice': "L'appareil connecté se déclare comme {detected}. Cette page installe le firmware pour {expected}. Assurez-vous d'avoir choisi le bon appareil.",
      'detect.connectFailed': "Impossible de lire l'appareil. Débranchez-le, rebranchez-le, puis réessayez.",
      'detect.tryAgain':      'Vérifier à nouveau',
      'detect.emptyPrompt':   "Voulez-vous savoir ce qui est déjà sur votre appareil ?",
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
      'card.aio.desc':        "Dispositif universel pour télécommander aiguillages, signaux et barrières — avec la même télécommande Powered Up qui fait rouler vos trains.",
      'card.sc.desc':         "Dispositif universel pour contrôler les aiguillages LEGO d'origine avec la même télécommande Powered Up qui fait rouler vos trains.",
      'device.aio.tagline':   "Dispositif universel pour télécommander aiguillages, signaux et barrières avec la même télécommande Powered Up qui fait rouler vos trains. Fonctionne avec l'application Powered Up et peut s'exécuter en mode automatique avec les détecteurs de train.",
      'device.sc.tagline':    "Dispositif universel qui permet de contrôler les aiguillages LEGO d'origine avec la même télécommande Powered Up qui fait rouler vos trains. Fonctionne avec l'application Powered Up — aucune modification de l'aiguillage requise.",
      'shop.viewProduct':     'Voir sur la boutique',
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
      'install.step4':        'Cuando aparezca la pregunta <em>¿Borrar dispositivo?</em>, deja la casilla sin marcar para conservar tus ajustes (mando emparejado, color del desvío, asignaciones de puertos). Luego haz clic en <em>Siguiente</em> e <em>Instalar</em>.',
      'install.tip':          '<strong>Consejo:</strong> si ves más de una opción en la lista, busca un nombre que contenga <code>USB-SERIAL</code>, <code>CP210x</code> o <code>CH340</code>.',
      'install.button':       'Instalar firmware',
      'install.verifyFirst': 'Haz clic en <strong>Comprobar qué está instalado</strong> arriba para verificar tu dispositivo antes de instalar.',
      'detect.button':        'Comprobar qué está instalado',
      'detect.detecting':     'Comprobando el dispositivo…',
      'detect.onDevice':      'En tu dispositivo',
      'detect.willInstall':   'Se instalará',
      'detect.upToDate':      'Ya tienes el firmware más reciente — no hace falta actualizar.',
      'detect.outdated':      'Hay una nueva versión del firmware. Haz clic en <strong>Instalar firmware</strong> abajo para actualizar; tus ajustes guardados se conservarán.',
      'detect.legacyDetected':'Firmware v1 detectado — es la única versión sin reporte de versión. Tu dispositivo se actualizará normalmente; cuando la herramienta pregunte <em>¿Borrar dispositivo?</em>, deja la casilla sin marcar para conservar tus ajustes guardados.',
      'detect.wrongDevice':   'Dispositivo equivocado para esta página. Conectaste {detected}, pero esta página instala firmware para {expected}. Abre la página {link} en su lugar.',
      'detect.unknownDevice': 'El dispositivo conectado se identifica como {detected}. Esta página instala firmware para {expected}. Asegúrate de haber elegido el dispositivo correcto.',
      'detect.connectFailed': 'No se pudo leer el dispositivo. Desconéctalo, vuelve a conectarlo y prueba de nuevo.',
      'detect.tryAgain':      'Comprobar de nuevo',
      'detect.emptyPrompt':   '¿Quieres saber qué está ya en tu dispositivo?',
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
      'card.aio.desc':        'Dispositivo universal para el control remoto de desvíos, señales y barreras — con el mismo mando Powered Up que mueve tus trenes.',
      'card.sc.desc':         'Dispositivo universal para controlar los desvíos LEGO originales con el mismo mando Powered Up que mueve tus trenes.',
      'device.aio.tagline':   'Dispositivo universal para el control remoto de desvíos, señales y barreras con el mismo mando Powered Up que mueve tus trenes. Funciona con la app Powered Up y puede operar en modo automático con detectores de tren.',
      'device.sc.tagline':    'Dispositivo universal que permite controlar los desvíos LEGO originales con el mismo mando Powered Up que mueve tus trenes. Funciona con la app Powered Up — no se requieren modificaciones en el desvío.',
      'shop.viewProduct':     'Ver en la tienda',
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
      'install.step4':        'Gdy pojawi się pytanie <em>Erase device?</em>, pozostaw pole niezaznaczone, aby zachować zapisane ustawienia (sparowany pilot, kolor zwrotnicy, przypisania portów). Następnie kliknij <em>Next</em> i <em>Install</em>.',
      'install.tip':          '<strong>Wskazówka:</strong> jeśli na liście widzisz więcej niż jedną opcję, szukaj nazwy zawierającej <code>USB-SERIAL</code>, <code>CP210x</code> lub <code>CH340</code>.',
      'install.button':       'Zainstaluj firmware',
      'install.verifyFirst': 'Kliknij <strong>Sprawdź, co jest zainstalowane</strong> powyżej, aby zweryfikować urządzenie przed instalacją.',
      'detect.button':        'Sprawdź, co jest zainstalowane',
      'detect.detecting':     'Sprawdzanie urządzenia…',
      'detect.onDevice':      'Na Twoim urządzeniu',
      'detect.willInstall':   'Zostanie zainstalowane',
      'detect.upToDate':      "Masz już najnowszy firmware — aktualizacja nie jest potrzebna.",
      'detect.outdated':      "Dostępna jest nowsza wersja firmware'u. Kliknij <strong>Zainstaluj firmware</strong> poniżej, aby zaktualizować; Twoje zapisane ustawienia zostaną zachowane.",
      'detect.legacyDetected':'Wykryto firmware v1 — to jedyna wersja bez raportowania wersji. Urządzenie zostanie zaktualizowane normalnie; gdy narzędzie zapyta <em>Erase device?</em>, pozostaw pole niezaznaczone, aby zachować zapisane ustawienia.',
      'detect.wrongDevice':   'Niewłaściwe urządzenie dla tej strony. Podłączyłeś {detected}, ale ta strona instaluje firmware dla {expected}. Otwórz zamiast tego stronę {link}.',
      'detect.unknownDevice': 'Podłączone urządzenie zgłasza się jako {detected}. Ta strona instaluje firmware dla {expected}. Upewnij się, że wybrałeś właściwe urządzenie.',
      'detect.connectFailed': 'Nie udało się odczytać urządzenia. Odłącz je i podłącz ponownie, a potem kliknij jeszcze raz.',
      'detect.tryAgain':      'Sprawdź ponownie',
      'detect.emptyPrompt':   'Chcesz wiedzieć, co już jest na Twoim urządzeniu?',
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
      'card.aio.desc':        'Uniwersalne urządzenie do zdalnego sterowania zwrotnicami, sygnałami i szlabanami — tym samym pilotem Powered Up, który prowadzi Twoje pociągi.',
      'card.sc.desc':         'Uniwersalne urządzenie do sterowania oryginalnymi zwrotnicami LEGO tym samym pilotem Powered Up, który prowadzi Twoje pociągi.',
      'device.aio.tagline':   'Uniwersalne urządzenie do zdalnego sterowania zwrotnicami, sygnałami i szlabanami tym samym pilotem Powered Up, który prowadzi Twoje pociągi. Współpracuje z aplikacją Powered Up i może działać w trybie automatycznym z detektorami pociągów.',
      'device.sc.tagline':    'Uniwersalne urządzenie pozwalające sterować oryginalnymi zwrotnicami LEGO tym samym pilotem Powered Up, który prowadzi Twoje pociągi. Współpracuje z aplikacją Powered Up — bez konieczności modyfikacji zwrotnicy.',
      'shop.viewProduct':     'Zobacz w sklepie',
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
      'install.step4':        'Als gevraagd wordt <em>Erase device?</em>, laat het vakje uitgevinkt om je opgeslagen instellingen te behouden (gekoppelde afstandsbediening, wisselkleur, poorttoewijzingen). Klik dan op <em>Next</em> en <em>Install</em>.',
      'install.tip':          '<strong>Tip:</strong> als je meer dan één optie in de lijst ziet, zoek dan naar een naam met <code>USB-SERIAL</code>, <code>CP210x</code> of <code>CH340</code>.',
      'install.button':       'Firmware installeren',
      'install.verifyFirst': 'Klik hierboven op <strong>Controleer wat er geïnstalleerd is</strong> om je apparaat te verifiëren voor installatie.',
      'detect.button':        'Controleer wat er geïnstalleerd is',
      'detect.detecting':     'Apparaat controleren…',
      'detect.onDevice':      'Op je apparaat',
      'detect.willInstall':   'Wordt geïnstalleerd',
      'detect.upToDate':      'Je hebt al de nieuwste firmware — geen update nodig.',
      'detect.outdated':      'Er is een nieuwere firmware beschikbaar. Klik hieronder op <strong>Firmware installeren</strong> om te updaten; je opgeslagen instellingen blijven behouden.',
      'detect.legacyDetected':'v1-firmware gedetecteerd — dat is de enige versie zonder versierapportage. Je apparaat wordt normaal bijgewerkt; wanneer de flash-tool vraagt <em>Erase device?</em>, laat het vakje uitgevinkt om je opgeslagen instellingen te behouden.',
      'detect.wrongDevice':   'Verkeerd apparaat voor deze pagina. Je hebt {detected} aangesloten, maar deze pagina installeert firmware voor {expected}. Open in plaats daarvan de pagina {link}.',
      'detect.unknownDevice': 'Het aangesloten apparaat identificeert zich als {detected}. Deze pagina installeert firmware voor {expected}. Zorg dat je het juiste apparaat hebt gekozen.',
      'detect.connectFailed': 'Kon het apparaat niet uitlezen. Probeer het los te koppelen en opnieuw aan te sluiten, en klik dan opnieuw.',
      'detect.tryAgain':      'Opnieuw controleren',
      'detect.emptyPrompt':   'Wil je weten wat er al op je apparaat staat?',
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
      'card.aio.desc':        'Universeel apparaat voor afstandsbediening van wissels, seinen en slagbomen — met dezelfde Powered Up-afstandsbediening die je treinen aanstuurt.',
      'card.sc.desc':         'Universeel apparaat om originele LEGO-wissels te bedienen met dezelfde Powered Up-afstandsbediening die je treinen aanstuurt.',
      'device.aio.tagline':   'Universeel apparaat voor afstandsbediening van wissels, seinen en slagbomen met dezelfde Powered Up-afstandsbediening die je treinen aanstuurt. Werkt met de Powered Up-app en kan in automatische modus draaien met treindetectoren.',
      'device.sc.tagline':    'Universeel apparaat waarmee je originele LEGO-wissels kunt bedienen met dezelfde Powered Up-afstandsbediening die je treinen aanstuurt. Werkt met de Powered Up-app — geen aanpassingen aan de wissel nodig.',
      'shop.viewProduct':     'Bekijk in de webshop',
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
