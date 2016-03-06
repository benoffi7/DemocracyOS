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
import Toggle from 'democracyos-toggle';
import usertypeStore from '../usertype-store/usertype-store';

import bus from 'bus';

const log = debug('democracyos:admin-userlist');

/**
 * Creates a list view of tags
 */

export default class UserTypeProject extends View {
  constructor(projects, userstypes, actualUsertype = null) {
    super();
    this.setOptions(projects, userstypes, actualUsertype);
    this.projects= projects;
    if(actualUsertype){
        this.projects.forEach(project => {           
            for (var i = 0; i < actualUsertype.projectsTypes.length; i++) {
                if(actualUsertype.projectsTypes[i] == project.id){
                     project.isEnabled= true;
                }
            }           
        });
    }
    super(template, this.options);
    this.appendToggles();
    
    //super(template, { userlist, moment, forum });
  }

  setOptions(projects, userstypes, actualUsertype) {
    let actualId= 0;
    if(actualUsertype){
        actualId= actualUsertype.id;
    }
    this.options = {
      projects: projects,
      userstypes: userstypes,
      actualUsertype: actualUsertype,
      actualUsertypeId: actualId
    };     
  }

  switchOn() {
    this.bind('click', '.list-group-item .form-group.checkbox .off', this.bound('addProject'));
    this.bind('mouseup', 'a.list-group-item .form-group.checkbox .off', this.bound('addProject'));
    this.bind('mouseup', 'a.list-group-item .form-group.checkbox .on', this.bound('deleteProject'));
    
//    this.bind('click', '.favorite #add-favorite-option', 'addFavorite');
    this.bind('change', '.select.filterUsertype', this.bound('filter'));
  }
  
  filter(ev) {
    ev.preventDefault();
    var el = ev.target;
    var usertype= el.value;
    if(usertype == "0"){
        page('/admin/usertype-project');
    }else{
        page('/admin/usertype-project/' + usertype );
    }
  };
  
  appendToggles () {
    let self = this;
    this.projects.forEach(project => {
      let toggle = new Toggle();
      toggle.label(t('settings-notifications.yes'), t('settings-notifications.no'));
      toggle.name(project.hash);
      if (project.isEnabled) toggle.value(true);
      let el = self.el.find('.' + project.hash);
      el.prepend(toggle.el);
    });
  }

  addProject(ev){
    let el = ev.target.parentElement.parentElement;
    let id = el.getAttribute('data-projectid');

//    ev.preventDefault();

    usertypeStore.addProject(this.options.actualUsertypeId, id).then(() => {
        
    }).catch(err => {
        console.log(err);
        log('Failed cast %s for %s with error: %j', value, id, err);
    });
  }
  
  deleteProject(ev){
    let el = ev.target.parentElement.parentElement;
    let id = el.getAttribute('data-projectid');

//    ev.preventDefault();

    usertypeStore.deleteProject(this.options.actualUsertypeId, id).then(() => {
        
    }).catch(err => {
        console.log(err);
        log('Failed cast %s for %s with error: %j', value, id, err);
    });
  }

}