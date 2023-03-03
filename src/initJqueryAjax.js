import Glob_fn from './Global'
// Global:
// Ajax设置：
$.ajaxSetup({
  headers: {
    accountId: $('header #accountId').val(),
    userId: $('header #userId').val(),
    type: $('header #userType').val(),
  },
  type: 'POST',  // for java api
  dataType: 'json',
  contentType: 'application/json',
  timeout: 10000,
});
// Ajax错误处理：
$(document).ajaxError(function(event, xhr, settings){
  var reqUrl = settings.url;
  var reqData = settings.data;
  var res = xhr.status + xhr.statusText;
  if (console)
    console.error(reqUrl, reqData, res);
  Glob_fn.errorHandler('服务器数据获取失败: 错误码: ' + xhr.status + ';<br>错误描述: ' + getStatusText(xhr.statusText));
  function getStatusText(statusStr) {
    var text = statusStr;
    if (statusStr === 'timeout') text = '请求超时';
    return text;
  }
});
// loading遮罩实现：
$(document).ajaxStart(function() {
  Glob_fn.loading.show();
});
$(document).ajaxStop(function() {
  Glob_fn.loading.hide();
});
// 获取表格数据：
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    var value = Glob_fn.isJSON(this.value)? JSON.parse(this.value): this.value;
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(value || '');
    } else {
      o[this.name] = value || '';
    }
  });
  return o;
};