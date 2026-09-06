import {importBackup,empty,clone,validateData} from './core.js';

export const KEYS={
 main:'painel-saude-carlos',
 bak:'painel-saude-carlos-bak',
 rollback:'painel-saude-carlos-rollback',
 draft:'painel-saude-carlos-draft'
};

// Somente para migração silenciosa de instalações já existentes.
// Essas chaves não aparecem na interface e nunca são apagadas automaticamente.
export const LEGACY_KEYS={
 main:['painel-saude-carlos-v4','painel-saude-carlos-v4-bak','painel-saude-carlos-v3','painel-saude-carlos-v3-bak'],
 draft:['painel-saude-carlos-v4-draft','painel-saude-carlos-v3-draft']
};

export class Repository{
 constructor(storage){this.storage=storage;this.raw=null;this.canWrite=false;this.state=empty();this.message='';}
 load(){
  const storage=this.storage;
  try{const test=KEYS.main+'-probe';storage.setItem(test,'1');storage.removeItem(test);this.canWrite=true}catch{
   this.message='Armazenamento indisponível. Exportação continua disponível.';return this.state
  }
  const main=storage.getItem(KEYS.main);this.raw=main;
  if(main){
   try{this.state=importBackup(JSON.parse(main));return this.state}
   catch{this.canWrite=false;this.message='O histórico principal está inválido. Exporte uma cópia bruta antes de tentar recuperar os dados.';return this.state}
  }
  const bak=storage.getItem(KEYS.bak);
  if(bak){
   try{this.state=importBackup(JSON.parse(bak));this.commit(this.state);this.message='Histórico recuperado de uma cópia de segurança.';return this.state}
   catch{}
  }
  for(const key of LEGACY_KEYS.main){
   const raw=storage.getItem(key);if(!raw)continue;
   try{
    this.state=importBackup(JSON.parse(raw));
    this.commit(this.state);
    this.message='Histórico existente preservado e convertido para o formato atual.';
    return this.state;
   }catch(e){
    this.message='Não foi possível converter o histórico existente: '+e.message;
    this.canWrite=false;return this.state;
   }
  }
  return this.state;
 }
 commit(next,{checkpoint=false,recover=false}={}){
  validateData(next.data);
  if(!this.canWrite&&!recover)throw Error('Armazenamento indisponível para gravação.');
  const current=this.storage.getItem(KEYS.main);
  if(current!==this.raw)throw Error('O histórico mudou em outra janela. Exporte o rascunho e reabra o painel antes de salvar.');
  const raw=JSON.stringify(next);
  if(checkpoint)this.storage.setItem(KEYS.rollback,JSON.stringify(this.state));
  if(current){
   try{importBackup(JSON.parse(current));this.storage.setItem(KEYS.bak,current)}
   catch(e){if(!recover)throw e}
  }
  this.storage.setItem(KEYS.main,raw);
  if(this.storage.getItem(KEYS.main)!==raw)throw Error('Gravação não confirmada.');
  this.raw=raw;this.state=clone(next);this.canWrite=true;return this.state;
 }
 saveDraft(draft){this.storage.setItem(KEYS.draft,JSON.stringify({updatedAt:new Date().toISOString(),rascunho:draft}))}
 readDraft(){
  const saved=this.storage.getItem(KEYS.draft);
  if(saved!==null){try{return JSON.parse(saved).rascunho||null}catch{return null}}
  for(const key of LEGACY_KEYS.draft){
   const raw=this.storage.getItem(key);if(!raw)continue;
   try{
    const draft=JSON.parse(raw).rascunho||null;
    if(draft)this.saveDraft(draft);
    return draft;
   }catch{}
  }
  return null;
 }
 clearDraft(){this.storage.setItem(KEYS.draft,JSON.stringify({rascunho:null}))}
}
