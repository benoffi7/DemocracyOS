import debug from 'debug';
import page from 'page';
import labelStore from '../label-store/label-store';

const log = debug('democracyos:label-middlewares');

/**
 * Clear tag store, to force a fetch to server on next call
 */

export function clearLabelsStore (ctx, next) {
  labelStore.clear();
  next();
}

export function findAllLabels(ctx, next) {
  labelStore.findAll().then(labels => {
    ctx.labels = labels;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load label`);
  });
}

export function findAllActiveLabels(ctx, next) {
  labelStore.findAllActive().then(labels => {
    ctx.labels = labels;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load label`);
  });
}

/**
 * Load specific tag from context params
 */

export function findLabel(ctx, next) {
  labelStore
    .findOne(ctx.params.id)
    .then(label => {
      ctx.label = label;
      return next();
    })
    .catch(err => {
      if (404 !== err.status) throw err;
      const message = 'Unable to load label for ' + ctx.params.id;
      return log(message, err);
    });
}