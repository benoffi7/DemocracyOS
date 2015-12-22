/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import template from './template.jade';
import tagStore from '../tag-store/tag-store';
import topicStore from '../topic-store/topic-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';

import bus from 'bus';

const log = debug('democracyos:admin-tags');

/**
 * Creates a list view of tags
 */

export default class TagsListView extends View {
  constructor(options = {}) {
    super(template, options);
    this.options = options;
  }

  switchOn() {
    this.bind('click', '.btn.delete-tag', this.bound('ondeletetagclick'));
    this.bind('click', '.btn.reactive-tag', this.bound('onreactivatetagclick'));
    this.list = new List('tags-wrapper', { valueNames: ['tag-title'] });
  }

  ondeletetagclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const tagId = el.getAttribute('data-tagid');

    const _t = s => t(`admin-tags-form.delete-tag.confirmation.${s}`);

    const onconfirmdelete = (ok) => {
      if (!ok) return;
      
      tagStore.destroy(tagId)
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
  
  onreactivatetagclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const tagId = el.getAttribute('data-tagid');

    const _t = s => t(`admin-tags-form.reactivate-tag.confirmation.${s}`);

    const onconfirmreactive = (ok) => {
      if (!ok) return;
      
      tagStore.reactivate(tagId)
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
