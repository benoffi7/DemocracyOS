/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import template from './template.jade';
import projecttypeStore from '../projecttype-store/projecttype-store';
import topicStore from '../topic-store/topic-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';
import config from '../config/config';

import bus from 'bus';

const log = debug('democracyos:admin-projecttype');

/**
 * Creates a list view of tags
 */

export default class ProjectTypeList extends View {
  constructor(projectstypes, forum = null) {
    super(template, { projectstypes, moment, forum, config });
  }

  switchOn() {
    this.bind('click', '.btn.delete-projecttype', this.bound('ondeleteprojecttypeclick'));
    this.bind('click', '.btn.reactive-projecttype', this.bound('onreactivateprojecttypeclick'));
    this.list = new List('projectstypes-wrapper', { valueNames: ['projecttype-title'] });
  }

  ondeleteprojecttypeclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const projectTypeId = el.getAttribute('data-projecttypeid');

    const _t = s => t(`admin-projectstypes-form.delete-project.confirmation.${s}`);

    const onconfirmdelete = (ok) => {
      if (!ok) return;
      
      projecttypeStore.destroy(projectTypeId)
        .catch(err => { log('Found error %o', err); });
      topicStore.findAll();
    };

    confirm(_t('title'), _t('body'))
      .cancel(_t('cancel'))
      .ok(_t('ok'))
      .modal()
      .closable()
      .effect('slide')
      .show(onconfirmdelete);
  }
  
  onreactivateprojecttypeclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const projectTypeId = el.getAttribute('data-projecttypeid');

    const _t = s => t(`admin-projectstypes-form.reactivate-project.confirmation.${s}`);

    const onconfirmreactive = (ok) => {
      if (!ok) return;
      
      projecttypeStore.reactivate(projectTypeId)
        .catch(err => { log('Found error %o', err); });
    };

    confirm(_t('title'), _t('body'))
      .cancel(_t('cancel'))
      .ok(_t('ok'))
      .modal()
      .closable()
      .effect('slide')
      .show(onconfirmreactive);
  }
}