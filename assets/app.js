const sources = [
  {source_id:'4388128680001229440',ra:257.06,dec:2.87,parallax:3.345,distance:298.9536622,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'77413727493690112',ra:31.59246512,dec:14.1022739,parallax:15.0414,distance:66.48317311,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'3208256526192267904',ra:78.62794961,dec:-7.062682521,parallax:2.3203,distance:430.9787527,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'2490351540074716672',ra:36.57582433,dec:-3.494972141,parallax:4.8749,distance:205.132413,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'3007091223101699328',ra:95.72155676,dec:-7.167212226,parallax:7.1667,distance:139.5342347,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'4565020034823300992',ra:254.6345545,dec:21.40276471,parallax:3.0219,distance:330.9176346,teff:null,bp_rp:null,gmag:null,rv:false},
  {source_id:'1258006130136446336',ra:208.2307898,dec:24.6857913,parallax:7.5698,distance:132.1038865,teff:null,bp_rp:null,gmag:null,rv:false}
];
const saltVisible = new Set(['4388128680001229440','3208256526192267904','2490351540074716672','3007091223101699328']);
let selectedId = null;
let rvRows = [];
const $ = id => document.getElementById(id);
const num = (value, places=2) => Number.isFinite(Number(value)) ? Number(value).toFixed(places) : '—';
const displayTemp = value => Number.isFinite(Number(value)) ? Math.round(value).toLocaleString() : null;

function renderTable(){
  const q=$('query').value.trim().toLowerCase(), min=Number($('teff-min').value), max=Number($('teff-max').value), obs=$('obs-filter').value;
  const hasMin=$('teff-min').value!=='',hasMax=$('teff-max').value!=='';
  const rows=sources.filter(s=>{
    if(q&&!s.source_id.toLowerCase().includes(q))return false;
    if(hasMin&&(!Number.isFinite(s.teff)||s.teff<min))return false;
    if(hasMax&&(!Number.isFinite(s.teff)||s.teff>max))return false;
    if(obs&&!(obs==='SALT'?saltVisible.has(s.source_id):true))return false;
    return true;
  });
  $('catalog-body').innerHTML=rows.map(s=>`<tr data-id="${s.source_id}" class="${s.source_id===selectedId?'selected':''}">
    <td class="source-cell"><a class="source-link" href="https://gea.esac.esa.int/archive/" target="_blank" rel="noreferrer" title="Open Gaia Archive">${s.source_id}</a></td>
    <td>${num(s.ra,4)}</td><td>${num(s.dec,4)}</td><td>${num(s.parallax,3)}</td><td>${num(s.distance,1)}</td>
    <td>${displayTemp(s.teff)??'<span class="missing">not loaded</span>'}</td><td>${Number.isFinite(s.bp_rp)?num(s.bp_rp,3):'<span class="missing">not loaded</span>'}</td>
    <td><span class="rv-badge none">No epochs</span></td></tr>`).join('');
  $('source-count').textContent=String(sources.length).padStart(2,'0');
  $('result-count').textContent=`${rows.length} SOURCE${rows.length===1?'':'S'}`;
  $('empty-state').hidden=rows.length>0;
  const coverage=sources.filter(s=>Number.isFinite(s.teff)&&Number.isFinite(s.bp_rp)&&Number.isFinite(s.gmag)).length;
  $('coverage-count').textContent=`${coverage}/${sources.length}`;
  renderCMD();
}

function renderVisibility(){
  $('visibility-body').innerHTML=sources.map(s=>`<tr><td class="source-cell">${s.source_id}</td><td>${saltVisible.has(s.source_id)?'<span class="check">✓</span>':'<span class="dash">—</span>'}</td><td><span class="check">✓</span></td><td><span class="check">✓</span></td><td><span class="check">✓</span></td><td class="dec-cell">${s.dec>0?'+':''}${num(s.dec,2)}°</td></tr>`).join('');
}

