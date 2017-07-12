import Log from 'debug';
import view from '../view/mixin';
import template from './template.jade';
import dom from 'component-dom';
import t from 't-component';
import { domRender } from '../render/render';
import topicStore from '../topic-store/topic-store';
import ForumCard from './forum-card/forum-card';

const log = new Log('democracyos:landing');

export default class Landing extends view('appendable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
    var defaultUser= null;
    if(options.defaultUser){
        defaultUser= options.defaultUser;
    }
    var defaultTag= null;
    if(options.defaultTag){
        defaultTag= options.defaultTag;
    }
    var defaultProject= null;
    if(options.defaultProject){
        defaultProject= options.defaultProject;
    }
    options.locals= {
	tags: options.tags,
	projects: options.projects,
	users: options.users,
        defaultUser: defaultUser,
        defaultTag: defaultTag,
        defaultProject: defaultProject
    };
    console.log(options);
    super(options);
	
    this.topics = options.topics;
    this.page = 0;
    this.search= '';
    this.tag= -1;
    if(options.defaultTag){
        this.tag= options.defaultTag.id;
    }
    this.project= -1;
    if(options.defaultProject){
        this.project= options.defaultProject.id;
    }
    this.user= -1;
    if(options.defaultUser){
        this.user= options.defaultUser.id;
    }
    this.state= 0;
    this.sort= 'date';
    this.sortValue= -1;
    this.loadingPage = false;

    this.add(this.topics);
    this.initFilter();
//    this.loadForumInfo();
  }

  initFilter () {
    dom("#sort-landing-date").html(t('landing.publishedAt') + " &#9660;");
    this.pagination = this.el.querySelector('[data-pagination]');
	this.bind('click', '[data-pagination] button', this.showMore.bind(this));
        this.bind('click', '[data-sort-date]', this.sortDate.bind(this));
        this.bind('click', '[data-sort-participants]', this.sortParticipants.bind(this));
        this.bind('change', '[data-filter] input', this.filterSearch.bind(this));
	this.bind('change', '[data-filter-tag] select', this.filterTag.bind(this));
	this.bind('change', '[data-filter-project] select', this.filterProject.bind(this));
	this.bind('change', '[data-filter-user] select', this.filterUser.bind(this));
        this.bind('change', '[data-filter-state] select', this.filterState.bind(this));
  }

  actualizarPagination(){
	this.pagination.classList.remove('empty');
	this.pagination.classList.remove('hide');
	this.page= 0;
  }
  
  sortDate(ev){
    ev.preventDefault();
    if(this.sort == 'date'){                
        this.sortValue= -1 * this.sortValue;
    }else{
        this.sort= 'date';
        this.sortValue= 1;
        dom("#sort-landing-part").html(t('landing.participants'));
    }
    if(this.sortValue == -1){
        dom("#sort-landing-date").html(t('landing.publishedAt') + " &#9660;");
    }else{
        dom("#sort-landing-date").html(t('landing.publishedAt') + " &#9650;");
    }
    this.actualizarPagination();
    this.onLoadPage();
  }
  
  sortParticipants(ev){
    ev.preventDefault();
    if(this.sort == 'participants'){
        this.sortValue= -1 * this.sortValue;
    }else{
        this.sort= 'participants';
        this.sortValue= 1;
        dom("#sort-landing-date").html(t('landing.publishedAt'));
    }
    if(this.sortValue == -1){
        dom("#sort-landing-part").html(t('landing.participants') + " &#9660;");
    }else{
        dom("#sort-landing-part").html(t('landing.participants') + " &#9650;");
    }
    this.actualizarPagination();
    this.onLoadPage();
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
  
  filterState(ev){
    ev.preventDefault();
    var el = ev.target;
	var state= el.value;
	this.state= state;
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
		page: this.page,
                state: this.state,
                sort: this.sort,
                sortvalue: this.sortValue
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
