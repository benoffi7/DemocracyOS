import View from '../view/view.js';
import Participants from '../participants-box/view.js';
import ProposalClauses from '../proposal-clauses/proposal-clauses.js';
import user from '../user/user';
import template from './template.jade';
import {toHTML} from '../proposal/body-serializer';
import tip from 'democracyos-tip';
import usertypeStore from '../usertype-store/usertype-store';
import userlistStore from '../userlist-store/userlist-store';

export default class ProposalArticle extends View {

  /**
   * Creates a new proposal-article view
   * from proposals object.
   *
   * @param {Object} proposal proposal's object data
   * @return {ProposalArticle} `ProposalArticle` instance.
   * @api public
   */

  constructor (proposal, user) {
    super();
    super(template, {
      proposal: proposal,
      baseUrl: window.location.origin,
      toHTML: toHTML
    });

    this.proposal = proposal;
    let participants = new Participants(proposal.participants || []);
    participants.appendTo(this.find('.participants')[0]);
    participants.fetch();

    // Enable side-comments
    this.proposalClauses = new ProposalClauses(proposal);
  }
  
  switchOn () {
    tip("#tol-usertype");
    
    this.bind('click', '.favorite #add-favorite-option', 'addFavorite');
    this.bind('click', '.favorite #delete-favorite-option', 'deleteFavorite');
    
    let favorite= false;
    for (var i in user.favorites) {
        if(user.favorites[i] == this.proposal.id){
            favorite= true;
            break;
        }        
    }

    if(favorite){
        this.find('#delete-favorite-option').removeClass('hide');
    }else{
        this.find('#add-favorite-option').removeClass('hide');        
    }
  }
  
  addFavorite (ev) {
    let value;
    let id = this.proposal.id;

    ev.preventDefault();

    if (user.id) {
      userlistStore.addFavorite(user.id, id).then(() => {
        userlistStore.clear();
        userlistStore.findOne(user.id).then(userUpdate => {
            console.log(userUpdate);
            user.favorites= userUpdate.favorites;
            user.set({favorites: userUpdate.favorites});
            this.find('#delete-favorite-option').removeClass('hide');
            this.find('#add-favorite-option').addClass('hide');
        }).catch(err => {
            log("Failed");
        });
      }).catch(err => {
        console.log(err);
        log('Failed cast %s for %s with error: %j', value, id, err);
      });
    }
  }
  
  deleteFavorite (ev) {
    let value;
    let id = this.proposal.id;

    ev.preventDefault();

    if (user.id) {
      userlistStore.deleteFavorite(user.id, id).then(() => {
        userlistStore.clear();
        userlistStore.findOne(user.id).then(userUpdate => {
            console.log(userUpdate);
            user.favorites= userUpdate.favorites;
            user.set({favorites: userUpdate.favorites});
            this.find('#add-favorite-option').removeClass('hide');
            this.find('#delete-favorite-option').addClass('hide');
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
