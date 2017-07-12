import t from 't-component';
import debug from 'debug';
import user from '../user/user.js';
import config from '../config/config.js';
import request from '../request/request.js';
import View from '../view/view.js';
import template from './template.jade';
import userlistStore from '../userlist-store/userlist-store';

let log = debug('democracyos:profile-data');

export default class ProfileData extends View {

  constructor (tag) {
    super(template, {user});
    
    this.tag= tag;
    
    if(user.id){
        let suscripto= false;
        for (var i in user.subscriptions.tag) {
            if(user.subscriptions.tag[i] == tag.id){
                suscripto= true;
                break;
            }        
        }

        if(suscripto){
            this.find('#delete-subscription').removeClass('hide');
        }else{
            this.find('#add-subscription').removeClass('hide');        
        }

        this.bind('click', '#add-subscription', 'addSubscriptionsTag');
        this.bind('click', '#delete-subscription', 'deleteSubscriptionsTag');
    }
  }

  addSubscriptionsTag (ev) {
    let value;
    let id = this.tag.id;

    ev.preventDefault();

    if (user.id) {
      userlistStore.addSubscriptionsTag(user.id, id).then(() => {
        userlistStore.clear();
        userlistStore.findOne(user.id).then(userUpdate => {
            console.log(userUpdate);
            user.subscriptions= userUpdate.subscriptions;
            //user.set({favorites: userUpdate.favorites});
            this.find('#add-subscription').addClass('hide'); 
            this.find('#delete-subscription').removeClass('hide');
        }).catch(err => {
            log("Failed");
        });
      }).catch(err => {
        console.log(err);
        log('Failed cast %s for %s with error: %j', value, id, err);
      });
    }
  }
  
  deleteSubscriptionsTag (ev) {
    let value;
    let id = this.tag.id;

    ev.preventDefault();

    if (user.id) {
      userlistStore.deleteSubscriptionsTag(user.id, id).then(() => {
        userlistStore.clear();
        userlistStore.findOne(user.id).then(userUpdate => {
            console.log(userUpdate);
            user.subscriptions= userUpdate.subscriptions;
            //user.set({favorites: userUpdate.favorites});
            this.find('#add-subscription').removeClass('hide'); 
            this.find('#delete-subscription').addClass('hide');
        }).catch(err => {
            log("Failed");
        });        
      }).catch(err => {
        console.log(err);
        log('Failed cast %s for %s with error: %j', value, id, err);
      });
    }
  }
}
