import Glob_fn from './Global'
import fn_initPaginate from './Paginate'
import Canvas from './canvas'
import chartConfig from './dataStatisticChartConfig'
import {
  fetchData, fetch_exportExcel, fn_initSubmitBtn, fn_initExportBtn
} from './AjaxManager'

export function dsIndex() {
  console.log('进入 ----------> dataStatistic Index')
  initWdatePicker()
  queryBillRule()
  .then(response => setBillRule(response))
  .then(() => bindButtons(loadData, saveBillRuleId))
  .catch(error => console.error(error))
}

export function dsDetails() {
  console.log('进入 ----------> dataStatistic Details')
  
  setParentLink('#parentLink', 'dovepay-freight/station/dataStatistic')
  
  queryBillRule()
  .then(response => setBillRuleText(response))
  .catch(error => console.error(error))

  /* table */
  bindButtons(loadDataDetails, null , () => {history.back()})
  .catch(error => console.error(error))
  
}

function initWdatePicker() {
  try {
    const billTimeInp = document.querySelector('input[name="billTime"]')
    billTimeInp.addEventListener('click', function() {
      WdatePicker({
        el:this,
        dateFmt:'yyyy',
        maxDate:'%y',
      })
    })
  } catch (e) {
    console.error(e.stack)
  }
}
function queryBillRule() {
  return new Promise((res, rej) => {
    try {
      const url = document.querySelector('input[name="api_queryEffectiveBillRule"]').value
      fetchData(url, '', res)
    } catch (e) {
      rej(e.stack)
    }
  })
}
function setBillRule(response) {
  return new Promise((resolve, rej) => {
    try {
      const billRuleIdSel = document.querySelector('select[name="billRuleId"]')
      const dataArr = response.data
      if (dataArr.length > 0) {
        dataArr.forEach((data) => {
          const option = document.createElement('option')
          option.setAttribute('value', data.billRuleId)
          option.innerText = data.billRuleName
          billRuleIdSel.appendChild(option)
        })
      } 
      resolve('success')
    } catch(e) {
      rej(e.stack)
      // console.error(e.stack)
    }
  })
}
function setBillRuleText(res) {
  try {
    let id = document.querySelector('input[name="billRuleId"]')
    let text = document.querySelector('#billRuleText')
    if (!id.value) {
      text.value = '全部'
    } else {
      const dataArr = res.data
      dataArr.some((data) => {
        if (id.value === data.billRuleId) {
          text.value = data.billRuleName
          return true
        }
      })
    }
  } catch(e) {
    console.error(e.stack)
  }
}
function bindButtons(cb, dataHandler, checkResCallback) {
  return new Promise((res, rej) => {
    try {
      fn_initExportBtn(fetch_exportExcel)
    } catch(e) {
      console.error(e.stack)
    }
    try {
      fn_initSubmitBtn(1, 15, fetchData, cb, dataHandler, checkResCallback)
    } catch(e) {
      rej(e.stack)
    }
  })
}
function saveBillRuleId(data) {
  try {
    document.querySelector('input[name="billRuleIdValue"]').value = data.billRuleId
  } catch(e) {
    console.error(e.stack)
  }
}
function loadData(response, pageNumber, pageSize) {
  try {
    console.log(response)
    const table = document.getElementById('dataTable')
    const trInThead = Glob_fn.Table.getThTr(table)
    setThead(trInThead)
    setTbody(table, response)
    fn_initPaginate(response, pageNumber, pageSize, fetchData, loadData)
  } catch(e) {
    console.error(e.stack)
  }
  function setThead(tr) {
    const set = Glob_fn.Table.setTh
    const textArr = ['排名', '往来户编码', '商户编号', '往来户名称', '年度', '总金额', '操作']
    textArr.forEach((text) => {
      set(tr, text)
    })
  }
  function setTbody(table, res) {
    const tbody = table.querySelector('tbody')
    tbody.innerHTML = ''
    const data = res.data.summaryList
    if (!data || data.length < 1) {
      const tab = Glob_fn.Table
      const tr0 = tab.showNoData(tab.getThTr(table).querySelectorAll('th').length)
      tbody.appendChild(tr0)
      return
    }
    data.forEach((line/*, index*/) => {
      const tr = document.createElement('tr')
      tbody.appendChild(tr)
      // const tdSerial = document.createElement('td')
      // tr.appendChild(tdSerial)
      // tdSerial.innerText = index + 1 + (parseInt(pageNumber) - 1) * parseInt(pageSize)
      const set = Glob_fn.Table.setTd
      const propArr = ['serialNumber', 'esbCustomerId', 'accountId',
        'esbCustomerName', 'billTime', 'totalAmount']
      propArr.forEach((prop) => {
        set(tr, line[prop])
      })
      /* 查看详情 */
      const tdAction = document.createElement('td')
      const tdActionLink = document.createElement('a')
      tdAction.appendChild(tdActionLink)
      tr.appendChild(tdAction)
      tdActionLink.innerText = '查看详细'
      propArr.forEach((prop) => {
        tdActionLink.dataset[prop] = line[prop]
      })
      tdActionLink.addEventListener('click', toDetails)
    })
  }
}
function toDetails(event) {
  event.preventDefault()
  const el = event.target
  try {
    const loc = window.location
    const url = `${loc.protocol}//${loc.host}/dovepay-freight/station/dataStatistic/details`
    let postData = {
      billRuleId: document.querySelector('input[name=billRuleIdValue]').value
    }
    if (el.dataset) {
      for(let prop in el.dataset) {
        postData[prop] = el.dataset[prop]
      }
    }
    Glob_fn.submVirtForm(url, postData)
  } catch(e) {
    console.error(e.stack)
  }
}
function setParentLink(node, link) {
  const a = document.querySelector(node)
  const loc = window.location
  a.setAttribute('href', `${loc.protocol}//${loc.host}/${link}`)
}
function loadDataDetails(response, pageNumber, pageSize) {
  try {
    console.log(response)
    const table = document.getElementById('dataTable')
    const trInThead = Glob_fn.Table.getThTr(table)
    setThead(trInThead)
    setTbody(table, response)
    fn_initPaginate(response, pageNumber, pageSize, fetchData, loadData)
  } catch(e) {
    console.error(e.stack)
  }
  try {
    chartHandler(response)
  } catch(e) {
    console.error(e.stack)
  }
  function setThead(tr) {
    const set = Glob_fn.Table.setTh
    const textArr = ['序号', '年月', '总金额', '结算客户名称']
    textArr.forEach((text) => {
      set(tr, text)
    })
  }
  function setTbody(table, res) {
    const tbody = table.querySelector('tbody')
    tbody.innerHTML = ''
    const data = res.data
    if (!data || data.length < 1) {
      const tab = Glob_fn.Table
      const tr0 = tab.showNoData(tab.getThTr(table).querySelectorAll('th').length)
      tbody.appendChild(tr0)
      return
    }
    data.forEach((line) => {
      const tr = document.createElement('tr')
      tbody.appendChild(tr)
      const set = Glob_fn.Table.setTd
      const propArr = ['serialNumber', 'billTime', 'totalAmount',
        'esbCustomerName']
      propArr.forEach((prop) => {
        set(tr, line[prop])
      })
    })
  }
   /* chart */
  function chartHandler(res) {
    const cvs = new Canvas('#dataStatisticChart')
    .setSize([16, 9])
    .buildChart(chartConfig(res))

    console.log(cvs)
  }
}




// canvas.setChartTitle(cvs, '图表')

