import Glob_fn from './Global'
import fn_queryDict from './QueryDict'
import {Listbox, initListBox} from './Listbox'
import FormValidate from './FormValidate'
import fn_initPaginate from './Paginate'
import {
  checkRes, fetchData, fn_initSubmitBtn, fn_initExportBtn,
  fetch_exportExcel, fetch_sta_stationBillPush,
  fetch_sta_getStationAllConsumer, fetch_sta_addDiscountCustomer,
  fetch_sta_getAllDiscountPolicy, fetch_age_toPay,
  fetch_sta_queryDiscountPolicy, fetch_sta_queryDiscountCustomer,
  fetch_sta_changeCustomerDiscountStatus, fetch_sta_changeDiscountStatus,
  fetch_sta_updateFee
} from './AjaxManager'

var role = getRole();
function getRole() {
  try {
    return document.getElementById('userType').value;
  } catch (error) {
    Glob_fn.errorHandler(error);
    return;
  }
}
export function initStation_baseData() {
  // var form = document.getElementById('dataForm');
  Glob_fn.WdateInit('startTime', 'endTime', {
    dateFmt: 'yyyy年MM月',
    // minDate: '{%y-1}-{%M+9}-%d',
    maxDate: 'today',
  });
  entry();  // 异步函数调用入口
  function entry() {
    fetchExpImp();
  }
  function fetchDictErrHandler(res) {
    if (res.data === undefined) throw new Error('远程数据非法: 字典接口返回值未定义');
    if (!Array.isArray(res.data)) throw new Error('远程数据非法: 字典接口返回值格式错误');
    if (res.data.length < 1) throw new Error('远程数据非法: 字典接口返回值为空值');
  }
  function setOptions(arr, selName) {
    var sel = document.querySelector('select[name=' + selName + ']');
    if (!sel) return;
    for (var i = 0; i < arr.length; i++) {
      var op = document.createElement('option');
      op.setAttribute('value', arr[i].key);
      op.innerText = arr[i].value;
      sel.appendChild(op);
    }
  }
  function fetchExpImp() {
    fn_queryDict('EXP_IMP', function(res) {
      if (checkRes(res) === false) return;
      try {
        fetchDictErrHandler(res);
        setOptions(res.data, 'expImp');
        fetchDomInt();
      } catch (error) {
        Glob_fn.errorHandler(error);
        return;
      }
    });
  }
  function fetchDomInt() {
    fn_queryDict('DOM_INT', function(res) {
      if (checkRes(res) === false) return;
      try {
        fetchDictErrHandler(res);
        setOptions(res.data, 'domInt');
        fetchPayMode();
      } catch (error) {
        Glob_fn.errorHandler(error);
        return;
      }
    });
  }
  function fetchPayMode() {
    fn_queryDict('PAY_MODE', function(res) {
      if (checkRes(res) === false) return;
      try {
        fetchDictErrHandler(res);
        setOptions(res.data, 'payMode');
        if (role === 'system') {
          initPage();
          return;
        }
        fetchEffectiveBillRules();
      } catch (error) {
        Glob_fn.errorHandler(error);
        return;
      }
    });
  }
  function fetchEffectiveBillRules() {
    var api = document.querySelector('input[name=api_queryEffectiveBillRule');
    var url = api.value;
    fetchData(url, '', createEffectiveBillRules);
  }
  function createEffectiveBillRules(res) {
    var data = res.data || res.date;
    try {
      if (data === undefined) throw new Error('远程数据格式非法: 没有data属性');
      if (!Array.isArray(data)) throw new Error('远程数据格式非法: data属性不是数组');
      if (data.length < 1) throw new Error('没有已生效的账单规则(此功能可选)');
    } catch(err) {
      // Glob_fn.errorHandler(err, initPage); // 显示异常
      initPage(); // 不处理异常
    }
    for (var i = 0; i < data.length; i++) {
      createBillRuleButtons(data[i]);
    }
    try {
      renderEffectiveBillRules();
      initPage();
    } catch (error) {
      Glob_fn.errorHandler(error);
      return;
    }
    function createBillRuleButtons(data) {
      var rule = data.billRule? data.billRule: 'NULL';
      var desc = data.billRuleDesc? data.billRuleDesc: 'NULL';
      var id = data.billRuleId? data.billRuleId: 'NULL';
      var name = data.billRuleName? data.billRuleName: 'NULL';
      var position = document.getElementById('ruleSetsWrap');
      var wrap = document.createElement('div');
      position.appendChild(wrap);
      wrap.appendChild(getLabel());
      wrap.appendChild(getDrop());
      function getLabel() {
        var label = document.createElement('label');
        label.setAttribute('class', 'void button');
        label.innerText = name;
        var input = document.createElement('input');
        label.appendChild(input);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'billRule');
        input.setAttribute('hidden', '');
        input.setAttribute('value', rule);
        input.setAttribute('id', id);
        return label;
      }
      function getDrop() {
        var drop = document.createElement('div');
        drop.setAttribute('uk-drop', 'delay-hide:0');
        var cardFrame = document.createElement('div');
        drop.appendChild(cardFrame);
        cardFrame.setAttribute('class', 'uk-card uk-card-small uk-card-default');
        cardFrame.appendChild(getCardHeader());
        cardFrame.appendChild(getCardBody());
        return drop;
        function getCardHeader() {
          var header = document.createElement('div');
          header.setAttribute('class', 'uk-card-header');
          var title = document.createElement('div');
          title.setAttribute('class', 'uk-card-title');
          header.appendChild(title);
          var h = document.createElement('h5');
          title.appendChild(h);
          h.innerText = name;
          return header;
        }
        function getCardBody() {
          var div = document.createElement('div');
          div.setAttribute('class', 'uk-card-body uk-container uk-container-xsmall');
          if (desc === 'NULL') {
            div.innerText = '无数据';
          }
          try {
            var array = [];
            if (desc.indexOf(',') !== -1) array = desc.split(',');
            else if (desc.indexOf('，') !== -1) array = desc.split('，');
            if (array.length < 1) div.innerText('无数据');
            for (var j = 0; j < array.length; j++) {
              var span = document.createElement('span');
              span.setAttribute('class', 'uk-label uk-margin-small-bottom uk-margin-small-right');
              span.innerText = $.trim(array[j]);
              div.appendChild(span);
            }
          } catch(error) {
            div.innerText = error;
          }
          return div;
        }
      }
    }
  }
  function renderEffectiveBillRules() {
    var ruleSetsWrapDiv = document.getElementById('ruleSetsWrap');
    var ruleRadios = ruleSetsWrapDiv.querySelectorAll('input[type=radio]');
    var ruleLabels = ruleSetsWrapDiv.querySelectorAll('label');
    // Bind radios:
    for (let i = 0; i < ruleRadios.length; i++) {
      var radio = ruleRadios[i];
      var func = Glob_fn.checkboxAndRadio;
      func.initActiveLabel(radio);
      radio.addEventListener('change', func.setBindingLabels(ruleRadios));
      radio.addEventListener('click', function(event) {
        event.stopPropagation();  // 阻止事件上升到label
      });
    }
    // Bind labels: 
    for (let i = 1; i < ruleLabels.length; i++) {
      var label = ruleLabels[i];
      label.addEventListener('mousedown', function(event) {
        event.preventDefault(); // 抵消drop控件副作用
      });
    }
    // Bind reset button:
    var resetBtn = document.querySelector('input[type=reset]');
    var defaultRadio = ruleRadios[0];
    resetBtn.addEventListener('click', function() {
      defaultRadio.click(); // 重置为全部
    });
  }
  function initPage() {
    fn_initSubmitBtn(1, 15, fetchData, new Sta_table().getTable_queryOriginalWaybill, function(data) {
      if (data.billRule === '') 
        data.billRule = null;
    }, {
      timeout: 20000,
    });
    fn_initExportBtn(fetch_exportExcel);
  }
}
export function initStation_billMangement_queryBills() {
  // var form = document.getElementById('dataForm');
  Glob_fn.WdateInit('startTime', 'endTime', {
    dateFmt: 'yyyy年MM月',
    // minDate: '{%y-3}-%M-%d',
    maxDate: 'today',
    realDateFmt: 'yyyyMM',
  });
  fn_initSubmitBtn(1, 15, fetchData, new Sta_table().getTable_querySumBillByRule);
}
export function initStation_stationQueryBill_new() {
  if (role === 'agent') {
    initPage();
  } else {
    initNewPage();
  }
  function initPage() {
    Glob_fn.WdateInit('startTime', 'endTime', {
      dateFmt: 'yyyy年MM月',
      minDate: '{%y-3}-%M-%d',
      maxDate: 'today',
      realDateFmt: 'yyyyMM',
    });
    fn_initSubmitBtn(1, 15, fetchData, new Sta_table().getTable_queryBill_new);
  }
  function initNewPage() {
    Glob_fn.setPostLink(document.querySelectorAll('.postDataLink'), Glob_fn.getOrderTime());
    fn_initSubmitBtn(1, 15, fetchData, new Sta_table().getTable_queryBill_new);
    fn_initExportBtn(fetch_exportExcel);
    if (role === 'system') return;
    if (role === 'station') setMultiPushButton();
    function setMultiPushButton() {
      var multiBtn = document.getElementById('multiBtn');
      multiBtn.addEventListener('click', function(event) {
        event.preventDefault();
        var url = document.querySelector('input[name=api_stationBillPush]').value;
        var chb = document.querySelectorAll('.cb_child');
        var list = [];
        Glob_fn.Table.addCheckedToList(chb, list);
        if (list.length == 0) {
          UIkit.modal.alert('请选择至少一项');
          return;
        }
        var postData = {orderNoList: list};
        // console.log(url, postData);
        fetch_sta_stationBillPush(url, postData);
      });
    }
  }
}
export function initStation_stationQueryBillDetails_new() {
  if (role === 'agent') {
    initThisPage();
    return;
  }
  fn_queryDict('OPEDEPART', function(res) {
    if (checkRes(res) === false) return;
    Glob_fn.setOpedepartId(res);
    initThisPage();
  });
  function initThisPage() {
    if (role !== 'agent') Glob_fn.setPostLink(document.querySelectorAll('.postDataLink'), Glob_fn.getOrderTime());
    // bind submit button:
    fn_initSubmitBtn(1, 5, fetchData, new Sta_table().getTable_queryDetails_new);
    // bind export button:
    fn_initExportBtn(fetch_exportExcel);
  }
}
export function initStation_getStationAllConsumer() {
  // bind submit button:
  fn_initSubmitBtn(1, 10, fetch_sta_getStationAllConsumer);
  // bind export button:
  fn_initExportBtn(fetch_exportExcel);

  // 初始化Listbox：
  var showListBox = document.querySelector('#discountSetting'); // userInfo
  if (showListBox) {
    initListBox();
  }
  // 优惠设置提交按钮绑定：
  var listBoxSubmitButton = document.querySelector('#fn_discSettle');
  listBoxSubmitButton.addEventListener('click', function(event) {
    event.preventDefault();
    var url = document.querySelector('input[name=api_forDiscSettle]').value;
    var listbox = new Listbox();
    var data = listbox.postData_discountName();
    fetch_sta_addDiscountCustomer(url, data);
  });
}
export function initStation_getAllDiscountPolicy() {
  // get select options:
  fn_queryDict('DISCOUNT_TYPE', function(res) {
    // set options:
    if (!res.data || res.data.length < 1) {
      throw new Error('字典接口错误');
    }
    var DISCOUNT_TYPE = res.data;
    var form = document.getElementById('dataForm');
    var selectType = form.querySelector('select[name=discountType]');
    var op0 = document.createElement('option');
    op0.value = 'TYPE';
    op0.innerText = '全部';
    selectType.appendChild(op0);
    for (var i = 0; i < DISCOUNT_TYPE.length; i++) {
      var op = document.createElement('option');
      for (var key in DISCOUNT_TYPE[i]) {
        if ( key == 'value') {
          op.innerText = DISCOUNT_TYPE[i][key];
        }
        if (key == 'key') {
          op.setAttribute('value', DISCOUNT_TYPE[i][key]);
        }
        op.setAttribute('data-' + key, DISCOUNT_TYPE[i][key]);
        selectType.appendChild(op);
      }
    }

    // init Wdate:
    Glob_fn.WdateInit('startTime', 'endTime');
    Glob_fn.WdateInit('setStartTime', 'setEndTime');
    
    // bind submit:
    fn_initSubmitBtn(1, 10, fetch_sta_getAllDiscountPolicy);

    // bind add new:
    var newBtn = document.querySelector('#toDiscountPolicies');
    newBtn.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = 'discountPolicies';
    })
  });
}
export function initStation_billsSetting() {
  Glob_fn.WdateInit('startTime', 'endTime', {
    // dateFmt: 'yyyy年MM月',
    // minDate: '{%y-1}-{%M+9}-%d',
    // maxDate: 'today',
  });
  // Bind Add rule Button:
  bindAddRuleBtn();
  function bindAddRuleBtn() {
    var btn = document.getElementById('addRule');
    btn.addEventListener('click', function(event) {
      event.preventDefault();
      window.location.href = 'billsSetting/addRule';
    });
  }
  // Bind Submit:
  fn_initSubmitBtn(1, 10, fetchData, new Sta_table().getTable_queryBillRuleByPage);
}
export function initStation_billsSetting_addRule() {
  var form = document.getElementById('dataForm');
  var vld = new FormValidate();
  var validator = vld.validator();
  // fetch data:
  fetchBillRule();
  function fetchBillRule() {
    fn_queryDict('BILL_RULE', function(res) {
      if (checkRes(res) === false) return;
      try {
        if (res.data === undefined) throw new Error('远程数据非法: 数据没有data属性');
        if (!Array.isArray(res.data)) throw new Error('远程数据非法: data属性不是数组');
        if (res.data.length != 1) throw new Error('远程数据非法: data数组长度不为1');
        if (!Glob_fn.isJSON(res.data[0].value)) throw new Error('远程数据非法: 数据不是JSON格式');
        showValueFrom(JSON.parse(res.data[0].value));
        initPage();
      } catch (error) {
        Glob_fn.errorHandler(error);
        return;
      }
    });
  }
  function showValueFrom(fetchValue) {
    // console.log(fetchValue);
    if (!Array.isArray(fetchValue)) throw new Error('远程数据非法: JSON数据不是数组');
    if (fetchValue.length < 1) throw new Error('无规则可选');
    var radiosHeading = document.getElementById('radiosHeading');
    var checkboxesHeading = document.getElementById('checkboxesHeading');
    var checkAllWrap = document.getElementById('checkAllWrap');
    var checkboxesCount = 0;
    for (var i = 0; i < fetchValue.length; i++) {
      var ruleProps = fetchValue[i];
      if (ruleProps.checkBox) {
        if (checkboxesHeading.hasAttribute('hidden')) {
          checkboxesHeading.removeAttribute('hidden');
        }
        checkboxesCount++;
      } else {
        if (radiosHeading.hasAttribute('hidden')) {
          radiosHeading.removeAttribute('hidden');
        }
      }
      setRule(ruleProps);
    }
    if (checkboxesCount > 1 && checkAllWrap.hasAttribute('hidden')) {
      checkAllWrap.removeAttribute('hidden');
    }
    function setRule(data) {
      var name = data.name? data.name: 'NULL';
      var type = data.type? data.type: 'NULL';
      var wrap = data.checkBox? document.getElementById('checkboxesWrap'):
        document.getElementById('radiosWrap');
      var frame = getFrame();
      wrap.appendChild(frame);
      var label = getLabel();
      var contentDiv = getContentDiv();
      frame.appendChild(label);
      frame.appendChild(contentDiv);
      if (!Array.isArray(data.content)) throw new Error('远程数据非法: content不是数组');
      if (data.content.length < 1) throw new Error(data.name + '类型下无数据');
      for (var j = 0; j < data.content.length; j++) {
        var key = data.content[j].key? data.content[j].key: '';
        var value = data.content[j].value? data.content[j].value: 'NULL';
        var content = getContent(key, value);
        contentDiv.appendChild(content);
      }
      function getFrame() {
        var frame = document.createElement('div');
        frame.setAttribute('class', 'uk-margin');
        if (!data.checkBox) frame.classList.add('radioWrap');
        return frame;
      }
      function getLabel() {
        var label = document.createElement('label');
        label.setAttribute('class', 'uk-form-label');
        label.setAttribute('data-ruleType', type);
        label.setAttribute('data-ruleName', name);
        label.innerText = name;
        return label;
      }
      function getContentDiv() {
        var contentWrap = document.createElement('div');
        contentWrap.setAttribute('class', 'uk-form-controls uk-grid-small');
        contentWrap.setAttribute('uk-grid', '');
        return contentWrap;
      }
      function getContent(key, value) {
        var div = document.createElement('div');
        var label = document.createElement('label');
        label.setAttribute('class', 'void button');
        div.appendChild(label);
        var input = document.createElement('input');
        input.setAttribute('type', data.checkBox? 'checkbox': 'radio');
        input.setAttribute('class', data.checkBox? 'linkLabel': '');
        input.setAttribute('name', type);
        input.setAttribute('hidden', '');
        input.setAttribute('value', key);
        input.setAttribute('data-ruleDesc', value);
        if (input.getAttribute('type') === 'radio' && input.value === 'MP')
          input.setAttribute('checked', '');
        label.appendChild(input);
        var span = document.createElement('span');
        span.innerText = value;
        label.appendChild(span);
        return div;
      }
    }
  }
  function initPage() {
    // vld: bindItems:
    validator.bindFormItems();
    // UI: Bind Radios:
    bindAllRadios();
    function bindAllRadios() {
      var wraps = form.querySelectorAll('.radioWrap');
      if (wraps.length < 1) {
        throw new Error('没有定义div.radioWrap');
      }
      for (var j = 0; j < wraps.length; j++) {
        var wrap = wraps[j];
        bindRadios(wrap);
      }
      function bindRadios(wrap) {
        var radios = wrap.querySelectorAll('input[type=radio]');
        if (radios.length < 1) {
          return;
        }
        for (var i = 0; i < radios.length; i++) {
          var radio = radios[i];
          var func = Glob_fn.checkboxAndRadio;
          func.initActiveLabel(radio);
          radio.addEventListener('change', func.setBindingLabels(radios));
        }
      }
    }
    // UI: Checkboxes:
    checkboxes();
    function checkboxes() {
      var cbx_all = document.getElementById('checkAllRules');
      var cbxs = form.querySelectorAll('input[type=checkbox].linkLabel');
      // UI: checkbox绑定样式:
      cbxLinkLabel();
      function cbxLinkLabel() {
        if (cbxs.length < 1) {
          return;
        }
        for (var i = 0; i < cbxs.length; i++) {
          var cbx = cbxs[i];
          cbx.addEventListener('change', function() {
            changeStyle(this);
            if (cbx_all.checked) {
              cbx_all.checked = false;
            }
          });
        }
      }
      // UI: 全选功能实现:
      complyCheckAll();
      function complyCheckAll() {
        if (!cbx_all) {
          return;
        }
        if (cbxs.length < 1) {
          return;
        }
        cbx_all.addEventListener('change', function() {
          if (this.checked) {
            // 全选
            setAllChecked(cbxs, true);
          } else {
            // 全不选
            setAllChecked(cbxs, false);
          }
        });
        function setAllChecked(checkboxes, boo) {
          if (!checkboxes || checkboxes.length < 1) {
            throw new Error('没有找到将要对应的checkbox');
          }
          for (var i = 0; i < checkboxes.length; i++) {
            var checkbox = checkboxes[i];
            if (boo && checkbox.checked) {
              // 不处理
            } else {
              checkbox.checked = boo
              changeStyle(checkbox);
            }
          }
        }
      }
      // UI: checkbox按钮样式规则:
      function changeStyle(checkbox) {
        var labClasses = Glob_fn.checkboxAndRadio.getBindingLabel(checkbox).classList;
        if (labClasses.contains('newMonth')) {
          labClasses.toggle('button-highlight');
          labClasses.toggle('uk-text-warning');
        } else {
          labClasses.toggle('button-primary');
        }
      }
    }
    // Submit Binding:
    submitAddRule();
    function submitAddRule() {
      var btn = document.getElementById('createBill');
      var url = document.querySelector('input[name=url_station_billSetting]').value;
      var not = "<span id='notification' uk-icon='icon: check'></span> 提交成功";
      btn.addEventListener('click', function(event) {
        event.preventDefault();
        if (!validator.submitBoo()) {
          return;
        }
        UIkit.modal.confirm('确定提交信息并生成账单规则?').then(function() {
          try {
            var postData = getPostData();
            var postUrl = document.querySelector('input[name=api_stationCreateBillRule]').value;
            fetchData(postUrl, postData, successCallback);
          } catch (error) {
            Glob_fn.errorHandler(error);
            return;
          }
        });
      });
      function getPostData() {
        return JSON.stringify({
          billRuleName: getName(),
          billRule: getRule().rule,
          billRuleDesc: getRule().desc,
        });
      }
      function getName() {
        var name = document.getElementById('billName').value;
        if (!name) throw new Error('表单错误: 请重新填写账单规则名称');
        return name;
      }
      function getRule() {
        try {
          var rs = document.getElementById('radiosWrap').querySelectorAll('input[type=radio]');
          var cs = document.getElementById('checkboxesWrap').querySelectorAll('input[type=checkbox]');
          var checkedInputs = getCheckedInputs();
          if (checkedInputs.length < 1) throw new Error('表单错误: 未选择规则');
          var rulesInfo = getRulesInfo(checkedInputs);
          return {
            rule: getResults(rulesInfo).rule,
            desc: getResults(rulesInfo).desc,
          }
        } catch (error) {
          throw new Error(error);
        }
        function getCheckedInputs() {
          var array = [];
          putCheckedInpIn(rs, array);
          putCheckedInpIn(cs, array);
          return array;
        }
        function putCheckedInpIn(inputs, array) {
          for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) 
              array.push(inputs[i]);
          }
        }
        function getRulesInfo(inputs) {
          var array = [];
          for (var i = 0; i < inputs.length; i++) {
            var inp = inputs[i];
            array.push({
              name: inp.name,
              value: inp.value,
              desc: inp.getAttribute('data-ruleDesc'),
            });
          }
          return array;
        }
        function getResults(rawArray) {
          var result = {};
          var desc = [];
          var tmpName = '';
          for (var i = 0; i < rawArray.length; i++) {
            if (rawArray[i].name === tmpName) {
              result[rawArray[i].name].push(rawArray[i].value);
            } else {
              result[rawArray[i].name] = [rawArray[i].value];
              tmpName = rawArray[i].name;
            }
            desc.push(rawArray[i].desc);
          }
          return {
            rule: JSON.stringify(result),
            desc: parseDesc(desc),
          }
          function parseDesc(array) {
            var result = '';
            for (var i = 0; i < array.length; i++) {
              result += array[i].toString();
              if (i < array.length -1)
                result += ', ';
            }
            return result;
          }
        }
      }
      function successCallback() {
        // alert(JSON.stringify(res))
        UIkit.notification(not, {
          status: 'success',
          timeout: 1000,
        });
        UIkit.util.on('.uk-notification', 'close', function() {
          window.location.href = url;
        });
      }
    }
  }
}

