/* KMUTNB Admission – ระบบจำลองฝั่งเบราว์เซอร์ (localStorage) ไม่มี backend จริง */
var KM=(function(){
var L=localStorage,S=sessionStorage,D=document,P=location.pathname.split('/').pop()||'index.html';
function g(k,d){try{return JSON.parse(L.getItem(k))||d}catch(e){return d}}
function w(k,v){L.setItem(k,JSON.stringify(v))}
function $(s,r){return (r||D).querySelector(s)}
function go(p){location.href=p}
function fmt(t){return new Date(t).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})}
async function hash(s){try{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('km:'+s));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}catch(e){var n=5381;for(var i=0;i<s.length;i++)n=(n*33^s.charCodeAt(i))>>>0;return 'f'+n}}
function me(){var id=S.getItem('km_s')||L.getItem('km_s');return id&&g('km_users',{})[id]||null}
function app(){var u=me();
var FEE=200; /* ค่าสมัครตัวอย่างของระบบจำลอง ปรับตามโครงการจริงได้ */
/* QR/Barcode จำลอง (สร้างจากเลขที่ใบสมัคร สแกนจริงไม่ได้) และเลขที่นั่งสอบ */
function gfx(no){var h=0,N=25,z=5,k;String(no).split('').forEach(function(c){h=(h*31+c.charCodeAt(0))>>>0});
var q='<svg viewBox="0 0 125 125" width="125" height="125" role="img" aria-label="QR Code (จำลอง)"><rect width="125" height="125" fill="#fff"/>';
for(var y=0;y<N;y++)for(var x=0;x<N;x++){if((x<8&&y<8)||(x>=N-8&&y<8)||(x<8&&y>=N-8))continue;h=(h*1103515245+12345)>>>0;if((h>>>16)&1)q+='<rect x="'+x*z+'" y="'+y*z+'" width="'+z+'" height="'+z+'"/>'}
[[0,0],[N-7,0],[0,N-7]].forEach(function(p){var X=p[0]*z,Y=p[1]*z;q+='<rect x="'+X+'" y="'+Y+'" width="35" height="35"/><rect x="'+(X+5)+'" y="'+(Y+5)+'" width="25" height="25" fill="#fff"/><rect x="'+(X+10)+'" y="'+(Y+10)+'" width="15" height="15"/>'});
q+='</svg>';
var b='<svg viewBox="0 0 200 50" width="200" height="50" role="img" aria-label="Barcode (จำลอง)"><rect width="200" height="50" fill="#fff"/>',px=8;
String(no).padStart(10,'0').split('').forEach(function(d){for(var i=0;i<3;i++){var w=1+((+d+i*2)%3);b+='<rect x="'+px+'" y="4" width="'+w+'" height="42"/>';px+=w+((+d+i)%2+1)}});
b+='</svg>';
var e=D.createElement('div');e.className='paycode';e.innerHTML='<div>'+q+'<small>QR Code (จำลอง)</small></div><div>'+b+'<small>Barcode (จำลอง) · Ref '+no+'</small></div>';return e}
function seat(a,s1){return s1.project=='โครงการคัดเลือกตรง'?[['เลขที่นั่งสอบ','A-'+a.no.slice(-4)],['สนามสอบ','ดูแผนที่สนามสอบที่ admission.kmutnb.ac.th/exam-map']]:[['เลขที่นั่งสอบ','ไม่มี (เฉพาะโครงการสอบข้อเขียน)']]}
return u&&g('km_apps',{})[u.id]||null}
function saveApp(a){var A=g('km_apps',{});A[me().id]=a;w('km_apps',A)}
function msg(f,t){var e=$('.form-msg',f);if(!e){e=D.createElement('p');e.className='form-msg';f.insertBefore(e,$('.sumit,.btn-submit',f))}e.textContent=t;return false}
function F(id,fn){var f=$('#'+id);f&&f.addEventListener('submit',function(e){e.preventDefault();fn(f)})}
function row(p,l,v){var e=D.createElement('p'),b=D.createElement('b');b.textContent=l+': ';e.append(b,v);p.append(e)}

