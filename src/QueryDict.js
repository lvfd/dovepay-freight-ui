import Glob_fn from './Global'

function QueryDict(){
  this.api = document.querySelector('input[name=dict_api]').value;
}
QueryDict.prototype.query = function (name, cb) {
  // console.log(this.api, JSON.stringify({type: name}))
  $.ajax({
    url: this.api,
    data: JSON.stringify({type: name}),
    success: cb
  });
};
export default function fn_queryDict(name, cb) {
  var qd = new QueryDict();
  try {
    qd.query(name, cb);
  } catch(err) {
    Glob_fn.errorHandler(err);
  }
}