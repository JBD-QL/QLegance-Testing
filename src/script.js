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
  let username = document.querySelector('.username').value;
  let password = document.querySelector('.password').value;
  let alt = document.querySelector('.alt').value;

  QLegance.user.mutation =  `
    mutation addUser{
      createdUser: create(username: "${username}", alt: "${alt}", password: "${password}") {
        ${QLegance.user.fields}
      }
    }
  `;

  let body = {
    query: QLegance.user.mutation
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
  QLegance.users.query = `
    query getUsers{
      users: allUsers{
        ${QLegance.users.fields}
      }
    }`;

  let body = {
    query: QLegance.users.query
  };

  axios({
    method: 'post',
    url: '/graphql',
    data: body,
    headers: {'Content-Type': 'application/json'}
  }).then((result) => {
    QLegance.users.populate(result.data.data);
  }).catch((err) => {
    console.log(err);
  });
}
