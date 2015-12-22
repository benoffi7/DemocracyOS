import Store from '../store/store';
import request from '../request/request';

class ConfighomeStore extends Store {
  name () {
    return 'confighome';
  }
/**
   * Method to find a list of Models from the Database and cache them.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findConfig(ctx) {
    let url = this.url('config', null);

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
	console.log(err);
      this.log('Found error', err);
    });

    return fetch;
  }
  
}


export default new ConfighomeStore;
