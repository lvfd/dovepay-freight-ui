import Glob_fn from './Global'
import fn_queryDict from './QueryDict'
import {initListBox} from './Listbox'
import {
  checkRes, fetch_sta_getDiscountPolicy, fetch_sta_queryCargo, fetch_sta_submitDiscountPage
} from './AjaxManager'


export function initStation_discountPoliciesManagementDetails() {
  var discountPolicyId = document.querySelector('input[name=discountPolicyId]').value;
  var url = document.querySelector('input[name=api_getDiscountPolicy]').value;
  var data = {
    discountPolicyId: discountPolicyId
  };
  //输出详情数据, 绑定启用/作废button
  fetch_sta_getDiscountPolicy(url, data);
  // 绑定返回button
  document.getElementById('btnBack').addEventListener('click', function(event){
    event.preventDefault();
    var url = document.querySelector('input[name=url_discountPoliciesManagement]').value
    window.location.href = url;
  });
}
export function initStation_initTabs() {
  var queryType = document.querySelector('input[name=dict_api_queryType]').value;
  if (!queryType) return;
  var callback = function(res) {
    if (checkRes(res) === false) return;
    var texts = res.data,
    content = document.querySelector('#discountType');
    for (var i = 0; i < texts.length; i++) {
      createNodes(content, texts[i], i);
    }
    switchPage(0);
  }
  fn_queryDict(queryType, callback);
  function createNodes(content, data, num) {
    var li = document.createElement('li'),
    a = document.createElement('a');
    a.setAttribute('href', '#');
    a.innerText = data.value;
    a.setAttribute('data-type', data.type);
    a.setAttribute('data-key', data.key);
    a.addEventListener('click', function(event) {
      event.preventDefault();
      switchPage(num);
    });
    li.appendChild(a);
    content.appendChild(li);
  }
  function switchPage(num) {
    var container = document.querySelector('section#form-container');
    var initPage = function(res) {
      $(container).html(res);
      initPage_1();
    };
    $.ajax({
      url: 'discountPolicies/' + (Number(num)+1),
      headers: '',
      type: 'GET',
      dataType: 'html',
      success: initPage
    });
  }
  function initPage_1() {
    // init Wdate:
    Glob_fn.WdateInit('startTime', 'endTime');
    
    // 普通优惠，查询字典接口加载select的option:
    if (document.getElementById('normal_discount_type_select')){
      fn_queryDict('DISCOUNT_SUPPORT', function(res) {
        if (checkRes(res) === false) return;
        if (res.data.length < 1) {
          UIkit.alert('字典接口无数据').then(function(){
            console.error(res);
            return;
          });
        }
        var sel = document.getElementById('normal_discount_type_select');
        var data = res.data;
        for (var i = 0; i < data.length; i++) {
          var op = document.createElement('option');
          for (var key in data[i]) {
            if (key == 'value') {
              op.innerText = data[i][key];
            } else {
              op.setAttribute('data-' + key, data[i][key]);
            }
          }
          sel.appendChild(op);
        }

        // 绑定select关联listbox：
        var listbox = document.getElementById('specialCargoNameListbox');
        selToListbox();
        sel.addEventListener('change', function(event) {
          event.preventDefault();
          selToListbox('onchange');
        });
        function selToListbox(type) {
          if (sel.options[sel.selectedIndex].getAttribute('data-key') == 'N_GA_D_E') {
            listbox.style.display = '';
            if (type) {
              document.getElementById('fn_queryCargoNmBtn').click();
            }
          } else {
            listbox.style.display = 'none';
            document.getElementById('destSelect').innerHTML = '';
          }
        }

      });
    }

    // 航点优惠，初始化航点信息：
    if (document.getElementById('departureInfo')) {
      var departureInfo = new DepartureInfo();
      departureInfo.add('init');
    }

    // 优惠政策设置页面，初始化增加航班号组件
    if (document.querySelector('#inputAssets')) {
      var airlineNum = new AirlineNum();
      airlineNum.add('airlineNum', 'init');
    }

    // 加载品名listbox：
    if (document.querySelector('#cargoNameListbox') ||
        document.getElementById('specialCargoNameListbox')) {
      initListBox();
    }

    // 品名查询：
    if (document.querySelector('#fn_queryCargoNmBtn')) {
      var btn = document.querySelector('#fn_queryCargoNmBtn');
      var url = document.querySelector('input[name=api_queryCargo]').value;
      var resultContainer = document.querySelector('select#sourceSelect');
      btn.addEventListener('click', function(event) {
        event.preventDefault();
        var postData = document.querySelector('input[name=cargoNm]').value;
        fetch_sta_queryCargo(url, postData, resultContainer);
      });
      // 默认执行一次查询：
      btn.click();
    }

    // 初始化费用表单
    if (document.querySelector('#wrap_feeDiscount_assets')) {
      var feeDiscountItem = new FeeDiscountItem();
      feeDiscountItem.add('init');
    }

    // 绑定submit：
    if (document.querySelector('#fn_submitDiscountPage_1')) {
      submitDiscountPage('1');
    }
    if (document.querySelector('#fn_submitDiscountPage_2')) {
      submitDiscountPage('2');
    }
    if (document.querySelector('#fn_submitDiscountPage_3')) {
      submitDiscountPage('3');
    }
    function submitDiscountPage(pageNum) {
      var submitBtn = document.querySelector('.fn_submit-discountPage');
      submitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        var url = document.querySelector('input[name=api_createDiscountPolicy]').value;
        var submit = new DiscountPagesSubmit();
        var postData = {};
        if (pageNum == '1')
          postData = submit.getP1PostData();
        if (pageNum == '2')
          postData = submit.getP2PostData();
        if (pageNum == '3')
          postData = submit.getP3PostData();
        // console.log(url, postData);
        fetch_sta_submitDiscountPage(url, postData);
      });
    }
  }
}

