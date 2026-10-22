// Every text of the panel, in the system's language: French, English, Spanish,
// German, Italian or Portuguese; any other language gets English.
// In the page, data-i18n="key" sets the text (data-i18n-html: trusted markup,
// data-i18n-ph: placeholder, data-i18n-title, data-i18n-aria). In code: t("key", { n: … }).
// Errors coming from Rust are keys too ("err.*"), see errText().

var LANGS = ["fr", "en", "es", "de", "it", "pt"];
var LANG = (function () {
  var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
  for (var i = 0; i < list.length; i++) {
    var code = String(list[i]).toLowerCase().slice(0, 2);
    if (LANGS.indexOf(code) >= 0) return code;
  }
  return "en";
})();
document.documentElement.lang = LANG;

var STR = {
  fr: {
    "home.greet": "Bonjour", "home.subtitle": "Que veux-tu ouvrir ?", "home.settings": "Réglages",
    "card.terminal": "Terminal", "card.application": "Application", "card.manage": "Gérer",
    "card.notSignedIn": "Non connecté · clique ici", "card.notInstalled": "Pas installé · clique ici",
    "card.installing": "Installation en cours…", "card.waiting": "En attente d’installation…",
    "toast.codeInstalled": "Claude Code est installé ✓", "toast.appInstalled": "Claude est installé ✓",
    "toast.oops": "Oups : {e}", "toast.saved": "C’est noté ✓", "toast.wait": "Patiente une seconde…",
    "btn.back": "Retour", "btn.continue": "Continuer", "btn.cancel": "Annuler", "btn.close": "Fermer",
    "btn.uninstall": "Désinstaller", "btn.later": "Plus tard",

    "set.title": "Réglages", "set.name": "Ton prénom", "set.nameHint": "Pour te dire bonjour.", "set.namePh": "Ton prénom",
    "set.check": "Rechercher une mise à jour", "set.checkHint": "ClaudePanel vérifie aussi tout seul à chaque lancement.",
    "set.uninstall": "Désinstaller ClaudePanel", "set.uninstallHint": "Claude, Claude Code et tes skills restent installés.",
    "set.noData": "aucune donnée collectée", "set.indep": "Outil indépendant, non affilié à Anthropic.",

    "tour.welcome": "Bienvenue dans ClaudePanel", "tour.welcomeLead": "Un petit écran d’accueil pour ouvrir Claude en un clic.",
    "tour.code": "L’assistant qui code avec toi, dans le terminal.", "tour.app": "L’application pour discuter avec Claude.",
    "tour.skills": "Ajoute de nouvelles compétences à Claude, sans ligne de commande.",
    "tour.privacy": "Tes données restent à toi", "tour.privacyLead": "ClaudePanel est juste un raccourci. Il ne garde rien.",
    "tour.noData": "Aucune donnée collectée", "tour.noDataHint": "Pas de compte, pas de pub, pas de traqueur. Rien n’est envoyé ni stocké.",
    "tour.anthropic": "Tout passe par Anthropic", "tour.anthropicHint": "Claude, Claude Code et ta connexion passent par les serveurs officiels d’Anthropic. Le panel ne voit jamais ton mot de passe.",
    "tour.open": "Rien de caché", "tour.openHint": "Le code du panel est lisible par tous.",
    "tour.fine": "Seule exception : la météo vient de wttr.in, qui devine ta ville grâce à ton adresse IP.<br>ClaudePanel est un outil indépendant, non affilié à Anthropic.",
    "tour.name": "Comment tu t’appelles ?", "tour.nameLead": "Le panel te dira bonjour avec ton prénom.",
    "tour.nameFine": "Tu pourras le changer plus tard dans les réglages.", "tour.gotIt": "J’ai compris", "tour.go": "C’est parti",

    "bye.title": "Désinstaller ClaudePanel ?", "bye.lead": "Seul le panel sera retiré de ton ordinateur.",
    "bye.gone": "Ce qui part", "bye.goneHint": "Le panel, ses raccourcis et ton prénom enregistré.",
    "bye.stays": "Ce qui reste", "bye.staysHint": "Claude, Claude Code, ton compte et tes skills ne bougent pas.",
    "bye.removing": "Désinstallation…", "bye.step1": "Préparation", "bye.step2": "Suppression de tes réglages",
    "bye.step3": "Retrait de l’application", "bye.step4": "Terminé", "bye.goodbye": "Au revoir",
    "bye.fine": "ClaudePanel disparaîtra dès que tu fermes cette fenêtre.",
    "bye.line1a": "Au revoir{n}…", "bye.line1b": "Tu vas me manquer. Reviens quand tu veux.",
    "bye.line2a": "Snif… déjà ?", "bye.line2b": "Merci d’avoir utilisé ClaudePanel{n}. À bientôt, j’espère.",
    "bye.line3a": "C’était sympa{n}…", "bye.line3b": "Je range mes petites jambes. Prends soin de toi.",

    "upd.button": "Mettre à jour", "upd.available": "ClaudePanel {v} est disponible", "upd.latest": "Tu as déjà la dernière version ✓",
    "upd.cantCheck": "Impossible de vérifier pour l’instant", "upd.title": "Mise à jour…", "upd.downloading": "Téléchargement…",
    "upd.installing": "Installation… ClaudePanel va redémarrer", "upd.failed": "La mise à jour n’a pas pu se faire : {e}",
    "news.title": "Quoi de neuf dans la {v} ?", "news.titleShort": "Quoi de neuf ?", "news.date": "Mise à jour du {d}", "news.ok": "Super !",

    "sheet.skillTitle": "Skill non vérifié", "sheet.installAnyway": "Installer quand même",
    "sheet.skillMsg": "<b>{name}</b> ne provient pas d’un marketplace vérifié par Anthropic. Son code s’exécutera sur ta machine. En l’installant, tu acceptes d’en assumer les risques.",
    "sheet.repoTitle": "Dépôt non vérifié", "sheet.addAnyway": "Ajouter quand même",
    "sheet.repoMsg": "<b>{name}</b> est un dépôt GitHub tiers, non vérifié par Anthropic. Ses plugins s’exécuteront sur ta machine. En l’ajoutant, tu acceptes d’en assumer les risques.",

    "skills.updating": "Mise à jour…", "skills.noSkill": "Aucun skill dans ce plugin.", "skills.uninstall": "Désinstaller",
    "skills.confirm": "Confirmer la suppression", "skills.installed": "Installé", "skills.install": "Installer",
    "skills.unverified": "Skill non vérifié — publié hors des marketplaces Anthropic. Son code s’exécute sur ta machine à tes risques.",
    "skills.repo": "Dépôt GitHub · non vérifié", "skills.add": "Ajouter",
    "skills.needCode": "Installe d’abord Claude Code pour gérer tes skills.", "skills.none": "Aucun résultat",
    "skills.installing": "Installation…", "skills.removing": "Suppression…", "skills.addingRepo": "Ajout du dépôt…",
    "toast.installedRestart": "Installé ✓  Relance Claude Code", "toast.installFail": "Échec de l’installation",
    "toast.uninstalled": "Désinstallé", "toast.uninstallFail": "Échec de la suppression",
    "toast.repoAdded": "Dépôt ajouté ✓", "toast.repoNotFound": "Dépôt introuvable", "toast.copied": "Copié : {c}",
    "sec.ai": "Suggestions de l’IA", "sec.leads": "Premières pistes", "sec.try": "Essaie", "sec.installed": "Installés",
    "sec.toInstall": "À installer", "sec.popular": "Populaires",

    "search.aria": "Recherche de skills", "search.phOff": "Rechercher un skill…", "search.phOn": "Décris ce que tu veux faire…",
    "ai.switch": "Recherche IA", "ai.disabled": "Recherche IA désactivée", "ai.enabled": "Recherche IA activée ✓",
    "ai.hintTyped": "Entrée pour demander à l’IA · la liste se filtre déjà pendant que tu tapes",
    "ai.hintEmpty": "Décris ton besoin et appuie sur Entrée : l’IA trouve les skills qu’il te faut",
    "ai.hintOff": "Active la recherche IA pour décrire ton besoin avec tes mots",
    "ai.understanding": "Je comprends ta demande…", "ai.comparing": "Je compare {n} plugins et je garde les meilleurs…",
    "ai.found1": "1 skill trouvé pour ta demande", "ai.foundN": "{n} skills trouvés pour ta demande",
    "ai.nothing": "Rien ne correspond vraiment. Essaie de décrire ta demande autrement.",
    "ai.offTopic": "Je cherche uniquement des skills pour Claude Code. Essaie par exemple « créer des pages web ».",
    "ai.noMatch": "Aucun skill ne correspond à ta demande pour l’instant.",
    "ai.tries": ["Créer des pages web", "Faire des présentations", "Analyser des données", "Écrire de la documentation", "Tester mon code", "Travailler avec Figma"],

    "intro.title": "La recherche IA", "intro.lead": "Décris ton besoin, l’IA choisit les meilleurs skills pour toi.",
    "intro.credits": "Elle utilise tes crédits Claude", "intro.creditsHint": "Chaque recherche passe par ton Claude Code, avec ton compte, et compte dans ton utilisation.",
    "intro.light": "Très peu gourmande", "intro.lightHint": "Environ 8 000 tokens par recherche avec Haiku, le modèle le plus léger. Seulement quand tu appuies sur Entrée.",
    "intro.anthropic": "Rien ne sort de chez Anthropic", "intro.anthropicHint": "Ta demande va uniquement à leurs serveurs. ClaudePanel ne garde rien.",
    "intro.off": "Désactivable à tout moment", "intro.offHint": "Un clic sur l’interrupteur et la recherche redevient locale, sans crédits.",
    "intro.go": "Activer la recherche IA",

    "install.title": "Installation de Claude Code", "install.source": "Script officiel d’Anthropic : {url}",
    "install.ok": "C’est fait ! Retourne sur ClaudePanel et clique sur Claude Code pour te connecter.",
    "install.fail": "L’installation a échoué : {e}", "install.check": "Vérifie ta connexion Internet puis réessaie depuis ClaudePanel.",
    "install.close": "Appuie sur Entrée pour fermer",

    "err.tooShort": "Décris un peu plus ce que tu veux faire.", "err.aiNoCode": "Installe d’abord Claude Code pour utiliser la recherche IA.",
    "err.aiNoReply": "La recherche IA n’a pas répondu. Vérifie que tu es connecté à Claude Code.",
    "err.aiOff": "La recherche IA est désactivée.", "err.noCode": "Claude Code n’est pas installé.",
    "err.badName": "Nom invalide.", "err.noUninstaller": "Désinstallation introuvable : ClaudePanel n’a pas été installé avec son installateur.",
    "err.noUpdate": "Aucune mise à jour en attente."
  },

  en: {
    "home.greet": "Hello", "home.subtitle": "What do you want to open?", "home.settings": "Settings",
    "card.terminal": "Terminal", "card.application": "App", "card.manage": "Manage",
    "card.notSignedIn": "Signed out · click here", "card.notInstalled": "Not installed · click here",
    "card.installing": "Installing…", "card.waiting": "Waiting for install…",
    "toast.codeInstalled": "Claude Code is installed ✓", "toast.appInstalled": "Claude is installed ✓",
    "toast.oops": "Oops: {e}", "toast.saved": "Saved ✓", "toast.wait": "One second…",
    "btn.back": "Back", "btn.continue": "Continue", "btn.cancel": "Cancel", "btn.close": "Close",
    "btn.uninstall": "Uninstall", "btn.later": "Not now",

    "set.title": "Settings", "set.name": "Your first name", "set.nameHint": "So I can say hello.", "set.namePh": "Your first name",
    "set.check": "Check for updates", "set.checkHint": "ClaudePanel also checks on its own every time it starts.",
    "set.uninstall": "Uninstall ClaudePanel", "set.uninstallHint": "Claude, Claude Code and your skills stay installed.",
    "set.noData": "no data collected", "set.indep": "Independent tool, not affiliated with Anthropic.",

    "tour.welcome": "Welcome to ClaudePanel", "tour.welcomeLead": "A little home screen to open Claude in one click.",
    "tour.code": "The assistant that codes with you, in the terminal.", "tour.app": "The app to chat with Claude.",
    "tour.skills": "Give Claude new abilities, no command line needed.",
    "tour.privacy": "Your data stays yours", "tour.privacyLead": "ClaudePanel is just a shortcut. It keeps nothing.",
    "tour.noData": "No data collected", "tour.noDataHint": "No account, no ads, no trackers. Nothing is sent or stored.",
    "tour.anthropic": "Everything goes through Anthropic", "tour.anthropicHint": "Claude, Claude Code and your sign-in go through Anthropic’s official servers. The panel never sees your password.",
    "tour.open": "Nothing hidden", "tour.openHint": "Anyone can read the panel’s code.",
    "tour.fine": "One exception: the weather comes from wttr.in, which guesses your city from your IP address.<br>ClaudePanel is an independent tool, not affiliated with Anthropic.",
    "tour.name": "What’s your name?", "tour.nameLead": "The panel will greet you by your first name.",
    "tour.nameFine": "You can change it later in the settings.", "tour.gotIt": "Got it", "tour.go": "Let’s go",

    "bye.title": "Uninstall ClaudePanel?", "bye.lead": "Only the panel will be removed from your computer.",
    "bye.gone": "What goes", "bye.goneHint": "The panel, its shortcuts and your saved first name.",
    "bye.stays": "What stays", "bye.staysHint": "Claude, Claude Code, your account and your skills don’t move.",
    "bye.removing": "Uninstalling…", "bye.step1": "Getting ready", "bye.step2": "Removing your settings",
    "bye.step3": "Removing the app", "bye.step4": "Done", "bye.goodbye": "Goodbye",
    "bye.fine": "ClaudePanel will be gone as soon as you close this window.",
    "bye.line1a": "Goodbye{n}…", "bye.line1b": "I’ll miss you. Come back whenever you like.",
    "bye.line2a": "Sniff… already?", "bye.line2b": "Thanks for using ClaudePanel{n}. See you soon, I hope.",
    "bye.line3a": "That was fun{n}…", "bye.line3b": "I’m packing up my little legs. Take care.",

    "upd.button": "Update", "upd.available": "ClaudePanel {v} is available", "upd.latest": "You already have the latest version ✓",
    "upd.cantCheck": "Can’t check right now", "upd.title": "Updating…", "upd.downloading": "Downloading…",
    "upd.installing": "Installing… ClaudePanel will restart", "upd.failed": "The update didn’t go through: {e}",
    "news.title": "What’s new in {v}?", "news.titleShort": "What’s new?", "news.date": "Updated {d}", "news.ok": "Great!",

    "sheet.skillTitle": "Unverified skill", "sheet.installAnyway": "Install anyway",
    "sheet.skillMsg": "<b>{name}</b> doesn’t come from a marketplace verified by Anthropic. Its code will run on your computer. By installing it, you accept the risks.",
    "sheet.repoTitle": "Unverified repository", "sheet.addAnyway": "Add anyway",
    "sheet.repoMsg": "<b>{name}</b> is a third-party GitHub repository, not verified by Anthropic. Its plugins will run on your computer. By adding it, you accept the risks.",

    "skills.updating": "Updating…", "skills.noSkill": "No skills in this plugin.", "skills.uninstall": "Uninstall",
    "skills.confirm": "Confirm removal", "skills.installed": "Installed", "skills.install": "Install",
    "skills.unverified": "Unverified skill — published outside Anthropic’s marketplaces. Its code runs on your computer at your own risk.",
    "skills.repo": "GitHub repository · unverified", "skills.add": "Add",
    "skills.needCode": "Install Claude Code first to manage your skills.", "skills.none": "No results",
    "skills.installing": "Installing…", "skills.removing": "Removing…", "skills.addingRepo": "Adding repository…",
    "toast.installedRestart": "Installed ✓  Restart Claude Code", "toast.installFail": "Install failed",
    "toast.uninstalled": "Uninstalled", "toast.uninstallFail": "Removal failed",
    "toast.repoAdded": "Repository added ✓", "toast.repoNotFound": "Repository not found", "toast.copied": "Copied: {c}",
    "sec.ai": "AI suggestions", "sec.leads": "First leads", "sec.try": "Try", "sec.installed": "Installed",
    "sec.toInstall": "To install", "sec.popular": "Popular",

    "search.aria": "Skill search", "search.phOff": "Search for a skill…", "search.phOn": "Describe what you want to do…",
    "ai.switch": "AI search", "ai.disabled": "AI search off", "ai.enabled": "AI search on ✓",
    "ai.hintTyped": "Enter to ask the AI · the list already filters as you type",
    "ai.hintEmpty": "Describe what you need and press Enter: the AI finds the right skills",
    "ai.hintOff": "Turn on AI search to describe what you need in your own words",
    "ai.understanding": "Understanding your request…", "ai.comparing": "Comparing {n} plugins and keeping the best…",
    "ai.found1": "1 skill found for your request", "ai.foundN": "{n} skills found for your request",
    "ai.nothing": "Nothing really fits. Try describing your request differently.",
    "ai.offTopic": "I only look for Claude Code skills. Try for example “build web pages”.",
    "ai.noMatch": "No skill matches your request for now.",
    "ai.tries": ["Build web pages", "Make presentations", "Analyze data", "Write documentation", "Test my code", "Work with Figma"],

    "intro.title": "AI search", "intro.lead": "Describe what you need, the AI picks the best skills for you.",
    "intro.credits": "It uses your Claude credits", "intro.creditsHint": "Each search goes through your Claude Code, with your account, and counts toward your usage.",
    "intro.light": "Very light", "intro.lightHint": "About 8,000 tokens per search with Haiku, the lightest model. Only when you press Enter.",
    "intro.anthropic": "Nothing leaves Anthropic", "intro.anthropicHint": "Your request only goes to their servers. ClaudePanel keeps nothing.",
    "intro.off": "Turn it off anytime", "intro.offHint": "One click on the switch and search is local again, no credits.",
    "intro.go": "Turn on AI search",

    "install.title": "Installing Claude Code", "install.source": "Anthropic’s official script: {url}",
    "install.ok": "Done! Go back to ClaudePanel and click Claude Code to sign in.",
    "install.fail": "The install failed: {e}", "install.check": "Check your internet connection, then try again from ClaudePanel.",
    "install.close": "Press Enter to close",

    "err.tooShort": "Tell me a bit more about what you want to do.", "err.aiNoCode": "Install Claude Code first to use AI search.",
    "err.aiNoReply": "AI search didn’t answer. Check that you’re signed in to Claude Code.",
    "err.aiOff": "AI search is off.", "err.noCode": "Claude Code isn’t installed.",
    "err.badName": "Invalid name.", "err.noUninstaller": "Uninstaller not found: ClaudePanel wasn’t installed with its installer.",
    "err.noUpdate": "No pending update."
  },

  es: {
    "home.greet": "Hola", "home.subtitle": "¿Qué quieres abrir?", "home.settings": "Ajustes",
    "card.terminal": "Terminal", "card.application": "Aplicación", "card.manage": "Gestionar",
    "card.notSignedIn": "Sin sesión · haz clic aquí", "card.notInstalled": "No instalado · haz clic aquí",
    "card.installing": "Instalando…", "card.waiting": "Esperando la instalación…",
    "toast.codeInstalled": "Claude Code está instalado ✓", "toast.appInstalled": "Claude está instalado ✓",
    "toast.oops": "Ups: {e}", "toast.saved": "Guardado ✓", "toast.wait": "Un segundo…",
    "btn.back": "Atrás", "btn.continue": "Continuar", "btn.cancel": "Cancelar", "btn.close": "Cerrar",
    "btn.uninstall": "Desinstalar", "btn.later": "Más tarde",

    "set.title": "Ajustes", "set.name": "Tu nombre", "set.nameHint": "Para saludarte.", "set.namePh": "Tu nombre",
    "set.check": "Buscar actualizaciones", "set.checkHint": "ClaudePanel también lo comprueba solo cada vez que se abre.",
    "set.uninstall": "Desinstalar ClaudePanel", "set.uninstallHint": "Claude, Claude Code y tus skills siguen instalados.",
    "set.noData": "ningún dato recopilado", "set.indep": "Herramienta independiente, sin relación con Anthropic.",

    "tour.welcome": "Bienvenido a ClaudePanel", "tour.welcomeLead": "Una pequeña pantalla de inicio para abrir Claude con un clic.",
    "tour.code": "El asistente que programa contigo, en la terminal.", "tour.app": "La aplicación para conversar con Claude.",
    "tour.skills": "Dale nuevas habilidades a Claude, sin línea de comandos.",
    "tour.privacy": "Tus datos son tuyos", "tour.privacyLead": "ClaudePanel es solo un atajo. No guarda nada.",
    "tour.noData": "Ningún dato recopilado", "tour.noDataHint": "Sin cuenta, sin anuncios, sin rastreadores. No se envía ni se guarda nada.",
    "tour.anthropic": "Todo pasa por Anthropic", "tour.anthropicHint": "Claude, Claude Code y tu inicio de sesión pasan por los servidores oficiales de Anthropic. El panel nunca ve tu contraseña.",
    "tour.open": "Nada oculto", "tour.openHint": "Cualquiera puede leer el código del panel.",
    "tour.fine": "Única excepción: el tiempo viene de wttr.in, que adivina tu ciudad por tu dirección IP.<br>ClaudePanel es una herramienta independiente, sin relación con Anthropic.",
    "tour.name": "¿Cómo te llamas?", "tour.nameLead": "El panel te saludará por tu nombre.",
    "tour.nameFine": "Podrás cambiarlo más tarde en los ajustes.", "tour.gotIt": "Entendido", "tour.go": "¡Vamos!",

    "bye.title": "¿Desinstalar ClaudePanel?", "bye.lead": "Solo se quitará el panel de tu ordenador.",
    "bye.gone": "Lo que se va", "bye.goneHint": "El panel, sus accesos directos y tu nombre guardado.",
    "bye.stays": "Lo que se queda", "bye.staysHint": "Claude, Claude Code, tu cuenta y tus skills no se tocan.",
    "bye.removing": "Desinstalando…", "bye.step1": "Preparando", "bye.step2": "Borrando tus ajustes",
    "bye.step3": "Quitando la aplicación", "bye.step4": "Listo", "bye.goodbye": "Adiós",
    "bye.fine": "ClaudePanel desaparecerá en cuanto cierres esta ventana.",
    "bye.line1a": "Adiós{n}…", "bye.line1b": "Te voy a echar de menos. Vuelve cuando quieras.",
    "bye.line2a": "Snif… ¿ya?", "bye.line2b": "Gracias por usar ClaudePanel{n}. Hasta pronto, espero.",
    "bye.line3a": "Fue un placer{n}…", "bye.line3b": "Recojo mis patitas. Cuídate.",

    "upd.button": "Actualizar", "upd.available": "ClaudePanel {v} está disponible", "upd.latest": "Ya tienes la última versión ✓",
    "upd.cantCheck": "No se puede comprobar ahora", "upd.title": "Actualizando…", "upd.downloading": "Descargando…",
    "upd.installing": "Instalando… ClaudePanel se reiniciará", "upd.failed": "No se pudo actualizar: {e}",
    "news.title": "¿Qué hay de nuevo en la {v}?", "news.titleShort": "¿Qué hay de nuevo?", "news.date": "Actualizado el {d}", "news.ok": "¡Genial!",

    "sheet.skillTitle": "Skill no verificado", "sheet.installAnyway": "Instalar igualmente",
    "sheet.skillMsg": "<b>{name}</b> no viene de un marketplace verificado por Anthropic. Su código se ejecutará en tu ordenador. Al instalarlo, aceptas los riesgos.",
    "sheet.repoTitle": "Repositorio no verificado", "sheet.addAnyway": "Añadir igualmente",
    "sheet.repoMsg": "<b>{name}</b> es un repositorio de GitHub de terceros, no verificado por Anthropic. Sus plugins se ejecutarán en tu ordenador. Al añadirlo, aceptas los riesgos.",

    "skills.updating": "Actualizando…", "skills.noSkill": "No hay skills en este plugin.", "skills.uninstall": "Desinstalar",
    "skills.confirm": "Confirmar la eliminación", "skills.installed": "Instalado", "skills.install": "Instalar",
    "skills.unverified": "Skill no verificado: publicado fuera de los marketplaces de Anthropic. Su código se ejecuta en tu ordenador bajo tu responsabilidad.",
    "skills.repo": "Repositorio de GitHub · no verificado", "skills.add": "Añadir",
    "skills.needCode": "Instala primero Claude Code para gestionar tus skills.", "skills.none": "Sin resultados",
    "skills.installing": "Instalando…", "skills.removing": "Eliminando…", "skills.addingRepo": "Añadiendo el repositorio…",
    "toast.installedRestart": "Instalado ✓  Reinicia Claude Code", "toast.installFail": "Error al instalar",
    "toast.uninstalled": "Desinstalado", "toast.uninstallFail": "Error al eliminar",
    "toast.repoAdded": "Repositorio añadido ✓", "toast.repoNotFound": "Repositorio no encontrado", "toast.copied": "Copiado: {c}",
    "sec.ai": "Sugerencias de la IA", "sec.leads": "Primeras pistas", "sec.try": "Prueba", "sec.installed": "Instalados",
    "sec.toInstall": "Para instalar", "sec.popular": "Populares",

    "search.aria": "Búsqueda de skills", "search.phOff": "Buscar un skill…", "search.phOn": "Describe lo que quieres hacer…",
    "ai.switch": "Búsqueda IA", "ai.disabled": "Búsqueda IA desactivada", "ai.enabled": "Búsqueda IA activada ✓",
    "ai.hintTyped": "Enter para preguntar a la IA · la lista ya se filtra mientras escribes",
    "ai.hintEmpty": "Describe lo que necesitas y pulsa Enter: la IA encuentra los skills adecuados",
    "ai.hintOff": "Activa la búsqueda IA para describir lo que necesitas con tus palabras",
    "ai.understanding": "Entendiendo tu petición…", "ai.comparing": "Comparando {n} plugins y quedándome con los mejores…",
    "ai.found1": "1 skill encontrado para tu petición", "ai.foundN": "{n} skills encontrados para tu petición",
    "ai.nothing": "Nada encaja de verdad. Prueba a describir tu petición de otra forma.",
    "ai.offTopic": "Solo busco skills para Claude Code. Prueba por ejemplo «crear páginas web».",
    "ai.noMatch": "Ningún skill coincide con tu petición por ahora.",
    "ai.tries": ["Crear páginas web", "Hacer presentaciones", "Analizar datos", "Escribir documentación", "Probar mi código", "Trabajar con Figma"],

    "intro.title": "La búsqueda IA", "intro.lead": "Describe lo que necesitas y la IA elige los mejores skills por ti.",
    "intro.credits": "Usa tus créditos de Claude", "intro.creditsHint": "Cada búsqueda pasa por tu Claude Code, con tu cuenta, y cuenta en tu uso.",
    "intro.light": "Consume muy poco", "intro.lightHint": "Unos 8000 tokens por búsqueda con Haiku, el modelo más ligero. Solo cuando pulsas Enter.",
    "intro.anthropic": "Nada sale de Anthropic", "intro.anthropicHint": "Tu petición solo va a sus servidores. ClaudePanel no guarda nada.",
    "intro.off": "Desactivable en cualquier momento", "intro.offHint": "Un clic en el interruptor y la búsqueda vuelve a ser local, sin créditos.",
    "intro.go": "Activar la búsqueda IA",

    "install.title": "Instalación de Claude Code", "install.source": "Script oficial de Anthropic: {url}",
    "install.ok": "¡Listo! Vuelve a ClaudePanel y haz clic en Claude Code para iniciar sesión.",
    "install.fail": "La instalación falló: {e}", "install.check": "Comprueba tu conexión a internet y vuelve a intentarlo desde ClaudePanel.",
    "install.close": "Pulsa Enter para cerrar",

    "err.tooShort": "Cuéntame un poco más lo que quieres hacer.", "err.aiNoCode": "Instala primero Claude Code para usar la búsqueda IA.",
    "err.aiNoReply": "La búsqueda IA no respondió. Comprueba que has iniciado sesión en Claude Code.",
    "err.aiOff": "La búsqueda IA está desactivada.", "err.noCode": "Claude Code no está instalado.",
    "err.badName": "Nombre no válido.", "err.noUninstaller": "Desinstalador no encontrado: ClaudePanel no se instaló con su instalador.",
    "err.noUpdate": "No hay ninguna actualización pendiente."
  },

  de: {
    "home.greet": "Hallo", "home.subtitle": "Was möchtest du öffnen?", "home.settings": "Einstellungen",
    "card.terminal": "Terminal", "card.application": "App", "card.manage": "Verwalten",
    "card.notSignedIn": "Nicht angemeldet · hier klicken", "card.notInstalled": "Nicht installiert · hier klicken",
    "card.installing": "Wird installiert…", "card.waiting": "Warte auf die Installation…",
    "toast.codeInstalled": "Claude Code ist installiert ✓", "toast.appInstalled": "Claude ist installiert ✓",
    "toast.oops": "Hoppla: {e}", "toast.saved": "Gespeichert ✓", "toast.wait": "Einen Moment…",
    "btn.back": "Zurück", "btn.continue": "Weiter", "btn.cancel": "Abbrechen", "btn.close": "Schließen",
    "btn.uninstall": "Deinstallieren", "btn.later": "Später",

    "set.title": "Einstellungen", "set.name": "Dein Vorname", "set.nameHint": "Damit ich dich begrüßen kann.", "set.namePh": "Dein Vorname",
    "set.check": "Nach Updates suchen", "set.checkHint": "ClaudePanel prüft das auch selbst bei jedem Start.",
    "set.uninstall": "ClaudePanel deinstallieren", "set.uninstallHint": "Claude, Claude Code und deine Skills bleiben installiert.",
    "set.noData": "keine Daten erfasst", "set.indep": "Unabhängiges Tool, nicht mit Anthropic verbunden.",

    "tour.welcome": "Willkommen bei ClaudePanel", "tour.welcomeLead": "Ein kleiner Startbildschirm, um Claude mit einem Klick zu öffnen.",
    "tour.code": "Der Assistent, der mit dir programmiert, im Terminal.", "tour.app": "Die App, um mit Claude zu chatten.",
    "tour.skills": "Gib Claude neue Fähigkeiten, ganz ohne Kommandozeile.",
    "tour.privacy": "Deine Daten gehören dir", "tour.privacyLead": "ClaudePanel ist nur eine Verknüpfung. Es speichert nichts.",
    "tour.noData": "Keine Daten erfasst", "tour.noDataHint": "Kein Konto, keine Werbung, kein Tracking. Nichts wird gesendet oder gespeichert.",
    "tour.anthropic": "Alles läuft über Anthropic", "tour.anthropicHint": "Claude, Claude Code und deine Anmeldung laufen über die offiziellen Server von Anthropic. Das Panel sieht nie dein Passwort.",
    "tour.open": "Nichts versteckt", "tour.openHint": "Der Code des Panels ist für alle lesbar.",
    "tour.fine": "Einzige Ausnahme: Das Wetter kommt von wttr.in, das deine Stadt anhand deiner IP-Adresse schätzt.<br>ClaudePanel ist ein unabhängiges Tool, nicht mit Anthropic verbunden.",
    "tour.name": "Wie heißt du?", "tour.nameLead": "Das Panel begrüßt dich mit deinem Vornamen.",
    "tour.nameFine": "Du kannst ihn später in den Einstellungen ändern.", "tour.gotIt": "Verstanden", "tour.go": "Los geht’s",

    "bye.title": "ClaudePanel deinstallieren?", "bye.lead": "Nur das Panel wird von deinem Computer entfernt.",
    "bye.gone": "Was entfernt wird", "bye.goneHint": "Das Panel, seine Verknüpfungen und dein gespeicherter Vorname.",
    "bye.stays": "Was bleibt", "bye.staysHint": "Claude, Claude Code, dein Konto und deine Skills bleiben unberührt.",
    "bye.removing": "Wird deinstalliert…", "bye.step1": "Vorbereitung", "bye.step2": "Deine Einstellungen werden gelöscht",
    "bye.step3": "Die App wird entfernt", "bye.step4": "Fertig", "bye.goodbye": "Tschüss",
    "bye.fine": "ClaudePanel verschwindet, sobald du dieses Fenster schließt.",
    "bye.line1a": "Tschüss{n}…", "bye.line1b": "Du wirst mir fehlen. Komm zurück, wann immer du willst.",
    "bye.line2a": "Schnief… schon?", "bye.line2b": "Danke, dass du ClaudePanel benutzt hast{n}. Bis bald, hoffe ich.",
    "bye.line3a": "Das war schön{n}…", "bye.line3b": "Ich packe meine kleinen Beine ein. Mach’s gut.",

    "upd.button": "Aktualisieren", "upd.available": "ClaudePanel {v} ist verfügbar", "upd.latest": "Du hast bereits die neueste Version ✓",
    "upd.cantCheck": "Gerade keine Prüfung möglich", "upd.title": "Update…", "upd.downloading": "Wird heruntergeladen…",
    "upd.installing": "Wird installiert… ClaudePanel startet neu", "upd.failed": "Das Update hat nicht geklappt: {e}",
    "news.title": "Was ist neu in {v}?", "news.titleShort": "Was ist neu?", "news.date": "Update vom {d}", "news.ok": "Super!",

    "sheet.skillTitle": "Nicht verifizierter Skill", "sheet.installAnyway": "Trotzdem installieren",
    "sheet.skillMsg": "<b>{name}</b> stammt nicht aus einem von Anthropic verifizierten Marketplace. Sein Code läuft auf deinem Computer. Mit der Installation übernimmst du das Risiko.",
    "sheet.repoTitle": "Nicht verifiziertes Repository", "sheet.addAnyway": "Trotzdem hinzufügen",
    "sheet.repoMsg": "<b>{name}</b> ist ein GitHub-Repository eines Drittanbieters, nicht von Anthropic verifiziert. Seine Plugins laufen auf deinem Computer. Mit dem Hinzufügen übernimmst du das Risiko.",

    "skills.updating": "Wird aktualisiert…", "skills.noSkill": "Keine Skills in diesem Plugin.", "skills.uninstall": "Deinstallieren",
    "skills.confirm": "Entfernen bestätigen", "skills.installed": "Installiert", "skills.install": "Installieren",
    "skills.unverified": "Nicht verifizierter Skill – außerhalb der Anthropic-Marketplaces veröffentlicht. Sein Code läuft auf deinem Computer auf eigenes Risiko.",
    "skills.repo": "GitHub-Repository · nicht verifiziert", "skills.add": "Hinzufügen",
    "skills.needCode": "Installiere zuerst Claude Code, um deine Skills zu verwalten.", "skills.none": "Keine Ergebnisse",
    "skills.installing": "Wird installiert…", "skills.removing": "Wird entfernt…", "skills.addingRepo": "Repository wird hinzugefügt…",
    "toast.installedRestart": "Installiert ✓  Starte Claude Code neu", "toast.installFail": "Installation fehlgeschlagen",
    "toast.uninstalled": "Deinstalliert", "toast.uninstallFail": "Entfernen fehlgeschlagen",
    "toast.repoAdded": "Repository hinzugefügt ✓", "toast.repoNotFound": "Repository nicht gefunden", "toast.copied": "Kopiert: {c}",
    "sec.ai": "Vorschläge der KI", "sec.leads": "Erste Treffer", "sec.try": "Probier mal", "sec.installed": "Installiert",
    "sec.toInstall": "Zum Installieren", "sec.popular": "Beliebt",

    "search.aria": "Skill-Suche", "search.phOff": "Einen Skill suchen…", "search.phOn": "Beschreib, was du tun möchtest…",
    "ai.switch": "KI-Suche", "ai.disabled": "KI-Suche aus", "ai.enabled": "KI-Suche an ✓",
    "ai.hintTyped": "Enter, um die KI zu fragen · die Liste filtert schon beim Tippen",
    "ai.hintEmpty": "Beschreib, was du brauchst, und drück Enter: Die KI findet die passenden Skills",
    "ai.hintOff": "Schalte die KI-Suche ein, um dein Anliegen in eigenen Worten zu beschreiben",
    "ai.understanding": "Ich verstehe deine Anfrage…", "ai.comparing": "Ich vergleiche {n} Plugins und behalte die besten…",
    "ai.found1": "1 Skill für deine Anfrage gefunden", "ai.foundN": "{n} Skills für deine Anfrage gefunden",
    "ai.nothing": "Nichts passt wirklich. Versuch, deine Anfrage anders zu beschreiben.",
    "ai.offTopic": "Ich suche nur Skills für Claude Code. Probier zum Beispiel „Webseiten erstellen“.",
    "ai.noMatch": "Im Moment passt kein Skill zu deiner Anfrage.",
    "ai.tries": ["Webseiten erstellen", "Präsentationen machen", "Daten analysieren", "Dokumentation schreiben", "Meinen Code testen", "Mit Figma arbeiten"],

    "intro.title": "Die KI-Suche", "intro.lead": "Beschreib, was du brauchst, und die KI wählt die besten Skills für dich.",
    "intro.credits": "Sie nutzt dein Claude-Kontingent", "intro.creditsHint": "Jede Suche läuft über dein Claude Code, mit deinem Konto, und zählt zu deiner Nutzung.",
    "intro.light": "Sehr sparsam", "intro.lightHint": "Etwa 8.000 Tokens pro Suche mit Haiku, dem leichtesten Modell. Nur wenn du Enter drückst.",
    "intro.anthropic": "Nichts verlässt Anthropic", "intro.anthropicHint": "Deine Anfrage geht nur an deren Server. ClaudePanel speichert nichts.",
    "intro.off": "Jederzeit abschaltbar", "intro.offHint": "Ein Klick auf den Schalter und die Suche ist wieder lokal, ohne Kontingent.",
    "intro.go": "KI-Suche einschalten",

    "install.title": "Claude Code wird installiert", "install.source": "Offizielles Skript von Anthropic: {url}",
    "install.ok": "Fertig! Geh zurück zu ClaudePanel und klick auf Claude Code, um dich anzumelden.",
    "install.fail": "Die Installation ist fehlgeschlagen: {e}", "install.check": "Prüfe deine Internetverbindung und versuch es dann in ClaudePanel erneut.",
    "install.close": "Drück Enter zum Schließen",

    "err.tooShort": "Erzähl mir etwas mehr darüber, was du tun möchtest.", "err.aiNoCode": "Installiere zuerst Claude Code, um die KI-Suche zu nutzen.",
    "err.aiNoReply": "Die KI-Suche hat nicht geantwortet. Prüfe, ob du in Claude Code angemeldet bist.",
    "err.aiOff": "Die KI-Suche ist ausgeschaltet.", "err.noCode": "Claude Code ist nicht installiert.",
    "err.badName": "Ungültiger Name.", "err.noUninstaller": "Deinstallationsprogramm nicht gefunden: ClaudePanel wurde nicht mit seinem Installationsprogramm installiert.",
    "err.noUpdate": "Kein Update ausstehend."
  },

  it: {
    "home.greet": "Ciao", "home.subtitle": "Cosa vuoi aprire?", "home.settings": "Impostazioni",
    "card.terminal": "Terminale", "card.application": "App", "card.manage": "Gestisci",
    "card.notSignedIn": "Non connesso · clicca qui", "card.notInstalled": "Non installato · clicca qui",
    "card.installing": "Installazione in corso…", "card.waiting": "In attesa dell’installazione…",
    "toast.codeInstalled": "Claude Code è installato ✓", "toast.appInstalled": "Claude è installato ✓",
    "toast.oops": "Ops: {e}", "toast.saved": "Salvato ✓", "toast.wait": "Un attimo…",
    "btn.back": "Indietro", "btn.continue": "Continua", "btn.cancel": "Annulla", "btn.close": "Chiudi",
    "btn.uninstall": "Disinstalla", "btn.later": "Più tardi",

    "set.title": "Impostazioni", "set.name": "Il tuo nome", "set.nameHint": "Per salutarti.", "set.namePh": "Il tuo nome",
    "set.check": "Cerca aggiornamenti", "set.checkHint": "ClaudePanel controlla anche da solo a ogni avvio.",
    "set.uninstall": "Disinstalla ClaudePanel", "set.uninstallHint": "Claude, Claude Code e i tuoi skill restano installati.",
    "set.noData": "nessun dato raccolto", "set.indep": "Strumento indipendente, non affiliato ad Anthropic.",

    "tour.welcome": "Benvenuto in ClaudePanel", "tour.welcomeLead": "Una piccola schermata iniziale per aprire Claude con un clic.",
    "tour.code": "L’assistente che programma con te, nel terminale.", "tour.app": "L’app per chattare con Claude.",
    "tour.skills": "Dai a Claude nuove capacità, senza riga di comando.",
    "tour.privacy": "I tuoi dati restano tuoi", "tour.privacyLead": "ClaudePanel è solo una scorciatoia. Non conserva nulla.",
    "tour.noData": "Nessun dato raccolto", "tour.noDataHint": "Nessun account, nessuna pubblicità, nessun tracciamento. Nulla viene inviato o salvato.",
    "tour.anthropic": "Tutto passa da Anthropic", "tour.anthropicHint": "Claude, Claude Code e il tuo accesso passano dai server ufficiali di Anthropic. Il pannello non vede mai la tua password.",
    "tour.open": "Niente di nascosto", "tour.openHint": "Il codice del pannello è leggibile da tutti.",
    "tour.fine": "Unica eccezione: il meteo arriva da wttr.in, che indovina la tua città dal tuo indirizzo IP.<br>ClaudePanel è uno strumento indipendente, non affiliato ad Anthropic.",
    "tour.name": "Come ti chiami?", "tour.nameLead": "Il pannello ti saluterà con il tuo nome.",
    "tour.nameFine": "Potrai cambiarlo più tardi nelle impostazioni.", "tour.gotIt": "Ho capito", "tour.go": "Andiamo",

    "bye.title": "Disinstallare ClaudePanel?", "bye.lead": "Verrà rimosso solo il pannello dal tuo computer.",
    "bye.gone": "Cosa se ne va", "bye.goneHint": "Il pannello, i suoi collegamenti e il tuo nome salvato.",
    "bye.stays": "Cosa resta", "bye.staysHint": "Claude, Claude Code, il tuo account e i tuoi skill non si toccano.",
    "bye.removing": "Disinstallazione…", "bye.step1": "Preparazione", "bye.step2": "Rimozione delle tue impostazioni",
    "bye.step3": "Rimozione dell’app", "bye.step4": "Fatto", "bye.goodbye": "Arrivederci",
    "bye.fine": "ClaudePanel sparirà appena chiudi questa finestra.",
    "bye.line1a": "Arrivederci{n}…", "bye.line1b": "Mi mancherai. Torna quando vuoi.",
    "bye.line2a": "Snif… di già?", "bye.line2b": "Grazie per aver usato ClaudePanel{n}. A presto, spero.",
    "bye.line3a": "È stato bello{n}…", "bye.line3b": "Metto via le mie gambette. Abbi cura di te.",

    "upd.button": "Aggiorna", "upd.available": "ClaudePanel {v} è disponibile", "upd.latest": "Hai già l’ultima versione ✓",
    "upd.cantCheck": "Impossibile controllare adesso", "upd.title": "Aggiornamento…", "upd.downloading": "Download in corso…",
    "upd.installing": "Installazione… ClaudePanel si riavvierà", "upd.failed": "L’aggiornamento non è riuscito: {e}",
    "news.title": "Le novità della {v}", "news.titleShort": "Le novità", "news.date": "Aggiornamento del {d}", "news.ok": "Fantastico!",

    "sheet.skillTitle": "Skill non verificato", "sheet.installAnyway": "Installa comunque",
    "sheet.skillMsg": "<b>{name}</b> non proviene da un marketplace verificato da Anthropic. Il suo codice verrà eseguito sul tuo computer. Installandolo, ti assumi i rischi.",
    "sheet.repoTitle": "Repository non verificato", "sheet.addAnyway": "Aggiungi comunque",
    "sheet.repoMsg": "<b>{name}</b> è un repository GitHub di terzi, non verificato da Anthropic. I suoi plugin verranno eseguiti sul tuo computer. Aggiungendolo, ti assumi i rischi.",

    "skills.updating": "Aggiornamento…", "skills.noSkill": "Nessuno skill in questo plugin.", "skills.uninstall": "Disinstalla",
    "skills.confirm": "Conferma la rimozione", "skills.installed": "Installato", "skills.install": "Installa",
    "skills.unverified": "Skill non verificato: pubblicato fuori dai marketplace di Anthropic. Il suo codice gira sul tuo computer a tuo rischio.",
    "skills.repo": "Repository GitHub · non verificato", "skills.add": "Aggiungi",
    "skills.needCode": "Installa prima Claude Code per gestire i tuoi skill.", "skills.none": "Nessun risultato",
    "skills.installing": "Installazione…", "skills.removing": "Rimozione…", "skills.addingRepo": "Aggiunta del repository…",
    "toast.installedRestart": "Installato ✓  Riavvia Claude Code", "toast.installFail": "Installazione non riuscita",
    "toast.uninstalled": "Disinstallato", "toast.uninstallFail": "Rimozione non riuscita",
    "toast.repoAdded": "Repository aggiunto ✓", "toast.repoNotFound": "Repository non trovato", "toast.copied": "Copiato: {c}",
    "sec.ai": "Suggerimenti dell’IA", "sec.leads": "Prime piste", "sec.try": "Prova", "sec.installed": "Installati",
    "sec.toInstall": "Da installare", "sec.popular": "Popolari",

    "search.aria": "Ricerca di skill", "search.phOff": "Cerca uno skill…", "search.phOn": "Descrivi cosa vuoi fare…",
    "ai.switch": "Ricerca IA", "ai.disabled": "Ricerca IA disattivata", "ai.enabled": "Ricerca IA attivata ✓",
    "ai.hintTyped": "Invio per chiedere all’IA · l’elenco si filtra già mentre scrivi",
    "ai.hintEmpty": "Descrivi di cosa hai bisogno e premi Invio: l’IA trova gli skill giusti",
    "ai.hintOff": "Attiva la ricerca IA per descrivere ciò che ti serve con parole tue",
    "ai.understanding": "Sto capendo la tua richiesta…", "ai.comparing": "Confronto {n} plugin e tengo i migliori…",
    "ai.found1": "1 skill trovato per la tua richiesta", "ai.foundN": "{n} skill trovati per la tua richiesta",
    "ai.nothing": "Niente corrisponde davvero. Prova a descrivere la richiesta in un altro modo.",
    "ai.offTopic": "Cerco solo skill per Claude Code. Prova per esempio «creare pagine web».",
    "ai.noMatch": "Per ora nessuno skill corrisponde alla tua richiesta.",
    "ai.tries": ["Creare pagine web", "Fare presentazioni", "Analizzare dati", "Scrivere documentazione", "Testare il mio codice", "Lavorare con Figma"],

    "intro.title": "La ricerca IA", "intro.lead": "Descrivi di cosa hai bisogno, l’IA sceglie per te i migliori skill.",
    "intro.credits": "Usa i tuoi crediti Claude", "intro.creditsHint": "Ogni ricerca passa dal tuo Claude Code, con il tuo account, e conta nel tuo utilizzo.",
    "intro.light": "Consuma pochissimo", "intro.lightHint": "Circa 8.000 token per ricerca con Haiku, il modello più leggero. Solo quando premi Invio.",
    "intro.anthropic": "Nulla esce da Anthropic", "intro.anthropicHint": "La tua richiesta va solo ai loro server. ClaudePanel non conserva nulla.",
    "intro.off": "Disattivabile in qualsiasi momento", "intro.offHint": "Un clic sull’interruttore e la ricerca torna locale, senza crediti.",
    "intro.go": "Attiva la ricerca IA",

    "install.title": "Installazione di Claude Code", "install.source": "Script ufficiale di Anthropic: {url}",
    "install.ok": "Fatto! Torna su ClaudePanel e clicca su Claude Code per accedere.",
    "install.fail": "L’installazione non è riuscita: {e}", "install.check": "Controlla la connessione a internet e riprova da ClaudePanel.",
    "install.close": "Premi Invio per chiudere",

    "err.tooShort": "Dimmi qualcosa in più su cosa vuoi fare.", "err.aiNoCode": "Installa prima Claude Code per usare la ricerca IA.",
    "err.aiNoReply": "La ricerca IA non ha risposto. Controlla di aver effettuato l’accesso a Claude Code.",
    "err.aiOff": "La ricerca IA è disattivata.", "err.noCode": "Claude Code non è installato.",
    "err.badName": "Nome non valido.", "err.noUninstaller": "Programma di disinstallazione non trovato: ClaudePanel non è stato installato con il suo installer.",
    "err.noUpdate": "Nessun aggiornamento in attesa."
  },

  pt: {
    "home.greet": "Olá", "home.subtitle": "O que você quer abrir?", "home.settings": "Ajustes",
    "card.terminal": "Terminal", "card.application": "Aplicativo", "card.manage": "Gerenciar",
    "card.notSignedIn": "Sem login · clique aqui", "card.notInstalled": "Não instalado · clique aqui",
    "card.installing": "Instalando…", "card.waiting": "Aguardando a instalação…",
    "toast.codeInstalled": "Claude Code está instalado ✓", "toast.appInstalled": "Claude está instalado ✓",
    "toast.oops": "Ops: {e}", "toast.saved": "Salvo ✓", "toast.wait": "Só um segundo…",
    "btn.back": "Voltar", "btn.continue": "Continuar", "btn.cancel": "Cancelar", "btn.close": "Fechar",
    "btn.uninstall": "Desinstalar", "btn.later": "Mais tarde",

    "set.title": "Ajustes", "set.name": "Seu nome", "set.nameHint": "Para dizer olá.", "set.namePh": "Seu nome",
    "set.check": "Procurar atualizações", "set.checkHint": "O ClaudePanel também verifica sozinho a cada inicialização.",
    "set.uninstall": "Desinstalar o ClaudePanel", "set.uninstallHint": "Claude, Claude Code e seus skills continuam instalados.",
    "set.noData": "nenhum dado coletado", "set.indep": "Ferramenta independente, sem vínculo com a Anthropic.",

    "tour.welcome": "Bem-vindo ao ClaudePanel", "tour.welcomeLead": "Uma pequena tela inicial para abrir o Claude com um clique.",
    "tour.code": "O assistente que programa com você, no terminal.", "tour.app": "O aplicativo para conversar com o Claude.",
    "tour.skills": "Dê novas habilidades ao Claude, sem linha de comando.",
    "tour.privacy": "Seus dados são seus", "tour.privacyLead": "O ClaudePanel é só um atalho. Ele não guarda nada.",
    "tour.noData": "Nenhum dado coletado", "tour.noDataHint": "Sem conta, sem anúncios, sem rastreadores. Nada é enviado nem armazenado.",
    "tour.anthropic": "Tudo passa pela Anthropic", "tour.anthropicHint": "Claude, Claude Code e o seu login passam pelos servidores oficiais da Anthropic. O painel nunca vê sua senha.",
    "tour.open": "Nada escondido", "tour.openHint": "Qualquer pessoa pode ler o código do painel.",
    "tour.fine": "Única exceção: o clima vem do wttr.in, que adivinha sua cidade pelo seu endereço IP.<br>O ClaudePanel é uma ferramenta independente, sem vínculo com a Anthropic.",
    "tour.name": "Qual é o seu nome?", "tour.nameLead": "O painel vai te cumprimentar pelo nome.",
    "tour.nameFine": "Você pode mudá-lo depois nos ajustes.", "tour.gotIt": "Entendi", "tour.go": "Vamos lá",

    "bye.title": "Desinstalar o ClaudePanel?", "bye.lead": "Só o painel será removido do seu computador.",
    "bye.gone": "O que sai", "bye.goneHint": "O painel, os atalhos dele e o seu nome salvo.",
    "bye.stays": "O que fica", "bye.staysHint": "Claude, Claude Code, sua conta e seus skills continuam como estão.",
    "bye.removing": "Desinstalando…", "bye.step1": "Preparando", "bye.step2": "Apagando seus ajustes",
    "bye.step3": "Removendo o aplicativo", "bye.step4": "Pronto", "bye.goodbye": "Tchau",
    "bye.fine": "O ClaudePanel vai sumir assim que você fechar esta janela.",
    "bye.line1a": "Tchau{n}…", "bye.line1b": "Vou sentir sua falta. Volte quando quiser.",
    "bye.line2a": "Snif… já?", "bye.line2b": "Obrigado por usar o ClaudePanel{n}. Até breve, espero.",
    "bye.line3a": "Foi legal{n}…", "bye.line3b": "Vou guardar minhas perninhas. Se cuide.",

    "upd.button": "Atualizar", "upd.available": "ClaudePanel {v} está disponível", "upd.latest": "Você já tem a versão mais recente ✓",
    "upd.cantCheck": "Não dá para verificar agora", "upd.title": "Atualizando…", "upd.downloading": "Baixando…",
    "upd.installing": "Instalando… o ClaudePanel vai reiniciar", "upd.failed": "Não foi possível atualizar: {e}",
    "news.title": "Novidades da {v}", "news.titleShort": "Novidades", "news.date": "Atualização de {d}", "news.ok": "Legal!",

    "sheet.skillTitle": "Skill não verificado", "sheet.installAnyway": "Instalar mesmo assim",
    "sheet.skillMsg": "<b>{name}</b> não vem de um marketplace verificado pela Anthropic. O código dele vai rodar no seu computador. Ao instalá-lo, você assume os riscos.",
    "sheet.repoTitle": "Repositório não verificado", "sheet.addAnyway": "Adicionar mesmo assim",
    "sheet.repoMsg": "<b>{name}</b> é um repositório do GitHub de terceiros, não verificado pela Anthropic. Os plugins dele vão rodar no seu computador. Ao adicioná-lo, você assume os riscos.",

    "skills.updating": "Atualizando…", "skills.noSkill": "Nenhum skill neste plugin.", "skills.uninstall": "Desinstalar",
    "skills.confirm": "Confirmar a remoção", "skills.installed": "Instalado", "skills.install": "Instalar",
    "skills.unverified": "Skill não verificado: publicado fora dos marketplaces da Anthropic. O código dele roda no seu computador por sua conta e risco.",
    "skills.repo": "Repositório do GitHub · não verificado", "skills.add": "Adicionar",
    "skills.needCode": "Instale primeiro o Claude Code para gerenciar seus skills.", "skills.none": "Nenhum resultado",
    "skills.installing": "Instalando…", "skills.removing": "Removendo…", "skills.addingRepo": "Adicionando o repositório…",
    "toast.installedRestart": "Instalado ✓  Reinicie o Claude Code", "toast.installFail": "Falha na instalação",
    "toast.uninstalled": "Desinstalado", "toast.uninstallFail": "Falha na remoção",
    "toast.repoAdded": "Repositório adicionado ✓", "toast.repoNotFound": "Repositório não encontrado", "toast.copied": "Copiado: {c}",
    "sec.ai": "Sugestões da IA", "sec.leads": "Primeiras pistas", "sec.try": "Experimente", "sec.installed": "Instalados",
    "sec.toInstall": "Para instalar", "sec.popular": "Populares",

    "search.aria": "Busca de skills", "search.phOff": "Buscar um skill…", "search.phOn": "Descreva o que você quer fazer…",
    "ai.switch": "Busca com IA", "ai.disabled": "Busca com IA desativada", "ai.enabled": "Busca com IA ativada ✓",
    "ai.hintTyped": "Enter para perguntar à IA · a lista já filtra enquanto você digita",
    "ai.hintEmpty": "Descreva o que você precisa e pressione Enter: a IA encontra os skills certos",
    "ai.hintOff": "Ative a busca com IA para descrever o que precisa com suas palavras",
    "ai.understanding": "Entendendo seu pedido…", "ai.comparing": "Comparando {n} plugins e ficando com os melhores…",
    "ai.found1": "1 skill encontrado para o seu pedido", "ai.foundN": "{n} skills encontrados para o seu pedido",
    "ai.nothing": "Nada combina de verdade. Tente descrever seu pedido de outro jeito.",
    "ai.offTopic": "Eu só procuro skills para o Claude Code. Tente por exemplo “criar páginas web”.",
    "ai.noMatch": "Nenhum skill combina com o seu pedido por enquanto.",
    "ai.tries": ["Criar páginas web", "Fazer apresentações", "Analisar dados", "Escrever documentação", "Testar meu código", "Trabalhar com o Figma"],

    "intro.title": "A busca com IA", "intro.lead": "Descreva o que você precisa e a IA escolhe os melhores skills para você.",
    "intro.credits": "Ela usa seus créditos do Claude", "intro.creditsHint": "Cada busca passa pelo seu Claude Code, com a sua conta, e conta no seu uso.",
    "intro.light": "Consome muito pouco", "intro.lightHint": "Cerca de 8.000 tokens por busca com o Haiku, o modelo mais leve. Só quando você pressiona Enter.",
    "intro.anthropic": "Nada sai da Anthropic", "intro.anthropicHint": "Seu pedido vai só para os servidores deles. O ClaudePanel não guarda nada.",
    "intro.off": "Pode desativar quando quiser", "intro.offHint": "Um clique no interruptor e a busca volta a ser local, sem créditos.",
    "intro.go": "Ativar a busca com IA",

    "install.title": "Instalação do Claude Code", "install.source": "Script oficial da Anthropic: {url}",
    "install.ok": "Pronto! Volte ao ClaudePanel e clique em Claude Code para fazer login.",
    "install.fail": "A instalação falhou: {e}", "install.check": "Verifique sua conexão com a internet e tente de novo pelo ClaudePanel.",
    "install.close": "Pressione Enter para fechar",

    "err.tooShort": "Conte um pouco mais sobre o que você quer fazer.", "err.aiNoCode": "Instale primeiro o Claude Code para usar a busca com IA.",
    "err.aiNoReply": "A busca com IA não respondeu. Verifique se você fez login no Claude Code.",
    "err.aiOff": "A busca com IA está desativada.", "err.noCode": "O Claude Code não está instalado.",
    "err.badName": "Nome inválido.", "err.noUninstaller": "Desinstalador não encontrado: o ClaudePanel não foi instalado com o instalador dele.",
    "err.noUpdate": "Nenhuma atualização pendente."
  }
};

