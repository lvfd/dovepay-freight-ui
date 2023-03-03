import Glob_fn from './Global'
import {
  initLogin_page, initLogin_initQuirBtn
} from './Login'
import {
  initSystem_getAllConsumer, initSystem_systemQueryBill_new, initSystem_systemQueryBillDetails_new,
  initSystem_getAllDiscountPolicy, initSystem_getDiscountPolicy, initSystem_billMangement_queryBills,
  initSystem_baseData
} from './SystemPages'
import {
  initAgent_userName, initAgent_consumerQueryBill_new,
  initAgent_consumerQueryBillDetails_new, initAgent_getBindConsumer
} from './AgentPages'
import {
  initStation_stationQueryBill_new, initStation_stationQueryBillDetails_new,
  initStation_getStationAllConsumer, initStation_getAllDiscountPolicy,
  initStation_baseData, initStation_billsSetting, initStation_billsSetting_addRule, initStation_billMangement_queryBills,
} from './StationPages'
import {
  initStation_initTabs, initStation_discountPoliciesManagementDetails
} from './DiscountPages'
import * as dataStatistic from './dataStatistic'
import './initJqueryAjax'

$(document).ready(function() {
  try {
    EntryJS();
  } catch (error) {
    Glob_fn.errorHandler(error);
    return;
  }
});

function EntryJS() {

  // readonly禁用backspace:
  document.onkeydown = Glob_fn.banBackSpace;

  // Login page:
  if (document.querySelector('input[data-pageId=dovepay-freight_login]')) {
    initLogin_page();
  }

  // Init Main:
  if (document.getElementById('dpfMain')) {
    Glob_fn.initMain();
  }

  // Init navbar:
  if (document.getElementById('dpfNav')) {
    Glob_fn.initNav();
  }
  
  // Init header:
  if (document.getElementById('dpfHeader')) {
    initLogin_initQuirBtn();
    if (document.getElementById('agentNameInHeader')) initAgent_userName();
  }

  // 初始化系统商：用户查询：
  if (document.querySelector('input[data-pageId=system_getAllConsumer]')) {
    initSystem_getAllConsumer();
  }
      // 初始化系统商：账单查询：
      // if (document.querySelector('input[data-pageId=system_systemQueryBill]')) {
      //   initSystem_systemQueryBill();
      // }
  // 初始化系统商：查询账单：新需求
  if (document.querySelector('input[data-pageId=system_systemQueryBill_new]')) {
    initSystem_systemQueryBill_new();
  }
      // 初始化系统商：账单详情查询：
      // if (document.querySelector('input[data-pageId=system_systemQueryBillDetails]')) {
      //   initSystem_systemQueryBillDetails();
      // }
  // 初始化系统商：查询账单详情：新需求
  if (document.querySelector('input[data-pageId=system_systemQueryBillDetails_new]')) {
    initSystem_systemQueryBillDetails_new();
  }
  // 初始化系统商：优惠政策管理：
  if (document.querySelector('input[data-pageId=system_getAllDiscountPolicy]')) {
    initSystem_getAllDiscountPolicy();
  }
  // 初始化系统商：优惠政策详情：
  if (document.querySelector('input[data-pageId=system_getDiscountPolicy]')) {
    initSystem_getDiscountPolicy();
  }
  // 初始化系统商: 账单汇总查询:
  if (document.querySelector('input[data-pageId=system_billMangement_queryBills]')) {
    initSystem_billMangement_queryBills();
  }
  // 初始化系统商: 基础数据页面:
  if (document.querySelector('input[data-pageId=system_baseData]')) {
    initSystem_baseData();
  }

      // 初始化agent：查询账单(旧需求)：
      // if (document.querySelector('input[data-pageId=consumer_consumerQueryBill]')) {
      //   initAgent_consumerQueryBill();
      // }
  // 初始化agent：查询账单(新需求)：
  if (document.querySelector('input[data-pageId=agent_billMangement_queryBills]')) {
    initAgent_consumerQueryBill_new();
  }
      // 初始化agent：查询账单详情(旧需求)：
      // if (document.querySelector('input[data-pageId=consumer_consumerQueryBillDetails]')) {
      //   initAgent_consumerQueryBillDetails();
      // }
  // 初始化agent：查询账单详情(新需求)：
  if (document.querySelector('input[data-pageId=consumer_consumerQueryBillDetails_new]')) {
    initAgent_consumerQueryBillDetails_new();
  }
  // 初始化agent：绑定账户：
  if (document.querySelector('input[data-pageId=consumer_getBindConsumer]')) {
    initAgent_getBindConsumer();
  }

      // 初始化station：查询账单：旧需求
      // if (document.querySelector('input[data-pageId=station_stationQueryBill]')) {
      //   initStation_stationQueryBill();
      // }
  // 初始化station：查询账单：新需求
  if (document.querySelector('input[data-pageId=station_stationQueryBill_new]')) {
    initStation_stationQueryBill_new();
  }
      // 初始化station：查询账单详情：旧需求
      // if (document.querySelector('input[data-pageId=station_stationQueryBillDetails]')) {
      //   initStation_stationQueryBillDetails();
      // }
  // 初始化station：查询账单详情：新需求
  if (document.querySelector('input[data-pageId=station_stationQueryBillDetails_new]')) {
    initStation_stationQueryBillDetails_new();
  }
  // 初始化station：用户信息管理：
  if (document.querySelector('input[data-pageId=station_getStationAllConsumer]')) {
    initStation_getStationAllConsumer();
  }
  // 初始化station: 优惠政策管理：
  if (document.querySelector('input[data-pageId=station_getAllDiscountPolicy]')) {
    initStation_getAllDiscountPolicy();
  }
  // 初始化station:优惠: 设置页面选项卡
  if (document.querySelector('input[data-pageId=station_createDiscountPolicy]')) {
    initStation_initTabs();  
  }
  // 初始化station:优惠：政策名细页面：
  if (document.querySelector('input[data-pageId=discountPoliciesManagementDetails]')) {
    initStation_discountPoliciesManagementDetails();
  }
  // 初始化station: 基础数据页面:
  if (document.querySelector('input[data-pageId=station_baseData]')) {
    initStation_baseData();
  }
  // 初始化station: 账单规则查询页面:
  if (document.querySelector('input[data-pageId=station_billsSetting]')) {
    initStation_billsSetting();
  }
  // 初始化station: 新增账单规则页面:
  if (document.querySelector('input[data-pageId=station_billsSetting_addRule]')) {
    initStation_billsSetting_addRule();
  }
  // 初始化station: 账单汇总查询:
  if (document.querySelector('input[data-pageId=station_billMangement_queryBills]')) {
    initStation_billMangement_queryBills();
  }
  // 初始化station: 数据统计:
  if (document.querySelector('input[data-pageId=dataStatisticIndex]')) {
    dataStatistic.dsIndex()
  }
  // 初始化station: 数据统计明细:
  if (document.querySelector('input[data-pageId=dataStatisticDetails]')) {
    dataStatistic.dsDetails()
  }
}