import Glob_fn from './Global'
import {fn_getMes, fn_remMes} from './Message'
import {Listbox} from './Listbox'
import {Sta_table} from './StationPages'
import {Sys_table} from './SystemPages'
import {Age_table} from './AgentPages'

// 检查response：
export function checkRes (res, callback) {
  if (res.code != '200') {
    var errmsg = '返回数据结果错误! ' + res.code + ': ' + res.msg;
    Glob_fn.errorHandler(errmsg, callback); 
    if (console) {
      console.error('response: ', res);
    }
    return false;
  }
}
// Init submit button:
export function fn_initSubmitBtn(pageNumber, pageSize, fetchFn, callback, postDataHandler, config) {
  var submitBtn = document.getElementById('submitBtn');
  submitBtn.addEventListener('click', function(event){
    event.preventDefault();
    var $this = $(this);
    var url = document.querySelector('input[name=api_forTable]').value;
    var postData = $this.closest('form').serializeObject();
    if (typeof postDataHandler === 'function') postDataHandler.call(this, postData);
    postData.pageNumber = pageNumber;
    postData.indexPage = pageNumber;
    postData.pageSize = pageSize;
    postData.countPage = pageSize;
    Glob_fn.Table.hideTable();
    if (typeof callback === 'function') {
      fetchFn.call(this, url, postData, callback, config);
    } else {
      fetchFn.call(this, url, postData);
    }
  });
  submitBtn.click();
}
// Init export button:
export function fn_initExportBtn(fetchFn) {
  var expoBtn = document.getElementById('exportBtn');
  if (!expoBtn) return;
  expoBtn.addEventListener('click', function(event) {
    event.preventDefault();
    var $this = $(this);
    var url = document.querySelector('input[name=api_forExport]').value;
    if (!url) return;
    var postData = $this.closest('form').serializeObject();
    fetchFn.call(this, url, postData);
  });
}
// Export function:
export function fetch_exportExcel(url, data) {
  var postData = JSON.stringify(data);
  var fileName = '导出数据.xls';
  // console.log(url, postData);
  $.ajax({
    dataType: '',
    xhrFields: {
      responseType: 'blob'
    },
    url: url,
    data: postData,
    success: function(res, status, xhr) {
      // console.log(status, xhr);
      if (xhr.status != 200) {
        var errmsg = '导出错误! ' + xhr.status + ': ' +  xhr.statusText;
        Glob_fn.errorHandler(errmsg);
        return;
      }
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(res, fileName);
      } else {
        var downloadLink = window.document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(res);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  });
}
// 提交数据并处理返回基本功能函数:
export function fetchData(url, data, callback, config) {
  var postData = '';
  if (data) {
    try {
      var rawData = Glob_fn.isJSON(data)? JSON.parse(data): data;
      if (!rawData || typeof rawData !== 'object') throw new Error('传入的data参数不合法');
      postData = Glob_fn.isJSON(data)? data: JSON.stringify(data);
    } catch (error) {
      Glob_fn.errorHandler(error);
      return;
    }
  }
  let checkResCallback
  if (config && typeof config === 'function') {
    checkResCallback = config
  }
  var ajaxConfig = {
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res, checkResCallback) === false) return;
      if (res.msg == 'success') {
        try {
          if (rawData && rawData.pageNumber) {
            callback.call(this, res, rawData.pageNumber, rawData.pageSize)
          } else {
            callback.call(this, res);
          }
        } catch(error) {
          Glob_fn.errorHandler(error);
          return;
        }
      } else {
        Glob_fn.errorHandler(res.msg);
        return;
      }
    },
  };
  if (config && typeof config === 'object') {
    for (var key in config) {
      ajaxConfig[key] = config[key];
    }
  } else if (config === false) {
    ajaxConfig.global = false;
  }
  $.ajax(ajaxConfig);
}

