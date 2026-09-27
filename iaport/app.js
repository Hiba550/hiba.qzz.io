(async()=>{
  const D=window.IA_GUIDE_DATA;
  const UI=window.IA_UI_ASSETS||{layouts:{},instruments:{}};
  const CUSTOM=window.IA_ITEM_ASSETS||{};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const order=['biplane','airship','cargo_airship','bamboo_hopper','gyrodyne','quadrocopter','warship'];
  const roleMeta={inventory:['Storage','Cargo / general storage'],boiler:['Fuel / boiler','Fuel and engine boiler slot'],booster:['Booster','Firework booster slot'],weapon:['Weapon','Mounted weapon slot'],upgrade:['Upgrade','Aircraft upgrade slot'],banner:['Banner','Banner display slot'],dye:['Dye','Colour slot']};
  const vanillaBase='https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/';
  const vanillaCandidates={
    'minecraft:iron_ingot':['textures/items/iron_ingot.png'],'minecraft:bamboo':['textures/items/bamboo.png'],'minecraft:bamboo_block':['textures/items/bamboo_block.png','textures/blocks/bamboo_block.png','textures/blocks/bamboo_block_side.png'],'minecraft:blast_furnace':['textures/items/blast_furnace.png','textures/blocks/blast_furnace_front_off.png'],'minecraft:blaze_rod':['textures/items/blaze_rod.png'],'minecraft:brick':['textures/items/brick.png'],'minecraft:chest':['textures/items/chest.png','textures/blocks/chest_front.png'],'minecraft:clock':['textures/items/clock_item.png','textures/items/clock_00.png','textures/items/clock.png'],'minecraft:coal':['textures/items/coal.png'],'minecraft:cobblestone':['textures/items/cobblestone.png','textures/blocks/cobblestone.png'],'minecraft:comparator':['textures/items/comparator.png'],'minecraft:compass':['textures/items/compass_item.png','textures/items/compass_00.png','textures/items/compass.png'],'minecraft:copper_ingot':['textures/items/copper_ingot.png'],'minecraft:crossbow':['textures/items/crossbow_standby.png'],'minecraft:dispenser':['textures/items/dispenser.png','textures/blocks/dispenser_front_horizontal.png'],'minecraft:furnace':['textures/items/furnace.png','textures/blocks/furnace_front_off.png'],'minecraft:glass_pane':['textures/items/glass_pane.png','textures/blocks/glass.png'],'minecraft:gold_ingot':['textures/items/gold_ingot.png'],'minecraft:gold_nugget':['textures/items/gold_nugget.png'],'minecraft:lever':['textures/items/lever.png'],'minecraft:magma_cream':['textures/items/magma_cream.png'],'minecraft:nether_brick':['textures/items/netherbrick.png','textures/items/nether_brick.png'],'minecraft:netherite_ingot':['textures/items/netherite_ingot.png'],'minecraft:noteblock':['textures/items/noteblock.png','textures/blocks/noteblock.png'],'minecraft:piston':['textures/items/piston.png','textures/blocks/piston_top_normal.png'],'minecraft:redstone_lamp':['textures/items/redstone_lamp.png','textures/blocks/redstone_lamp_off.png'],'minecraft:slime_ball':['textures/items/slime_ball.png','textures/items/slimeball.png'],'minecraft:spyglass':['textures/items/spyglass.png'],'minecraft:string':['textures/items/string.png'],'minecraft:tnt':['textures/items/tnt.png','textures/blocks/tnt_side.png'],'minecraft:tripwire_hook':['textures/items/tripwire_hook.png'],'minecraft:white_carpet':['textures/items/carpet_white.png','textures/blocks/wool_colored_white.png'],'#minecraft:logs':['textures/items/log_oak.png','textures/blocks/log_oak.png']
  };

  window.IA_MODEL_DATA=window.IA_MODEL_DATA||{};
  async function unpackModel(name){
    if(window.IA_MODEL_DATA[name]) return window.IA_MODEL_DATA[name];
    const packed=window.IA_MODEL_PACKS?.[name];
    if(!packed) throw new Error('Missing model pack: '+name);
    if(!('DecompressionStream' in window)) throw new Error('This browser does not support the model decompressor.');
    const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const obj=JSON.parse(await new Response(stream).text());
    window.IA_MODEL_DATA[name]=obj;
    return obj;
  }
  try{await Promise.all(order.map(unpackModel));}
  catch(err){console.error(err);const n=$('.viewer-loading');if(n)n.textContent='Model data could not be loaded in this browser.';}

  const baseItem=id=>D.items[id]||{id,name:(id||'').split(':').pop().replaceAll('_',' '),category:'vanilla',tooltip:[],icon:null};
  const item=id=>{const m=baseItem(id);return {...m,icon:CUSTOM[id]||m.icon||null}};
  const candidates=id=>{
    const m=item(id); if(m.icon)return[m.icon];
    let arr=vanillaCandidates[id]||[];
    if(!arr.length&&id?.startsWith('minecraft:')){const n=id.split(':')[1];arr=[`textures/items/${n}.png`,`textures/blocks/${n}.png`]}
    return arr.map(x=>vanillaBase+x);
  };
  const icon=id=>{
    const m=item(id),d=document.createElement('span');d.className='item-icon';
    const t=document.createElement('span');t.className='item-fallback';t.textContent=m.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();d.append(t);
    const urls=candidates(id);if(urls.length){const im=new Image();im.alt=m.name;im.loading='lazy';let i=0;im.onload=()=>t.remove();im.onerror=()=>{i++;if(i<urls.length)im.src=urls[i];else im.remove()};im.src=urls[0];d.prepend(im)}
    return d;
  };

  const progress=$('#progress'),header=$('#header');
  const onScroll=()=>{const h=document.documentElement;progress.style.transform=`scaleX(${h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)})`;header.classList.toggle('is-scrolled',scrollY>24)};addEventListener('scroll',onScroll,{passive:true});onScroll();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});$$('.reveal').forEach(x=>io.observe(x));

  const viewer=new IAAircraftViewer($('#viewerStage'));let current='biplane',auto=true;
  function selectAircraft(name){
    current=name;const a=D.aircraft[name],idx=order.indexOf(name);
    $('#aircraftIndex').textContent=`${String(idx+1).padStart(2,'0')} / 07`;
    $('#aircraftName').textContent=a.name;$('#aircraftDescription').textContent=a.description;
    $('#aircraftFacts').innerHTML=`<div><span>Seats</span><strong>${Object.keys(a.seatLocators||{}).length}</strong></div><div><span>Slots</span><strong>${a.slots.length}</strong></div><div><span>Mass</span><strong>${a.stats.mass}</strong></div><div><span>Fuel factor</span><strong>${a.stats.fuel}</strong></div>`;
    $('#modelNote').textContent='Converted Bedrock geometry, UVs, animation hierarchy and source textures from the supplied port bundle.';
    $('#viewerStage').classList.remove('viewer-unavailable');
    viewer.load(name);viewer.setAutorotate(auto);viewer.setVar('engine_power',.8);viewer.setVar('cloth_motion',.65);
    $$('.aircraft-tab').forEach(b=>b.classList.toggle('active',b.dataset.aircraft===name));
  }
  order.forEach(name=>{const a=D.aircraft[name],b=document.createElement('button');b.className='aircraft-tab';b.dataset.aircraft=name;const iid='immersive_aircraft:'+name;b.append(icon(iid));const t=document.createElement('div');t.innerHTML=`<b>${a.name}</b><span>3D preview</span>`;b.append(t);b.onclick=()=>selectAircraft(name);$('#aircraftTabs').append(b)});
  $('#autoOrbit').onclick=e=>{auto=!auto;viewer.setAutorotate(auto);e.currentTarget.textContent=`Auto orbit: ${auto?'on':'off'}`};
  selectAircraft('biplane');

  const byResult=new Map(D.recipes.map(r=>[r.result.item,r]));let filter='all',selected;
  ['all','aircraft','component','upgrade','weapon'].forEach(f=>{const b=document.createElement('button');b.className='recipe-filter'+(f==='all'?' active':'');b.textContent=f;b.onclick=()=>{filter=f;$$('.recipe-filter').forEach(x=>x.classList.toggle('active',x===b));renderRecipeList()};$('#recipeFilters').append(b)});
  const ing=(r,ch)=>{const x=r.key[ch];return x?.item||(x?.tag?'#'+x.tag:null)};
  function renderRecipeList(){const q=$('#recipeSearch').value.toLowerCase().trim(),box=$('#recipeList');box.innerHTML='';D.recipes.filter(r=>{const m=item(r.result.item);return(filter==='all'||m.category===filter)&&(!q||m.name.toLowerCase().includes(q)||r.slug.includes(q))}).forEach(r=>{const m=item(r.result.item),b=document.createElement('button');b.className='recipe-entry'+(selected===r?' active':'');b.append(icon(r.result.item));const s=document.createElement('span');s.innerHTML=`<b>${m.name}</b><small>${m.category} · shaped</small>`;b.append(s);b.onclick=()=>selectRecipe(r);box.append(b)})}
  function expand(id,q=1,out={},stack=new Set()){const r=byResult.get(id);if(!r||stack.has(id)){out[id]=(out[id]||0)+q;return out}const next=new Set(stack);next.add(id);const c={};r.pattern.join('').split('').filter(x=>x!==' ').forEach(ch=>{const k=ing(r,ch);if(k)c[k]=(c[k]||0)+1});for(const[k,n]of Object.entries(c)){if(byResult.has(k))expand(k,q*n,out,next);else out[k]=(out[k]||0)+q*n}return out}
  function craftSlot(id){const d=document.createElement('div');d.className='craft-slot';if(id)d.append(icon(id));return d}
  function selectRecipe(r){selected=r;const m=item(r.result.item);$('#recipeCategory').textContent=m.category;$('#recipeTitle').textContent=m.name;const g=$('#craftGrid');g.innerHTML='';for(const row of r.pattern)for(const ch of row)g.append(craftSlot(ch===' '?null:ing(r,ch)));const res=$('#craftResult');res.innerHTML='';const rs=document.createElement('div');rs.className='result-slot';rs.append(icon(r.result.item));res.append(rs);$('#recipeNote').textContent=(m.tooltip||[]).join(' ')||'Current alpha shaped recipe.';const totals=expand(r.result.item),tb=$('#recipeTotals');tb.innerHTML='';Object.entries(totals).sort((a,b)=>item(a[0]).name.localeCompare(item(b[0]).name)).forEach(([id,n])=>{const c=document.createElement('div');c.className='ingredient-chip';c.append(icon(id));const t=document.createElement('span');t.textContent=`${n}× ${item(id).name}`;c.append(t);tb.append(c)});renderRecipeList()}
  $('#recipeSearch').oninput=renderRecipeList;renderRecipeList();selectRecipe(D.recipes.find(r=>r.slug==='biplane')||D.recipes[0]);

  order.forEach(name=>{const o=document.createElement('option');o.value=name;o.textContent=D.aircraft[name].name;$('#inventoryAircraft').append(o)});
  function inventoryMetrics(a){let left=0,right=176;for(const r of a.inventoryRegions||[]){if(!r.boxed)continue;const x=r.x-8,w=r.cols*18+14;left=Math.min(left,x);right=Math.max(right,x+w)}for(const s of a.slots){let x0,x1;if(s.type==='inventory'){x0=s.x-1;x1=s.x+17}else if(s.type==='boiler'){x0=s.x-4;x1=s.x+20}else{x0=s.x-3;x1=s.x+19}left=Math.min(left,x0);right=Math.max(right,x1)}return{left:Math.floor(left),width:Math.floor(right-left)}}
  function renderInventory(name){
    const a=D.aircraft[name],img=$('#inventoryLayout'),ov=$('#slotOverlay'),canvas=$('#inventoryCanvas'),metrics=inventoryMetrics(a);
    $('#inventoryTitle').textContent=`${a.name} inventory`;ov.innerHTML='';img.alt=`${a.name} inventory layout`;
    img.onload=()=>{ov.innerHTML='';const iw=img.naturalWidth||metrics.width,ih=img.naturalHeight||196,left=metrics.left;canvas.style.setProperty('--inventory-display-width',`${Math.min(iw*2,760)}px`);a.slots.forEach(s=>{const h=document.createElement('button');h.type='button';h.className=`inventory-slot-hit ${s.type}`;h.style.left=((s.x-left)/iw*100)+'%';h.style.top=(s.y/ih*100)+'%';h.style.width=(18/iw*100)+'%';h.style.height=(18/ih*100)+'%';h.title=`Slot ${s.index}: ${roleMeta[s.type]?.[0]||s.type}`;h.onmouseenter=h.onfocus=h.onclick=()=>{$$('.inventory-slot-hit').forEach(x=>x.classList.toggle('selected',x===h));$('#inventorySummary').innerHTML=`<strong>Slot ${s.index} · ${roleMeta[s.type]?.[0]||s.type}</strong><span>${roleMeta[s.type]?.[1]||'Aircraft slot'}</span>`};ov.append(h)})};
    img.src=UI.layouts?.[name]||'';
    const counts={};a.slots.forEach(s=>counts[s.type]=(counts[s.type]||0)+1);$('#slotLegend').innerHTML='';for(const[type,n]of Object.entries(counts)){const m=roleMeta[type]||[type,''];const row=document.createElement('div');row.className='legend-row';row.innerHTML=`<i class="legend-swatch ${type}"></i><b>${m[0]}</b><span>${n}</span>`;$('#slotLegend').append(row)}
    $('#inventorySummary').innerHTML=`<strong>${a.slots.length} source slots</strong><span>${Object.keys(a.seatLocators||{}).length} seat locator${Object.keys(a.seatLocators||{}).length===1?'':'s'} · exact source-authored layout artwork.</span>`;
  }
  $('#inventoryAircraft').onchange=e=>renderInventory(e.target.value);renderInventory('biplane');

  const frameMeta={gyro_speed:[55,55],gyro_alt:[55,55],gyro_heading:[109,19],gyro_attitude:[55,55],gyro_hud_speed:[70,90],gyro_hud_alt:[70,90],gyro_hud_heading:[150,22],gyro_hud_attitude:[120,90]};
  const spriteImgs={};
  for(const name of Object.keys(frameMeta)){const im=new Image();im.src=UI.instruments?.[name]||'';spriteImgs[name]=im}
  const hudFrame=$('#gyroHudFrame');if(hudFrame)hudFrame.src=UI.instruments?.gyro_hud_frame||'';
  const setItemImg=(id,key)=>{const n=$(id),u=CUSTOM[key];if(n&&u)n.src=u};setItemImg('#gyroItemBase','immersive_aircraft:gyroscope');setItemImg('#gyroItemDials','immersive_aircraft:gyroscope_dials');setItemImg('#gyroItemHud','immersive_aircraft:gyroscope_hud');
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mod=(a,n)=>((a%n)+n)%n;
  function drawFrame(canvas,name,index){if(!canvas)return;const im=spriteImgs[name],meta=frameMeta[name];if(!im||!meta)return;const[fw,fh]=meta;const go=()=>{const cols=Math.floor(im.naturalWidth/fw)||1,rows=Math.floor(im.naturalHeight/fh)||1,max=cols*rows-1,i=clamp(Math.round(index),0,max),sx=(i%cols)*fw,sy=Math.floor(i/cols)*fh,ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(im,sx,sy,fw,fh,0,0,canvas.width,canvas.height)};if(im.complete&&im.naturalWidth)go();else im.onload=go}
  function updateGyro(){const speed=+$('#gyroSpeed').value,alt=+$('#gyroAlt').value,heading=+$('#gyroHeading').value,pitch=+$('#gyroPitch').value,roll=+$('#gyroRoll').value;$('#outSpeed').textContent=speed.toFixed(1);$('#outAlt').textContent=Math.round(alt);$('#outHeading').textContent=String(Math.round(heading)).padStart(3,'0')+'°';$('#outPitch').textContent=Math.round(pitch)+'°';$('#outRoll').textContent=Math.round(roll)+'°';const si=speed<0?120:speed>=60?121:clamp(Math.round(speed/.5),0,119),ai=clamp(Math.round((alt+100)/5),0,420),hi=mod(Math.round(heading/5),72),pi=clamp(Math.round((pitch+90)/10),0,18),ri=clamp(Math.round((roll+60)/10),0,12),atti=pi*13+ri,hsi=clamp(Math.round((speed+20)/.5),0,160);drawFrame($('#dialSpeed'),'gyro_speed',si);drawFrame($('#dialAlt'),'gyro_alt',ai);drawFrame($('#dialHeading'),'gyro_heading',hi);drawFrame($('#dialAttitude'),'gyro_attitude',atti);drawFrame($('#hudHeading'),'gyro_hud_heading',hi);drawFrame($('#hudAttitude'),'gyro_hud_attitude',atti);drawFrame($('#hudSpeed'),'gyro_hud_speed',hsi);drawFrame($('#hudAlt'),'gyro_hud_alt',ai)}
  ['gyroSpeed','gyroAlt','gyroHeading','gyroPitch','gyroRoll'].forEach(id=>$('#'+id).addEventListener('input',updateGyro));
  $$('.gyro-mode').forEach(b=>b.onclick=()=>{$$('.gyro-mode').forEach(x=>x.classList.toggle('active',x===b));$('#gyroDials').classList.toggle('hidden',b.dataset.mode!=='dials');$('#gyroHud').classList.toggle('hidden',b.dataset.mode!=='hud');updateGyro()});
  setTimeout(updateGyro,100);
})();