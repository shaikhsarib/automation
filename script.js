/**
 * DealerHub Pro — Enterprise Management System
 * Core Logic & State Management
 */

// Tailwind Config (needed for CDN play)
if (window.tailwind) {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    bg: '#060A11',
                    card: '#0D1219',
                    card2: '#111922',
                    border: '#172030',
                    accent: '#E8A020',
                    accent2: '#10B981',
                    danger: '#EF4444',
                    info: '#3B82F6',
                    fg: '#F0F4F8',
                    muted: '#6B7F96',
                    dimmed: '#384860'
                },
                fontFamily: {
                    heading: ['Space Grotesk'],
                    body: ['DM Sans']
                }
            }
        }
    };
}

// ======================================================
// DATABASE LAYER — localStorage persistence
// ======================================================
const DB_KEY = 'dealerhub_pro_data';

const DB = {
  save() {
    try {
      const data = { products, dealers, orders, transactions, nextOrderId, nextTxId, fbGroups, fbPostLog, igLikeLog, activityLog, notifications, settings };
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch(e) { console.warn('DB save failed:', e); }
  },
  load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.products) products = d.products;
      if (d.dealers) dealers = d.dealers;
      if (d.orders) orders = d.orders;
      if (d.transactions) transactions = d.transactions;
      if (d.nextOrderId) nextOrderId = d.nextOrderId;
      if (d.nextTxId) nextTxId = d.nextTxId;
      if (d.fbGroups) fbGroups = d.fbGroups;
      if (d.fbPostLog) fbPostLog = d.fbPostLog;
      if (d.igLikeLog) igLikeLog = d.igLikeLog;
      if (d.activityLog) activityLog = d.activityLog;
      if (d.notifications) notifications = d.notifications;
      if (d.settings) settings = d.settings;
      return true;
    } catch(e) { console.warn('DB load failed:', e); return false; }
  },
  reset() { localStorage.removeItem(DB_KEY); location.reload(); },
  exportJSON() {
    const data = { products, dealers, orders, transactions, fbGroups, fbPostLog, igLikeLog, activityLog, notifications, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `dealerhub_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  },
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const d = JSON.parse(e.target.result);
        if (d.products) products = d.products;
        if (d.dealers) dealers = d.dealers;
        if (d.orders) orders = d.orders;
        if (d.transactions) transactions = d.transactions;
        if (d.fbGroups) fbGroups = d.fbGroups;
        if (d.fbPostLog) fbPostLog = d.fbPostLog;
        if (d.igLikeLog) igLikeLog = d.igLikeLog;
        if (d.activityLog) activityLog = d.activityLog;
        if (d.notifications) notifications = d.notifications;
        if (d.settings) settings = d.settings;
        if (d.nextOrderId) nextOrderId = d.nextOrderId;
        if (d.nextTxId) nextTxId = d.nextTxId;
        DB.save(); showToast('Data imported successfully'); renderApp();
      } catch(err) { showToast('Invalid backup file','error'); }
    };
    reader.readAsText(file);
  }
};

// ======================================================
// STATE
// ======================================================
const STATE = { currentUser:null, currentView:'dashboard', sidebarCollapsed:false, fbConnected:false, igConnected:false, igAutoLikeMaster:false, fbPostingActive:false };

let settings = { companyName:'DealerHub Pro', initialWallet:5000, currency:'INR' };

// ======================================================
// DATA — Products
// ======================================================
let products = [
  {id:1,name:'Premium Basmati Rice',desc:'5kg Aged Basmati',price:450,category:'Grains',stock:150,img:'rice'},
  {id:2,name:'Cold Pressed Coconut Oil',desc:'1L Pure Virgin',price:320,category:'Oils',stock:200,img:'coconut'},
  {id:3,name:'Organic Turmeric Powder',desc:'500g Lakadong',price:280,category:'Spices',stock:300,img:'turmeric'},
  {id:4,name:'Assam CTC Tea',desc:'1kg Premium Blend',price:550,category:'Beverages',stock:180,img:'tea'},
  {id:5,name:'Whole Wheat Flour',desc:'10kg Stone Ground',price:380,category:'Grains',stock:250,img:'wheat'},
  {id:6,name:'Jaggery Powder',desc:'1kg Organic',price:210,category:'Sweeteners',stock:220,img:'jaggery'},
  {id:7,name:'Red Chilli Powder',desc:'500g Byadgi',price:260,category:'Spices',stock:280,img:'chilli'},
  {id:8,name:'Mustard Oil',desc:'1L Cold Pressed',price:290,category:'Oils',stock:190,img:'mustard'},
  {id:9,name:'Moong Dal',desc:'1kg Split Green',price:340,category:'Pulses',stock:210,img:'lentils'},
  {id:10,name:'Pure Desi Ghee',desc:'500ml Cow Ghee',price:620,category:'Dairy',stock:160,img:'ghee'},
  {id:11,name:'Black Pepper',desc:'250g Malabar',price:380,category:'Spices',stock:170,img:'pepper'},
  {id:12,name:'Coriander Powder',desc:'500g Ground',price:180,category:'Spices',stock:340,img:'coriander'},
  {id:13,name:'Cumin Seeds',desc:'500g Whole Jeera',price:420,category:'Spices',stock:230,img:'cumin'},
  {id:14,name:'Kashmir Saffron',desc:'1g Grade A',price:750,category:'Spices',stock:50,img:'saffron'},
  {id:15,name:'Wild Forest Honey',desc:'500ml Raw',price:480,category:'Sweeteners',stock:140,img:'honey'},
  {id:16,name:'California Almonds',desc:'250g Premium',price:680,category:'Dry Fruits',stock:120,img:'almonds'},
  {id:17,name:'Goa Cashew Nuts',desc:'250g Whole W240',price:720,category:'Dry Fruits',stock:110,img:'cashew'},
  {id:18,name:'Afghan Raisins',desc:'500g Green',price:320,category:'Dry Fruits',stock:190,img:'raisins'},
  {id:19,name:'Green Cardamom',desc:'100g Whole Elaichi',price:560,category:'Spices',stock:80,img:'cardamom'},
  {id:20,name:'Ceylon Cinnamon Sticks',desc:'200g Quills',price:350,category:'Spices',stock:150,img:'cinnamon'}
];

// ======================================================
// DATA — Dealers
// ======================================================
let dealers = [
  {id:1,name:'Rajesh Kumar',email:'rajesh@dealer.com',password:'dealer123',phone:'9876543210',city:'Mumbai',wallet:5000,status:'active',joinDate:'2024-01-15',avatar:'RK'},
  {id:2,name:'Priya Sharma',email:'priya@dealer.com',password:'dealer123',phone:'9876543211',city:'Delhi',wallet:5000,status:'active',joinDate:'2024-02-20',avatar:'PS'},
  {id:3,name:'Amit Patel',email:'amit@dealer.com',password:'dealer123',phone:'9876543212',city:'Ahmedabad',wallet:3500,status:'active',joinDate:'2024-03-05',avatar:'AP'},
  {id:4,name:'Sunita Reddy',email:'sunita@dealer.com',password:'dealer123',phone:'9876543213',city:'Hyderabad',wallet:5000,status:'active',joinDate:'2024-03-18',avatar:'SR'},
  {id:5,name:'Vikram Singh',email:'vikram@dealer.com',password:'dealer123',phone:'9876543214',city:'Jaipur',wallet:2200,status:'active',joinDate:'2024-04-01',avatar:'VS'},
  {id:6,name:'Meera Nair',email:'meera@dealer.com',password:'dealer123',phone:'9876543215',city:'Kochi',wallet:5000,status:'inactive',joinDate:'2024-04-10',avatar:'MN'},
  {id:7,name:'Sanjay Gupta',email:'sanjay@dealer.com',password:'dealer123',phone:'9876543216',city:'Kolkata',wallet:4100,status:'active',joinDate:'2024-05-02',avatar:'SG'},
  {id:8,name:'Anjali Deshmukh',email:'anjali@dealer.com',password:'dealer123',phone:'9876543217',city:'Pune',wallet:5000,status:'active',joinDate:'2024-05-15',avatar:'AD'}
];

let orders = [
  {id:1001,dealerId:3,productId:10,qty:1,total:620,date:'2024-05-10',status:'delivered'},
  {id:1002,dealerId:5,productId:4,qty:2,total:1100,date:'2024-05-12',status:'delivered'},
  {id:1003,dealerId:5,productId:14,qty:1,total:750,date:'2024-05-15',status:'delivered'},
  {id:1004,dealerId:7,productId:2,qty:3,total:960,date:'2024-06-01',status:'shipped'},
  {id:1005,dealerId:3,productId:16,qty:1,total:680,date:'2024-06-05',status:'processing'},
];
let nextOrderId = 1006;
let transactions = [
  {id:1,dealerId:3,type:'credit',amount:5000,desc:'Initial wallet credit',date:'2024-03-05'},
  {id:2,dealerId:3,type:'debit',amount:620,desc:'Order #1001 \u2014 Pure Desi Ghee',date:'2024-05-10'},
  {id:3,dealerId:5,type:'credit',amount:5000,desc:'Initial wallet credit',date:'2024-04-01'},
  {id:4,dealerId:5,type:'debit',amount:1100,desc:'Order #1002 \u2014 Assam CTC Tea x2',date:'2024-05-12'},
  {id:5,dealerId:5,type:'debit',amount:750,desc:'Order #1003 \u2014 Kashmir Saffron',date:'2024-05-15'},
  {id:6,dealerId:7,type:'credit',amount:5000,desc:'Initial wallet credit',date:'2024-05-02'},
  {id:7,dealerId:7,type:'debit',amount:960,desc:'Order #1004 \u2014 Coconut Oil x3',date:'2024-06-01'},
];
let nextTxId = 8;

// ======================================================
// DATA \u2014 Facebook Groups (100)
// ======================================================
function genFbGroups(){
  const cities=['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Jaipur','Kolkata','Ahmedabad','Lucknow','Chandigarh','Indore','Bhopal','Patna','Nagpur','Surat','Coimbatore','Vadodara','Ludhiana','Kochi'];
  const types=['Traders Association','Business Network','Dealers Hub','Wholesale Market','Retail Connect','Commerce Forum','Shop Owners United','SME Network','Marketplace Pro','Entrepreneurs Circle','Distributor Zone','Supplier Guild','Trade Alliance','Merchant Club','B2B Connect'];
  const g=[];
  for(let i=0;i<100;i++){const c=cities[i%cities.length];const t=types[Math.floor(i/cities.length)%types.length];
  g.push({id:i+1,name:`${c} ${t}`,members:Math.floor(Math.random()*48000)+2000,selected:i<10,category:t.includes('Wholesale')?'Wholesale':t.includes('Retail')?'Retail':t.includes('B2B')?'B2B':'General'})}
  return g;
}
let fbGroups=genFbGroups();let fbPostLog=[];

// Instagram
function genIgFollowers(){
  const names=['arun_spices','mumbai_food_mart','organic_india_store','delhi_traders','kitchen_queen','spice_route','green_basket','fresh_produce_in','the_grocery_guy','indian_kitchen_secrets','flavor_factory','farm_to_table_in','masala_king','daily_bazaar','pure_natural_goods','south_india_spices','healthy_habitat','the_nutrition_hub','home_cook_delight','grains_and_more','taste_of_india','village_fresh_co','spice_valley','coastal_catch','dry_fruit_palace','tea_trail','honey_bee_organic','dal_lentils_co','oil_mill_direct','ghee_ghar','nut_meg_nation','cinnamon_craft','pepper_pride','saffron_stories','cardamom_cove','turmeric_tales','basmati_brothers','flour_power_in','jaggery_junction','mustard_magic','chill_chapter','cumin_culture','coriander_craft','almond_aura','cashew_coast','raisin_range','cinnamon_circle','tea_terrace','honey_harvest_in'];
  return names.map((n,i)=>({id:i+1,username:n,fullName:n.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),posts:Math.floor(Math.random()*150)+10,autoLike:i<5,lastLiked:i<5?'2 min ago':null}));
}
let igFollowers=genIgFollowers();let igLikeLog=[];

// Activity Log
let activityLog=[];
// Notifications
let notifications=[];

function addLog(action,detail){activityLog.unshift({id:Date.now(),action,detail,user:STATE.currentUser?STATE.currentUser.data.name:'System',date:new Date().toISOString()});if(activityLog.length>200)activityLog.length=200;DB.save();}
function addNotif(title,desc,type='info'){notifications.unshift({id:Date.now(),title,desc,type,read:false,date:new Date().toISOString()});if(notifications.length>50)notifications.length=50;DB.save();updateNotifCount();}

// ======================================================
// UTILITY
// ======================================================
function fmt(n){return'\u20B9'+n.toLocaleString('en-IN')}
function fmtDate(d){try{return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}catch(e){return d}}
function fmtDateTime(d){try{return new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return d}}
function getDealer(id){return dealers.find(d=>d.id===id)}
function getProduct(id){return products.find(p=>p.id===id)}
function getDealerOrders(did){return orders.filter(o=>o.dealerId===did)}
function getDealerTx(did){return transactions.filter(t=>t.dealerId===did)}
function prodImg(p){return`https://picsum.photos/seed/${p.img||p.id}/400/300`}

function showToast(msg,type='success'){
  const c=document.getElementById('toastContainer');const t=document.createElement('div');
  t.className=`toast-item toast-${type}`;const ic=type==='success'?'check-circle':type==='error'?'exclamation-circle':type==='warning'?'exclamation-triangle':'info-circle';
  t.innerHTML=`<i class="fas fa-${ic}"></i><span>${msg}</span>`;c.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300)},3500);
}
function openModal(html){document.getElementById('modalBox').innerHTML=html;document.getElementById('modalOverlay').classList.add('active')}
function closeModal(){document.getElementById('modalOverlay').classList.remove('active')}

