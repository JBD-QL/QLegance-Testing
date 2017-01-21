'use strict';

let QLegance = (()=>{
  let controller = document.querySelector('[ql-ctrl]');
  let elements = controller.querySelectorAll('[ql-field]');

  class Binder{
    constructor(els){
      let len = els.length;
      let fields, directive;

      for(let i = 0; i < len; i++){
        directive = els[i].getAttribute('ql-field');
        fields = els[i].querySelectorAll('[ql-type]');

        this[directive] = {};
        this[directive].element = els[i];
        this[directive].data = els[i].value;
        this[directive].element.addEventListener('change', this, false);
        this[directive].types = '';

        for(let n = 0; n < fields.length; n++){
          this[directive].types += fields[n].getAttribute('ql-type') + '\n';
        }
      }
    }

    handlEvent(event){
      console.log('hello world');
      if(event.type === 'change'){
        this.change(event);
      }
    }

    change(event){
      console.log('hello Show me change')
      if(!event.target) return;
      let element = event.target;
      let directive = element.getAttribute('ql-field');
      this[directive].data = element.value;
      this[directive].element.value = element.value;
    }
  }

  const binder = new Binder(elements);

  return binder;
})();
