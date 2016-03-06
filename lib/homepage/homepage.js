import bus from 'bus';
import debug from 'debug';
import page from 'page';
import dom from 'component-dom';
import { domRender } from '../render/render';
import user from '../user/user';
import urlBuilder from '../url-builder/url-builder';
import noTopics from './no-topics.jade';
import createFirstTopic from './create-first-topic.jade';
import visibility from '../visibility/visibility';
import config from '../config/config';
import forumRouter from '../forum-router/forum-router';
import { findForum } from '../forum-middlewares/forum-middlewares';
import { findConfig } from '../confighome-middlewares/confighome-middlewares';
import { findTopicsHome, clearTopicStore } from '../topic-middlewares/topic-middlewares';

import { findAllActiveTags, findTagHome } from '../tag-middlewares/tag-middlewares';
import { findAllUserList } from '../userlist-middlewares/userlist-middlewares';
import { findAllActiveProjectsTypes } from '../projecttype-middlewares/projecttype-middlewares';

import topicStore from '../topic-store/topic-store';
import usertypeStore from '../usertype-store/usertype-store';
import topicFilter from '../topic-filter/topic-filter';
import title from '../title/title';
import { show as showTopic } from '../topic/topic';
import cookies from 'cookies-js';

import Landing from '../landing_1/view';

const log = debug('democracyos:homepage');



function initHomepage(ctx, next) {
  //document.body.classList.add('browser-page');
  document.body.classList.remove('browser-page');
  dom('#browser .app-content, #content').empty();
  next();
}

function firstTime(ctx, next){
  console.log(cookies.get('key'));
  
  if (cookies.get('key') != 'value') {
    console.log("Adding class open");
    debug('save %s');
    cookies.set('key', 'value');
    ctx.state.overlay = "overlay";
    ctx.save()
    dom('.huge-overlay').addClass("open");
  }else{
    console.log("Removing class open")
    dom('.huge-overlay').removeClass("open");
  }
  
  console.log(ctx);  
  next();
}

page('*',
	firstTime,
	(ctx, next) => {
		next();
	}
)

page(forumRouter('/'),
  initHomepage,
  clearTopicStore,
  user.optional,
  visibility,
  findForum,
  findTopicsHome,
  findAllActiveTags,
  findAllActiveProjectsTypes,
  findAllUserList,
  findConfig,
  (ctx, next) => {      
    let forum = ctx.forum;
    let topic = topicFilter.filter(ctx.topics)[0];

    if (!topic) {
      let content = dom('#content');
      content.append(domRender(noTopics));

      if (user.isAdmin(forum)) content.append(domRender(createFirstTopic, {
        url: urlBuilder.admin(forum) + '/topics/create'
      }));

//      bus.once('page:change', () => {
//        document.body.classList.remove('browser-page');
//      });

      bus.emit('page:render');
      return;
    }else{
      ctx.content = document.querySelector('#content');
      new Landing({
        container: ctx.content,
        topics: ctx.topics,
		tags: ctx.tags, 
		projects: ctx.projectstypes, 
		users: ctx.userlist
      });
    }

    title(config.multiForum ? forum.title : null);

    log(`render topic ${topic.id}`);

    let path;
    if (config.multiForum) {
      path = `${forum.url}topic/${topic.id}`;
    } else {
      path = `/topic/${topic.id}`;
    }
    
    console.log(ctx.confighome.text);
 
//    topicStore.findOne(topic.id).then(topicCon => {
//        topic= topicCon;
//        usertypeStore.findOne(topic.author.usertype).then(usertype => {
//            topic.author.usertype= usertype;
//            showTopic(topic);
//        })
//    });
  }
);

page(forumRouter('/comision/:hashTag'),
  initHomepage,
  clearTopicStore,
  user.optional,
  visibility,
  findForum,
  findTagHome,
  findTopicsHome,  
  findAllActiveProjectsTypes,
  findAllUserList,
  findConfig,
  (ctx, next) => {      
    let forum = ctx.forum;
    let topic = topicFilter.filter(ctx.topics)[0];

    if (!topic) {
      let content = dom('#content');
      content.append(domRender(noTopics));

      if (user.isAdmin(forum)) content.append(domRender(createFirstTopic, {
        url: urlBuilder.admin(forum) + '/topics/create'
      }));

//      bus.once('page:change', () => {
//        document.body.classList.remove('browser-page');
//      });

      bus.emit('page:render');
      return;
    }else{
      ctx.content = document.querySelector('#content');
      new Landing({
        container: ctx.content,
        topics: ctx.topics,
		tags: {}, 
		projects: ctx.projectstypes, 
		users: ctx.userlist,
                defaultTag: ctx.tag
      });
    }

    title(config.multiForum ? forum.title : null);

    log(`render topic ${topic.id}`);

    let path;
    if (config.multiForum) {
      path = `${forum.url}topic/${topic.id}`;
    } else {
      path = `/topic/${topic.id}`;
    }
    
    console.log(ctx.confighome.text);

  }
);
