(()=>{
  const D={
    ...(window.IA_META||{}),
    recipes:window.IA_RECIPES||[],
    items:{...(window.IA_ITEMS_1||{}),...(window.IA_ITEMS_2||{})}
  };
  const CUSTOM=window.IA_ITEM_ASSETS||{};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

  const vanillaBase='https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/';
  const vanillaCandidates={
    'minecraft:iron_ingot':['textures/items/iron_ingot.png'],
    'minecraft:bamboo':['textures/items/bamboo.png'],
    'minecraft:bamboo_block':['textures/items/bamboo_block.png','textures/blocks/bamboo_block.png','textures/blocks/bamboo_block_side.png'],
    'minecraft:blast_furnace':['textures/items/blast_furnace.png','textures/blocks/blast_furnace_front_off.png'],
    'minecraft:blaze_rod':['textures/items/blaze_rod.png'],
    'minecraft:brick':['textures/items/brick.png'],
    'minecraft:chest':['textures/items/chest.png','textures/blocks/chest_front.png'],
    'minecraft:clock':['textures/items/clock_item.png','textures/items/clock_00.png','textures/items/clock.png'],
    'minecraft:coal':['textures/items/coal.png'],
    'minecraft:cobblestone':['textures/items/cobblestone.png','textures/blocks/cobblestone.png'],
    'minecraft:comparator':['textures/items/comparator.png'],
    'minecraft:compass':['textures/items/compass_item.png','textures/items/compass_00.png','textures/items/compass.png'],
    'minecraft:copper_ingot':['textures/items/copper_ingot.png'],
    'minecraft:crossbow':['textures/items/crossbow_standby.png'],
    'minecraft:dispenser':['textures/items/dispenser.png','textures/blocks/dispenser_front_horizontal.png'],
    'minecraft:furnace':['textures/items/furnace.png','textures/blocks/furnace_front_off.png'],
    'minecraft:glass_pane':['textures/items/glass_pane.png','textures/blocks/glass.png'],
    'minecraft:gold_ingot':['textures/items/gold_ingot.png'],
    'minecraft:gold_nugget':['textures/items/gold_nugget.png'],
    'minecraft:lever':['textures/items/lever.png'],
    'minecraft:magma_cream':['textures/items/magma_cream.png'],
    'minecraft:nether_brick':['textures/items/netherbrick.png','textures/items/nether_brick.png'],
    'minecraft:netherite_ingot':['textures/items/netherite_ingot.png'],
    'minecraft:noteblock':['textures/items/noteblock.png','textures/blocks/noteblock.png'],
    'minecraft:piston':['textures/items/piston.png','textures/blocks/piston_top_normal.png'],
    'minecraft:redstone_lamp':['textures/items/redstone_lamp.png','textures/blocks/redstone_lamp_off.png'],
    'minecraft:slime_ball':['textures/items/slime_ball.png','textures/items/slimeball.png'],
    'minecraft:spyglass':['textures/items/spyglass.png'],
    'minecraft:string':['textures/items/string.png'],
    'minecraft:tnt':['textures/items/tnt.png','textures/blocks/tnt_side.png'],
    'minecraft:tripwire_hook':['textures/items/tripwire_hook.png'],
    'minecraft:white_carpet':['textures/items/carpet_white.png','textures/blocks/wool_colored_white.png'],
    '#minecraft:logs':['textures/items/log_oak.png','textures/blocks/log_oak.png']
  };

  const baseItem=id=>D.items[id]||{
    id,
    name:(id||'').replace(/^#/,'').split(':').pop().replaceAll('_',' '),
    category:'vanilla',
    tooltip:[],
    icon:null
  };
  const item=id=>{const m=baseItem(id);return {...m,icon:CUSTOM[id]||m.icon||null}};
  const candidates=id=>{
    const m=item(id);
    if(m.icon) return [m.icon];
    let arr=vanillaCandidates[id]||[];
    if(!arr.length&&id?.startsWith('minecraft:')){
      const n=id.split(':')[1];
      arr=[`textures/items/${n}.png`,`textures/blocks/${n}.png`];
    }
    return arr.map(x=>vanillaBase+x);
  };

  const icon=id=>{
    const m=item(id),d=document.createElement('span');
    d.className='item-icon';
    const t=document.createElement('span');
    t.className='item-fallback';
    t.textContent=m.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    d.append(t);
    const urls=candidates(id);
    if(urls.length){
      const im=new Image();
      im.alt=m.name;
      im.loading='lazy';
      let i=0;
      im.onload=()=>t.remove();
      im.onerror=()=>{i++;if(i<urls.length)im.src=urls[i];else im.remove()};
      im.src=urls[0];
      d.prepend(im);
    }
    return d;
  };

  const progress=$('#progress'),header=$('#header');
  const onScroll=()=>{
    const doc=document.documentElement;
    progress.style.transform=`scaleX(${doc.scrollTop/Math.max(1,doc.scrollHeight-doc.clientHeight)})`;
    header.classList.toggle('is-scrolled',scrollY>24);
  };
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)e.target.classList.add('in');
  }),{threshold:.12});
  $$('.reveal').forEach(x=>io.observe(x));

  const byResult=new Map(D.recipes.map(r=>[r.result.item,r]));
  let filter='all',selected;

  ['all','aircraft','component','upgrade','weapon'].forEach(f=>{
    const b=document.createElement('button');
    b.className='recipe-filter'+(f==='all'?' active':'');
    b.textContent=f;
    b.onclick=()=>{
      filter=f;
      $$('.recipe-filter').forEach(x=>x.classList.toggle('active',x===b));
      renderRecipeList();
    };
    $('#recipeFilters').append(b);
  });

  const ing=(r,ch)=>{
    const x=r.key[ch];
    return x?.item||(x?.tag?'#'+x.tag:null);
  };

  function renderRecipeList(){
    const q=$('#recipeSearch').value.toLowerCase().trim(),box=$('#recipeList');
    box.innerHTML='';
    D.recipes.filter(r=>{
      const m=item(r.result.item);
      return (filter==='all'||m.category===filter)&&(!q||m.name.toLowerCase().includes(q)||r.slug.includes(q));
    }).forEach(r=>{
      const m=item(r.result.item),b=document.createElement('button');
      b.className='recipe-entry'+(selected===r?' active':'');
      b.append(icon(r.result.item));
      const s=document.createElement('span');
      s.innerHTML=`<b>${m.name}</b><small>${m.category} · shaped</small>`;
      b.append(s);
      b.onclick=()=>selectRecipe(r);
      box.append(b);
    });
  }

  function expand(id,q=1,out={},stack=new Set()){
    const r=byResult.get(id);
    if(!r||stack.has(id)){
      out[id]=(out[id]||0)+q;
      return out;
    }
    const next=new Set(stack);
    next.add(id);
    const c={};
    r.pattern.join('').split('').filter(x=>x!==' ').forEach(ch=>{
      const k=ing(r,ch);
      if(k)c[k]=(c[k]||0)+1;
    });
    for(const [k,n] of Object.entries(c)){
      if(byResult.has(k))expand(k,q*n,out,next);
      else out[k]=(out[k]||0)+q*n;
    }
    return out;
  }

  function craftSlot(id){
    const d=document.createElement('div');
    d.className='craft-slot';
    if(id)d.append(icon(id));
    return d;
  }

  function selectRecipe(r){
    selected=r;
    const m=item(r.result.item);
    $('#recipeCategory').textContent=m.category;
    $('#recipeTitle').textContent=m.name;

    const g=$('#craftGrid');
    g.innerHTML='';
    for(const row of r.pattern){
      for(const ch of row)g.append(craftSlot(ch===' '?null:ing(r,ch)));
    }

    const res=$('#craftResult');
    res.innerHTML='';
    const rs=document.createElement('div');
    rs.className='result-slot';
    rs.append(icon(r.result.item));
    res.append(rs);

    $('#recipeNote').textContent=(m.tooltip||[]).join(' ')||'Current alpha shaped recipe.';

    const totals=expand(r.result.item),tb=$('#recipeTotals');
    tb.innerHTML='';
    Object.entries(totals)
      .sort((a,b)=>item(a[0]).name.localeCompare(item(b[0]).name))
      .forEach(([id,n])=>{
        const c=document.createElement('div');
        c.className='ingredient-chip';
        c.append(icon(id));
        const t=document.createElement('span');
        t.textContent=`${n}× ${item(id).name}`;
        c.append(t);
        tb.append(c);
      });

    renderRecipeList();
  }

  $('#recipeSearch').oninput=renderRecipeList;
  renderRecipeList();
  selectRecipe(D.recipes.find(r=>r.slug==='biplane')||D.recipes[0]);
})();