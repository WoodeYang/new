var vm_multi; //批量交易的vue对象  
var user_id = $.pullValue(window, 'LOGIN_INFO.user_id', '');
var stock_list = [];
var list_data = []; //封装好的data
//判断是买入还是卖出
var direction = "buy";
var total_cash = 0; //空仓下可用金额最大值
var total_max_cash = 0; //可用金额最大值
var product; //策略信息
//最后一次加载时间
var last_loading_timestamp = new Date().valueOf();
//证券列表中被选中的证券机构
var position_stocks;
// var entrust_info = window.entrust_info?window.entrust_info:[];//委托信息
var market = 'marketA'; //默认a股
//检测环境是否发生变化，主要是 product_id
//multi_products:head:updated:checked_one   总列表中单选时触发  传递 产品信息
$(window).on('multi_products:head:updated:checked_one', function(event) {
  var new_product = event.product;
  vm_multi || multiViewUpdate()
  product = new_product;
  getStockList();

}).on('multi_products:head:updated:checked_notone', function() {
  //check没有选中的时候
});
// 切换市场时，重新获取自选股数据
$(window).on('order_create:market:changed', function(event) {

    market = event.market; //修改股票市场
    product && getStockList();
  })
  // 切换交易方式，重新获取自选股数据
$(window).on('order_create:deal_method:changed', function(event) {
  //切换买入 卖出
  direction = event.deal_method;
  product && getStockList();
})
$(window).on('load', function() {
  //清空缓存区的自选股列表
  direction == 'buy' && $.omsUpdateLocalJsonData('stock_follow', user_id);
}).on('order_create:nav:multi-stocks:buy', function() {
  product && getStockList();
}).on('order_create:nav:multi-stocks:sell', function() {
  product && getStockList();
}).on('add_multi_hand_order:success',
  getStockList
).on('order_create:multi_order:data_change:bull', function(event) {
  data = event.new_data;
  distributeTradeData(data);
}).on('order_create:multi_order:data_change:sell', function(event) {
  data = event.new_data;
  distributeTradeData(data);
}).on('product:position:updated', function(event) {
  var position = event.position;
  position && updatePositionList(position);
}).on('risk_cash_check:success', function(event) {
  // render();
  var product_max_cash = $.pullValue(event, 'res_data.product_cash.max_cash', 0);
  $(window).trigger({
    type: 'create_order:multi_stocks:' + direction + ':max_cash:changed',
    max_cash: product_max_cash
  });
});
direction == 'buy' && $(window).on('create_order:multi_stocks:add_stock', function(event) {
  var stock = event.stock;
  //新增，更新本地缓存
  var cached_follow_stocks = $.omsGetLocalJsonData('stock_follow', user_id, false);
  if (cached_follow_stocks) {
    cached_follow_stocks.push($.extend(stock, {
      follow: true
    }));
    $.omsUpdateLocalJsonData('stock_follow', user_id, cached_follow_stocks);
  }
  combinePositionStocksInfo([stock], $.omsGetLocalJsonData('position_realtime', product.id, []))
    // 新增股票时，前端风控
    // var product = PRODUCT;
    // 计算可用余额
    // 新增股票的总可用资金
  var market_value = 0;
  var total_amount = 0;
  var enable_sell_volume = 0;
  window.position_realtime && window.position_realtime.forEach(function(e) {
    if (e.stock_id === stock.stock_id && e.product_id == product.id) {

      // market_value = e.market_value;
      // total_amount = e.total_amount;
      enable_sell_volume = e.enable_sell_volume;
    }
  });
  var all_market_value = 0;
  window.risk_position[product.id].data.forEach(function(el) {
    if (el.stock_id == stock.stock_id) {
      total_amount = el.total_amount;
      market_value = el.market_value;
    }
    all_market_value += el.market_value - 0;
  });
  var obj = riskCheck.checkRules({
    product_id: product.id, // 产品id， id
    // 交易数据 form_data
    trade_direction: 1, // 交易方向，1买入 2卖出 trade_direction
    trade_mode: 1, // 1限价／2市价  trade_mode
    volume: 0, // 交易数量
    price: 1, // 限价金额
    surged_limit: 1, // 涨停价 price已经做了处理了
    decline_limit: 1, // 跌停价 price已经做了处理了
    stock_code: stock.stock_id, // 股票code，包含“.SZ”,比较的时候最好都进行小写转换
    stock_name: stock.stock_name, // 股票名称，用于判断st股票
    // 产品的数据 product
    total_assets: product.runtime.total_assets, // 资产总值 runtime.total_assets
    enable_cash: product.runtime.enable_cash, // 可用资金 runtime.enable_cash
    security: all_market_value, // 持仓市值 runtime.security 改为 all_market_value
    net_value: product.runtime.net_value, // 当日净值 runtime.net_value
    // 持仓数据
    market_value: market_value, // 本股票持仓市值 //window.position_realtime里面有
    total_amount: total_amount, // 该股票当前持仓数
    enable_sell_volume: 0 // 该股票能卖的数量
  });
  // 剩余可用资金 ＝ 空仓下的总可用资金 － 股票资产
  var max_cash = Math.max(obj.max_cash, 0);
  stock.max_cash = Math.min(max_cash, total_max_cash);
  // stock.forEach(function(e){
  //     e.max_cash = max_cash;
  // });
  $(window).trigger({
    type: 'risk_cash_check:success',
    res_data: {
      product_cash: {
        max_cash: max_cash
      }
    }
  });
  // 新增自定义股票时需要得到新的股票的可用资金等信息
  mergeFreshStocksInfo([stock]).then(function() {
    stock_list.push(stock);
    let list = filterData(stock_list, vm_multi.header_data);
    if ('marketA' == market) {
      list = list.filter(function(e) {
        return /\.(SZ|SH)$/.test(e.stock_id.toUpperCase());
      })
    } else if ('marketHSH' == market) {
      list = list.filter(function(e) {
        return /\.(HKSH)$/.test(e.stock_id.toUpperCase());
      })
    } else if ('marketHSZ' == market) {
      list = list.filter(function(e) {
        return /\.(HKSZ)$/.test(e.stock_id.toUpperCase());
      })
    }
    vm_multi.stock_list = list;
  });

  $('.multi-stocks-section').find('.nothing-nothing').removeClass('nothing');
}).on('create_order:multi_stocks:delete_stock', function(event) {
  var stock = event.stock;
  //删除，更新本地缓存
  var cached_follow_stocks = $.omsGetLocalJsonData('stock_follow', user_id, false);
  if (cached_follow_stocks) {
    cached_follow_stocks = cached_follow_stocks.filter(function(cached_stock) {
      return cached_stock.stock_id != stock.stock_id;
    });
    $.omsUpdateLocalJsonData('stock_follow', user_id, cached_follow_stocks);
  }
  let list = vm_multi.stock_list;
  list.forEach(function(ele, index) {
    if (ele.stock_id == stock.stock_id) {
      list.splice(index, 1);
    }
  })
  vm_multi.stock_list = list;
  getStockList();
});
//动态更新持仓数据
function updatePositionList(position_stocks) {
  if (!position_stocks || !position_stocks.length) {
    return;
  }
}
// 批量购买的规则鉴定
function distributeTradeData(data) {
  product && getStockList();
}

function getStockList() {
  reset();
  direction == 'buy' ? getFollowListStocks() : getPositionStocks();
}

function getFollowListStocks() {
  var url = (window.REQUEST_PREFIX || '') + '/user/stock-follow/get';

  var cached_follow_stocks = $.omsGetLocalJsonData('stock_follow', user_id, false);

  cached_follow_stocks ? (stock_list = cached_follow_stocks, getPositionStocks()) : $.getJSON(url).done(function(res) {

    stock_list = stock_list.concat($.pullValue(res, 'data.list', []).map(function(stock_id) {
      return {
        stock_id: stock_id,
        follow: true
      };
    }).reverse());
    //缓存 stock_follow 的信息
    $.omsCacheLocalJsonData('stock_follow', user_id, stock_list);
    res.code == 0 && getPositionStocks();
    !res.code == 0 && $.failNotice(url, res);
  }).fail($.failNotice.bind(null, url));
}

function getPositionStocks() {
  var url = (window.REQUEST_PREFIX || '') + '/oms/api/position_realtime?product_id=' + $.pullValue(product, 'id');

  last_loading_timestamp = new Date().valueOf();
  $('.multi-stocks-section').attr('last_loading_timestamp', last_loading_timestamp);
  var cached_postion = $.omsGetLocalJsonData('position_realtime', $.pullValue(product, 'id'), false);
  cached_postion ? (position_stocks = cached_postion, displayStocksList()) : $.getJSON(url).done(function(res) {
    if (!product) {
      return;
    } //如果已经切换到多策略模式，抛弃

    position_stocks = $.pullValue(res, 'data', []);
    displayStocksList();
    !res.code == 0 && $.failNotice(url, res);
  }).fail($.failNotice.bind(null, url));
}

function render() {
  // reset();     
  let list = stock_list;
  if ('marketA' == market) {
    list = list.filter(function(e) {
      return /\.(SZ|SH)$/.test(e.stock_id.toUpperCase());
    })
  } else if ('marketHSH' == market) {
    list = list.filter(function(e) {
      return /\.(HKSH)$/.test(e.stock_id.toUpperCase());
    })
  } else if ('marketHSZ' == market) {
    list = list.filter(function(e) {
      return /\.(HKSZ)$/.test(e.stock_id.toUpperCase());
    })
  }
  //修改 表格头部
  if ('marketA' == market) {
    if (direction == "buy") {
      vm_multi.header_data = tableData_maketA_buy;
    }
    if (direction == "sell") {
      vm_multi.header_data = tableData_maketA_sell;
    }

  } else if ('marketHSH' == market || 'marketHSZ' == market) {

    if (direction == "buy") {
      vm_multi.header_data = tableData_maketH_buy;
    }
    if (direction == "sell") {
      vm_multi.header_data = tableData_maketH_sell;
    }
  }
  //创建表格
  let new_list = filterData(list, vm_multi.header_data);
  vm_multi.table_data = new Array(...vm_multi.header_data);
  // vm_multi.table_data = temp;
  vm_multi.stock_list = new_list;
  vm_multi.total_cash = product.runtime.total_assets; //总资产
  vm_multi.product = product;
  vm_multi.total_max_cash = product.runtime.enable_cash; //剩余最大资金
  vm_multi.direction = direction;
}

