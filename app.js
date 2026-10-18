(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const hasG=!!(window.gsap&&window.ScrollTrigger);
if(hasG)gsap.registerPlugin(ScrollTrigger);
const fmt=n=>Math.floor(n).toLocaleString('en-US');

/* ---------- accent themes ---------- */
const ACC={
  ember:{a:'#ff5a1f',b:'#e0301c',rgb:'255,90,31',rgb2:'224,48,28'},
  ice:{a:'#35c8ff',b:'#2a6bff',rgb:'53,200,255',rgb2:'42,107,255'},
  toxic:{a:'#b6ff3b',b:'#19c37d',rgb:'182,255,59',rgb2:'25,195,125'},
  violet:{a:'#c25cff',b:'#ff3d9a',rgb:'194,92,255',rgb2:'255,61,154'}
};
let cur=ACC.ember, curName='ember';
function setAcc(n,quiet){
  cur=ACC[n]||ACC.ember;curName=n;const s=document.documentElement.style;
  s.setProperty('--ac',cur.a);s.setProperty('--ac2',cur.b);s.setProperty('--ac-rgb',cur.rgb);s.setProperty('--ac2-rgb',cur.rgb2);
  $$('#dock [data-ac]').forEach(b=>b.classList.toggle('on',b.dataset.ac===n));
  try{localStorage.setItem('emberlock-acc',n)}catch(e){}
  if(!quiet){beep(520,.08,'triangle');toast('Accent: '+n)}
}
try{const s=localStorage.getItem('emberlock-acc');if(s&&ACC[s])setAcc(s,true)}catch(e){}
$('#dock').addEventListener('click',e=>{const b=e.target.closest('[data-ac]');if(b)setAcc(b.dataset.ac)});

/* ---------- sound ---------- */
let actx=null,soundOn=false;
function beep(f,d,type,vol){
  if(!soundOn)return;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();
  const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.value=f;
  g.gain.value=vol||.05;g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);
  o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+d)}catch(e){}
}
function setSound(v){soundOn=v;const b=$('#snd');b.setAttribute('aria-pressed',v);b.textContent=v?'SOUND ON':'SOUND OFF';if(v)beep(660,.12,'triangle')}
$('#snd').addEventListener('click',()=>setSound(!soundOn));

/* ---------- toast ---------- */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)}

/* ---------- boot ---------- */
const bootMsgs=['mounting secure enclave','verifying firmware signatures','loading anomaly model','calibrating ember core','handshake with fleet network','all systems nominal'];
let bootDone=false;
function finishBoot(){if(bootDone)return;bootDone=true;$('#boot').classList.add('done');document.body.classList.add('has-cur');intro()}
(function(){
  const n=$('#bootN'),b=$('#bootB'),l=$('#bootL');let p=0,i=0;
  const dur=reduce?200:1700,t0=performance.now();
  (function tick(t){
    p=clamp((t-t0)/dur,0,1);const e=1-Math.pow(1-p,2.2);
    n.textContent=Math.floor(e*100);b.style.width=e*100+'%';
    const want=Math.floor(e*bootMsgs.length);
    while(i<want&&i<bootMsgs.length){const d=document.createElement('div');d.textContent=bootMsgs[i++];l.appendChild(d)}
    if(p<1)requestAnimationFrame(tick);else setTimeout(finishBoot,250);
  })(t0);
  $('#bootSkip').addEventListener('click',finishBoot);
  setTimeout(finishBoot,4000);
})();

/* ---------- scramble text ---------- */
const GL='#%&@$*+=<>/\\|01';
function scramble(el,dur){
  const txt=el.dataset.t||(el.dataset.t=el.textContent);
  if(reduce){el.textContent=txt;return}
  const t0=performance.now();
  (function f(t){
    const p=clamp((t-t0)/dur,0,1);let out='';
    for(let i=0;i<txt.length;i++){const c=txt[i];out+=(c===' '||i<txt.length*p)?c:GL[Math.floor(Math.random()*GL.length)]}
    el.textContent=out;if(p<1)requestAnimationFrame(f);else el.textContent=txt;
  })(t0);
}
function intro(){
  $$('#h1 .ln').forEach((el,i)=>setTimeout(()=>scramble(el,900),i*220));
  if(hasG&&!reduce){
    gsap.from('.hero .chip,.hero p.lead,.hero .cta-row,.hero .live',{y:30,opacity:0,duration:.9,stagger:.12,delay:.4,ease:'power3.out'});
    gsap.from('#orb',{scale:.2,opacity:0,duration:1.4,ease:'elastic.out(1,.6)',delay:.3});
    gsap.from('nav.top',{y:-60,opacity:0,duration:.8,delay:.6,ease:'power3.out'});
  }
}

