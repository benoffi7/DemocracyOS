import Store from '../store/store';
import request from '../request/request';
import config from '../config/config';
import forumStore from '../forum-store/forum-store';
import urlBuilder from '../url-builder/url-builder';

const voteOptions = ['negative', 'positive', 'neutral'];

class TopicStore extends Store {
  name () {
    return 'topic';
  }

  findAllHome (...args) {
    let url = this.url('allhome', ...args);

    if (this._findAllCache.url === url) {
      return Promise.resolve(this._findAllCache.items);
    }

    if (this._fetches.get(url)) return this._fetches.get(url);

    let fetch = this._fetch(url);

    fetch.then(items => {
      this._findAllCache = {
        url: url,
        items: items
      };
      
      this.busEmit('update:all', items);
    }).catch(err => {
      this.log('Found error', err);
    });

    return fetch;
  }
  
  parse (topic) {
    if (config.multiForum && !topic.forum) {
      return Promise.reject(new Error(`Topic ${topic.id} needs a forum.`));
    }

    let findForum = config.multiForum ? forumStore.findOne(topic.forum) : Promise.resolve();
    return findForum.then(forum => {
      topic.url = urlBuilder.topic(topic, forum);
      return topic;
    });
  }

  publish (id) {
    if (!this.item.get(id)) {
      return Promise.reject(new Error('Cannot publish not fetched item.'));
    }

    let promise = new Promise((resolve, reject) => {
      request
        .post(`${this.url(id)}/publish`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          this.parse(res.body).then(item => {
            this.set(id, item);
            resolve(item);
          });
        });
    });

    return promise;
  }

  unpublish (id) {
    if (!this.item.get(id)) {
      return Promise.reject(new Error('Cannot unpublish not fetched item.'));
    }

    let promise = new Promise((resolve, reject) => {
      request
        .post(`${this.url(id)}/unpublish`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          this.parse(res.body).then(item => {
            this.set(id, item);
            resolve(item);
          });
        });
    });

    return promise;
  }

  vote (id, value) {
    if (!this.item.get(id)) {
      return Promise.reject(new Error('Cannot vote not fetched item.'));
    }

    if (!~voteOptions.indexOf(value)) {
      return Promise.reject(new Error('Invalid vote value.'));
    }

    let promise = new Promise((resolve, reject) => {
      request
        .post(`${this.url(id)}/vote`)
        .send({ value: value })
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          this.parse(res.body).then(item => {
            this.set(id, item);
            resolve(item);
          });
        });
    });

    return promise;
  }
}

export default new TopicStore;
