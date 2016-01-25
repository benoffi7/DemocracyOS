import Log from 'debug';
import view from '../view/mixin';
import template from './template.jade';
import dom from 'component-dom';
import { domRender } from '../render/render';
import topicStore from '../topic-store/topic-store';
import ForumCard from './forum-card/forum-card';

const log = new Log('democracyos:landing');

export default class Landing extends view('appendable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
	options.locals= {
		tags: options.tags,
		projects: options.projects,
		users: options.users
	};
	console.log(options);
    super(options);
	
    this.topics = options.topics;
    this.page = 0;
	this.search= '';
	this.tag= -1;
	this.project= -1;
	this.user= -1;
    this.loadingPage = false;

    this.add(this.topics);
    this.initFilter();
//    this.loadForumInfo();
  }

  initFilter () {
    this.pagination = this.el.querySelector('[data-pagination]');
	this.bind('click', '[data-pagination] button', this.showMore.bind(this));
    this.bind('change', '[data-filter] input', this.filterSearch.bind(this));
	this.bind('change', '[data-filter-tag] select', this.filterTag.bind(this));
	this.bind('change', '[data-filter-project] select', this.filterProject.bind(this));
	this.bind('change', '[data-filter-user] select', this.filterUser.bind(this));
  }

  actualizarPagination(){
	this.pagination.classList.remove('empty');
	this.pagination.classList.remove('hide');
	this.page= 0;
  }
  
  filterSearch(ev){
    ev.preventDefault();
    var el = ev.target;
	var search= el.value;
	this.search= search;
	this.actualizarPagination();
    this.onLoadPage();
  }
  
  filterTag(ev){
    ev.preventDefault();
    var el = ev.target;
	var tag= el.value;
	this.tag= tag;
	this.actualizarPagination();
    this.onLoadPage();
  }
  
  filterProject(ev){
    ev.preventDefault();
    var el = ev.target;
	var project= el.value;
	this.project= project;
	this.actualizarPagination();
    this.onLoadPage();
  }
  
  filterUser(ev){
    ev.preventDefault();
    var el = ev.target;
	var user= el.value;
	this.user= user;
	this.actualizarPagination();
    this.onLoadPage();
  }
  
  showMore(ev){
	this.page++;
	this.onLoadPage(true);
  }
  
  onLoadPage (showMore) {
    if (this.loadingPage) return;

    this.loadingPage = true;
    this.pagination.classList.add('loading');

	if(! showMore){
		dom('#landing .list').empty();
	}

    topicStore.clear();
    topicStore.findAllHome({
		search: this.search,
		tag: this.tag,
		project: this.project,
		user: this.user,
		page: this.page
	}).then(topics => {
		this.pagination.classList.remove('loading');
		if (topics.length) {
                    this.add(topics);
		} else {
                    this.pagination.classList.add('empty');
                    if(this.page != 0){
			this.pagination.classList.add('hide');
		    }
                }
                this.loadingPage = false;
    }).catch(err => {
      log('Found error %s', err);
      this.page--;
      this.pagination.classList.remove('loading');
      this.loadingPage = false;
    });
  }

//  loadForumInfo () {
//    let placeholder = this.el.querySelector('[data-forum-info]');
//
//    if (!placeholder) return;
//
//    let render = forum => {
//      let info = domRender(forumInfoTemplate, { forum: forum });
//      placeholder.parentNode.replaceChild(info, placeholder);
//    };
//
//    forumStore.findUserForum()
//      .then(render)
//      .catch(err => {
//        if (404 === err.status) render();
//        else if (403 === err.status) render();
//        else log('Found error %s', err);
//      });
//  }

  add (topics) {
    
    if (!(topics && topics.length)) return;
    
    let fragment = document.createDocumentFragment();

    topics.forEach(law => {
      new ForumCard({
        law: law,
        container: fragment
      });
    });
    
    this.el.querySelector('[data-topics]').appendChild(fragment);
  }
}
