import t from 't-component';
import debug from 'debug';
import user from '../user/user.js';
import config from '../config/config.js';
import request from '../request/request.js';
import SideComments from 'democracyos-side-comments';
import View from '../view/view.js';
import template from './template.jade';

let log = debug('democracyos:proposal-modal');

export default class ProposalModal extends View {

  constructor (topic) {
    super(template, { topic: topic, baseUrl: window.location.origin });
    this.topic = topic;
    this.bind('mouseup', 'button.dont-show', 'vote');
    this.bind('mousedown', 'button.dont-show', this.bound('vote'));
    console.log(this.find('button.dont-show'));
  }

  vote(ev){
    alert("Por Aqui");
    console.log("Si");
  }
  
  switchOn () {
    console.log("adsads");
//    this.bind('click', 'button.dont-show', 'hola');
  }
  
}
