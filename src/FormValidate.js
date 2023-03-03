export default function FormValidate() {}

FormValidate.prototype.validator = function() {
  var form = document.getElementById('dataForm');
  var mark = form.getAttribute('data-vld');
  switch (mark) {
    default: 
      throw new Error('form参数没有合适的data-vld属性');
    case 'station_billsSetting_addRule':
      return FormValidate.station_billsSetting_addRule();
      // break;
    case 'another':
      return function() {console.log('111')};
  }
};

FormValidate.station_billsSetting_addRule = function() {
  var inp_billName = document.getElementById('billName');
  var inp_billName_maxWords = 20;
  var inp_billName_maxWordsText = '最多输入' + inp_billName_maxWords + '字';
  return {
    bindFormItems: function() {
      var inp = inp_billName;
      var maxWords = inp_billName_maxWords;
      var maxWordsText = inp_billName_maxWordsText;
      if (!inp) return;
      inp.setAttribute('maxlength', maxWords);
      inp.setAttribute('placeholder', maxWordsText);
      inp.setAttribute('uk-tooltip', 'title:' + maxWordsText + '; pos: top-right');
      inp.setAttribute('autofocus', 'autofocus');
      inp.focus();
      // UIkit.tooltip(inp).show();
      inp.addEventListener('blur', function() {
        FormValidate.inp_checkNull(this, maxWordsText);
      });
      inp.addEventListener('change', function() {
        FormValidate.inp_limitLength(this, maxWords);
      });
    },
    checkCheckboxes: function(){
      var boo = false;
      var checkboxes = document.querySelectorAll('input[type=checkbox].linkLabel');
      for (var i = 0; i < checkboxes.length; i++) {
        var checkbox = checkboxes[i];
        if (checkbox.checked) {
          boo = true;
          break;
        }
      }
      if (!boo)
        UIkit.notification("请在多选项目中选择至少一个类型", 'warning');
      return boo;
    },
    submitBoo: function() {
      FormValidate.inp_limitLength(inp_billName, inp_billName_maxWords);
      var boos = [];
      boos.push(FormValidate.inp_checkNull(inp_billName, inp_billName_maxWordsText));
      boos.push(this.checkCheckboxes());
      return FormValidate.passToSubmit(boos);
    },
  }
};

FormValidate.inp_checkNull = function(inp, originText) {
  var changeText = '此项不能为空';
  if (!inp.value) {
    inp.classList.add('uk-form-danger');
    inp.setAttribute('placeholder', changeText);
    inp.setAttribute('uk-tooltip', 'title:' + changeText + '; pos: top-right');
    UIkit.tooltip(inp).show();
    return false;
  } else {
    inp.classList.remove('uk-form-danger');
    inp.setAttribute('uk-tooltip', 'title:' + originText + '; pos: top-right');
    return true;
  }
};
FormValidate.inp_limitLength = function(inp, maxlen) {
  var trimValue = $.trim(inp.value);
  if (trimValue.length > maxlen) {
    inp.value = trimValue.slice(0, maxlen);
  } else {
    inp.value = trimValue;
  }
}
FormValidate.passToSubmit = function(boosArr) {
  for (var i = 0; i < boosArr.length; i++) {
    var boo = boosArr[i];
    if (!boo) {
      return boo;
    } else {
      continue;
    }
  }
  return true;
}