import debug from 'debug';
import page from 'page';
import confighomeStore from '../confighome-store/confighome-store';

const log = debug('democracyos:confighome-middlewares');

export function clearConfig (ctx, next) {
  confighomeStore.clear();
  next();
}
//Trae solo la configuracion basica
export function findConfig(ctx, next) {
      
  confighomeStore.findConfig(ctx).then(confighome => {
    ctx.confighome = confighome;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load confighome`);
	console.log(`Unable to load confighome`);
  });
}
//Trae toda la configuracion
export function findConfigAll(ctx, next) {
      
  confighomeStore.findConfigAll(ctx).then(confighome => {
    ctx.confighome = confighome;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load confighome`);
	console.log(`Unable to load confighome`);
  });
}