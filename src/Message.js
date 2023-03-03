function Message( mes, args) { // ('My Message is ...', {style: 'primary'})
  this.mes = mes;
  this.style = null;  // primary, success, warning, danger
  this.closb = '';
  this.message = '';
  if ( args ) {
    this.style = args.style;
    this.closb = args.close;
  }
}
Message.prototype.create = function() {
  var headtxt = '',
      maintxt = '',
      mes = this.mes,
      style = this.style,
      closb = this.closb ? this.closb : false,
      cont = document.createElement('div'),
      head = document.createElement('h3'),
      main = document.createElement('p'),
      clos = document.createElement('a');
  if ( typeof mes == 'string' ) {
    maintxt = mes;
    if (style == 'primary') {
      headtxt = '提示';
    }
    if (style == 'success') {
      headtxt = '成功';
    }
    if (style == 'warning') {
      headtxt = '注意';
    }
    if (style == 'danger') {
      headtxt = '警告';
    }
  }
  if ( typeof mes == 'object') {
    maintxt = mes.text;
    headtxt = mes.title;
    head.innerHTML = headtxt;
  }
  cont.setAttribute('uk-alert', '');
  clos.setAttribute('class', 'uk-alert-close');
  clos.setAttribute('uk-close', '');
  if ( style ) {
    cont.setAttribute('class', 'uk-alert-' + style);
  }
  head.innerHTML = headtxt;
  main.innerHTML = maintxt;
  if ( !closb ) {
    cont.appendChild(clos);
  }
  cont.appendChild(head);
  cont.appendChild(main);
  this.message = cont;
  return cont;
};
export function fn_getMes ( mes, args) {
  var m = new Message( mes, args),
      message = m.create();
  return message;
}
export function fn_remMes( node ) {
  if ( !node ) {
    return false;
  } else {
    var par = node.parentNode;
    if ( par )
      par.removeChild(node);
    else
      return false
  }
}
// fn_getMes({title: '信息标题', text: '信息主体'}, {style: 'primary', close: false}*);
// fn_getMes('信息主体', {style: 'primary'});

// TEST:
// var mes1 = fn_getMes({title: '信息标题', text: '信息主体'}, {style: 'primary', close: true}),
//     mes2 = fn_getMes('信息主体', {style: 'primary'}),
//     mes3 = fn_getMes('信息主体', {style: 'success'}),
//     mes4 = fn_getMes('信息主体', {style: 'warning'}),
//     mes5 = fn_getMes('信息主体', {style: 'danger'});
//   document.querySelector('.maincontent').appendChild(mes1);
//   // fn_remove(mes1);
//   document.querySelector('.maincontent').appendChild(mes2);
//   document.querySelector('.maincontent').appendChild(mes3);
//   document.querySelector('.maincontent').appendChild(mes4);
//   document.querySelector('.maincontent').appendChild(mes5);