function setupCanvas(canvas){
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w:rect.width,h:rect.height};
}
function renderCMD(){
  const canvas=$('cmd-canvas');if(!canvas)return;
  const {ctx,w,h}=setupCanvas(canvas), pad={l:48,r:20,t:18,b:38};
  ctx.clearRect(0,0,w,h);ctx.font='9px "DM Mono", monospace';ctx.lineWidth=1;
  const pts=sources.filter(s=>Number.isFinite(s.bp_rp)&&Number.isFinite(s.gmag)&&Number.isFinite(s.distance)&&s.distance>0).map(s=>({...s,mg:s.gmag-5*Math.log10(s.distance)+5}));
  const innerW=w-pad.l-pad.r,innerH=h-pad.t-pad.b;
  ctx.strokeStyle='#2a3946';ctx.fillStyle='#7c8c98';
  for(let i=0;i<=4;i++){
    const x=pad.l+innerW*i/4, y=pad.t+innerH*i/4;
    ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+innerH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+innerW,y);ctx.stroke();
    if(pts.length){const xmin=Math.min(...pts.map(p=>p.bp_rp)),xmax=Math.max(...pts.map(p=>p.bp_rp)),ymin=Math.min(...pts.map(p=>p.mg)),ymax=Math.max(...pts.map(p=>p.mg));ctx.fillText((xmin+(xmax-xmin)*i/4).toFixed(1),x-9,h-15);ctx.fillText((ymax-(ymax-ymin)*i/4).toFixed(1),4,y+3);}
  }
  ctx.fillStyle='#71818c';ctx.font='8px "DM Mono", monospace';ctx.save();ctx.translate(12,h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('ABSOLUTE MAGNITUDE  M₍G₎',0,0);ctx.restore();
  ctx.textAlign='center';ctx.fillText('BP − RP  [mag]',pad.l+innerW/2,h-2);ctx.textAlign='start';
  $('cmd-empty').style.display=pts.length?'none':'flex';
  if(!pts.length)return;
  const xmin=Math.min(...pts.map(p=>p.bp_rp)),xmax=Math.max(...pts.map(p=>p.bp_rp)),ymin=Math.min(...pts.map(p=>p.mg)),ymax=Math.max(...pts.map(p=>p.mg));
  const xspan=xmax-xmin||1,yspan=ymax-ymin||1;
  canvas._points=pts.map(p=>({...p,x:pad.l+(p.bp_rp-xmin)/xspan*innerW,y:pad.t+(ymax-p.mg)/yspan*innerH}));
  for(const p of canvas._points){ctx.beginPath();ctx.arc(p.x,p.y,p.source_id===selectedId?6:4,0,Math.PI*2);ctx.fillStyle=p.source_id===selectedId?'#d3ed8a':'#83d1b5';ctx.fill();if(p.source_id===selectedId){ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.strokeStyle='#d3ed8a';ctx.stroke();}}
}

