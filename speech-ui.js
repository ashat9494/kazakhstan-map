// Local recordings first; the only browser fallback is the chosen Google UK English Male.
const ATLAS_SPEECH = (() => {
  const browserSpeech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const synth = browserSpeech ? window.speechSynthesis : null;
  const available = typeof ATLAS_AUDIO !== 'undefined' || browserSpeech;
  let rate = .85, active = null, token = 0;
  const googleVoice = () => browserSpeech ? synth.getVoices().find(v => /google uk english male/i.test(v.name) && /^en-GB$/i.test(v.lang)) : null;
  function refresh() {
    for (const b of document.querySelectorAll('.speech-rate')) b.setAttribute('aria-pressed',String(Number(b.dataset.rate) === rate));
    for (const box of document.querySelectorAll('.speech-controls')) {
      box.classList.toggle('is-playing',Boolean(active));
      box.querySelector('[data-speech-action="pause"]')?.toggleAttribute('hidden',!active || !active.ready || active.paused);
      box.querySelector('[data-speech-action="resume"]')?.toggleAttribute('hidden',!active || !active.ready || !active.paused);
      box.querySelector('[data-speech-action="stop"]')?.toggleAttribute('hidden',!active);
    }
  }
  function stop() {
    token++;
    const old = active; active = null;
    if (old?.audio) { old.audio.pause(); old.audio.removeAttribute('src'); old.audio.load(); }
    if (browserSpeech) synth.cancel();
    old?.finish('');refresh();
  }
  function fallback(text,status,finish,id) {
    if (id !== token) return false;
    const voice = googleVoice();
    if (!voice) {active=null;status.textContent='Offline recording unavailable. Google UK English Male is not available in this browser.';finish(status.textContent);refresh();return false}
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice=voice;utterance.lang='en-GB';utterance.rate=rate;
    active={kind:'browser',finish,paused:false,ready:true};refresh();
    status.textContent='Using Google UK English Male. This browser voice may need internet.';
    utterance.onend=()=>{if(id!==token)return;active=null;status.textContent='';finish('');refresh()};
    utterance.onerror=()=>{if(id!==token)return;active=null;status.textContent='Browser speech failed. Check your connection or voice settings.';finish(status.textContent);refresh()};
    try{synth.speak(utterance);return true}catch{active=null;status.textContent='Browser speech could not start.';finish(status.textContent);refresh();return false}
  }
  function segmentsFor(key) {
    if (!key || typeof ATLAS_AUDIO === 'undefined') return [];
    if (key.kind === 'word') return ATLAS_AUDIO.words[key.id] ? [ATLAS_AUDIO.words[key.id]] : [];
    if (key.kind === 'card') {const card=ATLAS_AUDIO.cards[key.id];return card?[card.title,card.narration]:[]}
    return [];
  }
  function speak(text,status,finish=()=>{},key=null) {
    stop();
    const id=token,segments=segmentsFor(key);
    if(!segments.length)return fallback(text,status,finish,id);
    const playSegment=index=>{
      if(id!==token)return;
      if(index>=segments.length){active=null;status.textContent='';finish('');refresh();return}
      const segment=segments[index],audio=new Audio(segment.file);
      audio.preload='auto';audio.playbackRate=rate;audio.preservesPitch=true;
      active={kind:'local',audio,finish,paused:false,ready:false};refresh();
      let handled=false;
      const fail=error=>{
        if(handled||id!==token)return;
        handled=true;audio.pause();active=null;
        if(error?.name==='NotAllowedError'){status.textContent='Tap Listen again to allow audio playback.';finish(status.textContent);refresh();return}
        fallback(segments.slice(index).map(item=>item.text).join(' '),status,finish,id);
      };
      audio.onended=()=>{if(handled||id!==token)return;handled=true;playSegment(index+1)};
      audio.onerror=()=>fail();
      status.textContent='Playing offline English recording.';
      audio.play().then(()=>{if(active?.audio===audio){active.ready=true;refresh()}}).catch(error=>{
        if(error?.name==='AbortError' && active?.audio===audio && audio.paused)return;
        fail(error);
      });
    };
    playSegment(0);return true;
  }
  function controls(status) {
    const box=document.createElement('div');box.className='speech-controls';
    box.setAttribute('aria-label','Audio playback controls. Offline recording with Google UK English Male fallback.');
    const speed=document.createElement('div');speed.className='speech-speed';speed.setAttribute('role','group');speed.setAttribute('aria-label','Speech speed');
    for(const [name,value] of [['Slow',.85],['Normal',1]]){
      const b=document.createElement('button');b.type='button';b.className='speech-rate';b.dataset.rate=value;b.textContent=name;
      b.addEventListener('click',()=>{rate=value;stop();refresh();status.textContent=name+' speed selected.'});speed.append(b);
    }
    box.append(speed);
    for(const [name,method] of [['Pause','pause'],['Resume','resume'],['Stop','stop']]){
      const b=document.createElement('button');b.type='button';b.textContent=name;b.dataset.speechAction=method;b.disabled=!available;b.hidden=true;
      b.addEventListener('click',()=>{
        if(!active&&method!=='stop')return;
        if(method==='stop'){stop();status.textContent='Speech stopped.';return}
        if(active.kind==='local'){if(method==='pause')active.audio.pause();else active.audio.play().catch(()=>{status.textContent='Audio could not resume.'})}
        else if(browserSpeech)synth[method]();
        active.paused=method==='pause';refresh();
        status.textContent=method==='pause'?'Speech paused.':'Speech resumed.';
      });box.append(b);
    }
    queueMicrotask(refresh);return box;
  }
  if(browserSpeech)synth.addEventListener?.('voiceschanged',refresh);
  return {available,controls,speak,stop,refresh,getVoices:()=>googleVoice()?[googleVoice()]:[],getMode:()=>active?.kind||'idle',getPlaybackState:()=>active?.audio?{paused:active.audio.paused,time:active.audio.currentTime,rate:active.audio.playbackRate}:null};
})();