function AirlineNum() {}
AirlineNum.prototype.add = function(inputName, type){
  var parentNode = document.querySelector('#inputAssets');
  var asset = AirlineNum.getInputAsset(inputName, type);
  if (!parentNode) { 
    throw new Error('without #inputAssets');
  }
  parentNode.appendChild(asset);
};
AirlineNum.getInputAsset = function(inputName, type){
  // 初始化wrap：
  var wrapDiv = document.createElement('div');
  wrapDiv.setAttribute('class', 'uk-width-1-4')
  
  // 初始化label:
  var aLabel = document.createElement('label');
  aLabel.setAttribute('class', 'uk-form-label');
  aLabel.setAttribute('for', inputName);
  aLabel.innerText = '航班号';
  wrapDiv.appendChild(aLabel);

  // 初始化控件组：
  var formControlDiv = document.createElement('div');
  formControlDiv.setAttribute('class', 'uk-form-controls uk-flex uk-flex-bottom');
  wrapDiv.appendChild(formControlDiv);

  // 初始化input:
  var aInput = document.createElement('input');
  aInput.setAttribute('class', 'uk-input');
  aInput.setAttribute('type', 'text');
  aInput.setAttribute('name', inputName);
  formControlDiv.appendChild(aInput);

  // 初始化add图标 - button：
  createAddBtn(formControlDiv);
  function createAddBtn(parentNode, type) {
    var plusBtn_content = document.createElement('i');
    plusBtn_content.setAttribute('class', 'fa fa-plus');
    plusBtn_content.setAttribute('aria-hidden', 'true');
    var plusBtn = document.createElement('button');
    plusBtn.setAttribute('class', 'button button-primary button-square');
    plusBtn.setAttribute('id', 'addAsset');
    plusBtn.appendChild(plusBtn_content);
    if (!type) {
      parentNode.appendChild(plusBtn);
    } else {
      var child = parentNode.querySelector('button');
      if (child) {
        parentNode.insertBefore(plusBtn, child);
      } else {
        parentNode.appendChild(plusBtn);
      }
    }
    plusBtn.addEventListener('click', function(event) {
      event.preventDefault();
      this.parentNode.removeChild(this);
      var airlineNum = new AirlineNum();
      airlineNum.add('airlineNum');
    });
  }

  // 初始化minus图标 - button：
  if (!type) {
    var minusBtn_content = document.createElement('i');
    minusBtn_content.setAttribute('class', 'fa fa-minus');
    minusBtn_content.setAttribute('aria-hidden', 'true');
    var minusBtn = document.createElement('button');
    minusBtn.setAttribute('class', 'button button-highlight button-square');
    minusBtn.appendChild(minusBtn_content);
    formControlDiv.appendChild(minusBtn);
    minusBtn.addEventListener('click', function(event) {
      event.preventDefault();
      var preWrapDiv = wrapDiv.previousElementSibling;
      var nextWrapDiv = wrapDiv.nextElementSibling;
      var preFormControlDiv = preWrapDiv.querySelector('.uk-form-controls');
      if ( !!preFormControlDiv && !nextWrapDiv)  // 如果是最后一个
        createAddBtn(preFormControlDiv, 'insertBefore');
      wrapDiv.parentNode.removeChild(wrapDiv);
    });
  }

  return wrapDiv;
};

