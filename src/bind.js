'use strict';

let QLegance = (()=>{

  return new Binder();

  function Binder(){
    let elements = document.querySelectorAll('[ql-type], [ql-list]');

      const single = domSelection;

      let server = document.querySelector('[ql-server]').getAttribute('ql-server');
      let fields, type, component;
      let len = elements.length;
      const Client = {
        components: []
      };

      single.getServer = () => { return server; };
      single.setServer = (serv) => { server = serv; return server; };

      for(let i = 0; i < len; i++){
        component = {element: elements[i]};
        fields = elements[i].querySelectorAll('[ql-field]');

        type = getAttr(component.element).split('|');

        component.type_name = type[0].trim(); // ie. a schema defined for User
        component.staged_query = type[1].trim(); // ie. getUser(limit: 1)
        component.fields = [];
        component.list = component.element.getAttribute('[ql-list]') ? true : false;

        for(let n = 0; n < fields.length; n++){
          component.fields.push({name: getAttr(fields[n]), element: fields[n]});
        }

        sendQuery(buildQuery(component)).then((result) =>{
          prePopulate(component, result.data);
        });

        Client.components.push(component);
      }

      single['getUser'] = (args, returnValues) => {
        let query = `{
            getUser(username: "${args.username}"){
              ${returnValues.join('\n')}
            }
          }
        `;
        return sendQuery(query);
      };

      return single;

      function domSelection(selection){
        /* selection can be called QLegance('#users(2)') to make list selections
        */
        let collection;
        if(typeof selection === 'string'){
          collection = document.querySelectorAll(selection);
          if(selection.indexOf('#') !== -1){
            collection = collection[0];
          }
        }
        return wrapElement(collection);
      }

      function wrapElement(selection){
        let wrapper = {element: selection};

        wrapper.mutate = (method, args, returnValues, options) => {
          return new Promise((resolve, reject) => {
            method = 'getUser', args = {username: "Markle"}, returnValues = ['password'];
            QLegance[method](args, returnValues).then((result) => {
              let component = Client.components.find( component => { return selection === component.element; });
              //if(!component) component = buildcomponent(selection);
              populate(component, result.data);
              resolve(result.data);
            });
          })
        };

        wrapper.query = (fragment) => {

        };
        return wrapper;
      }

      function getAttr(element){
        return element.getAttribute('ql-type') || element.getAttribute('ql-list') || element.getAttribute('ql-field');
      }

      function buildQuery(component){
        return `{
          ${component.staged_query}{
            ${component.fields.map(field => {return field.name; }).join('\n')}
          }
        }`;
      }

      function sendQuery(query){
        return new Promise((resolve, reject) => {
          let xhr = new XMLHttpRequest();

          xhr.open("POST", server, true);
          xhr.setRequestHeader("Content-Type", "application/json");
        	xhr.send(JSON.stringify({query}));

          xhr.onreadystatechange = () => {
            if(xhr.status === 200 && xhr.readyState === 4){
              resolve(JSON.parse(xhr.response));
            }else if(xhr.status > 400 && xhr.status < 500){
              reject(xhr.status);
            }
          };
        });
      }

      function parseStagedQuery(query){
        let index = query.indexOf('(');
        index = index || undefined;
        return query.substring(0, index);
      }

      function populate(component, data){
        let input, template, len, element;
        let key = Object.keys(data)[0];
        let dataKeys;

        data = data[key];
        dataKeys = Object.keys(data);
        len = dataKeys.length;
        data = len > 1 ? data : [data];

        for(let i = 0; i < len; i++){
          dataKeys.forEach((key) => {
            element = component.element.querySelector(`[ql-field=${dataKeys[i]}]`);
            if(element.nodeName.toLowerCase() === 'input'){
              element.setAttribute('value', data[i][key]);
            }else{
              element.innerHTML = data[i][key];
            }
          });
        };
      }

      function prePopulate(component, data){
        let input,
         template, len, element, html = '';
        let queryKey = parseStagedQuery(component.staged_query);

        data = data[queryKey];
        len =  component.list ? data.length : 1;
        data = len > 1 ? data : [data];

        for(let i = 0; i < len; i++){
          template = component.element.cloneNode(true);

          component.fields.forEach((field) => {
            element = template.querySelector(`[ql-field=${field.name}]`);
            if(element.nodeName.toLowerCase() === 'input'){
              element.setAttribute('value', data[i][field.name]);
            }else{
              element.innerHTML = data[i][field.name];
            }
          });
          html += template.innerHTML;
        }
        component.element.innerHTML = html;
      }

    }
})();

  //    Features that have not been yet implemented
  //    *************************************************
  //
  //   cacheQuery(query, data){
  //     let hash = this.hashFunction(query);
  //     localStorage[hash] = JSON.stringify({query, data});
  //   }
  //
  //  preQueryResolve(query, data){ //not implemented as of yet
  //     let hash = this.hashFunction(query);
  //    return JSON.parse(localStorage[hash]);
  //  }
  //
  //   hashFunction(string){
  //     let hash = 5, len = string.length;
  //     for(let i = 0; i < len; i++){
  //       hash = hash*16 + string[i].charCodeAt();
  //     }
  //     return JSON.stringify('QLegance:' + hash);
  //   }