/* ---------- cursor + magnetic ---------- */
const cd=$('#cd'),cr=$('#cr');let mx=0,my=0,rx=0,ry=0;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;cd.style.transform=`translate(${mx}px,${my}px)`},{passive:true});
(function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;cr.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
document.addEventListener('pointerover',e=>{cr.classList.toggle('big',!!e.target.closest('a,button,[data-cursor],input'))});
if(fine)$$('[data-mag]').forEach(el=>{
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
  el.addEventListener('pointerleave',()=>{el.style.transform=''});
});

/* ---------- nav / progress / banner ---------- */
const prog=$('#prog'),nav=$('#nav');let lastY=0,banOn=true;
function setLow(){nav.classList.toggle('low',banOn&&scrollY<40)}setLow();
addEventListener('scroll',()=>{
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;prog.style.width=(y/h*100)+'%';
  nav.classList.toggle('hide',y>lastY&&y>500);lastY=y;setLow();
},{passive:true});
$('#banX').addEventListener('click',()=>{$('#banner').style.display='none';banOn=false;setLow()});
const secIds=['ops','sim','platform','industries','compliance'];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#navLinks a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{threshold:.35});
secIds.forEach(id=>io.observe($('#'+id)));

/* ---------- marquee ---------- */
const brands=['Halvorsen Robotics','NORTHGATE','Kestrel Aero','Obelisk Energy','Tidewell Medical','Axiom Motors','Mirrorfield','Lumen Drives','Stratos Labs','Ferrule & Co'];
$('#marq').innerHTML=[...brands,...brands].map(b=>`<span>${b}</span>`).join('');

/* ---------- hero canvas ---------- */
(function(){
  const cv=$('#heroCv'),ctx=cv.getContext('2d'),orb=$('#orb'),tag=$('#orbTag'),hero=$('#hero');
  let W,H,dpr,px=.5,py=.5,tx=.5,ty=.5,rip=[],vis=true;
  function size(){dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=(e.clientY-r.top)/r.height});
  hero.addEventListener('pointerdown',e=>{const r=hero.getBoundingClientRect();if(e.target.closest('a,button'))return;rip.push({x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()});beep(220,.2,'sawtooth',.03)});
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(hero);
  function bez(p0,p1,p2,p3,t){const u=1-t;return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3}
  function frame(t){
    requestAnimationFrame(frame);if(!vis)return;
    px+=(tx-px)*.05;py+=(ty-py)*.05;
    ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    const nar=W<760;
    const cx=W*(nar?.5:.67)+(px-.5)*36, cy=H*(nar?.8:.6)+(py-.5)*26;
    orb.style.left=cx+'px';orb.style.top=cy+'px';
    tag.style.left=cx+'px';tag.style.top=(cy+(orb.offsetWidth/2)+22)+'px';
    const N=nar?46:84, ts=t*.001, rgb=cur.rgb, rgb2=cur.rgb2;
    for(let i=0;i<N;i++){
      const u=i/(N-1), edge=1-Math.abs(u-.5)*2;
      const sx=-30, sy=(nar?H*.5:H*.1)+u*(nar?H*.4:H*.82);
      const ex=cx-orb.offsetWidth*.45, ey=cy+(u-.5)*34;
      const wave=Math.sin(ts*1.1+u*6.2)*46+Math.sin(ts*.7+u*12)*20+(py-.5)*80*(u-.5);
      const c1x=W*.3+(px-.5)*90, c1y=sy+wave;
      const c2x=cx-W*.16, c2y=ey+(u-.5)*H*.34+wave*.4;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,ex,ey);
      ctx.strokeStyle=`rgba(${u<.5?rgb2:rgb},${.07+.3*edge})`;ctx.lineWidth=1;ctx.stroke();
      if(i%3===0){
        const p=(ts*.22+i*.137)%1;
        const x=bez(sx,c1x,c2x,ex,p),y=bez(sy,c1y,c2y,ey,p);
        ctx.beginPath();ctx.arc(x,y,1.2+edge*1.6,0,7);ctx.fillStyle=`rgba(255,${200-80*(1-p)|0},${150-90*(1-p)|0},${.25+.75*p})`;ctx.fill();
      }
    }
    // beam beyond orb
    const bx=cx+orb.offsetWidth*.5;
    const g=ctx.createLinearGradient(bx,0,W,0);g.addColorStop(0,`rgba(${rgb},.9)`);g.addColorStop(1,`rgba(${rgb},0)`);
    ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(bx,cy);ctx.lineTo(W,cy+(py-.5)*10);ctx.stroke();
    const bp=(ts*.5)%1;ctx.beginPath();ctx.arc(bx+(W-bx)*bp,cy+(py-.5)*10*bp,3,0,7);ctx.fillStyle='#fff';ctx.shadowColor=cur.a;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
    // ripples
    rip=rip.filter(r=>t-r.t<1400);
    rip.forEach(r=>{const p=(t-r.t)/1400;ctx.beginPath();ctx.arc(r.x,r.y,p*260,0,7);ctx.strokeStyle=`rgba(${rgb},${.7*(1-p)})`;ctx.lineWidth=2;ctx.stroke()});
    ctx.globalCompositeOperation='source-over';
  }
  requestAnimationFrame(frame);
})();

/* ---------- live counters ---------- */
let blocked=2847193;
setInterval(()=>{blocked+=Math.floor(rnd(3,19));$('#heroCount').textContent=fmt(blocked)},420);

/* ---------- manifesto ---------- */
(function(){
  const el=$('#manifT');
  const walk=(node,hl)=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(w=>{if(!w.trim()){f.appendChild(document.createTextNode(w));return}const s=document.createElement('span');s.className='w'+(hl?' hl':'');s.textContent=w;f.appendChild(s)});n.replaceWith(f)}
    else if(n.nodeType===1){walk(n,n.classList.contains('hlw')||hl)}})};
  walk(el,false);
  const ws=$$('.w',el);
  function set(p){const n=ws.length*p;ws.forEach((w,i)=>{const o=clamp(.2+(n-i)*.8,.2,1);w.style.opacity=o;w.classList.toggle('lit',o>=1)})}
  if(hasG&&!reduce){ScrollTrigger.create({trigger:'#manif',start:'top top',end:'+=140%',pin:true,scrub:.4,onUpdate:s=>set(s.progress*1.08)})}
  else set(1);
})();