function updateNotifCount(){
  const unread=notifications.filter(n=>!n.read).length;const el=document.getElementById('notifCount');
  if(unread>0){el.textContent=unread;el.classList.remove('hidden')}else{el.classList.add('hidden')}
}
function toggleNotifDropdown(){
  const dd=document.getElementById('notifDropdown');dd.classList.toggle('open');
  if(dd.classList.contains('open')){
    notifications.forEach(n=>n.read=true);DB.save();updateNotifCount();
    dd.innerHTML=notifications.length===0?'<div class="p-6 text-center text-muted text-sm">No notifications</div>':
    notifications.slice(0,15).map(n=>`<div class="flex items-start gap-3 p-3 border-b border-border/50 hover:bg-card2 transition">
      <div class="w-8 h-8 rounded-lg ${n.type==='order'?'bg-emerald-500/10 text-emerald-400':n.type==='wallet'?'bg-amber-500/10 text-amber-400':n.type==='social'?'bg-blue-500/10 text-blue-400':'bg-sky-500/10 text-sky-400'} flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-${n.type==='order'?'shopping-cart':n.type==='wallet'?'wallet':n.type==='social'?'share-nodes':'bell'} text-xs"></i></div>
      <div><div class="text-xs font-semibold text-fg">${n.title}</div><div class="text-[11px] text-muted">${n.desc}</div><div class="text-[10px] text-dimmed mt-0.5">${fmtDateTime(n.date)}</div></div>
    </div>`).join('');
  }
}

function exportCSV(data,headers,filename){
  const rows=[headers.join(',')];
  data.forEach(r=>rows.push(r.join(',')));
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();URL.revokeObjectURL(a.href);
}

// ======================================================
// AUTH
// ======================================================
function handleLogin(){
  const email=document.getElementById('loginEmail').value.trim();const pass=document.getElementById('loginPassword').value;const errEl=document.getElementById('loginError');
  if(!email||!pass){errEl.textContent='Please enter email and password';errEl.classList.remove('hidden');return}
  if(email==='admin@dealerhub.com'&&pass==='admin123'){STATE.currentUser={type:'admin',data:{name:'Super Admin',email,avatar:'SA'}}}
  else{const dealer=dealers.find(d=>d.email===email&&d.password===pass);if(dealer){if(dealer.status==='inactive'){errEl.textContent='Account is inactive. Contact admin.';errEl.classList.remove('hidden');return}STATE.currentUser={type:'dealer',data:dealer}}else{errEl.textContent='Invalid email or password';errEl.classList.remove('hidden');return}}
  errEl.classList.add('hidden');document.getElementById('loginScreen').classList.add('hidden');document.getElementById('appScreen').classList.remove('hidden');
  addLog('Login',`${STATE.currentUser.data.name} logged in`);renderApp();
}
function handleLogout(){
  addLog('Logout',`${STATE.currentUser.data.name} logged out`);STATE.currentUser=null;STATE.currentView='dashboard';STATE.fbConnected=false;STATE.igConnected=false;
  document.getElementById('appScreen').classList.add('hidden');document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginEmail').value='';document.getElementById('loginPassword').value='';
}

// ======================================================
// NAVIGATION
// ======================================================
const ADMIN_NAV=[{id:'dashboard',icon:'fa-chart-pie',label:'Dashboard'},{id:'dealers',icon:'fa-users',label:'Manage Dealers'},{id:'products',icon:'fa-boxes-stacked',label:'Manage Products'},{id:'orders',icon:'fa-receipt',label:'All Orders'},{id:'wallets',icon:'fa-wallet',label:'Wallet Management'},{id:'analytics',icon:'fa-chart-bar',label:'Analytics'},{id:'social',icon:'fa-share-nodes',label:'Social Automation'},{id:'activity',icon:'fa-clock-rotate-left',label:'Activity Log'},{id:'settings',icon:'fa-gear',label:'Settings'}];
const DEALER_NAV=[{id:'dashboard',icon:'fa-chart-pie',label:'Dashboard'},{id:'products',icon:'fa-boxes-stacked',label:'Products'},{id:'orders',icon:'fa-receipt',label:'My Orders'},{id:'wallet',icon:'fa-wallet',label:'My Wallet'},{id:'social',icon:'fa-share-nodes',label:'Social Automation'},{id:'settings',icon:'fa-gear',label:'Settings'}];

function navigate(v){STATE.currentView=v;renderApp()}
function toggleSidebar(){const sb=document.getElementById('sidebar');const ma=document.getElementById('mainArea');if(window.innerWidth<=768){sb.classList.toggle('mobile-open')}else{STATE.sidebarCollapsed=!STATE.sidebarCollapsed;sb.classList.toggle('collapsed',STATE.sidebarCollapsed);ma.classList.toggle('expanded',STATE.sidebarCollapsed)}}