function renderRV(){
  const canvas=$('rv-canvas'),{ctx,w,h}=setupCanvas(canvas),pad={l:55,r:18,t:18,b:38};ctx.clearRect(0,0,w,h);
  const data=rvRows.filter(r=>Number.isFinite(r.time_since_ref_d)&&Number.isFinite(r.rv_kms));if(!data.length)return;
  const xmin=Math.min(...data.map(d=>d.time_since_ref_d)),xmax=Math.max(...data.map(d=>d.time_since_ref_d));
  const ymin=Math.min(...data.map(d=>d.rv_kms-(Number(d.rv_error_kms)||0))),ymax=Math.max(...data.map(d=>d.rv_kms+(Number(d.rv_error_kms)||0)));
  const xspan=xmax-xmin||1,yspan=ymax-ymin||1,iw=w-pad.l-pad.r,ih=h-pad.t-pad.b;
  ctx.font='9px "DM Mono", monospace';ctx.lineWidth=1;ctx.strokeStyle='#2a3946';ctx.fillStyle='#7c8c98';
  for(let i=0;i<=4;i++){const x=pad.l+iw*i/4,y=pad.t+ih*i/4;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+ih);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+iw,y);ctx.stroke();ctx.fillText(String(Math.round(xmin+xspan*i/4)),x-12,h-14);ctx.fillText((ymax-yspan*i/4).toFixed(1),7,y+3);}
  ctx.fillStyle='#71818c';ctx.save();ctx.translate(13,h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('RADIAL VELOCITY  [km/s]',0,0);ctx.restore();ctx.textAlign='center';ctx.fillText('TIME SINCE REFERENCE EPOCH  [days]',pad.l+iw/2,h-2);ctx.textAlign='start';
  for(const d of data){const x=pad.l+(d.time_since_ref_d-xmin)/xspan*iw,y=pad.t+(ymax-d.rv_kms)/yspan*ih,err=(Number(d.rv_error_kms)||0)/yspan*ih;ctx.strokeStyle='rgba(131,209,181,.55)';ctx.beginPath();ctx.moveTo(x,y-err);ctx.lineTo(x,y+err);ctx.moveTo(x-3,y-err);ctx.lineTo(x+3,y-err);ctx.moveTo(x-3,y+err);ctx.lineTo(x+3,y+err);ctx.stroke();ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#83d1b5';ctx.fill();}
  $('rv-span').textContent=`${data.length} EPOCHS · ${(xmax-xmin).toFixed(1)} DAY SPAN · RV ERROR 0.8–1.2 km/s`;
}

function parseCSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);if(!lines.length)return[];
  const split=line=>{const out=[];let v='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&q){v+='"';i++;}else if(c==='"')q=!q;else if(c===','&&!q){out.push(v);v='';}else v+=c;}out.push(v);return out;};
  const headers=split(lines[0]).map(h=>h.trim().toLowerCase().replace(/[\s-]+/g,'_'));
  return lines.slice(1).filter(Boolean).map(line=>Object.fromEntries(split(line).map((v,i)=>[headers[i],v.trim()])));
}
function first(row,names){for(const n of names){const v=row[n];if(v!==undefined&&v!=='')return v;}return null;}
function importCatalog(file){
  const reader=new FileReader();reader.onload=()=>{
    const rows=parseCSV(String(reader.result));let merged=0;
    for(const row of rows){
      const id=String(first(row,['source_id','gaia_dr3_source_id','sourceid','gaia_source_id'])||'');if(!id)continue;
      let s=sources.find(x=>x.source_id===id);
      if(!s){s={source_id:id,ra:null,dec:null,parallax:null,distance:null,teff:null,bp_rp:null,gmag:null,rv:false};sources.push(s);}
      const set=(key,names)=>{const v=first(row,names);if(v!==null){const x=Number(v);if(Number.isFinite(x))s[key]=x;}};
      set('ra',['ra','ra_icrs']);set('dec',['dec','de_icrs']);set('parallax',['parallax','parallax_mas']);set('distance',['distance','distance_pc']);
      set('teff',['teff_gspphot','teff','effective_temperature','teff_k']);set('bp_rp',['bp_rp','bp_minus_rp','color']);set('gmag',['phot_g_mean_mag','g_mag','gmag','g']);merged++;
    }
    renderTable();renderVisibility();
    $('cmd-empty').querySelector('strong').textContent=merged?'Catalog loaded':'No source_id column found';
    $('cmd-empty').querySelector('span').textContent=merged?`${merged} rows merged. Fields without photometry remain unplotted.`:'Use source_id or gaia_dr3_source_id as the identifier column.';
    setTimeout(()=>renderCMD(),900);
  };
  reader.readAsText(file);
}

for(const id of ['query','teff-min','teff-max','obs-filter'])$(id).addEventListener('input',renderTable);
$('obs-filter').addEventListener('change',renderTable);
$('reset-filters').addEventListener('click',()=>{for(const id of ['query','teff-min','teff-max'])$(id).value='';$('obs-filter').value='';renderTable();});
$('catalog-upload').addEventListener('change',e=>{if(e.target.files[0])importCatalog(e.target.files[0]);e.target.value='';});
$('catalog-body').addEventListener('click',e=>{const row=e.target.closest('tr[data-id]');if(!row||e.target.closest('a'))return;selectedId=row.dataset.id;renderTable();});
$('cmd-canvas').addEventListener('mousemove',e=>{const canvas=e.currentTarget,rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;const p=(canvas._points||[]).find(pt=>Math.hypot(pt.x-x,pt.y-y)<10),tip=$('tooltip');if(!p){tip.classList.remove('visible');return;}tip.innerHTML=`<strong>${p.source_id}</strong><br>BP − RP ${num(p.bp_rp,3)} mag · M<sub>G</sub> ${num(p.mg,2)} mag`;tip.style.left=`${e.clientX+13}px`;tip.style.top=`${e.clientY+13}px`;tip.classList.add('visible');});
$('cmd-canvas').addEventListener('mouseleave',()=>$('tooltip').classList.remove('visible'));
window.addEventListener('resize',()=>{renderCMD();renderRV();});
renderTable();renderVisibility();
fetch('data/target_3_rv_gaialike.csv').then(r=>r.text()).then(t=>{rvRows=parseCSV(t);renderRV();}).catch(()=>{ $('rv-span').textContent='Synthetic RV CSV unavailable in this preview'; });
