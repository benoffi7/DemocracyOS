import bus from 'bus';
import debug from 'debug';
import page from 'page';
import dom from 'component-dom';
import config from '../config/config';
import { findConfig } from '../confighome-middlewares/confighome-middlewares';

const log = debug('democracyos:homepage');


page('/confighome', findConfig, (ctx, next) => {
   dom('#content').empty()
  }
);