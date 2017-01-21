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

function mutation(){
  QLegance.test1.query =  `
    mutation addUser{
      createdUser: create(username: "Judy", alt: "sup dog", password: "cherries") {
        username alt password
      }
    }
  `;

  let body = {
    query: QLegance.test1.query
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
  QLegance.user.query = `
    query hello {
      who: greeting{
        ${QLegance.user.types}
  
      }
    }
  `;

  console.log(QLegance.user.query);
  let body = {
    query: QLegance.user.query
  };

    let event = new CustomEvent('change');
    let keys = Object.keys(QLegance);
    QLegance[keys[0]].element.dispatchEvent(event);

  axios({
    method: 'post',
    url: '/graphql',
    data: body,
    headers: {'Content-Type': 'application/json'}
  }).then((result) => {
    console.log('result from query', result.data.data);
  });
}