/* ---------- reveal ---------- */
if(hasG&&!reduce){
  $$('[data-rv]').forEach(el=>gsap.from(el,{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
  gsap.from('.paper',{y:80,duration:1,ease:'none',scrollTrigger:{trigger:'#industries',start:'top bottom',end:'top 40%',scrub:true}});
}

/* ---------- threat feed + globe ---------- */
const ATK=['CAN-bus replay','Firmware downgrade','Ransomware dropper','Lidar spoof','Rogue OTA package','Supply-chain implant','MQTT hijack','Model poisoning','Brute-force SSH','Bootloader tamper'];
const DEV=['AMR','ARM','DRONE','AGV','CNC','EV-ECU','INFUSION','TURBINE','CRANE'];
const CITIES=[['Rotterdam',51.9,4.5],['Detroit',42.3,-83],['Shenzhen',22.5,114],['Stuttgart',48.8,9.2],['Austin',30.2,-97.7],['Osaka',34.7,135.5],['Gdansk',54.3,18.6],['Monterrey',25.7,-100.3],['Pune',18.5,73.8],['Busan',35.1,129],['Lyon',45.7,4.8],['Brno',49.2,16.6],['Toronto',43.6,-79.4],['Sao Paulo',-23.5,-46.6],['Perth',-31.9,115.8],['Tampere',61.5,23.7]];
const ORIG=[['unknown',55.7,37.6],['unknown',39.9,116.4],['unknown',-6.2,106.8],['unknown',6.5,3.4],['unknown',35.6,51.4],['unknown',-34.6,-58.4],['unknown',52.5,13.4],['unknown',40.7,-74]];
const term=$('#term');
function logLine(txt,cls){const d=document.createElement('div');d.className=cls||'';d.innerHTML=txt;term.appendChild(d);while(term.children.length>16)term.firstChild.remove()}
const ts=()=>new Date().toTimeString().slice(0,8);
(function(){
  const cv=$('#globe'),ctx=cv.getContext('2d');let W,H,dpr,rot=0,vel=.0022,drag=false,lx=0,vis=false;
  function size(){dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
  // land mask from layered sines, fibonacci sphere
  const pts=[],NP=2600;
  for(let i=0;i<NP;i++){
    const lat=Math.asin(1-2*(i+.5)/NP),lon=(i*Math.PI*(3-Math.sqrt(5)))%(Math.PI*2);
    const v=Math.sin(lon*1.7+1)*Math.cos(lat*2.4)+Math.sin(lon*3.1-lat*2)*.6+Math.cos(lon*.9+lat*3.2)*.5;
    pts.push({lat,lon,land:v>.25});
  }
  const vec=(lat,lon)=>[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];
  const deg=(la,lo)=>vec(la*Math.PI/180,lo*Math.PI/180);
  const nodes=CITIES.map(c=>({n:c[0],v:deg(c[1],c[2])}));
  const orig=ORIG.map(c=>({v:deg(c[1],c[2])}));
  function proj(v){const c=Math.cos(rot),s=Math.sin(rot);const x=v[0]*c+v[2]*s,z=-v[0]*s+v[2]*c;const R=Math.min(W,H-70)*.44;return {x:W/2+x*R,y:(H-70)/2+H*0+ -v[1]*R+30,z}}
  let arcs=[],rings=[];
  function slerp(a,b,s){const d=clamp(a[0]*b[0]+a[1]*b[1]+a[2]*b[2],-1,1),w=Math.acos(d),sw=Math.sin(w)||1;const k1=Math.sin((1-s)*w)/sw,k2=Math.sin(s*w)/sw;const lift=1+.32*Math.sin(Math.PI*s)*(w/Math.PI*1.6);return [(a[0]*k1+b[0]*k2)*lift,(a[1]*k1+b[1]*k2)*lift,(a[2]*k1+b[2]*k2)*lift]}
  function spawn(){
    const o=pick(orig),d=pick(nodes);const a=pick(ATK),dev=pick(DEV);
    arcs.push({o:o.v,d:d.v,t0:performance.now(),dur:rnd(1300,2200),a,dev,city:d.n});
  }
  window.__spawnAttack=spawn;
  setInterval(()=>{if(vis&&!drag)spawn()},900);
  cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;cv.setPointerCapture(e.pointerId);$('#gHint').textContent='spinning...'});
  cv.addEventListener('pointermove',e=>{if(drag){rot+=(e.clientX-lx)*.006;lx=e.clientX}});
  cv.addEventListener('pointerup',()=>{drag=false});
  let gb=0;
  function frame(t){
    requestAnimationFrame(frame);if(!vis)return;
    if(!drag)rot+=vel;
    ctx.clearRect(0,0,W,H);
    const R=Math.min(W,H-70)*.44,cx=W/2,cy=(H-70)/2+30;
    const g=ctx.createRadialGradient(cx,cy,R*.6,cx,cy,R*1.25);g.addColorStop(0,`rgba(${cur.rgb},.08)`);g.addColorStop(.8,`rgba(${cur.rgb},.12)`);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.25,0,7);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
    for(const p of pts){
      const q=proj(vec(p.lat,p.lon));if(q.z<0)continue;
      ctx.fillStyle=p.land?`rgba(255,235,220,${.25+.5*q.z})`:`rgba(255,255,255,${.05+.08*q.z})`;
      ctx.fillRect(q.x,q.y,p.land?1.8:1,p.land?1.8:1);
    }
    nodes.forEach(n=>{const q=proj(n.v);if(q.z<0)return;ctx.beginPath();ctx.arc(q.x,q.y,2.5,0,7);ctx.fillStyle='#3ee6b0';ctx.fill()});
    const now=performance.now();
    arcs=arcs.filter(a=>{
      const p=(now-a.t0)/a.dur;
      if(p>=1){
        const q=proj(a.d);rings.push({v:a.d,t0:now});beep(900+Math.random()*300,.07,'sine',.025);
        const ms=Math.round(rnd(21,64));gb++;blocked+=1;
        logLine(`<span class="t-dim">${ts()}</span> <span class="t-ok">BLOCKED</span> ${a.a} <span class="t-dim">&rarr;</span> ${a.dev}-${Math.floor(rnd(1000,9999))} <span class="t-ac">${a.city}</span> <span class="t-dim">${ms}ms</span>`);
        $('#gBlocked').textContent=fmt(blocked%100000+gb);
        return false;
      }
      ctx.beginPath();let started=false;const tail=Math.max(0,p-.35);
      for(let s=tail;s<=p;s+=.02){const q=proj(slerp(a.o,a.d,s));if(q.z<-.1){started=false;continue}if(!started){ctx.moveTo(q.x,q.y);started=true}else ctx.lineTo(q.x,q.y)}
      ctx.strokeStyle='rgba(255,59,78,.95)';ctx.lineWidth=1.6;ctx.stroke();
      const hq=proj(slerp(a.o,a.d,p));if(hq.z>-.1){ctx.beginPath();ctx.arc(hq.x,hq.y,2.6,0,7);ctx.fillStyle='#fff';ctx.fill()}
      return true;
    });
    rings=rings.filter(r=>{const p=(now-r.t0)/900;if(p>=1)return false;const q=proj(r.v);if(q.z<0)return true;ctx.beginPath();ctx.arc(q.x,q.y,3+p*26,0,7);ctx.strokeStyle=`rgba(62,230,176,${1-p})`;ctx.lineWidth=1.6;ctx.stroke();return true});
  }
  requestAnimationFrame(frame);
  logLine('<span class="t-dim">// emberlock threat-feed v2.4 connected</span>');
  logLine('<span class="t-dim">// showing simulated events</span>');
})();

/* ---------- attack simulator ---------- */
(function(){
  const NS='http://www.w3.org/2000/svg';
  const base={x:150,y:262},L1=118,L2=98;
  const A1=$('#a1'),A2=$('#a2'),J0=$('#j0'),J1=$('#j1'),G1=$('#g1'),G2=$('#g2'),crate=$('#crate'),sparks=$('#sparks'),dome=$('#dome');
  const stage=$('#stage'),status=$('#status'),statusT=$('#statusT'),log=$('#simLog');
  const state={shield:true,rogue:false,busy:false,integrity:100,crates:0,cost:0};
  let tip={x:220,y:200},grip=0,vis=false;
  const crateS={x:300,y:262,att:false,vx:0,vy:0,fly:false};
  const seq=[{to:[300,222],t:.9},{to:[300,262],t:.4,grab:1},{to:[300,196],t:.45},{to:[72,196],t:1.15},{to:[72,262],t:.4,rel:1},{to:[72,212],t:.4},{to:[220,200],t:.8}];
  let si=0,sT=0,sFrom=[tip.x,tip.y];
  function ik(x,y){
    const dx=x-base.x,dy=y-base.y;let d=Math.hypot(dx,dy);d=clamp(d,Math.abs(L1-L2)+2,L1+L2-1);
    const a=Math.atan2(dy,dx),b=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
    const th=a-b;const jx=base.x+L1*Math.cos(th),jy=base.y+L1*Math.sin(th);
    const dd=d/Math.hypot(dx,dy||.001);return{jx,jy,ex:base.x+dx*dd,ey:base.y+dy*dd,ang:Math.atan2(base.y+dy*dd-jy,base.x+dx*dd-jx)};
  }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function spark(x,y,n,col){for(let i=0;i<n;i++){const l=document.createElementNS(NS,'line');const a=rnd(0,6.28),r=rnd(6,26);l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',x+Math.cos(a)*r);l.setAttribute('y2',y+Math.sin(a)*r);l.setAttribute('stroke',col||'#ffc247');l.setAttribute('stroke-width',2);l.setAttribute('stroke-linecap','round');sparks.appendChild(l);setTimeout(()=>l.remove(),240)}}
  let rogueT=0,rogueTgt=[200,200],last=performance.now(),costAcc=0;
  function step(t){
    requestAnimationFrame(step);if(!vis){last=t;return}
    const dt=Math.min(.05,(t-last)/1000);last=t;
    if(state.rogue){
      rogueT-=dt;if(rogueT<=0){rogueT=rnd(.14,.3);rogueTgt=[rnd(40,330),rnd(120,270)];if(crateS.att&&Math.random()<.35){crateS.att=false;crateS.fly=true;crateS.vx=rnd(-260,260);crateS.vy=rnd(-380,-180);spark(tip.x,tip.y,8,'#ff3b4e')}if(Math.random()<.5)spark(tip.x,tip.y,5)}
      tip.x+=(rogueTgt[0]-tip.x)*Math.min(1,dt*14);tip.y+=(rogueTgt[1]-tip.y)*Math.min(1,dt*14);
      grip=Math.random();
      state.integrity=Math.max(0,state.integrity-dt*34);
      costAcc+=dt*812;state.cost=costAcc;
    } else {
      const s=seq[si];sT+=dt;const p=clamp(sT/s.t,0,1),e=ease(p);
      tip.x=sFrom[0]+(s.to[0]-sFrom[0])*e;tip.y=sFrom[1]+(s.to[1]-sFrom[1])*e;
      grip+=((s.grab||(si>=2&&si<4))?1-grip:-grip)*Math.min(1,dt*10)*(grip>0||s.grab?1:1);
      if(p>=1){
        if(s.grab&&!crateS.fly){crateS.att=true}
        if(s.rel){crateS.att=false;crateS.x=72;crateS.y=262;state.crates++}
        sFrom=[tip.x,tip.y];si=(si+1)%seq.length;sT=0;if(si===0){crateS.x=300;crateS.y=262;crateS.fly=false}
      }
    }
    // crate
    if(crateS.att){crateS.x=tip.x;crateS.y=tip.y+6}
    else if(crateS.fly){crateS.vy+=900*dt;crateS.x+=crateS.vx*dt;crateS.y+=crateS.vy*dt;if(crateS.y>274){crateS.y=274;crateS.vy*=-.35;crateS.vx*=.7}}
    crate.setAttribute('transform',`translate(${crateS.x},${crateS.y})`);
    const k=ik(tip.x,tip.y);
    A1.setAttribute('x1',base.x);A1.setAttribute('y1',base.y);A1.setAttribute('x2',k.jx);A1.setAttribute('y2',k.jy);
    A2.setAttribute('x1',k.jx);A2.setAttribute('y1',k.jy);A2.setAttribute('x2',k.ex);A2.setAttribute('y2',k.ey);
    J0.setAttribute('cx',base.x);J0.setAttribute('cy',base.y);J1.setAttribute('cx',k.jx);J1.setAttribute('cy',k.jy);
    const o=8+(1-clamp(grip,0,1))*7,nx=-Math.sin(k.ang),ny=Math.cos(k.ang),fx=Math.cos(k.ang),fy=Math.sin(k.ang);
    G1.setAttribute('x1',k.ex+nx*o);G1.setAttribute('y1',k.ey+ny*o);G1.setAttribute('x2',k.ex+nx*o+fx*14);G1.setAttribute('y2',k.ey+ny*o+fy*14);
    G2.setAttribute('x1',k.ex-nx*o);G2.setAttribute('y1',k.ey-ny*o);G2.setAttribute('x2',k.ex-nx*o+fx*14);G2.setAttribute('y2',k.ey-ny*o+fy*14);
    const col=state.rogue?'#ff3b4e':'var(--ac)';J0.setAttribute('stroke',col);J1.setAttribute('stroke',col);
    $('#hInt').textContent=Math.round(state.integrity)+'%';
    const m=$('#hMeter');m.style.width=state.integrity+'%';m.style.background=state.integrity>60?'var(--ok)':state.integrity>25?'var(--warn)':'var(--bad)';
    $('#hCrates').textContent=state.crates;$('#hCost').textContent='$'+fmt(state.cost);
  }
  requestAnimationFrame(step);
  new IntersectionObserver(es=>vis=es[0].isIntersecting,{threshold:.05}).observe($('#rig'));

  const ATKS=[
    {n:'Firmware tamper',d:'Unsigned image pushed over OTA',a:'Unsigned firmware image pushed over OTA',b:'Signature mismatch, image rejected',c:'Malicious firmware accepted and flashed'},
    {n:'CAN-bus replay',d:'Recorded torque frames replayed',a:'Replaying motor torque frames 0x1A4',b:'Frame timing anomaly, bus segment isolated',c:'Controller obeys forged torque frames'},
    {n:'Ransomware',d:'Encrypts the controller volume',a:'Dropper encrypting /var/plc/',b:'Entropy spike on write, process frozen',c:'Controller volume encrypted, ransom note shown'},
    {n:'Sensor spoof',d:'Ghost obstacles from fake lidar',a:'Injecting spoofed lidar returns',b:'Sensor fusion disagrees, input discarded',c:'Arm reacts to phantom obstacles'},
    {n:'Supply-chain implant',d:'Trojaned vendor library loads',a:'Vendor library libmotion.so loaded',b:'Unknown module hash, load denied',c:'Backdoor opens reverse shell to C2'}
  ];
  const list=$('#atkList');
  list.innerHTML=ATKS.map((a,i)=>`<button class="atk" data-i="${i}" data-cursor><span><b>${a.n}</b><small>${a.d}</small></span><span class="go">LAUNCH &rarr;</span></button>`).join('');
  function sl(txt,cls){const d=document.createElement('div');d.className=cls||'';d.innerHTML=txt;log.appendChild(d);while(log.children.length>9)log.firstChild.remove()}
  function setStatus(c,t){status.className='pill '+c;statusT.textContent=t}
  function lock(v){state.busy=v;$$('.atk').forEach(b=>b.disabled=v)}
  function run(i){
    if(state.busy||state.rogue)return;const a=ATKS[i];lock(true);
    log.innerHTML='';sl(`<span class="t-bad">[ATTACK]</span> ${a.a}`);beep(140,.3,'sawtooth',.05);
    if(state.shield){
      setTimeout(()=>{sl('<span class="t-ac">[EMBERLOCK]</span> anomaly score 0.97');beep(700,.08,'square',.03)},260);
      setTimeout(()=>{sl(`<span class="t-ac">[EMBERLOCK]</span> ${a.b}`);stage.classList.add('flash');setStatus('cont','Attack contained');dome.setAttribute('stroke-opacity','1');spark(150,160,0);beep(1100,.14,'sine',.05)},560);
      setTimeout(()=>{sl('<span class="t-ok">[OK]</span> contained in 38ms. Line never stopped.');},900);
      setTimeout(()=>{stage.classList.remove('flash');setStatus('ok','Nominal');dome.setAttribute('stroke-opacity','.5');lock(false)},2200);
    } else {
      setTimeout(()=>{sl('<span class="t-w">[WARN]</span> no runtime defense on this device')},320);
      setTimeout(()=>{sl(`<span class="t-bad">[BREACH]</span> ${a.c}`);beep(90,.5,'sawtooth',.07)},800);
      setTimeout(()=>{sl('<span class="t-bad">[BREACH]</span> actuators under attacker control');state.rogue=true;stage.classList.add('alarm');setStatus('bad','Compromised');$('#restore').classList.add('show');spark(tip.x,tip.y,14,'#ff3b4e')},1400);
    }
  }
  list.addEventListener('click',e=>{const b=e.target.closest('.atk');if(b)run(+b.dataset.i)});
  function restore(){
    state.rogue=false;state.integrity=100;state.cost=0;costAcc=0;stage.classList.remove('alarm');setStatus('ok','Nominal');$('#restore').classList.remove('show');
    crateS.att=false;crateS.fly=false;crateS.x=300;crateS.y=262;si=0;sT=0;sFrom=[tip.x,tip.y];lock(false);log.innerHTML='';sl('<span class="t-ok">[OK]</span> line restored from clean image');beep(520,.2,'triangle');
  }
  $('#restore').addEventListener('click',restore);
  function setShield(v){
    state.shield=v;$('#shield').setAttribute('aria-checked',v);$('#atkNote').textContent=v?'shield on':'shield off';
    dome.style.opacity=v?1:0;dome.style.transition='opacity .4s';beep(v?800:200,.15,'triangle');
    if(v&&state.rogue)restore();
  }
  $('#shield').addEventListener('click',()=>setShield(!state.shield));
  window.__sim={run:i=>run(i),setShield,toggle:()=>setShield(!state.shield),get shield(){return state.shield}};
})();

/* ---------- bento ---------- */
(function(){
  $$('.bc').forEach(c=>{
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
      if(fine&&!reduce)c.style.transform=`perspective(900px) rotateX(${((y/r.height)-.5)*-5}deg) rotateY(${((x/r.width)-.5)*6}deg)`});
    c.addEventListener('pointerleave',()=>{c.style.transform=''});
  });
  // fleet
  const f=$('#fleet');for(let i=0;i<48;i++){const d=document.createElement('i');d.title='node '+(i+1);f.appendChild(d)}
  const cells=$$('i',f);
  f.addEventListener('click',e=>{const t=e.target.closest('i');if(!t)return;t.className='safe';toast('Node quarantined');beep(700,.1)});
  setInterval(()=>{const c=pick(cells);if(c.className)return;c.className='hot';setTimeout(()=>{if(c.className==='hot')c.className='safe'},900);setTimeout(()=>{c.className=''},2600)},700);
  // sparkline
  const cv=$('#spark'),x=cv.getContext('2d');let W,H,dpr,data=[],vis=false,spikes=[];
  function size(){dpr=Math.min(devicePixelRatio||1,2);const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
  let tk=0;
  setInterval(()=>{if(!vis)return;tk++;let v=.5+Math.sin(tk*.25)*.12+Math.sin(tk*.9)*.05+rnd(-.03,.03);if(tk%47===0)v=.95;data.push(v);if(v>.9)spikes.push(data.length);if(data.length>90){data.shift();spikes=spikes.map(s=>s-1).filter(s=>s>0)}draw()},60);
  function draw(){
    x.clearRect(0,0,W,H);x.strokeStyle='rgba(255,255,255,.07)';for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,H*i/4);x.lineTo(W,H*i/4);x.stroke()}
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,`rgba(${cur.rgb},.35)`);g.addColorStop(1,'transparent');
    x.beginPath();data.forEach((v,i)=>{const px=i/89*W,py=H-v*H*.9;i?x.lineTo(px,py):x.moveTo(px,py)});
    x.strokeStyle=cur.a;x.lineWidth=2;x.stroke();x.lineTo(data.length/89*W,H);x.lineTo(0,H);x.fillStyle=g;x.fill();
    spikes.forEach(s=>{const px=(s-1)/89*W,py=H-data[s-1]*H*.9;x.beginPath();x.arc(px,py,5,0,7);x.fillStyle='#ff3b4e';x.fill();x.fillStyle='#fff';x.font='10px JetBrains Mono,monospace';x.fillText('ANOMALY',Math.max(2,Math.min(W-52,px-24)),Math.max(12,py-12))});
  }
  // checks
  const ch=$$('#checks div');let ci=0;
  setInterval(()=>{if(ci<ch.length){ch[ci++].classList.add('ok')}else{ci=0;ch.forEach(c=>c.classList.remove('ok'))}},900);
  // OTA
  const hex=()=>[...Array(48)].map(()=>'0123456789abcdef'[Math.random()*16|0]).join('');
  let hp=0;
  setInterval(()=>{hp=(hp+4)%104;const h=hex();const k=Math.min(48,Math.floor(hp/100*48));$('#hash').innerHTML='<b>'+h.slice(0,k)+'</b>'+h.slice(k);$('#otaBar').style.width=Math.min(100,hp)+'%';$('#otaTxt').innerHTML=hp>=100?'<span class="t-ok">signature valid &middot; model valid &middot; timing valid</span>':'verifying signature...'},120);
})();

