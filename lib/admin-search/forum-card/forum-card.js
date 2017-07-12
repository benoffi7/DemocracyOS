/**
 * Module Dependencies
 */

import dom from 'component-dom';
import Trianglify from 'trianglify';
import view from '../../view/mixin';
import template from './template.jade';
import moment from 'moment';
import o from 'component-dom';
import * as serializer from '../../proposal/body-serializer';

export default class ForumCard extends view('appendable') {
  constructor(options = {}) {
    options.template = template;
    
    var topic= options.law;
    
    options.locals = { topic: topic };
    super(options);
    this.topic = options.topic;

    //requestAnimationFrame(this.renderBackground.bind(this), 0);
  }

}
