/**
 * Module Dependencies
 */

import dom from 'component-dom';
import Trianglify from 'trianglify';
import view from '../../view/mixin';
import template from './template.jade';
import o from 'component-dom';
import * as serializer from '../../proposal/body-serializer';

export default class ForumCard extends view('appendable') {
  constructor(options = {}) {
    options.template = template;
    
    var law= options.law;
    
    var div = document.createElement('div');
    div.innerHTML = serializer.toHTML(law.clauses);
    var el = o(div);
    law.clauses = el.text();
    
    options.locals = { law: law };
    super(options);
    this.law = options.law;

    //requestAnimationFrame(this.renderBackground.bind(this), 0);
  }

//  renderBackground() {
//    let l = this.forum.id.length;
//    const opts = {
//      seed: parseInt(this.forum.id.slice(l - 9, l - 1), 16),
//      palette: palette
//    };
//
//    var pattern = new Trianglify(opts);
//    var cover = this.el.querySelector('.cover');
//    dom(cover).css('background-image', `url(${pattern.png()})`);
//  }
}
