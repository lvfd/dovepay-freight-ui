// Polyfill:
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

var Glob_fn = {
  errorHandler: function(error, callback) {
    var errMsg = error? error: '未知错误';
    if (console) {
      console.error('错误信息IN_CONSOLE: ', errMsg);
    }
    if (UIkit) {
      try {
        UIkit.modal.alert(errMsg).then(callback);  
      } catch (e) {
        alert(errMsg);
      }
    } else {
      alert(errMsg);
    }
  },
  inheritPrototype: function(superType, subType) {  // 继承函数：
    var prototype = Object(superType.prototype);  //创建对象
    prototype.constructor = subType;              //增强对象
    subType.prototype = prototype;                //指定对象
  },
  isJSON: function(str) {
    if (typeof str !== "string") return false;
    try {
        var object = JSON.parse(str);
        if(object && typeof object === "object"){
          return true
        } else {
          return false
        }
    }catch (e) {
      /* 不处理 */
    }
  },
  isDOM: function(item) {
    return (typeof HTMLElement === 'function')
      ? (item instanceof HTMLElement)
      : (item && (typeof item === 'object') && (item.nodeType === 1) && (typeof item.nodeName === 'string'));
  },
  initMain: function() {
    var main = document.getElementById('dpfMain');
    var headerH = 73
    var navH = 40
    var footerH = 90
    // var browserH = window.outerHeight
    var browserVisibleH = window.innerHeight
    // console.log(browserH, browserVisibleH)
    var dH = browserVisibleH - headerH - navH - footerH;
    main.setAttribute("style", "min-height:" + dH + "px");
  },
  initNav: function() {
    var btns = document.querySelectorAll('#dpfNav button')
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function(){
        event.stopPropagation()
        var thisBtnCls = this.querySelector('i').classList
        var dropdown = this.nextElementSibling
        if (thisBtnCls.contains('fa-caret-down')) {
          for (var j = 0; j < btns.length; j++) {
            btns[j].querySelector('i')
              .setAttribute('class', 'fa fa-caret-down')
            btns[j].nextElementSibling.setAttribute('style', 'display:none')
          }
          thisBtnCls.remove('fa-caret-down')
          thisBtnCls.add('fa-caret-up')
          dropdown.setAttribute('style', 'display:block')
        } else {
          this.blur()
          thisBtnCls.remove('fa-caret-up')
          thisBtnCls.add('fa-caret-down')
          dropdown.setAttribute('style', 'display:none')
        }
      }, false)
    }
    document.addEventListener('click', function(){
      for (var i = 0; i < btns.length; i++) {
        btns[i].nextElementSibling.setAttribute('style', 'display:none')
        btns[i].querySelector('i').setAttribute('class', 'fa fa-caret-down')
      }
    })
  },
  loading: {
    show: function() {
      if (document.getElementById('loadingOverlay')) return;
      var body = document.querySelector('body');
      var main = document.querySelector('main');
      var parentNode = main? main: body;
      var div = document.createElement('div');
      div.setAttribute('id', 'loadingOverlay');
      // div.setAttribute('uk-sticky', '');
      div.style.position = 'fixed';
      div.setAttribute('class', 'uk-position-cover uk-overlay uk-overlay-default uk-flex uk-flex-center uk-flex-middle');
      div.innerHTML = '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>';
      parentNode.appendChild(div);
      return div;
    },
    hide: function() {
      var div = document.querySelectorAll('#loadingOverlay');
      if (!div || div.length === 0) {
        throw new Error('没有loading遮罩');
      }
      if (div.length > 1) {
        throw new Error('存在多个loading遮罩');
      }
      for (var i = 0; i < div.length; i++) {
        div[i].parentNode.removeChild(div[i]);
      }
    }
  },
  checkboxAndRadio: {
    getBindingLabel: function(childNode) {
      var label = null;
      var child = childNode;
      var maxCount = 5;
      do {
        label = child.parentNode;
        child = label;
        maxCount--;
      } while ( label.tagName !== 'LABEL' && maxCount > 0 )
      if ( label.tagName !== 'LABEL' ) {
        throw new Error('没有label节点');
      }
      return label;
    },
    setBindingLabels: function(radioSet) {
      var parentProp = this;
      // var labels = labelSet? labelSet: getLabelSet(radioSet);
      return function () {
        for (var i = 0; i < radioSet.length; i++) {
          var radio = radioSet[i];
          var label = parentProp.getBindingLabel(radio);
          label.classList.remove('button-primary');
        }
        for (let i = 0; i < radioSet.length; i++) {
          var radio2 = radioSet[i];
          if (radio2.checked) {
            parentProp.getBindingLabel(radio2).classList.add('button-primary');
          }
        }
        // console.log(this.getRadioValue(radioSet))
      };
    },
    initActiveLabel: function(radio) {
      var parentProp = this;
      if (radio.hasAttribute('checked')) {
        parentProp.getBindingLabel(radio).classList.add('button-primary');
      } else {
        parentProp.getBindingLabel(radio).classList.remove('button-primary');
      }
    },
    getRadioValue: function(radioSet) {
      var value = null;
      for (var i = 0; i < radioSet.length; i++) {
        var radio = radioSet[i]
        if (radio.checked) {
          value = radio.value;
        }
      }
      return value;
    },
  },
  WdateInit: function(startTimeId, endTimeId, args) {
    var sta = document.getElementById(startTimeId);
    var end = document.getElementById(endTimeId);
    var dateFmt = args && args.dateFmt? args.dateFmt: 'yyyy-MM-dd';
    if (dateFmt === 'yyyy年MM月') {
      setVelInp(startTimeId);
      setVelInp(endTimeId);
    }
    var minDate = args && args.minDate? args.minDate: false;
    var maxDate = args && args.maxDate? args.maxDate: false;
    sta.addEventListener('click', function() {
      var config_s = {
        dateFmt: dateFmt,
        maxDate: '#F{$dp.$D(\'' + endTimeId + '\')}',
      };
      if (dateFmt === 'yyyy年MM月') {
        config_s.vel = startTimeId + '_2';
        config_s.realDateFmt = args.realDateFmt? args.realDateFmt: 'yyyyMMdd';
      }
      if (minDate) config_s.minDate = minDate;
      if (maxDate === 'today') config_s.maxDate = '#F{$dp.$D(\'' + endTimeId + '\') || \'%y-%M-%d\'}';
      WdatePicker(config_s);
    });
    end.addEventListener('click', function() {
      var config_e = {
        dateFmt: dateFmt,
        minDate: '#F{$dp.$D(\'' + startTimeId + '\')}'
      };
      if (dateFmt === 'yyyy年MM月') {
        config_e.vel = endTimeId + '_2';
        config_e.realDateFmt = args.realDateFmt? args.realDateFmt: 'yyyyMMdd';
      }
      if (minDate)
        config_e.minDate = '#F{$dp.$D(\'' + startTimeId + '\') || \'' + minDate + '\'}';
      if (maxDate === 'today') config_e.maxDate = '%y-%M-%d';
      WdatePicker(config_e);
    });
    function setResetButton(input) {
      var btn = document.querySelector('form input[type=reset]');
      if (!btn) return;
      btn.addEventListener('click', function() {
        input.value = '';
      });
    }
    function setVelInp(id) {
      var inp = document.createElement('input');
      var src = document.getElementById(id);
      var srcName = src.getAttribute('name');
      var data = src.getAttribute('data-value');
      src.removeAttribute('name');
      inp.setAttribute('name', srcName);
      inp.setAttribute('id', id + '_2');
      inp.setAttribute('type', 'hidden');
      if (data) {
        inp.setAttribute('value', data);
        src.setAttribute('value', data.slice(0, 4) + '年' + data.slice(4, 6) + '月');
      }
      document.getElementById(id).parentNode.appendChild(inp);
      setResetButton(inp);
      return inp;
    }
  },
  banBackSpace: function(event) {
    var ev = event || window.event;
    var obj = ev.target || ev.srcElement;
    var t = obj.type || obj.getAttribute('type');
    var vReadOnly = obj.getAttribute('readonly');
    vReadOnly = (vReadOnly == '') ? false : vReadOnly;
    var flag1 = (ev.keyCode == 8 && (t == 'password' || t == 'text' || t == 'number' || t =='textarea') && vReadOnly != undefined) ? true : false;
    var flag2 = (ev.keyCode == 8 && t != 'password' && t != 'text' && t != 'number' && t != 'textarea') ? true : false;
    if (flag2) {
      return false;
    }
    if (flag1) {
      return false;
    }
  },
  submVirtForm: function(url, obj) {
    var form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'post';
    form.action = url;
    for ( var key in obj) {
      var inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = key;
      inp.value = obj[key];
      form.appendChild(inp);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  },
  initDiscoutTypeSel: function(dataList, parentSelect) {
    var op0 = document.createElement('option');
    op0.setAttribute('value', 'TYPE');
    op0.innerText = '全部';
    parentSelect.appendChild(op0);
    for (var i = 0; i < dataList.length; i++) {
      var op = document.createElement('option');
      op.setAttribute('value', dataList[i].key);
      op.innerText = dataList[i].value;
      parentSelect.appendChild(op);
    }
  },
  initSupplierSel: function(dataList, parentSelect) {
    var op0 = document.createElement('option');
    op0.setAttribute('value', '');
    op0.innerText = '全部';
    parentSelect.appendChild(op0);
    for (var i = 0; i < dataList.length; i++){
      var op = document.createElement('option');
      op.setAttribute('value', dataList[i].supplierId);
      op.innerText = dataList[i].supplierNameChn;
      parentSelect.appendChild(op);
    }
  },
  initDiscountDetails: function(data) {
    document.getElementById('discountPolicyName').value = data.discountPolicyName;
    document.getElementById('status').value = data.statusDesc;
    document.getElementById('startTime').value = data.startTime;
    document.getElementById('endTime').value = data.endTime;
    document.getElementById('discountType').value = data.discountTypeDesc;
    document.getElementById('minCharge').value = data.minCharge;
    document.getElementById('feerateValue').value = getFeerate();
    function getFeerate() {
      var list = data.discountFeeRequestList;
      if (list.length < 1) return null;
      var result = '';
      for (var i = 0; i < list.length; i++) {
        if (list[i].discountFeeType == 'rate') {
          result = list[i].discountFeeValue;
        }
      }
      return result;
    }
    // 输出品名：
    var cargoNameWrap = document.getElementById('cargoName');
    if (data.cargoName) {
      let label = document.createElement('label');
      label.innerText = '优惠品名项';
      cargoNameWrap.appendChild(label);
      let div = document.createElement('div');
      div.setAttribute('class', 'uk-margin-small uk-margin-small-left');
      div.innerText = data.cargoName;
      cargoNameWrap.appendChild(div);
    } else if (cargoNameWrap.innerHTML) {
      cargoNameWrap.innerHTML = '';
    }
    // 输出discountValue：
    var discountValueWrap = document.getElementById('discountValue');
    if (data.discountValue) {
      let label = document.createElement('label');
      if (data.discountType == 'F')
        label.innerText = '优惠航班';
      else if (data.discountType == 'WP')
        label.innerText = '优惠航点';
      else if (data.discountType == 'G')
        label.innerText = '优惠支持方式';
      else
        label.innerText = '优惠值';
      discountValueWrap.appendChild(label);
      let div = document.createElement('div');
      div.setAttribute('class', 'uk-margin-small uk-margin-small-left');
      div.innerText = data.discountValue;
      discountValueWrap.appendChild(div);
    } else if (discountValueWrap.innerHTML) {
      discountValueWrap.innerHTML = '';
    }
    
    var table = document.getElementById('discountFeeRequestList');
    var tbody = getTbody();
    table.appendChild(tbody);
    function getTbody() {
      var tbody = document.createElement('tbody');
      var list = data.discountFeeRequestList;
      for (var i = 0; i < list.length; i++) {
        var tr = document.createElement('tr');
        if (list[i].discountFeeType == 'rate') {
          continue;
        } else {
          var td1 = document.createElement('td');
          td1.innerText = list[i].discountFeeKeyName;
          var td2 = document.createElement('td');
          td2.innerText = list[i].discountFeeTypeDesc;
          var td3 = document.createElement('td');
          td3.innerText = list[i].discountFeeValue;
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbody.appendChild(tr);
        }
      }
      return tbody;
    }
  },
  Table: {
    showNoData: function(colspan) {
      var tr0 = document.createElement('tr');
      var td0 = document.createElement('td');
      td0.innerText = '无数据';
      td0.setAttribute('colspan', colspan);
      td0.setAttribute('class', 'uk-text-center');
      tr0.appendChild(td0);
      // 清空分页组件：
      var pag = document.querySelector('ul[data-for=dataTable]');
      pag.innerHTML = '';

      return tr0;
    },
    getThTr: function(table) {
      var thead = table.querySelector('thead');
      thead.innerHTML = '';
      var trInThead = document.createElement('tr');
      thead.appendChild(trInThead);
      // thead.style.backgroundColor = 'white';
      // thead.setAttribute('uk-sticky', '');
      return trInThead;
    },
    setTh: function(parentTr, content, showBoo) {
      var th = document.createElement('th');
      var show = showBoo === undefined? true: showBoo;
      if (typeof content == 'object') {
        th.appendChild(content);
      } else {
        th.innerText = content;
      }
      if (!show) th.setAttribute('hidden', '');
      parentTr.appendChild(th);
      return th;
    },
    setTd: function(parentTr, data, showBoo, replaceStr) {
      var td = document.createElement('td');
      var show = showBoo === undefined? true: showBoo;
      var replace = replaceStr? replaceStr: '-'
      if (typeof data === 'string' || typeof data === 'number') {
        if (data) {
          var span = document.createElement('span');
          span.style.display = 'inline-block';
          span.innerHTML = data;
          td.appendChild(span);
        } else {
          setNoData(td, replace);
        }
      } else if (Glob_fn.isDOM(data)) {
        td.appendChild(data);
      } else if (Array.isArray(data)) {
        if (data.length < 1) {
          setNoData(td, replace);
        } else {
          for (var i = 0; i < data.length; i++) {
            td.appendChild(data[i]);
          }
        }
      } else {
        setNoData(td, replace);
      }
      if (!show) td.setAttribute('hidden', '');
      parentTr.appendChild(td);
      return td;
      function setNoData(td, replace) {
        td.innerHTML = replace;
        td.setAttribute('class', 'uk-text-center');
      }
    },
    setTdSerial: function(parentTr, number, pageNumber, pageSize) {
      var tdSerial = document.createElement('td');
      parentTr.appendChild(tdSerial);
      tdSerial.innerText = number + 1 + (Number(pageNumber) - 1) * Number(pageSize);
      return tdSerial;
    },
    hideSome: function(td, width) {
      var span = td.querySelector('span');
      if (!span) return;
      var maxW = width? width: 200;
      // var byteLength = td.innerText.byteLength();
      var computedWidth = window.getComputedStyle
        ? window.getComputedStyle(span, null).getPropertyValue('width').slice(0, -2)
        : span.currentStyle.getPropertyValue('width').slice(0, -2);
      if (Number(computedWidth) < maxW) return td;
      td.style.overflow = 'hidden';
      td.style.textOverflow = 'ellipsis';
      td.style.maxWidth = maxW + 'px';
      td.style.cursor = 'pointer';
      td.innerText = span.innerText;
      td.setAttribute('uk-tooltip', td.innerText);
      return td;
    },
    trHideSome: function(tr, max) {
      var tds = tr.querySelectorAll('td');
      for (var i = 0; i < tds.length; i++) {
        var td = tds[i];
        this.hideSome(td, max);
      }
      return tr;
    },
    tbodyHideSome: function() {
      var table = document.getElementById('dataTable');
      if (!table) return;
      if (!table.hasAttribute('data-hideSome')) return;
      var prop = table.getAttribute('data-hideSome');
      var size = isNaN(Number(prop))? null: Number(prop);
      var tbody = table.querySelector('tbody');
      var trs = tbody.querySelectorAll('tr');
      if (trs.length < 1) return;
      for (var i = 0; i < trs.length; i++) {
        var tr = trs[i];
        this.trHideSome(tr, size);
      }
      return tbody;
    },
    buildAjaxTitle: function(titleData, parentNode) {
      var colCount = 0;
      for (var i = 0; i < titleData.length; i++) {
        var list = titleData[i];
        if (list.feeShortNm === '处置费') {
          var th0 = document.createElement('th');
          th0.innerText = '地面费率';
          th0.setAttribute('data-col', colCount);
          th0.setAttribute('class', 'feeItemTitle');
          colCount++;
          parentNode.appendChild(th0);
        }
        var th = document.createElement('th');
        th.innerText = list.feeShortNm;
        th.setAttribute('data-col', colCount);
        colCount++;
        th.setAttribute('class', 'feeItemTitle');
        parentNode.appendChild(th); 
      }
    },
    getAjaxTitleValue: function(data, key) {
      var arr = [];
      for (var i = 0; i < data.length; i++) {
        var value = data[i][key].toString().replace(/-/g, '#')
                  .match(/-?([1-9]\d*(\.\d*)*|0\.[1-9]\d*)/g);
        if (data[i].feeShortNm === '处置费') {
          arr.push(['specialPos']);
        }
        arr.push(value);
      }
      return arr;
    },
    getAjaxTitleData: function(title, feeIdArr, dataList) {
      var arr = title? [title]: [];
      for (var i = 0; i < feeIdArr.length; i++) {
        var data = '-';
        var feeIdGroup = feeIdArr[i];
        for (var j = 0; j < feeIdGroup.length; j++) {
          var titleFeeId = feeIdGroup[j];
          for (var k = 0; k < dataList.length; k++) {
            var listFeeId = dataList[k].feeId;
            var listValue = dataList[k].fee === null? '-': dataList[k].fee;
            var listRate = dataList[k].feerate;
            var listRateFlag = dataList[k].feeShortNM === '处置费';
            if (titleFeeId == listFeeId) {
              if (listRateFlag) {
                arr.pop();
                arr.push(listRate);
              }
              data = listValue;
            }
          }
        }
        arr.push(data);
      }
      if (title) {
        return arr;
      } else {
        return {
          data: arr,
          title: false,
        };
      }
    },
    getAjaxTitleObject: function(feeIdArr, dataList) {
      var arr = [];
      for (var i = 0; i < feeIdArr.length; i++) {
        var feeIdGroup = feeIdArr[i];
        for (var j = 0; j < feeIdGroup.length; j++) {
          var titleFeeId = feeIdGroup[j];
          for (var k = 0; k < dataList.length; k++) {
            var listFeeId = dataList[k].feeId;
            if (titleFeeId == listFeeId) {
              var obj = dataList[k];
            }
          }
        }
        if (obj !== null && obj !== undefined) {
          arr.push(obj);
          obj = null;
        }       
      }
      return arr;
    },
    buildValueWithAjaxTitle: function(linedata, parentNode) {
      var isArr = Array.isArray(linedata);
      var data = isArr? linedata: linedata.data;
      for (var i = 0; i < data.length; i++) {
        var td = document.createElement('td');
        td.innerText = data[i];
        if (!isArr) {
          td.setAttribute('data-col', i);
        } else {
          if (i >= 1) td.setAttribute('data-col', i-1);
        }
        parentNode.appendChild(td);
      }
    },
    hideUnvalued: function(pointedTable, checkValue) {
      try {
        var table = pointedTable? pointedTable: document.getElementById('dataTable');
        var flag = checkValue? checkValue: '-';
        var ths = table.querySelectorAll('th.feeItemTitle');
        if (!ths) return;
        var colCount = ths.length;
        for (var i = 0; i < colCount; i++) {
          var column = table.querySelectorAll('td[data-col="'+i+'"]');
          var unvaluedCol = '';
          for (var j = 0; j < column.length; j++) {
            unvaluedCol = true;
            if (column[j].innerText !== flag) {
              unvaluedCol = false;
              break;
            }
          }
          if (unvaluedCol) {
            for (var k = 0; k < column.length; k++) {
              column[k].setAttribute('hidden', '');
            }
            table.querySelector('th[data-col="'+i+'"]').setAttribute('hidden', '');
          }
        }
      } catch (error) {
        console.error(error);
        return;
      }
    },
    checkSize: function(pointedTable) {
      try {
        var table = pointedTable? pointedTable: document.getElementById('dataTable');
        var div = table.parentNode;
        var container = document.querySelector('.maincontent');
        var tabwidth = window.getComputedStyle(table, null).getPropertyValue('width').slice(0, -2);
        var divwidth = window.getComputedStyle(div, null).getPropertyValue('width').slice(0, -2);
        if (Number(tabwidth) > Number(divwidth)) {
          container.classList.remove('normalWidth');
          container.classList.add('largeWidth');
        }
      } catch(error) {
        console.error(error);
        return;
      }
    },
    getCheckbox: function(ifAll) {
      var lab = document.createElement('label');
      lab.setAttribute('class', 'void');
      var chb = document.createElement('input');
      lab.appendChild(chb);
      chb.setAttribute('type', 'checkbox');
      chb.setAttribute('class', 'uk-checkbox');
      if (ifAll) {
        chb.setAttribute('id', 'selectAll');
        chb.setAttribute('disabled', '');
      } else {
        chb.setAttribute('class', 'cb_child');
      }
      chb.addEventListener('click', function() {
        var btn = document.getElementById('multiBtn');
        if (!btn) {
          throw new Error('没有对应按键');
        }
        if (this.checked) {
          btn.removeAttribute('disabled');
        } else {
          btn.setAttribute('disabled', '');
        }
      });
      return lab;
    },
    linkCheckboxes: function(selAll, selChildren) {
      selAll.addEventListener('click', function() {
        if (selAll.checked) {
          for (let i = 0; i < selChildren.length; i++) {
            if (!selChildren[i].checked) {
              selChildren[i].click();
            }
          }
        } else {
          for (let i = 0; i < selChildren.length; i++) {
            if (selChildren[i].checked) {
              selChildren[i].click();
            }
          }
        }
      });
    },
    addCheckedToList: function(chb, list) {
      for ( var i = 0; i < chb.length; i++) {
        if (chb[i].checked) {
          var data = chb[i].getAttribute('data-checked');
          list.push(data);
        } else {
          continue;
        }
      }
    },
    hideTable: function() {
      var tab = document.getElementById('dataTable');
      if (!tab) return;
      tab.setAttribute('hidden', '');
    },
    showTable: function() {
      var tab = document.getElementById('dataTable');
      if (!tab) return;
      tab.removeAttribute('hidden');
    },
  },
  getDictArg_forQueryBills: function() {
    var tType = document.querySelector('input[name=type]').value;
    if (!tType) {
      throw new Error('没有type参数');
    }
    if (tType == '1' || tType == '2') {
      // 直达时货运类型查询
      return 'EXPIMP';
    } else if (tType  == '3') {
      // 中转时货运类型
      return 'TRANSFERTYPE';
    } else if (tType == '4') {
      // 快件货运类型
      return 'EXPMAIL';
    }
  },
  setSelDefaultOption: function(select, text, value) {
    var option0 = document.createElement('option');
    option0.setAttribute('value', value);
    option0.innerText = text;
    select.appendChild(option0);
  },
  setSelFromDict: function(select, data) {
    for (var i = 0; i < data.length; i++) {
      var option = document.createElement('option');
      option.innerText = data[i].value;
      option.value = data[i].key;
      select.appendChild(option);
    }
  },
  setInAndOut: function (res) {
    var data = res.data;
    if (data == null || data.length == 0) {
      throw new Error('字典接口无数据');
    }
    var select = document.querySelector('select[name=inAndOut]');
    this.setSelDefaultOption(select, '全部', '-1');
    try {
      this.setSelFromDict(select, data);
    } catch(e) {
      throw new Error(e);
    }
  },
  setOpedepartId: function (res) {
    var data = res.data;
    if (data == null || data.length == 0) {
      throw new Error('字典接口无数据');
    }
    var select = document.querySelector('select[name=opedepartId]');
    this.setSelDefaultOption(select, '全部', '-1');
    try {
      this.setSelFromDict(select, data);
    } catch(e) {
      throw new Error(e);
    }
  },
  getOrderTime: function() {  // 账单查看界面获取账期
    try {
      return {
        orderTimeStart: document.querySelector('input[name=orderTimeStart]').value,
        orderTimeEnd: document.querySelector('input[name=orderTimeEnd]').value,
      };
    } catch (error) {
      if (console) console.error(error);
      return {
        orderTimeStart: '',
        orderTimeEnd: '',
      };
    }
  },
  setPostLink: function(links, postData) {
    try {
      if (!this.isDOM(links) && links.length) {
        for (var i = 0; i < links.length; i++) {
          links[i].addEventListener('click', callback);
        }
      } else {
        links.addEventListener('click', callback);
      }
    } catch (error) {
      return;
    }
    function callback(event) {
      event.preventDefault();
      var url = this.getAttribute('href');
      Glob_fn.submVirtForm(url, postData);
    }
  },
};

export default Glob_fn