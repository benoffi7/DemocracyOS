/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import template from './template.jade';
import usertypeStore from '../usertype-store/usertype-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';

import bus from 'bus';

const log = debug('democracyos:admin-usertype');

/**
 * Creates a list view of tags
 */

export default class UserTypeList extends View {
  constructor(userstypes, forum = null) {
    super(template, { userstypes, moment, forum });
  }

  switchOn() {
    this.bind('click', '.btn.delete-usertype', this.bound('ondeleteusertypeclick'));
    this.list = new List('userstypes-wrapper', { valueNames: ['usertype-title'] });
  }

  ondeleteusertypeclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const userTypeId = el.getAttribute('data-usertypeid');

    const _t = s => t(`admin-topics-form.delete-topic.confirmation.${s}`);

    const onconfirmdelete = (ok) => {
      if (!ok) return;
      alert(usertypeStore.item.get(userTypeId));
      usertypeStore.destroy(userTypeId)
        .catch(err => { log('Found error %o', err); });
    };

    confirm(_t('title'), _t('body'))
      .cancel(_t('cancel'))
      .ok(_t('ok'))
      .modal()
      .closable()
      .effect('slide')
      .show(onconfirmdelete);
  }

}