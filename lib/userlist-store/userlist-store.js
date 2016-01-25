import Store from '../store/store';
import request from '../request/request';

class UserlistStore extends Store {
  name () {
    return 'user';
  }
  
  
   /* Method to get a Model from the Database.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findOneProfile (id) {
    if (this.item.get(id)) return Promise.resolve(this.item.get(id));

    let url = this.url('profile/' + id);

    if (this._fetches.get(url)) return this._fetches.get(url);

    let fetch = this._fetch(url);

    fetch.then(item => {
      this.item.set(id, item);
    }).catch(err => {
      this.log('Found error', err);
    });

    return fetch;
  }
  
  
  /**
   * Method to find a list of Models from the Database and cache them.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findAllFilter (level,state) {
    let url = this.url('allfilter/' + level + "/" + state, null);

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
  
  /*
   * Tambien habria que agregar uno que pise al destroy o llamar uno nuevo deshabilitar
   * 
   */
  
  reactivate (id) {
    let item = this.item.get(id);
    if (!item) {
      return this.findOne(id).then(() => {
        return this.reactivate(id);
      });
    }
    let reactivate = new Promise((resolve, reject) => {        
      request
        .post(`${this.url(id)}/reactivate`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          resolve(item);

          this.busEmit(`reactivate:${id}`, item);
          this.busEmit('update:all', this.item.items);
        });
    });

    return reactivate;
  }
}

export default new UserlistStore;
