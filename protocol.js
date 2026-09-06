/* Definições e classificadores do protocolo vigente. */
const EX={
 legpress:{cunit:'kg por lado',n:'Leg press (placas)',g:'Quadríceps + glúteo',reps:'10–12',s:[2,3,3],c0:'20 kg por lado',kg0:20,prog:'+5 kg/lado',nota:'Pés na largura do quadril, meio da plataforma. Desça com controle sem tirar o quadril do encosto.'},
 supino:{cunit:'kg totais',n:'Supino reto (barra)',g:'Peitoral, tríceps, ombro',reps:'8–10',s:[2,3,3],c0:'barra vazia (20 kg)',kg0:20,prog:'+2,5 a 5 kg',nota:'Escápulas firmes; barra na linha do peito. Sem parceiro, preserve margem e use travas/segurança quando disponível.'},
 desenvolvimento:{cunit:'kg por halter',n:'Desenvolvimento com halteres (sentado)',g:'Ombro',reps:'10–12',s:[2,2,3],c0:'8 kg cada',kg0:8,prog:'+2 kg cada',nota:'Banco alto, cotovelos levemente à frente do tronco.'},
 extensora:{cunit:'carga mostrada',n:'Cadeira extensora',g:'Quadríceps',reps:'12–15',s:[2,2,3],c0:'carga confortável',kg0:'',prog:'+1 pino',nota:'Controle a volta e evite impulso.'},
 lateral:{cunit:'kg por halter',n:'Elevação lateral',g:'Deltoide medial',reps:'12–15',s:[2,2,3],c0:'5 kg cada',kg0:5,prog:'+1 a 2 kg',nota:'Suba sem balanço até aproximadamente a linha dos ombros.'},
 triceps:{cunit:'carga mostrada',n:'Tríceps na corda',g:'Tríceps',reps:'12–15',s:[2,2,3],c0:'15 kg',kg0:15,prog:'+1 pino',nota:'Cotovelo estável junto ao tronco.'},
 prancha:{cunit:'sem carga',n:'Prancha',g:'Core',reps:'30–60 s',s:[2,3,3],c0:'peso do corpo',kg0:'',prog:'uma variação um pouco mais difícil',semCarga:true,nota:'Glúteos e abdômen ativos. Registre segundos no campo de reps.'},
 puxada:{cunit:'carga mostrada',n:'Puxada alta (polia)',g:'Dorsal, bíceps',reps:'8–12',s:[2,3,3],c0:'30 kg',kg0:30,prog:'+1 pino',nota:'Puxe com os cotovelos e mantenha o tronco estável.'},
 remada:{cunit:'carga mostrada',n:'Remada sentada (polia)',g:'Costas média',reps:'10–12',s:[2,3,3],c0:'30 kg',kg0:30,prog:'+1 pino',nota:'Tronco estável; aproxime as escápulas sem embalo.'},
 rdl:{cunit:'kg por halter',n:'Terra romeno (halteres)',g:'Posterior + glúteo',reps:'8–10',s:[2,3,3],c0:'12 kg cada',kg0:12,prog:'+2 kg cada',nota:'Quadril para trás, coluna neutra e amplitude limitada pela técnica.'},
 flexora:{cunit:'carga mostrada',n:'Mesa/cadeira flexora',g:'Isquiotibiais',reps:'12–15',s:[2,2,3],c0:'carga confortável',kg0:'',prog:'+1 pino',nota:'Volta controlada; sem tirar o quadril do apoio.'},
 rosca:{cunit:'kg totais',n:'Rosca direta (barra W)',g:'Bíceps',reps:'10–12',s:[2,2,3],c0:'carga confortável',kg0:'',prog:'+1,25 kg/lado',nota:'Evite balançar o tronco.'},
 facepull:{cunit:'carga mostrada',n:'Face pull (polia alta)',g:'Ombro posterior',reps:'12–15',s:[2,2,2],c0:'10 kg',kg0:10,prog:'+1 pino',nota:'Puxe na direção do rosto e controle a volta.'},
 panturrilha:{cunit:'kg adicionais',n:'Panturrilha em pé',g:'Panturrilha',reps:'15–20',s:[2,2,3],c0:'16 kg',kg0:16,prog:'+4 kg',nota:'Amplitude confortável, sem quicar.'},
 farmer:{cunit:'kg por mão',n:'Caminhada do fazendeiro',g:'Core, pegada, trapézio',reps:'30–40 m',s:[2,2,2],c0:'16 kg cada mão',kg0:16,prog:'+4 kg',nota:'Postura alta e passos controlados. Registre metros no campo de reps.'}
};
const TREINOS={
 FA:{nome:'Força A — empurrar + quadríceps',cor:'f',ex:['legpress','supino','desenvolvimento','extensora','lateral','triceps','prancha'],minimo:['legpress','supino','prancha']},
 FB:{nome:'Força B — puxar + posterior',cor:'f',ex:['puxada','remada','rdl','flexora','rosca','facepull','panturrilha','farmer'],minimo:['puxada','rdl','remada']},
 Z2:{nome:'Zona 2 — base aeróbica',cor:'c',ex:[],minimo:[]},
 INT:{nome:'Intervalado — capacidade aeróbica',cor:'c',ex:[],minimo:[]},
 MOB:{nome:'Mobilidade + caminhada',cor:'c',ex:[],minimo:[]}
};
const NIVEIS={A:{n:'Completo',t:'treino inteiro'},B:{n:'Essencial',t:'3 principais × 2 séries'},C:{n:'Mínimo',t:'3 principais × 1 série'}};
const FASES=[
 {n:1,nome:'Adaptação',faixa:'1–8 treinos de força A/B',rir:'3–4 reps na reserva',o:'Prioridade em técnica, tolerância e hábito.',d:['2 séries na maior parte dos exercícios','Sem buscar falha','Zona 2: 25–30 min']},
 {n:2,nome:'Construção',faixa:'9–20 treinos de força A/B',rir:'2–3 reps na reserva',o:'A progressão passa a ser o motor principal.',d:['3 séries nos principais','Dupla progressão validada apenas em sessão A','Zona 2: 35–45 min; intervalado já pode entrar na fila']},
 {n:3,nome:'Consolidação',faixa:'21–32 treinos de força A/B',rir:'1–2 reps na reserva',o:'Consolidar força e capacidade sem sacrificar técnica.',d:['Mesmas faixas de repetição para reduzir complexidade','Aumente carga apenas após confirmar topo + técnica + RIR','Um Z2 pode ser mais longo quando recuperação estiver boa']}
];
const FILA=['FA','Z2','FB','MOB','FA','Z2','FB','INT'];
function localDate(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dateObj(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');if(!m)return null;const d=new Date(+m[1],+m[2]-1,+m[3],12);return d.getFullYear()==+m[1]&&d.getMonth()==+m[2]-1&&d.getDate()==+m[3]?d:null}
function addDays(s,n){const d=dateObj(s);if(!d)return s;d.setDate(d.getDate()+n);return localDate(d)}
const hoje=()=>localDate();const dias=(a,b)=>{const A=dateObj(a),B=dateObj(b);return A&&B?Math.round((B-A)/864e5):0};const fmt=n=>{const x=num(n);return x!==null?(Math.round(x*10)/10).toString().replace('.',','):'—'};
function uid(prefix='x'){try{return prefix+'-'+crypto.randomUUID()}catch(e){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
const num=v=>{const raw=String(v??'').trim().replace(',','.');if(!raw)return null;const n=Number(raw);return Number.isFinite(n)?n:null};
const isForca=t=>t==='FA'||t==='FB';const ehCardio=t=>TREINOS[t]&&!TREINOS[t].ex.length;const validaNivel=n=>['A','B','C','P'].includes(n)?n:'P';
function faixaReps(exId){const a=(EX[exId].reps.match(/\d+/g)||[]).map(Number);return {piso:a[0]||1,topo:a[a.length-1]||a[0]||1}}
function serieCompleta(exId,x){const r=num(x&&x.reps);if(!(r>0))return false;if(EX[exId].semCarga)return true;const kg=num(x&&x.kg);return kg>0}
function seriesCompletas(exId,arr){return (arr||[]).filter(x=>serieCompleta(exId,x)).map(x=>({kg:EX[exId].semCarga?'':num(x.kg),reps:num(x.reps)}))}
function fingerprintSessao(s){return hash(JSON.stringify([s.data,s.tipo,s.nivel,(s.exercicios||[]).map(e=>[e.id,e.series]),s.cardio||{},s.notas||'']))}
function fingerprintMedida(m){return hash(JSON.stringify([m.data,m.peso,m.cintura,m.braco,m.coxa,m.fcRep,m.vo2,m.sono]))}
function nivelForcaPorDados(tipo,exs,fase){const t=TREINOS[tipo],map=new Map((exs||[]).map(e=>[e.id,e]));const qtd=id=>seriesCompletas(id,(map.get(id)||{}).series).length;const alvo=id=>(EX[id].s||[2,3,3])[Math.max(0,Math.min(2,(+fase||1)-1))];if(t.ex.every(id=>qtd(id)>=alvo(id)))return 'A';if(t.minimo.every(id=>qtd(id)>=2))return 'B';if(t.minimo.every(id=>qtd(id)>=1))return 'C';return 'P'}
function limCardioFase(tipo,fase=1){const f=Math.max(1,Math.min(3,+fase||1));if(tipo==='Z2'){const A=[25,35,40][f-1];return {A,B:Math.max(15,Math.round(A*.6)),C:5}}if(tipo==='INT')return {A:25,B:12,C:5};return {A:20,B:10,C:5}}
function nivelCardioFase(tipo,min,fase=1){const m=num(min)||0,l=limCardioFase(tipo,fase);return m>=l.A?'A':m>=l.B?'B':m>=l.C?'C':'P'}

export {uid,EX,TREINOS,NIVEIS,FASES,FILA,localDate,dateObj,addDays,hoje,dias,fmt,num,isForca,ehCardio,faixaReps,serieCompleta,seriesCompletas,nivelForcaPorDados,limCardioFase,nivelCardioFase};
