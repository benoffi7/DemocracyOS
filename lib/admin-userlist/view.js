/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import page from 'page';
import template from './template.jade';
import userlistStore from '../userlist-store/userlist-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';

import bus from 'bus';

const log = debug('democracyos:admin-userlist');

/**
 * Creates a list view of tags
 */

export default class UserList extends View {
  constructor(userlist, level, state, forum = null) {
    super();
    this.setOptions(userlist, forum, level, state);
    super(template, this.options);
    //super(template, { userlist, moment, forum });
  }

  setOptions(userlist, forum, level, state) {
    this.options = {
      userlist: userlist,
      moment: moment,
      levels: {0: ["Publicador"], 1: ["Staff"]},
      actualLevel: level,
      states: {1: ["Habilitado"], 0: ["Deshabilitado"]},
      actualState: state
  }; 
  }

  switchOn() {
    this.bind('click', '.btn.delete-user', this.bound('ondeleteuserlistclick'));
    this.bind('click', '.btn.reactive-user', this.bound('onreactivateclick'));
    this.bind('change', '.select.filterLevels', this.bound('filter'));
    this.bind('change', '.select.filterStates', this.bound('filter'));
    this.list = new List('userlist-wrapper', { valueNames: ['user-title', 'user-email'] });
  }
  
  filter(ev) {
    ev.preventDefault();
    var el = ev.target;
    //Cada select tiene el valor actual del otro select, entonces el que cambia de valor le pide el valor
    //actual y al mismo select le pido el valor actual del otro select
    //Hago asi porq no me anduvieron las funciones find()
    var level= el.value;
    var state= el.value;
    if(el.getAttribute('f-state') !== null){
        state= el.getAttribute('f-state');
    }else{
        level= el.getAttribute('f-level');
    }
//    alert(el.tagName + " " + el.getAttribute('f-state') + " " + el.getAttribute('f-level'));

    page('/admin/userlist/level/' + level + "/state/" + state);
  };

  ondeleteuserlistclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const userId = el.getAttribute('data-userid');

    const _t = s => t(`admin-userlist-form.delete-user.confirmation.${s}`);

    const onconfirmdelete = (ok) => {
      if (!ok) return;
      
      userlistStore.destroy(userId)
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
  
  onreactivateclick(ev) {
    ev.preventDefault();
    var el = ev.target.parentElement;
    /*Sin esto se rompe porque puede quedarse en el boton. NO BORRAR*/
    if(el.tagName=="BUTTON"){
	el = el.parentElement;
    }
    const userId = el.getAttribute('data-userid');

    const _t = s => t(`admin-userlist-form.reactivate-user.confirmation.${s}`);

    const onconfirmreactive = (ok) => {
      if (!ok) return;
      
      userlistStore.reactivate(userId)
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