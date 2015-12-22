import debug from 'debug';
import page from 'page';
import confighomeStore from '../confighome-store/confighome-store';

const log = debug('democracyos:confighome-middlewares');

/**
 * Clear tag store, to force a fetch to server on next call
 */
/*
export function findConfig(ctx, next) {
  confighomeStore
    .findOne()
    .then(confighome => {
      ctx.confighome = confighome;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load confighome';
      return log(message, err);
    });
}*/

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