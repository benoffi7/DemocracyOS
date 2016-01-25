/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import o from 'component-dom';
import template from './template.jade';
import topicStore from '../topic-store/topic-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import * as serializer from '../proposal/body-serializer';
import confirm from 'democracyos-confirmation';
import View from '../view/view';

const log = debug('democracyos:landing');

//var authorFilter = require('./buttons/author-filter');
//var tagFilter = require('./buttons/tag-filter');
//var sortButton = require('./buttons/sort');

/**
 * Creates a list view of topics
 */

function randomSort() {
  return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}

export default class LandingView extends View {
  constructor(topics, forum = null) {
    topics.forEach(function(law) {
        var div = document.createElement('div');
        div.innerHTML = serializer.toHTML(law.clauses);
        var el = o(div);
        law.clauses = el.text();
    });
      
    super(template, {laws: topics, moment, forum });
  }

  switchOn() {
    this.list = new List('landing', { valueNames: ['law-title', 'law-closing-date', 'law-author', 'law-tag', 'law-project'] });
    this.list.on('searchComplete', this.onFilterApplied.bind(this));

    // Force random sort on initialisation
    this.list.sort(0, { sortFunction: randomSort });
  }
  
  onFilterApplied (ev) {
    var el = this.find('#nomatch');
    if (this.list.matchingItems.length) {
        el.addClass('hide');
    } else {
        el.removeClass('hide');
    }
  };
}