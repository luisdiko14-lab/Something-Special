const c=document.getElementById('game'),x=c.getContext('2d');
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),levelEl=document.getElementById('level'),shieldEl=document.getElementById('shield'),comboEl=document.getElementById('combo'),powerEl=document.getElementById('power'),btn=document.getElementById('start'),pauseBtn=document.getElementById('pause');
let keys={},running=false,paused=false,score=0,best=+localStorage.neonBest||0,level=1,shield=3,combo=1,player,gem,hazards=[],powerups=[],particles=[],last=0,spawn=0,powerSpawn=0,power='';let powerTimer=0;
bestEl.textContent=best;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='p'&&running)togglePause()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);btn.onclick=start;pauseBtn.onclick=togglePause;
function start(){running=true;paused=false;score=0;level=1;shield=3;combo=1;power='';powerTimer=0;player={x:450,y:260,r:14,inv:0};gem=makeGem();hazards=[];powerups=[];particles=[];last=performance.now();spawn=0;powerSpawn=0;btn.textContent='RESTART';pauseBtn.textContent='PAUSE';sync();requestAnimationFrame(loop)}
function sync(){scoreEl.textContent=score;levelEl.textContent=level;comboEl.textContent='x'+combo;powerEl.textContent=power?power.toUpperCase():'—';shieldEl.textContent='●'.repeat(Math.max(0,shield))+'○'.repeat(3-shield)}
function makeGem(){return{x:35+Math.random()*830,y:35+Math.random()*450,r:9}}
function addHazard(){const side=Math.floor(Math.random()*4);let h={x:side<2?Math.random()*900:(side===2?-25:925),y:side<2?(side===0?-25:545):Math.random()*520,vx:0,vy:0,r:12+Math.random()*4};const dx=player.x-h.x,dy=player.y-h.y,d=Math.hypot(dx,dy)||1,s=75+level*14;h.vx=dx/d*s;h.vy=dy/d*s;hazards.push(h)}
function addPower(){const types=['shield','slow','double'];const type=types[Math.floor(Math.random()*types.length)];powerups.push({x:45+Math.random()*810,y:45+Math.random()*430,r:12,type,life:8})}
function burst(px,py,n=12){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=30+Math.random()*150;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.55+Math.random()*.5})}}
function loop(t){if(!running)return;const dt=Math.min((t-last)/1000,.035);last=t;if(!paused){update(dt);draw(t)}else{draw(t);drawPause()}requestAnimationFrame(loop)}
function update(dt){if(player.inv>0)player.inv-=dt;if(powerTimer>0){powerTimer-=dt;if(powerTimer<=0)power='';}
let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);const m=Math.hypot(dx,dy)||1;const speed=power==='slow'?330:260;player.x=Math.max(20,Math.min(880,player.x+dx/m*speed*dt));player.y=Math.max(20,Math.min(500,player.y+dy/m*speed*dt));
if(Math.hypot(player.x-gem.x,player.y-gem.y)<player.r+gem.r){const gain=10*combo*(power==='double'?2:1);score+=gain;combo=Math.min(9,combo+1);level=1+Math.floor(score/100);burst(gem.x,gem.y,18);gem=makeGem();sync()}
spawn+=dt;powerSpawn+=dt;if(spawn>Math.max(.3,1.05-level*.055)){spawn=0;addHazard()}if(powerSpawn>6+Math.random()*4){powerSpawn=0;addPower()}
hazards.forEach(h=>{h.x+=h.vx*dt;h.y+=h.vy*dt});powerups.forEach(p=>p.life-=dt);
for(let i=powerups.length-1;i>=0;i--){const p=powerups[i];if(p.life<=0){powerups.splice(i,1);continue}if(Math.hypot(player.x-p.x,player.y-p.y)<player.r+p.r){powerups.splice(i,1);power=p.type;powerTimer=p.type==='shield'?5:6;if(p.type==='shield')shield=Math.min(3,shield+1);burst(p.x,p.y,20);sync()}}
for(let i=hazards.length-1;i>=0;i--){const h=hazards[i];if(Math.hypot(player.x-h.x,player.y-h.y)<player.r+h.r&&player.inv<=0){hazards.splice(i,1);burst(player.x,player.y,25);combo=1;if(power==='shield'){power='';powerTimer=0}else shield--;player.inv=1.1;sync();if(shield<=0)gameOver()}}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
}
function gameOver(){running=false;paused=false;if(score>best){best=score;localStorage.neonBest=best;bestEl.textContent=best}btn.textContent='PLAY AGAIN';pauseBtn.textContent='PAUSE';draw(performance.now())}
function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'RESUME':'PAUSE'}
function draw(t){x.clearRect(0,0,c.width,c.height);x.fillStyle='#070a15';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#141a2d';for(let i=0;i<c.width;i+=45){x.beginPath();x.moveTo(i,0);x.lineTo(i,c.height);x.stroke()}for(let j=0;j<c.height;j+=45){x.beginPath();x.moveTo(0,j);x.lineTo(c.width,j);x.stroke()}
particles.forEach(p=>{x.globalAlpha=Math.max(0,p.life);x.fillStyle='#fff';x.fillRect(p.x,p.y,3,3)});x.globalAlpha=1;
x.shadowBlur=18;x.shadowColor='#fff';x.fillStyle=player&&player.inv>0&&Math.floor(player.inv*12)%2?'#777':'#fff';if(player){x.beginPath();x.arc(player.x,player.y,player.r,0,Math.PI*2);x.fill()}
x.shadowColor='#8cf';x.fillStyle='#8cf';x.save();x.translate(gem.x,gem.y);x.rotate(t/500);x.beginPath();x.moveTo(0,-gem.r);x.lineTo(gem.r,0);x.lineTo(0,gem.r);x.lineTo(-gem.r,0);x.closePath();x.fill();x.restore();
powerups.forEach(p=>{x.shadowColor=p.type==='shield'?'#fff':p.type==='slow'?'#9cf':'#fd8';x.fillStyle=x.shadowColor;x.beginPath();x.arc(p.x,p.y,p.r+Math.sin(t/150)*2,0,Math.PI*2);x.fill();x.shadowBlur=0;x.fillStyle='#090c18';x.textAlign='center';x.textBaseline='middle';x.font='bold 12px system-ui';x.fillText(p.type==='shield'?'S':p.type==='slow'?'T':'2X',p.x,p.y)});
x.shadowColor='#f55';x.fillStyle='#f55';hazards.forEach(h=>{x.beginPath();x.arc(h.x,h.y,h.r,0,Math.PI*2);x.fill()});x.shadowBlur=0;
if(!running){overlay('RUN OVER',`Score: ${score}  ·  Press PLAY AGAIN`)} }
function overlay(title,sub){x.fillStyle='rgba(4,5,12,.72)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='800 42px system-ui';x.fillText(title,450,245);x.font='16px system-ui';x.fillStyle='#aeb5d2';x.fillText(sub,450,280)}
function drawPause(){x.fillStyle='rgba(4,5,12,.6)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='800 38px system-ui';x.fillText('PAUSED',450,255);x.font='15px system-ui';x.fillStyle='#aeb5d2';x.fillText('Press P or RESUME to continue',450,285)}
