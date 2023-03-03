import Glob_fn from './Global'
export default function fn_initPaginate(res, pageNumber, pageSize, fetchFn, callback, postDataHandler) {
  Glob_fn.Table.hideUnvalued();
  Glob_fn.Table.showTable();
  Glob_fn.Table.checkSize();
  Glob_fn.Table.tbodyHideSome();
  if (res.data.totalPage > 1) {
    var p = new Paginate();
    p.showPagnition(res.data.totalPage, pageNumber, pageSize, fetchFn, callback, postDataHandler);
  } else {
    var wrap = document.querySelector('ul[data-for=dataTable]');
    if (wrap)
      wrap.innerHTML = '';
  }
}
function Paginate() {}
Paginate.prototype.showPagnition = function (totalPage, pageNumber, pageSize, fetchFn, callback, postDataHandler){
  totalPage = Number(totalPage);
  pageNumber = Number(pageNumber);
  pageSize = Number(pageSize);
  var wrap = document.querySelector('ul[data-for=dataTable]');
  wrap.innerHTML = '';
  var url = document.querySelector('input[name=api_forTable]').value;
  if ( pageNumber > 1 ) {
    var link_pre = Paginate.getPagi_liPre(wrap);
    link_pre.addEventListener('click', function(event) {
      event.preventDefault();
      var data = getPostData(pageNumber - 1, postDataHandler);
      fetchFn.call(this, url, data, callback);
    });
  }
  for (var i = 0; i < totalPage; i++) {
    let li
    if ( i == pageNumber - 1) {
      li = Paginate.getPagi_liActive(pageNumber);
    } else {
      var obj = Paginate.getPagi_liNormal(i+1);
      var link = obj.link;
      li = obj.li;
      link.addEventListener('click', function(event) {
        event.preventDefault();
        var data = getPostData(this.innerText, postDataHandler);
        fetchFn.call(this, url, data, callback);
      });
    }
    wrap.appendChild(li);
  }
  if ( pageNumber < totalPage ) {
    var link_nex = Paginate.getPagi_liNext(wrap);
    link_nex.addEventListener('click', function(event) {
      event.preventDefault();
      var data = getPostData(pageNumber + 1, postDataHandler);
      fetchFn.call(this, url, data, callback);
    });
  }

  Paginate.getPagi_hidePage(10, wrap, pageNumber, totalPage);
  
  function getPostData(pageNumber, postDataHandler) {
    var data = {};
    var form = document.getElementById('dataForm');
    data = $(form).serializeObject();
    if (typeof postDataHandler === 'function') postDataHandler.call(this, data);
    data.pageNumber = pageNumber;
    data.indexPage = pageNumber;
    data.pageSize = pageSize;
    data.countPage = pageSize;
    return data;
  }
}
Paginate.getPagi_liPre = function(parentUl) {
  var li_pre = document.createElement('li');
  li_pre.setAttribute('class','function');
  parentUl.appendChild(li_pre);
  var link_pre = document.createElement('a');
  li_pre.appendChild(link_pre);
  var span_pre = document.createElement('span');
  span_pre.setAttribute('uk-pagination-previous', '');
  link_pre.appendChild(span_pre);
  return link_pre;
}
Paginate.getPagi_liNext = function(parentUl) {
  var li_nex = document.createElement('li');
  li_nex.setAttribute('class','function');
  parentUl.appendChild(li_nex);
  var link_nex = document.createElement('a');
  li_nex.appendChild(link_nex);
  var span_nex = document.createElement('span');
  span_nex.setAttribute('uk-pagination-next', '');
  link_nex.appendChild(span_nex);
  return link_nex;
}
Paginate.getPagi_liActive = function(innerText) {
  var li = document.createElement('li');
  var span = document.createElement('span');
  span.innerText = innerText;
  li.setAttribute('class', 'uk-active');
  li.appendChild(span);
  return li;
}
Paginate.getPagi_liNormal = function(innerText) {
  var li = document.createElement('li');
  var link = document.createElement('a');
  link.innerText = innerText;
  li.appendChild(link);
  return {
    li: li,
    link: link
  }
}
Paginate.getPagi_hidePage = function(showNumber, parentNode, pageNumber, totalPage) {
  var showPages = showNumber;
  var liArr = parentNode.querySelectorAll('li:not(.function)');
  let li
  if (Number(pageNumber) > showPages+2 ) {
    for (var i = 1; i < Number(pageNumber)-showPages-1; i++) {
      liArr[i].style.display = 'none';
    }
    li = this.getPagi_liActive('...');
    parentNode.insertBefore(li, liArr[1]);
  }
  if (totalPage-pageNumber > showPages+1) {
    for (let i = Number(pageNumber)+showPages; i < totalPage-1; i++) {
      liArr[i].style.display = 'none';
    }
    li = this.getPagi_liActive('...');
    parentNode.insertBefore(li, liArr[totalPage-1]);
  }
}