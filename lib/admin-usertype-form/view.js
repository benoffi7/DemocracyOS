import t from 't-component';
import FormView from '../form-view/form-view';
import template from './template.jade';
import page from 'page';

export default class UserTypeForm extends FormView {

  constructor(usertype) {
    super();
    this.setOptions(usertype);
    super(template, this.options);
  }
  
  /**
   * Build view's `this.el`
   */

  setOptions(usertype) {
    this.action = '/api-image/userstypes/';
    if (usertype) {
      this.action += usertype.id;
      this.title = 'admin-userstypes-form.title.edit';
    } else {
      this.action += 'create';
      this.title = 'admin-userstypes-form.title.create';
    }

    this.options = {
      form: { title: this.title, action: this.action },
      usertype: usertype || { clauses: [] }
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
    page('/admin/userstypes');
    //this.messages([t('admin-usertype-form.message.onsuccess')]);
  }

  onimageclick(ev) {
    this.find('input[name="image"]').removeClass('error');
  }
}