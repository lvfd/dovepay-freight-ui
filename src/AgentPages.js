import {
  initStation_stationQueryBill_new, initStation_stationQueryBillDetails_new
} from './StationPages'

import {
  fetchData, fetch_age_getBindConsumer, fetch_age_bindConsumer
} from './AjaxManager'

import {fn_getMes, fn_remMes} from './Message'

export function initAgent_consumerQueryBill_new() {
  return initStation_stationQueryBill_new();
}
export function initAgent_consumerQueryBillDetails_new() {
  return initStation_stationQueryBillDetails_new();
}
export function initAgent_userName() {
  var span = document.getElementById('agentNameInHeader');
  fetchData(document.querySelector('input[name=api_getAgentName]').value, '', setUserName, false);
  function setUserName(res) {
     span.innerHTML = '&nbsp;' + res.data.customerNameChn;
  }
}
export function initAgent_getBindConsumer() {
  // var form = document.getElementById('form_consumer_getBindConsumer');
  var url = document.querySelector('input[name=api_getBindConsumer]').value;
  fetch_age_getBindConsumer(url);
}

export function Age_table(){}
Age_table.prototype.getPage_binding = function(res) {
  var data = res.data,
      name = data.customerNameChn,  // 商户名称
      status = data.status,         // 绑定状态
      // statusDesc = data.statusDesc, 
      customerId = data.customerIdList,
      form = document.getElementById('form_consumer_getBindConsumer'),
      inp_cus = form.querySelector('input[name=customerId]'),
      inp_sta = form.querySelector('input[name=status]'),
      inp_nam = form.querySelector('input[name=customerNameChn]'),
      btn_bin = document.getElementById('setBindBtn');
  inp_cus.value = customerId;
  inp_sta.value = status;
  inp_nam.value = name;
  let oldmesNode, mes
  if (status == 0) {  // 未绑定
    btn_bin.innerText = '绑定账户';
    oldmesNode = document.querySelector('div.uk-alert');
    if (oldmesNode) fn_remMes(oldmesNode);
    mes = fn_getMes('您尚未绑定账户', {style: 'warning', close: true});
    $(mes).insertBefore(form);
    btn_bin.addEventListener('click', function(event) {
      event.preventDefault();
      var url = document.querySelector('input[name=api_bindConsumer]').value;
      var data = {
        customerIdList: customerId,
        status: '1'
      };
      fetch_age_bindConsumer(url, data);
    });
  } 
  if (status == 1) {  // 已绑定
    btn_bin.innerText = '解绑账户';
    oldmesNode = document.querySelector('div.uk-alert');
    if (oldmesNode) fn_remMes(oldmesNode);  
    mes = fn_getMes('您已绑定账户', {style: 'primary', close: true});
    $(mes).insertBefore(form);
    btn_bin.addEventListener('click', function(event) {
      event.preventDefault();
      var url = document.querySelector('input[name=api_bindConsumer]').value;
      var data = {
        customerIdList: customerId,
        status: '0'
      };
      // var $this = $(this);
      UIkit.modal.confirm('解除绑定之后将不能继续接收账单, 确认继续?').then(function(){
        fetch_age_bindConsumer(url, data);
      }, function(){
        return;
      });
    });
  }
};