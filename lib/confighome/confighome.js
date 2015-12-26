import bus from 'bus';
import debug from 'debug';
import page from 'page';
import { dom as render } from '../render/render';
import o from 'component-dom';
import config from '../config/config';
import { clearConfig, findConfigAll } from '../confighome-middlewares/confighome-middlewares';
import Richtext from '../richtext/richtext.js';
import template from './admin-container.jade';
import ConfigHome from '../confighome-admin/view';

const log = debug('democracyos:homepage');


page('/confighome', clearConfig, findConfigAll, (ctx, next) => {
    let container = render(template);
    
    // prepare wrapper and container
    o('#content').empty().append(container);
    
    let form = new ConfigHome(ctx.confighome);
    form.replace('.admin-content');
  }
);