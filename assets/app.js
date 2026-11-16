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
const isPotential=v=>String(v||'').toLowerCase()==='potentially observable';
function statusHTML(v){const x=String(v||'Not assessed');return isPotential(x)?`<span class="check" title="${x}">Potential</span>`:`<span class="dash" title="${x}">Outside range</span>`;}
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
  $('catalog-body').innerHTML=rows.map(s=>`<tr data-id="${s['Gaia ID']}" class="${s['Gaia ID']===selectedId?'selected':''}"><td class="source-cell"><a class="source-link" href="https://gea.esac.esa.int/archive/" target="_blank" rel="noreferrer">${s['Gaia ID']}</a></td><td>${num(s['RA (deg)'],5)}</td><td>${num(s['Dec (deg)'],5)}</td><td>${s['Spectral type estimate']}</td><td>${s['Spectral type basis'].startsWith('GSP')?'GSP-Phot Teff':'BP−RP color'}</td><td>${num(s['Teff GSP-Phot (K)'],0)}</td><td>${num(s['logg GSP-Phot'],2)}</td><td>${num(s['[M/H] GSP-Phot'],2)}</td><td>${num(s['G magnitude (mag)'],3)}</td><td>${num(s['BP-RP observed (mag)'],3)}</td><td>${statusHTML(s['HIRES observability'])}</td><td>${statusHTML(s['APF observability'])}</td><td>${statusHTML(s['ESPRESSO observability'])}</td><td>${statusHTML(s['SOAR observability'])}</td><td>${statusHTML(s["McDonald's HJST observability"])}</td><td>${statusHTML(s['SALT observability'])}</td></tr>`).join('');
  $('source-count').textContent=String(sources.length).padStart(2,'0');$('type-count').textContent=String(sources.filter(s=>s['Spectral type estimate']&&s['Spectral type estimate']!=='Not estimated').length);$('teff-count').textContent=String(sources.filter(s=>s['Teff GSP-Phot (K)']!=='').length);
  $('result-count').textContent=`${rows.length} SOURCE${rows.length===1?'':'S'}`;$('empty-state').hidden=rows.length>0;renderCMD();
}
function renderVisibility(){
  $('visibility-body').innerHTML=sources.map(s=>`<tr><td class="source-cell">${s['Gaia ID']}</td><td class="dec-cell">${num(s['Dec (deg)'],2)}°</td><td>${statusHTML(s['HIRES observability'])}</td><td>${statusHTML(s['APF observability'])}</td><td>${statusHTML(s['ESPRESSO observability'])}</td><td>${statusHTML(s['SOAR observability'])}</td><td>${statusHTML(s["McDonald's HJST observability"])}</td><td>${statusHTML(s['SALT observability'])}</td></tr>`).join('');
}
function setupCanvas(canvas){const r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w:r.width,h:r.height};}
function renderCMD(){
 const canvas=$('cmd-canvas');if(!canvas)return;const{ctx,w,h}=setupCanvas(canvas),pad={l:54,r:20,t:18,b:38};ctx.clearRect(0,0,w,h);ctx.font='9px "DM Mono", monospace';ctx.lineWidth=1;
 const pts=sources.filter(s=>s['BP-RP intrinsic estimate (mag)']!==''&&s['M_G dereddened estimate (mag)']!==''&&Number.isFinite(Number(s['BP-RP intrinsic estimate (mag)']))&&Number.isFinite(Number(s['M_G dereddened estimate (mag)']))).map(s=>({...s,xval:Number(s['BP-RP intrinsic estimate (mag)']),yval:Number(s['M_G dereddened estimate (mag)'])}));
 const iw=w-pad.l-pad.r,ih=h-pad.t-pad.b,xmin=pts.length?Math.min(...pts.map(p=>p.xval)):0,xmax=pts.length?Math.max(...pts.map(p=>p.xval)):1,ymin=pts.length?Math.min(...pts.map(p=>p.yval)):0,ymax=pts.length?Math.max(...pts.map(p=>p.yval)):1;
 ctx.strokeStyle='#2a3946';ctx.fillStyle='#7c8c98';for(let i=0;i<=4;i++){const x=pad.l+iw*i/4,y=pad.t+ih*i/4;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+ih);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+iw,y);ctx.stroke();if(pts.length){ctx.fillText((xmin+(xmax-xmin)*i/4).toFixed(1),x-9,h-15);ctx.fillText((ymin+(ymax-ymin)*i/4).toFixed(1),6,y+3);}}
 ctx.fillStyle='#71818c';ctx.font='8px "DM Mono", monospace';ctx.save();ctx.translate(13,h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('DEREDDENED ABSOLUTE MAGNITUDE  M₍G₎',0,0);ctx.restore();ctx.textAlign='center';ctx.fillText('INTRINSIC BP − RP  [mag]',pad.l+iw/2,h-2);ctx.textAlign='start';$('cmd-empty').style.display=pts.length?'none':'flex';if(!pts.length)return;
 const xs=xmax-xmin||1,ys=ymax-ymin||1;canvas._points=pts.map(p=>({...p,x:pad.l+(p.xval-xmin)/xs*iw,y:pad.t+(p.yval-ymin)/ys*ih}));for(const p of canvas._points){ctx.beginPath();ctx.arc(p.x,p.y,p['Gaia ID']===selectedId?6:4,0,2*Math.PI);ctx.fillStyle=p['Gaia ID']===selectedId?'#d3ed8a':'#83d1b5';ctx.fill();if(p['Gaia ID']===selectedId){ctx.beginPath();ctx.arc(p.x,p.y,9,0,2*Math.PI);ctx.strokeStyle='#d3ed8a';ctx.stroke();}}
}
function loadCatalog(){fetch('data/catalog.csv').then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.text();}).then(t=>{sources=parseCSV(t);renderTable();renderVisibility();}).catch(()=>{$('result-count').textContent='CATALOG UNAVAILABLE';$('empty-state').hidden=false;});}
for(const id of ['query','teff-min','teff-max','obs-filter'])$(id).addEventListener('input',renderTable);$('obs-filter').addEventListener('change',renderTable);
$('reset-filters').addEventListener('click',()=>{$('query').value='';$('teff-min').value='';$('teff-max').value='';$('obs-filter').value='';renderTable();});
$('catalog-body').addEventListener('click',e=>{const row=e.target.closest('tr[data-id]');if(!row||e.target.closest('a'))return;selectedId=row.dataset.id;renderTable();});
$('cmd-canvas').addEventListener('mousemove',e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),p=(c._points||[]).find(z=>Math.hypot(z.x-(e.clientX-r.left),z.y-(e.clientY-r.top))<10),tip=$('tooltip');if(!p){tip.classList.remove('visible');return;}tip.innerHTML=`<strong>${p['Gaia ID']}</strong><br>${p['Spectral type estimate']} · BP−RP₀ ${num(p.xval,3)} mag · M<sub>G</sub> ${num(p.yval,2)} mag`;tip.style.left=`${e.clientX+13}px`;tip.style.top=`${e.clientY+13}px`;tip.classList.add('visible');});
$('cmd-canvas').addEventListener('mouseleave',()=>$('tooltip').classList.remove('visible'));window.addEventListener('resize',renderCMD);loadCatalog();
