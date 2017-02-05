'use strict';

const QL = (()=>{
  const single = domSelection;

  // Holds apps components defined by 'ql' attributes
  const Client = {
    components: [],
    server: null
  };

    single.getServer = () => { return Client.server; };

    single.setServer = (serv) => {
      if(typeof serv !== 'string' || serv === '') throw new Error('Incorrect input for server');
      Client.server = serv;
      return serv;
    };

    single.query = (string) => {
      return sendQuery("query" + string);
    };

    single.mutate = (string) => {
      return sendQuery("mutation" + string);
    };

    single.initializer = () => {
      if(!Client.server){
        let server = document.querySelector('[ql-server]');
        if(!server) throw new Error('GraphQL server has not been set.');
        single.setServer(server.getAttribute('ql-server'));
      }
      introspect();
      buildComponents();
    };

    return single;

    function domSelection(selection){
      //FIXME This feature is requested
      /* selection can be called QLegance('#users(2)') to make list selections
      */

      //Check if selection is a wrapper object
      if(selection.mutate !== undefined && selection.query !== undefined && selection.element !== undefined){
        return selection;
      }

      //Check if selection is unacceptable - neither node or string value
      if((selection.nodeType === undefined && selection.nodeName === undefined) && typeof selection !== 'string'){
        throw new Error('Unacceptable input value.');
      }

      // If selection is string perform a DOM query
      if(typeof selection === 'string'){
        selection = document.querySelectorAll(selection);

        //No returned elements to wrap
        if(selection.length === 0) return selection;
      }

      return wrapElement(selection);
    }

    function wrapElement(selection){
      let len = selection.length;
      let wrapper = [];

      for(let i = 0; i < len; i++){
        wrapper[i] = {element: selection[i]};

        //FIXME not  fully implemented
        wrapper[i].mutate = ((method, args, returnValues) => {
          return single[method](args, returnValues).then((result) => {
              let component = Client.components.find( component => { return selection[i] === component.element; });
              populate(component, result.data);
              resolve(result.data);
            });
        });

        wrapper[i].query = (method, args, returnValues) => {
          return single[method](args, returnValues).then((result) => {
            let component = Client.components.find( component => { return selection[i] === component.element; });
            populate(component, result.data);
            return result.data;
          });
        };
    }
      return wrapper.length > 1 ? wrapper : wrapper[0];
    }

    function buildComponents(elements, nested){
      elements = elements || document.querySelectorAll('[ql-type], [ql-list]');
      if(elements.length === 0) return;

      elements = Array.prototype.slice.call(elements, 0); //convert NodeList to array

      for(let i = 0; i < elements.length; i++){
        let field, fields, typeName, method, component, nestedTypes, nestedFields;
        component = {element: elements[i]};

        nestedTypes = component.element.querySelectorAll('[ql-type], [ql-list]');

        component.fields = [];
        fields = component.element.querySelectorAll('[ql-field]');
        fields = Array.prototype.slice.call(fields, 0);

        component.partial = component.element.cloneNode(true);

        if(nestedTypes.length > 0){
          nestedTypes = Array.prototype.slice.call(nestedTypes, 0);

          elements = elements.filter((element) => {
            return nestedTypes.reduce((unique, el) => {
              return unique && el !== element;
            }, true);
          });

          //remove duplicate fields
          nestedTypes.forEach((type) => {
            let nestedFields  = type.querySelectorAll('[ql-field]');
            nestedFields = Array.prototype.slice.call(nestedFields, 0);

            fields = fields.filter((field) => {
              return nestedFields.indexOf(field) === -1;
            });
          });

          component.fields.push( buildComponents(nestedTypes, true) ); //passing true for nested value
        }

        if(!nested){
          [typeName, method] = getAttr(component.element).split('|');
          if(!typeName || !method) throw new Error('Field ql-type or ql-list is not defined correctly.');
          component.type_name = typeName.trim(); // ie. a schema defined for User
          component.initial_query = method.trim(); // ie. getUser(username: "Judy")
        }else{
          component.type_name = getAttr(component.element);
        }

        for(let n = 0; n < fields.length; n++){
          component.fields.push({name: getAttr(fields[n]), element: fields[n]});
        }

        if(component.fields.length > 0 && !nested){
          sendQuery(buildQuery(component)).then((result) =>{
            populate(component, result.data);
          }).catch((result) => {
          });
        }

        Client.components.push(component);

        if(nested) return component;
      }
    }

    function getAttr(element){
      return element.getAttribute('ql-type') || element.getAttribute('ql-list') || element.getAttribute('ql-field');
    }

    function parseQueryFields(fields){
      return fields.map((field) => {
        if(field.type_name) return `${field.type_name} { ${parseQueryFields(field.fields)} }`;
        return field.name;
      }).join('\n');
    }

    function buildQuery(component){
      let query = component.initial_query;
      let fields = parseQueryFields(component.fields);

      if(query[query.length - 1] === ')' && query[query.length - 2] === '('){
        query = getMethodName(query);
      }

      return `{
        ${query}{
          ${fields}
        }
      }`;
    }

    function getMethodName(query){
      let index = query.indexOf('(');
      index = index || undefined;
      return query.substring(0, index);
    }

    function sendQuery(query){
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.open("POST", Client.server, true);
        xhr.setRequestHeader("Content-Type", "application/json");
      	xhr.send(JSON.stringify({query}));

        xhr.onreadystatechange = () => {
          if(xhr.readyState === 4){
            if(xhr.status === 200){
              resolve(JSON.parse(xhr.response));
            }else{
              reject(new Error(xhr.status));
            }
          }
        };
      });
    }

    function populate(component, data){
      let input, template, len, element, value, keys,
        html = '';

      //FIXME Will need to iterate over keys when multiple queries are allowed
      let queryKey = Object.keys(data)[0];
      data = data[queryKey];

      data = Array.isArray(data) ? data : [data]; //Ensuring a length is available
      len = data.length;

      for(let i = 0; i < len; i++){
        template = component.partial.cloneNode(true);
        keys = Object.keys(data[i]);

        keys.forEach((key) => {
          element = template.querySelector(`[ql-field=${key}]`);
          if(!element){
             element = template.querySelector(`[ql-type=${key}]`) || template.querySelector(`[ql-list=${key}]`);
             let comp = Client.components.find((component) => { return getAttr(component.element) === getAttr(element); });
             let obj = {};
             obj[`${queryKey}`] = data[i][getAttr(element)];

             //populate an inner component then append it
             element.parentNode.replaceChild( populate(comp, obj), element);
           }else if(element.nodeName.toLowerCase() === 'input'){
              element.setAttribute('value', data[i][key]);
            }else{
              element.innerHTML = data[i][key];
            }
        });

        html += template.innerHTML;
      }

      component.element.innerHTML = html;
      return template;
    }

  function introspect() {
    const introspectiveQuery = `
      {
        __schema {
          mutationType {
            name
            fields {
              name
              type {
                name
                kind
              }
              args {
                name
                defaultValue
                type {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
          queryType {
            name
            fields {
              name
              type {
                name
                kind
              }
              args {
                name
                defaultValue
                type {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    sendQuery(introspectiveQuery)
      .then((res) => {
        const fields = [];
        for (let i = 0; i < res.data.__schema.mutationType.fields.length; i += 1) {
          // console.log(res.data.__schema.mutationType.fields[i]);
          res.data.__schema.mutationType.fields[i].query = 'mutation';
          fields.push(res.data.__schema.mutationType.fields[i]);
        }
        for (let i = 0; i < res.data.__schema.queryType.fields.length; i += 1) {
          // console.log(res.data.__schema.queryType.fields[i]);
          res.data.__schema.queryType.fields[i].query = 'query';
          fields.push(res.data.__schema.queryType.fields[i]);
        }
        // res.data.__schema.mutationType.fields.concat(res.data.__schema.queryType.fields);
        //console.log('fields:', fields);
        //this.types = {};
        // loop through fields
        for (let i = 0; i < fields.length; i += 1) {
        //  typeFieldConstructor(fields[i]);
          methodConstructor(fields[i]);
        }
      });

  }

    function typeFieldConstructor(field) {
        if (!this.types[field.type.name]) {
          if (field.type.name) {
            this.types[field.type.name] = [];
          } else {
            this.types[field.type.kind] = [];
          }
        }
        if (field.type.name) {
          // console.log('valid type');
          this.types[field.type.name].push(field.name);
        } else {
          this.types[field.type.kind].push(field.name);
        }
      }

      function methodConstructor(field) {
        // ex: QLegance.field_name({}, [returning values])

        // construct tempFunc based on information in field
        const tempFunc = (obj, arr) => {
          let returnValues = arr.join('\n');

          // field that does take arguments
          if (field.args.length) {
            let args = '';
            for (let i = 0 ; i < field.args.length; i += 1) {
              let end = ''
              if (i < field.args.length - 1) end += ', ';

              if (field.args[i].type.kind === 'NON_NULL') {
                if (field.args[i].name in obj) {
                  const item = typeConverter(field.args[i].type.ofType.name, obj[field.args[i].name]);
                  args += `${field.args[i].name} : ${item}${end}`
                }
              } else {
                if (field.args[i].name in obj) {
                  const item = typeConverter(field.args[i].type.name, obj[field.args[i].name]);
                  args += `${field.args[i].name} : ${item}${end}`
                }
              }
            }
            return sendQuery(`
              ${field.query} {
                ${field.name}(${args}) {
                  ${returnValues}
                }
              }
            `);

          // field that does not take arguments
          } else {
            return sendQuery(`
              ${field.query} {
                ${field.name} {
                  ${returnValues}
                }
              }
            `);
          }
        }

        // append tempFunc as method to QLegance object with the associted field name
        single[field.name] = tempFunc;
    }

      function typeConverter(type, item) {
        if (type === 'String') {
          return `"${item}"`;
        }
        if (type === 'Int' || type === 'Float') {
          return Number(item);
        }
      }
  })();

//module.exports = QL;
