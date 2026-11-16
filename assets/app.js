let sources=[];
let selectedId=null;
const $=id=>document.getElementById(id);
const num=(value,places=2)=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value).toFixed(places):'—';
function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(!lines.length||!lines[0])return[];
  const split=line=>{const out=[];let v='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&q){v+='"';i++;}else if(c==='"')q=!q;else if(c===','&&!q){out.push(v);v='';}else v+=c;}out.push(v);return out;};
  const headers=split(lines[0]).map(h=>h.trim());
  return lines.slice(1).filter(Boolean).map(line=>Object.fromEntries(split(line).map((v,i)=>[headers[i],v.trim()])));
}
function field(row,name){return row[name]??'';}
function favorable(value){return String(value||'').toLowerCase()==='favorable'||String(value||'').toLowerCase()==='yes';}
function statusHTML(value){
  const v=String(value||'Not assessed');
  if(favorable(v))return `<span class="check">✓</span>`;
  if(v.toLowerCase()==='not favorable')return `<span class="dash">—</span>`;
  return `<span class="missing">${v}</span>`;
}
function renderTable(){
  const q=$('query').value.trim().toLowerCase(),obs=$('obs-filter').value;
  const rows=sources.filter(s=>{
    if(q&&!s['Gaia ID'].toLowerCase().includes(q))return false;
    if(obs){const value=obs==='McDonald'?s['McDonald (source flag)']:s[`${obs} (Dec 2026-Feb 2027)`];if(!favorable(value))return false;}
    return true;
  });
  $('catalog-body').innerHTML=rows.map(s=>`<tr data-id="${s['Gaia ID']}" class="${s['Gaia ID']===selectedId?'selected':''}"><td class="source-cell"><a class="source-link" href="https://gea.esac.esa.int/archive/" target="_blank" rel="noreferrer" title="Open Gaia Archive">${s['Gaia ID']}</a></td><td>${num(s['RA (deg)'],5)}</td><td>${num(s['Dec (deg)'],5)}</td><td>${s['Spectral type']||'<span class="missing">not provided</span>'}</td><td>${num(s['G magnitude (mag)'],3)}</td><td>${num(s['BP-RP (mag)'],3)}</td><td>${statusHTML(s['SALT (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['Keck (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['APF (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['SOAR (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['McDonald (source flag)'])}</td><td>${s['Goodman exposure list']==='Listed'?'<span class="check">Listed</span>':'<span class="missing">—</span>'}</td></tr>`).join('');
  $('source-count').textContent=String(sources.length).padStart(2,'0');
  $('result-count').textContent=`${rows.length} SOURCE${rows.length===1?'':'S'}`;
  $('empty-state').hidden=rows.length>0;
  $('spectral-count').textContent=String(sources.filter(s=>s['Spectral type']&&s['Spectral type']!=='Not provided').length);
  $('photometry-count').textContent=String(sources.filter(s=>Number.isFinite(Number(s['G magnitude (mag)']))&&Number.isFinite(Number(s['BP-RP (mag)']))).length);
  renderCMD();
}
function renderVisibility(){
  const rows=sources.filter(s=>['SALT','Keck','APF','SOAR'].some(k=>s[`${k} (Dec 2026-Feb 2027)`]!=='Not assessed')||s['McDonald (source flag)']!=='Not provided');
  $('visibility-body').innerHTML=rows.map(s=>`<tr><td class="source-cell">${s['Gaia ID']}</td><td>${statusHTML(s['SALT (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['Keck (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['APF (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['SOAR (Dec 2026-Feb 2027)'])}</td><td>${statusHTML(s['McDonald (source flag)'])}</td></tr>`).join('');
}
function setupCanvas(canvas){const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w:rect.width,h:rect.height};}
function renderCMD(){
  const canvas=$('cmd-canvas');if(!canvas)return;const{ctx,w,h}=setupCanvas(canvas),pad={l:48,r:20,t:18,b:38};ctx.clearRect(0,0,w,h);ctx.font='9px "DM Mono", monospace';ctx.lineWidth=1;
  const pts=sources.filter(s=>Number.isFinite(Number(s['BP-RP (mag)']))&&Number.isFinite(Number(s['G magnitude (mag)']))).map(s=>({...s,xval:Number(s['BP-RP (mag)']),yval:Number(s['G magnitude (mag)'])}));
  const innerW=w-pad.l-pad.r,innerH=h-pad.t-pad.b;ctx.strokeStyle='#2a3946';ctx.fillStyle='#7c8c98';
  const xmin=pts.length?Math.min(...pts.map(p=>p.xval)):0,xmax=pts.length?Math.max(...pts.map(p=>p.xval)):1,ymin=pts.length?Math.min(...pts.map(p=>p.yval)):0,ymax=pts.length?Math.max(...pts.map(p=>p.yval)):1;
  for(let i=0;i<=4;i++){const x=pad.l+innerW*i/4,y=pad.t+innerH*i/4;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+innerH);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+innerW,y);ctx.stroke();if(pts.length){ctx.fillText((xmin+(xmax-xmin)*i/4).toFixed(1),x-9,h-15);ctx.fillText((ymin+(ymax-ymin)*i/4).toFixed(1),4,y+3);}}
  ctx.fillStyle='#71818c';ctx.font='8px "DM Mono", monospace';ctx.save();ctx.translate(12,h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('APPARENT G MAGNITUDE  [mag]',0,0);ctx.restore();ctx.textAlign='center';ctx.fillText('BP − RP  [mag]',pad.l+innerW/2,h-2);ctx.textAlign='start';$('cmd-empty').style.display=pts.length?'none':'flex';if(!pts.length)return;
  const xspan=xmax-xmin||1,yspan=ymax-ymin||1;canvas._points=pts.map(p=>({...p,x:pad.l+(p.xval-xmin)/xspan*innerW,y:pad.t+(p.yval-ymin)/yspan*innerH}));
  for(const p of canvas._points){ctx.beginPath();ctx.arc(p.x,p.y,p['Gaia ID']===selectedId?6:4,0,Math.PI*2);ctx.fillStyle=p['Gaia ID']===selectedId?'#d3ed8a':'#83d1b5';ctx.fill();if(p['Gaia ID']===selectedId){ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.strokeStyle='#d3ed8a';ctx.stroke();}}
}
function loadCatalog(){fetch('data/catalog.csv').then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.text();}).then(t=>{sources=parseCSV(t);renderTable();renderVisibility();}).catch(()=>{$('result-count').textContent='CATALOG UNAVAILABLE';$('empty-state').hidden=false;});}
for(const id of ['query','obs-filter'])$(id).addEventListener('input',renderTable);
$('obs-filter').addEventListener('change',renderTable);
$('reset-filters').addEventListener('click',()=>{$('query').value='';$('obs-filter').value='';renderTable();});
$('catalog-body').addEventListener('click',e=>{const row=e.target.closest('tr[data-id]');if(!row||e.target.closest('a'))return;selectedId=row.dataset.id;renderTable();});
$('cmd-canvas').addEventListener('mousemove',e=>{const canvas=e.currentTarget,rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,p=(canvas._points||[]).find(pt=>Math.hypot(pt.x-x,pt.y-y)<10),tip=$('tooltip');if(!p){tip.classList.remove('visible');return;}tip.innerHTML=`<strong>${p['Gaia ID']}</strong><br>BP − RP ${num(p.xval,3)} mag · G ${num(p.yval,3)} mag`;tip.style.left=`${e.clientX+13}px`;tip.style.top=`${e.clientY+13}px`;tip.classList.add('visible');});
$('cmd-canvas').addEventListener('mouseleave',()=>$('tooltip').classList.remove('visible'));
window.addEventListener('resize',renderCMD);
loadCatalog();