export function Sta_table(){}
// 生成基础数据展示表格（新需求）:
Sta_table.prototype.getTable_queryOriginalWaybill = function(res, pageNumber, pageSize) {
  getFeeItem();
  function getFeeItem() {
    var url = document.querySelector('input[name=api_queryFeeItem]').value;
    fetchData(url, '', createTable);
  }
  function createTable(feeItems) {
    try {
      var table = document.getElementById('dataTable');
      if (!feeItems.data) throw new Error('远程数据非法: 费用列表项未定义');
      var trInThead = Glob_fn.Table.getThTr(table);
      setCaption(res.data);
      setThead(feeItems.data);
      setTbody(res, feeItems.data);
      fn_initPaginate(res, pageNumber, pageSize, fetchData, new Sta_table().getTable_queryOriginalWaybill, function(data) {
        if (data.billRule === '') 
          data.billRule = null;
      });
    } catch (error) {
      throw new Error(error)
    }
    function setCaption(data) {
      var caption = table.querySelector('caption');
      if (!caption) return;
      caption.setAttribute('hidden', '')
      if (data.totalCount !== undefined) {
        caption.querySelector('span.totalCount').innerText = data.totalCount;
        caption.removeAttribute('hidden');
      }
    }
    function setThead(data) {
      Glob_fn.Table.setTh(trInThead, '序号');
      Glob_fn.Table.setTh(trInThead, '费用记录号');
      Glob_fn.Table.setTh(trInThead, '运单前缀');
      Glob_fn.Table.setTh(trInThead, '运单号');
      Glob_fn.Table.setTh(trInThead, '品名');
      Glob_fn.Table.setTh(trInThead, '货运类型');
      Glob_fn.Table.setTh(trInThead, '始发站');
      Glob_fn.Table.setTh(trInThead, '目的站');
      Glob_fn.Table.setTh(trInThead, '航班号');
      Glob_fn.Table.setTh(trInThead, '件数');
      Glob_fn.Table.setTh(trInThead, '重量');
      Glob_fn.Table.setTh(trInThead, '计费重量');
      Glob_fn.Table.setTh(trInThead, '计费时间');
      Glob_fn.Table.setTh(trInThead, '计费营业点');
      Glob_fn.Table.setTh(trInThead, '计费营业点名称');
      Glob_fn.Table.buildAjaxTitle(data, trInThead);
      Glob_fn.Table.setTh(trInThead, '金额');
    }
    function setTbody(rawData, ajaxTitle) {
      var tbody = table.querySelector('tbody');
      table.setAttribute('data-hideSome', '');
      tbody.innerHTML = '';
      var data = rawData.data.feeList;
      if (!data || data.length < 1) {
        var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
        tbody.appendChild(tr0);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        var tdSerial = document.createElement('td');
        tr.appendChild(tdSerial);
        tdSerial.innerText = i + 1 + (Number(pageNumber) - 1) * Number(pageSize);
        Glob_fn.Table.setTd(tr, data[i].feeRecId);
        Glob_fn.Table.setTd(tr, data[i].stockPre);
        Glob_fn.Table.setTd(tr, data[i].stockNo);
        Glob_fn.Table.setTd(tr, data[i].cargoNm);
        Glob_fn.Table.setTd(tr, data[i].type);
        Glob_fn.Table.setTd(tr, data[i].sAirportDsc);
        Glob_fn.Table.setTd(tr, data[i].eAirportDsc);
        Glob_fn.Table.setTd(tr, data[i].flight);
        Glob_fn.Table.setTd(tr, data[i].pcs);
        Glob_fn.Table.setTd(tr, data[i].weight);
        Glob_fn.Table.setTd(tr, data[i].feeWt);
        Glob_fn.Table.setTd(tr, data[i].crtopeTimeStr);
        Glob_fn.Table.setTd(tr, data[i].opedepartId);
        Glob_fn.Table.setTd(tr, data[i].opedepartStr);
        var feeIdArr = Glob_fn.Table.getAjaxTitleValue(ajaxTitle, 'feeId');
        var ajaxData = Glob_fn.Table.getAjaxTitleData(null, feeIdArr, JSON.parse(data[i].feeItemList));
        Glob_fn.Table.buildValueWithAjaxTitle(ajaxData, tr);
        Glob_fn.Table.setTd(tr, data[i].totalFeeStr);
        // Glob_fn.Table.trHideSome(tr);
      }
    }
  }
};
// 生成账单汇总查询表格（新需求）:
Sta_table.prototype.getTable_querySumBillByRule = function(res, pageNumber, pageSize) {
  try {
    createTable(res);
  } catch(error) {
    throw new Error(error);
  }
  function createTable(res) {
    var table = document.getElementById('dataTable');
    if (!res.data) throw new Error('远程数据非法: data未定义');
    var trInThead = Glob_fn.Table.getThTr(table);
    setThead();
    setTbody(res);
    fn_initPaginate(res, pageNumber, pageSize, fetchData, new Sta_table().getTable_querySumBillByRule);
    function setThead() {
      Glob_fn.Table.setTh(trInThead, '序号');
      Glob_fn.Table.setTh(trInThead, '账单名称');
      Glob_fn.Table.setTh(trInThead, '开账时间');
      Glob_fn.Table.setTh(trInThead, '账期');
      Glob_fn.Table.setTh(trInThead, '金额');
      Glob_fn.Table.setTh(trInThead, '操作');
    }
    function setTbody(res) {
      var tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      var data = res.data.billList;
      if (!data || data.length < 1) {
        var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
        tbody.appendChild(tr0);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        Glob_fn.Table.setTdSerial(tr, i, pageNumber, pageSize);
        Glob_fn.Table.setTd(tr, data[i].billRuleName);
        Glob_fn.Table.setTd(tr, data[i].accountOpeningTime);
        Glob_fn.Table.setTd(tr, data[i].orderTime);
        Glob_fn.Table.setTd(tr, data[i].totalFee);
        Glob_fn.Table.setTd(tr, getLink(data[i].billRuleId));
      }
      function getLink(id) {
        if (id === undefined) throw new Error('远程数据非法: summaryList.billRule未定义');
        var link = document.createElement('a');
        link.innerText = '查看账单'
        link.setAttribute('data-billRuleId', id);
        link.setAttribute('uk-tooltip', '点击查看');
        link.addEventListener('click', function(event) {
          event.preventDefault();
          var url = document.querySelector('input[name=url_forNext]').value + '/' + id;
          Glob_fn.submVirtForm(url, Glob_fn.getOrderTime());
        });
        return link;
      }
    }
  }
};
// 账单查看主表(新需求)：
Sta_table.prototype.getTable_queryBill_new = function(res, pageNumber, pageSize) {
  try {
    createTable(res);
  } catch(error) {
    throw new Error(error);
  }
  function createTable(res) {
    var table = document.getElementById('dataTable');
    if (!res.data) throw new Error('远程数据非法: data未定义');
    var trInThead = Glob_fn.Table.getThTr(table);
    var checkAll = Glob_fn.Table.getCheckbox('all');
    trInThead = role === 'agent'? setAgentThead(): setThead();
    setTbody(res);
    if (role === 'station') setCheckAll(checkAll);
    fn_initPaginate(res, pageNumber, pageSize, fetchData, new Sta_table().getTable_queryBill_new);
    function setThead() {
      if (role === 'station') Glob_fn.Table.setTh(trInThead, checkAll);
      Glob_fn.Table.setTh(trInThead, '序号');
      Glob_fn.Table.setTh(trInThead, '开账时间');
      Glob_fn.Table.setTh(trInThead, '账期');
      Glob_fn.Table.setTh(trInThead, '货运类型', false);
      Glob_fn.Table.setTh(trInThead, '总金额');
      Glob_fn.Table.setTh(trInThead, '状态');
      Glob_fn.Table.setTh(trInThead, '优惠金额');
      Glob_fn.Table.setTh(trInThead, '平台订单号');
      Glob_fn.Table.setTh(trInThead, '交易流水号');
      Glob_fn.Table.setTh(trInThead, '结算客户编码');
      Glob_fn.Table.setTh(trInThead, '结算客户名称');
      Glob_fn.Table.setTh(trInThead, 'bindingStatus', false);
      Glob_fn.Table.setTh(trInThead, '操作');
      return trInThead;
    }
    function setAgentThead() {
      Glob_fn.Table.setTh(trInThead, '序号');
      Glob_fn.Table.setTh(trInThead, '开账时间');
      Glob_fn.Table.setTh(trInThead, '账期');
      Glob_fn.Table.setTh(trInThead, '账单名称');
      Glob_fn.Table.setTh(trInThead, '平台订单号');
      Glob_fn.Table.setTh(trInThead, '总金额');
      Glob_fn.Table.setTh(trInThead, '优惠后金额');
      Glob_fn.Table.setTh(trInThead, '付款状态');
      Glob_fn.Table.setTh(trInThead, '支付订单号');
      Glob_fn.Table.setTh(trInThead, '操作');
      return trInThead;
    }
    function setTbody(res) {
      var tbody = table.querySelector('tbody');
      table.setAttribute('data-hideSome', '400');
      tbody.innerHTML = '';
      var data = res.data.summaryList;
      if (data === undefined) throw new Error('远程数据非法: data.summaryList未定义');
      if (!data || data.length < 1) {
        var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
        tbody.appendChild(tr0);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        if (role === 'station') {
          var tdCheckbox = document.createElement('td');
          tr.appendChild(tdCheckbox);
          var checkbox = Glob_fn.Table.getCheckbox();
          checkbox.querySelector('input').setAttribute('data-checked', data[i].orderNo);
        }
        // var setTdSerial = Glob_fn.Table.setTdSerial(tr, i, pageNumber, pageSize);
        Glob_fn.Table.setTd(tr, data[i].createTimeStr);
        Glob_fn.Table.setTd(tr, data[i].orderTime);
        if (role === 'agent') {
          Glob_fn.Table.setTd(tr, data[i].billRuleName);
          Glob_fn.Table.setTd(tr, data[i].orderNo);
          Glob_fn.Table.setTd(tr, data[i].totalFeeStr);
          Glob_fn.Table.setTd(tr, data[i].realTotalFeeStr);
          Glob_fn.Table.setTd(tr, data[i].statusStr);
          Glob_fn.Table.setTd(tr, data[i].payNo);
          Glob_fn.Table.setTd(tr, getAgentLinks(data[i]));
        } else {
          Glob_fn.Table.setTd(tr, data[i].type, false);
          Glob_fn.Table.setTd(tr, data[i].totalFeeStr);
          Glob_fn.Table.setTd(tr, data[i].statusStr);
          Glob_fn.Table.setTd(tr, data[i].realTotalFeeStr);
          Glob_fn.Table.setTd(tr, data[i].orderNo);
          Glob_fn.Table.setTd(tr, data[i].payNo);
          Glob_fn.Table.setTd(tr, data[i].customerId);
          Glob_fn.Table.setTd(tr, data[i].customerName);
          Glob_fn.Table.setTd(tr, data[i].bindingStatus, false);
          Glob_fn.Table.setTd(tr, getLinks(data[i]));
        }
        // Glob_fn.Table.trHideSome(tr);
      }
      return tbody;
      function getLinks(data) {
        var orderNo = data.orderNo;
        if (orderNo === undefined) throw new Error('远程数据非法: orderNo未定义');
        var links = [];
        links.push(getDetailLink());
        if (role === 'station') {
          var pushlink = getPushLink();
          if (pushlink) links.push(getPushLink());
        }
        return links;
        function getDetailLink() {
          var link = document.createElement('a');
          link.innerText = '查看详情';
          link.setAttribute('data-orderNo', orderNo);
          var url = document.querySelector('input[name=url_forQueryDetails]').value + '/' + orderNo;
          var postData = Glob_fn.getOrderTime();
          if (role === 'station') postData.modify = Number(data.status) === 0 && Number(data.confirm) === 0;
          link.addEventListener('click', function(event) {
            event.preventDefault();
            Glob_fn.submVirtForm(url, postData);
          });
          return link;
        }
        function getPushLink() {
          if (Number(data.confirm) !== 0) return false;
          if (checkAll.querySelector('input').getAttribute('disabled') === '') {
            checkAll.querySelector('input').removeAttribute('disabled');
          }
          tdCheckbox.appendChild(checkbox);
          var pushlink = document.createElement('a');
          pushlink.innerText = '推送';
          pushlink.setAttribute('class', 'uk-margin-small-left');
          pushlink.setAttribute('data-orderNo', orderNo);
          pushlink.addEventListener('click', function(event) {
            event.preventDefault();
            var url = document.querySelector('input[name=api_stationBillPush]').value;
            var orderNo = this.getAttribute('data-orderNo');
            var orderNoList = [];
            orderNoList.push(orderNo);
            var data = { orderNoList: orderNoList };
            fetch_sta_stationBillPush(url, data);
          });
          return pushlink;
        }
      }
      function getAgentLinks(data) {
        var result = [];
        var detailLink = document.createElement('a');
        detailLink.innerText = '查看详情';
        detailLink.setAttribute('href', document.querySelector('input[name=url_forNext]').value + '/' + data.orderNo);
        result.push(detailLink);
        if (Number(data.status) === 2) return result; // 已支付
        var payLink = document.createElement('a');
        payLink.setAttribute('class', 'uk-margin-small-left');
        payLink.innerText = '付款';
        payLink.setAttribute('data-orderNo', data.orderNo);
        payLink.addEventListener('click', function(event) {
          event.preventDefault();
          var url = document.querySelector('input[name=api_pay]').value;
          var pageUrl = document.querySelector('input[name=pageUrl]').value;
          var orderNo = this.getAttribute('data-orderNo');
          var data = { orderNo: orderNo, pageUrl: pageUrl };
          // console.info(url, data)
          // debugger
          fetch_age_toPay(url, data);
        });
        result.push(payLink);
        return result;
      }
    }
    function setCheckAll(checkAll) {
      checkAll.addEventListener('click', function() {
        // var children = document.querySelector('input.cb_child');
        if (this.querySelector('input').checked)
          setChildren(true);
        else
          setChildren(false);
      });
      function setChildren(status) {
        var children = document.querySelectorAll('input.cb_child');
        for (var i = 0; i < children.length; i++) {
          if (children[i].checked === !status) children[i].click();
        }
      }
    }
  }
};
// 账单明细主表(新需求)：
Sta_table.prototype.getTable_queryDetails_new = function(res, pageNumber, pageSize) {
  getFeeItem();
  function getFeeItem() {
    var url = document.querySelector('input[name=api_queryFeeItem]').value;
    fetchData(url, '', createTable);
  }
  function createTable(feeItems) {
    try {
      var table = document.getElementById('dataTable');
      if (!feeItems.data) throw new Error('远程数据非法: 费用列表项未定义');
      var trInThead = Glob_fn.Table.getThTr(table);
      getCaptionData();
      setThead(feeItems.data);
      setTbody(res, feeItems.data);
      fn_initPaginate(res, pageNumber, pageSize, fetchData, new Sta_table().getTable_queryDetails_new);
    } catch (error) {
      throw new Error(error)
    }
    function getCaptionData() {
      var inp = document.querySelector('input[name=api_queryBillDetailsSum]');
      if (!inp) return;
      var url = inp.value;
      if (!url) return;
      var postData = JSON.stringify($(document.getElementById('dataForm')).serializeObject());
      fetchData(url, postData, setCaption);
    }
    function setCaption(res) {
      var data = res.data;
      var caption = table.querySelector('caption');
      if (!caption) return;
      caption.querySelector('span.totalCount').innerText = data.totalCount? data.totalCount: '无数据';
      caption.querySelector('span.totalFee').innerText = data.totalFee? data.totalFee: '无数据';
      caption.querySelector('span.totalWeight').innerText = data.totalWeight? data.totalWeight: '无数据';
      caption.querySelector('span.realTotalFee').innerText = data.realTotalFee? data.realTotalFee: '无数据';
      caption.removeAttribute('hidden');
    }
    function setThead(data) {
      Glob_fn.Table.setTh(trInThead, '序号');
      Glob_fn.Table.setTh(trInThead, '费用记录号');
      Glob_fn.Table.setTh(trInThead, '运单前缀');
      Glob_fn.Table.setTh(trInThead, '运单号');
      Glob_fn.Table.setTh(trInThead, '品名');
      if (role !== 'agent') Glob_fn.Table.setTh(trInThead, '货运类型');
      Glob_fn.Table.setTh(trInThead, '始发站');
      Glob_fn.Table.setTh(trInThead, '目的站');
      Glob_fn.Table.setTh(trInThead, '航班号');
      Glob_fn.Table.setTh(trInThead, '件数');
      Glob_fn.Table.setTh(trInThead, '重量');
      Glob_fn.Table.setTh(trInThead, '计费重量');
      Glob_fn.Table.setTh(trInThead, '计费时间');
      Glob_fn.Table.setTh(trInThead, '计费营业点');
      Glob_fn.Table.setTh(trInThead, '计费营业点名称');
      if (role !== 'agent') Glob_fn.Table.setTh(trInThead, '账单类型');
      Glob_fn.Table.buildAjaxTitle(data, trInThead);
      Glob_fn.Table.setTh(trInThead, '金额');
      if (role !== 'agent') Glob_fn.Table.setTh(trInThead, '操作');
    }
    function setTbody(rawData, ajaxTitle) {
      var tbody = table.querySelector('tbody');
      table.setAttribute('data-hideSome', '');
      tbody.innerHTML = '';
      var data = rawData.data.feeList;
      if (!data || data.length < 1) {
        var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
        tbody.appendChild(tr0);
        return;
      }
      for (var i = 0; i < data.length; i++) {
        var tr = document.createElement('tr');
        tbody.appendChild(tr);
        var trAdd = document.createElement('tr');
        tbody.appendChild(trAdd);
        Glob_fn.Table.setTdSerial(tr, i, pageNumber, pageSize).setAttribute('rowspan', 2)
        Glob_fn.Table.setTd(tr, data[i].feeRecId).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].stockPre).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].stockNo).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].cargoNm).setAttribute('rowspan', 2);
        if (role !== 'agent') Glob_fn.Table.setTd(tr, data[i].type).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].sAirportDsc).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].eAirportDsc).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].flight).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].pcs).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].weight).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].feeWt).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].crtopeTimeStr).setAttribute('rowspan', 2);
        Glob_fn.Table.setTd(tr, data[i].opedepartId).setAttribute('rowspan', 2);
        if (role !== 'agent') Glob_fn.Table.setTd(tr, data[i].opedepartStr).setAttribute('rowspan', 2);
        var feeIdArr = Glob_fn.Table.getAjaxTitleValue(ajaxTitle, 'feeId');
        var l1Data = Glob_fn.Table.getAjaxTitleData('原始账单', feeIdArr, JSON.parse(data[i].feeItemList));
        var l2Data = Glob_fn.Table.getAjaxTitleData('开账账单', feeIdArr, JSON.parse(data[i].realFeeItemList));
        if (role === 'station') var line2Object = Glob_fn.Table.getAjaxTitleObject(feeIdArr, JSON.parse(data[i].realFeeItemList));
        Glob_fn.Table.buildValueWithAjaxTitle(l1Data, tr);
        Glob_fn.Table.buildValueWithAjaxTitle(l2Data, trAdd);
        Glob_fn.Table.setTd(tr, data[i].totalFeeStr);
        Glob_fn.Table.setTd(trAdd, data[i].realTotalFeeStr);
        if (role !== 'agent') Glob_fn.Table.setTd(tr, '-').setAttribute('class', 'uk-text-center');
        if (role !== 'agent') Glob_fn.Table.setTd(trAdd, getAction(data[i], line2Object));
        // Glob_fn.Table.trHideSome(tr);
      }
      function getAction(data, line2Object) {
        var linkModHis = document.createElement('a');
        linkModHis.innerText = '修改记录';
        linkModHis.setAttribute('data-stockNo', data.stockNo);
        linkModHis.setAttribute('class', 'uk-margin-small-left');
        linkModHis.addEventListener('click', function(event) {
          event.preventDefault();
          var postData = JSON.stringify({stockNo: this.getAttribute('data-stockNo')});
          var url = document.querySelector('input[name=api_queryModifyLog]').value;
          fetchData(url, postData, createModHis);
        });
        if (role === 'system') return linkModHis;
        if (role === 'station') {
          if (!document.querySelector('input[name=modify]').value) return false;
          var linkmodify = document.createElement('a');
          linkmodify.innerText = '修改';
          linkmodify.setAttribute('data-feeItemList', JSON.stringify(line2Object));
          linkmodify.setAttribute('data-stockNo', data.stockNo);
          linkmodify.setAttribute('data-feeWt', data.feeWt);
          linkmodify.setAttribute('data-totalFeeStr', data.totalFeeStr);
          linkmodify.setAttribute('data-totalFee', data.totalFee);
          linkmodify.addEventListener('click', function(event) {
            event.preventDefault();
            var postData = {
              "stockNo": this.getAttribute('data-stockNo'),
              "totalFee": this.getAttribute('data-totalFee'),
              "totalFeeStr": this.getAttribute('data-totalFeeStr'),
              "feeWt": this.getAttribute('data-feeWt'),
              "feeItemList": this.getAttribute('data-feeItemList')
            };
            var element = fn_getModal(postData, '账单收费项');
            UIkit.modal(element).show();
          });
          return [linkmodify, linkModHis];
        }
      }
    }
  }
  function createModHis(res) {
    var data = res.data;
    if (res.data === undefined) throw new Error('远程数据非法: data未定义');
    if (res.data === null || data.length < 1) {
      UIkit.modal.alert('没有或不可查询该笔订单的修改记录');
      return;
    }
    if (!Array.isArray(res.data)) throw new Error('远程数据非法: data属性不是数组');
    var modal = document.getElementById('modifiedHistory');
    var table = document.getElementById('modifiedHistoryTable');
    var thead = table.querySelector('thead');
    thead.innerHTML = '';
    var trInThead = Glob_fn.Table.getThTr(table);
    Glob_fn.Table.setTh(trInThead, '用户名');
    Glob_fn.Table.setTh(trInThead, '修改时间');
    Glob_fn.Table.setTh(trInThead, '备注');
    var tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    for (var i = 0; i < res.data.length; i++) {
      var tr = document.createElement('tr');
      tbody.appendChild(tr);
      Glob_fn.Table.setTd(tr, res.data[i].createName);
      Glob_fn.Table.setTd(tr, res.data[i].createTime);
      Glob_fn.Table.setTd(tr, res.data[i].remark);
    }
    UIkit.modal(modal).show();
  }
};
// 生成账单规则汇总表格（新需求）:
Sta_table.prototype.getTable_queryBillRuleByPage = function(res, pageNumber, pageSize) {
  try {
    var table = document.querySelector('#dataTable');
    var trInThead = Glob_fn.Table.getThTr(table);
    createThead();
    createTbody();
    fn_initPaginate(res, pageNumber, pageSize, fetchData, new Sta_table().getTable_queryBillRuleByPage);
  } catch(error) {
    throw new Error(error);
  }
  function createThead() {
    Glob_fn.Table.setTh(trInThead, '序号');
    Glob_fn.Table.setTh(trInThead, '账单ID', false);
    Glob_fn.Table.setTh(trInThead, '账单名称');
    Glob_fn.Table.setTh(trInThead, '营业点');
    Glob_fn.Table.setTh(trInThead, '地区');
    Glob_fn.Table.setTh(trInThead, '进/出港类型');
    Glob_fn.Table.setTh(trInThead, '运单类型');
    Glob_fn.Table.setTh(trInThead, '是否为快件');
    Glob_fn.Table.setTh(trInThead, '用户名');
    Glob_fn.Table.setTh(trInThead, '状态');
    Glob_fn.Table.setTh(trInThead, '状态码', false);
    Glob_fn.Table.setTh(trInThead, '设置时间');
    Glob_fn.Table.setTh(trInThead, '操作');
  }
  function createTbody() {
    var tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    var data = res.data.queryBillRuleList;
    if (!data || data.length < 1) {
      var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
      tbody.appendChild(tr0);
      return;
    }
    for (var i = 0; i < data.length; i++) {
      var tr = document.createElement('tr');
      tbody.appendChild(tr);
      var tdSerial = document.createElement('td');
      tr.appendChild(tdSerial);
      tdSerial.innerText = i + 1 + (Number(pageNumber) - 1) * Number(pageSize);
      Glob_fn.Table.setTd(tr, data[i].billRuleId, false);
      Glob_fn.Table.setTd(tr, data[i].billRuleName);
      setTdFromArray(tr, data[i].billRule, 'OPEDEPART');
      setTdFromArray(tr, data[i].billRule, 'DOM_INT');
      setTdFromArray(tr, data[i].billRule, 'EXP_IMP');
      setTdFromArray(tr, data[i].billRule, 'TRANSFER_TYPE');
      setTdFromArray(tr, data[i].billRule, 'EXP_MAIL');
      Glob_fn.Table.setTd(tr, data[i].createName);
      Glob_fn.Table.setTd(tr, data[i].statusStr);
      Glob_fn.Table.setTd(tr, data[i].status, false);
      Glob_fn.Table.setTd(tr, data[i].setTime);
      tr.appendChild(getTdAction(data[i].billRuleId));
    }
    function setTdFromArray(parentTr, array, name, showBoo) {
      var show = showBoo === undefined? true: showBoo;
      var td = document.createElement('td');
      parentTr.appendChild(td);
      td.innerText = getValue().text;
      td.setAttribute('data-billRuleType', getValue().type);
      if (!show) td.setAttribute('hidden', '');
      return td;
      function getValue() {
        if (!Array.isArray(array)) throw new Error('billRule属性不是数组');
        var text = '-';
        var ruleType = '';
        for (var j = 0; j < array.length; j++) {
          var type = array[j].type
          if (type === name) {
            text = array[j].content? array[j].content: text;
            ruleType = type;
          }
        }
        return {
          text: text,
          type: ruleType,
        };
      }
    }
    function getTdAction(billRuleId) {
      var td = document.createElement('td');
      td.setAttribute('class', 'uk-table-link');
      var deleteLink = document.createElement('a');
      td.appendChild(deleteLink);
      deleteLink.setAttribute('class', 'deleteTr');
      deleteLink.setAttribute('title', '删除此账单');
      deleteLink.setAttribute('data-billRuleId', billRuleId);
      deleteLink.innerText = '删除';
      deleteLink.addEventListener('click', function(event) {
        event.preventDefault();
        var thisBtn = this;
        UIkit.modal.confirm('删除后不可恢复，确认删除吗？').then(function(){
          try {
            fetchData(getUrl(), getPostData(thisBtn), successCallback);
          } catch (error) {
            Glob_fn.errorHandler(error);
            return;
          }
        })
      });
      return td;
      function getUrl() {
        return document.querySelector('input[name=api_deleteRule]').value;
      }
      function getPostData(trigger) {
        var billRuleId = trigger.getAttribute('data-billRuleId');
        if (billRuleId === undefined) throw new Error('billRuleId未定义');
        return JSON.stringify({
          'billRuleId': billRuleId,
        });
      }
      function successCallback() {
        UIkit.modal.alert('删除成功').then(function() {
          try {
            document.getElementById('submitBtn').click();
          } catch (error) {
            Glob_fn.errorHandler(error);
            return;            
          }
        });
      }
    }
  }
};
// 用户管理主表：
Sta_table.prototype.getTable_getStationAllConsumer = function(res, pageNumber, pageSize) {
  var table = document.querySelector('#dataTable');

  var trInThead = Glob_fn.Table.getThTr(table);
  Glob_fn.Table.setTh(trInThead, '序号');
  Glob_fn.Table.setTh(trInThead, '客户代码');
  Glob_fn.Table.setTh(trInThead, '货运公司全称');
  Glob_fn.Table.setTh(trInThead, '状态');
  Glob_fn.Table.setTh(trInThead, '用户状态');
  Glob_fn.Table.setTh(trInThead, '结算方式');
  Glob_fn.Table.setTh(trInThead, '操作');

  var tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  var data = res.data.consumerList;

  if (!data || data.length < 1) {
    var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
    tbody.appendChild(tr0);
    return;
  }

  for (var i = 0; i < data.length; i++) {
    var tr = document.createElement('tr');
    tbody.appendChild(tr);
    
    var tdSerial = document.createElement('td');
    tr.appendChild(tdSerial);
    tdSerial.innerText = i + 1 + (Number(pageNumber) - 1) * Number(pageSize);

    var td1 = document.createElement('td');
    tr.appendChild(td1);
    var td2 = document.createElement('td');
    tr.appendChild(td2);
    var td3 = document.createElement('td');
    tr.appendChild(td3);
    var td4 = document.createElement('td');
    tr.appendChild(td4);
    var td5 = document.createElement('td');
    tr.appendChild(td5);
    var td6 = document.createElement('td');
    tr.appendChild(td6);
    var linkSet = document.createElement('a');
    var linkShow = document.createElement('a');
    

    for (var key in data[i]) {
      if (key == 'customerId') {
        td1.innerText = data[i][key] === null? '-': data[i][key];
        linkSet.setAttribute('data-' + key, data[i][key]);
        linkShow.setAttribute('data-' + key, data[i][key]);
      }
      if (key == 'customerNameChn')
        td2.innerText = data[i][key] === null? '-': data[i][key];
      if (key == 'statusDesc')
        td3.innerText = data[i][key] === null? '-': data[i][key];
      if (key == 'canYesDesc') 
        td4.innerText = data[i][key] === null? '-': data[i][key];
      if (key == 'feeWayDesc')
        td5.innerText = data[i][key] === null? '-': data[i][key];
    }

    var list = data[i];
    // 如果现结或未注册：
    if (list.feeWayId == 'CS' || list.status == '0') {
      td6.innerText = '-'
    } else if (list.feeWayId != 'CS') { // 如果是非现结
      if (list.canYes == '0') { // 且在使用中
        linkSet.innerText = '优惠设置';
        td6.appendChild(linkSet);
        linkSet.addEventListener('click', function(event) {
          event.preventDefault();
          var url = document.querySelector('input[name=api_forDiscSet]').value;
          var customerId = this.getAttribute('data-customerId');
          fetch_sta_queryDiscountPolicy(url, customerId);
        });
      }
      linkShow.innerText = '优惠政策查看';
      linkShow.setAttribute('class', 'uk-margin-small-left');
      linkShow.addEventListener('click', function(event) {
        event.preventDefault();
        var url = document.querySelector('input[name=api_forDiscShow]').value;
        var customerId = this.getAttribute('data-customerId');
        var data = {customerId: customerId};
        fetch_sta_queryDiscountCustomer(url, data);
      });
      td6.appendChild(linkShow);
    }
  }

  // 设置pagination
  fn_initPaginate(res, pageNumber, pageSize, fetch_sta_getStationAllConsumer);
};
// 用户优惠查看主表：
Sta_table.prototype.getTable_queryDiscountCustomer = function(res) {
  var tbody = document.createElement('tbody');
  var data = res.data;
  if (data.length < 1 || data === null) {
    var tr0 = document.createElement('tr');
    var td0 = document.createElement('td');
    td0.setAttribute('colspan', '3');
    td0.innerText = '无数据';
    td0.style.textAlign = 'center'
    tr0.appendChild(td0);
    tbody.appendChild(tr0);
    return tbody;
  }
  for (var i = 0; i < data.length; i++) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td'),
        td2 = document.createElement('td'),
        span1 = document.createElement('span'),
        span2 = document.createElement('span'),
        td3 = document.createElement('td');
    var link = document.createElement('a');
    td3.appendChild(link);
    for ( var key in data[i]) {
      if (key == 'discountPolicyName') {
        td1.setAttribute('data-arg', key);
        td1.innerText = data[i][key];
      } else if (key == 'startTimeStr') {
        span1.setAttribute('data-arg', key);
        span1.innerText = data[i][key];
      } else if (key == 'endTimeStr') {
        span2.setAttribute('data-arg', key);
        span2.innerText = data[i][key];
      } else if (key == 'status') {
        td3.setAttribute('data-arg', key);
        getActionText(data[i][key], link);
      } else if (key == 'discountPolicyId') {
        link.setAttribute('data-' + key, data[i][key]);
      } else if (key == 'customerId') {
        link.setAttribute('data-' + key, data[i][key]);
      } else {
        var td = document.createElement('td');
        td.setAttribute('data-arg', key);
        td.innerText = data[i][key];
        td.style.display = 'none';
        tr.appendChild(td);
      }
    }
    td2.appendChild(span1);
    td2.appendChild(span2);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var discountPolicyId = this.getAttribute('data-discountPolicyId');
      var customerId = this.getAttribute('data-customerId');
      var status = this.getAttribute('data-status');
      var postData = {
        discountPolicyId: discountPolicyId,
        customerId: customerId,
        status: status
      };
      var url = document.querySelector('input[name=api_forDiscSorS]').value;
      fetch_sta_changeCustomerDiscountStatus(url, postData);
      var parTd = this.parentNode;
      if (status == '1') {
        parTd.removeChild(this);
        parTd.innerText = '已暂停';
      }
      if (status == '0') {
        parTd.removeChild(this);
        parTd.innerText = '已启用';
      }
    });
    tbody.appendChild(tr);
  }
  return tbody;
  function getActionText(status, link) {
    if (status == '0') {
      // 启用状态，设置暂停
      link.setAttribute('data-status', '1');
      link.innerText = '暂停';
    }
    if (status == '1') {
      // 暂停状态，设置启用
      link.setAttribute('data-status', '0');
      link.innerText = '启用';
    }
  }
};
// 优惠设置页面表格：
Sta_table.prototype.getTable_getAllDiscountPolicy = function(res, pageNumber, pageSize) {
  var table = document.getElementById('dataTable');
  
  var trInThead = Glob_fn.Table.getThTr(table);
  Glob_fn.Table.setTh(trInThead, '序号');
  Glob_fn.Table.setTh(trInThead, '优惠政策名称');
  Glob_fn.Table.setTh(trInThead, '优惠类型');
  Glob_fn.Table.setTh(trInThead, '有效期');
  Glob_fn.Table.setTh(trInThead, '状态');
  Glob_fn.Table.setTh(trInThead, '设置时间');
  Glob_fn.Table.setTh(trInThead, '操作');

  var tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  var data = res.data.discountPolicyList;
  if (!data || data.length < 1) {
    var tr0 = Glob_fn.Table.showNoData(trInThead.querySelectorAll('th').length);
    tbody.appendChild(tr0);
    return;
  }
  for (var i = 0; i < data.length; i++) {
    var tr = document.createElement('tr');
    var tdSerial = document.createElement('td');
    tr.appendChild(tdSerial);
    tdSerial.innerText = i + 1 + (Number(pageNumber) - 1) * Number(pageSize);
    var td1 = document.createElement('td');
    tr.appendChild(td1);
    var td2 = document.createElement('td');
    tr.appendChild(td2);
    var td3 = document.createElement('td');
    tr.appendChild(td3);
    var spanInTd3_1 = document.createElement('span');
    td3.appendChild(spanInTd3_1);
    var spanInTd3_2 = document.createElement('span');
    spanInTd3_2.innerText = '至';
    td3.appendChild(spanInTd3_2);
    var spanInTd3_3 = document.createElement('span');
    td3.appendChild(spanInTd3_3);
    var td4 = document.createElement('td');
    tr.appendChild(td4);
    var td5 = document.createElement('td');
    tr.appendChild(td5);
    var td6 = document.createElement('td');
    tr.appendChild(td6);
    var toDetailsA = document.createElement('a');
    toDetailsA.innerText = '查看详情';
    toDetailsA.href = location.pathname + '/details/' + data[i].discountPolicyId;
    td6.appendChild(toDetailsA); 
    var toggleA = document.createElement('a');
    toggleA.setAttribute('class', 'uk-margin-small-left');
    // var status_changeToThis = '';
    for (var key in data[i]) {
      if (key == 'discountPolicyId') {
        toggleA.setAttribute('data-' + key, data[i][key]);
      }
      if (key == 'discountPolicyName') {
        td1.innerText = data[i][key];
      }
      if (key == 'discountTypeDesc') {
        td2.innerText = data[i][key];
        td2.setAttribute('data-' + key, data[i][key]);
      }
      if (key == 'startTime') {
        spanInTd3_1.innerText = data[i][key];
      }
      if (key == 'endTime') {
        spanInTd3_3.innerText = data[i][key];
      }
      if (key == 'statusDesc') {
        td4.innerText = data[i][key];
      }
      if (key == 'status') {
        if (data[i][key] == '1') {
          toggleA.innerText = '作废';
          toggleA.setAttribute('data-status', '2');
          td6.appendChild(toggleA);
        }
        if (data[i][key] == '0' || data[i][key] == '2') {
          toggleA.innerText = '启用';
          toggleA.setAttribute('data-status', '1');
          td6.appendChild(toggleA);
        }
      }
      if (key == 'setTime') {
        td5.innerText = data[i][key];
      }
    }
    toggleA.addEventListener('click', function(event) {
      event.preventDefault();
      var link = this;
      var url = document.querySelector('input[name=api_changeDiscountStatus]').value;
      var postData = {
        discountPolicyId: link.getAttribute('data-discountPolicyId'),
        status: link.getAttribute('data-status')
      };
      // console.log(url, postData)
      fetch_sta_changeDiscountStatus(url, postData);
    });
    tbody.appendChild(tr);
  }
  fn_initPaginate(res, pageNumber, pageSize, fetch_sta_getAllDiscountPolicy);
};



