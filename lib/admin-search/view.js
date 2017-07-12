import Log from 'debug';
import view from '../view/mixin';
import template from './template.jade';
import dom from 'component-dom';
import t from 't-component';
import moment from 'moment';
import { domRender } from '../render/render';
import topicStore from '../topic-store/topic-store';
import ForumCard from './forum-card/forum-card';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';

const log = new Log('democracyos:admin-search');

export default class AdminSearch extends view('appendable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
    
    options.locals= {
	tags: options.tags,
	projects: options.projects,
	users: options.users
    };
    super(options);
	
    this.topics= [];
    this.search= "";
    this.from= new Date();
    this.to= new Date();
    this.tag= -1;
    this.project= -1;
    this.user= -1;
    this.state= 0;
    this.sort= 'date';
    this.sortValue= -1;
    this.loadingPage = false;

//    this.add(this.topics);
    this.initFilter();
  }

  initFilter () {
    dom("#sort-admin-search-date").html(t('admin-search.publishedAt') + " &#9660;");
    this.pagination = this.el.querySelector('[data-pagination]');
    this.pagination.classList.add('empty');
    this.printButton = this.el.querySelector('.btn.print-votes');
    this.bind('click', '[data-sort-date]', this.sortDate.bind(this));
    //this.bind('click', '[data-sort-participants]', this.sortParticipants.bind(this));
    this.bind('change', '[data-filter] input', this.filterSearch.bind(this));
    this.bind('change', '[data-filter-tag] select', this.filterTag.bind(this));
    this.bind('change', '[data-filter-project] select', this.filterProject.bind(this));
    this.bind('change', '[data-filter-user] select', this.filterUser.bind(this));
    this.bind('change', '[data-filter-state] select', this.filterState.bind(this));
    
    this.bind('click', '.btn.print-votes', this.print.bind(this));
  }
  
  print(ev){
    if(this.topics.length == 0){
        alert(t("admin-search.selectFilter"));
        return;
    }
    var doc = new PDFDocument();
    var stream = doc.pipe(blobStream());

    // draw some text
    doc.fontSize(25)
       .text(t("admin-search.topics"), 100, 80);
       
    if(this.search != ""){
        doc.fontSize(15).moveDown(0.5)
       .text(t("admin-search.search") + ': "' + this.search + '"');
    }
    if(this.tag != -1){
        doc.fontSize(15).moveDown(0.5)
       .text(t("admin-search.tag") + ": " + this.topics[0].tag.name);
    }
    if(this.project != -1){
        doc.fontSize(15).moveDown(0.5)
       .text(t("admin-search.project") + ": " + this.topics[0].projecttype.name);
    }
    if(this.user != -1){
        doc.fontSize(15).moveDown(0.5)
       .text(t("admin-search.user") + ": " + this.topics[0].author.fullName);
    }
    if(this.state != 0){
        let estado= "Abierto";
        if(this.state == -1)estado= "Cerrado";
        doc.fontSize(15).moveDown(0.5)
       .text(t("admin-search.state") + ": " + estado);
    }

    this.topics.forEach(function(topic){        
        let text= topic.createdAt.replace(/T/, ' ').replace(/\..+/, '') + " - " + topic.mediaTitle;
        //and some justified text wrapped into columns
        doc.font('Times-Roman', 13)
            .moveDown()
            .text(text, {
                width: 412,
                align: 'justify',
                ellipsis: true
            }
        ); 
    });    

    // end and display the document in the iframe to the right
    doc.end();
    stream.on('finish', function() {
      window.open(stream.toBlobURL('application/pdf'));
    });
  }

  actualizarPagination(){
	this.pagination.classList.remove('empty');
	this.pagination.classList.remove('hide');
	this.page= 0;
  }
  
  filtering(){
      return (this.search != "" || this.tag != -1 || this.project != -1 || this.user != -1 || this.state != 0);
  }
  
  sortDate(ev){
    ev.preventDefault();
//    if(this.sort == 'date'){                
        this.sortValue= -1 * this.sortValue;
//    }else{
//        this.sort= 'date';
//        this.sortValue= 1;
//        dom("#sort-admin-search-part").html(t('admin-search.participants'));
//    }
    if(this.sortValue == -1){
        dom("#sort-admin-search-date").html(t('admin-search.publishedAt') + " &#9660;");
    }else{
        dom("#sort-admin-search-date").html(t('admin-search.publishedAt') + " &#9650;");
    }
    this.actualizarPagination();
    this.onLoadPage();
  }
  
//  sortParticipants(ev){
//    ev.preventDefault();
//    if(this.sort == 'participants'){
//        this.sortValue= -1 * this.sortValue;
//    }else{
//        this.sort= 'participants';
//        this.sortValue= 1;
//        dom("#sort-admin-search-date").html(t('admin-search.publishedAt'));
//    }
//    if(this.sortValue == -1){
//        dom("#sort-admin-search-part").html(t('admin-search.participants') + " &#9660;");
//    }else{
//        dom("#sort-admin-search-part").html(t('admin-search.participants') + " &#9650;");
//    }
//    this.actualizarPagination();
//    this.onLoadPage();
//  }
  
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
  
  
  onLoadPage (showMore) {
    if (! this.filtering()){
        dom('#admin-search .list').empty();
        this.printButton.classList.add('hide');
        this.pagination.classList.add('empty');
        return;
    }
    if (this.loadingPage) return;

    this.loadingPage = true;
    this.pagination.classList.add('loading');

    if(! showMore){
	dom('#admin-search .list').empty();
    }

    topicStore.clear();
    topicStore.findAllSearch({
		search: this.search,
		tag: this.tag,
		project: this.project,
		user: this.user,
//		page: this.page,
                state: this.state,
                sort: this.sort,
                sortvalue: this.sortValue
	}).then(topics => {
		this.pagination.classList.remove('loading');
		if (topics.length) {
                    this.printButton.classList.remove('hide');
                    this.topics= topics;
                    this.add(topics);
		} else {
                    this.printButton.classList.add('hide');
                    this.pagination.classList.add('empty');
//                    if(this.page != 0){
//			this.pagination.classList.add('hide');
//		    }
                }
                this.loadingPage = false;
    }).catch(err => {
      log('Found error %s', err);
      this.page--;
      this.pagination.classList.remove('loading');
      this.loadingPage = false;
    });
  }

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
