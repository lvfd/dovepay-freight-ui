import Glob_fn from './Global'
import {
  initStation_baseData, initStation_billMangement_queryBills,
  initStation_stationQueryBill_new, initStation_stationQueryBillDetails_new,
} from './StationPages'
import {
  checkRes,
  fn_initSubmitBtn, fn_initExportBtn, fetch_sys_getAllConsumer, fetch_exportExcel,
  fetch_sys_getAllDiscountPolicy, fetch_sys_queryDiscountCustomer
} from './AjaxManager'
import fn_queryDict from './QueryDict'
import fn_initPaginate from './Paginate'

export function initSystem_baseData() {
  return initStation_baseData();
}
export function initSystem_billMangement_queryBills() {
  return initStation_billMangement_queryBills();
}
export function initSystem_systemQueryBill_new() {
  return initStation_stationQueryBill_new();
}
export function initSystem_systemQueryBillDetails_new() {
  return initStation_stationQueryBillDetails_new();
}
export function initSystem_getAllConsumer() {
   // bind submit button:
  fn_initSubmitBtn(1, 10, fetch_sys_getAllConsumer);
  // bind export button:
  fn_initExportBtn(fetch_exportExcel);
}
export function initSystem_getAllDiscountPolicy() {
  var api_getAllSupplier_url = document.querySelector('input[name=api_getAllSupplier]').value;
  fn_queryDict('DISCOUNT_TYPE', function(res){
    // console.log(res)
    // distill select:
    var sel = document.getElementById('discountType');
    Glob_fn.initDiscoutTypeSel(res.data, sel);
    $.ajax({
      url: api_getAllSupplier_url,
      success: function(res) {
        // distill supplier:
        var data = res.data;
        var sel = document.getElementById('supplierId');
        Glob_fn.initSupplierSel(data, sel);
        // init Wdate:
        Glob_fn.WdateInit('startTime', 'endTime');
        Glob_fn.WdateInit('setStartTime', 'setEndTime');
        // bind submit button:
        fn_initSubmitBtn(1, 10, fetch_sys_getAllDiscountPolicy);
      }
    });
  }); 
}
export function initSystem_getDiscountPolicy() {
  var discountPolicyId = document.querySelector('input[name=discountPolicyId]').value;
  var url = document.querySelector('input[name=api_getDiscountPolicy]').value;
  var data = {
    discountPolicyId: discountPolicyId
  };
  $.ajax({
    url: url,
    data: JSON.stringify(data),
    success: function(res) {
      if (checkRes(res) === false) return;
      console.log(res);
      try {
        var data = res.data;
        if (data.length < 1) {
          UIkit.modal.alert('无数据');
        }
        Glob_fn.initDiscountDetails(data);
      } catch (error) {
        alert(error);
      }
    }
  });
  // 绑定返回button
  document.getElementById('btnBack').addEventListener('click', function(event){
    event.preventDefault();
    var url = document.querySelector('input[name=url_back]').value
    window.location.href = url;
  });
}

