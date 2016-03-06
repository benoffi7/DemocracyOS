/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import favorites from './favorites.jade';

import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';

import page from 'page';
import o from 'component-dom';
import urlBuilder from '../url-builder/url-builder';

import { findTopicsFavorites, clearTopicStore } from '../topic-middlewares/topic-middlewares';

page('/favorites', user.required, clearTopicStore, findTopicsFavorites, ctx => { 

  let container = render(favorites, {topics: ctx.topics});
    
  // prepare wrapper and container
  o('#content').empty().append(container);
  
});