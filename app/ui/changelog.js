// What changed in each version, newest first, in every language of i18n.js.
// Shown once, on the first launch after an update; the date is written the
// local way. release.ps1 refuses to publish a version without an entry, and
// uses its French items as the release notes.
var CHANGELOG = [
  {
    version: "2.2.2",
    date: "2026-10-22",
    items: {
      fr: [["Plus de sécurité", "Un plugin au nom piégé ne peut plus lancer de programme depuis la liste des skills, et le panel bloque tout script qui ne vient pas de lui."]],
      en: [["Safer", "A plugin with a booby-trapped name can no longer launch a program from the skills list, and the panel blocks any script that isn’t its own."]],
      es: [["Más seguro", "Un plugin con un nombre trampa ya no puede abrir un programa desde la lista de skills, y el panel bloquea cualquier script que no sea suyo."]],
      de: [["Mehr Sicherheit", "Ein Plugin mit präpariertem Namen kann aus der Skill-Liste kein Programm mehr starten, und das Panel blockiert jedes fremde Skript."]],
      it: [["Più sicuro", "Un plugin con un nome trappola non può più avviare un programma dalla lista delle skill, e il pannello blocca ogni script che non è suo."]],
      pt: [["Mais seguro", "Um plugin com nome armadilha não consegue mais abrir um programa pela lista de skills, e o painel bloqueia qualquer script que não seja dele."]]
    }
  },
  {
    version: "2.2.1",
    date: "2026-10-22",
    items: {
      fr: [["Météo plus discrète", "L’accueil n’affiche plus ta ville : seulement la température et le temps."]],
      en: [["Quieter weather", "The home screen no longer shows your city: just the temperature and the weather."]],
      es: [["Tiempo más discreto", "La pantalla de inicio ya no muestra tu ciudad: solo la temperatura y el tiempo."]],
      de: [["Dezenteres Wetter", "Der Startbildschirm zeigt deine Stadt nicht mehr an: nur Temperatur und Wetter."]],
      it: [["Meteo più discreto", "La schermata iniziale non mostra più la tua città: solo la temperatura e il tempo."]],
      pt: [["Clima mais discreto", "A tela inicial não mostra mais a sua cidade: só a temperatura e o tempo."]]
    }
  },
  {
    version: "2.2.0",
    date: "2026-10-22",
    items: {
      fr: [["ClaudePanel parle ta langue", "Français, anglais, espagnol, allemand, italien ou portugais : le panel suit la langue de ton ordinateur."],
        ["Tout s’adapte", "Date, heure, météo, explications de l’IA et même les salutations du robot."]],
      en: [["ClaudePanel speaks your language", "French, English, Spanish, German, Italian or Portuguese: the panel follows your computer’s language."],
        ["Everything adapts", "Date, time, weather, the AI’s explanations and even the robot’s greetings."]],
      es: [["ClaudePanel habla tu idioma", "Francés, inglés, español, alemán, italiano o portugués: el panel sigue el idioma de tu ordenador."],
        ["Todo se adapta", "Fecha, hora, tiempo, las explicaciones de la IA e incluso los saludos del robot."]],
      de: [["ClaudePanel spricht deine Sprache", "Französisch, Englisch, Spanisch, Deutsch, Italienisch oder Portugiesisch: Das Panel folgt der Sprache deines Computers."],
        ["Alles passt sich an", "Datum, Uhrzeit, Wetter, die Erklärungen der KI und sogar die Grüße des Roboters."]],
      it: [["ClaudePanel parla la tua lingua", "Francese, inglese, spagnolo, tedesco, italiano o portoghese: il pannello segue la lingua del tuo computer."],
        ["Tutto si adatta", "Data, ora, meteo, le spiegazioni dell’IA e perfino i saluti del robot."]],
      pt: [["O ClaudePanel fala a sua língua", "Francês, inglês, espanhol, alemão, italiano ou português: o painel segue o idioma do seu computador."],
        ["Tudo se adapta", "Data, hora, clima, as explicações da IA e até os cumprimentos do robô."]]
    }
  },
  {
    version: "2.1.1",
    date: "2026-10-22",
    items: {
      fr: [["La recherche IA, si tu le veux", "Elle utilise tes crédits Claude : elle est désormais désactivée par défaut, avec un interrupteur dans la barre de recherche."],
        ["Tout savoir avant d’activer", "Une page t’explique ce qu’elle consomme (très peu) avant que tu l’actives."]],
      en: [["AI search, if you want it", "It uses your Claude credits, so it’s now off by default, with a switch in the search bar."],
        ["Know before you turn it on", "A page explains what it uses (very little) before you turn it on."]],
      es: [["La búsqueda IA, si la quieres", "Usa tus créditos de Claude: ahora está desactivada por defecto, con un interruptor en la barra de búsqueda."],
        ["Saberlo todo antes de activarla", "Una página te explica lo que consume (muy poco) antes de que la actives."]],
      de: [["Die KI-Suche, wenn du willst", "Sie nutzt dein Claude-Kontingent: Sie ist jetzt standardmäßig aus, mit einem Schalter in der Suchleiste."],
        ["Alles wissen vor dem Einschalten", "Eine Seite erklärt dir, was sie verbraucht (sehr wenig), bevor du sie einschaltest."]],
      it: [["La ricerca IA, se la vuoi", "Usa i tuoi crediti Claude: ora è disattivata per impostazione predefinita, con un interruttore nella barra di ricerca."],
        ["Sapere tutto prima di attivarla", "Una pagina ti spiega quanto consuma (pochissimo) prima che tu la attivi."]],
      pt: [["A busca com IA, se você quiser", "Ela usa seus créditos do Claude: agora vem desativada por padrão, com um interruptor na barra de busca."],
        ["Saber tudo antes de ativar", "Uma página explica quanto ela consome (muito pouco) antes de você ativar."]]
    }
  },
  {
    version: "2.1.0",
    date: "2026-10-22",
    items: {
      fr: [["Recherche IA des skills", "Décris ce que tu veux faire, l’IA trouve les meilleurs skills parmi des milliers et t’explique pourquoi."],
        ["Ce que tu as déjà", "Les skills déjà installés qui répondent à ta demande sont signalés."],
        ["Une barre de recherche toute neuve", "Plus grande, animée, avec des idées de recherche pour démarrer."]],
      en: [["AI skill search", "Describe what you want to do, the AI finds the best skills among thousands and tells you why."],
        ["What you already have", "Installed skills that fit your request are flagged."],
        ["A brand-new search bar", "Bigger, animated, with search ideas to get started."]],
      es: [["Búsqueda IA de skills", "Describe lo que quieres hacer, la IA encuentra los mejores skills entre miles y te explica por qué."],
        ["Lo que ya tienes", "Se señalan los skills ya instalados que encajan con tu petición."],
        ["Una barra de búsqueda nueva", "Más grande, animada y con ideas para empezar."]],
      de: [["KI-Suche für Skills", "Beschreib, was du tun möchtest, und die KI findet unter Tausenden die besten Skills und erklärt dir warum."],
        ["Was du schon hast", "Bereits installierte Skills, die zu deiner Anfrage passen, werden markiert."],
        ["Eine ganz neue Suchleiste", "Größer, animiert und mit Ideen für den Einstieg."]],
      it: [["Ricerca IA degli skill", "Descrivi cosa vuoi fare, l’IA trova i migliori skill tra migliaia e ti spiega perché."],
        ["Quello che hai già", "Gli skill già installati adatti alla tua richiesta vengono segnalati."],
        ["Una barra di ricerca nuova", "Più grande, animata, con idee di ricerca per iniziare."]],
      pt: [["Busca de skills com IA", "Descreva o que você quer fazer e a IA encontra os melhores skills entre milhares e explica o porquê."],
        ["O que você já tem", "Os skills já instalados que atendem ao seu pedido são sinalizados."],
        ["Uma barra de busca nova", "Maior, animada e com ideias de busca para começar."]]
    }
  },
  {
    version: "2.0.3",
    date: "2026-10-22",
    items: {
      fr: [["Mises à jour signalées tout de suite", "Le bandeau de mise à jour apparaît dès l’ouverture du panel, plus besoin d’attendre."]],
      en: [["Updates flagged right away", "The update banner shows as soon as the panel opens, no more waiting."]],
      es: [["Actualizaciones avisadas al instante", "El aviso de actualización aparece en cuanto se abre el panel, sin esperar."]],
      de: [["Updates sofort angezeigt", "Der Update-Hinweis erscheint direkt beim Öffnen des Panels, ohne Warten."]],
      it: [["Aggiornamenti segnalati subito", "Il banner di aggiornamento appare appena si apre il pannello, senza attese."]],
      pt: [["Atualizações avisadas na hora", "O aviso de atualização aparece assim que o painel abre, sem esperar."]]
    }
  },
  {
    version: "2.0.2",
    date: "2026-10-22",
    items: {
      fr: [["Connexion à Claude bien reconnue", "Depuis sa dernière mise à jour, l’app Claude range ses données ailleurs : ClaudePanel les retrouve et n’affiche plus « Non connecté » à tort."]],
      en: [["Claude sign-in recognized again", "Since its latest update, the Claude app keeps its data elsewhere: ClaudePanel finds it and no longer shows “Signed out” by mistake."]],
      es: [["Sesión de Claude bien reconocida", "Desde su última actualización, la app de Claude guarda sus datos en otro sitio: ClaudePanel los encuentra y ya no muestra «Sin sesión» por error."]],
      de: [["Claude-Anmeldung wird wieder erkannt", "Seit ihrem letzten Update speichert die Claude-App ihre Daten woanders: ClaudePanel findet sie und zeigt nicht mehr fälschlich „Nicht angemeldet“."]],
      it: [["Accesso a Claude riconosciuto", "Dal suo ultimo aggiornamento l’app Claude salva i dati altrove: ClaudePanel li ritrova e non mostra più «Non connesso» per errore."]],
      pt: [["Login no Claude reconhecido", "Desde a última atualização, o app Claude guarda os dados em outro lugar: o ClaudePanel os encontra e não mostra mais “Sem login” por engano."]]
    }
  },
  {
    version: "2.0.1",
    date: "2026-10-22",
    items: {
      fr: [["Icône corrigée dans la barre des tâches", "Après le passage depuis la 1.0, ClaudePanel épinglé affiche bien son petit robot."]],
      en: [["Taskbar icon fixed", "After moving on from 1.0, a pinned ClaudePanel shows its little robot again."]],
      es: [["Icono de la barra de tareas corregido", "Tras pasar de la 1.0, ClaudePanel anclado vuelve a mostrar su robot."]],
      de: [["Taskleisten-Symbol korrigiert", "Nach dem Wechsel von 1.0 zeigt das angeheftete ClaudePanel wieder seinen kleinen Roboter."]],
      it: [["Icona della barra delle applicazioni corretta", "Dopo il passaggio dalla 1.0, ClaudePanel aggiunto alla barra mostra di nuovo il suo robottino."]],
      pt: [["Ícone da barra de tarefas corrigido", "Depois de sair da 1.0, o ClaudePanel fixado volta a mostrar o seu robozinho."]]
    }
  },
  {
    version: "2.0.0",
    date: "2026-10-22",
    items: {
      fr: [["Une app toute neuve", "Plus rapide, nette sur tous les écrans, et prête pour le Mac."],
        ["Mises à jour automatiques", "ClaudePanel se met à jour en un clic et te montre ce qui a changé."],
        ["Réglages", "Change ton prénom ou désinstalle le panel depuis la roue dentée."],
        ["Adieu la 1.0", "Ton prénom est gardé et l’ancienne version est retirée proprement."]],
      en: [["A brand-new app", "Faster, sharp on every screen, and ready for the Mac."],
        ["Automatic updates", "ClaudePanel updates in one click and shows you what changed."],
        ["Settings", "Change your first name or uninstall the panel from the gear."],
        ["Goodbye 1.0", "Your first name is kept and the old version is removed cleanly."]],
      es: [["Una app totalmente nueva", "Más rápida, nítida en todas las pantallas y lista para Mac."],
        ["Actualizaciones automáticas", "ClaudePanel se actualiza con un clic y te muestra qué ha cambiado."],
        ["Ajustes", "Cambia tu nombre o desinstala el panel desde el engranaje."],
        ["Adiós a la 1.0", "Se conserva tu nombre y la versión antigua se retira limpiamente."]],
      de: [["Eine ganz neue App", "Schneller, scharf auf jedem Bildschirm und bereit für den Mac."],
        ["Automatische Updates", "ClaudePanel aktualisiert sich mit einem Klick und zeigt dir, was neu ist."],
        ["Einstellungen", "Ändere deinen Vornamen oder deinstalliere das Panel über das Zahnrad."],
        ["Tschüss 1.0", "Dein Vorname bleibt erhalten und die alte Version wird sauber entfernt."]],
      it: [["Un’app tutta nuova", "Più veloce, nitida su ogni schermo e pronta per il Mac."],
        ["Aggiornamenti automatici", "ClaudePanel si aggiorna con un clic e ti mostra cosa è cambiato."],
        ["Impostazioni", "Cambia il tuo nome o disinstalla il pannello dall’ingranaggio."],
        ["Addio 1.0", "Il tuo nome viene mantenuto e la vecchia versione rimossa in modo pulito."]],
      pt: [["Um app totalmente novo", "Mais rápido, nítido em todas as telas e pronto para o Mac."],
        ["Atualizações automáticas", "O ClaudePanel se atualiza com um clique e mostra o que mudou."],
        ["Ajustes", "Mude seu nome ou desinstale o painel pela engrenagem."],
        ["Adeus 1.0", "Seu nome é mantido e a versão antiga é removida direitinho."]]
    }
  }
];
