/**
 * Module dependencies.
 */

import debug from 'debug';
import t from 't-component';
import template from './template.jade';
import topicStore from '../topic-store/topic-store';
import List from 'democracyos-list.js';
import moment from 'moment';
import confirm from 'democracyos-confirmation';
import View from '../view/view';
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';

const log = debug('democracyos:admin-topics');

/**
 * Creates a list view of topics
 */

export default class TopicVotes extends View {
  constructor(topic, votes, forum = null) {
    super(template, { topic, votes });   
    this.topic= topic;
    this.votes= votes;
  }
  
  switchOn() {
    this.bind('click', '.btn.print-votes', this.bound('print'));
  }

  print(ev){
    var doc = new PDFDocument();
    var stream = doc.pipe(blobStream());

    // draw some text
    doc.fontSize(25)
       .text(this.topic.mediaTitle, 100, 80);

    let colors= {positive: 'green', negative: 'red', neutral: 'gray'};

    this.votes.forEach(function(vote){        
        let text= t('admin-topic-votes.' + vote.value) + " - " + vote.author.fullName + " - " + vote.createdAt.replace(/T/, ' ').replace(/\..+/, '');
        //and some justified text wrapped into columns
        doc.font('Times-Roman', 13)
            .moveDown()
            .text(text, {
                width: 412,
                align: 'justify',
                ellipsis: true,
                fillColor: colors[vote.value]
            }
        ); 
    });    

    // end and display the document in the iframe to the right
    doc.end();
    stream.on('finish', function() {
      window.open(stream.toBlobURL('application/pdf'));
    });
  }
}