/* ---------- industries ---------- */
const IND=[
 {k:'Robotics',h:'Factories that never flinch.',p:'Cobots and AMRs share floors with people. Emberlock keeps a hijacked controller from ever turning into a swinging arm.',m:[['0','Unsafe motions'],['38ms','Detect'],['-71%','Audit hours']],r:[.9,.7,.85,.55,.75]},
 {k:'Automotive',h:'ECUs that say no.',p:'From infotainment to brake-by-wire, every bus frame is checked against what that ECU should ever send.',m:[['140','ECUs covered'],['0.4%','CPU cost'],['R155','Evidence ready']],r:[.8,.95,.6,.7,.9]},
 {k:'Medical',h:'Devices patients can trust.',p:'Infusion pumps and surgical robots get runtime protection that does not need a reboot or a recertification.',m:[['524B','Doc pack'],['24h','Incident clock'],['100%','Signed updates']],r:[.7,.6,.95,.8,.65]},
 {k:'Energy',h:'Grids with a pulse check.',p:'Turbines, inverters and substations get a quiet guard that learns normal and reports drift before it matters.',m:[['62443','Mapped'],['12MB','Footprint'],['3.2s','Isolate site']],r:[.85,.9,.55,.9,.6]},
 {k:'Drones',h:'Fly the plan. Only the plan.',p:'Spoofed GPS, hijacked radio links and poisoned vision models are caught on board, with no ground link needed.',m:[['0','Link needed'],['21ms','Spoof detect'],['8g','Agent weight']],r:[.6,.85,.95,.5,.7]}
];
const AX=['Firmware','Network','Sensors','Cloud','Supply chain'];
(function(){
  const tabs=$('#tabs'),R=$('#radar');
  tabs.innerHTML=IND.map((x,i)=>`<button class="tab" role="tab" aria-selected="${i===0}" data-i="${i}" data-cursor>${x.k}</button>`).join('');
  const NSv='http://www.w3.org/2000/svg';
  let h='';[.25,.5,.75,1].forEach(s=>{h+=`<polygon points="${AX.map((_,i)=>{const a=i/5*6.2832-1.5708;return (Math.cos(a)*130*s).toFixed(1)+','+(Math.sin(a)*130*s).toFixed(1)}).join(' ')}" fill="none" stroke="rgba(21,17,15,.16)"/>`});
  AX.forEach((l,i)=>{const a=i/5*6.2832-1.5708;h+=`<line x1="0" y1="0" x2="${Math.cos(a)*130}" y2="${Math.sin(a)*130}" stroke="rgba(21,17,15,.16)"/><text x="${Math.cos(a)*152}" y="${Math.sin(a)*152+4}" text-anchor="middle">${l}</text>`});
  h+=`<polygon id="rPoly" fill="rgba(var(--ac-rgb),.28)" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round"/><g id="rDots"></g>`;
  R.innerHTML=h;
  const cur={v:[0,0,0,0,0]};
  function paint(){const pts=cur.v.map((v,i)=>{const a=i/5*6.2832-1.5708;return [Math.cos(a)*130*v,Math.sin(a)*130*v]});
    $('#rPoly').setAttribute('points',pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '));
    $('#rDots').innerHTML=pts.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="var(--ink)"/>`).join('')}
  function show(i){
    const x=IND[i];$$('.tab',tabs).forEach((b,j)=>b.setAttribute('aria-selected',j===i));
    $('#indH').textContent=x.h;$('#indP').textContent=x.p;$('#indM').innerHTML=x.m.map(m=>`<div><b>${m[0]}</b><span>${m[1]}</span></div>`).join('');
    tween(x.r);
  }
  let raf;function tween(to){cancelAnimationFrame(raf);const from=cur.v.slice(),t0=performance.now();(function f(t){const p=reduce?1:clamp((t-t0)/800,0,1),e=1-Math.pow(1-p,3);cur.v=from.map((v,i)=>v+(to[i]-v)*e);paint();if(p<1)raf=requestAnimationFrame(f)})(t0)}
  tabs.addEventListener('click',e=>{const b=e.target.closest('.tab');if(b){show(+b.dataset.i);beep(600,.06,'triangle')}});
  show(0);
})();

/* ---------- compliance ---------- */
(function(){
  const C=[['EU CRA','Cyber Resilience Act','Vulnerability handling, SBOMs and reporting that satisfy CRA obligations.',['Signed SBOM per release','24h reporting workflow','Support period tracking']],
    ['IEC 62443','Industrial security','Zone and conduit evidence for industrial automation and control systems.',['Security level mapping','Zone diagrams','Patch evidence']],
    ['NIS2','Directive','Supply chain and incident duties handled with a single exportable log.',['Supplier risk view','Incident timeline','Board-ready report']],
    ['ISO/SAE 21434','Road vehicles','Threat analysis and monitoring records for the vehicle lifecycle.',['TARA templates','Monitoring logs','Post-production tracking']],
    ['UN R155','Vehicle cyber','Cybersecurity management evidence for type approval.',['CSMS artifacts','Fleet monitoring','Audit-ready exports']],
    ['FDA 524B','Medical devices','Premarket cybersecurity documentation for connected devices.',['SBOM and plan','Patch cadence proof','Threat model pack']]];
  $('#flips').innerHTML=C.map((c,i)=>`<button class="flip" data-cursor aria-label="${c[0]} details"><div class="flip-in"><div class="face f"><span class="tag">${c[1]}</span><h4>${c[0]}</h4><span class="hint">HOVER OR TAP TO FLIP</span></div><div class="face b"><span class="tag" style="color:#a79f98">${c[0]}</span><p style="margin:0;font-size:14px">${c[2]}</p><ul>${c[3].map(x=>`<li>${x}</li>`).join('')}</ul></div></div></button>`).join('');
  $('#flips').addEventListener('click',e=>{const f=e.target.closest('.flip');if(f)f.classList.toggle('on')});
})();

/* ---------- stats count-up ---------- */
$$('[data-n]').forEach(el=>{
  const to=parseFloat(el.dataset.n),d=+(el.dataset.d||0);
  const run=()=>{const t0=performance.now();(function f(t){const p=clamp((t-t0)/1800,0,1),e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(d);if(p<1)requestAnimationFrame(f)})(t0)};
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){run();o.disconnect()}},{threshold:.5}).observe(el);
});

/* ---------- footer giant + form ---------- */
$('#giant').innerHTML='EMBERLOCK'.split('').map(c=>`<span>${c}</span>`).join('');
$('#form').addEventListener('submit',e=>{e.preventDefault();const v=$('#email').value.trim();toast(v?'You are on the list. We will email '+v:'Enter an email first');if(v){beep(880,.2,'triangle');storm();$('#email').value=''}});

/* ---------- ember storm ---------- */
const sc=$('#storm'),sx=sc.getContext('2d');let parts=[],stormOn=false;
function storm(){
  if(reduce)return;const dpr=Math.min(devicePixelRatio||1,2);sc.width=innerWidth*dpr;sc.height=innerHeight*dpr;sx.setTransform(dpr,0,0,dpr,0,0);
  for(let i=0;i<260;i++)parts.push({x:rnd(0,innerWidth),y:innerHeight+rnd(0,200),vx:rnd(-.6,.6),vy:-rnd(3,12),r:rnd(1,3.5),l:rnd(.6,1)});
  document.body.classList.add('shake');setTimeout(()=>document.body.classList.remove('shake'),500);
  if(!stormOn){stormOn=true;(function f(){sx.clearRect(0,0,innerWidth,innerHeight);sx.globalCompositeOperation='lighter';
    parts=parts.filter(p=>p.l>0&&p.y>-20);parts.forEach(p=>{p.x+=p.vx+Math.sin(p.y*.02)*.6;p.y+=p.vy;p.vy*=.995;p.l-=.004;sx.beginPath();sx.arc(p.x,p.y,p.r,0,7);sx.fillStyle=`rgba(${cur.rgb},${p.l})`;sx.shadowColor=cur.a;sx.shadowBlur=10;sx.fill()});
    if(parts.length)requestAnimationFrame(f);else{stormOn=false;sx.clearRect(0,0,innerWidth,innerHeight)}})()}
}
let kc=[],KON='ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';

/* ---------- command palette ---------- */
const go=id=>()=>{closePal();$(id).scrollIntoView({behavior:reduce?'auto':'smooth'})};
const CMDS=[
  ['Go to live ops','navigate',go('#ops')],['Go to attack simulator','navigate',go('#sim')],['Go to platform','navigate',go('#platform')],['Go to industries','navigate',go('#industries')],['Go to compliance','navigate',go('#compliance')],['Book a demo','navigate',go('#cta')],
  ['Launch random attack','action',()=>{closePal();$('#sim').scrollIntoView({behavior:reduce?'auto':'smooth'});setTimeout(()=>window.__sim.run(Math.floor(Math.random()*5)),700)}],
  ['Toggle Emberlock shield','action',()=>{closePal();window.__sim.toggle();toast('Shield '+(window.__sim.shield?'on':'off'))}],
  ['Ember storm','fx',()=>{closePal();storm();beep(120,.6,'sawtooth',.06)}],
  ['Toggle sound','action',()=>{closePal();setSound(!soundOn);toast('Sound '+(soundOn?'on':'off'))}],
  ['Accent: Ember','theme',()=>{closePal();setAcc('ember')}],['Accent: Ice','theme',()=>{closePal();setAcc('ice')}],['Accent: Toxic','theme',()=>{closePal();setAcc('toxic')}],['Accent: Violet','theme',()=>{closePal();setAcc('violet')}],
  ['Cycle accents (show off)','fx',()=>{closePal();const o=['ice','toxic','violet','ember'];o.forEach((n,i)=>setTimeout(()=>setAcc(n,true),i*700))}]
];
const pal=$('#pal'),palIn=$('#palIn'),palList=$('#palList');let sel=0,shown=CMDS;
function render(){palList.innerHTML=shown.map((c,i)=>`<button class="${i===sel?'sel':''}" data-i="${i}"><span>${c[0]}</span><small>${c[1]}</small></button>`).join('')||'<div style="padding:16px;color:var(--mut)">No match</div>'}
function openPal(){pal.classList.add('open');palIn.value='';shown=CMDS;sel=0;render();setTimeout(()=>palIn.focus(),10);beep(500,.05)}
function closePal(){pal.classList.remove('open')}
palIn.addEventListener('input',()=>{const q=palIn.value.toLowerCase();shown=CMDS.filter(c=>c[0].toLowerCase().includes(q)||c[1].includes(q));sel=0;render()});
palList.addEventListener('click',e=>{const b=e.target.closest('button');if(b)shown[+b.dataset.i][2]()});
pal.addEventListener('click',e=>{if(e.target===pal)closePal()});
$('#palBtn').addEventListener('click',openPal);
addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.classList.contains('open')?closePal():openPal();return}
  if(pal.classList.contains('open')){
    if(e.key==='Escape')closePal();
    else if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(shown.length-1,sel+1);render()}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);render()}
    else if(e.key==='Enter'&&shown[sel]){shown[sel][2]()}
    return;
  }
  kc.push(e.key);kc=kc.slice(-10);if(kc.join('')===KON){storm();toast('Ember storm unlocked')}
});
})();
