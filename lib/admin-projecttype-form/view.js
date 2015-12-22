import t from 't-component';
import FormView from '../form-view/form-view';
import template from './template.jade';
import page from 'page';

export default class ProjectTypeForm extends FormView {

  constructor(projecttype) {
    super();
    this.setOptions(projecttype);
    super(template, this.options);
  }
  
  /**
   * Build view's `this.el`
   */

  setOptions(projecttype) {
    this.action = '/api/projectstypes/';
    if (projecttype) {
      this.action += projecttype.id;
      this.title = 'admin-projectstypes-form.title.edit';
    } else {
      this.action += 'create';
      this.title = 'admin-projectstypes-form.title.create';
    }

    this.options = {
      form: { title: this.title, action: this.action },
      projecttype: projecttype || { clauses: [] }
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
    page('/admin/projectstypes');
    //this.messages([t('admin-projectstypes-form.message.onsuccess')]);
  }
}