function DepartureInfo() {}
DepartureInfo.prototype.add = function(type) {
  var parentNode = document.getElementById('departureInfo');
  var asset = DepartureInfo.getAsset(type);
  if (!parentNode) { 
    throw new Error('without #departureInfo');
  }
  parentNode.appendChild(asset);
};
DepartureInfo.getAsset = function(type) {
  var wrapDiv = document.createElement('div');
  wrapDiv.setAttribute('class', 'uk-flex uk-flex-bottom fn_departureInfo_wrap uk-width-1-2');
  
  var flexDiv1 = document.createElement('div');
  flexDiv1.setAttribute('class', 'fn_departureInfo_1');
  wrapDiv.appendChild(flexDiv1);
  var label_1 = document.createElement('label');
  label_1.setAttribute('class', 'uk-form-label');
  label_1.innerText = '起点站';
  flexDiv1.appendChild(label_1);
  var input_1 = document.createElement('input');
  input_1.setAttribute('class', 'uk-input');
  input_1.setAttribute('type', 'text');
  flexDiv1.appendChild(input_1);

  var flexDiv2 = document.createElement('div');
  flexDiv2.setAttribute('class', 'fn_departureInfo_2 uk-margin-small-left uk-margin-small-right');
  wrapDiv.appendChild(flexDiv2);
  var label_2 = document.createElement('label');
  label_2.setAttribute('class', 'uk-form-label');
  label_2.setAttribute('for', 'discountValue');
  label_2.innerText = '起点站三字码';
  flexDiv2.appendChild(label_2);
  var input_2 = document.createElement('input');
  input_2.setAttribute('class', 'uk-input');
  input_2.setAttribute('type', 'text');
  input_2.setAttribute('name', 'discountValue');
  flexDiv2.appendChild(input_2);

  createAddBtn(wrapDiv);
  function createAddBtn(wrapDiv, type) {
    var btn_plus = document.createElement('button');
    btn_plus.setAttribute('class', 'button button-primary button-square');
    if (!type) {
      wrapDiv.appendChild(btn_plus);
    } else {
      var child = wrapDiv.querySelector('button');
      if (child) {
        wrapDiv.insertBefore(btn_plus, child);
      } else {
        wrapDiv.appendChild(btn_plus);
      }
    }
    var btn_plus_icon = document.createElement('i');
    btn_plus_icon.setAttribute('class', 'fa fa-plus');
    btn_plus_icon.setAttribute('aria-hidden', 'true');
    btn_plus.appendChild(btn_plus_icon);
    btn_plus.addEventListener('click', function(event) {
      event.preventDefault();
      this.parentNode.removeChild(this);
      var departureInfo = new DepartureInfo();
      departureInfo.add();
    });
  }
    
  if (!type) {
    var btn_minus = document.createElement('button');
    btn_minus.setAttribute('class', 'button button-highlight button-square');
    wrapDiv.appendChild(btn_minus);
    var btn_minus_icon = document.createElement('i');
    btn_minus_icon.setAttribute('class', 'fa fa-minus');
    btn_minus_icon.setAttribute('aria-hidden', 'true');
    btn_minus.appendChild(btn_minus_icon);
    btn_minus.addEventListener('click', function(event) {
      event.preventDefault();
      var preWrapDiv = wrapDiv.previousElementSibling;
      var nextWrapDiv = wrapDiv.nextElementSibling;
      if ( !!preWrapDiv && !nextWrapDiv)  // 如果是最后一个
        createAddBtn(preWrapDiv, 'insertBefore');
      wrapDiv.parentNode.removeChild(wrapDiv);
    });
  }
  return wrapDiv;
}

