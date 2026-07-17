const STORAGE_KEY = 'foco-app-v1';
const today = () => new Date().toISOString().slice(0, 10);
const defaults = {tasks:[], settings:{focus:25,short:5,long:15,adaptive:true}, stats:{}, session:1, skips:0, completions:0};
let state = load();
let mode = 'focus', running = false, timerId = null;
let totalSeconds = state.settings.focus * 60, secondsLeft = totalSeconds;

const $ = id => document.getElementById(id);
const els = {time:$('time'),ring:document.querySelector('.ring'),mode:$('modeLabel'),session:$('sessionCount'),play:$('playButton'),playIcon:$('playIcon'),playText:$('playText'),tasks:$('taskList'),empty:$('emptyState'),progress:$('taskProgress'),minutes:$('focusMinutes'),sessions:$('completedSessions'),completed:$('completedTasks'),week:$('weekChart'),note:$('adaptiveNote'),dialog:$('settingsDialog')};
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function dayStats(){state.stats[today()] ||= {minutes:0,sessions:0,tasks:0};return state.stats[today()]}
function format(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function renderTimer(){els.time.textContent=format(secondsLeft);document.title=`${format(secondsLeft)} Â· Foco`;els.ring.style.strokeDashoffset=861*(1-secondsLeft/totalSeconds);els.mode.textContent=mode==='focus'?'momento de enfocarse':'momento de respirar';els.session.textContent=mode==='focus'?`sesiÃ³n ${state.session} de 4`:(state.session===4?'descanso largo':'descanso corto');els.note.innerHTML=`Tu ritmo recomendado: <strong>${recommendation()} min</strong>`}
function recommendation(){if(!state.settings.adaptive)return state.settings.focus;const score=state.completions-state.skips;return Math.max(15,Math.min(50,state.settings.focus+Math.sign(score)*Math.min(5,Math.abs(score))))}
function renderTasks(){els.tasks.innerHTML='';state.tasks.forEach(task=>{const li=document.createElement('li');li.className=`task-item${task.done?' done':''}`;li.innerHTML=`<button class="check" aria-label="${task.done?'Marcar pendiente':'Completar tarea'}">âœ“</button><span class="task-text"></span><button class="delete" aria-label="Eliminar tarea">Ã—</button>`;li.querySelector('.task-text').textContent=task.text;li.querySelector('.check').onclick=()=>toggleTask(task.id);li.querySelector('.delete').onclick=()=>deleteTask(task.id);els.tasks.appendChild(li)});const done=state.tasks.filter(t=>t.done).length;els.progress.textContent=`${done} / ${state.tasks.length}`;els.empty.hidden=state.tasks.length>0}
function renderStats(){const stats=dayStats();els.minutes.textContent=stats.minutes;els.sessions.textContent=stats.sessions;els.completed.textContent=stats.tasks;els.week.innerHTML='';const labels=['D','L','M','M','J','V','S'];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10),mins=state.stats[key]?.minutes||0;const item=document.createElement('div');item.className=`day${i===0?' today':''}`;item.innerHTML=`<span class="bar" style="height:${Math.max(4,Math.min(54,mins*1.5))}px"></span>${labels[d.getDay()]}`;item.title=`${mins} minutos`;els.week.appendChild(item)}}
function toggle(){running=!running;els.playIcon.textContent=running?'â…¡':'â–¶';els.playText.textContent=running?'pausar':'continuar';if(running){timerId=setInterval(tick,1000)}else clearInterval(timerId)}
function tick(){secondsLeft--;renderTimer();if(secondsLeft<=0)completeSession()}
function completeSession(){clearInterval(timerId);running=false;notify();if(mode==='focus'){const s=dayStats();s.minutes+=Math.round(totalSeconds/60);s.sessions++;state.completions++;mode='break'}else{mode='focus';state.session=state.session===4?1:state.session+1}resetClock();save();renderAll();toast(mode==='break'?'Â¡SesiÃ³n completada! Hora de respirar.':'Descanso listo. Volvamos con calma.')}
function resetClock(){clearInterval(timerId);running=false;const mins=mode==='focus'?recommendation():(state.session===4?state.settings.long:state.settings.short);totalSeconds=mins*60;secondsLeft=totalSeconds;els.playIcon.textContent='â–¶';els.playText.textContent='empezar'}
function skip(){if(mode==='focus')state.skips++;mode=mode==='focus'?'break':'focus';if(mode==='focus')state.session=state.session===4?1:state.session+1;resetClock();save();renderAll()}
function addTask(text){state.tasks.unshift({id:crypto.randomUUID(),text,done:false});save();renderTasks()}
function toggleTask(id){const task=state.tasks.find(t=>t.id===id);task.done=!task.done;if(task.done){dayStats().tasks++;toast('PequeÃ±a victoria registrada âœ“')}else dayStats().tasks=Math.max(0,dayStats().tasks-1);save();renderAll()}
function deleteTask(id){state.tasks=state.tasks.filter(t=>t.id!==id);save();renderTasks()}
function notify(){if('Notification'in window&&Notification.permission==='granted')new Notification('Foco',{body:'Tu sesiÃ³n terminÃ³. Es hora de cambiar de ritmo.'});if($('soundButton').classList.contains('active')){const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=620;gain.gain.setValueAtTime(.15,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.7);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.7)}}
let toastTimer;function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function renderAll(){renderTimer();renderTasks();renderStats()}
$('playButton').onclick=toggle;$('resetButton').onclick=()=>{resetClock();renderTimer()};$('skipButton').onclick=skip;
$('taskForm').onsubmit=e=>{e.preventDefault();const input=$('taskInput'),text=input.value.trim();if(text)addTask(text);input.value=''};
$('soundButton').onclick=async e=>{e.currentTarget.classList.toggle('active');if(e.currentTarget.classList.contains('active')&&'Notification'in window&&Notification.permission==='default')await Notification.requestPermission()};
$('settingsButton').onclick=()=>{ $('focusSetting').value=state.settings.focus;$('shortSetting').value=state.settings.short;$('longSetting').value=state.settings.long;$('adaptiveSetting').checked=state.settings.adaptive;els.dialog.showModal() };
$('saveSettings').onclick=e=>{e.preventDefault();state.settings={focus:+$('focusSetting').value,short:+$('shortSetting').value,long:+$('longSetting').value,adaptive:$('adaptiveSetting').checked};mode='focus';resetClock();save();renderAll();els.dialog.close();toast('Tu ritmo fue actualizado')};
renderAll();