// The robot's greetings: {n} is the first name; lines with {n} are skipped when there is none
var GREETINGS = {
  fr: {
    any: ["Salut {n}", "Hey {n}", "Coucou {n}", "Hello {n}", "Yo {n}", "Bienvenue, {n}", "Te revoilà, {n}", "Bon retour, {n}",
      "Re-salut {n}", "Content de te voir, {n}", "Ravi de te revoir, {n}", "Quoi de neuf, {n} ?", "Ça roule, {n} ?",
      "En forme, {n} ?", "Alors {n}, on code ?", "On s'y remet, {n} ?", "On construit quoi, {n} ?", "Une idée en tête, {n} ?",
      "Prêt à créer, {n} ?", "Prêt à décoller, {n} ?", "À toi de jouer, {n}", "Let's go {n}", "C'est parti {n}",
      "{n} est dans la place", "Encore toi ? Génial", "Salut le boss", "Mission du jour, {n} ?", "On fait des merveilles ?",
      "Hop, au travail {n}", "Bienvenue à bord, {n}", "Qu'est-ce qu'on invente ?", "Toujours au top, {n} ?", "Aujourd'hui, on brille"],
    morning: ["Bonjour {n}", "Bien dormi, {n} ?", "Café d'abord, {n} ?", "Belle matinée, {n}", "Un matin productif ?"],
    noon: ["Bon appétit, {n}", "Pause déj, {n} ?", "Midi pile, {n}"],
    afternoon: ["Bon après-midi, {n}", "Bien mangé, {n} ?", "La sieste attendra", "Un petit café, {n} ?"],
    evening: ["Bonsoir {n}", "Bonne soirée, {n}", "Belle soirée, {n}", "Bonsoir chef", "Session du soir, {n} ?",
      "Un peu de code ce soir ?", "On code au calme ?", "Projet du soir, {n} ?", "Encore un peu, {n} ?", "Une petite dernière ?",
      "Journée bien remplie ?", "Le soleil se couche, on code", "Tisane et code, {n} ?", "On finit en beauté ?",
      "Les étoiles sont sorties", "La lune est levée, {n}"],
    night: ["Encore debout, {n} ?", "Nuit blanche, {n} ?", "Les génies codent la nuit", "Chut… tout le monde dort",
      "Pense à dormir, {n}", "Il se fait tard, {n}", "Un dernier commit ?", "Pas encore au lit ?", "Insomnie créative ?",
      "Le monde dort, toi tu codes"],
    weekend: ["Bon week-end, {n}", "Même le week-end ?", "Projet du week-end ?"],
    monday: ["Bon lundi, {n}"], friday: ["Vendredi, enfin !"], fridayEvening: ["Bon vendredi soir, {n}"], saturdayEvening: ["Bon samedi soir, {n}"],
    subtitles: ["Que veux-tu ouvrir ?", "Par où on commence ?", "On lance quoi ?", "Choisis ton outil", "Un clic et c'est parti", "Où va-t-on ?"]
  },
  en: {
    any: ["Hi {n}", "Hey {n}", "Hello {n}", "Welcome back, {n}", "Good to see you, {n}", "There you are, {n}",
      "What's up, {n}?", "Ready to build, {n}?", "Let's go, {n}", "Back at it, {n}?", "Got an idea, {n}?",
      "What are we making, {n}?", "Your move, {n}", "Mission of the day, {n}?", "You again? Great", "Hey boss",
      "Welcome aboard, {n}", "What shall we invent?", "Today we shine"],
    morning: ["Good morning, {n}", "Slept well, {n}?", "Coffee first, {n}?", "Lovely morning, {n}", "A productive morning?"],
    noon: ["Lunch time, {n}?", "Enjoy your lunch, {n}", "High noon, {n}"],
    afternoon: ["Good afternoon, {n}", "Nap can wait", "Afternoon coffee, {n}?", "The afternoon is yours"],
    evening: ["Good evening, {n}", "Nice evening, {n}", "Evening session, {n}?", "A little code tonight?", "Quiet coding?",
      "Evening project, {n}?", "One more thing, {n}?", "Long day?", "Sun's setting, let's code", "The stars are out",
      "Ending on a high note?"],
    night: ["Still up, {n}?", "All-nighter, {n}?", "Geniuses code at night", "Shh… everyone's asleep", "Remember to sleep, {n}",
      "It's getting late, {n}", "One last commit?", "Not in bed yet?", "The world sleeps, you code"],
    weekend: ["Happy weekend, {n}", "Even on the weekend?", "Weekend project?"],
    monday: ["Happy Monday, {n}"], friday: ["Friday, at last!"], fridayEvening: ["Happy Friday night, {n}"], saturdayEvening: ["Happy Saturday night, {n}"],
    subtitles: ["What do you want to open?", "Where do we start?", "What are we launching?", "Pick your tool", "One click and we're off", "Where to?"]
  },
  es: {
    any: ["Hola {n}", "Hey {n}", "¡Bienvenido, {n}!", "Qué bueno verte, {n}", "Ya estás aquí, {n}", "¿Qué tal, {n}?",
      "¿Listo para crear, {n}?", "¡Vamos, {n}!", "¿Seguimos, {n}?", "¿Alguna idea, {n}?", "¿Qué construimos, {n}?",
      "Te toca, {n}", "¿Misión del día, {n}?", "¿Tú otra vez? Genial", "Hola, jefe", "Bienvenido a bordo, {n}",
      "¿Qué inventamos hoy?", "Hoy brillamos"],
    morning: ["Buenos días, {n}", "¿Dormiste bien, {n}?", "¿Primero un café, {n}?", "Bonita mañana, {n}", "¿Una mañana productiva?"],
    noon: ["¡Buen provecho, {n}!", "¿Hora de comer, {n}?", "Mediodía en punto, {n}"],
    afternoon: ["Buenas tardes, {n}", "La siesta puede esperar", "¿Un cafecito, {n}?", "La tarde es tuya"],
    evening: ["Buenas noches, {n}", "Bonita noche, {n}", "¿Sesión nocturna, {n}?", "¿Un poco de código esta noche?",
      "¿Programamos con calma?", "¿Proyecto de la noche, {n}?", "¿Una cosita más, {n}?", "¿Día largo?", "Salieron las estrellas"],
    night: ["¿Todavía despierto, {n}?", "¿Noche en vela, {n}?", "Los genios programan de noche", "Shh… todos duermen",
      "Acuérdate de dormir, {n}", "Se hace tarde, {n}", "¿Un último commit?", "El mundo duerme, tú programas"],
    weekend: ["¡Buen fin de semana, {n}!", "¿Incluso el fin de semana?", "¿Proyecto de fin de semana?"],
    monday: ["¡Feliz lunes, {n}!"], friday: ["¡Por fin viernes!"], fridayEvening: ["¡Feliz viernes noche, {n}!"], saturdayEvening: ["¡Feliz sábado noche, {n}!"],
    subtitles: ["¿Qué quieres abrir?", "¿Por dónde empezamos?", "¿Qué lanzamos?", "Elige tu herramienta", "Un clic y listo", "¿A dónde vamos?"]
  },
  de: {
    any: ["Hallo {n}", "Hey {n}", "Willkommen zurück, {n}", "Schön, dich zu sehen, {n}", "Da bist du ja, {n}",
      "Was gibt's Neues, {n}?", "Bereit loszulegen, {n}?", "Los geht's, {n}", "Weiter geht's, {n}?", "Eine Idee im Kopf, {n}?",
      "Was bauen wir, {n}?", "Du bist dran, {n}", "Mission des Tages, {n}?", "Du schon wieder? Super", "Hallo Chef",
      "Willkommen an Bord, {n}", "Was erfinden wir heute?", "Heute glänzen wir"],
    morning: ["Guten Morgen, {n}", "Gut geschlafen, {n}?", "Erst mal Kaffee, {n}?", "Schöner Morgen, {n}", "Ein produktiver Morgen?"],
    noon: ["Mahlzeit, {n}!", "Mittagspause, {n}?", "Punkt zwölf, {n}"],
    afternoon: ["Guten Tag, {n}", "Das Nickerchen kann warten", "Ein Kaffee, {n}?", "Der Nachmittag gehört dir"],
    evening: ["Guten Abend, {n}", "Schönen Abend, {n}", "Abendsession, {n}?", "Heute Abend ein bisschen Code?",
      "Ganz entspannt coden?", "Projekt für heute Abend, {n}?", "Noch eine Sache, {n}?", "Langer Tag?", "Die Sterne sind da"],
    night: ["Noch wach, {n}?", "Nachtschicht, {n}?", "Genies coden nachts", "Pssst… alle schlafen", "Denk ans Schlafen, {n}",
      "Es wird spät, {n}", "Ein letzter Commit?", "Die Welt schläft, du codest"],
    weekend: ["Schönes Wochenende, {n}", "Sogar am Wochenende?", "Wochenendprojekt?"],
    monday: ["Guten Start in die Woche, {n}"], friday: ["Endlich Freitag!"], fridayEvening: ["Schönen Freitagabend, {n}"], saturdayEvening: ["Schönen Samstagabend, {n}"],
    subtitles: ["Was möchtest du öffnen?", "Womit fangen wir an?", "Was starten wir?", "Wähl dein Werkzeug", "Ein Klick und los", "Wohin geht's?"]
  },
  it: {
    any: ["Ciao {n}", "Ehi {n}", "Bentornato, {n}", "Che bello vederti, {n}", "Eccoti, {n}", "Che si dice, {n}?",
      "Pronto a creare, {n}?", "Andiamo, {n}!", "Si riparte, {n}?", "Un’idea in testa, {n}?", "Cosa costruiamo, {n}?",
      "Tocca a te, {n}", "Missione del giorno, {n}?", "Ancora tu? Grande", "Ciao capo", "Benvenuto a bordo, {n}",
      "Cosa inventiamo oggi?", "Oggi si brilla"],
    morning: ["Buongiorno, {n}", "Dormito bene, {n}?", "Prima un caffè, {n}?", "Bella mattinata, {n}", "Una mattina produttiva?"],
    noon: ["Buon appetito, {n}", "Pausa pranzo, {n}?", "Mezzogiorno in punto, {n}"],
    afternoon: ["Buon pomeriggio, {n}", "Il pisolino può aspettare", "Un caffè, {n}?", "Il pomeriggio è tuo"],
    evening: ["Buonasera, {n}", "Bella serata, {n}", "Sessione serale, {n}?", "Un po’ di codice stasera?",
      "Programmiamo con calma?", "Progetto della sera, {n}?", "Ancora una cosa, {n}?", "Giornata lunga?", "Sono uscite le stelle"],
    night: ["Ancora sveglio, {n}?", "Notte in bianco, {n}?", "I geni programmano di notte", "Shh… dormono tutti",
      "Ricordati di dormire, {n}", "Si fa tardi, {n}", "Un ultimo commit?", "Il mondo dorme, tu programmi"],
    weekend: ["Buon weekend, {n}", "Anche nel weekend?", "Progetto del weekend?"],
    monday: ["Buon lunedì, {n}"], friday: ["Finalmente venerdì!"], fridayEvening: ["Buon venerdì sera, {n}"], saturdayEvening: ["Buon sabato sera, {n}"],
    subtitles: ["Cosa vuoi aprire?", "Da dove iniziamo?", "Cosa lanciamo?", "Scegli il tuo strumento", "Un clic e via", "Dove andiamo?"]
  },
  pt: {
    any: ["Oi {n}", "E aí, {n}", "Bem-vindo de volta, {n}", "Que bom te ver, {n}", "Aí está você, {n}", "Tudo certo, {n}?",
      "Pronto para criar, {n}?", "Bora, {n}!", "Vamos continuar, {n}?", "Alguma ideia, {n}?", "O que vamos construir, {n}?",
      "Sua vez, {n}", "Missão do dia, {n}?", "Você de novo? Ótimo", "Oi, chefe", "Bem-vindo a bordo, {n}",
      "O que vamos inventar hoje?", "Hoje a gente brilha"],
    morning: ["Bom dia, {n}", "Dormiu bem, {n}?", "Café primeiro, {n}?", "Linda manhã, {n}", "Uma manhã produtiva?"],
    noon: ["Bom almoço, {n}", "Hora do almoço, {n}?", "Meio-dia em ponto, {n}"],
    afternoon: ["Boa tarde, {n}", "A soneca pode esperar", "Um cafezinho, {n}?", "A tarde é sua"],
    evening: ["Boa noite, {n}", "Bela noite, {n}", "Sessão noturna, {n}?", "Um pouco de código hoje à noite?",
      "Vamos programar com calma?", "Projeto da noite, {n}?", "Só mais uma coisa, {n}?", "Dia longo?", "As estrelas apareceram"],
    night: ["Ainda acordado, {n}?", "Virando a noite, {n}?", "Gênios programam à noite", "Psiu… todo mundo dorme",
      "Lembre de dormir, {n}", "Está ficando tarde, {n}", "Um último commit?", "O mundo dorme, você programa"],
    weekend: ["Bom fim de semana, {n}", "Até no fim de semana?", "Projeto de fim de semana?"],
    monday: ["Boa segunda, {n}"], friday: ["Finalmente sexta!"], fridayEvening: ["Boa sexta à noite, {n}"], saturdayEvening: ["Bom sábado à noite, {n}"],
    subtitles: ["O que você quer abrir?", "Por onde começamos?", "O que vamos abrir?", "Escolha sua ferramenta", "Um clique e pronto", "Para onde vamos?"]
  }
};

function t(key, vars) {
  var s = (STR[LANG] && STR[LANG][key] !== undefined) ? STR[LANG][key] : (STR.en[key] !== undefined ? STR.en[key] : key);
  if (vars && typeof s === "string")
    s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  return s;
}

// Errors from Rust come as "err.*" keys; anything else is shown as is
function errText(e) {
  var s = String(e);
  return /^err\.\w+$/.test(s) ? t(s) : s;
}

// Numbers and dates the local way
function fmtNumber(n) { return Number(n).toLocaleString(LANG); }
function fmtDate(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString(LANG, { day: "numeric", month: "long", year: "numeric" });
}

function applyI18n(root) {
  var r = root || document;
  var all = r.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-title],[data-i18n-aria]");
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (el.hasAttribute("data-i18n")) el.textContent = t(el.getAttribute("data-i18n"));
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = t(el.getAttribute("data-i18n-html"));
    if (el.hasAttribute("data-i18n-ph")) el.placeholder = t(el.getAttribute("data-i18n-ph"));
    if (el.hasAttribute("data-i18n-title")) el.title = t(el.getAttribute("data-i18n-title"));
    if (el.hasAttribute("data-i18n-aria")) el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  }
}
