'use strict';

document.onreadystatechange = (event) =>{
  if(document.readyState === 'complete'){
    app();
  }
}

let search = document.querySelector('.search-field');

function app() {
  let titleButton = document.querySelector('.title-button');
  let authorButton = document.querySelector('.author-button');

  titleButton.addEventListener('click', byTitle);
  authorButton.addEventListener('click', byAuthor);
}

function byTitle(){
  if(search.value === '') return;

  let method = 'getPostByTitle';
  let args = {title: search.value};
  let returnValues =  ['title', 'content', 'author', 'date'];

  /*  A query with a given selector will self populate by default,
      the response will contain all relevant data as well
  */
  QL('#posts').query(method, args, returnValues)
    .then((result) => {
      console.log('The DOM already has my information :) --->', result);
    });
}

function byAuthor(){
  /*  The query's response is a promise for asynchronous resolution
  */
  if(search.value === '') return;
  QL.getPostsByAuthor({author: search.value}, ['author', 'title', 'date', 'content'])
    .then((result)=>{
      console.log('Results of getPostsByAuthor(): ', result.data);
    });
}
