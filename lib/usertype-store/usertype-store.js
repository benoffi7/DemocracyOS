import Store from '../store/store';
import request from '../request/request';

class UsertypeStore extends Store {
  name () {
    return 'userstypes';
  }
  
  /**
   * Method to find a list of Models from the Database and cache them.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findAllActive (...args) {
    let url = this.url('allactive', ...args);

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
  
  addProject (id, projectId) {
    let item = this.item.get(id);
    if (!item) {
      return this.findOne(id).then(() => {
        return this.addProject(id, projectId);
      });
    }
    let addProject = new Promise((resolve, reject) => {        
      request
        .post(`${this.url(id)}/project/${projectId}`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          resolve(item);

          this.busEmit('update:all', this.item.items);
        });
    });

    return addProject;
  }
  
  deleteProject (id, projectId) {
    let item = this.item.get(id);
    if (!item) {
      return this.findOne(id).then(() => {
        return this.deleteProject(id, projectId);
      });
    }
    let deleteProject = new Promise((resolve, reject) => {        
      request
        .post(`${this.url(id)}/unproject/${projectId}`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          resolve(item);

          this.busEmit('update:all', this.item.items);
        });
    });

    return deleteProject;
  }
}

export default new UsertypeStore;