function FeeDiscountItem() {}
FeeDiscountItem.prototype.add = function(type) {
  $.ajax({
    url: document.querySelector('input[name=api_queryFeeItem]').value,
    data: '',
    success: function(feeItem) {
      if (feeItem.code != '200') {
        UIkit.modal.alert(feeItem.msg);
      }
      fn_queryDict('DISCOUNT_FEE_TYPE', function(feeType){
        if (feeType.code != '200') {
          UIkit.modal.alert(feeType.msg);
        }
        try {
          var asset = FeeDiscountItem.getAsset(feeItem.data, feeType.data, type);
          var parentNode = document.querySelector('#wrap_feeDiscount_assets');
          parentNode.appendChild(asset);
        } catch (e) {
          alert(e);
          console.error(e);
        }
      });
    }
  });
};
FeeDiscountItem.getAsset = function(feeItemData, feeTypeData, type) {

  // wrap:
  var wrapDiv = document.createElement('div');
  wrapDiv.setAttribute('class', 'uk-flex uk-flex-middle uk-margin fn_getDiscountFeeRequestList');

  // 费用减免项：
  var feeItemDiv = document.createElement('div');
  feeItemDiv.setAttribute('class', 'uk-width-small');
  wrapDiv.appendChild(feeItemDiv);
  var feeItemLabel = document.createElement('label');
  feeItemLabel.setAttribute('class', 'uk-form-label');
  feeItemLabel.setAttribute('for', 'discountFeeKey');
  feeItemLabel.innerText = '费用减免项';
  feeItemDiv.appendChild(feeItemLabel);
  var feeItemSelect = document.createElement('select');
  feeItemSelect.setAttribute('class', 'uk-select');
  feeItemSelect.setAttribute('name', 'discountFeeKey');
  feeItemDiv.appendChild(feeItemSelect);
  for (let i = 0; i < feeItemData.length; i++) {
    let op = document.createElement('option');
    for ( let key in feeItemData[i]) {
      if (key == 'feeShortNm') {
        op.innerText = feeItemData[i][key];
      }
      op.setAttribute('data-' + key, feeItemData[i][key]);
    }
    feeItemSelect.appendChild(op);
  }

  // 费用减免类型：
  var feeTypeDiv = document.createElement('div');
  feeTypeDiv.setAttribute('class', 'uk-margin-small-left');
  wrapDiv.appendChild(feeTypeDiv);
  var feeTypeLabel = document.createElement('label');
  feeTypeLabel.setAttribute('class', 'uk-form-label');
  feeTypeLabel.setAttribute('for', 'discountFeeType');
  feeTypeLabel.innerText = '减免类型';
  feeTypeDiv.appendChild(feeTypeLabel);
  var flexDiv = document.createElement('div');
  flexDiv.setAttribute('class', 'uk-flex uk-flex-middle uk-form-controls');
  feeTypeDiv.appendChild(flexDiv);
  var feeTypeSelect = document.createElement('select');
  feeTypeSelect.setAttribute('class', 'uk-select uk-width-small');
  feeTypeSelect.setAttribute('name', 'discountFeeType');
  flexDiv.appendChild(feeTypeSelect);
  for (let i = 0; i < feeTypeData.length; i++) {
    let op = document.createElement('option');
    for (let key in feeTypeData[i]) {
      if (key == 'value') {
        op.innerText = feeTypeData[i][key];
      }
      op.setAttribute('data-' + key, feeTypeData[i][key]);
    }
    feeTypeSelect.appendChild(op);
  }

  // 费用数值：
  var feeInput = document.createElement('input');
  feeInput.setAttribute('class', 'uk-input uk-margin-small-left uk-width-small');
  feeInput.setAttribute('type', 'number');
  feeInput.setAttribute('name', 'discountFeeValue');
  var val = feeTypeSelect.getAttribute('data-key');
  if (val == 'free') {
    feeInput.setAttribute('disabled', '');
  }
  flexDiv.appendChild(feeInput);
  var discrSpan = document.createElement('span');
  discrSpan.setAttribute('class', 'uk-margin-small-left uk-margin-small-right uk-text-nowrap');
  discrSpan.innerText = '元/折';
  flexDiv.appendChild(discrSpan);

  if ( !type ) {
    var minusBtn = document.createElement('button');
    minusBtn.setAttribute('class', 'button button-highlight button-square');
    flexDiv.appendChild(minusBtn);
    var minusIcon = document.createElement('i');
    minusIcon.setAttribute('class', 'fa fa-minus');
    minusIcon.setAttribute('aria-hidden', 'true');
    minusBtn.appendChild(minusIcon);
    minusBtn.addEventListener('click', function(event) {
      event.preventDefault();
      var preWrapDiv = wrapDiv.previousElementSibling;
      var nextWrapDiv = wrapDiv.nextElementSibling;
      var preFormControlDiv = preWrapDiv.querySelector('.uk-form-controls');
      if ( !!preFormControlDiv && !nextWrapDiv)  // 如果是最后一个
        createAddBtn(preFormControlDiv, 'insertBefore');
      wrapDiv.parentNode.removeChild(wrapDiv);
    });
  }

  // 按钮：
  createAddBtn(flexDiv, type);
  function createAddBtn(parentNode) {
    var plusBtn = document.createElement('button');
    plusBtn.setAttribute('class', 'button button-primary button-square');
    parentNode.appendChild(plusBtn);
    var plusIcon = document.createElement('i');
    plusIcon.setAttribute('class', 'fa fa-plus');
    plusIcon.setAttribute('aria-hidden', 'true');
    plusBtn.appendChild(plusIcon);
    plusBtn.addEventListener('click', function(event) {
      event.preventDefault();
      this.parentNode.removeChild(this);
      var feeDiscountItem = new FeeDiscountItem();
      feeDiscountItem.add();
    });
  }

  // listen select:
  checkFeeType(feeTypeSelect);  // check after building
  feeTypeSelect.addEventListener('change', function() {
    checkFeeType(this);
  });
  function checkFeeType(selectNode) {
    var index = selectNode.selectedIndex;
    var val = selectNode.options[index].getAttribute('data-key');
    if (val == 'free') {
      feeInput.value = '';
      feeInput.innerHTML = '';
      feeInput.setAttribute('disabled', 'true');
    } else {
      if (feeInput.getAttribute('disabled') === 'true') {
        feeInput.removeAttribute('disabled');
      }
    }
  }

  return wrapDiv;
};

