/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import acercadeTemplate from './profile.jade';

import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';

import page from 'page';
import o from 'component-dom';
import urlBuilder from '../url-builder/url-builder';

import Landing from '../landing_1/view';

import { findUserNameProfile } from '../userlist-middlewares/userlist-middlewares';
import { findTopicsHome, clearTopicStore, findTopicsUser } from '../topic-middlewares/topic-middlewares';
import { findAllActiveTags } from '../tag-middlewares/tag-middlewares';
import { findAllUserList } from '../userlist-middlewares/userlist-middlewares';
import { findAllActiveProjectsTypes } from '../projecttype-middlewares/projecttype-middlewares';

page('/profile/:username', findUserNameProfile, clearTopicStore,
    findTopicsHome, clearTopicStore, findTopicsUser, findAllActiveTags, findAllActiveProjectsTypes, 
//    findAllUserList,
    ctx => {
  let user= ctx.userProf;
  let topics= ctx.userTopics;
  
  let total= 0;
  let totalOpen= 0;
  let totalClosePos= 0;
  let totalCloseNeg= 0;
  let totalCloseIgu= 0;
  let totalTags= [];
  topics.forEach(function(topic) {
    total++;
    if(topic.open){
        totalOpen++;
    }else{
        if(topic.upvotes.length > topic.downvotes.length){
            totalClosePos++;
        }else if(topic.upvotes.length < topic.downvotes.length){
            totalCloseNeg++;
        }else{
            totalCloseIgu++;
        }
    }
    let guardado= false;
    totalTags.forEach(function (tag){
        if(tag.name == topic.tag.name){
           guardado= true;
           tag.total++;           
//           break;
        }
    });
    if(!guardado){
        totalTags.push({name: topic.tag.name, total: 1});
    }
    
  });
  console.log(totalTags);
  let estadistica= {
      total: total,
      totalOpen: totalOpen,
      totalClosePos: totalClosePos,
      totalCloseNeg: totalCloseNeg,
      totalCloseIgu: totalCloseIgu,
      totalTags: totalTags
  }
  let container = render(acercadeTemplate, {user, estadistica});
    
  // prepare wrapper and container
  o('#content').empty().append(container);
  
  ctx.content = document.querySelector('#content');
  new Landing({
    container: ctx.content,
    topics: ctx.topics,
        tags: ctx.tags, 
	projects: ctx.projectstypes, 
	users: {},
        defaultUser: ctx.userProf
  });
});