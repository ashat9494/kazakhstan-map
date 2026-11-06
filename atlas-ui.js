(() => {
  'use strict';
  const places = JSON.parse(document.getElementById('atlas-data').textContent);
  const byId = new Map(places.map(p => [p.id,p]));
  const tourismById = new Map(TOURISM.map(item => [item.id,item]));
  const svg = document.getElementById('atlas');
  const frame = document.getElementById('map-frame');
  const shell = document.getElementById('shell');
  const panel = document.getElementById('card-panel');
  const gallery = document.getElementById('gallery');
  // The built SVG already frames the unchanged projected geometry.
  let selected = null, lastInvoker = null;
  let galleryPlace = null, galleryIndex = 0, inlineIndex = 0, fallbackPresentation = false;
  const categoryName = {nature:'Nature',history:'History',modern:'Architecture',science:'Science'};
  const iconPaths = {
    nature:'<path d="M12 21V9m0 8c-5-1-7-5-7-10 6 0 9 4 7 10Zm0-3c0-5 3-8 8-9 0 5-3 9-8 9Z"/>',
    history:'<path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-8h6v8M5 10h14"/>',
    modern:'<path d="M4 21h16M6 21V8l6-5 6 5v13M10 11h4m-4 4h4"/>',
    science:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(35 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-35 12 12)"/>'
  };
  const uiIcons = {
    close:'<path d="M5 5 19 19M19 5 5 19"/>',
    sound:'<path d="M4 9v6h4l5 4V5L8 9H4Zm13-1a6 6 0 0 1 0 8"/>',
    photo:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1"/><path d="m4 17 5-5 3 3 3-4 5 6"/>',
    expand:'<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    left:'<path d="m15 5-7 7 7 7"/>',right:'<path d="m9 5 7 7-7 7"/>'
  };
  const node = (tag,cls,text) => {const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
  const icon = (name) => {const e=document.createElementNS('http://www.w3.org/2000/svg','svg');e.setAttribute('viewBox','0 0 24 24');e.setAttribute('fill','none');e.setAttribute('stroke','currentColor');e.setAttribute('stroke-width','1.8');e.setAttribute('stroke-linecap','round');e.setAttribute('stroke-linejoin','round');e.setAttribute('aria-hidden','true');e.innerHTML=uiIcons[name]||iconPaths[name]||'';return e};
  const link = (label,href) => {const a=node('a','',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
  const safeFocus = e => {if(e&&e.isConnected&&typeof e.focus==='function')e.focus({preventScroll:true})};

  function stopSpeech(){ATLAS_SPEECH.stop()}
  function placeholder(message){
    const box=node('div','photo-placeholder');box.setAttribute('role','img');box.setAttribute('aria-label',message);
    box.append(icon('photo'),node('strong','',message),node('span','','A verified photograph will appear here after its rights and subject are confirmed.'));
    return box;
  }
  function photoFigure(p){
    const fig=node('figure','hero');fig.dataset.id=p.id;fig.tabIndex=0;
    fig.setAttribute('aria-label',`${p.name} photographs. Use left and right arrow keys to change photos.`);
    const media=node('div','hero-media'),img=node('img');img.decoding='async';img.loading='eager';img.width=1920;
    const unavailable=placeholder('Photo unavailable');unavailable.classList.add('hero-unavailable');unavailable.hidden=true;
    media.append(img,unavailable);
    if(p.photos.length>1){
      for(const [direction,label,delta] of [['prev','Previous photo',-1],['next','Next photo',1]]){
        const button=node('button',`hero-arrow ${direction}`);button.type='button';button.setAttribute('aria-label',label);
        button.append(icon(direction==='prev'?'left':'right'));button.addEventListener('click',()=>showInlinePhoto(p,fig,inlineIndex+delta));media.append(button);
      }
      media.append(node('span','hero-count'));
      let touchStart=null;
      fig.addEventListener('touchstart',event=>{if(event.touches.length===1)touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY}},{passive:true});
      fig.addEventListener('touchend',event=>{if(!touchStart||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)showInlinePhoto(p,fig,inlineIndex+(dx<0?1:-1))},{passive:true});
      fig.addEventListener('keydown',event=>{if(event.target!==fig)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showInlinePhoto(p,fig,inlineIndex+(event.key==='ArrowRight'?1:-1))}});
    }
    const cap=node('figcaption');fig.append(media,cap);
    img.addEventListener('load',()=>{img.hidden=false;unavailable.hidden=true;requestAnimationFrame(()=>img.classList.remove('changing'))});
    img.addEventListener('error',()=>{img.hidden=true;unavailable.hidden=false;img.classList.remove('changing')});
    return fig;
  }
  function showInlinePhoto(p,fig,index){
    inlineIndex=(index+p.photos.length)%p.photos.length;
    const photo=p.photos[inlineIndex],img=fig.querySelector('img');
    img.classList.add('changing');img.hidden=false;fig.querySelector('.hero-unavailable').hidden=true;
    img.alt=photo.alt;img.src=photo.file;
    fig.querySelector('figcaption').textContent=photo.caption;
    const count=fig.querySelector('.hero-count');if(count)count.textContent=`${inlineIndex+1} / ${p.photos.length}`;
    const credit=panel.querySelector('.photo-credit');
    if(credit){const line=credit.querySelector('p');line.replaceChildren(document.createTextNode(`${photo.author} · `),link(photo.title,photo.page),document.createTextNode(' · '),link(photo.license,photo.licenseUrl));}
  }
  function actionButton(label,name,secondary=false){const b=node('button',`action-btn${secondary?' secondary':''}`);b.type='button';b.append(icon(name),document.createTextNode(label));return b}
  function stopFullscreen(){if(document.fullscreenElement===panel&&document.exitFullscreen)Promise.resolve(document.exitFullscreen()).catch(()=>{});fallbackPresentation=false;panel.classList.remove('presentation')}
  function updateFullscreenButton(){const b=panel.querySelector('#fullscreen-button');if(b)b.lastChild.textContent=(document.fullscreenElement===panel||fallbackPresentation)?'Exit Full Screen':'Full Screen'}
  async function toggleFullscreen(){
    if(document.fullscreenElement===panel||fallbackPresentation){stopFullscreen();updateFullscreenButton();return}
    if(panel.requestFullscreen){try{await panel.requestFullscreen();updateFullscreenButton();return}catch{}}
    fallbackPresentation=true;panel.classList.add('presentation');updateFullscreenButton();safeFocus(panel.querySelector('.card-close'));
  }
  document.addEventListener('fullscreenchange',updateFullscreenButton);

  function listen(p,button,status){
    if(button.dataset.playing==='true'){stopSpeech();return}
    const travel=tourismById.get(p.id);
    const text=[p.name,travel?.overview||p.description,...p.facts.map(f=>f.text)].join(' ');
    const started=ATLAS_SPEECH.speak(text,status,()=>{button.dataset.playing='false';button.lastChild.textContent='Listen'},{kind:'card',id:p.id});
    button.dataset.playing=String(started);button.lastChild.textContent=started?'Stop':'Listen';
  }

  function renderCard(p){
    const travel=tourismById.get(p.id);
    panel.replaceChildren();
    const head=node('header','card-head'),heading=node('div');
    const category=node('span',`category-chip ${p.category}`);category.append(icon(p.category),document.createTextNode(categoryName[p.category]||'Place'));
    heading.append(category,node('h2','',p.name));
    const meta=node('p','meta');meta.append(node('span','',p.region),node('span','',`${p.number} / 12`));heading.append(meta);
    const close=node('button','icon-btn card-close');close.type='button';close.setAttribute('aria-label','Close place card');close.append(icon('close'));close.addEventListener('click',clearSelection);
    head.append(heading,close);panel.append(head);
    const actions=node('div','actions'),status=node('p','status');status.setAttribute('aria-live','polite');
    const listenButton=actionButton('Listen','sound');listenButton.id='listen-button';
    if(!ATLAS_SPEECH.available){listenButton.disabled=true;listenButton.title='Speech is unavailable in this browser'}
    else listenButton.addEventListener('click',()=>listen(p,listenButton,status));
    actions.append(listenButton,ATLAS_SPEECH.controls(status));
    if(p.photos.length){const galleryButton=actionButton(`Gallery (${p.photos.length})`,'photo',true);galleryButton.id='gallery-button';galleryButton.setAttribute('aria-label',`Photo Gallery, ${p.photos.length} photos`);galleryButton.addEventListener('click',()=>openGallery(p));actions.append(galleryButton)}
    const fullButton=actionButton('Full Screen','expand',true);fullButton.id='fullscreen-button';fullButton.addEventListener('click',toggleFullscreen);actions.append(fullButton);
    panel.append(actions,status);
    const photo=p.photos[0],figure=photo?photoFigure(p):null;panel.append(figure||placeholder(p.id==='baiterek'?'Baiterek photo omitted: rights to the monument image are not confirmed for public distribution':'Photo awaiting verification'));
    const body=node('div','card-body');
    if(travel){
      const overview=node('section','tourism-card-section overview-section');overview.append(node('h3','','Overview'),node('p','description',travel.overview));body.append(overview);
      const highlights=node('section','tourism-card-section highlights-section');highlights.append(node('h3','','Highlights'));
      const highlightsList=node('ul','tourism-highlights');for(const item of travel.highlights)highlightsList.append(node('li','',item));highlights.append(highlightsList);body.append(highlights);
      const story=node('section','tourism-card-section');story.append(node('h3','','History & Nature'),node('p','',travel.story));body.append(story);
      const location=node('section','tourism-card-section location-section');location.append(node('h3','','Location'),node('p','',travel.location));
      location.append(node('p',`marker-note${p.coordinateConfidence==='low'?' low':''}`,`Marker: ${p.markerMeaning}. Coordinate confidence: ${p.coordinateConfidence}.`));body.append(location);
      if(travel.season||travel.tip){const tips=node('section','tourism-card-section tips-section');tips.append(node('h3','','Travel Tips'));if(travel.season)tips.append(node('p','tourism-season',travel.season));if(travel.tip)tips.append(node('p','',travel.tip));body.append(tips)}
      const official=node('section','tourism-card-section official-section');official.append(node('h3','','Official Sources'));
      const officialList=node('ul');for(const [label,url] of travel.sources){const li=node('li');li.append(link(label,url));officialList.append(li)}official.append(officialList);body.append(official);
    }else{body.append(node('p','description',p.description),node('p',`marker-note${p.coordinateConfidence==='low'?' low':''}`,`Marker: ${p.markerMeaning}. Coordinate confidence: ${p.coordinateConfidence}.`))}
    if(p.facts.length){
      const section=node('section','card-section facts-section');section.append(node('h3','','Interesting Facts'));
      const ol=node('ol','facts');for(const fact of p.facts){const li=node('li','',fact.text);li.append(document.createTextNode(' '),link('Source',fact.source));ol.append(li)}section.append(ol);body.append(section);
    }
    if(p.words.length){
      const section=node('section','card-section words-section');section.append(node('h3','','Learn New Words'));
      const dl=node('dl','words');for(const [en,ru,source] of p.words){const item=node('div');const kazakh=KAZAKH_WORDS[en];const kk=node('dd','',kazakh?.kk||'Translation pending');kk.lang='kk';const russian=node('dd','',ru);russian.lang='ru';item.append(node('dt','',en),kk,russian,link('Russian dictionary',source));if(kazakh)item.append(document.createTextNode(' · '),link('Kazakh dictionary',kazakh.source));dl.append(item)}section.append(dl);body.append(section);
    }
    if(photo){
      const credit=node('div','photo-credit');credit.append(node('strong','','Photograph and licence'));
      const line=node('p');line.append(document.createTextNode(`${photo.author} · `),link(photo.title,photo.page),document.createTextNode(' · '),link(photo.license,photo.licenseUrl));credit.append(line);
      credit.append(node('p','',`Changes: ${photo.changes||'Wikimedia Commons resized thumbnail; displayed with responsive cropping. No retouching.'}`));
      if(photo.rightsNote)credit.append(node('p','',photo.rightsNote));
      body.append(credit);
    }
    const sources=node('div','sources');sources.append(node('strong','','More sources'));
    const sourceLine=node('p');sourceLine.append(link('Place information',p.source),document.createTextNode(' · '));
    if(p.id==='charyn')sourceLine.append(node('span','','Marker source link under review'));
    else sourceLine.append(link('Marker source',p.coordinateSource));
    sources.append(sourceLine);body.append(sources);
    panel.append(body);
    const nav=node('nav','card-nav');nav.setAttribute('aria-label','Switch places');
    const prev=places[(p.number+10)%places.length],next=places[p.number%places.length];
    const previous=node('button','nav-btn');previous.type='button';previous.append(icon('left'),document.createTextNode(` Previous: ${prev.name}`));previous.addEventListener('click',()=>select(prev.id));
    const following=node('button','nav-btn');following.type='button';following.append(document.createTextNode(`Next: ${next.name} `),icon('right'));following.addEventListener('click',()=>select(next.id));
    nav.append(previous,following);panel.append(nav);
    if(figure)showInlinePhoto(p,figure,0);
    updateFullscreenButton();return close;
  }

  function select(id,invoker){
    const p=byId.get(id);if(!p)return;
    stopSpeech();if(invoker&&(!panel.contains(invoker)))lastInvoker=invoker;
    selected=id;shell.classList.add('has-selection');panel.hidden=false;
    document.querySelectorAll('.marker').forEach(m=>m.classList.toggle('selected',m.dataset.id===id));
    const close=renderCard(p);panel.scrollTop=0;safeFocus(close);
    document.dispatchEvent(new CustomEvent('atlas:select',{detail:{id}}));
  }
  function clearSelection(){
    stopSpeech();if(gallery.open)gallery.close();stopFullscreen();selected=null;panel.hidden=true;shell.classList.remove('has-selection');
    document.querySelectorAll('.marker').forEach(m=>m.classList.remove('selected'));
    safeFocus(lastInvoker&&lastInvoker.isConnected?lastInvoker:frame);lastInvoker=null;
    document.dispatchEvent(new CustomEvent('atlas:clear'));
  }

  function renderGallery(){
    if(!galleryPlace)return;const items=galleryPlace.photos,photo=items[galleryIndex];
    const img=document.getElementById('gallery-image');img.hidden=false;img.src=photo.file;img.alt=photo.alt;
    document.getElementById('gallery-error').hidden=true;
    document.getElementById('gallery-title').textContent=galleryPlace.name;
    document.getElementById('gallery-caption').textContent=photo.caption;
    const credit=document.getElementById('gallery-credit');credit.replaceChildren(document.createTextNode(`${photo.author} · `),link(photo.title,photo.page),document.createTextNode(' · '),link(photo.license,photo.licenseUrl));
    document.getElementById('gallery-changes').textContent=`Changes: ${photo.changes||'Wikimedia Commons resized thumbnail; responsive display only.'}`;
    const rights=document.getElementById('gallery-rights');rights.hidden=!photo.rightsNote;rights.textContent=photo.rightsNote||'';
    document.getElementById('gallery-count').textContent=`${galleryIndex+1} of ${items.length}`;
    document.getElementById('gallery-prev').disabled=items.length<2;document.getElementById('gallery-next').disabled=items.length<2;
  }
  function openGallery(p){if(!p.photos.length)return;if(gallery.open)gallery.close();galleryPlace=p;galleryIndex=inlineIndex;renderGallery();if(gallery.showModal)gallery.showModal();else gallery.setAttribute('open','');safeFocus(document.getElementById('gallery-close'))}
  function shiftGallery(delta){if(!galleryPlace)return;galleryIndex=(galleryIndex+delta+galleryPlace.photos.length)%galleryPlace.photos.length;renderGallery()}
  document.getElementById('gallery-image').addEventListener('error',()=>{document.getElementById('gallery-image').hidden=true;document.getElementById('gallery-error').hidden=false});
  document.getElementById('gallery-close').addEventListener('click',()=>gallery.close());
  document.getElementById('gallery-prev').addEventListener('click',()=>shiftGallery(-1));
  document.getElementById('gallery-next').addEventListener('click',()=>shiftGallery(1));
  gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();shiftGallery(-1)}if(e.key==='ArrowRight'){e.preventDefault();shiftGallery(1)}});
  gallery.addEventListener('close',()=>{galleryPlace=null;safeFocus(panel.querySelector('#gallery-button'))});

  document.addEventListener('atlas:request-select',e=>select(e.detail.id,e.detail.invoker));
  svg.addEventListener('click',e=>{const m=e.target.closest('.marker');if(m)select(m.dataset.id,m)});
  svg.addEventListener('keydown',e=>{const m=e.target.closest('.marker');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(m.dataset.id,m)}});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!selected||gallery.open)return;if(document.fullscreenElement===panel||fallbackPresentation){stopFullscreen();updateFullscreenButton()}else clearSelection()});
})();