// sys:
export function fetch_sys_getAllConsumer(url, data) {
  var postData = JSON.stringify(data);
  var pageNumber = data.pageNumber;
  var pageSize = data.pageSize;
  // console.log(url, postData)
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var table = new Sys_table();
      try {
        table.getTable_userInfo(res, pageNumber, pageSize);
      } catch (err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}
export function fetch_sys_queryDiscountCustomer(url, data) {
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var table = new Sys_table();
      try {
        table.getTable_inModal(res);
      } catch (err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}
export function fetch_sys_getAllDiscountPolicy(url, data) {
  var postData = JSON.stringify(data);
  var pageNumber = data.pageNumber;
  var pageSize = data.pageSize;
  console.log(url, postData)
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      console.log(res);
      var table = new Sys_table();
      try {
        table.getTable_queryPolicies(res, pageNumber, pageSize);
      } catch (err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}

// agent:
// 提交支付：
export function fetch_age_toPay(url, data) {  // 去收银台
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      // console.log(res)
      // debugger
      if (checkRes(res) === false) return; 
      var data = res.data,
          payUrl = data.payUrl,
          payData = data.payData;
      Glob_fn.submVirtForm(payUrl, payData);
    }
  });
}
// 获取账户绑定数据：
export function fetch_age_getBindConsumer(url) {  // 获取绑定信息
  $.ajax({
    url: url,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var table = new Age_table();
      try {
        table.getPage_binding(res);
      } catch (err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}
// 提交绑定：
export function fetch_age_bindConsumer(url, data) {  // 绑定商户
  var postData = JSON.stringify(data);
  var status = data.status;
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (res.code == '200') {
        let oldMes
        if (status == '0') {
          oldMes = document.querySelector('div.uk-alert');
          fn_remMes(oldMes);
          UIkit.modal.alert('账户解绑成功').then(function() {
            location.reload();
          });
        }
        if (status == '1') {
          oldMes = document.querySelector('div.uk-alert');
          fn_remMes(oldMes);
          UIkit.modal.alert('账户绑定成功').then(function() {
            location.reload();
          });
        }
      } else {
        var mes = fn_getMes('绑定/解绑失败', {style: 'danger', close: true});
        $(mes).insertBefore(document.querySelector('form'));
      }
    }
  });
}