// 调账模态：
function Modal(data, title, id) {
  this.data = data;
  this.title = title;
  this.id = id? id: null;
}
Modal.prototype.create = function() {
  var data = this.data,
      titleText = this.title,
      modalId = this.id,
      modal = document.createElement('div'),
      dialog = document.createElement('div'),
      mheader = document.createElement('div'),
      mtitle = document.createElement('h2'),
      mbody = document.createElement('div'),
      mform = document.createElement('form');
  modal.setAttribute('id', modalId);
  modal.setAttribute('uk-modal', '');
  dialog.setAttribute('class', 'uk-modal-dialog');
  mheader.setAttribute('class', 'uk-modal-header');
  mtitle.setAttribute('class', 'uk-modal-title');
  mtitle.innerText = titleText;
  mbody.setAttribute('class', 'uk-modal-body');
  mbody.setAttribute('uk-overflow-auto', '');
  mform.setAttribute('class', 'uk-grid-small');
  mform.setAttribute('uk-grid', '');

  mform.setAttribute('data-stockNo', data.stockNo);
  mheader.appendChild(mtitle);
  var feeItemList = JSON.parse(data.feeItemList);
  // console.log(feeItemList);
  for ( var i = 0; i < feeItemList.length; i++) {
    var els = Modal.createInpList(feeItemList[i]);
    for ( var j = 0; j < els.length; j++) {
      mform.appendChild(els[j]);
    }
  }
  var totalFeeInput = Modal.getTotalFeeInput(data, 'totalFee', '总金额');
  var descTextarea = Modal.getDescTextarea('description', '备注');
  var buttonSection = Modal.getButtonSection(mform);
  mform.appendChild(totalFeeInput);
  mform.appendChild(descTextarea);
  mform.appendChild(buttonSection);
  Modal.setInpLinks(mform, data.feeWt);

  mbody.appendChild(mform);
  dialog.appendChild(mheader);
  dialog.appendChild(mbody);
  modal.appendChild(dialog);
  return modal;
}
Modal.setInpLinks = function(form, feeWt) {
  var inp_feeItemList = form.querySelectorAll('input[data-feeItemList]'),
      inp_totalfee = form.querySelector('input[name=totalFee]');
  var inp_spec = form.querySelector('input[data-fee=spec]'),
      inp_rate = null;
  if ( inp_spec ) {
    inp_rate = form.querySelector('input[name=feerate]');
    inp_rate.addEventListener('blur', function(event) {
      event.preventDefault();
      var oldValue = this.value;
      inp_spec.setAttribute('value', getSpecFee(feeWt, oldValue));
      inp_totalfee.setAttribute('value', getTotalFee());
    });
  }
  for (var i = 0; i < inp_feeItemList.length; i++) {
    var list = inp_feeItemList[i];
    if ((list.name != 'feerate') && (list.getAttribute('data-fee') != 'spec')) {
      list.addEventListener('blur', function(event) {
        event.preventDefault();
        inp_totalfee.setAttribute('value', getTotalFee());
      });
    } 
  }
  function getTotalFee() {
    var result = 0;
    for ( var i = 0; i < inp_feeItemList.length; i++) {
      var list = inp_feeItemList[i];
      if (list.name != 'feerate' || list.getAttribute('data-fee') != 'spec') {
        result += Number(list.value);
      }
    }
    return result;
  }
  function getSpecFee(feeWt, oldValue) {
    var result = 0
    result = Number(feeWt) * Number(oldValue);
    return Math.round(result);
  }
};
Modal.getPostData = function(form) {
  var postData = {
    stockNo: '',
    totalFee: '',
    feeItemList: [],
    remark: ''
  };
  var feeItemListNode = form.querySelectorAll('input[data-feeItemList]'),
      feerateNode = form.querySelector('input[name=feerate]');
  postData.stockNo = form.getAttribute('data-stockNo');
  postData.totalFee = form.querySelector('input[name=totalFee]').value;
  postData.remark = form.querySelector('textarea[name=description]').value;
  for (var i = 0; i < feeItemListNode.length; i++) {
    var obj = {};
    obj.feeId = feeItemListNode[i].name;
    if (feeItemListNode[i].getAttribute('data-fee') === 'spec') {
      obj.feerate = feerateNode.value;
    }
    obj.fee = feeItemListNode[i].value;
    obj.feeShortNM = feeItemListNode[i].getAttribute('data-feeShortNM');
    postData.feeItemList.push(obj);
  }
  return postData;
};
Modal.getButtonSection = function(form) {
  var mSection = document.createElement('section'),
      mSubmitBtn = document.createElement('button'),
      mCancelBtn = document.createElement('button');
  mSection.setAttribute('class', 'action-buttons');
  mSubmitBtn.setAttribute('class', 'button button-primary button-rounded uk-modal-close');
  mSubmitBtn.innerText = '确定';
  mSubmitBtn.style.marginRight = '5px';
  mSubmitBtn.addEventListener('click', function(event){
    event.preventDefault();
    var url = document.querySelector('input[name=api_stationFeeUpdate]').value;
    var data = Modal.getPostData(form);
    // console.log(url, data);
    fetch_sta_updateFee(url, data);
  })
  mCancelBtn.setAttribute('class', 'button button-rounded uk-modal-close');
  mCancelBtn.innerText = '取消';
  mSection.appendChild(mSubmitBtn);
  mSection.appendChild(mCancelBtn);
  return mSection;
}
Modal.getDescTextarea = function(name, text) {
  var mDiv = document.createElement('div'),
      mLabel = document.createElement('label'),
      mTextarea = document.createElement('textarea');
  mDiv.setAttribute('class', 'uk-width-1-1');
  mLabel.setAttribute('class', 'uk-form-label');
  mLabel.innerText = text;
  mLabel.setAttribute('for', name);
  mTextarea.setAttribute('class', 'uk-textarea');
  mTextarea.setAttribute('name', name);
  mTextarea.setAttribute('rows', 4);
  mTextarea.setAttribute('placeholder', '备注信息最多可输入100字');
  mTextarea.setAttribute('maxlength', 100);
  mTextarea.setAttribute('style', 'resize: none');
  mDiv.appendChild(mLabel);
  mDiv.appendChild(mTextarea);
  return mDiv;
};
Modal.getTotalFeeInput = function(data, name, text) {
  var mDiv = document.createElement('div'),
      mLabel = document.createElement('label'),
      mInput = document.createElement('input'),
      feeItemList = JSON.parse(data.feeItemList),
      totalFee = 0;
  mDiv.setAttribute('class', 'uk-width-1-1');
  mLabel.setAttribute('class', 'uk-form-label');
  mLabel.innerText = text;
  mLabel.setAttribute('for', name);
  mInput.setAttribute('class', 'uk-input');
  mInput.setAttribute('type', 'number');
  mInput.setAttribute('readonly', '');
  mInput.setAttribute('name', name);
  for (var i = 0; i < feeItemList.length; i++) {
    totalFee += Number(feeItemList[i].fee);
  }
  mInput.setAttribute('value', totalFee);
  mDiv.appendChild(mLabel);
  mDiv.appendChild(mInput);
  return mDiv;
};
Modal.createInpList = function(data) {
  var feerate = data.feerate? data.feerate: null,
      fee = data.fee,
      feeId = data.feeId,
      feeShortNM = data.feeShortNM;
  if (feeShortNM === '处置费') {
    var el1 = createInp('feerate'),
        el2 = createInp('spec');
    return [el1, el2];
  } else {
    var el = createInp();
    return [el];
  }
  function createInp(type) {
    var flag = (type === 'feerate'),
        formItem = document.createElement('div'),
        label = document.createElement('label'),
        input = document.createElement('input');
    var inpMaxLength = 15;  // 最大输入字符数量
    formItem.setAttribute('class', 'uk-width-1-2');
    label.setAttribute('class', 'uk-form-label');
    input.setAttribute('class', 'uk-input');
    input.setAttribute('type', 'number');
    input.setAttribute('min', 0);
    input.setAttribute('name', flag? 'feerate': feeId);
    if (type === 'spec') {  // 处置费不可编辑
      input.setAttribute('data-fee', 'spec');
      input.setAttribute('readonly', '');
    } else {
      // 其他可以编辑
      if (!flag) {  // 除费率外其他费用限制字符
        input.setAttribute('maxlength', inpMaxLength);
      }
      input.addEventListener('focus', function(event) {
        event.preventDefault();
        this.value = Number(this.value);
        if (flag) {
          // 费率初始化
          this.value = Math.round(this.value * 100) / 100;
        } else {
          // 其他初始化
          this.value = Math.round(this.value);
        }
        this.select();
      });
      input.addEventListener('blur', function(event) {
        event.preventDefault();
        this.value = Number(this.value);
      });
    }
    label.setAttribute('for', input.name);
    label.innerText = flag? '地面费率': feeShortNM;
    if (!flag) {
      input.setAttribute('data-feeItemList', '');
      // 非费率只能输入固定字符内整数
      input.addEventListener('input', function(event) {
        event.preventDefault();
        this.value = this.value.replace(/\D/g,'');
        if (this.value.length > inpMaxLength) {
          this.value = this.value.slice(0, inpMaxLength);
        }
      });
    } else {
      // 费率只能输入两位小数
      input.addEventListener('input', function(event) {
        event.preventDefault();
        this.value = this.value.match(/^\d+(?:\.\d{0,2})?/);
      });
    }
    input.setAttribute('value', flag? feerate: fee);
    input.setAttribute('step', flag? '0.01': '1');
    input.setAttribute('data-feeShortNM', feeShortNM);
    formItem.appendChild(label);
    formItem.appendChild(input);
    return formItem; 
  }
};
function fn_getModal(data, title, id) {
  var mod = new Modal(data, title, id);
  return mod.create();
}