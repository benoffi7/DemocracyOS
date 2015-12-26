/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import acercadeTemplate from './acerca-de.jade';
import comoFuncionaTemplate from './acerca-de.jade';

import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';
import {toHTML} from '../proposal/body-serializer';

import page from 'page';
import o from 'component-dom';
import urlBuilder from '../url-builder/url-builder';

import configHomeStore from '../confighome-store/confighome-store';
import { findConfigAll } from '../confighome-middlewares/confighome-middlewares';

page('/acerca-de', findConfigAll, ctx => {
  let contenido= ctx.confighome.acercade;
  let container = render(acercadeTemplate, {contenido, toHTML});
    
  // prepare wrapper and container
  o('#content').empty().append(container);
});

page('/como-funciona', findConfigAll, ctx => {
  let contenido= ctx.confighome.comofunciona;
  let container = render(comoFuncionaTemplate, {contenido, toHTML});
    
  // prepare wrapper and container
  o('#content').empty().append(container);
});