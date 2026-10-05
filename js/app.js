const DB={users:"fr_users",donations:"fr_donations",claims:"fr_claims",current:"fr_current"};
function ensureAdmin(){
  const users=getUsers();
  if(!users.some(u=>u.email==="admin@foodrescue.com")){
    users.push({id:"ADMIN001",name:"System Administrator",email:"admin@foodrescue.com",password:"admin123",role:"admin",area:"All Areas",createdAt:new Date().toISOString()});
    localStorage.setItem(DB.users,JSON.stringify(users));
  }
}
ensureAdmin();
function getUsers(){return JSON.parse(localStorage.getItem(DB.users)||"[]")}
function getDonations(){return JSON.parse(localStorage.getItem(DB.donations)||"[]")}
function getClaims(){return JSON.parse(localStorage.getItem(DB.claims)||"[]")}
function saveDonations(x){localStorage.setItem(DB.donations,JSON.stringify(x))}
function saveClaims(x){localStorage.setItem(DB.claims,JSON.stringify(x))}
function currentUser(){let id=localStorage.getItem(DB.current);return getUsers().find(u=>u.id===id)}
function requireLogin(){
  ensureAdmin();
  const u=currentUser();
  if(!u){location.href="login.html";return null}
  return u;
}
function requireAdmin(){
  const u=requireLogin();
  if(!u)return null;
  if(u.role!=="admin"){toast("Admin access required.");setTimeout(()=>location.href="dashboard.html",600);return null}
  return u;
}
function logout(){localStorage.removeItem(DB.current);location.href="login.html"}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg){let t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
function expireDonations(){let d=getDonations(),changed=false,now=Date.now();d=d.map(x=>{let deadline=deadlineOf(x);if(x.status==="available"&&now>=deadline){x.status="expired";x.expiredAt=new Date().toISOString();changed=true}return x});if(changed)saveDonations(d)}
function timeLeft(x){let deadline=deadlineOf(x),ms=deadline-Date.now();if(ms<=0)return "Expired";let h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000);return `${h}h ${m}m left`}
function deadlineOf(x){
  const posted=new Date(x.postedAt).getTime();
  const explicit=new Date(x.expiry).getTime();
  const twentyFour=posted+86400000;
  return Math.min(twentyFour, explicit);
}
function priority(x){let deadline=deadlineOf(x),hours=Math.max(0,(deadline-Date.now())/3600000);let urgency=Math.max(0,100-hours/24*50),qty=Math.min(30,Number(x.quantity)*2),near=x.location.toLowerCase()===(currentUser()?.area||"").toLowerCase()?25:5;return Math.round(urgency+qty+near)}
function foodCard(x,claim=true){let p=priority(x),urgent=timeLeft(x)!=="Expired"&&((deadlineOf(x)-Date.now())<10800000);return `<article class="food-card"><div class="food-icon">${({ "Cooked Meals":"🍲","Rice / Biryani":"🍚","Bakery":"🥖","Fruits":"🍎","Vegetables":"🥦","Dairy":"🥛","Packaged Food":"📦","Other":"🍱"})[x.category]||"🍱"}</div><span class="badge ${urgent?"urgent":"available"}">${urgent?"⚠️ Urgent":"● Available"}</span><h3>${esc(x.foodName)}</h3><p>${esc(x.description||"Surplus food available for rescue.")}</p><div class="food-meta"><div>🍽️ ${x.servings} meals</div><div>⚖️ ${x.quantity} kg</div><div>📍 ${esc(x.location)}</div><div>⏳ ${timeLeft(x)}</div></div><div class="priority">Smart Priority: <b>${p}/155</b></div>${claim?`<button class="btn full" onclick="claimFood('${x.id}')">🤝 Claim Food</button>`:""}</article>`}
function claimFood(id){
  let u=requireLogin();if(!u)return;
  if(u.role==="donor"||u.role==="admin"){toast("Only a Recipient / NGO or Volunteer can claim food.");return}
  expireDonations();let d=getDonations(),x=d.find(a=>a.id===id);if(!x||x.status!=="available"){toast("This food is no longer available.");return}x.status="claimed";x.claimedBy=u.id;x.claimedAt=new Date().toISOString();saveDonations(d);let c=getClaims();c.push({id:"CL"+Date.now(),donationId:id,recipientId:u.id,status:"claimed",createdAt:new Date().toISOString()});saveClaims(c);toast("Food claimed successfully!");setTimeout(()=>location.reload(),700)}
setInterval(()=>{expireDonations()},60000);expireDonations();