/* เก็บไฟล์จริงใน IndexedDB (localStorage จุได้แค่ ~5MB ไม่พอสำหรับ PDF) key = เลขบัตร:ลำดับเอกสาร */
function db(){return new Promise(function(ok,no){var r=indexedDB.open('km_files',1);r.onupgradeneeded=function(){r.result.createObjectStore('f')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}})}
function putFile(k,b){return db().then(function(d){return new Promise(function(ok,no){var t=d.transaction('f','readwrite');t.objectStore('f').put(b,k);t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)}})})}
function getFile(k){return db().then(function(d){return new Promise(function(ok,no){var q=d.transaction('f').objectStore('f').get(k);q.onsuccess=function(){ok(q.result)};q.onerror=function(){no(q.error)}})})}
function delFile(k){return db().then(function(d){return new Promise(function(ok){var t=d.transaction('f','readwrite');t.objectStore('f').delete(k);t.oncomplete=function(){ok()};t.onerror=function(){ok()}})})}

/* หน้าต่างแสดงเอกสาร (สร้างตอนกดดูครั้งแรก) */
function modal(){var m=$('#docModal');if(m)return m;
var st=D.createElement('style');
st.textContent='#docModal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;align-items:center;justify-content:center;padding:1rem}'
+'#docModal.show{display:flex}'
+'.dm-box{background:#fff;border-radius:16px;width:min(900px,100%);height:min(90vh,800px);display:flex;flex-direction:column;overflow:hidden}'
+'.dm-head{display:flex;align-items:center;gap:1rem;padding:.75rem 1.25rem;border-bottom:1px solid #eee}'
+'.dm-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+'.dm-open{color:#9b2c1f;font-size:.9rem}'
+'.dm-x{border:0;background:none;font-size:1.75rem;line-height:1;cursor:pointer}'
+'.dm-body{flex:1;display:flex;align-items:center;justify-content:center;background:#f4f4f6;overflow:auto}'
+'.dm-body img{max-width:100%;max-height:100%;object-fit:contain}'
+'.dm-body iframe{width:100%;height:100%;border:0}';
D.head.append(st);
m=D.createElement('div');m.id='docModal';
m.innerHTML='<div class="dm-box"><div class="dm-head"><b class="dm-title"></b><a class="dm-open" target="_blank" rel="noopener">เปิดในแท็บใหม่</a><button type="button" class="dm-x" aria-label="ปิด">&times;</button></div><div class="dm-body"></div></div>';
D.body.append(m);
function close(){m.classList.remove('show');$('.dm-body',m).textContent='';if(m._url){URL.revokeObjectURL(m._url);m._url=null}}
$('.dm-x',m).onclick=close;m.onclick=function(e){if(e.target==m)close()};
D.addEventListener('keydown',function(e){if(e.key=='Escape')close()});
return m}
function viewDoc(i,d){getFile(me().id+':'+i).then(function(b){
if(!b){alert('ไม่พบตัวไฟล์ (อาจแนบไว้ก่อนมีระบบเก็บไฟล์) กรุณาแนบเอกสารใหม่ที่หน้าส่งเอกสารอีกครั้ง');return}
var m=modal(),url=URL.createObjectURL(b),el=D.createElement(/^image\//.test(b.type)?'img':'iframe');
m._url=url;el.src=url;
$('.dm-title',m).textContent=d.file;$('.dm-open',m).href=url;
$('.dm-body',m).textContent='';$('.dm-body',m).append(el);m.classList.add('show')
}).catch(function(){alert('เปิดไฟล์ไม่สำเร็จ')})}

var u=me();
/* ป้องกันหน้าที่ต้องล็อกอิน */
if(/^(admission1|admission2|status)\.html$/.test(P)&&!u)go('login.html');
if(P=='register.html'&&!S.getItem('km_terms'))go('terms.html');
if(P=='admission2.html'&&u&&!(app()||{}).step1)go('admission1.html');

/* เมนูตามสถานะล็อกอิน */
var bl=$('.ui .btn-login');
if(u&&bl){var s=D.createElement('span');s.className='hello';s.textContent='สวัสดี, '+u.fname;bl.before(s);var rg=$('.ui .btn-reg');rg&&(rg.style.display='none');bl.textContent='ออกจากระบบ';bl.href='#';
bl.onclick=function(e){e.preventDefault();S.removeItem('km_s');L.removeItem('km_s');go('index.html')}}

/* ลงทะเบียน */
F('regForm',async function(f){var v=Object.fromEntries(new FormData(f)),U=g('km_users',{});
if(!/^\d{13}$/.test(v.idcard))return msg(f,'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v.password))return msg(f,'รหัสผ่านต้องยาวอย่างน้อย 8 ตัว และมีทั้งตัวอักษรอังกฤษและตัวเลข');
if(v.password!==v.confirm)return msg(f,'รหัสผ่านไม่ตรงกัน');
if(U[v.idcard])return msg(f,'เลขบัตรประชาชนนี้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ');
U[v.idcard]={id:v.idcard,pw:await hash(v.password),fname:v.fname,lname:v.lname,email:v.email,tel:v.tel};
w('km_users',U);S.removeItem('km_terms');alert('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ');go('login.html')});

/* เข้าสู่ระบบ */
F('loginForm',async function(f){var v=Object.fromEntries(new FormData(f)),x=g('km_users',{})[v.idcard];
if(!x||x.pw!==await hash(v.password))return msg(f,'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
S.removeItem('km_s');L.removeItem('km_s');(v.remember?L:S).setItem('km_s',x.id);go(app()&&app().no?'status.html':'admission1.html')});

/* ข้อตกลงและเงื่อนไข */
if(P=='terms.html'){var c=$('#agree'),b=$('#accept');c.onchange=function(){b.disabled=!c.checked};
b.onclick=function(){S.setItem('km_terms','1');go(me()?'admission1.html':'register.html')}}

/* ขั้นตอนสมัคร */
F('admissionForm',function(f){var a=app()||{};a.step1=Object.fromEntries(new FormData(f));saveApp(a);go('admission2.html')});
function submit(){var a=app()||{},id=me().id,items=[].slice.call(D.querySelectorAll('.doc-item'));
a.docs=items.map(function(i){var f=$('input',i).files[0];return{label:$('.doc-name',i).textContent,file:f?f.name:null,type:f?f.type:null}});
a.no=a.no||'70'+String(Date.now()).slice(-6);a.at=a.at||Date.now();a.due=a.due||a.at+3*864e5;saveApp(a);
return Promise.all(items.map(function(i,k){var f=$('input',i).files[0];return f?putFile(id+':'+k,f):delFile(id+':'+k)}))}

/* ตรวจสอบสถานะ (ข้อมูลจริงจากผู้ใช้) */
if(P=='status.html'&&u){var a=app(),m=$('.status-page');
if(!a||!a.no){m.innerHTML='<div class="status-title"><h2>ยังไม่มีใบสมัคร</h2><p>คุณยังไม่ได้ยื่นใบสมัคร</p></div><p style="text-align:center"><a class="btn-apply" href="terms.html" style="width:auto;padding:0 1.5rem">เริ่มสมัครเรียน</a></p>'}
else{var s1=a.step1,st=D.querySelectorAll('.step'),ck=st[0].querySelector('.step-icon').innerHTML,
st_=a.paid?['done','done','done','wait']:['done','doing','wait','wait'],
sub=[fmt(a.at),a.paid?'ชำระเงินแล้ว '+fmt(a.paidAt):'รอชำระเงิน',a.paid?'ตรวจสอบเสร็จสิ้น':'รอดำเนินการ',null];
$('.applicant h3').textContent=u.fname+' '+u.lname;
$('.applicant p').textContent='หลักสูตรที่สมัคร: '+s1.faculty+' สาขาวิชา'+s1.program+' ('+s1.campus+')';
st.forEach(function(e,i){e.className='step '+st_[i];e.querySelector('.step-icon').innerHTML=st_[i]=='done'?ck:'';if(sub[i])e.querySelector('small').textContent=sub[i]});
D.querySelectorAll('.step-line').forEach(function(l,i){l.classList.toggle('on',st_[i]=='done')});
D.querySelectorAll('.check-item').forEach(function(e,i){var d=a.docs[i];
var has=d&&d.file;$('.check-status',e).textContent=has?d.file+' · '+(a.paid?'ตรวจสอบเสร็จสิ้น':'รอตรวจสอบ'):'ไม่ได้แนบ (ไม่บังคับ)';
$('.btn-view',e).disabled=!has;$('.btn-view',e).onclick=function(){viewDoc(i,d)}});
var card=function(t,R,B){var r=D.createElement('section');r.className='card receipt';r.innerHTML='<h3 class="card-title"></h3><dl></dl><div class="rbtn"></div>';$('h3',r).textContent=t;
R.forEach(function(x){var dt=D.createElement('dt'),dd=D.createElement('dd');dt.textContent=x[0];dd.textContent=x[1];$('dl',r).append(dt,dd)});
B.forEach(function(x){var b=D.createElement('button');b.className='btn-view'+(x[2]?' btn-pay':'');b.textContent=x[0];b.onclick=x[1];$('.rbtn',r).append(b)});m.append(r);return r};
if(!a.paid){/* ขั้นที่ 4 ของระบบจริง: พิมพ์ใบแจ้งชำระเงิน แล้วชำระภายในกำหนด */
var c=card('ใบแจ้งการชำระเงินค่าสมัคร',[['เลขที่ใบสมัคร',a.no],['โครงการที่สมัคร',s1.project||'-'],['ค่าสมัคร',FEE+' บาท (ตัวอย่างในระบบจำลอง)'],['ชำระภายในวันที่',fmt(a.due||a.at+3*864e5)],['ช่องทางชำระเงิน','Mobile Banking ทุกธนาคาร (สแกน QR Code/Barcode) · เคาน์เตอร์ธนาคารกรุงไทย (ค่าธรรมเนียม 10 บาท) · ตู้ ATM ธนาคารกรุงไทย']],
[['พิมพ์ใบแจ้งชำระเงิน',function(){print()}],['ชำระค่าสมัคร (จำลอง)',function(){if(confirm('ยืนยันการชำระค่าสมัคร (ระบบจำลอง)?')){a.paid=true;a.paidAt=Date.now();saveApp(a);location.reload()}},1]]);
c.insertBefore(gfx(a.no),$('.rbtn',c));var n=D.createElement('p');n.className='pay-note';n.textContent='การสมัครจะสมบูรณ์เมื่อชำระเงินภายในกำหนด สามารถตรวจสอบสถานะได้หลังชำระเงิน 3 วันทำการ และควรเก็บสลิปการชำระเงินไว้เป็นหลักฐาน';m.append(n)}
else card('ใบหลักฐานการสมัคร',[['เลขที่ใบสมัคร',a.no],['เลขประจำตัวประชาชน',u.id],['ชื่อ-นามสกุล',u.fname+' '+u.lname],['ระดับ/วุฒิที่ใช้สมัคร',(s1.qualification||'-')],['โครงการที่สมัคร',s1.project||'-'],['วิทยาเขตที่สมัคร',s1.campus],['คณะที่สมัคร',s1.faculty],['สาขาวิชา',s1.program],['เอกสารที่อัปโหลด',a.docs.filter(function(x){return x.file}).length+' รายการ'],['สถานะการชำระเงิน','ชำระแล้ว']].concat(seat(a,s1)),
[['พิมพ์ใบหลักฐาน (ใช้แสดงวันสอบสัมภาษณ์)',function(){print()}]])}}

/* ประกาศผล */
F('resForm',function(){var id=$('#rid').value,A=g('km_apps',{})[id],X=g('km_users',{})[id],o=$('#resOut'),c=D.createElement('div');o.textContent='';
if(A&&A.paid&&X){c.className='res ok';row(c,'ผลการคัดเลือก','ผ่านการคัดเลือก');row(c,'ชื่อ-นามสกุล',X.fname+' '+X.lname);row(c,'วิทยาเขต',A.step1.campus);row(c,'คณะ',A.step1.faculty);row(c,'สาขาวิชา',A.step1.program)}
else{c.className='res no';c.textContent='ไม่พบข้อมูลผู้ผ่านการคัดเลือกด้วยเลขประจำตัวประชาชนนี้ กรุณาตรวจสอบความถูกต้องอีกครั้ง'}
o.append(c)});
return{submit:submit}})();