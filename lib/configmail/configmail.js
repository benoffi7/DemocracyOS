import title from '../title/title.js';
import page from 'page';
import o from 'component-dom';
import user from '../user/user.js';
import { dom } from '../render/render.js';
import GenericConfigForm from '../configmail-genericConfig/view.js';
import configmail from './configmail-container.jade';
import config from '../config/config.js';
import { clearConfig, findConfig } from '../configmail-middlewares/configmail-middlewares'

/**
 * Check if page is valid
 */

let valid = (ctx, next) => {
  var page = ctx.params.page || "welcome-email";
  ctx.params.page= page;
  var valid = ['welcome-email', 'reset-password', 'topic-published', 'new-comment', 'topic-close'];
  return ctx.valid = ~valid.indexOf(page), next();
};


page('/configmail/:page?', valid, user.required, clearConfig, findConfig, (ctx, next) => {
  if (!ctx.valid) {
    return next();
  }

  let page = ctx.params.page || "welcome-email";
  
  let container = o(dom(configmail));
  let content = o('.configmail-content', container);

  let genericConfig = new GenericConfigForm(page, ctx.configmail);

  // prepare wrapper and container
  o('#content').empty().append(container);

  // set active section on sidebar
  if (o('.active', container)) {
    o('.active', container).removeClass('active');
  }

  o('[href="/configmail/' + page + '"]', container).addClass('active');

  // Set page's title
  title(o('[href="/configmail/' + page + '"]').html());

  // render all configmail pages
  genericConfig.appendTo(content);

  // Display current configmail page
  o("#genericConfig-wrapper", container).removeClass('hide');
});
