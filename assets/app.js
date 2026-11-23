let sources=[];
let selectedId=null;
const $=id=>document.getElementById(id);
const num=(value,places=2)=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value).toFixed(places):'—';
function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(!lines.length||!lines[0])return[];
  const split=line=>{const out=[];let v='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&q){v+='"';i++;}else if(c==='"')q=!q;else if(c===','&&!q){out.push(v);v='';}else v+=c;}out.push(v);return out;};
  const headers=split(lines[0]).map(h=>h.trim());return lines.slice(1).filter(Boolean).map(line=>Object.fromEntries(split(line).map((v,i)=>[headers[i],v.trim()])));
}
const facilityField={HIRES:'HIRES observability',APF:'APF observability',ESPRESSO:'ESPRESSO observability',SOAR:'SOAR observability',HJST:"McDonald's HJST observability",SALT:'SALT observability'};
const isPotential=v=>{const x=String(v||'').toLowerCase();return x.startsWith('available ')||x==='potentially observable';};
function statusHTML(v){const x=String(v||'Not assessed');if(x.startsWith('Available ')){const dates=x.slice('Available '.length);return `<span class="check" title="Potential nighttime visibility during astronomical darkness (Sun below −18°, target altitude at least 30°): ${x}" aria-label="${x}">${dates}</span>`;}if(x==='Outside declination range')return `<span class="dash" title="${x}" aria-label="${x}">Dec limit</span>`;if(x==='Out of season')return `<span class="dash" title="${x}" aria-label="${x}">Out of season</span>`;return `<span class="dash" title="${x}">${x}</span>`;}
function renderTable(){
  const q=$('query').value.trim().toLowerCase(),minRaw=$('teff-min').value,maxRaw=$('teff-max').value,obs=$('obs-filter').value;
  const min=Number(minRaw),max=Number(maxRaw);
  const rows=sources.filter(s=>{
    if(q&&!`${s['Gaia ID']} ${s['Spectral type estimate']}`.toLowerCase().includes(q))return false;
    const teff=s['Teff GSP-Phot (K)']===''?NaN:Number(s['Teff GSP-Phot (K)']);
    if(minRaw!==''&&(!Number.isFinite(teff)||teff<min))return false;
    if(maxRaw!==''&&(!Number.isFinite(teff)||teff>max))return false;
    if(obs&&!isPotential(s[facilityField[obs]]))return false;
    return true;
  });
  $('catalog-body').innerHTML=rows.map(s=>`<tr data-id="${s['Gaia ID']}" class="${s['Gaia ID']===selectedId?'selected':''}"><td class="source-cell"><a class="source-link" href="https://gea.esac.esa.int/archive/" target="_blank" rel="noreferrer">${s['Gaia ID']}</a></td><td>${num(s['RA (deg)'],5)}</td><td>${num(s['Dec (deg)'],5)}</td><td class="rv-cell">${s['Gaia RV (km/s)']===''?'—':`${num(s['Gaia RV (km/s)'],3)} ± ${num(s['Gaia RV error (km/s)'],3)}`}</td><td>${s['Spectral type estimate']}</td><td>${s['Spectral type basis'].startsWith('GSP')?'GSP-Phot Teff':'BP−RP color'}</td><td>${num(s['Teff GSP-Phot (K)'],0)}</td><td>${num(s['logg GSP-Phot'],2)}</td><td>${num(s['[M/H] GSP-Phot'],2)}</td><td>${num(s['G magnitude (mag)'],3)}</td><td>${num(s['BP-RP observed (mag)'],3)}</td><td>${statusHTML(s['HIRES observability'])}</td><td>${statusHTML(s['APF observability'])}</td><td>${statusHTML(s['ESPRESSO observability'])}</td><td>${statusHTML(s['SOAR observability'])}</td><td>${statusHTML(s["McDonald's HJST observability"])}</td><td>${statusHTML(s['SALT observability'])}</td></tr>`).join('');
  $('source-count').textContent=String(sources.length).padStart(2,'0');$('type-count').textContent=String(sources.filter(s=>s['Spectral type estimate']&&s['Spectral type estimate']!=='Not estimated').length);$('teff-count').textContent=String(sources.filter(s=>s['Teff GSP-Phot (K)']!=='').length);
  $('result-count').textContent=`${rows.length} SOURCE${rows.length===1?'':'S'}`;$('empty-state').hidden=rows.length>0;renderCMD();
}
function renderVisibility(){
  $('visibility-body').innerHTML=sources.map(s=>`<tr><td class="source-cell">${s['Gaia ID']}</td><td class="dec-cell">${num(s['Dec (deg)'],2)}°</td><td>${statusHTML(s['HIRES observability'])}</td><td>${statusHTML(s['APF observability'])}</td><td>${statusHTML(s['ESPRESSO observability'])}</td><td>${statusHTML(s['SOAR observability'])}</td><td>${statusHTML(s["McDonald's HJST observability"])}</td><td>${statusHTML(s['SALT observability'])}</td></tr>`).join('');
}
function setupCanvas(canvas){const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w:r.width,h:r.height};}
function renderCMD(){
 const canvas=$('cmd-canvas');if(!canvas)return;
 const {ctx,w,h}=setupCanvas(canvas),pad={l:88,r:24,t:44,b:72};
 const xMin=-0.6,xMax=2.5,yMin=-2.0,yMax=17.5,plotW=w-pad.l-pad.r,plotH=h-pad.t-pad.b;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfcff';ctx.fillRect(pad.l,pad.t,plotW,plotH);
 const xPos=v=>pad.l+(v-xMin)/(xMax-xMin)*plotW;
 const yPos=v=>pad.t+(v-yMin)/(yMax-yMin)*plotH;
 const bands=[
  {name:'O',from:-0.6,to:-0.35,fill:'#d5ddfb'},
  {name:'B',from:-0.35,to:-0.1,fill:'#d9e1fc'},
  {name:'A',from:-0.1,to:0.15,fill:'#e3e9fd'},
  {name:'F',from:0.15,to:0.45,fill:'#eef1fc'},
  {name:'G',from:0.45,to:1.0,fill:'#f5f5fb'},
  {name:'K',from:1.0,to:1.5,fill:'#f9eee8'},
  {name:'M',from:1.5,to:2.5,fill:'#ffeadb'}
 ];
 for(const band of bands){const left=xPos(band.from),right=xPos(band.to);ctx.fillStyle=band.fill;ctx.fillRect(left,pad.t,right-left,plotH);ctx.fillStyle='#24374a';ctx.font='600 15px Arial, sans-serif';ctx.textAlign='center';ctx.fillText(band.name,(left+right)/2,pad.t-17);}
 const xTicks=[-0.6,-0.1,0.4,1.0,1.5,2.0,2.5],yTicks=[-2.0,1.3,4.5,7.8,11.0,14.3,17.5];
 ctx.lineWidth=1;ctx.strokeStyle='#d7deea';ctx.fillStyle='#304459';ctx.font='13px Arial, sans-serif';
 for(const v of xTicks){const x=xPos(v);ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+plotH);ctx.stroke();ctx.textAlign='center';ctx.fillText(v.toFixed(1),x,pad.t+plotH+23);}
 for(const v of yTicks){const y=yPos(v);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+plotW,y);ctx.stroke();ctx.textAlign='right';ctx.fillText(v.toFixed(1),pad.l-13,y+4);}
 ctx.strokeStyle='#9aa8b8';ctx.lineWidth=1.2;ctx.strokeRect(pad.l,pad.t,plotW,plotH);
 ctx.fillStyle='#24374a';ctx.font='15px Arial, sans-serif';ctx.textAlign='center';ctx.fillText('BP − RP − E(BP−RP) [mag]',pad.l+plotW/2,h-13);
 ctx.save();ctx.translate(23,pad.t+plotH/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('M_G,0 [mag]  ·  extinction-corrected absolute G',0,0);ctx.restore();
 const pts=sources.filter(s=>s['BP-RP observed (mag)']!==''&&s['BP-RP intrinsic estimate (mag)']!==''&&s['M_G dereddened estimate (mag)']!==''&&Number.isFinite(Number(s['BP-RP observed (mag)']))&&Number.isFinite(Number(s['BP-RP intrinsic estimate (mag)']))&&Number.isFinite(Number(s['M_G dereddened estimate (mag)']))).map(s=>({...s,xval:Number(s['BP-RP observed (mag)']),xIntrinsic:Number(s['BP-RP intrinsic estimate (mag)']),yval:Number(s['M_G dereddened estimate (mag)'])}));
 $('cmd-empty').style.display=pts.length?'none':'flex';
 canvas._points=pts.map(p=>({...p,x:xPos(p.xval),y:yPos(p.yval)}));
 for(const p of canvas._points){
  const size=p['Gaia ID']===selectedId?14:12;
  ctx.fillStyle=p['Gaia ID']===selectedId?'#9ab8c8':'#91b2c3';ctx.strokeStyle='#516b7b';ctx.lineWidth=1;
  ctx.fillRect(p.x-size/2,p.y-size/2,size,size);ctx.strokeRect(p.x-size/2,p.y-size/2,size,size);
  ctx.strokeStyle='#213642';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x-3.5,p.y-3.5);ctx.lineTo(p.x+3.5,p.y+3.5);ctx.moveTo(p.x+3.5,p.y-3.5);ctx.lineTo(p.x-3.5,p.y+3.5);ctx.stroke();
  if(p['Gaia ID']===selectedId){ctx.beginPath();ctx.arc(p.x,p.y,11,0,Math.PI*2);ctx.strokeStyle='#2b554c';ctx.lineWidth=1.4;ctx.stroke();}
 }
}
function activateView(name,writeHistory=false){
  const view=['catalog','cmd','visibility'].includes(name)?name:'catalog';
  document.querySelectorAll('[data-view]').forEach(tab=>{const active=tab.dataset.view===view;tab.classList.toggle('nav-active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  document.querySelectorAll('.tab-panel').forEach(panel=>{panel.hidden=panel.id!==`view-${view}`;});
  if(writeHistory&&location.hash!==`#${view}`)history.pushState(null,'',`#${view}`);
  if(view==='cmd')requestAnimationFrame(renderCMD);
}
function viewFromLocation(){const hash=location.hash.slice(1);activateView(hash==='cmd'?'cmd':hash==='visibility'?'visibility':'catalog');}
document.querySelectorAll('[data-view]').forEach(tab=>{
  tab.addEventListener('click',e=>{e.preventDefault();activateView(tab.dataset.view,true);window.scrollTo({top:0,behavior:'smooth'});});
  tab.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-view]')],index=tabs.indexOf(tab);let next=null;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;if(next!==null){e.preventDefault();tabs[next].focus();tabs[next].click();}});
});
window.addEventListener('popstate',viewFromLocation);window.addEventListener('hashchange',viewFromLocation);viewFromLocation();
function loadCatalog(){fetch('data/catalog.csv').then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.text();}).then(t=>{sources=parseCSV(t);renderTable();renderVisibility();}).catch(()=>{$('result-count').textContent='CATALOG UNAVAILABLE';$('empty-state').hidden=false;});}
for(const id of ['query','teff-min','teff-max','obs-filter'])$(id).addEventListener('input',renderTable);$('obs-filter').addEventListener('change',renderTable);
$('reset-filters').addEventListener('click',()=>{$('query').value='';$('teff-min').value='';$('teff-max').value='';$('obs-filter').value='';renderTable();});
$('catalog-body').addEventListener('click',e=>{const row=e.target.closest('tr[data-id]');if(!row||e.target.closest('a'))return;selectedId=row.dataset.id;renderTable();});
$('cmd-canvas').addEventListener('mousemove',e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),p=(c._points||[]).find(z=>Math.hypot(z.x-(e.clientX-r.left),z.y-(e.clientY-r.top))<10),tip=$('tooltip');if(!p){tip.classList.remove('visible');return;}tip.innerHTML=`<strong>${p['Gaia ID']}</strong><br>${p['Spectral type estimate']} · observed BP−RP ${num(p.xval,3)} mag · corrected BP−RP ${num(p.xIntrinsic,3)} mag · M<sub>G,0</sub> ${num(p.yval,2)} mag`;tip.style.left=`${e.clientX+13}px`;tip.style.top=`${e.clientY+13}px`;tip.classList.add('visible');});
$('cmd-canvas').addEventListener('mouseleave',()=>$('tooltip').classList.remove('visible'));window.addEventListener('resize',renderCMD);loadCatalog();
