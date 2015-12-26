/**
 * Module dependencies.
 */

import closest from 'component-closest';
import confirm from 'democracyos-confirmation';
import FormView from '../form-view/form-view.js';
import debug from 'debug';
import o from 'component-dom';
import page from 'page';
import { dom as render } from '../render/render.js';
import request from '../request/request.js';
import t from 't-component';
import template from './template.jade';
import moment from 'moment';
import Richtext from '../richtext/richtext.js';
import Toggle from 'democracyos-toggle';
import * as serializer from '../proposal/body-serializer';
import topicStore from '../topic-store/topic-store';
import user from '../user/user';
import config from '../config/config.js';

const log = debug('democracyos:admin-topics-form');

/**
 * Expose TopicForm
 */

module.exports = ConfigHome;

/**
 * Creates a password edit view
 */
let created = false;

export default class ConfigHome extends FormView {

  constructor(confighome) {
    super();
    this.setLocals(confighome);
    super(template, this.locals);

    var body = this.find('textarea[name=body]');
    new Richtext(body);
    var bodyComo = this.find('textarea[name=bodyComo]');
    new Richtext(bodyComo);
  }

  /**
   * Set locals for template
   */

  setLocals(confighome) {
    confighome.body = serializer.toHTML(confighome.acercade);
    confighome.bodyComo = serializer.toHTML(confighome.comofunciona);

    this.confighome = confighome;
    
    this.locals = {
      confighome: this.confighome || { acercade: [], comofunciona: [] },
      logos: config.logos
    };
  }

  /**
   * Turn on event bindings
   */

  switchOn() {
    this.bind('click', 'a.save', this.bound('onsaveclick'));
    this.on('success', this.onsuccess);
  }
  
  onsaveclick(ev) {
    ev.preventDefault();
    this.find('form input[type=submit]')[0].click();
  }
  
  postserialize(data) {
    data = data || {};

    data.acercade = serializer.toArray(data.body);
    delete data.body;
    data.comofunciona = serializer.toArray(data.bodyComo);
    delete data.bodyComo;

    return data;
  }
  
  /**
   * Handle `error` event with
   * logging and display
   *
   * @param {String} error
   * @api private
   */

  onsuccess(res) {
    log('Topic successfully saved');
//    if (this.topic) {
//      topicStore.unset(this.topic.id).parse(res.body).then(topic => {
//        topicStore.set(topic.id, topic);
//      });
//    }

    var content = o('#content')[0];
    content.scrollTop = 0;
    // Forcefully re-render the form
    //page('/confighome');
    
    this.messages([t('confighome-form.message.onsuccess')]);
  }
}