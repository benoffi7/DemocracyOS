/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import template from './admin-container.jade';
import Sidebar from '../admin-sidebar/admin-sidebar';

import TopicsListView from '../admin-topics/view';
import TopicForm from '../admin-topics-form/view';
import TagsList from '../admin-tags/view';
import TagForm from '../admin-tags-form/view';

import UserTypeList from '../admin-usertype/view';
import UserTypeForm from '../admin-usertype-form/view';

import UserList from '../admin-userlist/view';
import UserForm from '../admin-userlist-form/view';

import ProjectTypeList from '../admin-projecttype/view';
import ProjectTypeForm from '../admin-projecttype-form/view';

import LabelList from '../admin-label/view';
import LabelForm from '../admin-label-form/view';

import UserTypeProject from '../admin-usertype-project/view';

import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';

import topicStore from '../topic-store/topic-store';
import usertypeStore from '../usertype-store/usertype-store';

import page from 'page';
import o from 'component-dom';
import forumRouter from '../forum-router/forum-router';
import urlBuilder from '../url-builder/url-builder';

import { findForum } from '../forum-middlewares/forum-middlewares';
import { findPrivateTopics, findTopic } from '../topic-middlewares/topic-middlewares';
import { findAllTags, findAllActiveTags, findTag, clearTagStore } from '../tag-middlewares/tag-middlewares';
import { findAllUsersTypes, findAllActiveUsersTypes, findUserType, findUserTypeOfUser, clearUsersTypesStore } from '../usertype-middlewares/usertype-middlewares';
import { findAllUserList, findAllFilterUserList, findUser, clearUserListStore } from '../userlist-middlewares/userlist-middlewares';
import { findAllProjectsTypes, findAllActiveProjectsTypes, findAllActiveProjectsTypesOfUsertype, findProjectType, clearProjectsTypesStore } from '../projecttype-middlewares/projecttype-middlewares';
import { findAllLabels, findAllActiveLabels, findLabel, clearLabelsStore } from '../label-middlewares/label-middlewares';

page(forumRouter('/admin/*'),
  valid,
  findForum,
  user.required,
  user.hasAccessToForumAdmin,
  (ctx, next) => {      
    let section = ctx.section;
    let container = render(template);
    
    // prepare wrapper and container
    o('#content').empty().append(container);
    
    // set active section on sidebar
    ctx.sidebar = new Sidebar(ctx.forum);
    ctx.sidebar.set(section);
    ctx.sidebar.appendTo(o('.sidebar-container', container)[0]);
    
    // Set page's title
    title();
   
    // if all good, then jump to section route handler
    next();
  }
);

page(forumRouter('/admin'), findForum, ctx => {
  page.redirect(urlBuilder.admin(ctx.forum) + '/topics');
});

page(forumRouter('/admin/topics'), findPrivateTopics, ctx => {
  let currentPath = ctx.path;
  let topicsList = new TopicsListView(ctx.topics, ctx.forum);
  topicsList.replace('.admin-content');
  ctx.sidebar.set('topics');

  const onTopicsUpdate = () => { page(currentPath); };
  bus.once('topic-store:update:all', onTopicsUpdate);
  bus.once('page:change', () => {      
    bus.off('topic-store:update:all', onTopicsUpdate);
  });
});

page(forumRouter('/admin/topics/create'), clearTagStore, findAllActiveTags,
                                        clearProjectsTypesStore, findUserTypeOfUser,
                                        findAllActiveProjectsTypesOfUsertype, findAllUserList, ctx => {
  
  ctx.sidebar.set('topics');
  // render new topic form
  let form = new TopicForm(null, ctx.forum, ctx.tags, ctx.projectstypes, ctx.userlist);
  form.replace('.admin-content');
  form.once('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/topics/:id'), clearTagStore, findAllActiveTags,
                                    clearProjectsTypesStore, findUserTypeOfUser,
                                    findAllActiveProjectsTypesOfUsertype, findAllActiveLabels,
                                    findTopic, findAllUserList, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('topics');

  // render topic form for editio
  let form = new TopicForm(ctx.topic, ctx.forum, ctx.tags, ctx.projectstypes, ctx.userlist, ctx.labels);
  form.replace('.admin-content');
  form.on('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/tags'), clearTagStore, findAllTags, ctx => {
  let currentPath = ctx.path;  
  const tagsList = new TagsList({
    forum: ctx.forum,
    tags: ctx.tags,
    config: config
  });

  tagsList.replace('.admin-content');
  ctx.sidebar.set('tags');
  
  const onTagListUpdate = () => {page(currentPath); };
  bus.once('tag-store:update:all', onTagListUpdate);
  bus.once('page:change', () => {      
    bus.off('tag-store:update:all', onTagListUpdate);
  });
});

page(forumRouter('/admin/tags/create'), ctx => {
  let form = new TagForm();
  form.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/:id'), findTag, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('tags');

  // render topic form for edition
  let form = new TagForm(ctx.tag);
  form.replace('.admin-content');
});

if (config.usersWhitelist) {
  require('../admin-whitelists/admin-whitelists.js');
  require('../admin-whitelists-form/admin-whitelists-form.js');
}


/* UserType Begin*/

page(forumRouter('/admin/userstypes'), clearUsersTypesStore, findAllUsersTypes, ctx => {
  let currentPath = ctx.path;
  let userTypeList = new UserTypeList(ctx.userstypes, ctx.forum);
  userTypeList.replace('.admin-content');
  ctx.sidebar.set('userstypes');

  const onUserTypeUpdate = () => {page(currentPath); };
  bus.once('userstypes-store:update:all', onUserTypeUpdate);
  bus.once('page:change', () => {      
    bus.off('userstypes-store:update:all', onUserTypeUpdate);
  });
});

page('/admin/userstypes/create', ctx => {
  let form = new UserTypeForm();
  form.replace('.admin-content');
  ctx.sidebar.set('userstypes');
});

page('/admin/userstypes/:id', findUserType, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('userstypes');

  // render usertype form for edition
  let form = new UserTypeForm(ctx.usertype);
  form.replace('.admin-content');
});

