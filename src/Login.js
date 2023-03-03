import Glob_fn from './Global'
import {fetchData} from './AjaxManager'

export function initLogin_page() {
  try {
    initPage();
  } catch(error) {
    Glob_fn.errorHandler(error);
    window.location.href = 'https://www.dovepay.com';
  }
  function initPage() {
    initLogin_coverPage();
    var pageFor = document.querySelector('input[name=pagefor]').value;
    var sel_type = document.querySelector('select[name=userType]');
    var inp_accountId = document.querySelector('input[name=accountId]');
    var form = document.getElementById('form_login');
    var inp_userId = document.querySelector('input[name=userId]');
    if (pageFor === 'system') {
      inp_accountId.value = 'system';
      sel_type.value = 'system';
      form.submit();
    } else {
      var url = document.querySelector('input[name=api_role]').value;
      inp_userId.addEventListener('change', function(event) {
        event.preventDefault();
        fetchLoginData();
      });
      fetchLoginData();
    }
    function fetchLoginData() {
      var data = { 'userId': inp_userId.value, };
      var inp_accountId = document.querySelector('input[name=accountId]');
      inp_accountId.value = '';
      fetchData(url, data, new Page_login().setRole, {
        global: false,
        error: function(xhr, textStatus/*, error*/) {
          if (console) console.error(textStatus);
          UIkit.modal.alert('发生错误: ' + textStatus).then(initLogin_loginFailed);
        },
      });
    }
  }
}
export function initLogin_initQuirBtn() {
  try {
    initPage();
  } catch(error) {
    Glob_fn.errorHandler(error);
    return;
  }
  function initPage() {
    var quitBtn = document.getElementById('quitBtn');
    quitBtn.addEventListener('click', function() {
      var btn = this;
      UIkit.modal.confirm('确定退出系统?').then(function(){
        try {
          quit(btn);
        } catch(error) {
          Glob_fn.errorHandler(error);
          return;
        }
      });
      function quit(btn) {
        initLogin_coverPage();
        var url = btn.getAttribute('data-url');
        var userType = document.getElementById('userType').value;
        var data = {
          userType: userType
        };
        fetchData(url, data, function(res) {
          try {
            var redirect = res.data.redirect;
            window.location.href = redirect;
          } catch(error) {
            Glob_fn.errorHandler(error);
            return;
          }
        });
      }
    });
  }
}
export function initLogin_coverPage() {
  var div = document.createElement('div');
  div.setAttribute('class', 'uk-position-cover uk-background-muted uk-overlay uk-overlay-default uk-flex uk-flex-center uk-flex-middle');
  var i = document.createElement('i');
  i.setAttribute('class', 'fa fa-circle-o-notch fa-spin fa-3x fa-fw');
  div.appendChild(i);
  var span = document.createElement('span');
  span.setAttribute('class', 'sr-only');
  span.innerText = 'Loading...';
  div.appendChild(span);
  var span2 = document.createElement('span');
  span2.innerText = '正在跳转';
  div.appendChild(span2);
  document.body.appendChild(div);
  return div;
}
export function initLogin_loginFailed() {
  try {
    var pageFor = document.querySelector('input[name=pagefor]').value;
    window.location.href = pageFor === 'system'?
      document.querySelector('input[name=url_dovemgr]').value:
      document.querySelector('input[name=url_dovepay]').value;
  } catch (error) {
    window.location.href = 'https://www.dovepay.com';
  }
}

export function Page_login() {}
Page_login.prototype.setRole = function(res) {
  try {
    var data = res.data;
    var accountId = data.accountId;
    var type = data.type;
    var inp_accountId = document.querySelector('input[name=accountId]');
    var sel_type = document.querySelector('select[name=userType]');
    var form = document.getElementById('form_login');
    inp_accountId.value = accountId;
    sel_type.value = type;
    if (!!inp_accountId.value && !!sel_type.value) {
      form.submit();
    } else {
      UIkit.modal.alert('参数错误: accountId=' + accountId + ', type=' + type).then(initLogin_loginFailed);
    }
  } catch(error) {
    UIkit.modal.alert('发生错误: ' + error).then(initLogin_loginFailed);
  }
    
}