import t from 't-component';
import FormView from '../form-view/form-view';
import template from './template.jade';
import page from 'page';

export default class LabelForm extends FormView {

  constructor(label) {
    super();
    this.setOptions(label);
    super(template, this.options);
  }
  
  /**
   * Build view's `this.el`
   */

  setOptions(label) {
    this.action = '/api/labels/';
    if (label) {
      this.action += label.id;
      this.title = 'admin-labels-form.title.edit';
    } else {
      this.action += 'create';
      this.title = 'admin-labels-form.title.create';
    }

    this.options = {
      form: { title: this.title, action: this.action },
      label: label || { clauses: [] }
    };
  }
  
  switchOn() {
    this.on('success', this.bound('onsuccess'));
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
    page('/admin/labels');
    //this.messages([t('admin-labels-form.message.onsuccess')]);
  }
}