/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import template from './template.jade';
import labelStore from '../label-store/label-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';
import config from '../config/config';

import bus from 'bus';

const log = debug('democracyos:admin-label');

/**
 * Creates a list view of tags
 */

export default class LabelList extends View {
  constructor(labels, forum = null) {
    super(template, { labels, moment, forum, config });
  }

  switchOn() {
    this.bind('click', '.btn.delete-label', this.bound('ondeletelabelclick'));
    this.bind('click', '.btn.reactive-label', this.bound('onreactivatelabelclick'));
    this.list = new List('labels-wrapper', { valueNames: ['label-title'] });
  }

  ondeletelabelclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const labelId = el.getAttribute('data-labelid');

    const _t = s => t(`admin-labels-form.delete-label.confirmation.${s}`);

    const onconfirmdelete = (ok) => {
      if (!ok) return;
      
      labelStore.destroy(labelId)
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
  
  onreactivatelabelclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const labelId = el.getAttribute('data-labelid');

    const _t = s => t(`admin-labels-form.reactivate-label.confirmation.${s}`);

    const onconfirmreactive = (ok) => {
      if (!ok) return;
      
      labelStore.reactivate(labelId)
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