/* END UserType */

/* UserList Begin*/

page(forumRouter('/admin/userlist'), clearUserListStore, findAllFilterUserList, ctx => {
  let currentPath = ctx.path;
  let userList = new UserList(ctx.userlist, ctx.level, ctx.state, ctx.forum);
  userList.replace('.admin-content');
  ctx.sidebar.set('userlist');

  const onUserListUpdate = () => {page(currentPath); };
  bus.once('user-store:update:all', onUserListUpdate);
  bus.once('page:change', () => {      
    bus.off('user-store:update:all', onUserListUpdate);
  });
});

page('/admin/userlist/level/:level/state/:state', clearUserListStore, findAllFilterUserList, ctx => {
    let currentPath = ctx.path;
    let userList = new UserList(ctx.userlist, ctx.params.level, ctx.params.state, ctx.forum);
    userList.replace('.admin-content');
    ctx.sidebar.set('userlist');
    
    const onUserListUpdate = () => {page(currentPath); };
    bus.once('user-store:update:all', onUserListUpdate);
    bus.once('page:change', () => {      
      bus.off('user-store:update:all', onUserListUpdate);
    });
});

page('/admin/userlist/create', clearUsersTypesStore, findAllActiveUsersTypes, ctx => {
  let form = new UserForm(null, ctx.userstypes);
  form.replace('.admin-content');
  ctx.sidebar.set('userlist');
});

page('/admin/userlist/:id', findUser, clearUsersTypesStore, findAllActiveUsersTypes, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('userlist');

  // render usertype form for edition
  let form = new UserForm(ctx.userlist, ctx.userstypes);
  form.replace('.admin-content');
});

/*
 * END UserList
 */

/*
 Begin ProjectType
 */

page('/admin/projectstypes', clearProjectsTypesStore, findAllProjectsTypes, ctx => {
  let currentPath = ctx.path;
  let projectTypeList = new ProjectTypeList(ctx.projectstypes, ctx.forum);
  projectTypeList.replace('.admin-content');
  ctx.sidebar.set('projectstypes');

  const onProjectTypeListUpdate = () => {page(currentPath); };
  bus.once('projectstypes-store:update:all', onProjectTypeListUpdate);
  bus.once('page:change', () => {      
    bus.off('projectstypes-store:update:all', onProjectTypeListUpdate);
  });
});

page('/admin/projectstypes/create', ctx => {
  let form = new ProjectTypeForm();
  form.replace('.admin-content');
  ctx.sidebar.set('projectstypes');
});

page('/admin/projectstypes/:id', findProjectType, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('projectstypes');

  // render usertype form for edition
  let form = new ProjectTypeForm(ctx.projecttype);
  form.replace('.admin-content');
});


/* 
 * Label Begin
 */

page('/admin/labels', clearLabelsStore, findAllLabels, ctx => {
  let currentPath = ctx.path;
  let labelList = new LabelList(ctx.labels, ctx.forum);
  labelList.replace('.admin-content');
  ctx.sidebar.set('labels');

  const onLabelListUpdate = () => {page(currentPath); };
  bus.once('labels-store:update:all', onLabelListUpdate);
  bus.once('page:change', () => {      
    bus.off('labels-store:update:all', onLabelListUpdate);
  });
});

page('/admin/labels/create', ctx => {
  let form = new LabelForm();
  form.replace('.admin-content');
  ctx.sidebar.set('labels');
});

page('/admin/labels/:id', findLabel, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('labels');

  // render usertype form for edition
  let form = new LabelForm(ctx.label);
  form.replace('.admin-content');
});


/**
 * UserType-Project
 */
page('/admin/usertype-project', clearProjectsTypesStore, findAllActiveProjectsTypes
    ,clearUsersTypesStore, findAllActiveUsersTypes, ctx => {
  
  ctx.sidebar.set('usertype-project');
  let userTypeProject = new UserTypeProject(ctx.projectstypes, ctx.userstypes);
  userTypeProject.replace('.admin-content');
  
});

page('/admin/usertype-project/:id', clearProjectsTypesStore, findAllActiveProjectsTypes
    ,clearUsersTypesStore, findAllActiveUsersTypes, findUserType, ctx => {
  
  ctx.sidebar.set('usertype-project');
  let userTypeProject = new UserTypeProject(ctx.projectstypes, ctx.userstypes, ctx.usertype);
  userTypeProject.replace('.admin-content');
  
});

/**
 * Check if page is valid
 */

function valid(ctx, next) {    
  let section = ctx.section = ctx.params[0];
  if (/topics|tags|users|userlist|userstypes|projectstypes|labels|usertype-project/.test(section)) return next();
  if (/topics|tags|users|userlist|userstypes|projectstypes|labels|usertype-project\/create/.test(section)) return next();
  if (/topics|tags|users|userlist|userstypes|projectstypes|labels|usertype-project\/[a-z0-9]{24}\/?$/.test(section)) return next();
}
