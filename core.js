import {EX,TREINOS,FASES,FILA,localDate,dateObj,addDays,isForca,num,seriesCompletas,faixaReps,nivelForcaPorDados,nivelCardioFase} from './protocol.js';
export const SCHEMA='painel-saude/4';
export const clone=x=>JSON.parse(JSON.stringify(x));
export function canonical(x){return JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v)}
export const SEMANTICS={
 legpress:{load:'placas/níveis',short:'placas',effort:'reps'},supino:{load:'kg adicionais à barra',short:'kg + barra',effort:'reps'},
 desenvolvimento:{load:'kg por halter',short:'kg/halter',effort:'reps'},extensora:{load:'placas',short:'placas',effort:'reps'},
 lateral:{load:'kg por halter',short:'kg/halter',effort:'reps'},triceps:{load:'placas',short:'placas',effort:'reps'},
 prancha:{load:'sem carga',short:'',effort:'s'},puxada:{load:'placas',short:'placas',effort:'reps'},remada:{load:'placas',short:'placas',effort:'reps'},
 rdl:{load:'kg adicionais à barra',short:'kg + barra',effort:'reps',name:'Terra romeno (barra)'},flexora:{load:'placas',short:'placas',effort:'reps'},
 rosca:{load:'kg adicionais à barra',short:'kg + barra',effort:'reps'},facepull:{load:'placas',short:'placas',effort:'reps'},
 panturrilha:{load:'kg do halter · unilateral',short:'kg/halter',effort:'reps',name:'Panturrilha em pé · unilateral'},
 farmer:{load:'kg registrados',short:'kg',effort:'passos',range:{min:20,max:30}}
};
export const name=id=>SEMANTICS[id]?.name||EX[id]?.n||id;
export const unit=id=>SEMANTICS[id]||{load:'unidade original',short:'un.',effort:'un.'};
export function validateData(data){
 if(!data||data.v!==3||!Array.isArray(data.sessoes)||!Array.isArray(data.medidas))throw Error('Esperado um backup v3 do painel ou um backup v4.');
 for(const group of ['sessoes','medidas']){
  const ids=new Set();for(const r of data[group]){
   if(!r||typeof r.id!=='string'||!r.id||!dateObj(r.data))throw Error('Registro sem ID ou data válida. Nenhum dado foi importado.');
   if(ids.has(r.id))throw Error('ID repetido no backup: '+r.id+'. Nenhum registro foi descartado.');ids.add(r.id);
   if(group==='sessoes'){
    if(!TREINOS[r.tipo]||!['A','B','C','P'].includes(r.nivel)||!Array.isArray(r.exercicios)||!r.cardio||typeof r.cardio!=='object'||Array.isArray(r.cardio))throw Error('Sessão com estrutura inválida: '+r.id);
    if(r.meta!==undefined&&!['A','B','C','P'].includes(r.meta))throw Error('Meta inválida: '+r.id);
    if(r.fase!==undefined&&![1,2,3].includes(r.fase))throw Error('Fase inválida: '+r.id);
    if(r.progressaoOk!==undefined&&typeof r.progressaoOk!=='boolean')throw Error('Confirmação inválida: '+r.id);
    for(const e of r.exercicios)if(!e||typeof e.id!=='string'||!Array.isArray(e.series)||e.series.some(s=>!s||typeof s!=='object'))throw Error('Exercício inválido em '+r.id);
   }
  }
 }
 return data;
}
export function migrateV3(raw){validateData(raw);return {schema:SCHEMA,v:4,data:clone(raw),semantics:clone(SEMANTICS),originV3:clone(raw),imports:[]}}
export function importBackup(raw){
 if(raw?.v===3)return migrateV3(raw);
 if(raw?.v!==4||raw.schema!==SCHEMA)throw Error('Versão de backup não suportada. Use v3 ou v4.');
 validateData(raw.data);if(raw.originV3)validateData(raw.originV3);
 if(!Array.isArray(raw.imports)||!raw.semantics)throw Error('Backup v4 incompleto.');return clone(raw);
}
export const empty=()=>migrateV3({v:3,sessoes:[],medidas:[],criado:localDate(),atualizado:null});
export function mergeBackup(current,incoming){
 const a=importBackup(current),b=importBackup(incoming);let added=0;
 if(!a.data.sessoes.length&&!a.data.medidas.length&&!a.data.atualizado&&!a.imports.length&&Object.keys(a.data).every(k=>['v','sessoes','medidas','criado','atualizado'].includes(k)))return {state:{...a,...b,...(a.preferences&&!b.preferences?{preferences:a.preferences}:{})},added:b.data.sessoes.length+b.data.medidas.length};
 for(const field of ['sessoes','medidas']){
  const byId=new Map(a.data[field].map(r=>[r.id,r]));
  for(const r of b.data[field]){
   const old=byId.get(r.id);
   if(old&&canonical(old)!==canonical(r))throw Error('Conflito no ID '+r.id+'. O histórico atual foi mantido. Compare os backups antes de substituir.');
   if(!old){a.data[field].push(clone(r));byId.set(r.id,r);added++}
  }
 }
 // Retain the incoming envelope (including unknown fields) for full provenance.
 if(canonical(a.data)!==canonical(b.data)&&!a.imports.some(x=>canonical(x)===canonical(b)))a.imports.push(clone(b));
 return {state:a,added};
}
export function ordered(data){return data.sessoes.slice().sort((a,b)=>a.data.localeCompare(b.data)||(a.criadoEm||'').localeCompare(b.criadoEm||''))}
export function stats(data){
 const sessions=ordered(data),valid=sessions.filter(s=>s.nivel!=='P');let position=0,force=0;
 for(const s of valid){const exp=FILA[position%8]==='INT'&&force<4?'Z2':FILA[position%8];if(s.tipo===exp)position++;if(isForca(s.tipo)&&['A','B'].includes(s.nivel))force++}
 return {total:sessions.length,valid:valid.length,partial:sessions.length-valid.length,force,phase:force<8?1:force<20?2:3,position,next:FILA[position%8]==='INT'&&force<4?'Z2':FILA[position%8]};
}
export function monday(d){const x=dateObj(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return localDate(x)}
export function week(data,date=localDate()){const sessions=data.sessoes.filter(s=>s.nivel!=='P'&&monday(s.data)===monday(date));const force=sessions.filter(s=>isForca(s.tipo)&&['A','B'].includes(s.nivel)).length;return {sessions:sessions.length,force,consistent:sessions.length>=4&&force>=2}}
export function lastExecution(data,id){for(const s of ordered(data).reverse()){const e=s.exercicios.find(e=>e.id===id);if(e?.series.length&&s.nivel!=='P')return {session:s,exercise:e}}return null}
export function target(id,phase){return (EX[id]?.s||[2,3,3])[phase-1]}
export const FARMER_PLAN={revision:'farmer-passos-1',unit:'passos',min:20,max:30};
export function decision(session,id){
 const e=session.exercicios.find(e=>e.id===id),known=EX[id];if(!known)return {state:'maintain',reason:'Exercício histórico sem regra cadastrada.'};
 if(session.nivel!=='A'||(session.meta&&session.meta!=='A'))return {state:'maintain',reason:'B/C ou parcial não autorizam aumento.'};
 if(id==='farmer'&&!Object.entries(FARMER_PLAN).every(([k,v])=>e?.prescription?.[k]===v))return {state:'maintain',reason:'Registro anterior à meta em passos; validar 20–30 passos em uma nova sessão A.'};
 const series=seriesCompletas(id,e?.series),n=target(id,session.fase||1),used=series.slice(0,n);
 if(used.length<n)return {state:'maintain',reason:'Séries planejadas incompletas.'};
 if(!used.every(x=>x.reps>=(id==='farmer'?FARMER_PLAN.max:faixaReps(id).topo)))return {state:'reps',reason:id==='farmer'?'Progredir em passos até 30, mantendo a carga.':id==='prancha'?'Progredir em segundos dentro da faixa.':'Progredir em repetições dentro da faixa.'};
 if(!session.progressaoOk)return {state:'maintain',reason:'Confirmar técnica e RIR em sessão A.'};
 if(!known.semCarga&&!used.every(x=>Math.abs(x.kg-used[0].kg)<.001))return {state:'maintain',reason:'Consolidar uma carga uniforme nas séries.'};
 return {state:'increase',reason:id==='farmer'?'Aumento autorizado no próximo A; retorne a 20 passos.':id==='prancha'?'Variação mais difícil autorizada no próximo A.':'Aumento autorizado no próximo A.'};
}
export function progressionEvents(data){
 const prior=new Map(),events=[];
 for(const s of ordered(data)){
  for(const e of s.exercicios){
   const before=prior.get(e.id),cs=EX[e.id]?seriesCompletas(e.id,e.series):[];
   if(!cs.length)continue;
   if(before&&!EX[e.id]?.semCarga){const old=seriesCompletas(e.id,before.exercise.series);if(old.length&&Math.max(...cs.map(x=>x.kg))>Math.max(...old.map(x=>x.kg)))events.push({data:s.data,id:e.id,kind:'realizada',authorized:decision(before.session,e.id).state==='increase',sessionId:s.id})}
   if(decision(s,e.id).state==='increase')events.push({data:s.data,id:e.id,kind:'autorizada',sessionId:s.id});
   if(s.nivel!=='P')prior.set(e.id,{session:s,exercise:e});
  }
 }return events;
}
export function newDraft(type,date=localDate()){return {tipo:type,nivel:'A',fase:null,data:date,exercicios:TREINOS[type].ex.map(id=>({id,series:[]})),cardio:{min:'',feito:false,zona2:false},notas:'',progressaoOk:false}}
export function reviewDraft(d,data,today=localDate()){
 const errors=[],warnings=[];if(!dateObj(d.data)||d.data>today)errors.push('Escolha uma data válida, até hoje.');
 const phase=stats(data).phase,ex=[];
 for(const e of d.exercicios){
  if(!EX[e.id]){errors.push('Exercício não reconhecido no rascunho: '+e.id);continue}
  for(const x of e.series){
   for(const key of ['kg','reps']){const raw=x[key];if(raw!==''&&raw!==null&&raw!==undefined&&(num(raw)===null||num(raw)<0||num(raw)>1000))errors.push(name(e.id)+': valor inválido em '+key+'.')}
   if(num(x.reps)>0&&!EX[e.id].semCarga&&!(num(x.kg)>0))errors.push(name(e.id)+': falta carga na série executada.');
   if(num(x.reps)>0&&idNeedsInteger(e.id)&&!Number.isInteger(num(x.reps)))errors.push(name(e.id)+': registre repetições/passos inteiros.');
  }
  const cs=seriesCompletas(e.id,e.series);if(cs.length)ex.push({id:e.id,series:cs,...(e.id==='farmer'?{prescription:clone(FARMER_PLAN)}:{})});
  const planned=d.nivel==='A'?target(e.id,phase):TREINOS[d.tipo].minimo.includes(e.id)?(d.nivel==='B'?2:1):0;
  if(e.id!=='farmer'&&cs.some(x=>x.reps<faixaReps(e.id).piso||x.reps>faixaReps(e.id).topo))warnings.push(name(e.id)+': há séries fora da faixa '+EX[e.id].reps+'. Confira os valores.');
  if(cs.length<planned)warnings.push(name(e.id)+': '+cs.length+' de '+planned+' séries concluídas.');
 }
 const mins=num(d.cardio.min);if(d.cardio.min!==''&&d.cardio.min!=null&&(mins===null||mins<0||mins>360))errors.push('Duração inválida: use de 0 a 360 minutos.');
 const force=isForca(d.tipo),cardio={};if(mins!==null)cardio.min=mins;
 if(force)cardio.feito=!!d.cardio.feito||mins>0;
 if(d.tipo==='Z2'){cardio.zona2Confirmada=!!d.cardio.zona2;if(!d.cardio.zona2)warnings.push('Zona 2/teste da fala não confirmado. A classificação continua pelos minutos; a confirmação fica explícita no registro.');}
 const level=force?nivelForcaPorDados(d.tipo,ex,phase):nivelCardioFase(d.tipo,mins,phase);
 if(d.nivel==='A'&&level!=='A')warnings.unshift('Sua meta era A. Esta execução será salva como '+level+(level==='P'?' (parcial)':'')+'.');
 if(data.sessoes.some(s=>s.data===d.data&&s.tipo===d.tipo))warnings.push('Já existe '+d.tipo+' nesta data. Confirme apenas se esta for outra sessão real.');
 if(!ex.length&&!(mins>0)&&!cardio.feito&&!d.notas.trim())errors.push('Ainda não há execução para salvar.');
 const session={data:d.data,tipo:d.tipo,nivel:level,meta:d.nivel,fase:phase,techniqueRirConfirmed:force&&!!d.progressaoOk,progressaoOk:force&&level==='A'&&d.nivel==='A'&&!!d.progressaoOk,exercicios:ex,cardio,notas:d.notas.trim()};
 return {errors:[...new Set(errors)],warnings,session};
}
function idNeedsInteger(id){return id!=='prancha'}
export function formatSeries(id,series){return series.map(x=>(EX[id]?.semCarga?'':String(x.kg)+' '+unit(id).short+' × ')+x.reps+' '+unit(id).effort).join(' · ')}
export function summary(data,period=7,today=localDate()){
 const st=stats(data),start=period==='all'?null:addDays(today,1-Number(period));const inRange=d=>(!start||d>=start)&&d<=today;
 const sessions=ordered(data).filter(s=>inRange(s.data));
 const lines=['PAINEL DE SAÚDE — Carlos — v4','Período: '+(start||'início')+' a '+today,'Fase '+st.phase+' · força A/B acumulada: '+st.force+' · válidas: '+st.valid+' · parciais: '+st.partial+' · próxima: '+st.next,'Apple Health: fonte fisiológica; dados não importados no painel.','SESSÕES DO PERÍODO: '+sessions.length];
 for(const s of sessions){lines.push(s.data+' | '+s.tipo+' | meta '+s.meta+' → '+s.nivel+' | fase '+s.fase+' | técnica/RIR '+((s.techniqueRirConfirmed??s.progressaoOk)?'confirmados':'não confirmados')+' | cardio '+(s.cardio.min??'não informado')+' min'+(s.cardio.feito?' (feito)':'')+(s.cardio.zona2Confirmada!==undefined?' | Z2 '+(s.cardio.zona2Confirmada?'confirmada':'não confirmada'):''));for(const e of s.exercicios)lines.push('  '+name(e.id)+': '+formatSeries(e.id,e.series));if(s.notas)lines.push('  Nota: '+s.notas)}
 lines.push('ÚLTIMA EXECUÇÃO POR EXERCÍCIO (histórico até '+today+'):');
 const limited={...data,sessoes:data.sessoes.filter(s=>s.data<=today)};
 for(const id of Object.keys(EX)){const u=lastExecution(limited,id);if(u)lines.push(name(id)+' | '+u.session.data+' | '+formatSeries(id,u.exercise.series)+' | '+decision(u.session,id).reason)}
 lines.push('PROGRESSÕES DO PERÍODO:');for(const ev of progressionEvents(limited).filter(e=>inRange(e.data)))lines.push(ev.data+' | '+name(ev.id)+' | '+ev.kind+(ev.kind==='realizada'?(ev.authorized?' após autorização':' sem autorização identificada na execução anterior'):'')+' | '+ev.sessionId);
 lines.push('Farmer: kg × passos. Novos registros: faixa inicial 20–30 passos; aumento somente no próximo A após todas as séries no topo e técnica/RIR confirmados. Histórico sem conversão ou autorização retroativa.');
 return lines.join('\n');
}
