export function initListBox() {
    var btnL2R = document.querySelector('#listboxL2R');
    var btnR2L = document.querySelector('#listboxR2L');
    var selectL = document.querySelector('#sourceSelect');
    var selectR = document.querySelector('#destSelect');

    if (selectL && selectR && btnL2R && btnR2L) {
        btnL2R.addEventListener('click', function(e) {
            e.preventDefault();
            listboxMoveacross('sourceSelect', 'destSelect', 'norepeat');
        });
        btnR2L.addEventListener('click', function(e) {
            e.preventDefault();
            listboxMoveacross('destSelect', 'sourceSelect');
        });
    }

    function listboxMoveacross(sourceID, destID, type) {
        var src = document.getElementById(sourceID);
        var dest = document.getElementById(destID);
        for(var count=0; count < src.options.length; count++) {
            if(src.options[count].selected == true) {
                    var option = src.options[count];
                    var attrs = option.attributes;
                    var newOption = document.createElement("option");
                    for (var i = 0; i < attrs.length; i++) {
                        newOption.setAttribute(attrs[i].name, attrs[i].value);
                    }
                    newOption.value = option.value;
                    newOption.text = option.text;
                    newOption.selected = true;
                    // 品名查询时(左至右)：
                    if (document.querySelector('#cargoNameListbox')
                        || document.getElementById('specialCargoNameListbox')) {
                        var id1 = newOption.getAttribute('data-cargoNo');
                        var destoptions = dest.querySelectorAll('option');
                        if (destoptions.length > 0) {
                            for (var j = 0; j < destoptions.length; j++) {
                                var id2 = destoptions[j].getAttribute('data-cargoNo');
                                if (type) {
                                    if ( id1 === id2 ) {
                                        UIkit.modal.alert('选择项在优惠品名列表中已存在');
                                        return;
                                    }
                                }
                                
                            }
                        }
                    }
                    try {
                         dest.add(newOption, null); //Standard
                         src.remove(count, null);
                     }catch(error) {
                         dest.add(newOption); // IE only
                         src.remove(count);
                     }
                    count--;
            }
        }
    }
}

export function Listbox() {}

Listbox.prototype.getOptions_cargoName = function(response, container) {
    try {
        var data = response.data;
        if (data.length < 1) {
            UIkit.modal.alert('没有相关的品名');
            return;
        }
        container.innerHTML = '';
        for (var i = 0; i < data.length; i++) {
            var op = document.createElement('option');
            for ( var key in data[i]) {
              if (key == 'cargoNm') {
                op.innerText = data[i][key];
                op.setAttribute('data-' + key, data[i][key]);
              }
              op.setAttribute('data-' + key, data[i][key]);
            }
            container.appendChild(op);
        }
    } catch (err) {
        alert(err);
        console.error(err);
    }
};
Listbox.prototype.getOptions_discountName = function(response, listboxEl, customerId) {
    var sel_sou = listboxEl.querySelector('#sourceSelect');
    var sel_des = listboxEl.querySelector('#destSelect');
    sel_sou.innerHTML = '';
    sel_des.innerHTML = '';
    sel_des.setAttribute('data-customerId', customerId);
    var data = response.data;
    if (data.length < 1) { return; }
    var optionArr = [];
    for (var i = 0; i < data.length; i++) {
        var op = document.createElement('option');
        for ( var key in data[i]) {
            if (key == 'discountPolicyName') { 
                op.innerText = data[i][key];
            } else {
                op.setAttribute('data-' + key, data[i][key]);
            }
        }
        optionArr.push[op];
        sel_sou.appendChild(op);
    }
    return optionArr;
};
Listbox.prototype.postData_discountName = function() {
    // var sel_sou = document.querySelector('#sourceSelect');
    var sel_des = document.querySelector('#destSelect');
    var customerId = sel_des.getAttribute('data-customerId');
    var postData = { customerId: customerId };
    var discountPolicyIds = [];
    var ops = sel_des.querySelectorAll('option');
    if (ops.length < 1) { return null }
    for ( var i = 0; i < ops.length; i++) {
        var discountPolicyId = ops[i].getAttribute('data-discountPolicyId');
        discountPolicyIds.push(discountPolicyId);
    }
    postData.discountPolicyIds = discountPolicyIds;
    return postData;
}