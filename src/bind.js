'use strict';

let QLegance = (()=>{
  let controller = document.querySelector('[ql-ctrl]');
  let elements = controller.querySelectorAll('[ql-type], [ql-list]');

  class Binder{
    constructor(elements){
      let len = elements.length;
      let fields, type;

      for(let i = 0; i < len; i++){
        type = this.getAttr(elements[i]);
        fields = elements[i].querySelectorAll('[ql-field]');

        this[type] = {};
        this[type].element = elements[i];
        this[type].data = elements[i].value;
        this[type].element.addEventListener('change', this, false);
        this[type].fields = '';
        this[type].populate = populate;

        for(let n = 0; n < fields.length; n++){
          this[type].fields += this.getAttr(fields[n]) + '\n';
        }
      }
    }

    handlEvent(event){
      if(event.type === 'change'){
        this.change(event);
      }
    }

    change(event){
      if(!event.target) return;
      let element = event.target;
      let type = this.getAttr(element);
      this[type].data = element.value;
      this[type].element.value = element.value;
    }

    getAttr(element){
      return element.getAttribute('ql-type') || element.getAttribute('ql-list') || element.getAttribute('ql-field');
    }

  }

  function populate(data){
    let fields = this.element.querySelectorAll('[ql-field]');
    let users = data.users;
    let fieldName;
    let element;
    let len;
    let input;

    for(let i = 0; i < users.length; i++){
      len = Object.keys(users[i]).length;
      for(let n = 0; n < len; n++){
        element = document.createElement(fields[n].nodeName);
        fields[n].remove();
        fieldName = binder.getAttr(fields[n]);

        input = element.value ? 'value' : 'innerHTML';
        element[input] = users[i][fieldName];
        this.element.append(element);
      }
    }
  }

  const binder = new Binder(elements);

  return binder;
})();
