export function speakMandarin(text: string, rate = 0.72) {
  if (!("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => voice.lang.toLowerCase() === "zh-cn")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("zh"));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
  return true;
}

