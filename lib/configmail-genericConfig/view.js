import debug from 'debug';
import t from 't-component';
import o from 'component-dom';
import { dom as render } from '../render/render.js';
import request from '../request/request.js';
import moment from 'moment';
import user from '../user/user.js';
import FormView from '../form-view/form-view';
import template from './template.jade';
import config from '../config/config';
import Richtext from '../richtext/richtext.js';
import * as serializer from '../proposal/body-serializer';

let log = debug('democracyos:configmail-genericConfig');

export default class GenericConfigForm extends FormView {

  /**
   * Creates a profile edit view
   */

  constructor (page, configmail) {
    super();
    this.setLocals(page, configmail);
    super(template, this.locals);

    var body = this.find('textarea[name=body]');
    new Richtext(body);
  }


  /**
   * Set locals for template
   */

  setLocals(page, configmail) {
    configmail.body = serializer.toHTML(configmail.clause);

    this.configmail = configmail;
    let keywords= [];
    if(page === "welcome-email"){
        keywords= ['VALIDATE_MAIL_URL: Indica la url para validar el mail', 'USER_NAME: Indica el nombre de usuario'];
    }else if(page === "new-comment"){
        keywords= ['URL: Indica la url del topic donde se realizo el comentario', 'USER_NAME: Indica el nombre de usuario'];
    }else if(page === "topic-published"){
        keywords= ['URL: Indica la url del topic publicado', 'TOPIC: Indica el nombre del topic', 'USER_NAME: Indica el nombre de usuario'];
    }else if(page === "reset-password"){
        keywords= ['RESET_PASSWORD_URL: Indica la url para recuperar la contrasena', 'USER_NAME: Indica el nombre de usuario'];
    }else if(page === "topic-close"){
        keywords= ['URL: Indica la url del topic publicado', 'TOPIC: Indica el nombre del topic', 'USER_NAME: Indica el nombre de usuario', 'HTML: Indica las barras de progreso'];
    }
    
    this.locals = {
      configmail: this.configmail || { clause: [] },
      page: page,
      keywords: keywords
    };
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.bind('click', 'a.save', this.bound('onsaveclick'));
    this.on('success', this.onsuccess);
  }

  onsaveclick(ev) {
    ev.preventDefault();
    this.find('form input[type=submit]')[0].click();
  }
  
  postserialize(data) {
    data = data || {};
    console.log(data)
    //data.clause= JSON.stringify(serializer.toArray(data.body));
    data.clause= serializer.toArray(data.body);
    delete data.body;

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
    var content = o('#content')[0];
    content.scrollTop = 0;
    // Forcefully re-render the form
    //page('/configmail');
    
    this.messages([t('configmail-form.message.onsuccess')]);
  }
  
}
