'use strict';

document.onreadystatechange = (event) =>{
  if(document.readyState === 'complete'){
    app();
  }
}

function app() {
  let queryButton = document.getElementById('query-button');
  let mutationButton = document.getElementById('mutation-button');

  queryButton.addEventListener('click', query);
  mutationButton.addEventListener('click', mutation);
}

// "query": `mutation numberSaver {post: saveNums(box1: ${box1}, box2: ${box2}, box3: ${box3}, box4: ${box4}) { box1 box2 box3 box4 } }`

function mutation(){
  let body = {
    query: `
      mutation addUser{
        createdUser: create(username: "Dhani", alt: "bonafide", password: "surely") {
          username alt password
        }
      }
    `/*,
    variables: {input: 'my hopeful parameter input'}*/
  }

  axios({
    method: 'post',
    url: '/graphql',
    data: body,
    headers: {'Content-Type': 'application/json'}
  }).then((result) => {
    console.log('result from mutation', result.data.data);
  });
}

function query(){
  let body = {
    query: `
      query hello {
        who: greeting{
         username,
         alt,
         password
        }
      }
    `
  };

  axios({
    method: 'post',
    url: '/graphql',
    data: body,
    headers: {'Content-Type': 'application/json'}
  }).then((result) => {
    console.log('result from query', result.data.data);
  });
}
