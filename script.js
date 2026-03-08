const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const orb = document.getElementById('orb');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const setOrbState = (state) => {
  orb.classList.remove('idle', 'listening', 'speaking');
  orb.classList.add(state);
};

const setStatus = (msg) => {
  statusEl.textContent = msg;
};

const generateAnswer = async (question) => {
  const prompt = question.toLowerCase();

  if (prompt.includes('bonjour')) return 'Bonjour, je suis prêt à répondre à tes questions.;
  if (prompt.includes('heure')) {
    return `Il est ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`;
  }
  if (prompt.includes('date')) {
    return `Nous sommes le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}.`;
  }

  return `Tu m'as demandé : ${question}. Pour brancher une vraie IA, connecte ce front à une API comme OpenAI puis lis la réponse en audio.`;
};

if (!SpeechRecognition) {
  setStatus('La reconnaissance vocale n\'est pas prise en charge sur ce navigateur. Utilise Chrome ou Edge.');
  startBtn.disabled = true;
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.continuous = true;
  recognition.interimResults = false;

  let isRunning = false;

  recognition.onstart = () => {
    isRunning = true;
    setOrbState('listening');
    setStatus('Je t\'écoute...');
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onresult = async (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) return;

    const question = result[0].transcript.trim();
    transcriptEl.textContent = `Toi : ${question}`;

    recognition.stop();
    setStatus('Je réfléchis...');

    const answer = await generateAnswer(question);
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = 'fr-FR';

    utterance.onstart = () => {
      setOrbState('speaking');
      setStatus('Je réponds...');
    };

    utterance.onend = () => {
      setOrbState('listening');
      setStatus('Terminé. Je t\'écoute de nouveau...');
      if (isRunning) recognition.start();
    };

    synth.cancel();
    synth.speak(utterance);
  };

  recognition.onerror = (event) => {
    setOrbState('idle');
    setStatus(`Erreur micro : ${event.error}`);
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recognition.onend = () => {
    if (!isRunning) {
      setOrbState('idle');
      setStatus('Assistant arrêté.');
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  };

  startBtn.addEventListener('click', () => {
    isRunning = true;
    transcriptEl.textContent = '';
    recognition.start();
  });

  stopBtn.addEventListener('click', () => {
    isRunning = false;
    synth.cancel();
    recognition.stop();
    setOrbState('idle');
    setStatus('Assistant arrêté.');
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });
}