// Station:
// 调账：
export function fetch_sta_updateFee(url, data) {
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      if (res.msg == 'success') {
        UIkit.modal.alert('修改成功').then(function() {
          document.getElementById('submitBtn').click();
        });
      }    
    }
  });
}
// 用户信息管理：推送账单
export function fetch_sta_stationBillPush(url, data) {
  var postData = JSON.stringify(data);
  // console.log(url, postData);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      try {
        if (res.msg == 'success') {
          UIkit.modal.alert('推送成功').then(function(){
            document.getElementById('submitBtn').click();
          });
        }   
      } catch (e) {
        Glob_fn.errorHandler(e);
      }
    }
  });
}
// 用户信息管理：获取用户信息:
export function fetch_sta_getStationAllConsumer(url, data) {
  var postData = JSON.stringify(data);
  // console.log(url, postData);
  var pageNumber = data.pageNumber;
  var pageSize = data.pageSize;
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var table = new Sta_table();
      try {
        table.getTable_getStationAllConsumer(res, pageNumber, pageSize);
      } catch (err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}
// 用户信息管理：设置优惠（获取）
export function fetch_sta_queryDiscountPolicy(url, customerId) {
  $.ajax({
    url: url,
    data: '',
    success: function(res) {
      if (checkRes(res) === false) return;
      var element = document.querySelector('#discountSetting');
      var listbox = new Listbox();
      try {
        listbox.getOptions_discountName(res, element, customerId);
        UIkit.modal(element).show();
      } catch(err) {
        Glob_fn.errorHandler(err);
      }
    }
  });
}
// 用户信息管理：设置优惠（添加）
export function fetch_sta_addDiscountCustomer(url, data) {
  if ( data === null ) {
    UIkit.modal.alert('请选择至少一项优惠政策');
    return;
  }
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(postData, url, res);
      try {
        if (res.msg == 'success') {
          UIkit.modal.alert('添加成功!');
        } else {
          UIkit.modal.alert(res.msg);
        }
      } catch (e) {
        Glob_fn.errorHandler(e);
      }
    }
  });
}
// 用户信息管理：查看优惠（获取）
export function fetch_sta_queryDiscountCustomer(url, data) {
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      try {
        var element = document.querySelector('#discountShowing');
        var table = element.querySelector('table');
        var tab = new Sta_table();
        var tbody = tab.getTable_queryDiscountCustomer(res);
        var bodys = table.querySelectorAll('tbody');
        for( var i = 0; i < bodys.length; i++) {
          table.removeChild(bodys[i]);
        }
        table.appendChild(tbody);
        UIkit.modal(element).show();
      } catch(e) {
        Glob_fn.errorHandler(e);
      }
    }
  });
}
// 用户信息管理：查看优惠（更改）
export function fetch_sta_changeCustomerDiscountStatus(url, data) {
  var postData = JSON.stringify(data);
  // console.log(postData);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (res.msg == 'success') {
        UIkit.modal.alert('更改成功!');
      } else {
        Glob_fn.errorHandler(res.msg);
      }
    }
  });
}
// 优惠政策管理：查看所有优惠政策
export function fetch_sta_getAllDiscountPolicy(url, data) {
  var postData = JSON.stringify(data);
  var pageNumber = data.pageNumber;
  var pageSize = data.pageSize;
  // console.log(url, postData);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var tab = new Sta_table();
      tab.getTable_getAllDiscountPolicy(res, pageNumber, pageSize);
    }
  });
}
// 优惠政策管理： 启动、停止优惠
export function fetch_sta_changeDiscountStatus(url, data) {
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res)
      if (res.msg == 'success') {
        UIkit.modal.alert('操作成功').then(function(){
          location.reload();
        });
      }
    }
  });
}
// 优惠政策管理：优惠政策详情
export function fetch_sta_getDiscountPolicy(url, data) {
  var postData = JSON.stringify(data);
  // console.log(url, postData);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      // console.log(res);
      var data = res.data;
      if (data.length < 1) {
        UIkit.modal.alert('无数据');
      }
      Glob_fn.initDiscountDetails(data);
      var btn = document.getElementById('btnAction');
      var status_changeToThis = null;
      if (data.status == '1') {
        btn.innerText = '作废';
        status_changeToThis = 2;
      } else {
        btn.innerText = '启用';
        status_changeToThis = 1;
      }
      btn.addEventListener('click', function(event) {
        event.preventDefault();
        var url = document.querySelector('input[name=api_changeDiscountStatus]').value;
        var postData = {
          discountPolicyId: data.discountPolicyId,
          status: status_changeToThis
        };
        fetch_sta_changeDiscountStatus(url, postData);
      });
    }
  });
}
// 新增优惠：获取品名
export function fetch_sta_queryCargo(url, data, resultContainer) {
  var postData = JSON.stringify({cargoNm: data});
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      var listbox = new Listbox();
      try {
        listbox.getOptions_cargoName(res, resultContainer);
      } catch(e) {
        Glob_fn.errorHandler(e);
      }      
    }
  });
}
// 新增优惠：提交优惠
export function fetch_sta_submitDiscountPage(url, data) {
  var postData = JSON.stringify(data);
  $.ajax({
    url: url,
    data: postData,
    success: function(res) {
      if (checkRes(res) === false) return;
      if (res.msg == 'success') {
        UIkit.modal.alert('创建成功').then(function() {
          window.location.href = 'discountPoliciesManagement';
        });
      } else {
        Glob_fn.errorHandler(res.msg);
      }
    }
  });
}