export function Sys_table(){}
Sys_table.prototype.getTable_userInfo = function(res, pageNumber, pageSize) {
  var table = document.querySelector('#dataTable');

  var thead = table.querySelector('thead');
  thead.innerHTML = '';
  var trInThead = document.createElement('tr');
  thead.appendChild(trInThead);
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
    var toDiscountPoliciesA = document.createElement('a');

    for (var key in data[i]) {
      if (key == 'customerId') {
        td1.innerText = data[i][key];
        toDiscountPoliciesA.setAttribute('data-customerId', data[i][key]);
      }
      if (key == 'customerNameChn') {
        td2.innerText = data[i][key];
      }
      if (key == 'statusDesc') {
        td3.innerText = data[i][key];
      }
      if (key == 'status') {
        td3.setAttribute('data-' + key, data[i][key]);
      }
      if (key == 'canYesDesc') {
        td4.innerText = data[i][key];
      }
      if (key == 'canYes') {
        td4.setAttribute('data-' + key, data[i][key]);
      }
      if (key == 'feeWayDesc') {
        td5.innerText = data[i][key];
      }
      if (key == 'feeWayId') {
        td5.setAttribute('data-' + key, data[i][key]);
      }
    }
    
    // 如果已注册且月结：
    if ((td3.getAttribute('data-status') == '1') && (td5.getAttribute('data-feeWayId') == 'MP')) {
      toDiscountPoliciesA.innerText = '优惠政策查看';
      toDiscountPoliciesA.href = '#ShowDiscountPolicies';
      td6.appendChild(toDiscountPoliciesA);

      toDiscountPoliciesA.addEventListener('click', function(event) {
        event.preventDefault();
        var link = this;
        var url = document.querySelector('input[name=api_queryDiscountCustomer]').value;
        var data = {customerId: link.getAttribute('data-customerId')};
        fetch_sys_queryDiscountCustomer(url, data);
      });
    } else {
      td6.innerText = '-';
    }
    
    tbody.appendChild(tr);
  }

  // 设置pagination
  fn_initPaginate(res, pageNumber, pageSize, fetch_sys_getAllConsumer);
};
Sys_table.prototype.getTable_inModal = function(res) {
  var modal = document.getElementById('showDiscountPolicy');
  var table = modal.querySelector('table');
  var tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  var dataList = res.data;

  for (var i = 0; i < dataList.length; i++) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    tr.appendChild(td1);
    var td2 = document.createElement('td');
    var spanStart = document.createElement('span');
    td2.appendChild(spanStart);
    var spanText = document.createElement('span');
    spanText.setAttribute('class', 'uk-margin-small-left uk-margin-small-right');
    spanText.innerText = '至';
    td2.appendChild(spanText);
    var spanEnd = document.createElement('span');
    td2.appendChild(spanEnd);
    tr.appendChild(td2);

    for (var key in dataList[i]) {
      if (key == 'discountPolicyName')
        td1.innerText = dataList[i][key];
      else if (key == 'startTimeStr')
        spanStart.innerText = dataList[i][key];
      else if (key == 'endTimeStr')
        spanEnd.innerText = dataList[i][key];
      else
        td1.setAttribute('data-' + key, dataList[i][key]);
    }

    tbody.appendChild(tr);
  }

  UIkit.modal(modal).show();
};
Sys_table.prototype.getTable_queryPolicies = function(res, pageNumber, pageSize) {
  var table = document.querySelector('#dataTable');
  var thead = table.querySelector('thead');
  thead.innerHTML = '';
  var trInThead = document.createElement('tr');
  thead.appendChild(trInThead);
  Glob_fn.Table.setTh(trInThead, '序号');
  Glob_fn.Table.setTh(trInThead, '优惠政策名称');
  Glob_fn.Table.setTh(trInThead, '优惠类型');
  Glob_fn.Table.setTh(trInThead, '有效期');
  Glob_fn.Table.setTh(trInThead, '设置时间');
  Glob_fn.Table.setTh(trInThead, '状态');
  Glob_fn.Table.setTh(trInThead, '所属货站');
  Glob_fn.Table.setTh(trInThead, '操作');

  var tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  var data = res.data.systemDiscountPolicyList;
  // console.log(data);

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
    var spanSta = document.createElement('span');
    td3.appendChild(spanSta);
    var spanTex = document.createElement('span');
    spanTex.setAttribute('class', 'uk-margin-small-left uk-margin-small-right');
    spanTex.innerText = '至';
    td3.appendChild(spanTex);
    var spanEnd = document.createElement('span');
    td3.appendChild(spanEnd);
    var td4 = document.createElement('td');
    tr.appendChild(td4);
    var td5 = document.createElement('td');
    tr.appendChild(td5);
    var td6 = document.createElement('td');
    tr.appendChild(td6);
    var td7 = document.createElement('td');
    tr.appendChild(td7);
    var link = document.createElement('a');
    link.innerText = '查看详情'
    td7.appendChild(link);

    for (var key in data[i]) {
      if (key == 'discountPolicyName') {
        td1.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'discountTypeDesc') {
        td2.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'startTime') {
        spanSta.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'endTime') {
        spanEnd.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'setTime') {
        td4.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'statusDesc') {
        td5.innerText = data[i][key] === null? '-': data[i][key];
      }
      if (key == 'supplierName') {
        td6.innerText = data[i][key] === null? '-': data[i][key];
      }
    }

    link.setAttribute('href', 'policiesManagement/' + data[i].discountPolicyId);

  }

  // 设置pagination
  fn_initPaginate(res, pageNumber, pageSize, fetch_sys_getAllDiscountPolicy);
};