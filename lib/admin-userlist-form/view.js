import t from 't-component';
import FormView from '../form-view/form-view';
import template from './template.jade';
import page from 'page';

export default class UserForm extends FormView {

  constructor(user, userstypes) {
    super();
    this.setOptions(user, userstypes);
    super(template, this.options);
  }
  
  /**
   * Build view's `this.el`
   */

  setOptions(user, userstypes) {
    this.action = '/api/user/';
    if (user != null) {
      this.action += user.id;
      this.title = 'admin-userlist-form.title.edit';
    } else {
      this.action += 'create';
      this.title = 'admin-userlist-form.title.create';
    }

    this.options = {
      form: { title: this.title, action: this.action },
      levels: {0: ["Publicador"], 1: ["Staff"]},
      userstypes: userstypes,
      userlist: user || { clauses: [] }
    };
  }
  
  switchOn() {
    this.on('success', this.bound('onsuccess'));
    this.bind('click', 'input[name="image"]', this.bound('onimageclick'));
  }
  
  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess(res) {
    this.onsave();
  }

  onsave() {
    page('/admin/userlist');
    //this.messages([t('admin-userlist-form.message.onsuccess')]);
  }

}