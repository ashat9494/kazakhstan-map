(() => {
  'use strict';
  const places = JSON.parse(document.getElementById('atlas-data').textContent);
  const placeById = new Map(places.map(place => [place.id, place]));
  const words = places.flatMap(place => place.words.map(([en, ru, source], slot) => ({id:`${place.id}-${slot}`,en,ru,kk:KAZAKH_WORDS[en]?.kk||'',kkSource:KAZAKH_WORDS[en]?.source||'',source,placeId:place.id,placeName:place.name})));
  const translations = [...new Set(words.map(word => word.ru))];
  const el = id => document.getElementById(id);
  const make = (tag, className, value) => {const item=document.createElement(tag);if(className)item.className=className;if(value!==undefined)item.textContent=value;return item};
  const button = (label, className, click) => {const item=make('button',className,label);item.type='button';item.addEventListener('click',click);return item};
  const sourceLink = (label, url) => {const a=make('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
  const focus = (item,scroll=false) => item?.focus(scroll?undefined:{preventScroll:true});
  const supportedSpeech = ATLAS_SPEECH.available;
  let wordIndex=0, practiceQueue=[], practiceStep=0, practiceScore=0, practiceMissed=new Set(), practiceRetry=false;
  let quizQueue=[], quizStep=0, quizScore=0, quizMode=5;

  function speakWord(){
    ATLAS_SPEECH.speak(words[wordIndex].en,el('word-speech-status'),undefined,{kind:'word',id:words[wordIndex].en});
  }
  function openPlace(id){
    document.dispatchEvent(new CustomEvent('map:select-place',{detail:{id}}));
  }
  function showWord(index,reveal=false){
    ATLAS_SPEECH.stop();
    wordIndex=(index+words.length)%words.length;
    const word=words[wordIndex];
    el('word-progress').textContent=`Word ${wordIndex+1} / ${words.length}`;
    el('word-term').textContent=word.en;
    el('word-kazakh').textContent=word.kk||'Translation pending';
    el('word-translation').textContent=word.ru;
    el('word-place').textContent=`From ${word.placeName}`;
    el('word-source').href=word.source;
    el('word-kazakh-source').href=word.kkSource;
    el('word-kazakh-source').hidden=!word.kkSource;
    el('word-speech-status').textContent='';
    for(const item of el('word-picker').children)item.setAttribute('aria-current',String(item.dataset.index===String(wordIndex)));
    el('word-map').onclick=()=>openPlace(word.placeId);
    if(reveal)focus(el('word-focus'),true);
  }
  function showLearnMode(mode){
    const practice=mode==='practice';
    el('learn-words-view').hidden=practice;el('learn-practice-view').hidden=!practice;
    el('learn-words-tab').setAttribute('aria-pressed',String(!practice));
    el('learn-practice-tab').setAttribute('aria-pressed',String(practice));
    if(practice)ATLAS_SPEECH.stop();
  }
  function drawWordPicker(){
    const box=el('word-picker');box.replaceChildren();
    const query=el('word-search').value.trim().toLocaleLowerCase();
    words.forEach((word,index)=>{
      if(query&&!`${word.en} ${word.kk} ${word.ru} ${word.placeName}`.toLocaleLowerCase().includes(query))return;
      const item=button('','word-picker-item',()=>showWord(index,true));
      item.append(make('strong','',word.en),make('span','',word.kk),make('span','',word.ru),make('small','',word.placeName));
      item.dataset.index=index;item.setAttribute('aria-label',`${word.en}, ${word.kk}, ${word.ru}; ${word.placeName}`);
      item.setAttribute('aria-current',String(index===wordIndex));
      box.append(item);
    });
    if(!box.childElementCount)box.append(make('p','empty-state','No words found. Try another spelling.'));
  }
  function practiceOptions(word,index){
    const alternatives=translations.filter(value=>value!==word.ru);
    const choices=[word.ru];
    for(let step=0;choices.length<4;step++){
      const candidate=alternatives[(index*7+step*5)%alternatives.length];
      if(!choices.includes(candidate))choices.push(candidate);
    }
    const correct=choices.shift();choices.splice(index%4,0,correct);
    return choices;
  }
  function startPractice(queue=words.map((_,index)=>index),retry=false){
    practiceQueue=[...queue];practiceStep=0;practiceScore=0;practiceRetry=retry;practiceMissed=new Set();
    el('practice-intro').hidden=true;el('practice-result').hidden=true;el('practice-play').hidden=false;
    renderPractice();
  }
  function renderPractice(){
    if(practiceStep>=practiceQueue.length){finishPractice();return}
    const index=practiceQueue[practiceStep],word=words[index],box=el('practice-play');box.replaceChildren();
    box.append(make('p','education-progress',`${practiceRetry?'Retry':'Practice'} · ${practiceStep+1} / ${practiceQueue.length} · ${practiceScore} correct`));
    const title=make('h3','education-question',`What does “${word.en}” mean in Russian?`);title.tabIndex=-1;box.append(title);
    box.append(make('p','education-context',`Word from ${word.placeName}`));
    const choices=make('div','answer-grid');box.append(choices);
    const feedback=make('div','education-feedback');feedback.setAttribute('role','status');box.append(feedback);
    const next=button(practiceStep+1===practiceQueue.length?'See result':'Next word →','education-next',()=>{practiceStep++;renderPractice()});next.hidden=true;box.append(next);
    for(const value of practiceOptions(word,index)){
      const option=button(value,'answer-option',()=>{
        if(!next.hidden)return;
        const correct=value===word.ru;if(correct)practiceScore++;else practiceMissed.add(index);
        for(const item of choices.children){item.disabled=true;item.classList.toggle('is-correct',item.textContent===word.ru);item.classList.toggle('is-wrong',item===option&&!correct)}
        feedback.replaceChildren(make('strong','',correct?'Correct!':'Try this word again later.'),make('p','',`${word.en} — ${word.ru} · ${word.placeName}`),sourceLink('Dictionary source',word.source));
        next.hidden=false;focus(next);
      });choices.append(option);
    }
    focus(title,true);
  }
  function finishPractice(){
    el('practice-play').hidden=true;const box=el('practice-result');box.hidden=false;box.replaceChildren();
    const heading=make('h3','',practiceMissed.size?'Practice complete':'Great work!');heading.tabIndex=-1;
    box.append(heading,make('p','education-score',`${practiceScore} / ${practiceQueue.length} correct`));
    if(practiceMissed.size)box.append(button(`Retry missed words (${practiceMissed.size})`,'primary-education',()=>startPractice([...practiceMissed],true)));
    box.append(button('Start all 36 again','secondary-education',()=>startPractice()));
    focus(heading,true);
  }

  function startQuiz(mode){
    quizMode=mode;quizQueue=mode===5?[0,4,9,13,18].map(index=>QUIZ_BANK[index]):[...QUIZ_BANK];
    quizStep=0;quizScore=0;el('quiz-intro').hidden=true;el('quiz-result').hidden=true;el('quiz-play').hidden=false;renderQuiz();
  }
  function renderQuiz(){
    if(quizStep>=quizQueue.length){finishQuiz();return}
    const question=quizQueue[quizStep],fact=placeById.get(question.placeId).facts[question.factIndex],box=el('quiz-play');box.replaceChildren();
    const top=make('div','quiz-meta');top.append(make('p','education-progress',`Question ${quizStep+1} / ${quizQueue.length}`),make('p','quiz-score',`Score ${quizScore}`));box.append(top);
    const progress=make('div','quiz-progress');progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Quiz progress');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(quizQueue.length));progress.setAttribute('aria-valuenow',String(quizStep));const bar=make('span','');bar.style.width=`${quizStep/quizQueue.length*100}%`;progress.append(bar);box.append(progress);
    const title=make('h3','education-question',question.question);title.tabIndex=-1;box.append(title);
    const choices=make('div','answer-grid');box.append(choices);
    const feedback=make('div','education-feedback');feedback.setAttribute('role','status');box.append(feedback);
    const next=button(quizStep+1===quizQueue.length?'See result':'Next question →','education-next',()=>{quizStep++;renderQuiz()});next.hidden=true;box.append(next);
    for(const value of question.options){
      const option=button(value,'answer-option',()=>{
        if(!next.hidden)return;
        const correct=value===question.answer;if(correct)quizScore++;
        for(const item of choices.children){item.disabled=true;item.classList.toggle('is-correct',item.textContent===question.answer);item.classList.toggle('is-wrong',item===option&&!correct)}
        feedback.classList.toggle('is-correct',correct);feedback.classList.toggle('is-wrong',!correct);
        const feedbackIcon=make('span','feedback-icon');feedbackIcon.setAttribute('aria-hidden','true');
        feedbackIcon.innerHTML=correct?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>':'<svg viewBox="0 0 24 24"><path d="M6 6 18 18M18 6 6 18"/></svg>';
        feedback.replaceChildren(feedbackIcon,make('strong','',correct?'Correct!':`Correct answer: ${question.answer}`),make('p','',fact.text),sourceLink('Check the source',fact.source));
        next.hidden=false;focus(next);
      });choices.append(option);
    }
    focus(title,true);
  }
  function finishQuiz(){
    el('quiz-play').hidden=true;const box=el('quiz-result');box.hidden=false;box.replaceChildren();
    const heading=make('h3','','Quiz complete');heading.tabIndex=-1;
    box.append(heading,make('p','education-score',`${quizScore} / ${quizQueue.length} correct`),make('p','',`You answered ${quizScore} of ${quizQueue.length} questions correctly. Review the sources and try again.`));
    box.append(button(`Try ${quizMode} questions again`,'primary-education',()=>startQuiz(quizMode)),button('Quick quiz · 5','secondary-education',()=>startQuiz(5)),button('Full quiz · 20','secondary-education',()=>startQuiz(20)));
    focus(heading,true);
  }

  el('word-speak').disabled=!supportedSpeech;
  if(!supportedSpeech)el('word-speak').title='Speech is unavailable in this browser';
  el('word-speak').addEventListener('click',speakWord);
  el('word-focus').insertBefore(ATLAS_SPEECH.controls(el('word-speech-status')),el('word-speech-status'));
  el('word-search').addEventListener('input',drawWordPicker);
  el('word-prev').addEventListener('click',()=>showWord(wordIndex-1));
  el('word-next').addEventListener('click',()=>showWord(wordIndex+1));
  el('learn-words-tab').addEventListener('click',()=>showLearnMode('words'));
  el('learn-practice-tab').addEventListener('click',()=>showLearnMode('practice'));
  el('practice-start').addEventListener('click',()=>startPractice());
  el('quiz-short').addEventListener('click',()=>startQuiz(5));
  el('quiz-full').addEventListener('click',()=>startQuiz(20));
  drawWordPicker();showWord(0);
})();
