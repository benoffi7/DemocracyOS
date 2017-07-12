import debug from 'debug';
import page from 'page';
import votesStore from '../votes-store/votes-store';

const log = debug('democracyos:votes-middlewares');

export function clearTopicVotesStore (ctx, next) {
  votesStore.clear();
  next();
}
//Trae solo la configuracion basica
export function findTopicVotes(ctx, next) {
      
  votesStore.findAllVotes(ctx.topic.id).then(votes => {
    ctx.votes = votes;
    next();
  }).catch(err => {
    if (404 !== err.status) throw err;
    log(`Unable to load votes`);
    console.log(`Unable to load votes`);
  });
}