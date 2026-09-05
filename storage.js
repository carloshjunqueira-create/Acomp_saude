import {importBackup,empty,clone,validateData} from './core.js';
export const KEYS={main:'painel-saude-carlos-v4',bak:'painel-saude-carlos-v4-bak',rollback:'painel-saude-carlos-v4-rollback',draft:'painel-saude-carlos-v4-draft',v3:'painel-saude-carlos-v3',v3bak:'painel-saude-carlos-v3-bak',v3draft:'painel-saude-carlos-v3-draft'};
export class Repository{
 constructor(storage){this.storage=storage;this.raw=null;this.canWrite=false;this.state=empty();this.message='';}
 load(){
  const storage=this.storage;
  try{const test=KEYS.main+'-probe';storage.setItem(test,'1');storage.removeItem(test);this.canWrite=true}catch{this.message='Armazenamento indisponível. Exportação continua disponível.';return this.state}
  const main=storage.getItem(KEYS.main);this.raw=main;
  if(main){try{this.state=importBackup(JSON.parse(main));return this.state}catch{this.canWrite=false;this.message='Backup v4 principal inválido. Exporte a cópia bruta e restaure uma cópia válida em Dados.';return this.state}}
  for(const key of [KEYS.bak,KEYS.v3,KEYS.v3bak]){
   const raw=storage.getItem(key);if(!raw)continue;
   try{this.state=importBackup(JSON.parse(raw));this.commit(this.state);this.message=key===KEYS.v3?'Histórico v3 preservado e migrado para v4.':'Histórico recuperado de uma cópia de segurança.';return this.state}catch(e){this.message='Não foi possível migrar '+key+': '+e.message;this.canWrite=false;return this.state}
  }
  if(storage.getItem('painel-saude-carlos-v2')||storage.getItem('painel-saude-carlos-v1')){this.canWrite=false;this.message='Histórico anterior à v3 encontrado. Exporte pela v3 antes de migrar.'}
  return this.state;
 }
 commit(next,{checkpoint=false,recover=false}={}){
  validateData(next.data);if(!this.canWrite&&!recover)throw Error('Armazenamento indisponível para gravação.');
  const current=this.storage.getItem(KEYS.main);if(current!==this.raw)throw Error('O histórico mudou em outra janela. Exporte o rascunho e reabra o painel antes de salvar.');
  const raw=JSON.stringify(next);
  if(checkpoint)this.storage.setItem(KEYS.rollback,JSON.stringify(this.state));
  if(current){try{importBackup(JSON.parse(current));this.storage.setItem(KEYS.bak,current)}catch(e){if(!recover)throw e}}
  this.storage.setItem(KEYS.main,raw);
  if(this.storage.getItem(KEYS.main)!==raw)throw Error('Gravação não confirmada.');
  this.raw=raw;this.state=clone(next);this.canWrite=true;return this.state;
 }
 saveDraft(draft){this.storage.setItem(KEYS.draft,JSON.stringify({updatedAt:new Date().toISOString(),rascunho:draft}))}
 readDraft(){
  // A v4 tombstone prevents an old v3 draft from returning after a saved v4 session.
  const saved=this.storage.getItem(KEYS.draft);const raw=saved===null?this.storage.getItem(KEYS.v3draft):saved;
  try{return raw?JSON.parse(raw).rascunho:null}catch{return null}
 }
 clearDraft(){this.storage.setItem(KEYS.draft,JSON.stringify({rascunho:null}))}
}
