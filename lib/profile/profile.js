/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import acercadeTemplate from './profile.jade';

import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';

import page from 'page';
import o from 'component-dom';
import urlBuilder from '../url-builder/url-builder';

import { findUserProfile } from '../userlist-middlewares/userlist-middlewares';

page('/profile/:id', findUserProfile, ctx => {
  let user= ctx.userlist;
  let container = render(acercadeTemplate, {user});
    
  // prepare wrapper and container
  o('#content').empty().append(container);
});