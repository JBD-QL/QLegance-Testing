'use strict';

document.onreadystatechange = (event) =>{
  if(document.readyState === 'complete'){
    app();
  }
}

function app() {
  let testButton = document.getElementById('test-button');
  testButton.addEventListener('click', test);
}

function test(){
  let body = {
    query: `
      query getEcho{
        echo
      }
    `
  };

  axios({
    method: 'get',
    url: '/graphql',
    params:  body
  }).then((result) => {
    console.log('hello from get request: ', result.data.data);
  });

  axios({
    method: 'post',
    url: '/graphql',
    data:  body
  }).then((result) => {
    console.log('hello from post request: ', result.data.data);
  });
}