function DiscountPagesSubmit() {}
DiscountPagesSubmit.prototype.getP1PostData = function() {
  var data = {};
  var discountPolicyName = document.querySelector('input[name=discountPolicyName]').value;
  var startTime = document.querySelector('input[name=startTime]').value;
  var endTime = document.querySelector('input[name=endTime]').value;
  var discountType = document.querySelector('#discountType .uk-active a').getAttribute('data-key');
  var discountValue = DiscountPagesSubmit.getDiscountValueAirline();
  var minCharge = document.querySelector('input[name=minCharge]').value;
  var cargoNo = DiscountPagesSubmit.getCargoNo();
  var discountFeeRequestList = DiscountPagesSubmit.getDiscountFeeRequestList();
  data.discountPolicyName = discountPolicyName;
  data.startTime = startTime;
  data.endTime = endTime;
  data.discountType = discountType;
  data.discountValue = discountValue;
  data.minCharge = minCharge;
  data.cargoNo = cargoNo;
  data.discountFeeRequestList = discountFeeRequestList;

  return data;
};
DiscountPagesSubmit.prototype.getP2PostData = function() {
  var data = {};
  var discountPolicyName = document.querySelector('input[name=discountPolicyName]').value;
  var startTime = document.querySelector('input[name=startTime]').value;
  var endTime = document.querySelector('input[name=endTime]').value;
  var discountType = document.querySelector('#discountType .uk-active a').getAttribute('data-key');
  var discountValue = DiscountPagesSubmit.getDiscountValueAirdot();
  var minCharge = document.querySelector('input[name=minCharge]').value;
  var discountFeeRequestList = DiscountPagesSubmit.getDiscountFeeRequestList();
  data.discountPolicyName = discountPolicyName;
  data.startTime = startTime;
  data.endTime = endTime;
  data.discountType = discountType;
  data.discountValue = discountValue;
  data.minCharge = minCharge;
  data.discountFeeRequestList = discountFeeRequestList;

  return data;
};
DiscountPagesSubmit.prototype.getP3PostData = function() {
  var data = {};
  var discountPolicyName = document.querySelector('input[name=discountPolicyName]').value;
  var startTime = document.querySelector('input[name=startTime]').value;
  var endTime = document.querySelector('input[name=endTime]').value;
  var discountType = document.querySelector('#discountType .uk-active a').getAttribute('data-key');
  var discountValue = DiscountPagesSubmit.getDiscountValueFromSelect();
  var minCharge = document.querySelector('input[name=minCharge]').value;
  var cargoNo = DiscountPagesSubmit.getCargoNo();
  var discountFeeRequestList = DiscountPagesSubmit.getDiscountFeeRequestList();
  data.discountPolicyName = discountPolicyName;
  data.startTime = startTime;
  data.endTime = endTime;
  data.discountType = discountType;
  data.discountValue = discountValue;
  data.minCharge = minCharge;
  data.cargoNo = cargoNo;
  data.discountFeeRequestList = discountFeeRequestList;

  return data;
};
DiscountPagesSubmit.getDiscountValueAirline = function() {
  var result = '';
  var inputArr = document.querySelectorAll('input[name=airlineNum]');
  if (inputArr.length < 1) { 
    throw new Error('没有flightNumber字段'); 
  }
  for (var i = 0; i < inputArr.length; i++) {
    var value = $.trim(inputArr[i].value);
    if (value == '') {
      continue;
    }
    if (i > 0) {
      result += ',';
    }
    result += value;
  }
  return result;
};
DiscountPagesSubmit.getDiscountValueAirdot = function() {
  var result = '';
  var inputArr = document.querySelectorAll('input[name=discountValue]');
  if (inputArr.length < 1) {
    throw new Error('没有三字码字段'); 
  }
  for (var i = 0; i < inputArr.length; i++) {
    var value = $.trim(inputArr[i].value);
    if (value == '') {
      continue;
    }
    if (i > 0) {
      result += ',';
    }
    result += value;
  }
  return result;
};
DiscountPagesSubmit.getDiscountValueFromSelect = function() {
  var select = document.querySelector('select[name=discountValue]');
  var value = select.options[select.selectedIndex].getAttribute('data-key');
  return value;
}
DiscountPagesSubmit.getCargoNo = function() {
  var result = '';
  var select = document.querySelector('#destSelect');
  var ops = select.querySelectorAll('option');
  // if (ops.length < 1) {
  //   UIkit.modal.alert('没有添加优惠品名');
  //   return;
  // }
  for (var i = 0; i < ops.length; i++) {
    var cargoNo = ops[i].getAttribute('data-cargoNo');
    if (i > 0) {
      result += ',';
    }
    if (cargoNo === null || cargoNo === '') {
      continue;
    }
    result += cargoNo;
  }
  return result;
};
DiscountPagesSubmit.getDiscountFeeRequestList = function() {
  var result = [];
  var listArr = document.querySelectorAll('.fn_getDiscountFeeRequestList');
  if (listArr.length < 1) { return null; }
  for (var i = 0; i < listArr.length; i++) {
    var child = {};
    var keySelect = listArr[i].querySelector('select[name=discountFeeKey]');
    var typeSelect = listArr[i].querySelector('select[name=discountFeeType]');
    var discountFeeType = typeSelect.options[typeSelect.selectedIndex].getAttribute('data-key');
    var discountFeeKey = keySelect.options[keySelect.selectedIndex].getAttribute('data-feeId');
    var discountFeeKeyName = listArr[i].querySelector('select[name=discountFeeKey]').value;
    var discountFeeValue = listArr[i].querySelector('input[name=discountFeeValue]').value;
    child.discountFeeType = discountFeeType;
    child.discountFeeKey = discountFeeKey;
    child.discountFeeKeyName = discountFeeKeyName;
    child.discountFeeValue = discountFeeValue;
    result.push(child);
  }
  var inputFeerate = document.querySelector('input[name=feerate]').value;
  if (inputFeerate) {
    result.push({
      discountFeeType: 'rate',
      discountFeeValue: $.trim(inputFeerate)
    });
  }
  return result;
};