// ======================================================
// RENDER
// ======================================================
function renderApp(){
  if (!STATE.currentUser) return;
  const isA=STATE.currentUser.type==='admin';const navItems=isA?ADMIN_NAV:DEALER_NAV;
  const unreadCount=notifications.filter(n=>!n.read).length;
  document.getElementById('sidebarNav').innerHTML=navItems.map(n=>{
    let badge='';if(n.id==='orders'&&isA){const p=orders.filter(o=>o.status==='processing').length;if(p>0)badge=`<span class="nav-badge">${p}</span>`}
    if(n.id==='activity'&&isA&&activityLog.length>0){badge=`<span class="nav-badge" style="background:#3B82F6">${activityLog.length>99?'99+':activityLog.length}</span>`}
    return`<div class="nav-item ${STATE.currentView===n.id?'active':''}" onclick="navigate('${n.id}')"><i class="fas ${n.icon} nav-icon"></i><span class="nav-label">${n.label}</span>${badge}</div>`
  }).join('');
  const u=STATE.currentUser.data;
  document.getElementById('sidebarUser').innerHTML=`<div class="flex items-center gap-2.5"><div class="w-8 h-8 rounded-full ${isA?'bg-amber-500/15 text-amber-400':'bg-emerald-500/15 text-emerald-400'} flex items-center justify-center flex-shrink-0 text-xs font-bold">${u.avatar||u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div><div class="user-info"><div class="text-xs font-semibold text-fg truncate">${u.name}</div><div class="text-[10px] text-muted">${isA?'Super Admin':'Dealer'}</div></div></div>`;
  const wb=document.getElementById('walletBadge');if(!isA){wb.classList.remove('hidden');wb.classList.add('flex');document.getElementById('walletAmount').textContent=fmt(STATE.currentUser.data.wallet)}else{wb.classList.add('hidden');wb.classList.remove('flex')}
  const titles={dashboard:'Dashboard',dealers:'Manage Dealers',products:'Products',orders:'Orders',wallet:'My Wallet',wallets:'Wallet Management',analytics:'Analytics',social:'Social Automation',activity:'Activity Log',settings:'Settings'};
  document.getElementById('pageTitle').textContent=titles[STATE.currentView]||'Dashboard';
  const area=document.getElementById('contentArea');
  switch(STATE.currentView){
    case'dashboard':area.innerHTML=isA?renderAdminDash():renderDealerDash();break;
    case'dealers':area.innerHTML=renderDealersV();break;case'products':area.innerHTML=isA?renderAdminProd():renderDealerProd();break;
    case'orders':area.innerHTML=isA?renderAllOrders():renderDealerOrders();break;case'wallet':area.innerHTML=renderDealerWallet();break;
    case'wallets':area.innerHTML=renderWalletMgmt();break;case'analytics':area.innerHTML=renderAnalytics();break;
    case'social':area.innerHTML=renderSocial();break;case'activity':area.innerHTML=renderActivityLog();break;
    case'settings':area.innerHTML=renderSettings();break;
  }
  updateNotifCount();
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================
function renderAdminDash(){
  const ad=dealers.filter(d=>d.status==='active').length;const to=orders.length;const tr=orders.reduce((s,o)=>s+o.total,0);const tw=dealers.reduce((s,d)=>s+d.wallet,0);
  const ro=[...orders].reverse().slice(0,5);
  return`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
  <div class="stat-card fade-in fd1"><div class="glow bg-amber-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Active Dealers</span><div class="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><i class="fas fa-users text-amber-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${ad}</div><div class="text-[10px] text-muted mt-0.5">of ${dealers.length} total</div></div>
  <div class="stat-card fade-in fd2"><div class="glow bg-emerald-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Total Orders</span><div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"><i class="fas fa-receipt text-emerald-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${to}</div><div class="text-[10px] text-emerald-400 mt-0.5">${orders.filter(o=>o.status==='processing').length} processing</div></div>
  <div class="stat-card fade-in fd3"><div class="glow bg-sky-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Total Revenue</span><div class="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center"><i class="fas fa-chart-line text-sky-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${fmt(tr)}</div><div class="text-[10px] text-muted mt-0.5">from all orders</div></div>
  <div class="stat-card fade-in fd4"><div class="glow bg-purple-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Wallet Balance</span><div class="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"><i class="fas fa-wallet text-purple-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${fmt(tw)}</div><div class="text-[10px] text-muted mt-0.5">across all dealers</div></div>
  </div>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
  <div class="stat-card fade-in"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Recent Orders</h3><div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Order</th><th>Dealer</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead><tbody>${ro.map(o=>{const d=getDealer(o.dealerId);const p=getProduct(o.productId);return`<tr><td class="text-accent font-semibold">#${o.id}</td><td>${d?d.name:'\u2014'}</td><td>${p?p.name:'\u2014'}</td><td class="font-semibold">${fmt(o.total)}</td><td><span class="badge badge-${o.status==='delivered'?'success':o.status==='shipped'?'info':'warning'}">${o.status}</span></td></tr>`}).join('')}</tbody></table></div></div>
  <div class="stat-card fade-in"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Revenue Chart (Last 6 Months)</h3><div class="chart-container"><canvas id="adminRevenueChart"></canvas></div></div>
  </div>`;
}

// ======================================================
// DEALER DASHBOARD
// ======================================================
function renderDealerDash(){
  const d=STATE.currentUser.data;const mo=getDealerOrders(d.id);const tx=getDealerTx(d.id);const ts=tx.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  return`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  <div class="stat-card fade-in fd1"><div class="glow bg-amber-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Wallet Balance</span><div class="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><i class="fas fa-wallet text-amber-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-accent">${fmt(d.wallet)}</div><div class="text-[10px] text-muted mt-0.5">Total spent: ${fmt(ts)}</div></div>
  <div class="stat-card fade-in fd2"><div class="glow bg-emerald-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">My Orders</span><div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"><i class="fas fa-receipt text-emerald-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${mo.length}</div><div class="text-[10px] text-muted mt-0.5">${mo.filter(o=>o.status==='processing').length} processing</div></div>
  <div class="stat-card fade-in fd3"><div class="glow bg-sky-500"></div><div class="flex items-center justify-between mb-2"><span class="text-muted text-xs font-medium">Products</span><div class="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center"><i class="fas fa-boxes-stacked text-sky-400 text-sm"></i></div></div><div class="text-2xl font-heading font-bold text-fg">${products.length}</div><div class="text-[10px] text-sky-400 mt-0.5 cursor-pointer hover:underline" onclick="navigate('products')">Browse catalog</div></div>
  </div>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
  <div class="stat-card fade-in"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Recent Orders</h3>${mo.length===0?'<p class="text-muted text-xs">No orders yet.</p>':`<div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Order</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead><tbody>${[...mo].reverse().slice(0,5).map(o=>{const p=getProduct(o.productId);return`<tr><td class="text-accent font-semibold">#${o.id}</td><td>${p?p.name:'\u2014'}</td><td class="font-semibold">${fmt(o.total)}</td><td><span class="badge badge-${o.status==='delivered'?'success':o.status==='shipped'?'info':'warning'}">${o.status}</span></td></tr>`}).join('')}</tbody></table></div>`}</div>
  <div class="stat-card fade-in"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Recent Transactions</h3>${tx.length===0?'<p class="text-muted text-xs">No transactions.</p>':`<div class="space-y-1">${[...tx].reverse().slice(0,6).map(t=>`<div class="flex items-center justify-between py-2 border-b border-border/30"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-lg ${t.type==='credit'?'bg-emerald-500/10':'bg-red-500/10'} flex items-center justify-center"><i class="fas fa-arrow-${t.type==='credit'?'down text-emerald-400':'up text-red-400'} text-[10px]"></i></div><div><div class="text-xs text-fg">${t.desc}</div><div class="text-[10px] text-muted">${fmtDate(t.date)}</div></div></div><span class="font-bold text-xs ${t.type==='credit'?'text-emerald-400':'text-red-400'}">${t.type==='credit'?'+':'\u2212'}${fmt(t.amount)}</span></div>`).join('')}</div>`}</div>
  </div>`;
}

// ======================================================
// DEALERS VIEW
// ======================================================
function renderDealersV(){return`<div class="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in"><div class="flex items-center gap-2"><input id="dSearch" class="input-field w-56" placeholder="Search dealers..." oninput="filterDealers()"></div><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="exportDealersCSV()"><i class="fas fa-file-csv"></i> Export CSV</button><button class="btn btn-primary btn-sm" onclick="openAddDealerModal()"><i class="fas fa-plus"></i> Add Dealer</button></div></div><div class="stat-card fade-in"><div class="overflow-x-auto"><table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>City</th><th>Wallet</th><th>Orders</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody id="dTbody">${dealers.map(d=>dealerRow(d)).join('')}</tbody></table></div></div>`}

function dealerRow(d){const do2=getDealerOrders(d.id);return`<tr><td class="text-muted">#${d.id}</td><td><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full ${d.status==='active'?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'} flex items-center justify-center text-[10px] font-bold">${d.avatar||d.name[0]}</div><div><div class="font-medium text-xs">${d.name}</div><div class="text-[10px] text-muted">${d.email}</div></div></div></td><td class="text-xs">${d.city}</td><td class="font-semibold text-accent text-xs">${fmt(d.wallet)}</td><td class="text-xs">${do2.length}</td><td><span class="badge badge-${d.status==='active'?'success':'danger'}">${d.status}</span></td><td class="text-[11px] text-muted">${fmtDate(d.joinDate)}</td><td><div class="flex gap-1"><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5" onclick="openEditDealerModal(${d.id})" title="Edit"><i class="fas fa-pen"></i></button><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5 ${d.status==='active'?'text-danger':'text-emerald-400'}" onclick="toggleDealerStatus(${d.id})"><i class="fas fa-power-off"></i></button></div></td></tr>`}

function filterDealers(){const q=document.getElementById('dSearch').value.toLowerCase();document.getElementById('dTbody').innerHTML=dealers.filter(d=>d.name.toLowerCase().includes(q)||d.email.toLowerCase().includes(q)||d.city.toLowerCase().includes(q)).map(d=>dealerRow(d)).join('')}

function toggleDealerStatus(id){const d=getDealer(id);if(!d)return;d.status=d.status==='active'?'inactive':'active';addLog('Status Change',`${d.name} \u2192 ${d.status}`);addNotif('Dealer Status',`${d.name} is now ${d.status}`,d.status==='active'?'dealer':'warning');showToast(`Dealer ${d.name} is now ${d.status}`);DB.save();renderApp()}

function openAddDealerModal(){openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4">Add New Dealer</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Full Name *</label><input id="mName" class="input-field" placeholder="e.g. Ravi Verma"></div><div><label class="text-xs text-muted mb-1 block">Email *</label><input id="mEmail" class="input-field" placeholder="ravi@dealer.com"></div><div><label class="text-xs text-muted mb-1 block">Password *</label><input id="mPass" class="input-field" value="dealer123"></div><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-muted mb-1 block">Phone</label><input id="mPhone" class="input-field" placeholder="9876543210"></div><div><label class="text-xs text-muted mb-1 block">City</label><input id="mCity" class="input-field" placeholder="Mumbai"></div></div><div class="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-300"><i class="fas fa-info-circle mr-1"></i> Wallet auto-credited with ${fmt(settings.initialWallet)}</div></div><div class="flex gap-2 mt-5"><button class="btn btn-primary flex-1" onclick="addDealer()"><i class="fas fa-check"></i> Add Dealer</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

function addDealer(){const nm=document.getElementById('mName').value.trim();const em=document.getElementById('mEmail').value.trim();const pw=document.getElementById('mPass').value;const ph=document.getElementById('mPhone').value.trim();const ct=document.getElementById('mCity').value.trim();if(!nm||!em||!pw){showToast('Fill required fields','error');return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){showToast('Invalid email format','error');return}if(dealers.find(d=>d.email===em)){showToast('Email already exists','error');return}const nid=Math.max(0,...dealers.map(d=>d.id))+1;const today=new Date().toISOString().split('T')[0];const av=nm.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();dealers.push({id:nid,name:nm,email:em,password:pw,phone:ph||'\u2014',city:ct||'\u2014',wallet:settings.initialWallet,status:'active',joinDate:today,avatar:av});transactions.push({id:nextTxId++,dealerId:nid,type:'credit',amount:settings.initialWallet,desc:'Initial wallet credit',date:today});addLog('Dealer Added',`${nm} (${em})`);addNotif('New Dealer',`${nm} registered from ${ct||'\u2014'}`,'dealer');DB.save();closeModal();showToast(`Dealer ${nm} added with ${fmt(settings.initialWallet)} wallet`);renderApp()}

function openEditDealerModal(id){const d=getDealer(id);if(!d)return;openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4">Edit Dealer</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Full Name</label><input id="mName" class="input-field" value="${d.name}"></div><div><label class="text-xs text-muted mb-1 block">Email</label><input id="mEmail" class="input-field" value="${d.email}"></div><div><label class="text-xs text-muted mb-1 block">Phone</label><input id="mPhone" class="input-field" value="${d.phone}"></div><div><label class="text-xs text-muted mb-1 block">City</label><input id="mCity" class="input-field" value="${d.city}"></div><div><label class="text-xs text-muted mb-1 block">New Password (leave blank to keep)</label><input id="mPass" class="input-field" placeholder="New password"></div></div><div class="flex gap-2 mt-5"><button class="btn btn-primary flex-1" onclick="saveDealer(${id})"><i class="fas fa-check"></i> Save</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

function saveDealer(id){const d=getDealer(id);if(!d)return;d.name=document.getElementById('mName').value.trim()||d.name;const newEmail=document.getElementById('mEmail').value.trim();if(newEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))d.email=newEmail;d.phone=document.getElementById('mPhone').value.trim()||d.phone;d.city=document.getElementById('mCity').value.trim()||d.city;const np=document.getElementById('mPass').value;if(np&&np.length>=4)d.password=np;d.avatar=d.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();addLog('Dealer Updated',`${d.name} profile updated`);DB.save();closeModal();showToast('Dealer updated');renderApp()}

function exportDealersCSV(){const h=['ID','Name','Email','Phone','City','Wallet','Status','Join Date'];const r=dealers.map(d=>[d.id,d.name,d.email,d.phone,d.city,d.wallet,d.status,d.joinDate]);exportCSV(r,h,'dealers');showToast('Dealers CSV exported')}

// ======================================================
// PRODUCTS VIEW
// ======================================================
const catIcons={Grains:'fa-wheat-awn',Oils:'fa-droplet',Spices:'fa-mortar-pestle',Beverages:'fa-mug-hot',Sweeteners:'fa-candy-cane',Pulses:'fa-seedling',Dairy:'fa-cow',Fruits:'fa-apple-whole','Dry Fruits':'fa-almond'};
const catColors={Grains:'amber',Oils:'emerald',Spices:'rose',Beverages:'sky',Sweeteners:'purple',Pulses:'teal',Dairy:'yellow','Dry Fruits':'orange'};

function renderAdminProd(){return`<div class="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in"><div class="flex items-center gap-2"><input id="pSearch" class="input-field w-52" placeholder="Search products..." oninput="filterAdminProd()"><select id="pCatF" class="input-field w-36" onchange="filterAdminProd()"><option value="">All Categories</option>${[...new Set(products.map(p=>p.category))].map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="exportProductsCSV()"><i class="fas fa-file-csv"></i> Export</button><button class="btn btn-primary btn-sm" onclick="openAddProdModal()"><i class="fas fa-plus"></i> Add Product</button></div></div><div class="stat-card fade-in"><div class="overflow-x-auto"><table class="data-table"><thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody id="pTbody">${products.map(p=>adminProdRow(p)).join('')}</tbody></table></div></div>`}

function adminProdRow(p){return`<tr><td><img src="${prodImg(p)}" class="w-10 h-10 rounded-lg object-cover" alt="${p.name}" loading="lazy"></td><td><div class="font-medium text-xs">${p.name}</div><div class="text-[10px] text-muted">${p.desc}</div></td><td><span class="badge badge-info">${p.category}</span></td><td class="font-semibold text-accent text-xs">${fmt(p.price)}</td><td class="text-xs ${p.stock>50?'text-emerald-400':'text-red-400'}">${p.stock}</td><td><div class="flex gap-1"><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5" onclick="openEditProdModal(${p.id})"><i class="fas fa-pen"></i></button><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5 text-danger" onclick="deleteProd(${p.id})"><i class="fas fa-trash"></i></button></div></td></tr>`}

function filterAdminProd(){const q=document.getElementById('pSearch').value.toLowerCase();const c=document.getElementById('pCatF').value;document.getElementById('pTbody').innerHTML=products.filter(p=>(p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q))&&(!c||p.category===c)).map(p=>adminProdRow(p)).join('')}

function renderDealerProd(){return`<div class="flex flex-wrap items-center gap-2 mb-4 fade-in"><input id="dpSearch" class="input-field w-52" placeholder="Search products..." oninput="filterDProd()"><select id="dpCatF" class="input-field w-36" onchange="filterDProd()"><option value="">All Categories</option>${[...new Set(products.map(p=>p.category))].map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div><div id="dpGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 fade-in">${products.map(p=>prodCard(p)).join('')}</div>`}

function prodCard(p){const cc=catColors[p.category]||'slate';const ci=catIcons[p.category]||'fa-box';return`<div class="product-card"><div class="h-32 relative overflow-hidden"><img src="${prodImg(p)}" class="w-full h-full object-cover" alt="${p.name}" loading="lazy"><div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><span class="absolute top-2 right-2 badge badge-info">${p.category}</span><div class="absolute bottom-2 left-3"><div class="font-heading font-semibold text-fg text-sm">${p.name}</div><div class="text-[10px] text-gray-300">${p.desc}</div></div></div><div class="p-3"><div class="flex items-center justify-between"><span class="text-base font-bold text-accent">${fmt(p.price)}</span><button class="btn btn-success btn-sm" onclick="openOrderModal(${p.id})" ${p.stock===0?'disabled style="opacity:.4"':''}><i class="fas fa-cart-plus"></i> Order</button></div><div class="text-[10px] text-muted mt-1.5"><i class="fas fa-warehouse mr-1"></i>${p.stock} in stock</div></div></div>`}

function filterDProd(){const q=document.getElementById('dpSearch').value.toLowerCase();const c=document.getElementById('dpCatF').value;document.getElementById('dpGrid').innerHTML=products.filter(p=>(p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q))&&(!c||p.category===c)).map(p=>prodCard(p)).join('')}

function openAddProdModal(){openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4">Add Product</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Name *</label><input id="mPN" class="input-field" placeholder="Product name"></div><div><label class="text-xs text-muted mb-1 block">Description</label><input id="mPD" class="input-field" placeholder="Short description"></div><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-muted mb-1 block">Price (\u20B9) *</label><input id="mPP" type="number" class="input-field" placeholder="0"></div><div><label class="text-xs text-muted mb-1 block">Stock *</label><input id="mPS" type="number" class="input-field" placeholder="0"></div></div><div><label class="text-xs text-muted mb-1 block">Category</label><select id="mPC" class="input-field">${['Grains','Oils','Spices','Beverages','Sweeteners','Pulses','Dairy','Dry Fruits'].map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div></div><div class="flex gap-2 mt-5"><button class="btn btn-primary flex-1" onclick="addProd()"><i class="fas fa-check"></i> Add</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

function addProd(){const nm=document.getElementById('mPN').value.trim();const ds=document.getElementById('mPD').value.trim();const pr=parseInt(document.getElementById('mPP').value);const st=parseInt(document.getElementById('mPS').value);const ct=document.getElementById('mPC').value;if(!nm||!pr){showToast('Name and price required','error');return}const nid=Math.max(0,...products.map(p=>p.id))+1;products.push({id:nid,name:nm,desc:ds||'\u2014',price:pr,category:ct,stock:st||0,img:nm.toLowerCase().replace(/\s+/g,'').slice(0,8)});addLog('Product Added',nm);DB.save();closeModal();showToast(`"${nm}" added`);renderApp()}

function openEditProdModal(id){const p=getProduct(id);if(!p)return;openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4">Edit Product</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Name</label><input id="mPN" class="input-field" value="${p.name}"></div><div><label class="text-xs text-muted mb-1 block">Description</label><input id="mPD" class="input-field" value="${p.desc}"></div><div class="grid grid-cols-2 gap-3"><div><label class="text-xs text-muted mb-1 block">Price (\u20B9)</label><input id="mPP" type="number" class="input-field" value="${p.price}"></div><div><label class="text-xs text-muted mb-1 block">Stock</label><input id="mPS" type="number" class="input-field" value="${p.stock}"></div></div><div><label class="text-xs text-muted mb-1 block">Category</label><select id="mPC" class="input-field">${['Grains','Oils','Spices','Beverages','Sweeteners','Pulses','Dairy','Dry Fruits'].map(c=>`<option value="${c}" ${c===p.category?'selected':''}>${c}</option>`).join('')}</select></div></div><div class="flex gap-2 mt-5"><button class="btn btn-primary flex-1" onclick="saveProd(${id})"><i class="fas fa-check"></i> Save</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

function saveProd(id){const p=getProduct(id);if(!p)return;p.name=document.getElementById('mPN').value.trim()||p.name;p.desc=document.getElementById('mPD').value.trim()||p.desc;p.price=parseInt(document.getElementById('mPP').value)||p.price;p.stock=parseInt(document.getElementById('mPS').value)||0;p.category=document.getElementById('mPC').value;addLog('Product Updated',p.name);DB.save();closeModal();showToast('Product updated');renderApp()}

function deleteProd(id){const p=getProduct(id);if(!p)return;if(orders.some(o=>o.productId===id&&o.status!=='delivered')){showToast('Cannot delete: active orders exist for this product','error');return}openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-2">Delete Product</h3><p class="text-muted text-sm mb-5">Delete "${p.name}"? This cannot be undone.</p><div class="flex gap-2"><button class="btn btn-danger flex-1" onclick="confirmDelProd(${id})"><i class="fas fa-trash"></i> Delete</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}
function confirmDelProd(id){products=products.filter(p=>p.id!==id);addLog('Product Deleted',`ID #${id}`);DB.save();closeModal();showToast('Product deleted');renderApp()}

function exportProductsCSV(){const h=['ID','Name','Description','Price','Category','Stock'];const r=products.map(p=>[p.id,p.name,p.desc,p.price,p.category,p.stock]);exportCSV(r,h,'products');showToast('Products CSV exported')}

// ======================================================
// ORDER SYSTEM
// ======================================================
function openOrderModal(pid){const p=getProduct(pid);if(!p)return;const d=STATE.currentUser.data;openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4">Place Order</h3><div class="bg-card2 border border-border rounded-xl p-3 mb-4 flex gap-3"><img src="${prodImg(p)}" class="w-16 h-16 rounded-lg object-cover" alt="${p.name}"><div><div class="font-semibold text-fg text-sm">${p.name}</div><div class="text-xs text-muted">${p.desc}</div><div class="text-lg font-bold text-accent mt-1">${fmt(p.price)}</div></div></div><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Quantity</label><input id="mQty" type="number" class="input-field" value="1" min="1" max="${p.stock}" oninput="updateOT(${p.price})"></div><div class="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"><span class="text-xs text-amber-300 font-medium">Total</span><span id="mOT" class="text-lg font-bold text-accent">${fmt(p.price)}</span></div><div class="flex items-center justify-between text-xs"><span class="text-muted">Wallet Balance</span><span class="font-semibold text-fg">${fmt(d.wallet)}</span></div><div class="flex items-center justify-between text-xs"><span class="text-muted">Balance After</span><span id="mBA" class="font-semibold ${d.wallet>=p.price?'text-emerald-400':'text-red-400'}">${fmt(d.wallet-p.price)}</span></div></div><div class="flex gap-2 mt-5"><button class="btn btn-success flex-1" onclick="placeOrder(${p.id})" ${d.wallet<p.price?'disabled style="opacity:.4"':''}><i class="fas fa-check"></i> Confirm Order</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>${d.wallet<p.price?'<div class="mt-2 text-xs text-red-400 text-center"><i class="fas fa-exclamation-triangle mr-1"></i>Insufficient wallet balance</div>':''}`)}

function updateOT(price){const q=Math.max(1,parseInt(document.getElementById('mQty').value)||1);const t=price*q;const d=STATE.currentUser.data;document.getElementById('mOT').textContent=fmt(t);const a=d.wallet-t;const el=document.getElementById('mBA');el.textContent=fmt(a);el.className=`font-semibold text-xs ${a>=0?'text-emerald-400':'text-red-400'}`}

function placeOrder(pid){const p=getProduct(pid);const q=Math.max(1,parseInt(document.getElementById('mQty').value)||1);const t=p.price*q;const d=STATE.currentUser.data;if(d.wallet<t){showToast('Insufficient balance!','error');return}if(p.stock<q){showToast('Insufficient stock!','error');return}d.wallet-=t;p.stock-=q;const today=new Date().toISOString().split('T')[0];const oid=nextOrderId++;orders.push({id:oid,dealerId:d.id,productId:p.id,qty:q,total:t,date:today,status:'processing'});transactions.push({id:nextTxId++,dealerId:d.id,type:'debit',amount:t,desc:`Order #${oid} \u2014 ${p.name}${q>1?' x'+q:''}`,date:today});addLog('Order Placed',`#${oid} by ${d.name} \u2014 ${fmt(t)}`);addNotif('New Order',`Order #${oid} placed for ${fmt(t)}`,'order');DB.save();closeModal();showToast(`Order placed! ${fmt(t)} deducted. Balance: ${fmt(d.wallet)}`);renderApp()}

function renderAllOrders(){return`<div class="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in"><div class="flex gap-2"><select id="oStatF" class="input-field w-36" onchange="filterOrders()"><option value="">All Status</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select></div><button class="btn btn-ghost btn-sm" onclick="exportOrdersCSV()"><i class="fas fa-file-csv"></i> Export CSV</button></div><div class="stat-card fade-in"><div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Order</th><th>Dealer</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody id="oTbody">${[...orders].reverse().map(o=>orderRow(o)).join('')}</tbody></table></div></div>`}

function orderRow(o){const d=getDealer(o.dealerId);const p=getProduct(o.productId);return`<tr><td class="text-accent font-semibold">#${o.id}</td><td class="text-xs">${d?d.name:'\u2014'}</td><td class="text-xs">${p?p.name:'\u2014'}</td><td>${o.qty}</td><td class="font-semibold text-xs">${fmt(o.total)}</td><td class="text-[11px] text-muted">${fmtDate(o.date)}</td><td><span class="badge badge-${o.status==='delivered'?'success':o.status==='shipped'?'info':'warning'}">${o.status}</span></td><td class="flex gap-1"><select class="input-field text-[10px] py-0.5 px-1.5 w-24" onchange="updateOrderSt(${o.id},this.value)"><option value="processing" ${o.status==='processing'?'selected':''}>Processing</option><option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option><option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option></select><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5" onclick="genInvoice(${o.id})" title="Invoice"><i class="fas fa-file-invoice"></i></button></div></td></tr>`}

function filterOrders(){const s=document.getElementById('oStatF').value;const f=s?orders.filter(o=>o.status===s):orders;document.getElementById('oTbody').innerHTML=[...f].reverse().map(o=>orderRow(o)).join('')}

function updateOrderSt(oid,st){const o=orders.find(x=>x.id===oid);if(o){o.status=st;addLog('Order Status',`#${oid} \u2192 ${st}`);addNotif('Order Update',`Order #${oid} is now ${st}`,'order');DB.save();showToast(`Order #${oid} \u2192 ${st}`);renderApp()}}

function renderDealerOrders(){const d=STATE.currentUser.data;const mo=getDealerOrders(d.id);return`<div class="stat-card fade-in">${mo.length===0?'<div class="text-center py-10"><i class="fas fa-receipt text-3xl text-dimmed mb-2"></i><p class="text-muted text-sm">No orders yet</p></div>':`<div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Order</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>${[...mo].reverse().map(o=>{const p=getProduct(o.productId);return`<tr><td class="text-accent font-semibold">#${o.id}</td><td class="text-xs">${p?p.name:'\u2014'}</td><td>${o.qty}</td><td class="font-semibold text-xs">${fmt(o.total)}</td><td class="text-[11px] text-muted">${fmtDate(o.date)}</td><td><span class="badge badge-${o.status==='delivered'?'success':o.status==='shipped'?'info':'warning'}">${o.status}</span></td><td><button class="btn btn-ghost btn-sm text-[10px] py-0.5 px-1.5" onclick="genInvoice(${o.id})"><i class="fas fa-file-invoice"></i></button></td></tr>`}).join('')}</tbody></table></div>`}</div>`}

function genInvoice(oid){const o=orders.find(x=>x.id===oid);if(!o)return;const d=getDealer(o.dealerId);const p=getProduct(o.productId);const today=new Date();openModal(`<div class="invoice-print" id="invoicePrint"><div class="flex justify-between items-start mb-8"><div><h1 class="text-2xl font-bold text-gray-900">${settings.companyName}</h1><p class="text-gray-500 text-sm">Enterprise Dealer Management</p></div><div class="text-right"><h2 class="text-xl font-bold text-gray-900">INVOICE</h2><p class="text-gray-500 text-sm">#${o.id}</p><p class="text-gray-400 text-xs">${today.toLocaleDateString('en-IN')}</p></div></div><div class="grid grid-cols-2 gap-8 mb-8"><div><h3 class="font-semibold text-gray-700 text-sm mb-1">Bill To</h3><p class="text-sm">${d?d.name:'\u2014'}</p><p class="text-xs text-gray-500">${d?d.city:'\u2014'}</p><p class="text-xs text-gray-500">${d?d.email:'\u2014'}</p></div><div class="text-right"><h3 class="font-semibold text-gray-700 text-sm mb-1">Order Info</h3><p class="text-xs text-gray-500">Date: ${fmtDate(o.date)}</p><p class="text-xs text-gray-500">Status: ${o.status.toUpperCase()}</p></div></div><table class="w-full text-sm mb-8"><thead><tr class="border-b-2 border-gray-200"><th class="text-left py-2 font-semibold text-gray-700">Item</th><th class="text-center py-2 font-semibold text-gray-700">Qty</th><th class="text-right py-2 font-semibold text-gray-700">Price</th><th class="text-right py-2 font-semibold text-gray-700">Total</th></tr></thead><tbody><tr class="border-b border-gray-100"><td class="py-2">${p?p.name:'\u2014'}</td><td class="text-center py-2">${o.qty}</td><td class="text-right py-2">${fmt(p?p.price:0)}</td><td class="text-right py-2 font-semibold">${fmt(o.total)}</td></tr></tbody></table><div class="flex justify-between items-center border-t-2 border-gray-200 pt-4"><span class="font-bold text-lg">Total</span><span class="font-bold text-lg text-amber-600">${fmt(o.total)}</span></div><p class="text-xs text-gray-400 mt-6 text-center">Thank you for your business. \u2014 ${settings.companyName}</p></div><div class="flex gap-2 mt-4 no-print"><button class="btn btn-primary flex-1" onclick="window.print()"><i class="fas fa-print"></i> Print Invoice</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Close</button></div>`)}

function exportOrdersCSV(){const h=['Order ID','Dealer','Product','Qty','Total','Date','Status'];const r=orders.map(o=>{const d=getDealer(o.dealerId);const p=getProduct(o.productId);return[o.id,d?d.name:'',p?p.name:'',o.qty,o.total,o.date,o.status]});exportCSV(r,h,'orders');showToast('Orders CSV exported')}

// ======================================================
// WALLET
// ======================================================
function renderDealerWallet(){const d=STATE.currentUser.data;const tx=getDealerTx(d.id);const tc=tx.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);const td=tx.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);return`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 fade-in"><div class="stat-card"><div class="glow bg-amber-500"></div><div class="text-xs text-muted mb-1">Current Balance</div><div class="text-3xl font-heading font-bold text-accent">${fmt(d.wallet)}</div></div><div class="stat-card"><div class="glow bg-emerald-500"></div><div class="text-xs text-muted mb-1">Total Credited</div><div class="text-2xl font-heading font-bold text-emerald-400">${fmt(tc)}</div></div><div class="stat-card"><div class="glow bg-red-500"></div><div class="text-xs text-muted mb-1">Total Debited</div><div class="text-2xl font-heading font-bold text-red-400">${fmt(td)}</div></div></div><div class="stat-card fade-in"><div class="flex items-center justify-between mb-3"><h3 class="font-heading font-semibold text-fg text-sm">Transaction History</h3><button class="btn btn-ghost btn-sm" onclick="exportTxCSV(${d.id})"><i class="fas fa-file-csv"></i> Export</button></div>${tx.length===0?'<p class="text-muted text-xs">No transactions.</p>':`<div class="space-y-1">${[...tx].reverse().map(t=>`<div class="flex items-center justify-between py-2.5 border-b border-border/30"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl ${t.type==='credit'?'bg-emerald-500/10':'bg-red-500/10'} flex items-center justify-center"><i class="fas fa-arrow-${t.type==='credit'?'down text-emerald-400':'up text-red-400'} text-xs"></i></div><div><div class="text-xs text-fg">${t.desc}</div><div class="text-[10px] text-muted">${fmtDate(t.date)}</div></div></div><span class="font-bold text-xs ${t.type==='credit'?'text-emerald-400':'text-red-400'}">${t.type==='credit'?'+':'\u2212'}${fmt(t.amount)}</span></div>`).join('')}</div>`}</div>`}

function renderWalletMgmt(){return`<div class="grid grid-cols-1 xl:grid-cols-3 gap-4 fade-in"><div class="xl:col-span-1"><div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Credit / Debit Wallet</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Select Dealer</label><select id="wmD" class="input-field" onchange="showWmBal()"><option value="">Choose dealer...</option>${dealers.map(d=>`<option value="${d.id}">${d.name} (${fmt(d.wallet)})</option>`).join('')}</select></div><div id="wmBD" class="hidden bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center"><div class="text-[10px] text-amber-300">Current Balance</div><div id="wmCB" class="text-xl font-bold text-accent"></div></div><div><label class="text-xs text-muted mb-1 block">Action</label><select id="wmA" class="input-field"><option value="credit">Credit (Add)</option><option value="debit">Debit (Deduct)</option></select></div><div><label class="text-xs text-muted mb-1 block">Amount (\u20B9)</label><input id="wmAm" type="number" class="input-field" placeholder="Enter amount"></div><div><label class="text-xs text-muted mb-1 block">Description</label><input id="wmDe" class="input-field" placeholder="Reason"></div><button class="btn btn-primary w-full justify-center" onclick="processWM()"><i class="fas fa-check"></i> Process</button></div></div></div><div class="xl:col-span-2"><div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Dealer Wallet Overview</h3><div class="overflow-x-auto"><table class="data-table"><thead><tr><th>Dealer</th><th>City</th><th>Balance</th><th>Orders</th><th>Spent</th></tr></thead><tbody>${dealers.map(d=>{const o2=getDealerOrders(d.id);const sp=getDealerTx(d.id).filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);return`<tr><td><div class="flex items-center gap-2"><div class="w-6 h-6 rounded-full ${d.status==='active'?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'} flex items-center justify-center text-[9px] font-bold">${d.avatar||d.name[0]}</div><span class="font-medium text-xs">${d.name}</span></div></td><td class="text-xs">${d.city}</td><td class="font-bold text-accent text-xs">${fmt(d.wallet)}</td><td class="text-xs">${o2.length}</td><td class="text-red-400 text-xs">${fmt(sp)}</td></tr>`}).join('')}</tbody></table></div></div></div></div>`}

function showWmBal(){const did=parseInt(document.getElementById('wmD').value);const dis=document.getElementById('wmBD');if(!did){dis.classList.add('hidden');return}const d=getDealer(did);dis.classList.remove('hidden');document.getElementById('wmCB').textContent=fmt(d.wallet)}
function processWM(){const did=parseInt(document.getElementById('wmD').value);const act=document.getElementById('wmA').value;const am=parseInt(document.getElementById('wmAm').value);const de=document.getElementById('wmDe').value.trim();if(!did){showToast('Select a dealer','error');return}if(!am||am<=0){showToast('Enter valid amount','error');return}const d=getDealer(did);if(act==='debit'&&d.wallet<am){showToast('Insufficient balance','error');return}d.wallet+=act==='credit'?am:-am;const today=new Date().toISOString().split('T')[0];transactions.push({id:nextTxId++,dealerId:did,type:act,amount:am,desc:de||`Admin ${act}`,date:today});addLog('Wallet Transaction',`${act} ${fmt(am)} for ${d.name}`);addNotif('Wallet Update',`${fmt(am)} ${act}ed for ${d.name}`,'wallet');DB.save();showToast(`${act==='credit'?'Credited':'Debited'} ${fmt(am)}`);renderApp()}
function exportTxCSV(did){const tx=getDealerTx(did);const h=['ID','Type','Amount','Description','Date'];const r=tx.map(t=>[t.id,t.type,t.amount,t.desc,t.date]);exportCSV(r,h,'transactions');showToast('Transactions CSV exported')}

// ======================================================
// ANALYTICS
// ======================================================
function renderAnalytics(){
  return`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-in">
  <div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Monthly Revenue</h3><div class="chart-container"><canvas id="revChart"></canvas></div></div>
  <div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Orders by Status</h3><div class="chart-container"><canvas id="statusChart"></canvas></div></div>
  <div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Dealer Wallet Distribution</h3><div class="chart-container"><canvas id="walletChart"></canvas></div></div>
  <div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3">Category Sales</h3><div class="chart-container"><canvas id="catChart"></canvas></div></div>
  </div>`;
}

function initCharts(){
  if (typeof Chart === 'undefined') return;
  // Revenue Chart
  const rc=document.getElementById('revChart');if(rc){
  const months=['Jan','Feb','Mar','Apr','May','Jun'];
  const revData=months.map(()=>Math.floor(Math.random()*30000)+5000);
  new Chart(rc,{type:'bar',data:{labels:months,datasets:[{label:'Revenue (\u20B9)',data:revData,backgroundColor:'rgba(232,160,32,0.6)',borderColor:'#E8A020',borderWidth:1,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#172030'},ticks:{color:'#6B7F96',font:{size:10}}},y:{grid:{color:'#172030'},ticks:{color:'#6B7F96',font:{size:10},callback:v=>'\u20B9'+v.toLocaleString()}}}}});}

  // Status Chart
  const sc=document.getElementById('statusChart');if(sc){
  const statuses=['processing','shipped','delivered'];const scData=statuses.map(s=>orders.filter(o=>o.status===s).length);
  new Chart(sc,{type:'doughnut',data:{labels:statuses.map(s=>s.charAt(0).toUpperCase()+s.slice(1)),datasets:[{data:scData,backgroundColor:['#E8A020','#3B82F6','#10B981'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#6B7F96',font:{size:11},padding:15}}}}});}

  // Wallet Chart
  const wc=document.getElementById('walletChart');if(wc){
  new Chart(wc,{type:'bar',data:{labels:dealers.slice(0,8).map(d=>d.name.split(' ')[0]),datasets:[{label:'Balance',data:dealers.slice(0,8).map(d=>d.wallet),backgroundColor:'rgba(16,185,129,0.5)',borderColor:'#10B981',borderWidth:1,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:'#172030'},ticks:{color:'#6B7F96',font:{size:10},callback:v=>'\u20B9'+v.toLocaleString()}},y:{grid:{display:false},ticks:{color:'#6B7F96',font:{size:10}}}}}});}

  // Category Sales
  const cc=document.getElementById('catChart');if(cc){
  const cats=[...new Set(products.map(p=>p.category))];const catSales=cats.map(c=>{const pids=products.filter(p=>p.category===c).map(p=>p.id);return orders.filter(o=>pids.includes(o.productId)).reduce((s,o)=>s+o.total,0)||Math.floor(Math.random()*5000)+500});
  new Chart(cc,{type:'polarArea',data:{labels:cats,datasets:[{data:catSales,backgroundColor:['rgba(232,160,32,0.5)','rgba(16,185,129,0.5)','rgba(244,63,94,0.5)','rgba(59,130,246,0.5)','rgba(168,85,247,0.5)','rgba(20,184,166,0.5)','rgba(234,179,8,0.5)','rgba(249,115,22,0.5)'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#6B7F96',font:{size:10},padding:10}}}}});}
}

// ======================================================
// SOCIAL AUTOMATION
// ======================================================
function renderSocial(){return`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-in">
<div class="stat-card"><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2.5"><div class="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center"><i class="fab fa-facebook text-blue-400"></i></div><div><h3 class="font-heading font-semibold text-fg text-sm">Facebook Auto-Post</h3><p class="text-[10px] text-muted">Publish to 100 groups</p></div></div><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${STATE.fbConnected?'bg-emerald-400 pulse-dot':'bg-red-400'}"></span><span class="text-[10px] ${STATE.fbConnected?'text-emerald-400':'text-red-400'}">${STATE.fbConnected?'Connected':'Disconnected'}</span></div></div>
 ${!STATE.fbConnected?`<div class="text-center py-8"><i class="fab fa-facebook text-4xl text-blue-500/20 mb-3"></i><p class="text-muted text-xs mb-3">Connect your Facebook account</p><button class="btn btn-primary btn-sm" onclick="connectFb()"><i class="fab fa-facebook"></i> Connect Facebook</button></div>`:`
<div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Post Content *</label><textarea id="fbPC" class="input-field" style="height:70px" placeholder="Write your post..."></textarea></div><div><label class="text-xs text-muted mb-1 block">Image URL (optional)</label><input id="fbPI" class="input-field" placeholder="https://example.com/image.jpg"></div><div><label class="text-xs text-muted mb-1 block">Post Schedule</label><select id="fbSchedule" class="input-field"><option value="now">Post Now</option><option value="1h">After 1 Hour</option><option value="6h">After 6 Hours</option><option value="24h">After 24 Hours</option></select></div><div class="flex items-center justify-between bg-card2 border border-border rounded-xl p-2.5"><div class="text-xs"><span class="text-muted">Groups:</span> <span id="fbSC" class="text-accent font-bold">${fbGroups.filter(g=>g.selected).length}</span><span class="text-muted">/100</span></div><button class="btn btn-success btn-sm" onclick="publishFb()" ${STATE.fbPostingActive?'disabled style="opacity:.4"':''}><i class="fas fa-paper-plane"></i> Publish</button></div>
 ${STATE.fbPostingActive?`<div><div class="flex items-center justify-between text-[10px] mb-1"><span class="text-muted">Posting...</span><span id="fbPT" class="text-accent">0%</span></div><div class="progress-bar"><div id="fbPB" class="progress-fill bg-gradient-to-r from-amber-500 to-emerald-500" style="width:0%"></div></div></div>`:''}
<div><div class="flex items-center justify-between mb-1.5"><label class="text-xs font-medium text-fg">Select Groups</label><div class="flex gap-2"><button class="text-[10px] text-accent hover:underline" onclick="selAllG(true)">All</button><span class="text-dimmed">|</span><button class="text-[10px] text-muted hover:underline" onclick="selAllG(false)">None</button></div></div><input id="fbGS" class="input-field text-[11px] mb-1.5" placeholder="Search groups..." oninput="filterFbG()"><div class="max-h-52 overflow-y-auto space-y-0.5" id="fbGL">${fbGroups.map(g=>`<label class="fb-group-item"><input type="checkbox" ${g.selected?'checked':''} onchange="togFbG(${g.id})"><div class="flex-1 min-w-0"><div class="text-[11px] text-fg truncate">${g.name}</div><div class="text-[9px] text-muted">${g.members.toLocaleString()} members</div></div></label>`).join('')}</div></div>
 ${fbPostLog.length>0?`<div><label class="text-xs font-medium text-fg mb-1.5 block">Post History</label><div class="space-y-1.5 max-h-40 overflow-y-auto">${fbPostLog.slice(0,8).map(p=>`<div class="bg-card2 border border-border rounded-lg p-2"><div class="text-[11px] text-fg">${p.content.substring(0,60)}${p.content.length>60?'...':''}</div><div class="flex items-center justify-between mt-1"><span class="text-[9px] text-muted">${fmtDate(p.date)} \u00B7 ${p.groupCount} groups</span><span class="badge badge-${p.status==='completed'?'success':'warning'}">${p.status}</span></div></div>`).join('')}</div></div>`:''}
</div>`}</div>

<div class="stat-card"><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2.5"><div class="w-9 h-9 rounded-xl bg-pink-600/20 flex items-center justify-center"><i class="fab fa-instagram text-pink-400"></i></div><div><h3 class="font-heading font-semibold text-fg text-sm">Instagram Auto-Like</h3><p class="text-[10px] text-muted">Auto-like followers' posts</p></div></div><div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${STATE.igConnected?'bg-emerald-400 pulse-dot':'bg-red-400'}"></span><span class="text-[10px] ${STATE.igConnected?'text-emerald-400':'text-red-400'}">${STATE.igConnected?'Connected':'Disconnected'}</span></div></div>
 ${!STATE.igConnected?`<div class="text-center py-8"><i class="fab fa-instagram text-4xl text-pink-500/20 mb-3"></i><p class="text-muted text-xs mb-3">Connect your Instagram account</p><button class="btn btn-primary btn-sm" onclick="connectIg()"><i class="fab fa-instagram"></i> Connect Instagram</button></div>`:`
<div class="space-y-3"><div class="flex items-center justify-between bg-card2 border border-border rounded-xl p-3"><div><div class="text-xs font-semibold text-fg">Auto-Like Master</div><div class="text-[10px] text-muted">Like new posts from selected followers</div></div><label class="toggle"><input type="checkbox" ${STATE.igAutoLikeMaster?'checked':''} onchange="togIgM(this.checked)"><span class="toggle-slider"></span></label></div><div class="flex items-center justify-between text-xs"><span class="text-muted">Auto-like enabled</span><span class="text-accent font-bold">${igFollowers.filter(f=>f.autoLike).length}/${igFollowers.length}</span></div><input id="igS" class="input-field text-[11px]" placeholder="Search followers..." oninput="filterIgF()"><div class="max-h-60 overflow-y-auto space-y-0.5" id="igFL">${igFollowers.map(f=>`<div class="follower-row"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-300 text-[10px] font-bold">${f.username[0].toUpperCase()}</div><div><div class="text-[11px] font-medium text-fg">${f.username}</div><div class="text-[9px] text-muted">${f.posts} posts</div></div></div><div class="flex items-center gap-2">${f.lastLiked?`<span class="text-[9px] text-emerald-400"><i class="fas fa-heart mr-0.5"></i>${f.lastLiked}</span>`:''}<label class="toggle"><input type="checkbox" ${f.autoLike?'checked':''} onchange="togIgAL(${f.id})"><span class="toggle-slider"></span></label></div></div>`).join('')}</div>
 ${igLikeLog.length>0?`<div><label class="text-xs font-medium text-fg mb-1 block">Recent Likes</label><div class="space-y-1 max-h-36 overflow-y-auto">${igLikeLog.slice(-10).reverse().map(l=>`<div class="flex items-center gap-1.5 text-[10px] py-0.5"><i class="fas fa-heart text-pink-400"></i><span class="text-fg">Liked</span><span class="text-accent font-medium">@${l.username}</span><span class="text-muted">\u2014 ${l.time}</span></div>`).join('')}</div></div>`:''}
<button class="btn btn-ghost w-full justify-center text-[11px]" onclick="simIgLikes()"><i class="fas fa-play"></i> Run Auto-Like Cycle</button></div>`}</div></div>`}

// FB/IG connection with OAuth simulation
function connectFb(){openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4"><i class="fab fa-facebook text-blue-400 mr-2"></i>Facebook Login</h3><div class="bg-card2 border border-border rounded-xl p-4 mb-4"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center"><i class="fab fa-facebook text-blue-400 text-lg"></i></div><div><div class="text-sm font-semibold text-fg">DealerHub Pro</div><div class="text-[10px] text-muted">wants to access your Facebook account</div></div></div><p class="text-xs text-muted mb-3">This app will be able to:</p><div class="space-y-1.5"><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">Manage your Pages and publish content</span></div><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">Access group member info and post content</span></div><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">Read your profile info and friend list</span></div></div></div><div class="flex items-center gap-2 mb-4"><input id="fbEmail" class="input-field" placeholder="Facebook Email" value="dealer@company.com"><input id="fbPass" class="input-field" placeholder="Password" type="password" value="demo1234"></div><div class="flex gap-2"><button class="btn btn-primary flex-1" onclick="confirmFbConnect()"><i class="fab fa-facebook"></i> Continue as Dealer</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

function confirmFbConnect(){showToast('Connecting to Facebook...','info');closeModal();setTimeout(()=>{STATE.fbConnected=true;addLog('Facebook Connected','OAuth authorized');addNotif('Social','Facebook account connected','social');DB.save();showToast('Facebook connected!');renderApp()},1200)}
function connectIg(){openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-4"><i class="fab fa-instagram text-pink-400 mr-2"></i>Instagram Login</h3><div class="bg-card2 border border-border rounded-xl p-4 mb-4"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center"><i class="fab fa-instagram text-pink-400 text-lg"></i></div><div><div class="text-sm font-semibold text-fg">DealerHub Pro</div><div class="text-[10px] text-muted">wants to access your Instagram account</div></div></div><p class="text-xs text-muted mb-3">This app will be able to:</p><div class="space-y-1.5"><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">Read your profile and followers</span></div><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">Like media on your behalf</span></div><div class="oauth-scope"><i class="fas fa-check"></i><span class="text-fg text-xs">View your content and stories</span></div></div></div><div class="flex items-center gap-2 mb-4"><input id="igUser" class="input-field" placeholder="Instagram Username" value="dealer_official"><input id="igPass" class="input-field" placeholder="Password" type="password" value="demo1234"></div><div class="flex gap-2"><button class="btn btn-primary flex-1" onclick="confirmIgConnect()"><i class="fab fa-instagram"></i> Continue</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}
function confirmIgConnect(){showToast('Connecting to Instagram...','info');closeModal();setTimeout(()=>{STATE.igConnected=true;addLog('Instagram Connected','OAuth authorized');addNotif('Social','Instagram account connected','social');DB.save();showToast('Instagram connected!');renderApp()},1200)}

function togFbG(id){const g=fbGroups.find(x=>x.id===id);if(g)g.selected=!g.selected;const el=document.getElementById('fbSC');if(el)el.textContent=fbGroups.filter(g=>g.selected).length;DB.save()}
function selAllG(v){fbGroups.forEach(g=>g.selected=v);document.getElementById('fbSC').textContent=fbGroups.filter(g=>g.selected).length;document.getElementById('fbGL').innerHTML=fbGroups.map(g=>`<label class="fb-group-item"><input type="checkbox" ${g.selected?'checked':''} onchange="togFbG(${g.id})"><div class="flex-1 min-w-0"><div class="text-[11px] text-fg truncate">${g.name}</div><div class="text-[9px] text-muted">${g.members.toLocaleString()} members</div></div></label>`).join('');DB.save()}
function filterFbG(){const q=document.getElementById('fbGS').value.toLowerCase();document.getElementById('fbGL').innerHTML=fbGroups.filter(g=>g.name.toLowerCase().includes(q)).map(g=>`<label class="fb-group-item"><input type="checkbox" ${g.selected?'checked':''} onchange="togFbG(${g.id})"><div class="flex-1 min-w-0"><div class="text-[11px] text-fg truncate">${g.name}</div><div class="text-[9px] text-muted">${g.members.toLocaleString()} members</div></div></label>`).join('')}

function publishFb(){const c=document.getElementById('fbPC').value.trim();if(!c){showToast('Write post content','error');return}const sg=fbGroups.filter(g=>g.selected);if(!sg.length){showToast('Select at least 1 group','error');return}STATE.fbPostingActive=true;const gc=sg.length;renderApp();document.getElementById('fbPC').value=c;let pr=0;const iv=setInterval(()=>{pr+=Math.floor(Math.random()*6)+2;if(pr>100)pr=100;const b=document.getElementById('fbPB');const t=document.getElementById('fbPT');if(b)b.style.width=pr+'%';if(t)t.textContent=pr+'%';if(pr>=100){clearInterval(iv);STATE.fbPostingActive=false;fbPostLog.unshift({content:c,groupCount:gc,date:new Date().toISOString().split('T')[0],status:'completed'});addLog('FB Post',`Published to ${gc} groups`);addNotif('Social',`Post published to ${gc} Facebook groups`,'social');DB.save();showToast(`Published to ${gc} groups!`);renderApp()}},180)}

function togIgM(v){STATE.igAutoLikeMaster=v;showToast(`Auto-like ${v?'enabled':'disabled'}`);if(v)simIgLikes()}
function togIgAL(id){const f=igFollowers.find(x=>x.id===id);if(f)f.autoLike=!f.autoLike;DB.save()}
function filterIgF(){const q=document.getElementById('igS').value.toLowerCase();document.getElementById('igFL').innerHTML=igFollowers.filter(f=>f.username.toLowerCase().includes(q)||f.fullName.toLowerCase().includes(q)).map(f=>`<div class="follower-row"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-300 text-[10px] font-bold">${f.username[0].toUpperCase()}</div><div><div class="text-[11px] font-medium text-fg">${f.username}</div><div class="text-[9px] text-muted">${f.posts} posts</div></div></div><div class="flex items-center gap-2">${f.lastLiked?`<span class="text-[9px] text-emerald-400"><i class="fas fa-heart mr-0.5"></i>${f.lastLiked}</span>`:''}<label class="toggle"><input type="checkbox" ${f.autoLike?'checked':''} onchange="togIgAL(${f.id})"><span class="toggle-slider"></span></label></div></div>`).join('')}
function simIgLikes(){if(!STATE.igAutoLikeMaster){showToast('Enable master switch first','error');return}const al=igFollowers.filter(f=>f.autoLike);if(!al.length){showToast('Select followers first','error');return}showToast(`Auto-liking ${al.length} followers...`,'info');let i=0;const iv=setInterval(()=>{if(i>=Math.min(al.length,8)){clearInterval(iv);addLog('IG Auto-Like',`Liked ${Math.min(al.length,8)} posts`);addNotif('Social','Instagram auto-like cycle completed','social');DB.save();showToast('Auto-like cycle done!');renderApp();return}const f=al[i];const now=new Date();const ts=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');igLikeLog.push({username:f.username,time:ts});f.lastLiked='Just now';i++},500)}

// ======================================================
// ACTIVITY LOG
// ======================================================
function renderActivityLog(){return`<div class="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in"><input id="alSearch" class="input-field w-56" placeholder="Search activity..." oninput="filterAL()"><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="exportActivityCSV()"><i class="fas fa-file-csv"></i> Export</button><button class="btn btn-ghost btn-sm text-danger" onclick="clearAL()"><i class="fas fa-trash"></i> Clear</button></div></div><div class="stat-card fade-in"><div class="space-y-1" id="alList">${activityLog.length===0?'<p class="text-muted text-xs text-center py-6">No activity recorded</p>':activityLog.slice(0,50).map(a=>`<div class="flex items-center gap-3 py-2 border-b border-border/30"><div class="w-7 h-7 rounded-lg ${a.action.includes('Login')?'bg-emerald-500/10 text-emerald-400':a.action.includes('Order')?'bg-amber-500/10 text-amber-400':a.action.includes('Wallet')?'bg-purple-500/10 text-purple-400':a.action.includes('Product')?'bg-sky-500/10 text-sky-400':a.action.includes('Social')?'bg-pink-500/10 text-pink-400':'bg-gray-500/10 text-gray-400'} flex items-center justify-center flex-shrink-0"><i class="fas fa-${a.action.includes('Login')?'sign-in-alt':a.action.includes('Order')?'shopping-cart':a.action.includes('Wallet')?'wallet':a.action.includes('Product')?'box':a.action.includes('Social')?'share-nodes':'clock'} text-[9px]"></i></div><div class="flex-1 min-w-0"><div class="text-xs text-fg"><span class="font-semibold">${a.action}</span> \u2014 ${a.detail}</div><div class="text-[10px] text-muted">${a.user} \u00B7 ${fmtDateTime(a.date)}</div></div></div>`).join('')}</div></div>`}
function filterAL(){const q=document.getElementById('alSearch').value.toLowerCase();const f=activityLog.filter(a=>a.action.toLowerCase().includes(q)||a.detail.toLowerCase().includes(q)||a.user.toLowerCase().includes(q));document.getElementById('alList').innerHTML=f.slice(0,50).map(a=>`<div class="flex items-center gap-3 py-2 border-b border-border/30"><div class="w-7 h-7 rounded-lg bg-gray-500/10 text-gray-400 flex items-center justify-center flex-shrink-0"><i class="fas fa-clock text-[9px]"></i></div><div class="flex-1 min-w-0"><div class="text-xs text-fg"><span class="font-semibold">${a.action}</span> \u2014 ${a.detail}</div><div class="text-[10px] text-muted">${a.user} \u00B7 ${fmtDateTime(a.date)}</div></div></div>`).join('')||'<p class="text-muted text-xs text-center py-6">No results</p>'}
function clearAL(){activityLog=[];DB.save();showToast('Activity log cleared');renderApp()}
function exportActivityCSV(){const h=['Date','User','Action','Detail'];const r=activityLog.map(a=>[a.date,a.user,a.action,a.detail]);exportCSV(r,h,'activity_log');showToast('Activity log exported')}

// ======================================================
// SETTINGS
// ======================================================
function renderSettings(){const isA=STATE.currentUser.type==='admin';const u=STATE.currentUser.data;
return`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-in">
<div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3"><i class="fas fa-user mr-1.5"></i>Profile</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Name</label><input id="sName" class="input-field" value="${u.name}"></div><div><label class="text-xs text-muted mb-1 block">Email</label><input id="sEmail" class="input-field" value="${u.email}" disabled></div><div><label class="text-xs text-muted mb-1 block">Phone</label><input id="sPhone" class="input-field" value="${isA?'\u2014':u.phone||''}"></div><button class="btn btn-primary w-full justify-center" onclick="saveProfile()"><i class="fas fa-check"></i> Save Profile</button></div></div>
<div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3"><i class="fas fa-lock mr-1.5"></i>Change Password</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Current Password</label><input id="sCurP" type="password" class="input-field" placeholder="Enter current password"></div><div><label class="text-xs text-muted mb-1 block">New Password</label><input id="sNewP" type="password" class="input-field" placeholder="Enter new password"></div><div><label class="text-xs text-muted mb-1 block">Confirm Password</label><input id="sConP" type="password" class="input-field" placeholder="Confirm new password"></div><button class="btn btn-primary w-full justify-center" onclick="changePassword()"><i class="fas fa-key"></i> Change Password</button></div></div>
 ${isA?`<div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3"><i class="fas fa-building mr-1.5"></i>Company Settings</h3><div class="space-y-3"><div><label class="text-xs text-muted mb-1 block">Company Name</label><input id="sComp" class="input-field" value="${settings.companyName}"></div><div><label class="text-xs text-muted mb-1 block">Initial Wallet (\u20B9)</label><input id="sInitW" type="number" class="input-field" value="${settings.initialWallet}"></div><button class="btn btn-primary w-full justify-center" onclick="saveSettings()"><i class="fas fa-check"></i> Save Settings</button></div></div>
<div class="stat-card"><h3 class="font-heading font-semibold text-fg text-sm mb-3"><i class="fas fa-database mr-1.5"></i>Data Management</h3><div class="space-y-3"><button class="btn btn-ghost w-full justify-center" onclick="DB.exportJSON()"><i class="fas fa-download"></i> Export Full Backup (JSON)</button><div><label class="btn btn-ghost w-full justify-center cursor-pointer"><i class="fas fa-upload"></i> Import Backup (JSON)<input type="file" accept=".json" class="hidden" onchange="DB.importJSON(this.files[0])"></label></div><button class="btn btn-danger w-full justify-center" onclick="confirmReset()"><i class="fas fa-trash"></i> Reset All Data</button><div class="text-[10px] text-muted text-center">Data is auto-saved to browser localStorage</div></div></div>`:''}
</div>`}

function saveProfile(){const u=STATE.currentUser.data;const nm=document.getElementById('sName').value.trim();if(nm)u.name=nm;if(!STATE.currentUser.type==='admin'&&document.getElementById('sPhone'))u.phone=document.getElementById('sPhone').value.trim();u.avatar=u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();addLog('Profile Updated',u.name);DB.save();showToast('Profile saved');renderApp()}

function changePassword(){const cur=document.getElementById('sCurP').value;const np=document.getElementById('sNewP').value;const cp=document.getElementById('sConP').value;if(!cur||!np){showToast('Fill all fields','error');return}if(STATE.currentUser.type==='admin'){if(cur!=='admin123'){showToast('Current password incorrect','error');return}}else{if(cur!==STATE.currentUser.data.password){showToast('Current password incorrect','error');return}}if(np.length<4){showToast('Password must be at least 4 characters','error');return}if(np!==cp){showToast('Passwords do not match','error');return}if(STATE.currentUser.type==='admin'){showToast('Admin password changed (demo: will reset on reload)')}else{STATE.currentUser.data.password=np;addLog('Password Changed',STATE.currentUser.data.name);DB.save();showToast('Password changed successfully')}document.getElementById('sCurP').value='';document.getElementById('sNewP').value='';document.getElementById('sConP').value=''}

function saveSettings(){settings.companyName=document.getElementById('sComp').value.trim()||settings.companyName;settings.initialWallet=parseInt(document.getElementById('sInitW').value)||5000;addLog('Settings Updated','Company settings changed');DB.save();showToast('Settings saved');renderApp()}

function confirmReset(){openModal(`<h3 class="font-heading text-lg font-bold text-fg mb-2">Reset All Data</h3><p class="text-muted text-sm mb-5">This will erase ALL data and reset to defaults. This cannot be undone.</p><div class="flex gap-2"><button class="btn btn-danger flex-1" onclick="DB.reset()"><i class="fas fa-trash"></i> Reset Everything</button><button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button></div>`)}

// ======================================================
// CHART INIT HOOK (called after render)
// ======================================================
const origRenderApp = renderApp;
renderApp = function(){
  origRenderApp();
  if(STATE.currentView==='dashboard'&&STATE.currentUser?.type==='admin'){setTimeout(initCharts,100)}
  if(STATE.currentView==='analytics'){setTimeout(initCharts,100)}
};

// ======================================================
// INIT
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    DB.load();
    document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!STATE.currentUser)handleLogin()});
    // Close notif dropdown on outside click
    document.addEventListener('click',e=>{const dd=document.getElementById('notifDropdown');if(dd&&dd.classList.contains('open')&&!e.target.closest('.relative'))dd.classList.remove('open')});
});