function displayStocksList() {
  if (!product.runtime) {
    return;
  }
  if (direction == 'buy') {
    //合并自选股的持仓数据
    combinePositionStocksInfo(stock_list, position_stocks);
    // 购买时，显示自定义股票
    stock_list.length ? mergeFreshStocksInfo(stock_list).then(render) : render();
    return;
  }
  if (direction == 'sell') {
    stock_list = excludeFutures(position_stocks);
    // 卖出时，显示自定义股票
    stock_list.length ? mergeFreshStocksInfo(stock_list).then(render) : render();
    return;
  }
}

function combinePositionStocksInfo(target_stocks, position_stocks) {
  target_stocks.forEach && target_stocks.forEach(function(stock) {
    position_stocks.forEach && position_stocks.forEach(function(position) {
      if (stock.stock_id == position.stock_id) {
        $.extend(stock, position);
      }
    });
  });
}
//动态更新持仓数据
function excludeFutures(list) {
  //排除期货，期货 stock_id 是 708090
  return (list && list.map) ? list.filter(function(stock) {
    return (stock.stock_id != 708090)
  }) : [];
}

function reset() {

  vm_multi.stock_list = [];

  vm_multi.total_cash = 0; //总资产
  vm_multi.product = {};
  vm_multi.total_max_cash = 0; //剩余最大资金
}
//获取五档行情
function update5(request, index) {
  var url = (window.REQUEST_PREFIX || '') + "/oms/helper/stock_detail?stock_id=" + request;
  $.get(url).done(function(res) {
    res.code == 0 && ((list) => {
      if (!vm_multi.stock_list.length) {
        return;
      }
      for (let i = 0; i < list.length; i++) {
        for (let n = 0; n < vm_multi.stock_list.length; n++) {
          if (vm_multi.stock_list[n].stock_id == list[i].stock_id) {
            if (direction == "buy") {
              vm_multi.stock_list[n].deal_price = list[i].ask1_price || 0;
            }
            if (direction == "sell") {
              vm_multi.stock_list[n].deal_price = list[i].bid1_price || 0;
            }
            vm_multi.stock_list[n].ask1_price = list[i].ask1_price || 0; //买一价
            vm_multi.stock_list[n].bid1_price = list[i].bid1_price || 0; //卖一价

            if ('marketA' == market) {
              vm_multi.stock_list[n].entrust_method = "1"; //默认显示市价
            } else {
              vm_multi.stock_list[n].entrust_method = "5"; //默认显示增强
            }
          }
        }
      }

    })($.pullValue(res, 'data'));
    if (1 == res.code) {} else {
      (res.code != 0 || !res.data || !res.data[0]) && failNotice(res);
    }
  }).fail(failNotice).always(function() {

  });

  function failNotice(res) {
    $.omsAlert($.pullValue(res, 'msg', '请求异常'), false);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////
//vue重构

/** 
 * 将数值四舍五入后格式化. 
 * @param num 数值(Number或者String) 
 * @param cent 要保留的小数位(Number) 
 * @param isThousand 是否需要千分位 0:不需要,1:需要(数值类型); 
 * @return 格式的字符串,如'1,234,567.45' 
 * @type String 
 */
function formatNumber(num, cent, isThousand) {
  if (num == undefined) {
    return 0
  }
  num = num.toString().replace(/\$|\,/g, '');

  // 检查传入数值为数值类型  
  if (isNaN(num))
    num = "0";
  // 获取符号(正/负数)  
  let sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入  
  cents = num % Math.pow(10, cent); // 求出小数位数值  
  num = Math.floor(num / Math.pow(10, cent)).toString(); // 求出整数位数值  
  let cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度  

  // 补足小数位到指定的位数  
  while (cents.length < cent)
    cents = "0" + cents;
  if (isThousand) {
    // 对整数部分进行千分位格式化.  
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }
  if (cent > 0)
    return (((sign) ? '' : '-') + num + '.' + cents);
  else
    return (((sign) ? '' : '-') + num);
}
var tableData_maketA_buy = [{
  th: "error_info",
  show_type: "error_icon",
  class_name: "error_info",
  name: " ",

}, {
  th: "checkbox",
  show_type: "checkbox",
  name: "",
  class_name: ""

}, {
  th: "stock_code", //证劵代码
  show_type: 'number',
  name: "证券代码",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "commodity_name",
  show_type: "text",
  name: "产品",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "cost_price",
  show_type: "number",
  name: "成本价",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "total_amount",
  show_type: "number",
  name: "持仓数量",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "market_value",
  show_type: "number",
  name: "市值",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "earning_ratio",
  show_type: "number",
  name: "盈亏率",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "weight",
  show_type: "number",
  name: "当前仓位",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "current_entrust",
  show_type: "number",
  name: "当前挂单",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "entrust_method",
  show_type: "select",
  name: "报价方式",
  option: [{
    value: "1",
    name: "限价"
  }, {
    value: "2",
    name: "市价",
  }],
  class_name: "vue_input_select",
  float: 'right',
  value: 1
}, {
  th: "deal_price",
  show_type: "input",
  name: "买入价格",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "transfer_position",
  show_type: "input_buy_percentage",
  name: "本次调仓",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_commission",
  show_type: "input_buy_deal",
  name: "本次委卖",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入数量'
}];

var tableData_maketA_sell = [{
  th: "error_info",
  show_type: "error_icon",
  class_name: "error_info",
  name: " ",
}, {
  th: "checkbox",
  show_type: "checkbox",
  name: "",
  class_name: ""

}, {
  th: "stock_code", //证劵代码
  show_type: 'number',
  name: "证券代码",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "commodity_name",
  show_type: "text",
  name: "产品",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "cost_price",
  show_type: "number",
  name: "成本价",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "total_amount",
  show_type: "number",
  name: "持仓数量",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "market_value",
  show_type: "number",
  name: "市值",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "earning_ratio",
  show_type: "number",
  name: "盈亏率",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "weight",
  show_type: "number",
  name: "当前仓位",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "current_entrust",
  show_type: "number",
  name: "当前挂单",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "entrust_method",
  show_type: "select",
  name: "报价方式",
  option: [{
    value: "1",
    name: "限价"
  }, {
    value: "2",
    name: "市价",
  }],
  class_name: "vue_input_select",
  float: 'right',
  value: 1
}, {
  th: "deal_price",
  show_type: "input",
  name: "卖出价格",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "total_position",
  show_type: "input_percentage",
  name: "总资产比例",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_position",
  show_type: "input_sell_percentage",
  name: "持仓比例",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_commission",
  show_type: "input_sell_deal",
  name: "本次委卖",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入数量'
}, ];

var tableData_maketH_buy = [{
  th: "error_info",
  show_type: "error_icon",
  class_name: "error_info",
  name: " ",

}, {
  th: "checkbox",
  show_type: "checkbox",
  name: "",
  class_name: ""

}, {
  th: "stock_code", //证劵代码
  show_type: 'number',
  name: "证券代码",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "commodity_name",
  show_type: "text",
  name: "产品",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "cost_price",
  show_type: "number",
  name: "成本价",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "total_amount",
  show_type: "number",
  name: "持仓数量",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "market_value",
  show_type: "number",
  name: "市值",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "earning_ratio",
  show_type: "number",
  name: "盈亏率",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "weight",
  show_type: "number",
  name: "当前仓位",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "current_entrust",
  show_type: "number",
  name: "当前挂单",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "entrust_method",
  show_type: "select",
  name: "报价方式",
  option: [{
    value: "5",
    name: "增强限价买入",
  }, {
    value: "4",
    name: "竞价限价买入"
  }],
  class_name: "vue_input_select",
  float: 'right',
  value: 5
}, {
  th: "deal_price",
  show_type: "input",
  name: "买入价格",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "transfer_position",
  show_type: "input_buy_percentage",
  name: "本次调仓",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_commission",
  show_type: "input_buy_deal",
  name: "本次委买",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入数量'
}];
var tableData_maketH_sell = [{
  th: "error_info",
  show_type: "error_icon",
  class_name: "error_info",
  name: " ",
}, {
  th: "checkbox",
  show_type: "checkbox",
  name: "",
  class_name: ""

}, {
  th: "stock_code", //证劵代码
  show_type: 'number',
  name: "证券代码",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "commodity_name",
  show_type: "text",
  name: "产品",
  class_name: "vue_text_default",
  float: 'left'
}, {
  th: "cost_price",
  show_type: "number",
  name: "成本价",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "total_amount",
  show_type: "number",
  name: "持仓数量",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "market_value",
  show_type: "number",
  name: "市值",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "earning_ratio",
  show_type: "number",
  name: "盈亏率",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "weight",
  show_type: "number",
  name: "当前仓位",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "current_entrust",
  show_type: "number",
  name: "当前挂单",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "entrust_method",
  show_type: "select",
  name: "报价方式",
  option: [{
    value: "5",
    name: "增强限价卖出",
  }, {
    value: "4",
    name: "竞价限价卖出"
  }],
  class_name: "vue_input_select",
  float: 'right',
  value: 5
}, {
  th: "deal_price",
  show_type: "input",
  name: "卖出价格",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "total_position",
  show_type: "input_percentage",
  name: "总资产比例",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_position",
  show_type: "input_buy_percentage",
  name: "持仓比例",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入比例'
}, {
  th: "transfer_commission",
  show_type: "input_sell_deal",
  name: "本次委卖",
  class_name: "vue_input_default",
  float: 'right',
  placeholder: '请输入委卖数量'
}];
//筛选数组
function filterData(arr, filters) {
  let data = [];
  arr.forEach(function(v1) {
    if (v1 instanceof Object) {

      for (let key1 in v1) {
        if (v1[key1] instanceof Object) {
          for (let key2 in v1[key1]) {
            v1[key2] = v1[key1][key2]
          }
          delete v1[key1];
        }
      }
      v1.commodity_name = product.name;
      // v1.target_position = v1.weight ? (v1.weight * 100).toFixed(2) : (0.00).toFixed(2);
      // v1.transfer_position = (0.00).toFixed(2);
      v1.transfer_commission = '';
    }
  })
  return arr;
}
Vue.component('vue-cell-default', {
  props: ["val", "showtype", "checktype", "name", "index", "class_name", "header_data", "earning_ratio_class", "placeholder"],
  template: `
            <div :style="{'text-align':float}">
                <div :class="[class_name]" v-if="my_showtype=='text'" :style="{float:float,color:color}">
                    <span :style="{color:color}">{{myVal}}</span>        
                </div>
                <div :class="[class_name]" v-if="my_showtype=='checkbox'" :style="{float:float,color:color}">
                    <input type="checkbox" @change=checked_change v-model="my_checked_type" name="" value="" >
                </div>
                <template v-if="my_showtype=='input' || my_showtype=='select' || my_showtype=='readyonly'">                        
                    <template v-if="checktype">

                      <template v-if="hidden">
                        <div  class="vue_input_select" style="text-align:right;" :style="{float:float,color:color}">
                          <span>- -</span>
                        </div>
                      </template>
                      <template v-else>
                        <div :class="[class_name]" v-if="my_showtype=='input'" :style="{float:float,color:color}">
                            <span v-show="deal_method">{{deal_method}}</span><input step="any" v-model="input_val" ref="input_text" type="number" @blur="input_blur" :placeholder=placeholder><span v-show="is_percentage">%</span><span v-show="is_deal">股</span>
                        </div>
                        <div :class="[class_name]" v-if="my_showtype=='select'" :style="{float:float,color:color}">
                                <select @change="select_change" :value="val">
                                    <option :value="item.value" v-for="(item,index) in header_data.option">{{item.name}}</option>
                                 </select> 
                        </div>
                        <div :class="[class_name]" v-if="my_showtype=='readyonly'" :style="{float:float,color:color}">
                            <input :value="readyonly_placeholder" type="text" readyonly="readonly" disabled="disabled" style="color:gray;">
                        </div>
                      </template>
                    </template>                    
                    <div v-else  class="vue_input_select" style="text-align:center;" :style="{float:float,color:color}">
                        <span>- -</span>
                    </div>
                </template>
                <div :class="[class_name]" v-if="my_showtype=='error_icon'">
                    <span></span>
                </div> 
                <div class="[class_name]"  v-if="my_showtype=='nubmer'" step="0.01" :style="{color:color,float:float}">
                    <span>{{myVal}}</span>
                </div>
            </div>
        `,
  data: function() {

    return {
      deal_method: false,
      is_percentage: false,
      my_checked_type: this.checktype,
      input_val: this.val,
      my_showtype: '',
      float: '',
      color: 'black',
      myVal: '',
      is_deal: false,
      readyonly_placeholder: "市价",
      hidden: false
    }
  },
  watch: {
    checktype() {
      this.my_checked_type = this.checktype
    },
    val(val) {
      // val = val || 0.0;
      console.log('val change');
      if (this.val == '' || this.val == undefined) {
        this.myVal = '- -';
      } else {
        this.myVal = this.val
      }
      if (this.name == "earning_ratio") {
        if (val == "- -") {
          this.$parent.profittype = "black";
        } else if (val > 0) {
          this.$parent.profittype = "red";
        } else if (val < 0) {
          this.$parent.profittype = "green";
        }
      }

      if (this.name == "cost_price") {
        if (this.val) {
          this.myVla = formatNumber(this.val, 3, 1)
        } else {
          this.myVla = "- -";
        }
      }
      if (this.name == "total_amount") {
        if (this.val) {
          return formatNumber(this.val, 0, 1)
        } else {
          this.myVal = "- -";
        }
      }
      if (this.name == "market_value") {
        if (this.val) {
          this.myVal = formatNumber(this.val, 2, 1)
        } else {
          this.myVal = "- -";
        }
      }
      if (this.name == "earning_ratio") {
        if (this.val) {
          this.myVal = formatNumber(this.val * 100, 2, 0) + "%"
        } else {
          this.myVal = "- -";
        }
      }
      if (this.name == "weight") {
        if (this.val) {
          this.myVal = formatNumber(this.val * 100, 2, 0) + "%"
        } else {
          this.myVal = "- -";
        }
      }
      if (this.name == "current_entrust") {
        if (this.val) {
          this.myVal = formatNumber(this.val, 0, 1)
        } else {
          this.myVal = "- -";
        }
      }
      if (this.name == "target_position" || this.name == "transfer_commission" || this.name == "transfer_position" || this.name == "total_position") {

        this.input_val = val;
      }
      if (this.name == "deal_price") {

        this.input_val = val;
      }
    },
    earning_ratio_class() {
      if (this.name == "market_value") {
        this.color = this.earning_ratio_class;
      }
      if (this.name == "earning_ratio") {
        this.color = this.earning_ratio_class;
      }
    },
    showtype(val) {
      if (this.showtype.indexOf('text') > -1) {
        this.my_showtype = "text";
      }

      if (this.showtype.indexOf('input') > -1) {
        this.my_showtype = "input";
      }
      if (this.showtype.indexOf('checkbox') > -1) {
        this.my_showtype = "checkbox";
      }
      if (this.showtype.indexOf('select') > -1) {
        this.my_showtype = "select";
      }
      if (this.showtype.indexOf('error_icon') > -1) {
        this.my_showtype = 'error_icon';
      }
      this.my_showtype = "text"
    },
    input_val(val) {

    }
  },
  methods: {
    select_change(evt) {
      this.$emit('select_change', this.index, evt.target.value);
    },
    checked_change() {
      this.$emit('check_change', this.my_checked_type)
    },
    input_change() {},
    input_blur() {

      let input_val = this.input_val ? this.input_val : 0;
      //重新计算目标值 本次调仓值  委托数量
      this.$emit('modify_val', this.name, this.input_val)
      this.$emit('input_blur', this.name, this.input_val)
        //目标持仓
      if (this.name != "change_price_target" && this.name != "change_price_position" && this.name != "change_price_total") {
        this.$parent.$parent.wind_contrl_all();
      }
    },
    focus_action() {
      this.$refs.input_text.focus();
    }
  },
  computed: {
    is_percentage() {
      if (this.showtype.indexOf('percentage') > -1) {
        return true;
      } else {
        return false;
      }
    },
    deal_method() {
      if (this.showtype.indexOf('buy') > -1) {
        //return '+'
      } else if (this.showtype.indexOf('sell') > -1) {
        //return '-'
        return false
      } else {
        return false
      }
    },
    is_deal() {
      if (this.showtype.indexOf('deal') > -1) {
        return true;
      } else {
        return false;
      }
    },

  },
  mounted() {
    //当卖出时  默认隐藏持仓比例列
    if (this.$root.direction == "sell") {
      if (this.name == "transfer_position") {
        this.hidden = true;
      }
    }

    this.my_showtype = (() => {
      if (this.showtype.indexOf('text') > -1) {
        return "text";
      }

      if (this.showtype.indexOf('input') > -1) {
        return "input";
      }

      if (this.showtype.indexOf('checkbox') > -1) {
        return "checkbox";
      }

      if (this.showtype.indexOf('select') > -1) {
        return "select";
      }
      if (this.showtype.indexOf('error_icon') > -1) {
        return 'error_icon';
      }
      return "text"
    })()
    if (this.header_data) {
      this.float = this.header_data.float;
    } else {
      this.float = ''
    }
    if (this.val == '' || this.val == undefined) {
      this.myVal = '- -';
    } else {
      this.myVal = this.val
    }
    if (this.name == "earning_ratio" && this.val > 0) {
      this.$parent.earning_ratio_class = "red";
    }
    if (this.name == "earning_ratio" && this.val < 0) {
      this.$parent.earning_ratio_class = "green";
    }
    if (this.name == "cost_price") {
      if (this.val) {
        this.myVal = formatNumber(this.val, 3, 1)
      } else {
        this.myVal = "- -";
      }
    }
    if (this.name == "total_amount") {
      if (this.val) {
        this.myVal = formatNumber(this.val, 0, 1)
      } else {
        this.myVal = "- -";
      }
    }
    if (this.name == "market_value") {
      if (this.val) {
        this.myVal = formatNumber(this.val, 2, 1)
      } else {
        this.myVal = "- -";
      }
    }
    if (this.name == "earning_ratio") {
      if (this.val) {
        this.myVal = formatNumber(this.val * 100, 2, 0) + "%"
      } else {
        this.myVal = "- -";
      }
    }
    if (this.name == "weight") {
      if (this.val) {
        this.myVal = formatNumber(this.val * 100, 2, 0) + "%"
      } else {
        this.myVal = "- -";
      }
    }
    if (this.name == "current_entrust") {
      if (this.val) {
        this.myVal = formatNumber(this.val, 0, 1)
      } else {
        this.myVal = "- -";
      }
    }

  }

})

Vue.component('vue-row-header', {
  props: ["header_data", "list_data", "checkall"],
  template: `
            <thead>
            <tr class="top_tr">
              <template v-for="(item,index) in header_data">
                <th v-if="index==0">
                    <div class="error_info"><span style="display:none;"></span></div>
                </th>
                <th v-if="index==1"><vue-cell-default  @check_change="check_change" val=item.name showtype="checkbox"  :header_data=item :checktype="checkall"></vue-cell-default></th>
                <th v-if="index>1" :style="index==0 || index==1?'':'flex:1;'"><vue-cell-default  :val=item.name showtype="text"  class_name="vue_text_default" :header_data=item ></vue-cell-default></th>
              </template>
              <th>&nbsp&nbsp</th>
            </tr>
            </thead>
        `,
  data: function() {
    return {

    }
  },
  methods: {
    check_change(val) {
      this.$emit('check_all', val);

    }
  },
  mounted() {


  },
  updated() {

  },
});
Vue.component('vue-row-tr', {
  props: ["header_data", "stock", "transfer_position_all", "target_position_all", "checktype", "index", "delete_show", "odd_price", "error_obj", "radio_type"],
  template: `
            <tr :class="{error:error_obj.type,line:line_type}" @mouseenter="mouseenter" @mouseleave="mouseleave">
                <template v-for="(item,index) in header_data">
                    <td v-if="index==0">
                    <div class="error_info"><span v-show=error_obj.type></span></div>
                    </td>
                    <td v-else :style="index==1?'':'flex:1;'"><vue-cell-default :placeholder=header_data[index].placeholder @modify_val=modify_val @check_change=check_change @select_change=select_change  :name=item.th :val="stock[item.th]" :earning_ratio_class="earning_ratio_class" :showtype=item.show_type :class_name=item.class_name :header_data=item  :checktype="checktype"  :index=index :ref="item.th"></vue-cell-default></td>
                </template>
                <td><vue-error-ele :delete_show="delete_show" @delete_stock=delete_stock :isshow="error_show" :error_info="error_obj.error_info"></vue-error-ele></td>
            </tr>
        `,
  data: function() {
    return {
      profittype: '',
      line_type: false,
      earning_ratio_class: "black",
      is_loading: false,
      error_show: false
    }
  },
  watch: {
    target_position_all(val) {
      if (this.checktype) {
        this.stock["target_position"] = this.val;
      }
    },
    transfer_position_all() {
      if (this.checktype) {
        this.stock["transfer_position"] = this.val;
      }
    },
    stock(ele) {
      if (this.$root.direction == "buy") {
        this.stock.deal_price = ele.ask1_price;
      } else {
        this.stock.deal_price = ele.bid1_price;
      }
    },
    checktype(val) {
      //勾选时 重新计算价格
      if (val) {
        var stock_num;
        if (this.$root.direction == "buy") {
          let transfer_position = this.$root.change_price_position_value / 100;
          let stock = this.stock;
          let current_positon = stock.weight ? stock.weight : 0;
          let weight_total_assets = this.$root.total_cash;
          let deal_price = stock.deal_price ? stock.deal_price : 0;
          let trading_unit = stock.trading_unit ? stock.trading_unit : 0
          if (!deal_price) {
            //成本价格为0
            return
          }
          stock_num = parseInt((transfer_position) * weight_total_assets / deal_price / trading_unit) * trading_unit;
          stock.transfer_commission = stock_num;
          //stock.transfer_position = (transfer_position * 100).toFixed(2);
        }

        if (this.$root.direction == "sell") {
          let transfer_position = this.$root.change_price_position_value / 100;
          let stock = this.stock;
          let current_positon = stock.total_amount ? stock.total_amount : 0;
          let trading_unit = stock.trading_unit ? stock.trading_unit : 0
          stock_num = parseInt(transfer_position * current_positon / trading_unit) * trading_unit
          stock.transfer_commission = stock_num;
          // stock.transfer_position = (transfer_position * 100).toFixed(2);
        }

      }
    },
    radio_type(val) {
      //神操作 点击下面的radio 选择让td隐藏
      if (this.$root.direction == "sell") {
        if (val == "total") {
          this.$refs.transfer_position[0].hidden = true;
          this.$refs.total_position[0].hidden = false;
        }

        if (val == "equal") {
          this.$refs.transfer_position[0].hidden = false;
          this.$refs.total_position[0].hidden = true;
        }
      }



    }
  },
  methods: {
    modify_val(name, val) {
      this.stock[name] = val;
      val = val ? val : 0;

      if (this.$root.direction == 'buy') {

        //通过本次调仓 计算委托价格
        if (name == "transfer_position") {
          let transfer_position = val / 100;
          let stock = this.stock;
          let current_positon = stock.weight ? stock.weight : 0;
          let weight_total_assets = this.$root.total_cash;
          let deal_price = stock.deal_price ? stock.deal_price : 0;
          let trading_unit = stock.trading_unit ? stock.trading_unit : 100;
          let stock_num = parseInt(transfer_position * weight_total_assets / deal_price / trading_unit) * trading_unit;

          //判断委托数量是否正确
          if (stock_num < 0) {
            // console.log(' 计算错误');
            // this.error_obj.type = true;
            // this.error_obj.error_info = "输入有误，请检查后重新输入";
            return
          } else {
            this.error_obj.type = false;
            this.error_obj.error_info = "";
            stock.transfer_commission = stock_num;
          }
        }
      }


      if (this.$root.direction == 'sell') {
        //本次调仓比例计算 本次委卖数量
        if (name == "transfer_position") {
          var transfer_position = val / 100;
          var stock = this.stock;
          var current_amout = parseInt(stock.total_amount);

          //   let stock_num = parseInt(transfer_position * stock.weight_total_assets/stock.deal_price /stock.trading_unit)*stock.trading_unit;
          // var stock_num = current_amout /current_positon *100 * transfer_position*100 -entrust_sell_num;
          var stock_num = parseInt(current_amout * transfer_position / stock.trading_unit) * stock.trading_unit
            //判断委托数量是否正确
          if (stock_num < 0) {
            // this.error_obj.type = true;
            // this.error_obj.error_info = "输入有误，请检查后重新输入";
            return
          } else {
            this.error_obj.type = false;
            this.error_obj.error_info = "";
            stock.transfer_commission = stock_num;
          }
        }
        //卖出时 总资产比例 计算本次委卖数量
        if (name == 'total_position') {
          var total_position = val / 100;
          var stock = this.stock;
          var new_price = (+stock.market_value) / (+stock.total_amount); //根据市值计算最新价
          var last_price = (+stock.last_price) || 0;
          var total_cash = this.$root.total_cash;
          var stock_num = (+total_cash) * total_position / new_price;
          stock.transfer_commission = parseInt(stock_num / stock.trading_unit) * stock.trading_unit;
        }
      }
      if (name == "transfer_commission") {
        val = val ? val : 0;
        var stock = this.stock;
        var stock_num = parseInt(val / stock.trading_unit) * stock.trading_unit;
        // this.input_val = Math.abs( num );
        this.stock.transfer_commission = stock_num;
        //判断委托数量是否正确
        if (stock_num < 0) {
          // this.error_obj.type = true;
          // this.error_obj.error_info = "输入有误，请检查后重新输入";
          return
        } else {
          this.error_obj.type = false;
          this.error_obj.error_info = "";
        }
      }
    },
    check_change(val) {
      this.$emit('check_change', this.index, val);
    },
    select_change(index, val) {
      this.stock.entrust_method = val;
      if (val == "2") {
        this.$refs.deal_price[0].my_showtype = 'readyonly';
        this.stock.deal_price = this.stock.last_price * 1.1;

      } else {
        this.$refs.deal_price[0].my_showtype = 'input';
        if (this.$root.direction == "buy") {
          this.stock.deal_price = this.stock.bid1_price;
          this.$refs.deal_price[0].input_val = this.stock.ask1_price 
        }
        if (this.$root.direction == "sell") {
          this.stock.deal_price = this.stock.ask1_price;
          this.$refs.deal_price[0].input_val = this.stock.bid1_price;
        }
      }

    },
    delete_stock() {
      if (this.is_loading) {
        return;
      }
      var stock_id = this.stock.stock_id;
      var url = (window.REQUEST_PREFIX || '') + '/user/stock-follow/delete';
      this.is_loading = true;
      $.post(url, {
        stock_id: stock_id
      }).done(function(res) {
        if (res.code == 0) {
          $.omsAlert('删除自选股 ' + stock_id + ' 成功！');
          $(window).trigger({
            type: 'create_order:multi_stocks:delete_stock',
            stock: {
              stock_id: stock_id
            }
          });
        } else {
          $.failNotice(url, res);
        }
      }).fail($.failNotice.bind(null, url)).always(function() {
        this.is_loading = false;
      });
    },
    mouseenter() {
      //鼠标移入 显示风控提示
      if (this.error_type) {
        this.error_show = true;
      }
    },
    mouseleave() {
      this.error_show = false;
    },

  }
})

Vue.component('vue-multi-tbody', {
  props: ["header_data", "list_data", "total_cash", "target_position_all", "transfer_position_all", 'direction', "total_max_cash", "delete_show", "radio_type"],
  watch: {},
  template: `
          <table class="nothing-nothing buy batch_list">
            <vue-row-header @check_all=check_all :header_data="header_data" :list_data="list_data" :checkall="checkall" ></vue-row-header>
            <tbody >
              <template v-for="(stock,index) in  list_data" >
                <vue-row-tr :radio_type=radio_type @check_change=check_change :delete_show=delete_show :header_data="header_data" :stock="stock" :error_obj="error_arr[index]"  :checktype="checkArr[index]" :odd_price="odd_arr[index]" :target_position_all="target_position_all" :transfer_position_all="transfer_position_all" :index="index" ></vue-row-tr>
              </template>
            </tbody>
            <template v-if="direction == 'buy' ">
              <thead>
                <tr class="total_tr">
                  <th>
                      <div class="error_info"><span style="display:none;"></span></div>
                  </th>
                  <th></th>
                  <th style="flex:1;text-align:left;">汇总</th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;text-align:left;">{{weight_total}}<span if-show="weight_total">%</span></th>
                  <th style="flex:1;text-align:center;padding-right:12px;">{{current_entrust_total}}</th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;">{{transfer_position_total}}<span if-show="transfer_position_total">%</span></th>
                  <th style="flex:1;">{{transfer_commission_total}}</th>
                </tr> 
              </thead>
            </template>
            <template v-if="direction == 'sell' ">
              <thead>
                <tr class="total_tr">
                  <th>
                      <div class="error_info"><span style="display:none;"></span></div>
                  </th>
                  <th></th>
                  <th style="flex:1;text-align:left;">汇总</th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;text-align:left;">{{weight_total}}<span if-show="weight_total">%</span></th>
                  <th style="flex:1;text-align:center;padding-right:12px;">{{current_entrust_total}}</th>
                  <th style="flex:1;"></th>
                  <th style="flex:1;"></th>
                  <template v-if="radio_type=='total'">
                    <th style="flex:1;">{{transfer_total_total}}<span if-show="transfer_total_total">%</span></th>
                  </template>
                  <template v-else>
                    <th style="flex:1;">- -</th>
                  </template>
                  <template v-if="radio_type=='equal'">
                    <th style="flex:1;">{{transfer_position_total}}<span if-show="transfer_position_total">%</span></th>
                  </template>
                  <template v-else>
                    <th style="flex:1;">- -</th>
                  </template>
                  
                  <th style="flex:1;">{{transfer_commission_total}}</th>
                </tr> 
              </thead>
            </template>

          </table>
        `,
  data: function() {
    return {
      "weight_total": 0, //总仓位
      "current_entrust_total": 0, //当前挂单
      "target_position_total": 0, //目标仓位
      "transfer_position_total": 0, //本次调仓
      "transfer_commission_total": 0, //本次委买
      "transfer_total_total": 0, //按相同总资产比例
      "checkref": "checkbox",
      "my_total_cash": this.total_cash,
      "checkall": false,
      "checklen": this.list_data.length,
      "checknum": 0,
      "checktr": false,
      "checkArr": [],
      "my_total_max_cash": this.total_max_cash,
      "odd_arr": [],
      "error_arr": [],
    }
  },
  watch: {

    list_data(val) {
      this.checklen = val.length
      this.checkArr = new Array(val.length);
      for (let i = 0; i < this.checkArr.length; i++) {
        this.checkArr[i] = false;
      }
      this.checkall = false;
      this.odd_arr = new Array(val.length);
      for (let i = 0; i < this.odd_arr.length; i++) {
        this.odd_arr[i] = 0;
      }
      this.error_arr = new Array(val.length);
      for (let i = 0; i < this.error_arr.length; i++) {
        this.error_arr[i] = {
          type: false,
          error_info: ""
        };
      }
      this.my_total_max_cash = this.total_max_cash;
      this.my_total_cash = this.total_cash
        //股票数据改变获取新的委托数量
      this.update_entrust_info();
    },
    checkArr() {
      //当checkbox改变 调用整体风控
      this.wind_contrl_all();
    },
  },
  mounted() {
    this.checkArr = new Array(this.checklen);
    for (let i = 0; i < this.checkArr.length; i++) {
      this.checkArr[i] = false;
    }
    this.odd_arr = new Array(this.checklen);
    for (let i = 0; i < this.odd_arr.length; i++) {
      this.odd_arr[i] = 0;
    }
  },
  methods: {
    check_all(val) {

      this.checkall = val;
      this.checkArr = new Array(this.checklen);
      for (let i = 0; i < this.checkArr.length; i++) {
        this.checkArr[i] = val;
      }
      //添加吸顶的全选状态改变
      //$(this.$root.header_tr).find(':checkbox')[0].checked = val;

    },
    check_change(index, val) {
      this.checkArr = new Array(...this.checkArr);
      this.checkArr[index] = val;

      let bool = true;

      this.checkArr.forEach(function(ele) {
        if (ele == false) {
          bool = false;
        }
      })
      this.checkall = bool;
    },
    onec_adjustment() {
      this.my_total_max_cash = this.$root.total_max_cash;
      //清空tr中的交易金额
      for (let i = 0; i < this.odd_arr.length; i++) {
        this.odd_arr[i] = 0;
      }
      this.error_arr.forEach(function(ele) {
          ele.type = false;
          ele.error_info = '';
        })
        //一键调整
      var len = this.checkArr.length;
      for (let i = 0; i < len; i++) {
        if (this.checkArr[i]) {
          //使用tr中的委托数进行一键调整 传 stock的数组序号🈴和当前的委托数目
          // this.wind_contrl_op(i, this.list_data[i].transfer_commission)
        }
      }
    },
    wind_contrl_all() {

      //  统计数据
      this.weight_total = 0;
      this.current_entrust_total = 0;
      this.target_position_total = 0;
      this.transfer_position_total = 0;
      this.transfer_commission_total = 0;
      this.transfer_total_total = 0;
      var total_amount = 0;
      //计算统计
      for (let i = 0; i < this.checkArr.length; i++) {
        if (this.checkArr[i]) {

          this.weight_total += this.list_data[i].weight * 100 || 0;
          this.current_entrust_total += parseFloat(this.list_data[i].current_entrust) || 0;
          this.target_position_total += parseFloat(this.list_data[i].target_position) || 0;
          this.transfer_position_total += parseFloat(this.list_data[i].transfer_position) || 0;
          this.transfer_commission_total += parseFloat(this.list_data[i].transfer_commission) || 0;
          this.transfer_total_total += parseFloat(this.list_data[i].total_position) || 0

          total_amount += parseFloat(this.list_data[i].total_amount) || 0;

        }
      }



      this.weight_total = this.weight_total.toFixed(2);
      this.current_entrust_total = formatNumber(this.current_entrust_total, 0, 1);
      this.target_position_total = this.target_position_total.toFixed(2);
      this.transfer_position_total = this.transfer_position_total.toFixed(2);
      this.transfer_total_total = this.transfer_total_total.toFixed(2);
      //修改持仓比例汇总
      if (this.$root.direction == "sell") {
        if (total_amount == 0) {
          total_amount = 1;
        }
        this.transfer_position_total = (this.transfer_commission_total / total_amount * 100).toFixed(2);
      }
    },
    submit_stock_tbody() {
      //指令确认
      let orders = [];
      let obj = {}
      let len = this.list_data.length;
      var self = this;
      this.checkArr.forEach(function(ele, index) {
        if (ele) {
          if (self.list_data[index]["transfer_commission"] > 0) {
            obj = {
              price: self.list_data[index]['deal_price'],
              trade_direction: self.$root.direction,
              trade_mode: self.list_data[index].entrust_method || 2,
              market: self.list_data[index].market,
              volume: self.list_data[index]["transfer_commission"],
              stock_id: self.list_data[index].stock_id,
              stock_name: self.list_data[index].stock_name
            }
            orders.push(obj);
          }
        }
      })


      var url = (window.REQUEST_PREFIX || '') + '/oms/workflow/' + product.id + '/add_multi_hand_order';

      if (orders.length) {
        var is_trade_day = $.pullValue($('.trade-5').getCoreData(), 'is_trade_day');
        //这里新增二次提醒
        var htmlArr = [];
        var totalAmount = 0;
        var totalVolume = 0;
        orders.forEach(function(e) {
          var ins_price = e.price;
          ins_price = ('' == ins_price) ? 0 : ins_price;
          if (e.trade_direction == "buy") {
            e.trade_direction = 1;
          } else {
            e.trade_direction = 2;
          }
          var ins_type = e.trade_direction; //1买入 2卖出
          // var trade_market = 1;
          var typeStr1 = '';
          if (1 == ins_type) {
            typeStr1 = '<span style="color:#F44336;">买入</span>';
          } else if (2 == ins_type) {
            typeStr1 = '<span style="color:#2196F3">卖出</span>';
          }
          var ins_model = e.trade_mode; //限价、市价，市价时，价格切记传空
          var typeStr2 = '';
          if ('marketA' == market) {
            if ("1" == ins_model) {
              typeStr2 = '限价';
              if (0 == ins_price) {
                ins_model = utils.stock_custom.getMarketType(e.stock_id.match(/[a-zA-Z]+/));
                e.trade_mode = ins_model;
                typeStr2 = '市价';
                e.trade_mode = 2;
              }
              e.trade_mode = 1;
            } else if ("2" == ins_model) {
              // ins_price = 0;
              ins_model = utils.stock_custom.getMarketType(e.stock_id.match(/[a-zA-Z]+/));
              e.trade_mode = ins_model;
              typeStr2 = '市价';
              e.trade_mode = 2;
            }
            e.market = 1;
          } else if ('marketHSH' == market) {
            // trade_market = 2;
            //e.trade_mode = e.marketH_trade_mode;
            if (e.trade_mode == 5) {
              typeStr2 = '增强限价'
            } else if (e.trade_mode == 4) {
              typeStr2 = '竞价限价'
            }
            e.market = 2;
          } else if ('marketHSZ' == market) {
            // trade_market = 2;
            //e.trade_mode = e.marketH_trade_mode;
            if (e.trade_mode == 5) {
              typeStr2 = '增强限价'
            } else if (e.trade_mode == 4) {
              typeStr2 = '竞价限价'
            }
            e.market = 3;
          }
          var tmpInsVolume = e.volume;
          var tmpInsAmount = Number((10000 * ins_price).toFixed(2)) * tmpInsVolume / 10000;
          totalAmount = (parseFloat(totalAmount) * 10000 + parseFloat(tmpInsAmount) * 10000) / 10000;
          totalVolume = parseFloat(totalVolume) + parseFloat(tmpInsVolume);
          var priceStr = (('市价' == typeStr2) ? utils.common.getData(PRICE_TYPE_LIST, ins_model) : ins_price);
          htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left">' + e.stock_id + ' ' + e.stock_name + '</td>' +
            '<td class="cell-left">' + typeStr1 + '</td>' +
            '<td class="cell-left">' + typeStr2 + '</td>' +
            '<td class="cell-right" style="max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + priceStr + '">' + priceStr + '</td>' +
            '<td class="cell-right">' + tmpInsVolume + '</td>' +
            '<td class="cell-right">' + tmpInsAmount + '</td></tr>');
        });
        var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;"><tr><th class="cell-left">证券</th>' +
          '<th class="cell-left">买卖标志</th>' +
          '<th class="cell-left">报价方式</th>' +
          '<th class="cell-right">指令价格</th>' +
          '<th class="cell-right">交易数量(股)</th>' +
          '<th class="cell-right">交易金额(元)</th></tr>' + htmlArr.join('') + '</tbody></table>' +
          '<div class="custom_total"><span style="color:#999999;font-size:13px;">总计</span><span>' + totalVolume + '</span><span>' + totalAmount + '</span></div>';
        if (0 == is_trade_day) { //0是休市时间，也就是非交易日或者是交易日的15点之后 1为非休市时间
          confirmHtml += '<div style="color:#F44336;font-size: 14px;padding-bottom: 3px;">*当前为休市时间，指令将提交至下一交易日</div>'
        }
        $.confirm({
          title: '指令确认 <span style="margin-left:10px;font-size: 14px;font-weight: normal;">策略：' + $('.multi-product-head').find('input[type="checkbox"]:checked').siblings('span[data-src="name"]').html() + '</span>',
          content: confirmHtml,
          closeIcon: true,
          confirmButton: '确定',
          cancelButton: false,
          confirm: function() {
            if ($.isLoading()) {
              return;
            }
            $.startLoading('正在提交订单...');

            $.post(url, {
              multi: orders
            }).done(function(res) {
              if (res.code == 0) {
                //reportResult(res);
                self.submit_result(res, orders);
                $(window).trigger({
                  type: 'add_multi_hand_order:success',
                  res: res
                });
                $(window).trigger({
                  type: 'position_update_updated'
                });
                $(window).trigger({
                    type: 'multi_batch:create_order:finish'
                  }) //触发委托列表刷新
              } else {
                self.submit_result(res, orders);
              }
            }).fail($.failNotice.bind(null, url)).always(function() {
              $.clearLoading();

            });
          }
        });
      } else {
        $.omsAlert("提交失败，请检查！", false);
      }
    },
    wind_contrl_op(index, num) {
      //一键调整操作
      // if (num == 0) {
      //   return;
      // }
      // if (this.$root.direction == "buy") {
      //   // var tbody = this.$parent;
      //   var current_total_max_cash = this.my_total_max_cash;
      //   // let len = tbody.list_data.length;
      //   for (var i = 0; i < this.checkArr.length; i++) {
      //     if (this.checkArr[i] == true) {
      //       if (i != index) {
      //         current_total_max_cash -= this.odd_arr[i]
      //       }
      //     }
      //   }
      // }
      // //获取最大交易金额
      // var enable_cash = this.enable_cash
      // var price_type = 1
      // var stock = this.list_data[index];
      // var price = stock.deal_price;
      // var product = this.$root.product;
      // var all_market_value = 0;
      // window.risk_position[product.id].data.forEach(function(el) {
      //   if (el.stock_id == stock.stock_id) {
      //     let total_amount = el.total_amount;
      //     let market_value = el.market_value;
      //   }
      //   all_market_value += el.market_value - 0;
      // });
      // enable_cash = enable_cash ? enable_cash : product.runtime.enable_cash;
      // if (product) {
      //   var obj = riskCheck.checkRules({
      //     product_id: product.id, // 产品id， id
      //     // 交易数据 form_data
      //     trade_direction: direction == "buy" ? 1 : 2, // 交易方向，1买入 2卖出 trade_direction
      //     trade_mode: price_type, // 1限价／2市价  trade_mode
      //     volume: num, // 交易数量
      //     price: price, // 限价金额
      //     surged_limit: 1, // 涨停价 price已经做了处理了
      //     decline_limit: 1, // 跌停价 price已经做了处理了
      //     stock_code: stock.stock_id, // 股票code，包含“.SZ”,比较的时候最好都进行小写转换
      //     stock_name: stock.stock_name, // 股票名称，用于判断st股票
      //     // 产品的数据 product
      //     total_assets: product.runtime.total_assets, // 资产总值 runtime.total_assets
      //     enable_cash: current_total_max_cash, // 可用资金 runtime.enable_cash
      //     security: all_market_value, // 持仓市值 runtime.security 改为 all_market_value
      //     net_value: product.runtime.net_value, // 当日净值 runtime.net_value
      //     // 持仓数据
      //     market_value: stock.market_value, // 本股票持仓市值 //window.position_realtime里面有
      //     total_amount: stock.total_amount, // 该股票当前持仓数
      //     enable_sell_volume: 0 // 该股票能卖的数量
      //   });
      //   if (obj.code == 0) {
      //     this.error_arr[index].type = false;
      //     this.odd_arr[index] = num * price;
      //   } else {
      //     this.error_arr[index].type = true;
      //     stock.transfer_commission = obj.freeNum;
      //     this.error_arr[index].type = false;
      //     this.odd_arr[index] = obj.freeNum * price;
      //   }
      // }
    },
    wind_contrl(index, num) {
      //当行风控
      //当前可用余额
      if (num == 0) {
        return;
      }
      if (this.$root.direction == "buy") {
        var current_total_max_cash = this.my_total_max_cash
          // let len = tbody.list_data.length;

        for (var i = 0; i < this.checkArr.length; i++) {
          if (this.checkArr[i] == true) {
            if (i != this.index) {
              current_total_max_cash -= this.odd_arr[i]
            }
          }
        }
      }
      if (num == 0) {
        this.error_arr[index] = true;
        this.error_info = '当前购买股票不足100股，请修改！';
        return
      }
      if (num < 0) {
        this.error_arr[index] = true;
        this.error_info = '输入有误，请检查后重新输入';
        return
      }
      let stock = this.list_data[index];
      // let price_type = this.price_method=="limit_price"?1:2;
      let price_type = 1;
      let price = stock.deal_price;
      let product = this.$root.product;
      let all_market_value = 0;
      window.risk_position[product.id].data.forEach(function(el) {
        if (el.stock_id == stock.stock_id) {
          let total_amount = el.total_amount;
          let market_value = el.market_value;
        }
        all_market_value += el.market_value - 0;
      });
      if (product) {
        var obj = riskCheck.checkRules({
          product_id: product.id, // 产品id， id
          // 交易数据 form_data
          trade_direction: this.$root.direction == "buy" ? 1 : 2, // 交易方向，1买入 2卖出 trade_direction
          trade_mode: price_type, // 1限价／2市价  trade_mode
          volume: num, // 交易数量
          price: price, // 限价金额
          surged_limit: 1, // 涨停价 price已经做了处理了
          decline_limit: 1, // 跌停价 price已经做了处理了
          stock_code: stock.stock_id.toLowerCase(), // 股票code，包含“.SZ”,比较的时候最好都进行小写转换
          stock_name: stock.stock_name, // 股票名称，用于判断st股票
          // 产品的数据 product
          total_assets: product.runtime.total_assets, // 资产总值 runtime.total_assets
          enable_cash: current_total_max_cash, // 可用资金 runtime.enable_cash
          security: all_market_value, // 持仓市值 runtime.security 改为 all_market_value
          net_value: product.runtime.net_value, // 当日净值 runtime.net_value
          // 持仓数据
          market_value: stock.market_value || 0, // 本股票持仓市值 //window.position_realtime里面有
          total_amount: stock.total_amount || 0, // 该股票当前持仓数
          enable_sell_volume: 0, // 该股票能卖的数量
          trading_unit: stock.trading_unit //每手数量
        });
        console.log("风控提示", obj);
        if (obj.code == 0) {
          let error_arr = new Array(...this.error_arr);
          error_arr[index].type = false;
          this.error_arr = error_arr;
          this.odd_arr[this.index] = num * price;
        } else {
          this.odd_arr[this.index] = num * price;
          let error_arr = new Array(...this.error_arr);
          error_arr[index].type = true;
          error_arr[index].error_info = obj.msg + ' 当前可买数量：' + obj.freeNum + '';
          this.error_arr = error_arr;
        }
      }
    },
    change_price_target: function(val) {
      //批量修改目标仓位
    },
    change_price_position(val) {
      //批量修改本次调仓
      //let self = this;
      this.my_total_max_cash = this.$root.total_max_cash;
      this.list_data.forEach(function(ele) {
        ele.transfer_commission = 0;
      })
      this.odd_arr.forEach(function(ele) {
        ele = 0;
      })
      this.error_arr.forEach(function(ele) {
          ele.type = false;
          ele.error_info = '';
        })
        //批量修改时 重置重大可交易金额
        //批量修改时 将委托数量 置为零
      for (let i = 0; i < this.checkArr.length; i++) {
        if (this.checkArr[i]) {

          let stock = this.list_data[i];
          let transfer_position = val / 100;
          let current_positon = stock.weight ? stock.weight : 0;
          let weight_total_assets = this.total_cash;
          let deal_price = stock.deal_price ? stock.deal_price : 0;
          let trading_unit = stock.trading_unit ? stock.trading_unit : 0
          stock.transfer_position = val;
          if (!deal_price) {
            //成本价格为0
            continue
          }
          let stock_num; //委托数量
          if (this.$root.direction == "buy") {
            var stock_num = parseInt((transfer_position) * weight_total_assets / deal_price / trading_unit) * trading_unit;
          }
          if (this.$root.direction == "sell") {
            var current_amout = parseInt(stock.total_amount);
            var stock_num = parseInt(transfer_position * current_amout / trading_unit) * trading_unit
          }
          //判断委托数量是否正确
          if (stock_num < 0) {
            console.log(' 计算错误');
            this.error_arr[i].type = true;
            this.error_arr[i].error_info = "输入有误，请检查后重新输入";
            return
          } else {
            this.error_arr[i].type = false;
            this.error_arr[i].error_info = "";
            stock.transfer_commission = stock_num;
          }
        }
      };
      this.wind_contrl_all();
    },
    change_price_total(val) {
      //批量修改总资产比例调仓
      this.my_total_max_cash = this.$root.total_max_cash;
      this.list_data.forEach(function(ele) {
        ele.transfer_commission = 0;
      })
      this.odd_arr.forEach(function(ele) {
        ele = 0;
      })
      this.error_arr.forEach(function(ele) {
          ele.type = false;
          ele.error_info = '';
        })
        //批量修改时 重置重大可交易金额
        //批量修改时 将委托数量 置为零
      for (let i = 0; i < this.checkArr.length; i++) {
        if (this.checkArr[i]) {
          let total_position = val / 100;
          let stock = this.list_data[i];
          let new_price = (+stock.market_value) / (+stock.total_amount); //根据市值计算最新价
          let last_price = (+stock.last_price) || 0;

          let total_cash = this.$root.total_cash;
          let stock_num = (+total_cash) * total_position / new_price;
          stock.total_position = val;
          //判断委托数量是否正确
          if (stock_num < 0) {
            console.log(' 计算错误');
            this.error_arr[i].type = true;
            this.error_arr[i].error_info = "输入有误，请检查后重新输入";
            return
          } else {
            this.error_arr[i].type = false;
            this.error_arr[i].error_info = "";
            stock.transfer_commission = stock_num;
          }
          stock.transfer_commission = parseInt(stock_num / stock.trading_unit) * stock.trading_unit;
        }
      };
      this.wind_contrl_all();
    },
    submit_result(res, orders) {
      // res = {
      //   "code": 0,
      //   "msg": "",
      //   "data": {
      //     "000017.SZ": {
      //       "code": 5022111,
      //       "msg": "",
      //       "data": {
      //         "msg": [
      //           "已触发风控:0329股票池禁止买入",
      //           "已触发风控(公司):0329股票池禁止买入"
      //         ],
      //         "limit_action": 0
      //       }
      //     },
      //     "000023.SZ": {
      //       "code": 5022111,
      //       "msg": "",
      //       "data": {
      //         "msg": [
      //           "已触发风控:0329股票池禁止买入",
      //           "已触发风控(公司):0329股票池禁止买入"
      //         ],
      //         "limit_action": 0
      //       }
      //     }
      //   }
      // }
      orders.forEach(function(row) {
        if (res.code == 0) {
          row.btnType = false;
          row.msg = ["委托成功"];
          row.entrustStatus = "pass";
          row.style = {}
        } else if(res.code == 5022111){
            if (res.data[row.stock_id]) {
              let temp = res.data[row.stock_id];
              if (temp.code == 0) {
                //没问题
                row.btnType = false;
                row.msg = ["委托成功"];
                row.entrustStatus = "pass";
                row.style = {
                }
              } else if (temp.code == 5022111) {
                //提示性风控
                if (temp.msg == "") {
                  if (temp.data.limit_action == 0) {
                    //alert
                    row.btnType = true;
                    row.msg = temp.data.msg;
                    row.entrustStatus = "alert";
                    row.style = {
                      color: "#FAA11F"
                    }
                  } else {
                    //购买失败
                    row.btnType = false;
                    row.entrustStatus = "fail";
                    row.style = {
                      color: "red"
                    }
                    if (temp.msg == "") {
                      row.msg = temp.data.msg;
                    } else {
                      row.msg = [temp.msg];
                    }
                    row.msg.unshift("委托失败");
                  }
                } else {
                  //购买失败
                  row.btnType = false;
                  row.entrustStatus = "fail";
                  row.style = {
                    color: "red"
                  }
                  if (temp.msg == "") {
                    row.msg = []
                  } else {
                    row.msg = [temp.msg];
                  }
                  row.msg.unshift("委托失败");
                }
              } else {
                //禁止性风控
                row.btnType = false;
                

                if(temp.msg && temp.msg !=""){
                  row.msg = [temp.msg];
                }else if(temp.data.msg){
                  row.msg = temp.data.msg;
                }else{
                  row.msg = []
                }
                row.msg.unshift("委托失败");
                row.entrustStatus = "fail";
                row.style = {
                  color: "red"
                }
              }
            } else {
              row.btnType = false;
              row.entrustStatus = "pass";
              row.msg = ["委托成功"];
              row.style = {

              }
            }
        }else {
          //购买失败
          row.btnType = false;
          row.entrustStatus = "fail";
          row.style = {
            color: "red"
          }
          if (res.msg == "") {
            row.msg = [];
          } else {
            row.msg = [res.msg];
          }
          row.msg.unshift("委托失败");
        }
      })
      let product = this.$root.product;
      console.log(orders);
      let contentChild = Vue.extend({
        data() {
          return {
            tableData: orders,
            product:product
          }
        },
        template: `
          <div style="position:relative">
          <span style="position: absolute;top: -36px;left: 91px;font-size:12px;">产品账户：{{product.name}}</span>
          <div class="vue-form-confirmation">
              <table style="max-width: 600px;">
                  <thead>
                      <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                          <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">证券</th>
                          <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">买入价格</th>
                          <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">买入数量</th>
                          <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">备注</th>

                      </tr>
                  </thead>
                  <tbody>
                      <tr  v-for="row in tableData" style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                          <td class="vue-form-confirmation__text-align-left">{{row.stock_name}}</td>
                          <td class="vue-form-confirmation__text-align-left">{{row.price}}</td>
                          <td class="vue-form-confirmation__text-align-left">{{row.volume}}</td>
                          <td class="vue-form-confirmation__text-align-left vue-form-confirmation__span-center" >
                              <div>
                                  <span :style=row.style>
                                      <template v-for="msg in row.msg">
                                          {{msg}}</br>
                                      </template>
                                  </span>  
                                  <button type="" v-if="row.btnType" @click=btn_submit(row)>继续委托</button>
                              </div>

                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>
            </div>
          `,
        methods: {
          btn_submit(row) {
            //忽略提示性风控 继续购买
            let _this = this;
            let orders = [row]
            var url = (window.REQUEST_PREFIX || '') + '/oms/workflow/' + product.id + '/add_multi_hand_order';
            $.post(url, {
              multi: orders,
              ignore_tips:1,
            }).done(function(res) {
              if (res.code == 0) {
                if (res.data == '') {
                  row.btnType = false;
                  row.entrustStatus = "pass";
                  row.msg = [];
                  row.msg.unshift('委托成功');
                  row.style = {

                  }
                } else {
                  var tmpObj = res.data[row.stock_id];
                  if (0 == tmpObj.code) {
                    row.btnType = false;
                    row.entrustStatus = "pass";
                    row.msg = [];
                    row.msg.unshift('委托成功');
                    row.style = {

                    }

                  } else {
                    row.btnType = false;
                    row.entrustStatus = "fail";
                    row.msg = [];
                    row.msg.unshift(tmpObj.msg);
                    row.msg.unshift('委托失败');
                    row.style = {
                      color: "red"
                    }
                  }
                }
              } else {
                row.btnType = false;
                row.msg = [];
                row.msg.unshift(tmpObj.msg);
                row.msg.unshift('委托失败');
                row.entrustStatus = "fail";
                row.style = {
                  color: "red"
                }
              }
              _this.tableData = Object.assign({}, _this.tableData)
            }).fail(function() {
              row.btnType = false;
              row.msg = ["委托失败"];
              row.entrustStatus = "fail";
              row.style = {
                color: "red"
              }
              _this.tableData = Object.assign({}, _this.tableData)

            });
          },
        },
        mounted() {
          $.clearLoading();
        }
      });

      Vue.prototype.$confirm({
        title: '委托结果',
        content: contentChild,
        closeIcon: true,
      });
    },
    update_entrust_info() {
      //更新委托数量
      let entrust_info = window.entrust_info ? window.entrust_info : [];
      let self = this;
      if (entrust_info.length != 0) {
        this.list_data.forEach((stock) => {
          stock.current_entrust = 0;
          stock.entrust_buy_num = 0;
          stock.entrust_buy_money = 0;
          stock.entrust_sell_num = 0;
          stock.entrust_sell_money = 0;
          entrust_info.forEach(function(entrust) {
              if (entrust.stock.code == stock.stock_id && entrust.product_id == self.$root.product.id &&
                (![4, 5, 7, 8, 9].some(function(ele) {
                  return entrust.status == ele;
                }) || (entrust.status == 4 && !/1|2/.test(entrust.cancel_status)))
              ) {
                if ('buy' == self.$root.direction && 1 == entrust.entrust.type) {



                  stock.entrust_buy_num += entrust.entrust.amount - entrust.deal.amount;
                  stock.entrust_buy_money += (entrust.entrust.amount - entrust.deal.amount) * entrust.entrust.price;



                } else if ('sell' == self.$root.direction && 2 == entrust.entrust.type) {
                  stock.entrust_sell_num += entrust.entrust.amount - entrust.deal.amount;
                  stock.entrust_sell_money += (entrust.entrust.amount - entrust.deal.amount) * entrust.entrust.price;
                }
              }
            })
            // 修改当前委托数量为  买入数量或者卖出数量的最大值 
          stock.current_entrust = Math.max(stock.entrust_buy_num, stock.entrust_sell_num);


          if (this.$root.direction == "buy") {
            // stock.target_position = stock.target_position || 0;
            // stock.target_position = parseFloat(stock.target_position);
            // stock.total_amount = (stock.total_amount || 0)

            // if (stock.total_amount) {
            //   stock.target_position = (stock.total_amount + stock.entrust_sell_num) * stock.weight / stock.total_amount;
            // } else {
            //   stock.target_position = 0.00;
            // }
            // stock.target_position = (stock.target_position * 100).toFixed(2);
          } else {
            // stock.target_position = stock.target_position || 0;
            // stock.target_position = parseFloat(stock.target_position)
            // stock.total_amount = stock.total_amount || 0
            // stock.target_position = (stock.total_amount - stock.entrust_sell_num) * stock.weight / stock.total_amount;
            // stock.target_position = (stock.target_position * 100).toFixed(2);
          }

        })
      } else {}
      //触发滚动事件 出现滚动条
      this.$nextTick(function() {
        setTimeout(function() {
          $(window).scroll();
        })
      })
    }

  }

})
Vue.component('vue-error-ele', {
  props: ["isshow", "error_info", "delete_show"],

  template: `
            <div class="error-box">
                <div class="error-info" v-show=isshow><span>风险提示：</span>{{error_info}}</div>
                <span v-if=delete_show class="dele_icon" @click="delete_stock"></span>
            </div>
        `,
  methods: {
    delete_stock() {
      this.$emit('delete_stock');
    }
  }
})

Vue.component('vue-foot-inner', {
  props: ["error_type", "direction", "radio_type"],
  template: `
           <div class="foot-inner">
              <div class="add_stock" v-show="direction == 'buy'">
                <input id="add_stock_code" :value="displayStockCode(stock_code)" placeholder="输入股票代码 ..." pattern="^(\d{6}\.(SZ|SH)|\d{5}\.(HK))$" focus-class="active" active-slide="#magic-suggest" >
                <div class="magic-suggest-wrap" data-src="|getMagicSuggest" display="none"></div>
                <button @click="addStock">添加</button>
              </div>
              <div class="form_stock">
                <button v-show="direction=='buy'" class="delal_btn_buy" @click="submit_list">批量买入</button>
                <button v-show="direction!='buy'" class="delal_btn_sell" @click="submit_list">批量卖出</button>
                <button class="adjustment_btn" @click="onec_adjustment" style="display:none">一键调仓</button>
                <span v-show="error_type">请修改触发风控的股票</span>
              </div>
              <div class="modify_stock" >
                <template v-if="direction=='sell'">
                  <label @click="radio_change('total')"><input name="modify_method" type="radio" checked />按同等总资产比例<vue-cell-default  ref="total" placeholder="请输入比例" @input_blur="input_blur" showtype="input_percentage" index="none" name="change_price_total"  checktype="true" class_name="vue_input_default"></vue-cell-default></label>
                  <label><input name="modify_method" type="radio" @click="radio_change('equal')" />按同等持仓比例<vue-cell-default  ref="equal" placeholder="请输入比例" @input_blur="input_blur" showtype="input_percentage" index="none" name="change_price_position"  checktype="true" class_name="vue_input_default"></vue-cell-default></label>
                </template>
                <template v-if="direction=='buy'">
                  <label @click="radio_change('equal')"><input name="modify_method" type="radio"  style="display:none"/>按同等调仓比例<vue-cell-default placeholder="请输入比例"  @input_blur="input_blur" showtype="input_percentage"  index="none" name="change_price_position"  checktype="true" class_name="vue_input_default"></vue-cell-default></label>
                </template>
              </div>
            </div>
        `,
  data: function() {
    return {
      set_amount_type: "part",
      equal_show: false,
      target_show: false,
      stock_code: '',
    }
  },
  watch: {
    radio_type(name) {
      this.$nextTick(function() {
        if (name == "total") {
          this.$refs.total.my_showtype = "input";
          this.$refs.equal.my_showtype = "readyonly";
          this.$refs.equal.readyonly_placeholder = "请输入比例";
        }
        if (this.$root.direction == "sell") {
          if (name == "equal") {
            this.$refs.equal.my_showtype = "input";
            this.$refs.total.my_showtype = "readyonly";
            this.$refs.total.readyonly_placeholder = "请输入比例";
          }
        }

      })

    }

  },
  methods: {
    displayStockCode: function(val) {
      if ('marketA' == market) {
        return val
      } else if ('marketHSH' == market) {
        return val.replace('SH', '');
      } else if ('marketHSZ' == market) {
        return val.replace('SZ', '');
      }
    },
    input_blur(name, val) {
      if (name == "change_price_target") {
        this.$emit("change_price_target", val);
      }
      if (name == "change_price_position") {
        this.$emit("change_price_position", val);
      }
      if (name == "change_price_total") {
        this.$emit('change_price_total', val)
      }
    },
    radio_change: function(name) {
      //切换input状态为只读
      if (name == "total") {
        this.$emit('change_radio_type', "total")
      }

      if (name == "equal") {
        this.$emit('change_radio_type', "equal")
      }


    },
    addStock: function() {
      let _this = this;
      if (!this.stock_code.length) {
        $.omsAlert('股票代码不正确！', false);
        return;
      }
      var stock_id = this.stock_code;
      var url = (window.REQUEST_PREFIX || '') + '/user/stock-follow/add';
      $.post(url, {
        stock_id: this.stock_code
      }).done(function(res) {
        if (res.code == 0) {
          $.omsAlert('添加自选股 ' + stock_id + ' 成功！');
          var tmpLi = $('.multi-stocks-section').find('.magic-suggest>li');
          var stock_name = '';
          tmpLi.each(function() {
            var arr = $(this).html().split(' &nbsp; ');
            if (arr[0] == stock_id) {
              stock_name = arr[1];
            }
          });
          $(window).trigger({
            type: 'create_order:multi_stocks:add_stock',
            stock: {
              stock_id: stock_id,
              stock_name: stock_name
            }
          });
          _this.stock_code = '';
        } else {
          res.code == 502204 ? $.omsAlert(res.msg, false) : $.failNotice(url, res);
        }
      }).fail($.failNotice.bind(null, url)).always(function() {});
    },
    submit_list: function() {
      //跳转到tbody执行 指令确认
      this.$emit('submit_list');
    },
    onec_adjustment: function() {
      //tobody处理意见调仓
      this.$emit('adjustment');
    }
  },
  mounted() {
    this.$on('addStock', 'addStock');
    let self = this;
    $(function() {
      $('.multi-stocks-section').find('.magic-suggest-wrap').render();
      $('.multi-stocks-section').on('stock_code:suggest', function(event) {
        var stock = event.stock;

        $('.multi-stocks-section').find('#add_stock_code').val(stock.stock_code + '.' + stock.exchange.slice(0, 2)).change();
        self.stock_code = stock.stock_id;
      });
    });
    $(window).on('stock:add_follow', function(event) {
      var stock = event.stock;
      // $('.multi-stocks-section').find('input').val(stock.stock_id).change();
      // self.stock_code = stock.stock_id;
      // self.$emit('addStock');
      var url = (window.REQUEST_PREFIX || '') + '/user/stock-follow/add';
      var stock_id = stock.stock_id;
      var stock_name = stock.stock_name;
      $.post(url, {
        stock_id: stock_id
      }).done(function(res) {
        if (res.code == 0) {
          $.omsAlert('添加自选股 ' + stock_id + ' 成功！');
          $(window).trigger({
            type: 'create_order:multi_stocks:add_stock',
            stock: {
              stock_id: stock_id,
              stock_name: stock_name
            }
          });
        } else {
          res.code == 502204 ? $.omsAlert(res.msg, false) : $.failNotice(url, res);
        }
      }).fail($.failNotice.bind(null, url)).always(function() {});
    });


    $(window).on('order_create:market:changed', function(event) {
      var market = event.market; //修改股票市场
      $('.multi-stocks-section').find('input#add_stock_code').attr('data-market', market);
      $('.multi-stocks-section').find('.magic-suggest-wrap').render();
    });
    // 切换交易方式，重新获取自选股数据
    $(window).on('order_create:deal_method:changed', function(event) {
      // 此处使用全局的market
      $('.multi-stocks-section').find('input#add_stock_code').attr('data-market', market);
      $('.multi-stocks-section').find('.magic-suggest-wrap').render();

    });
  }
})

function multiViewUpdate() {
  vm_multi = new Vue({
    el: "[batch-deal-view]",
    data: {
      "table_data": [],
      "stock_list": [],
      "total_cash": total_cash,
      "direction": direction,
      "error_type": false,
      "product": product,
      "total_max_cash": total_max_cash,
      "change_price_position_value": 0,
      "change_price_target_value": 0,
      "change_price_total_value": 0,
      "amount_type": 'part',
      "delete_show": true,
      "header_tr": '',
      "radio_type": '',
      "product": product
    },
    template: `
                <div id="batch_section">
                    <div class="buy multi-stocks-section" >
                        <div style="padding-bottom: 20px;">
                            <div id="multi_table_batch_buy" >
                                <div class="section-loading loading-loading"></div>
                                
                                    <vue-multi-tbody :radio_type=radio_type :header_data=table_data  :delete_show=delete_show ref="tbody" :change_price_target=change_price_target :change_price_position=change_price_position :list_data=stock_list :total_cash="total_cash" :total_max_cash="total_max_cash" :direction="direction"></vue-multi-tbody>
                                
                            </div>
                        </div>
                        <div class="multi_footer">
                            <vue-foot-inner :radio_type=radio_type @change_radio_type=change_radio_type :error_type="error_type" :direction="direction" @change_amount_type=change_amount_type @submit_list=submit_list @adjustment=adjustment @change_price_target=change_price_target @change_price_position=change_price_position @change_price_total=change_price_total></vue-foot-inner>
                        </div>
                    </div>
                </div>
            `,
    watch: {
      stock_list(val) {
        var _stock_list = this.stock_list;

        if (_stock_list.length > 0) {

          var requset = [];
          this.stock_list.forEach(function(ele, index) {
            requset.push(ele.stock_id);
          });
          requset = requset.join(",");

          update5(requset)
        }

      },
      direction(val) {
        // console.log('ddd');
        this.delete_show = val == "buy" ? true : false;
        if (val == "sell") {
          this.radio_type = "total";
        } else {
          this.radio_type = '';
        }


      }
    },
    methods: {
      submit_list() {
        this.$refs.tbody.submit_stock_tbody()
      },
      adjustment() {
        this.$refs.tbody.onec_adjustment();
      },
      change_price_position(val) {
        this.change_price_position_value = val;
        this.$refs.tbody.change_price_position(val);
      },
      change_price_target(val) {
        this.change_price_target_value = val;
        this.$refs.tbody.change_price_target(val);
      },
      change_price_total(val) {
        this.change_price_total_value = val;
        this.$refs.tbody.change_price_total(val);

      },
      change_amount_type(val) {
        this.amount_type = val;
      },
      change_radio_type(val) {
        this.radio_type = val;
      }
    },
    computed: {

    },
    mounted() {

    }
  })
}