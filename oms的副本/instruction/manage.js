/**
 * 指令管理页面
 * Author: liuzeyafzy@gmail.com
 */

/**
 * 交易流程使用的vue，其不参与页面显示，但他是整个交易流程。//附，使用中发现一个问题，root组件内部不能使用tradeFlow，只有Vue.component定义的组件能够使用
 * 他的数据来自于各个组件的关键数据，他的数据决定了目前处于交易的哪一个步骤，
 *
 */
var tradeFlow = new Vue({
  data: {
    curActive: '', // single-buy; single-sell
    // 选中的产品信息
    checkedProductList: [],
    // 股票id，示例：“601288.SH”
    stock_id: '',
    stock_detail: {},
    // form_data: {},
    trade_mode: 1,
    trade_price: '',
    add_ins_method: 3,
  },
  watch: {
  },
  methods: {
    // Begin: 外部调用，获取提交时需要的数据
    chgCurActive: function(val){
      this.curActive = val
    },
    chgCheckedProduct: function(arr){
      this.checkedProductList = arr;
      this.checkData();
    },
    chgStockId: function(id){
      this.stock_id = id;
      this.trade_price = '';
      this.checkData();
    },
    shgStockDetail: function(val){
      this.stock_detail = val;
      this.checkData();
    },
    chgTradeMode: function(val){
      this.trade_mode = val;
      this.checkData();
    },
    chgTradePrice: function(val){
      this.trade_price = val;
      this.checkData();
    },
    chgInsMethod: function(val){
      this.add_ins_method = val;
      this.checkData();
    },
    // End: 外部调用，获取提交时需要的数据
    // Begin: 内部处理
    // 检查数据是否ok，ok则全部交给
    checkData: function(){
      // // TODO 如果数据不足的情况下，进行提示。理解错误，不要进行提示并返回。预览那边就需要得到这些数据。因为数据不足的时候，预览也要这些数据。
      // if ('' == this.stock_id || 0 == Object.keys(this.stock_detail).length || '' == this.trade_price || 0 == this.checkedProductList.length) {
      // }

      // 将数据提交给持仓模块
      instructionManagePage.$refs['product-position'].setChecked({
        checkedProductList: this.checkedProductList
      })

      // 将数据提交给预览模块
      tradeControllor.$refs['trade-preview'].setSubmitData({
        checkedProductList: this.checkedProductList,
        stock_id: this.stock_id,
        stock_detail: this.stock_detail,
        // form_data: this.form_data,
        trade_mode: this.trade_mode,
        trade_price: this.trade_price,
        add_ins_method: this.add_ins_method,
      })
    },
    // End: 内部处理
  }
});

/**
 * 想要做一个表格单元格，能够支持目前所有的业务类型。后续新增的业务类型(type)可以往里面加。目前支持：
 * text               文本类型，最常见的情形
 * checkbox           多选框类型，常见于表格第一列，不可以给表格的其他部分使用，因为表头单元格对这个checkbox也做了处理（要给其他的列使用，那意思是表头是文字，内容是多选框，请自行添加checkboxV2）
 * percent            百分比类型，支持多参数多颜色显示百分比。
 */
// 指令管理表格数据
let instructionManageData = {
  typeStr: '',
  order: '',
  order_by: '',
  display_rules: [{
    type: 'checkbox',
    id: 'web_checked',
    disabledMapping: 'disabled',
    hideChildren: true,
    label: '',
    format: '',
    class: 'left20 width45'
  },{
    type: 'text',
    id: 'stock_id',
    label: '证券代码',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'stock_name',
    label: '证券名称',
    format: '',
    class: 'left20',
  },{
    type: 'text',
    id: 'product_name',
    label: '产品账户',
    format: '',
    class: 'left20',
    preControl: {
      id: 'showChildren',
      class: 'control-btn',
      trueClass: 'control-btn__hide',
      falseClass: 'control-btn__display'
    }
  },{
    type: 'text',
    id: 'fund_manager_name',
    label: '基金经理',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'deal_direction_name',
    label: '买卖标记',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'price',
    label: '价格',
    format: ['numeralNumber', 3],
    class: 'right20'
  },{
    type: 'text',
    id: 'ins_volume',
    label: '指令数量',
    format: '',
    class: 'right20'
  },{
    type: 'text',
    id: 'target_position',
    label: '目标仓位',
    format: ['numeralPercent', 0],
    class: 'right20'
  },{
    type: 'text',
    id: 'total_asset_ratio',
    label: '总资产比例',
    format: ['numeralPercent', 2],
    class: 'right20'
  },{
    type: 'text',
    id: 'latest_price',
    label: '最新价',
    format: ['numeralNumber', 3],
    class: 'right20'
  },{
    type: 'text',
    id: 'current_position',
    label: '当前持仓',
    format: ['addParenthese', 'numeralPercent', 2],
    preShow: {
      type: 'text',
      id: 'current_volume',
      format: ['numeralNumber', 0]
    },
    class: 'right20 ',
    subClass: 'colorYellow'
  },{
    type: 'text',
    id: 'current_cost_price',
    label: '当前持仓成本',
    format: ['numeralNumber', 3],
    class: 'right20'
  },{
    type: 'percent',
    id: 'progress',
    label: '完成进度',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'creator_name',
    label: '创建人',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'created_at',
    label: '创建时间',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'status_name',
    label: '指令状态',
    format: '',
    class: 'left20'
  },{
    type: 'btn',
    id: 'status',
    label: '操作',
    format: ['displayStatus'],
    btnId: 'ins_id',
    btnClickFn: 'doCancel',
    class: 'left20 width100'
  }]
};

let productListData = {
  typeStr: '',
  order: '',
  order_by: '',
  display_rules: [{
    type: 'checkbox',
    id: 'web_checked',
    hideChildren: true,
    label: '',
    format: '',
    class: 'left20 width45'
  },{
    type: 'text',
    id: 'name',
    label: '全选', // 产品账户
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'operator_name',
    label: '基金经理',
    format: '',
    class: 'left20'
  },{
    type: 'text',
    id: 'net_value',
    label: '当日净值',
    format: ['numeralNumber', 4],
    class: 'right20'
  },{
    type: 'text',
    id: 'position',
    label: '仓位',
    format: ['numeralPercent'],
    class: 'right20'
  },{
    type: 'text',
    id: 'net_profite',
    label: '总盈亏',
    format: ['numeralNumber', 2],
    class: 'right20'
  },{
    type: 'text',
    id: 'profit_rate',
    label: '总盈亏率',
    format: ['numeralPercent'],
    class: 'right20'
  },{
    type: 'text',
    id: 'total_assets',
    label: '资产总值',
    format: ['numeralNumber', 2],
    class: 'right20'
  },{
    type: 'text',
    id: 'security',
    label: '持仓市值',
    format: ['numeralNumber', 2],
    class: 'right20'
  },{
    type: 'text',
    id: 'balance_amount',
    label: '资金余额',
    format: ['numeralNumber', 2],
    class: 'right20'
  },{
    type: 'text',
    id: 'enable_cash',
    label: '可用资金',
    format: ['numeralNumber', 2],
    class: 'right20'
  }]
};

var position_query_arr = [{
  id: 'position',
  uri: window.REQUEST_PREFIX + '/oms/api/multi_position_realtime',
  order: '',
  order_by: '',
  gridDataStr: 'positionGrid',
  display_rules: [{
    id: 'stock_id',
    label: '证券代码',
    withMultiIcon: true,
    format: '',
    class: ''
  },{
    id: 'stock_name',
    label: '证券名称',
    format: '',
    class: 'cell-left'
  },{
    id: 'product_name',
    label: '持仓策略',
    format: '',
    class: 'cell-left'
  },{
    id: 'cost_price',
    label: '成本价',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  },{
    id: 'latest_price',
    label: '最新价',
    format: ['numeralNumber', 3],
    classFormat: ['rgColor', 'earning'],
    class: 'cell-right'
  },{
    id: 'total_amount',
    label: '持仓数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'enable_sell_volume',
    label: '可卖数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'market_value',
    label: '市值',
    format: ['numeralNumber', 2],
    showTotal: true,
    classFormat: ['rgColor', 'earning'],
    class: 'cell-right'
  },{
  //   id: 'today_earning',
  //   label: '当日盈亏',
  //   format: ['signNumeralNumber', 2],
  //   classFormat: ['rgColor', 'earning'],
  //   class: 'cell-right'
  // },{
    id: 'earning',
    label: '浮动盈亏',
    format: ['signNumeralNumber', 2],
    showTotal: true,
    classFormat: ['rgColor', 'earning'],
    class: 'cell-right'
  },{
    id: 'earning_ratio',
    label: '浮盈率',
    format: ['signNumeralPercent', 2],
    classFormat: ['rgColor', 'earning_ratio'],
    class: 'cell-right'
  },{
    id: 'weight',
    label: '所占仓位',
    showTotal: true,
    format: ['numeralPercent', 2],
    class: 'cell-right'
  // },{
  //   id: 'exchange_text',
  //   label: '交易市场',
  //   format: '',
  //   hide_flag: 3 == orginfo_theme ? true : false,
  //   class: 'cell-right'
  }]
}];

//当前持仓
Vue.component('vue-product-position', {
  props: [],
  template: `
    <section class="order-list new-design">
      <a id="anchor-position" style="position: relative;top:-65px;display: block;height: 0;width:0;"></a>
      <div class="hd">
        <span class="section-title">当前持仓</span>
        
        <a class="oms-btn gray refresh-btn loading-loading right" v-bind:class="{'loading': loadingNum > 0}" href="javascript:;" v-on:click="loadOrderList"><i class="oms-icon refresh"></i>刷新</a>
        <span v-if="1 == checked_count" class="right" style="font-size:16px;font-weight:600;color:#000;">当前仓位<span style="padding-left: 5px;" v-text="numeralPercent(totalData.weight)"></span></span>
      </div>
      <table class="oms-table loading-loading nothing-nothing" v-bind:class="{'nothing': activeGridList.length == 0}">
        <tbody>
          <tr>
            <th v-if="rule.hide_flag != true" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
              <span v-text="rule.label"></span>
              <a class="icon-sortBy" v-on:click="chgSort(rule.id)">
                <i class="icon-asc" :class="{active: (order_by == rule.id && order == 'asc')}"></i>
                <i class="icon-desc" :class="{active: (order_by == rule.id && order == 'desc')}"></i>
              </a>
            </th>
          </tr>
        </tbody>
        <tbody>
          <tr v-for="row in activeGridList" v-show="checkShow(row)" v-bind:class="{'sub_order': row.is_sub, 'display_multi': row.web_showChildren}">
            <td @click="doRowClick(row)" v-if="rule.hide_flag != true" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
              <span v-bind:class="displayClass(row, rule)" v-text="displayValue(row, rule)"></span>
            </td>
          </tr>
          <tr v-if="1 == checked_count">
            <td v-bind:class="rule.class" v-if="rule.hide_flag != true" v-for="(rule, index) in curQueryInfo.display_rules">
              <span v-if="0 == index" style="color: #999;">当前持仓汇总</span>
              <span v-if="rule.showTotal" v-bind:class="displayClass(totalData, rule)" v-text="displayValue(totalData, rule)"></span>
            </td>
            <td class="cell-right">
              
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  data: function () {
    return {
      title: '当前持仓',
      // rulesData: positionData,
      // gridHead: {
      //   web_checked: false
      // },
      // showProductList: []

      order: '',
      order_by: '',
      gridData: [],
      curActive: 'position',

      orginfo_theme: 1, //机构版

      positionGrid: [],
      product_list: [],
      checked_count: 0,
      totalData: [],

      query_arr: position_query_arr,
      loadingNum: 0
    }
  },
  computed: {
    curQueryInfo: function(){
      var _this = this;
      var rtn = {};
      this.query_arr.forEach(function(e){
        if (e.id == _this.curActive) {
          rtn = e;
        }
      });
      return rtn;
    },
    activeGridList: function(){
      let _this = this;
      var rtn = [];
      // return [];

      this.product_list.forEach(function(ele){
        if (true == ele.web_checked) {
          _this['positionGrid'] && _this['positionGrid'].forEach(function(e){
            if (e.product.id == ele.product_id){
              var obj = {};

              // 证券名称
              obj.stock_id = e.stock_id;
              // 证券代码
              obj.stock_name = e.stock_name;
              // 持仓策略
              obj.product_name = e.product ? e.product.name : '';
              // 成本价
              obj.cost_price = e.cost_price;
              // 最新价
              obj.latest_price = e.latest_price;
              // 持仓数量
              obj.total_amount = e.total_amount;
              // 可卖数量
              obj.enable_sell_volume = e.enable_sell_volume;
              // 市值
              obj.market_value = e.market_value;
              // 当日盈亏
              obj.today_earning = e.today_earning;
              // 浮动盈亏
              obj.earning = e.earning;
              // 浮盈率
              obj.earning_ratio = e.earning_ratio;
              // 所占仓位
              obj.weight = e.weight;
              // 证券市场
              obj.exchange_text = e.exchange_text

              rtn.push(obj);
            }
          });
        }
      });

      // 步骤2，根据排序逻辑进行排序
      rtn = VUECOMPONENT.sort(rtn, _this.order, _this.order_by);

      var rtn2 = {};
      rtn2.market_value = 0;
      rtn2.earning = 0;
      rtn2.weight = 0;
      if (1 == this.checked_count) {
        rtn.forEach(function(e){
          rtn2.market_value += parseFloat(e.market_value);
          rtn2.earning += parseFloat(e.earning);
          rtn2.weight += parseFloat(e.weight);
        })
      }
      this.totalData = rtn2;

      $(window).trigger({type:'product:position:updated',position:rtn});

      return rtn;
    }
  },
  methods: {
    setChecked: function(obj){
      this.product_list = obj.checkedProductList;
    },
    chgSort: function(id){
      if (id == this.order_by) {
        if (this.order == 'asc') {
          this.order = 'desc';
        }else if(this.order == 'desc'){
          this.order = '';
        }else{
          this.order = 'asc'
        }
      }else{
        this.order_by = id;
        this.order = 'asc';
      }
      // // 用户切换排序命令，需要保存新的排序
      // let obj = {};
      // obj.field_sort = this.display_rules.map(function(e){
      //   return e.id
      // });
      // obj.order_by = this.order_by;
      // obj.order = this.order;

      // this.$emit('order', {order: this.order,
      //   order_by: this.order_by,
      //   typeStr: this.typeStr,
      //   display_rules: this.display_rules
      // });
      // common_storage.setItem(this.typeStr, obj);
    },
    // 行点击
    doRowClick: function(row){
      $(window).trigger({
        type:'order_create:by_stock',
        stock:{
          stock_code: row.stock_id,
          stock_name: row.stock_name,
          direction: 'sell'
        }
      });
    },
    // 添加自选股
    doFollow: function(row){
      $(window).trigger({
        type: 'stock:add_follow',
        stock: row
      });
    },
    // 买入卖出按钮
    doTrade: function(row, direction){
      $(window).trigger({
        type:'order_create:by_stock',
        stock:{
          stock_code: row.stock_id,
          stock_name: row.stock_name,
          direction: direction
        }
      });
    },
    checkShow: function(row){
      if (row.do_hide) {
        return false;
      }
      
      return true;
    },
    numeralNumber: function(arg, num){
      if ('--' == arg || '' === arg || undefined == arg) {
        return '--'
      }
      if (undefined != num) {
        var str = '0.'
        for (let i = num - 1; i >= 0; i--) {
          str += '0';
        }
        if(0 == num){
          str = '0';
        }
        return numeral(arg).format( '0,' + str );
      }
      return numeral(arg).format( '0,0.00' );
    },
    numeralPercent: function(arg){
      return numeral(arg).format( '0.00%' );
    },
    signNumeralNumber: function(arg, num){
      if('-' == arg || '--' == arg){
        return arg;
      }

      var noSign = +(arg||0).toString().replace(/^(\-|\+)/,'');
      return (arg<0 ? '-' : '+') + this.numeralNumber(noSign, num);
    },
    signNumeralPercent: function(arg, num){
      if('-' == arg || '--' == arg){
        return arg;
      }

      var noSign = +(arg||0).toString().replace(/^(\-|\+)/,'');
      return (arg<0 ? '-' : '+') + this.numeralPercent(noSign, num);
    },
    // row是行数据，name是比较的那个属性名，middle是比较的标尺数据，默认为0
    rgColor: function(row, name, middle){
      var num = row[name];
      return num<(middle||0) ? 'green' : 'red';
    },
    displayValue: function(sub_value, rule){
      var value = sub_value[rule.id];
      if ((rule.format != '') && (rule.format instanceof Array) && (this[rule.format[0]] instanceof Function)) {
        // value = this[rule.format].call(this, value, )
        var args = [value].concat(rule.format.slice(1))
        value = this[rule.format[0]].apply(this, args);

      }
      if (rule.unit) {
        return value + rule.unit;
      }else{
        return value;
      }
    },
    displayClass: function(sub_value, rule){
      // 注意这里是把sub_value整个传给了函数处理
      var value = sub_value;
      var rtn = '';
      if ((rule.classFormat != '') && (rule.classFormat instanceof Array) && (this[rule.classFormat[0]] instanceof Function)) {
        // value = this[rule.classFormat].call(this, value, )
        var args = [value].concat(rule.classFormat.slice(1))
        rtn = this[rule.classFormat[0]].apply(this, args);
      }
      return rtn;
    },
    // 读取三个接口的数据
    loadOrderList: function(){
      let _this = this;

      //######################### 风控增补数据 risk_check js 用到 ########################
      $.get((window.REQUEST_PREFIX||'')+'/oms/helper/risk_position',{product_id:product_ids}, function(res){
          if (0 == res.code) {
              window.risk_position = res.data;
          }
      });
      //######################### 风控增补数据 risk_check js 用到 ########################

      // this.last_loading_timestamp = new Date().valueOf();
      this.query_arr.forEach(function(e){
        var last_loading_timestamp = new Date().valueOf();
        _this[e.gridDataStr].last_loading_timestamp = last_loading_timestamp;

        _this[e.gridDataStr].loadingStatus = 'loading';
        _this.loadingNum += 1;
        $.getJSON(e.uri, {product_id: product_ids}).done(function(res){
          if( _this[e.gridDataStr].last_loading_timestamp != last_loading_timestamp ){return;}

          if(res.code==0){
            // window.position_realtime = res.data;
            var position_realtime = [];

            var needRefresh = false;
              product_list.forEach(function(product){
                var id = product.id;
                var positions = $.pullValue(res,'data.'+id+'.data',[]);

                // product.position_realtime = positions;
                positions.forEach(function(position){
                    position.product = product;
                });

                // id是组合id，positions是实时持仓数据 在此计算出“今日盈亏”和“今日盈亏率”修改到window.PRODUCTS 的对应组合的runtime中
                // product.today_earning;
                var profit_of_today = 0;
                positions.forEach(function(position){
                    profit_of_today += position.today_earning;
                });
                window.PRODUCTS.forEach(function(e){
                  if (e.id == id) {
                    if (e.runtime && Object.keys(e.runtime).length > 0) {
                      needRefresh = true;
                      var profit_of_today_v2 = profit_of_today - e.runtime.redeem_fee - e.runtime.manage_fee - e.runtime.other_fee;
                      e.runtime.profit_of_today_v2 = profit_of_today_v2;
                      if (0 == e.runtime.total_assets) {
                        e.runtime.profit_rate_of_day_v2 = 0;
                      }else{
                        e.runtime.profit_rate_of_day_v2 = profit_of_today_v2 / e.runtime.total_assets;
                      }
                    }
                  }
                });

                position_realtime.push.apply(position_realtime,positions);
              });
              if (needRefresh == true) {
                $(window).trigger({
                  type: 'position:runtime:refresh'
                });
              }

              window.position_realtime = position_realtime;

              _this[e.gridDataStr] = position_realtime;
              _this[e.gridDataStr]['list_num'] = position_realtime.length;
              _this[e.gridDataStr]['last_updated_timestamp'] = res.timestamp;
              // _this.getGridList(e.gridDataStr);
            }else{
              _this[e.gridDataStr] = [];
              _this[e.gridDataStr]['list_num'] = 0;
              // _this.getGridList(e.gridDataStr);
            }
        }).always(function(){
          _this.loadingNum -= 1;
          _this[e.gridDataStr].loadingStatus = '';
        });
      });

      
    }
  }
})

// 指令管理表格
Vue.component('vue-instruction-manage', {
  template: `
    <div class="instruction-manage">
      <div class="instruction-manage__header" style="padding: 10px 30px 10px;display: flex;">
        <h2 style="display: inline-block;margin-right: 20px;">{{title}}</h2>
        <label style="padding-top: 5px;margin-right:8px;"><input type="checkbox" v-model="showUnfinished" />未完成指令</label>
        <label style="padding-top: 5px;margin-right:8px;"><input type="checkbox" v-model="showFinished" />已结束指令</label>
        <div style="flex:1"></div>
        <a @click="multiCancel()" class="bem-ui-btn" style="height: 32px;line-height: 32px;padding-top: 0;padding-bottom: 0;width: 80px;margin-right:20px;">一键撤销</a>
        <a @click="loadManageList()" class="bem-ui-btn bem-ui-btn__refresh-btn" v-bind:class="{'loading': 'loading' == loadingStatus}"><i></i>刷新</a>
      </div>
      <table class="instruction-manage__body newweb-common-grid oms-nothing-table" v-bind:class="{'nothing': showManageList.length == 0}">
        <thead>
          <tr>
            <vue-common-grid-th v-for="rule in rulesData.display_rules" :rule="rule" :row="gridHead" @change="chgAll($event)"></vue-common-grid-th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in showManageList" v-if="checkDisplay(row)">
            <tr>
              <vue-common-grid-td v-for="rule in rulesData.display_rules" v-model="row[rule.id]" :rule="rule" :row="row"></vue-common-grid-td>
            </tr>
            <template v-if="row.children && 0 < row.children.length && row.showChildren">
              <tr v-for="sub_row in row.children">
                <vue-common-grid-td v-for="rule in rulesData.display_rules" :rule="rule" :row="sub_row"></vue-common-grid-td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  `,
  data: function(){
    return {
      title: '指令提交',
      showUnfinished: true,
      showFinished: true,
      ajax_manage_list: [],
      rulesData: instructionManageData,
      showAborted: true,
      showFinished: true,
      loadingStatus: '',// loading
      gridHead: {
        web_checked: false
      },
      showManageList: [],
    }
  },
  watch: {
    ajax_manage_list: function(){
      this.readyShowList();
    },
    showManageList: {
      handler: function(){
        if (this.showManageList.every(e => true === e.web_checked) && this.showManageList.length > 0) {
          this.gridHead.web_checked = true;
        }else{
          this.gridHead.web_checked = false;
        }
      },
      deep: true
    }
  },
  beforeMount: function(){
    this.loadManageList();
  },
  methods: {
    checkDisplay: function(row){
      if (this.showFinished && (-1 == row.status || 4 == row.status)) {
        return true;
      }

      if (this.showUnfinished && (2 == row.status || 3 == row.status)) {
        return true;
      }

      return false;
    },
    multiCancel: function(){
      let arr = [];
      this.showManageList.forEach(function(e){
        if (e.web_checked && 4 != e.status && -1 != e.status) {
          arr.push(e.ins_id);
        }
      });

      $.ajax({
        type: 'post',
        url: window.REQUEST_PREFIX + '/sync/instruction/manage_cancel',
        data: {
          ins_id_arr: arr,
        },
        success: function({code, msg, data}){
          if (0 == code) {
            $.omsAlert('撤销成功')
          }else{
            $.omsAlert(msg)
          }
        },
        error: function(err){
          $.omsAlert('网络异常')
        }
      })
    },
    loadManageList: function(){
      let _this = this;
      this.loadingStatus = 'loading';
      $.ajax({
        url: window.REQUEST_PREFIX + '/sync/instruction/search_list',
        data: {
          count: 9999,
          type: 'manage',
          ins_status_arr: [-1, 2, 3, 4]
        },
        success: function(res){
          _this.loadingStatus = '';
          if (0 == res.code) {
            _this.ajax_manage_list = res.data.list || [];
          }else{
            $.omsAlert(res.msg);
          }
        },
        error: function(){
          _this.loadingStatus = '';
          $.omsAlert('网络异常');
        }
      })
    },
    chgAll: function(event){
      this.$nextTick(() => {
        this.showManageList.forEach(function(e){
          e.web_checked = event;
        });
        this.showManageList.filter(function(e){

        });
      });
    },
    readyShowList: function(){
      let arr = [];
      this.ajax_manage_list.forEach((e) => {
        let obj = {};
        obj.web_checked = false;
        obj.ins_id = e.instruction.id;
        // 股票代码
        obj.stock_id = e.stock.stock_id;
        // 股票名称
        obj.stock_name = e.stock.stock_name;
        // 产品名称
        obj.product_name = e.gathering.product_name_list.join('，');

        // 交易方向、买卖标志
        obj.deal_direction_name = e.gathering.deal_direction_name;
        // 指令价格
        obj.price = e.gathering.price;
        // 指令数量
        obj.ins_volume = e.gathering.ins_volume;
        // 目标仓位
        if (1 == e.instruction.add_ins_method) {
          obj.target_position = e.gathering.target_position;
        }else{
          obj.target_position = '--';
        }
        // obj.target_position = e.gathering.target_position;

        // 总资产比例
        // if (2 == e.instruction.add_ins_method) {
        //   obj.current_adjust_position = e.gathering.current_adjust_position;
        // }else{
        //   obj.current_adjust_position = '--';
        // }
        // obj.current_adjust_position = e.gathering.current_adjust_position;

        // 总资产比例
        if (2 == e.instruction.add_ins_method) {
          obj.total_asset_ratio = e.gathering.total_asset_ratio;
        }else{
          obj.total_asset_ratio = '--';
        }
        // obj.total_asset_ratio = e.gathering.total_asset_ratio;
        // 最新价
        obj.latest_price = e.stock.latest_price;
        // 当前持仓
        obj.current_position = e.gathering.current_position;
        // 当前持仓数量
        obj.current_volume = e.gathering.current_volume;
        // 当前持仓成本价
        obj.current_cost_price = e.gathering.current_cost_price;
        // 完成进度百分比
        obj.progress = e.gathering.progress;
        // 创建日期
        obj.created_at = e.instruction.created_at;
        // 创建人
        obj.creator_name = e.instruction.creator_name;
        // 基金经理
        obj.fund_manager_name = e.instruction.fund_manager_name;
        // 指令状态
        obj.status_name = e.instruction.status_name;
        obj.status = e.instruction.status; //(2提交成功，3正在执行，4执行完毕，-1终止执行)
        if (4 == obj.status || -1 == obj.status) {
          obj.disabled = true;
        }else{
          obj.disabled = false;
        }
        // 操作
        obj.operation = '撤销';
        obj.showChildren = false;
        // 产品账户购买子列表 // 结构与gathering一致
        if (e.sub_list.length > 1) {
          obj.children = e.sub_list;
          obj.children.forEach(function(e){
            e.isChild = true;
          })
        }else{
          obj.children = [];
        }
        
        arr.push(obj);
      });

      this.showManageList = arr;
    }
  }
});

// 产品账户表格
Vue.component('vue-product-list', {
  props: ['ajax_product_list'],
  template: `
    <div class="instruction-manage">
      <div class="instruction-manage__header" style="padding: 10px 30px 0;">
        <h2>{{title}}</h2>
      </div>
      <table class="instruction-manage__body newweb-common-grid">
        <thead>
          <tr>
            <vue-common-grid-th v-for="rule in rulesData.display_rules" :rule="rule" :row="gridHead" @change="chgAll($event)"></vue-common-grid-th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in showProductList">
            <tr>
              <vue-common-grid-td v-for="rule in rulesData.display_rules" v-model="row[rule.id]" :rule="rule" :row="row"></vue-common-grid-td>
            </tr>
            <template v-if="row.children && 0 < row.children.length && row.showChildren">
              <tr v-for="sub_row in row.children">
                <vue-common-grid-td v-for="rule in rulesData.display_rules" :rule="rule" :row="sub_row"></vue-common-grid-td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  `,
  data: function(){
    return {
      title: '产品账户',
      rulesData: productListData,
      showAborted: true,
      showFinished: true,
      gridHead: {
        web_checked: false
      },
      // checkedAll: false,
      // ajaxManageList: [],
      showProductList: [],
    }
  },
  watch: {
    ajax_product_list: {
      handler:function(){
        this.readyShowList();
      },
      deep: true
    },
    showProductList: {
      handler: function(){
        // var tmp = new Map();
        // this.showProductList.forEach(function(e){
        //   if (true === e.web_checked) {
        //     tmp.set(e.operator_uid, true);
        //   }
        // });

        // if (1 == tmp.size || 0 == tmp.size) {
          if (this.showProductList.every(e => true === e.web_checked)) {
            this.gridHead.web_checked = true;
          }else{
            this.gridHead.web_checked = false;
          }

          let arr = this.showProductList.filter(function(e){
            return true == e.web_checked;
          });
          tradeFlow.chgCheckedProduct(arr);

        // }else{
          
        //   $.omsAlert('请勾选同一名基金经理的产品账户！')
        // }

        // if (this.showProductList.every(e => true === e.web_checked)) {
        //   this.gridHead.web_checked = true;
        // }else{
        //   this.gridHead.web_checked = false;
        // }

        // let arr = this.showProductList.filter(function(e){
        //   return true == e.web_checked;
        // });
        // tradeFlow.chgCheckedProduct(arr);
      },
      deep: true
    }
  },
  methods: {
    chgAll: function(event){
      this.$nextTick(() => {
        // 借用map来记录是否勾选了同一名基金经理的产品账户
        // var tmp = new Map();
        // this.showProductList.forEach(function(e){
        //   tmp.set(e.operator_uid, true);
        // });
        // if (1 == tmp.size || 0 == tmp.size) {
          this.showProductList.forEach(function(e){
            e.web_checked = event;
          });
          this.showProductList.filter(function(e){

          });
        // }else{
        //   $.omsAlert('请勾选同一名基金经理的产品账户！')
        // }
      });
    },
    readyShowList: function(){
      let arr = [];
      this.ajax_product_list.forEach(e => {
        let obj = {};
        // obj.web_checked = e.web_checked || false;
        obj.web_checked = this.showProductList.some(function(el){
          if (el.product_id == e.product_id) {
            return el.web_checked;
          }
          return false;
        })
        
        // 额外传递runtime
        obj.runtime = e.runtime || {};
        $.extend(obj.runtime, $.pullValue(window.runtime, e.product_id + '.data'));

        // 证券名称
        obj.name = e.name;
        obj.product_id = e.product_id;
        obj.operator_uid = e.operator_uid;
        obj.operator_name = e.operator_name;
        // 当日净值
        obj.net_value = e.runtime ? e.runtime.net_value : '--';
        // 仓位
        obj.position = e.runtime ? e.runtime.position : '--';
        // 总盈亏
        obj.net_profite = e.runtime ? e.runtime.net_profite : '--';
        // 总盈亏率
        obj.profit_rate = e.runtime ? e.runtime.profit_rate : '--';
        // 资产总值
        obj.total_assets = e.runtime ? e.runtime.total_assets : '--';
        // 持仓市值
        obj.security = e.runtime ? e.runtime.security : '--';
        // 资金余额
        obj.balance_amount = e.runtime ? e.runtime.balance_amount : '--';
        // 可用资金
        obj.enable_cash = e.runtime ? e.runtime.enable_cash : '--';

        arr.push(obj);
      });
      this.showProductList = arr;
    }
  }
});

let instructionManagePage = new Vue({
  el: '#instruction-manage',
  data: {
    // ajaxManageList: [],
    ajaxProductList: [],
  },
  methods: {
    loadList: function(product_list){
      // this.ajaxManageList = window.instructionList;
      this.ajaxProductList = product_list;
      // this.$refs['product-list'].readyShowList();
      // this.readyShowList();


    },
  }
});
// instructionManagePage.loadList();

// 页面底部交易部分，基于原来的逻辑实现
// var board = $('#order_create_id').find('>.body>.right-board');
Vue.component('vue-trade-menu', {
  props: [],
  template: `
  <div class="left-nav">
    <div class="trade-nav" style="overflow: visible;">
      <div v-if="3 != org_info_theme && false" class="trade-nav__market" @click="chgCurMarket('marketA')" v-bind:class="{'active': 'marketA' == curMarket}">沪深交易A</div>
      <div v-if="3 != org_info_theme && false" class="trade-nav__market" @click="chgCurMarket('marketH')" v-bind:class="{'active': 'marketH' == curMarket}" style="margin-right: 55px;">沪港通交易H</div>

      <span class="trade-nav__item single-buy" v-bind:class="{'active': 'single-buy' == curActive}" @click="chgActive('single-buy')">提交买入指令</span>
      <span class="trade-nav__item single-sell" v-bind:class="{'active': 'single-sell' == curActive}" @click="chgActive('single-sell')">提交卖出指令</span>

      <div style="flex: 1;"></div>
      <a class="trade-nav__toggle" @click="chgShowBoard()">
        <i class="nav-bar-show-icon" v-bind:class="{'icon-collapse': showBoard, 'icon-spread': !showBoard}"></i>
      </a>
    </div>
  </div>
  `,
  data: function(){
    return {
      org_info_theme: window.LOGIN_INFO.org_info.theme,
      curMarket: 'marketA',
      curActive: 'single-buy',
      displayRevertNum: 0,
      showBoard: true,
      product_list: [],
      checked_count: 0
    }
  },
  watch: {
    checked_count: function(){
      if (1 == this.checked_count) {
        $('.disabled-mask').hide();
      }else{
        $('.disabled-mask').show();
      }
    },
  },
  methods: {
    chgShowBoard: function(){
      this.showBoard = !this.showBoard;
      this.$emit('menu', {
        curActive: this.curActive,
        curMarket: this.curMarket,
        showBoard: this.showBoard
      });
    },
    chgCurMarket: function(curMarket){
      // 判断是否修改，如果被修改，清空股票及价格
      if(curMarket !== this.curMarket){
        $('#stock_code').val('').change();
        $("#val_price").val('');

        $('[click-active=".trade_number_method-by_volume"]').click()
        $('#val_volume').val('');
        if ('marketA' == curMarket) {
          $('.order_model_limit_price').click();
          $("#val_volume").attr('placeholder', '每手100股');
          $("#vale_current_volum").attr('placeholder', '每手100股');
        }else if ('marketH' == curMarket) {
          $("#val_volume").attr('placeholder', '');
          $("#vale_current_volum").attr('placeholder', '');
        }
      }

      this.curMarket = curMarket;
      this.showBoard = true;

      this.$emit('menu', {
        curActive: this.curActive,
        curMarket: this.curMarket,
        showBoard: this.showBoard
      });
    },
    chgActive: function(val){
      if (1 != this.checked_count && ('multi-buy' == val || 'multi-sell' == val)) {
        $.omsAlert('多策略暂时无法使用批量下单功能！',false,1000);
        return;
      }
      this.curActive = val;
      this.showBoard = true;

      var index = 0;
      if ('single-sell' == this.curActive) {
        index = 1;
      }
      $.omsUpdateLocalJsonData('etc','order_create_nav_index', index);

      this.$emit('menu', {
        curActive: this.curActive,
        curMarket: this.curMarket,
        showBoard: this.showBoard
      });

      tradeFlow.chgCurActive(this.curActive);
    }
  }
});

// 交易表单组件
Vue.component('vue-trade-form', {
  props: ['cur_active'],
  template:`
  <form class="vue-trade-form">
    <div class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
      <label class="vue-trade-form__label">股票代码</label>
      <div class="vue-trade-form__content">
        <vue-stock-search :custom_cls="'trade-custom-tmp-class'" :stock_input_id="stock_input_type_id" :placeholder="'请输入股票代码'" v-on:stock_id="chgStockId($event)" v-on:stock_input="stock_input_type_id = $event"></vue-stock-search>
      </div>
    </div>
    <div class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
      <label class="vue-trade-form__label">报价方式</label>
      <div class="vue-trade-form__content">
        <div class="vue-trade-form__content--radio">
          <label @click="chgTradeMode(1)" class="vue-trade-form__content--radio-label" v-bind:class="{'active': 1 == trade_model}">
            限价
            <i class="right-icon"></i>
          </label>
          <label style="width: 10px;"></label>
          <label @click="chgTradeMode(2)" class="vue-trade-form__content--radio-label" v-bind:class="{'active': 2 == trade_model}">
            市价
            <i class="right-icon"></i>
          </label>
        </div>
      </div>
    </div>
    <div class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
      <label class="vue-trade-form__label">价格</label>
      <div class="vue-trade-form__content">
        <input v-model="trade_price" @change="chgTradePrice()" class="vue-trade-form__content--input" placeholder="请输入指令价格" />
      </div>
    </div>
    <div class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
      <label class="vue-trade-form__label">下单方式</label>
      <div class="vue-trade-form__content">
        <select class="vue-trade-form__content--select" v-model="add_ins_method" @change="chgInsMethod()">
          <option value="3">按指令数量</option>
          <option value="1">按目标仓位</option>
          <option value="2">按总资产比例</option>
        </select>
      </div>
    </div>
  </form>
  `,
  data: function(){
    return {
      stock_id: '',
      stock_input_type_id: '',
      trade_model: 1,
      trade_price: '',
      add_ins_method: 3, // 1按目标仓位 2按总资产比例 3按指令数量
    }
  },
  mounted: function(){
    // 接收从五档行情触发的事件
    $(window).on('trade-5__priceClick', (event) => {
      this.trade_price = event.price;
      this.chgTradePrice();
    });

    $(window).on('trade-5__firstTime_price', event => {
      if ('single-buy' == this.cur_active) {
        this.trade_price = event.ask1_price;
      }else if('single-sell' == this.cur_active){
        this.trade_price = event.bid1_price;
      }
      this.chgTradePrice();
    })
  },
  methods: {
    chgStockId: function(event){
      this.stock_id = event;
      this.$emit('stock_id', this.stock_id);
      tradeFlow.chgStockId(this.stock_id);
    },
    chgTradeMode: function(val){
      this.trade_model = val;
      tradeFlow.chgTradeMode(this.trade_model);
    },
    chgTradePrice: function(){
      tradeFlow.chgTradePrice(this.trade_price);
    },
    chgInsMethod: function(){
      tradeFlow.chgInsMethod(this.add_ins_method);
    }
  }
});

Vue.component('vue-trade-5', {
  mixins: [numberMixin, colorMixin],
  props: ['stock_id'],
  template: `
    <div class="vue-trade-5">
      <div class="vue-trade-5__high-low">
        <h1 class="loading-loading">
          <span class="code">{{ajaxStockDetail.stock_code}}</span><br/>
          <span>{{ajaxStockDetail.stock_name}}</span>
        </h1>
        <div class="loading-loading vue-trade-5__main-info">
          <b @click="priceClick(ajaxStockDetail.last_price)" style="cursor: pointer;" class="vue-trade-5__main-info--last-price">{{numeralNumber(ajaxStockDetail.last_price, 3)}}</b>
          <span class="vue-trade-5__main-info--span">{{numeralNumber(ajaxStockDetail.change, 3)}}</span>
          <span class="vue-trade-5__main-info--span">{{numeralPercent(ajaxStockDetail.change_ratio, 3)}}</span>
        </div>
        <div class="vue-trade-5__bd">
          <p>
            今开：<span @click="priceClick(ajaxStockDetail.open_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.open_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.open_price, 3)}}</span><br/>
            昨收：<span @click="priceClick(ajaxStockDetail.prev_close_price)" style="cursor: pointer;">{{numeralNumber(ajaxStockDetail.prev_close_price, 3)}}</span>
          </p>
          <p>
            最高：<span @click="priceClick(ajaxStockDetail.high_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.high_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.high_price, 3)}}</span><br/>
            最低：<span @click="priceClick(ajaxStockDetail.low_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.low_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.low_price, 3)}}</span>
          </p>
          <p>
            涨停：<span @click="priceClick(ajaxStockDetail.stop_top)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.stop_top, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.stop_top, 3)}}</span><br/>
            跌停：<span @click="priceClick(ajaxStockDetail.stop_down)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.stop_down, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.stop_down, 3)}}</span>
          </p>
        </div>
      </div>
      <div class="vue-trade-5__ask-bid">
        <div class="ask-bid__trade-tip hide"></div>
        <table style="width: 100%;">
          <tbody>
            <tr>
              <td>卖5</td>
              <td @click="priceClick(ajaxStockDetail.ask5_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.ask5_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.ask5_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask5_volume, 0)}}</td>
            </tr>
            <tr>
              <td>卖4</td>
              <td @click="priceClick(ajaxStockDetail.ask4_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.ask4_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.ask4_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask4_volume, 0)}}</td>
            </tr>
            <tr>
              <td>卖3</td>
              <td @click="priceClick(ajaxStockDetail.ask3_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.ask3_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.ask3_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask3_volume, 0)}}</td>
            </tr>
            <tr>
              <td>卖2</td>
              <td @click="priceClick(ajaxStockDetail.ask2_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.ask2_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.ask2_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask2_volume, 0)}}</td>
            </tr>
            <tr>
              <td>卖1</td>
              <td @click="priceClick(ajaxStockDetail.ask1_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.ask1_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.ask1_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask1_volume, 0)}}</td>
            </tr>
            <tr class="blank-tr" style="height: 2px;line-height: 2px;"><td>&nbsp;</td></tr>
          </tbody>
          <tbody><tr class="hr-tr" style="height: 2px!important;line-height: 2px!important;border-top: 1px solid #f2f2f2;"><td colspan="3" class="hr"></td></tr></tbody>
          <tbody>
            <tr>
              <td>买1</td>
              <td @click="priceClick(ajaxStockDetail.bid1_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.bid1_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.bid1_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask5_volume, 0)}}</td>
            </tr>
            <tr>
              <td>买2</td>
              <td @click="priceClick(ajaxStockDetail.bid2_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.bid2_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.bid2_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask4_volume, 0)}}</td>
            </tr>
            <tr>
              <td>买3</td>
              <td @click="priceClick(ajaxStockDetail.bid3_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.bid3_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.bid3_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask3_volume, 0)}}</td>
            </tr>
            <tr>
              <td>买4</td>
              <td @click="priceClick(ajaxStockDetail.bid4_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.bid4_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.bid4_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask2_volume, 0)}}</td>
            </tr>
            <tr>
              <td>买5</td>
              <td @click="priceClick(ajaxStockDetail.bid5_price)" style="cursor: pointer;" v-bind:class="rmgColor(ajaxStockDetail.bid5_price, ajaxStockDetail.prev_close_price)">{{numeralNumber(ajaxStockDetail.bid5_price, 3)}}</td>
              <td>{{numeralNumber(ajaxStockDetail.ask1_volume, 0)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data: function(){
    return {
      ajaxStockDetail: {},
      ajaxTimes: 0,
    }
  },
  watch: {
    stock_id: function(){
      this.ajaxTimes = 0;
      this.loadData();
    }
  },
  methods: {
    priceClick: function(val){
      // 触发事件，修改表单的价格
      $(window).trigger({
        type: 'trade-5__priceClick',
        price: val
      })
    },
    loadData: function(){
      let _this = this;
      if ('' == this.stock_id) {
        _this.ajaxStockDetail = {};
        return;
      }
      commonAjax( (window.REQUEST_PREFIX||'')+"/oms/helper/stock_detail?stock_id="+ this.stock_id ).then(function({code, msg, data}){
        if (0 == code) {
          _this.ajaxTimes++;

          _this.ajaxStockDetail = data[0];
          tradeFlow.shgStockDetail(_this.ajaxStockDetail);

          if (1 == _this.ajaxTimes) {
            $(window).trigger({
              type: 'trade-5__firstTime_price',
              ask1_price: _this.ajaxStockDetail.ask1_price,
              bid1_price: _this.ajaxStockDetail.bid1_price,
            })
          }
        }else if(1 == code){
          // 旧的逻辑，错误码为1，不提示。
        }else{
          $.omsAlert(msg);
        }
      }).catch(function(err){
        $.omsAlert(err);
      });
    }
  }
})

// 菜单底部显示行情组件
Vue.component('vue-trade-foot', {
  mixins: [numberMixin],
  props: ['whole_width'],
  template: `
  <div class="foot" :style="'width:' + whole_width + 'px;'">
    <span class="indexs">
      <span class="index">
        上证指数
        <span v-bind:class="rgColor(code_000001, 'change')">
          <span>{{numeralNumber(code_000001.last_price, 2)}}</span>
          <span>{{numeralNumber(code_000001.change, 2)}}</span>
          <span>{{numeralPercent(code_000001.change_ratio)}}</span>
        </span>
      </span>
      <span class="index">
        深证指数
        <span v-bind:class="rgColor(code_399001, 'change')">
          <span>{{numeralNumber(code_399001.last_price, 2)}}</span>
          <span>{{numeralNumber(code_399001.change, 2)}}</span>
          <span>{{numeralPercent(code_399001.change_ratio)}}</span>
        </span>
      </span>
      <span class="index">
        创业板指
        <span v-bind:class="rgColor(code_399006, 'change')">
          <span>{{numeralNumber(code_399006.last_price, 2)}}</span>
          <span>{{numeralNumber(code_399006.change, 2)}}</span>
          <span>{{numeralPercent(code_399006.change_ratio)}}</span>
        </span>
      </span>
    </span>
    <span class="time" data-src="time">2016/08/01 10:16:22</span>
  </div>
  `,
  data: function(){
    return {
      time: '',
      code_000001: {},
      code_399001: {},
      code_399006: {}
    }
  },
  methods: {
    // row是行数据，name是比较的那个属性名，middle是比较的标尺数据，默认为0
    rgColor: function(row, name, middle){
      var num = row[name];
      return num<(middle||0) ? 'green' : 'red';
    },
    loadData: function(){
      let _this = this;
      var indexs = [
        '000001.SH', // 上证指数
        '399001.SZ', // 深证指数
        '399006.SZ'  // 创业板指
      ];
      var url = (window.REQUEST_PREFIX||'')+"/oms/helper/stock_brief?stock_id="+indexs.join(',');
      var loadStockIndexs = function(){
        commonAjax(url).then(function({code, msg, data}){
          if (0 == code) {
            var res_data = data || [];
            res_data.forEach && res_data.forEach(function(index_stock){
                _this['code_' + index_stock.stock_code] = index_stock
            });
            _this.time = moment().format('YYYY/MM/DD HH:mm:ss');
          }else{
            $.omsAlert(msg);
          }
        }).catch(function(err){
          $.omsAlert(err);
        });
      };

      $(loadStockIndexs);
      setInterval(function(){
        _this.time = moment().format('YYYY/MM/DD HH:mm:ss');
      });
      setInterval(loadStockIndexs,6000);
    }
  }
});

// 菜单预览显示组件
Vue.component('vue-trade-preview', {
  mixins: [numberMixin],
  props: ['cur_active'],
  template: `
    <div v-if="showOrHide()" class="vue-trade-preview">
      <div class="vue-trade-preview__content">
        <table class="oms-preview-table loading-loading nothing-nothing" style="width: 100%;">
          <thead>
            <tr class="hd">
              <th class="oms-preview-table__content--left oms-preview-table__max-width-130">产品名称</th>
              <th class="oms-preview-table__content--right">当前持仓</th>
              <th v-show="1 == add_ins_method" class="oms-preview-table__content--right">目标持仓</th>
              <th v-show="2 == add_ins_method" class="oms-preview-table__content--right">总资产比例</th>
              <th v-show="3 == add_ins_method" class="oms-preview-table__content--right">指令数量</th>
              <th v-show="1 == add_ins_method || 2 == add_ins_method" class="oms-preview-table__content--right">指令数量</th>
            </tr>
          </thead>
          <tbody class="loading-hide" style="line-height: 30px;">
            <tr v-for="row in display_arr" style="border-bottom: 1px solid #E2E2E2;" v-bind:class="[{'error-line': row.riskRtn && row.riskRtn.code != 0}]">
              <td class="oms-preview-table__content--left oms-preview-table__max-width-130" v-text="row.name"></td>
              <td class="oms-preview-table__content--right">
                {{numeralPercent(row.the_stock_position)}}
              </td>
              <td v-show="1 == add_ins_method" class="oms-preview-table__content--right">
                <div style="position:relative;padding-right: 5px;">
                  <input style="padding-left: 5px;" placeholder="请输入比例" v-model="row.dst_position" @change="chgRowDstPosition(row)" />
                  <span style="position: absolute;right: 10px;color:#ccc;top: 2px;">%</span>
                </div>
              </td>
              <td v-show="2 == add_ins_method" class="oms-preview-table__content--right">
                <div style="position:relative;padding-right: 5px;">
                  <input style="padding-left: 5px;" placeholder="请输入比例" v-model="row.chg_position" @change="chgRowChgPosition(row)" />
                  <span style="position: absolute;right: 10px;color:#ccc;top: 2px;">%</span>
                </div>
              </td>
              <td v-show="3 == add_ins_method" class="oms-preview-table__content--right">
                <div style="position:relative;padding-right: 5px;">
                  <input style="padding-left: 5px;" placeholder="请输入数量" v-model="row.chg_amount" @change="chgRowChgAmount(row)" />
                  <prompt-language v-if="row.riskRtn && 0 != row.riskRtn.code" :language_val="row.riskRtn && row.riskRtn.msg"></prompt-language>
                </div>
              </td>
              <td v-show="1 == add_ins_method || 2 == add_ins_method" class="oms-preview-table__content--right">
                <div style="position:relative;padding-right: 5px;">
                  <span>{{row.chg_amount || 0}}</span>
                  <prompt-language v-if="row.riskRtn && 0 != row.riskRtn.code" :language_val="row.riskRtn && row.riskRtn.msg"></prompt-language>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="vue-trade-preview__controller">
        <label v-show="1 == add_ins_method">
          批量设置
          <div style="display: inline-block;position:relative;">
            <input placeholder="请输入比例" v-model="multi_num" @change="chgMultiNum()">
            <span style="position: absolute;right: 10px;color:#ccc;top: 2px;">%</span>
          </div>
        </label>
        <label v-show="2 == add_ins_method">
          批量设置
          <div style="display: inline-block;position:relative;">
            <input placeholder="请输入比例" v-model="multi_num" @change="chgMultiNum()">
            <span style="position: absolute;right: 10px;color:#ccc;top: 2px;">%</span>
          </div>
        </label>
        <label v-show="3 == add_ins_method">
          批量设置
          <div style="display: inline-block;position:relative;">
            <input placeholder="请输入数量" v-model="multi_num" @change="chgMultiNum()">
          </div>
        </label>
        
        <a v-on:click="multiProductsSubmit()" class="bem-ui-btn" v-bind:class="{'disabled': checkSubmitDisabled()}">
          <span>提交指令</span>
        </a>
      </div>
    </div>
  `,
  data: function(){
    return {
      trading_unit: '100',
      // 产品列表预算后通过事件传过来的数据。
      detail_arr: [],
      trade_number_method: '',
      buy_or_sell: '',
      // visibility: true,
      display_arr: [],

      // 选中的产品信息
      checkedProductList: [],
      trade_direction: 1,  // 1买入 2卖出
      // 股票id，示例：“601288.SH”
      stock_id: '',
      // 五档行情
      stock_detail: {},
      // form_data: {},
      // 交易模式 市价: 2; 限价: 1
      trade_mode: '',
      // 交易价格
      trade_price: '',
      // // 交易方式，仅展示用
      // trade_user_type: 1,
      // 下单方式
      add_ins_method: 3, //1按目标仓位 2按总资产比例 3按指令数量

      // 批量交易数量
      multi_num: '',

      // 按同等目标仓位的输入值
      allDstPosition: '',
      // 按同等总资产比例的输入值
      allChgPosition: '',
    }
  },
  watch: {
    cur_active: function(){
      if ('single-buy' == this.cur_active) {
        this.trade_direction = 1;
      }else if('single-sell' == this.cur_active){
        this.trade_direction = 2;
      }

      // 额外，清空该预览框的交易数量
      this.multi_num = '';
      this.chgMultiNum()
    },
    add_ins_method: function(){
      this.multi_num = '';
      this.chgMultiNum();
    }
  },
  methods: {
    checkSubmitDisabled: function(){
      let flag = false;
      this.display_arr.forEach(e => {
        if ('' == e.chg_amount || 0 == e.chg_amount) {
          flag = true;
        }
        if (!e.riskRtn) {
          flag = true;
        }else if (0 != e.riskRtn.code) {
          flag = true;
        }
      });

      return flag;
    },
    // 决定该组件是否显示
    showOrHide: function(){
      // 选中产品为空，则隐藏
      if (0 == this.display_arr.length) {
        return false;
      }

      // 股票id为空，则隐藏
      if ('' == this.stock_id) {
        return false;
      }

      // 限价的情况下，价格为空，则隐藏
      if (1 == this.trade_mode) {
        if ('' == this.trade_price) {
          return false;
        }
      }

      return true;
    },
    multiProductsSubmit: function(){
      if (this.checkSubmitDisabled()) {
        return false;
      }
      var _this = this;
      let htmlArr = [];
      let typeStr1 = '';
      let typeStr2 = '';
      let ins_price = 0;
      if (1 == this.trade_direction) {
        typeStr1 = '<span style="color:#F44336;">买入</span>';
        ins_price = this.stock_detail.stop_top;
      }else{
        typeStr1 = '<span style="color:#2196F3">卖出</span>';
        ins_price = this.stock_detail.stop_down;
      }
      if (1 == this.trade_mode) {
        // typeStr2 = '限价';
        typeStr2 = this.trade_price;
        ins_price = this.trade_price;
      }else{
        typeStr2 = '市价';
      }

      let totalAmount = 0;
      let totalMoney = 0;
      this.display_arr.forEach(function(e){
        htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left">'+ e.name + '</td>'+
          '<td class="cell-left">'+ typeStr1 +'</td>'+
          '<td class="cell-left">'+ typeStr2 +'</td>'+
          // '<td class="cell-right" style="max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+ priceStr +'">'+ priceStr +'</td>'+
          '<td class="cell-right">'+ e.chg_amount +'</td>'+
          '<td class="cell-right">'+ Number((e.chg_amount * ins_price).toFixed(2)) +'</td></tr>');
        totalAmount += Number(e.chg_amount);
        totalMoney += e.chg_amount * ins_price;
      });
      totalMoney = Number(totalMoney.toFixed(2));

      var html = htmlArr.join('');
      var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;"><tr><th class="cell-left">产品单元</th>'+
        '<th class="cell-left">买卖标志</th>'+
        '<th class="cell-left">报价方式</th>'+
        // '<th class="cell-right">指令价格</th>'+
        '<th class="cell-right">交易数量(股)</th>'+
        '<th class="cell-right">交易金额(元)</th></tr>'+html+'</tbody></table>'+
        '<div class="custom_total"><span style="color:#999999;font-size:13px;">总计</span><span>'+totalAmount+'</span><span>'+totalMoney+'</span></div>';
      if (0 == window.is_trade_day) {//0是休市时间，也就是非交易日或者是交易日的15点之后 1为非休市时间
          confirmHtml += '<div style="color:#F44336;font-size: 14px;padding-bottom: 3px;">*当前为休市时间，指令将提交至下一交易日</div>'
      }
      if (location.search.includes("permission=special")) {
          confirmHtml += '<label><input class="is_auto_order" style="margin-right: 10px;" type="checkbox" />自动审核</label>'
      }

      $.confirm({
        title: '指令确认 <span style="margin-left:10px;font-size: 14px;font-weight: normal;">股票：'+ this.stock_id + ' ' + this.stock_detail.stock_name +'</span>',
        content: confirmHtml,
        keyboardEnabled: true,
        closeIcon: true,
        confirmButton: '确定',
        cancelButton: false,
        confirm: function(){
          if($.isLoading()){return;}
          $.startLoading('正在提交订单...');
          // form_data.batch_no = $.randomNo(LOGIN_INFO.user_id,30);

          // // // 数组打乱排序
          // // checked_rows.sort(function(a, b){
          // //     return Math.random() - 0.5;
          // // });

          let product_id_arr = [];
          let sub_list = {};
          _this.display_arr.forEach(function(e){
            product_id_arr.push(e.product_id);
            sub_list[e.product_id] = {};
            sub_list[e.product_id]['target_position'] = e.dst_position;
            sub_list[e.product_id]['total_asset_ratio'] = e.chg_position;
            sub_list[e.product_id]['ins_volume'] = e.chg_amount;

          });
          $.post((window.REQUEST_PREFIX||'')+'/sync/instruction/manage_add',{
            stock_id: _this.stock_id,
            quote_type: _this.trade_mode,
            quote_price: _this.trade_price,
            direction: _this.trade_direction,
            add_ins_method: _this.add_ins_method,
            product_id: product_id_arr,
            sub_list: sub_list,
            ignore_tips:0,
          }).done(function(res){
              // if (0 == res.code) {
              //   // $.omsAlert('提交成功');
                checkResults(res, _this.display_arr,sub_list)
              // }else{
              //   $.omsAlert(res.msg);
              // }
              $.clearLoading();
          }).fail(function(){
              // product.add_hand_order_res = {code:110,msg:'网络错误！'};
              $.omsAlert('网络错误！');
              $.clearLoading();
          }).always(function(){
               // checkResults(res, _this.display_arr,sub_list)
          });
          function checkResults( result, display_arr ,sub_list){
                //新版二次确认框
                //包括处理结果和继续购买按钮
            // result  = {
            //   "code": 0, //非0表示该接口有错误，错误内容见msg字段
            //   "msg": "",
            //   "data": {
            //     "101259":{ //产品id
            //     "000001.SZ": {
            //       "code": 5022111,  //5022111 触发风控或者异常信息
            //       "msg": "",  //若该字段不为空，则展示该信息，表示异常信息
            //       "data": {
            //         "msg":["已触发风控:全部股票禁止买入"],//触发内容数组
            //         "limit_action": 0  //0表示预警，1表示禁止
            //          } 
            //       }
            //     },
            //     "101232":{ //产品id
            //     "000001.SZ": {
            //       "code": 5022111,  //5022111 触发风控或者异常信息
            //       "msg": "",  //若该字段不为空，则展示该信息，表示异常信息
            //       "data": {
            //         "msg":["已触发风控:全部股票禁止买入"],//触发内容数组
            //         "limit_action": 0  //0表示预警，1表示禁止
            //          } 
            //       }
            //     },
            //   }
            // }
            if(result.code ==5022111){
              display_arr.forEach(function(row){
                row.ins_volume  = sub_list[row.product_id].ins_volume;
                if( !result.data[row.product_id]){
                  row.btnType =  false;
                  row.msg = ["委托成功"];
                  row.entrustStatus = "pass";
                  row.style = {}
                     
                }else{
                    let temp  = result.data[row.product_id][_this.stock_id];
                    if(temp.code == 0){
                        //没问题
                        row.btnType =  false;
                        row.msg = ["委托成功"];
                        row.entrustStatus = "pass";
                        row.style = {  
                        }
                    }else if(temp.code == 5022111){
                        //提示性风控
                        if(temp.msg==""){
                            if(temp.data.limit_action == 0){
                                //alert
                                row.btnType =  true;
                                row.msg = temp.data.msg;
                                row.entrustStatus = "alert";
                                row.style = {
                                color:"#FAA11F"
                                }
                            }else{    
                                //购买失败
                       
                                row.btnType = false;
                                row.entrustStatus = "fail";
                                row.style = {
                                    color:"red"
                                }
                                if(temp.msg ==""){
                                    row.msg = temp.data.msg;
                                }else{
                                    row.msg = [temp.msg];
                                }
                                row.msg.unshift("委托失败");
                            }
                        }else{
                            //购买失败
                            row.btnType = false;
                            row.entrustStatus = "fail";
                            row.style = {
                                color:"red"
                            }
                            if(temp.msg ==""){
                                row.msg = []
                            }else{
                                row.msg = [temp.msg];
                            }
                            row.msg.unshift("委托失败");
                        }
                    } else{
                        //禁止性风控
                        row.btnType =  false;
                        row.msg = temp.data.msg;
                        row.msg.unshift("提交失败");
                        row.entrustStatus = "fail";
                        row.style = {
                            color:"red"
                        }
                    }
                }
              })
            }else if(result.code == 0){
              $.omsAlert("指令提交成功");
              return
            }else{
              $.omsAlert("指令提交失败");
              return
            }
            let contentChild = Vue.extend({
              data() {
                let stock_name = $('.client-stockInput__unit').html();
                let stock_code = $('.client-stockInput__input').val();
                return {
                  tableData: display_arr,
                  stock_name: stock_name,
                  entrust_price: _this.trade_price,
                  stock_code:stock_code,
                  status:false
                }
              },
              template: `
                    <div style="position:relative">
                    <span style="position: absolute;top: -36px;left: 91px;font-size:12px;">股票：{{stock_code}}&nbsp;&nbsp;{{stock_name}}&nbsp;&nbsp;价格：{{entrust_price}}</span>
                    <div class="vue-form-confirmation">
                        <table style="max-width: 600px;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                    <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">产品账户</th>
                                    <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">数量</th>
                                    <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">备注</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr  v-for="row in tableData" style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                    <td class="vue-form-confirmation__text-align-left">{{row.name}}</td>
                                    <td class="vue-form-confirmation__text-align-left">{{row.ins_volume}}</td>
                                    <td class="vue-form-confirmation__text-align-left vue-form-confirmation__span-center" >
                                        <div>
                                            <span :style=row.style>
                                                <template v-for="msg in row.msg">
                                                    {{msg}}</br>
                                                </template>
                                            </span>  
                                            
                                        </div>

                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="buttons" v-if=status style="margin-top: 40px;">
                            <button type="button" class="vue-confirm__btns--cancel"  @click=btn_submit style="background-color:red">确定</button>
                            <button type="button" class="vue-confirm__btns--submit"  @click=btn_cancel>取消</button>
                          
                        </div>
                      </div>
                      </div>
                    `,
              methods: {
                btn_submit() {
                  let self = this;
                  let product_id_arr = [];
                  let sub_list = {};
                  this.tableData.forEach(function(e){
                    product_id_arr.push(e.product_id);
                    sub_list[e.product_id] = {};
                    sub_list[e.product_id]['target_position'] = e.dst_position;
                    sub_list[e.product_id]['total_asset_ratio'] = e.chg_position;
                    sub_list[e.product_id]['ins_volume'] = e.chg_amount;

                  });
                  $.post((window.REQUEST_PREFIX||'')+'/sync/instruction/manage_add',{
                    stock_id: _this.stock_id,
                    quote_type: _this.trade_mode,
                    quote_price: _this.trade_price,
                    direction: _this.trade_direction,
                    add_ins_method: _this.add_ins_method,
                    product_id: product_id_arr,
                    sub_list: sub_list,
                    ignore_tips:1,
                  }).done(function(res){
                      if (0 == res.code) {
                        // $.omsAlert('提交成功');
                        //checkResults(res, self.tableData,sub_list)
                      }else{
                        $.omsAlert(res.msg);
                      }
                      $.clearLoading();
                  }).fail(function(){
                      // product.add_hand_order_res = {code:110,msg:'网络错误！'};
                      $.omsAlert('网络错误！');
                      $.clearLoading();
                  }).always(function(){
                                              //清除二次确认框
                      setTimeout(function(){
                          self.$parent.close();
                      },1000)
                  });

                },
                btn_cancel(){
                   this.$parent.close();
                }
              },
              mounted() {
                $.clearLoading();
              },
              mounted(){

                for(let i = 0 ;i<this.tableData.length;i++){
                  if(this.tableData[i].entrustStatus == "pass"){
                    this.status = false;
                    return
                  }
                  if(this.tableData[i].entrustStatus == "fail"){
                    this.status = false;
                    return
                  }
                }
                this.status = true;
              }
            });

            Vue.prototype.$confirm({
              title: '委托结果',
              content: contentChild,
              closeIcon: true,
            });
          }
        }
      });
    },
    chgMultiNum: function(){
      if (1 == this.add_ins_method) {
        this.chgAllDstPosition(this.multi_num);
      }
      if (2 == this.add_ins_method) {
        this.chgAllChgPosition(this.multi_num);
      }
      if (3 == this.add_ins_method) {
        this.display_arr.forEach((e) => {
          e.chg_amount = this.multi_num;
        });
        this.refreshDisplay();
      }
    },
    chgAllDstPosition: function(position){
      this.display_arr.forEach((e) => {
        e.dst_position = position;
        this.chgRowDstPosition(e);
      });
    },
    chgAllChgPosition: function(position){
      this.display_arr.forEach((e) => {
        e.chg_position = position;
        this.chgRowChgPosition(e);
      });
    },
    // 强制刷新页面
    refreshDisplay: function(){
      let _this = this;
      if ('' == this.stock_id || undefined == this.stock_id) {
        return false;
      }
      // 过风控
      this.display_arr.forEach(function(e){
        let total_amount = 0;
        let market_value = 0;
        let all_market_value = 0;

        var stock_position_num = 0; //该产品已持仓该股票数量
        var stock_entrust_num = 0; //该产品已委托该股票数量
        var stock_total_share = _this.stock_detail.total_share_capital; //该股票总股票数量，即总股本
        var stock_all_position_num = 0; //所有的持仓汇总该股票数量
        var stock_all_entrust_num = 0; //所有的委托汇总该股票数量
        var stock_entrust_buy_num = 0; //该产品已委托买入数量
        var stock_entrust_sell_num = 0; //该产品已委托卖出数量
        var stock_all_entrust_buy_num = 0; //所有的产品已委托买入数量
        var stock_all_entrust_sell_num = 0; //所有的产品已委托卖出数量

        window.risk_position[e.product_id].data.forEach(function(el){
          if (el.stock_id == _this.stock_id) {
            total_amount = el.total_amount;
            market_value = el.market_value;
          }
          all_market_value += el.market_value - 0;//强制转数字
        });

        var enable_sell_volume = 0;
        // window.position_realtime[e.product_id].data.forEach(function(el){
        //   if (el.stock_id === _this.stock_id && el.product_id == e.product_id) {
        //     enable_sell_volume = e.enable_sell_volume;
        //   }
        // });
        window.position_realtime.forEach(function(el){
          if ( el.stock_id === _this.stock_id && el.product_id == e.product_id) {
            enable_sell_volume = el.enable_sell_volume;

            stock_position_num += Number(e.total_amount); // 得到该产品已持仓该股票数量

            // 联合风控需要遍历所有的组合
            if (e.stock_id === _this.stock_id) {
                stock_all_position_num += Number(e.total_amount);
            }
          }
        });

        window.entrust_info.forEach(function(el){
          if (el.stock.code == _this.stock_id && el.product_id == e.product_id && 
              (![4, 5, 7, 8, 9].some(function(ele){
                  return el.status == ele;
              }) || (el.status == 4 && !/1|2/.test( el.cancel_status )))
          ) {
              if (1 == el.entrust.type) {
                  stock_entrust_num += el.entrust.amount - el.deal.amount; // 得到该产品已委托该股票数量
                  stock_entrust_buy_num = el.entrust.amount - el.deal.amount; // 得到该产品已委托买入数量
              }else if (2 == el.entrust.type){
                  stock_entrust_sell_num = el.entrust.amount - el.deal.amount; // 得到该产品已委托卖出数量
              }
          }

          // 联合风控需要遍历所有的组合
          if (el.stock.code == _this.stock_id && 
              (![4, 5, 7, 8, 9].some(function(ele){
                  return el.status == ele;
              }) || (el.status == 4 && !/1|2/.test( el.cancel_status )))
          ) {
              if (1 == el.entrust.type) {
                  stock_all_entrust_num += el.entrust.amount - el.deal.amount; // 得到所有产品已委托该股票数量

                  stock_all_entrust_buy_num += el.entrust.amount - el.deal.amount; // 所有的产品已委托买入数量
              }else if(2 == el.entrust.type){
                  stock_all_entrust_sell_num += el.entrust.amount - el.deal.amount; // 所有的产品已委托卖出数量
              }
          }
        })
        
        var obj = riskCheck.checkRules({
          trading_unit: _this.stock_detail.trading_unit,
          product_id: e.product_id,                           // 产品id， id
          // 交易数据 form_data
          trade_direction: _this.trade_direction,             // 交易方向，1买入 2卖出 trade_direction
          trade_mode: _this.trade_mode,                       // 1限价／2市价  trade_mode
          volume: e.chg_amount || 0,                               // 交易数量
          price: +_this.trade_price||0,                       // 限价金额
          surged_limit: _this.stock_detail.stop_top,          // 涨停价
          decline_limit: _this.stock_detail.stop_down,        // 跌停价
          stock_code: _this.stock_id,                         // 股票code，包含“.SZ”,比较的时候最好都进行小写转换
          stock_name: _this.stock_detail.stock_name,          // 股票名称，用于判断st股票
          // 产品的数据 product
          total_assets: e.runtime.total_assets,               // 资产总值 runtime.total_assets
          enable_cash: e.runtime.enable_cash,                 // 可用资金 runtime.enable_cash
          security: all_market_value,                         // 持仓市值 runtime.security 改为 all_market_value
          net_value: e.runtime.net_value,                     // 当日净值 runtime.net_value
          // 持仓数据
          market_value: market_value,                         // 本股票持仓市值 //window.position_realtime里面有
          total_amount: total_amount,                         // 该股票当前持仓数
          enable_sell_volume: enable_sell_volume,              // 该股票能卖的数量

          // 举牌
          stock_position_num: stock_position_num, //该产品已持仓该股票数量
          stock_entrust_num: 0, //该产品已委托该股票数量
          stock_total_share: stock_total_share, //该股票总股票数量，即总股本

          // 联合风控：举牌
          stock_all_position_num: stock_all_position_num, //所有的持仓汇总该股票数量
          stock_all_entrust_num: stock_all_entrust_num, //所有的委托汇总该股票数量

          // 对敲
          stock_entrust_buy_num: stock_entrust_buy_num,//0, //该产品已委托买入数量
          stock_entrust_sell_num: stock_entrust_sell_num,//0, //该产品已委托卖出数量

          // 联合风控：对敲
          stock_all_entrust_buy_num: stock_all_entrust_buy_num,//0, //所有的产品已委托买入数量
          stock_all_entrust_sell_num: stock_all_entrust_sell_num,//0, //所有的产品已委托卖出数量
        });
        e.riskRtn = obj;
      });

      // 强制刷新
      this.display_arr = this.display_arr.filter(function(e){
        return true;
      });
    },
    // 修改了本行的目标仓位
    chgRowDstPosition: function(row){
      if ('' == this.stock_id || '' == this.trade_price || 0 == this.trade_price) {
        return;
      }

      if ('single-buy' == this.cur_active) {
        // 指令数量 = （目标仓位 - 当前仓位）* 总资产／ 指令价格。再进行手数取整
        var gap_position = Math.max(row.dst_position / 100 - row.the_stock_position, 0);
        row.chg_amount = Math.floor(gap_position * row.total_assets / this.trade_price / this.stock_detail.trading_unit) * this.stock_detail.trading_unit;
      }else{
        // 指令数量 = （当前仓位 - 目标仓位）* 总资产／ 最新价格。再进行手数取整
        var gap_position = Math.max(row.the_stock_position - row.dst_position / 100, 0);
        // 卖出时。向上取整，然后与持仓数量比较取较小值
        row.chg_amount = Math.ceil(gap_position * row.total_assets / this.stock_detail.last_price / this.stock_detail.trading_unit) * this.stock_detail.trading_unit;
        row.chg_amount = Math.min(row.chg_amount, row.real_position_total_amount);
      }
      
      this.refreshDisplay();
    },
    chgRowChgPosition: function(row){
      if ('' == this.stock_id || '' == this.trade_price || 0 == this.trade_price) {
        return;
      }

      if ('single-buy' == this.cur_active) {
        // 指令数量 = 总资产比例／ 指令价格。再进行手数取整
        row.chg_amount = Math.floor(row.chg_position / 100 * row.total_assets / this.trade_price / this.stock_detail.trading_unit) * this.stock_detail.trading_unit;
      }else{
        // 指令数量 = 总资产比例／ 最新价格。再进行手数取整
        row.chg_amount = Math.ceil(row.chg_position / 100 * row.total_assets / this.stock_detail.last_price / this.stock_detail.trading_unit) * this.stock_detail.trading_unit;
        row.chg_amount = Math.min(row.chg_amount, row.real_position_total_amount);
      }
      
      this.refreshDisplay();
    },
    chgRowChgAmount: function(row){
      if ('' == this.stock_id || '' == this.trade_price || 0 == this.trade_price) {
        return;
      }
      if ('single-buy' == this.cur_active) {

        // Begin: 需求更改，删除修改后修改目标仓位和总资产比例的操作。
        // // 总资产比例 = 指令数量 * 指令价格 ／ 总资产
        // row.chg_position = row.chg_amount * this.trade_price / row.total_assets;
        // // 目标仓位 = 当前仓位 + 总资产比例
        // row.dst_position = row.position + row.chg_position;
        // row.chg_position = this.numeralNumber(row.chg_position * 100);
        // row.dst_position = this.numeralNumber(row.dst_position * 100);
        // End: 需求更改，删除修改后修改目标仓位和总资产比例的操作。
      }else{
        
      }
      
      this.refreshDisplay();
    },
    display_title: function(){
      if ('single-sell' == this.cur_active) {
        return '卖出';
      }else if('single-buy' == this.cur_active){
        return '买入';
      }
    },
    setSubmitData: function(obj){
      var _this = this;
      if (this.stock_id != obj.stock_id) {
        // 额外，清空该预览框的交易数量
        this.multi_num = '';
        this.chgMultiNum()
      }
      this.checkedProductList = obj.checkedProductList;
      this.stock_id = obj.stock_id;
      this.stock_detail = obj.stock_detail;
      this.trade_mode = obj.trade_mode;
      this.trade_price = obj.trade_price;
      this.add_ins_method = obj.add_ins_method;

      // 将多余的display_arr元素去除（即已经存在了display_arr但是obj中又没有的）
      this.display_arr = this.display_arr.filter(function(e){
        if (obj.checkedProductList.some(el => el.product_id == e.product_id)) {
          return true;
        }else{
          return false;
        }
      });

      // 针对已经记录的display_arr，采取修改内部元素的方式。
      this.display_arr.forEach(function(e){
        // 数量信息不修改，只修改股票、行情等
        obj.checkedProductList.forEach(function(el){
          if(e.product_id == el.product_id){
            // 资产总值
            e.total_assets = el.total_assets;
            // 当前持仓
            e.position = el.position;
            
            // TODO
          }
        })


      });

      // 判断以前display_arr没有存的数据，push进去
      obj.checkedProductList.forEach(function(e){
        if (_this.display_arr.some(function(el){
          return el.product_id == e.product_id;
        })) {
          ;
        }else{
          _this.display_arr.push(e);
        }
      });

      this.display_arr.forEach((e) => {
        let total_amount = 0;
        let market_value = 0;
        let all_market_value = 0;
        window.risk_position[e.product_id].data.forEach((el) => {
          if (el.stock_id == this.stock_id) {
            total_amount = el.total_amount;
            market_value = el.market_value;
          }
          all_market_value += el.market_value - 0;//强制转数字
        });

        let the_stock_position = 0;
        window.position_realtime.forEach(el => {
          if (this.stock_id == el.stock_id && el.product_id == e.product_id) {
            the_stock_position = el.weight;
            e.real_position_total_amount = el.total_amount;
          }
        })
        e.the_stock_position = the_stock_position;

        e.market_value = market_value;
        e.total_amount = total_amount;

      });

      this.refreshDisplay();
    }
  }
});


var tradeControllor = new Vue({
  el: '#trade-controllor',
  data: {
    // 市场类型
    curMarket: 'marketA',
    // 页签类型
    curActive: 'single-buy',   //'single-buy','single-sell','multi-buy','multi-sell','revert'
    // 是否隐藏
    showBoard: true,
    leftWidth: 0,
    wholeWidth: 0,
    stock_id: '',
  },
  // watch: {
  //   stock_id: {
  //     handle: function(){
  //       tradeFLow.chgStockId(this.stock_id);
  //     },
  //     deep: true
  //   }
  // },
  methods: {
    chgStockId: function(event){
      this.stock_id = event;
    },
    chgMenu: function(event){
      this.curMarket = event.curMarket;
      this.curActive = event.curActive;
      this.showBoard = event.showBoard;
    },
    setWidth: function(leftWidth, wholeWidth){
      this.leftWidth = leftWidth;
      this.wholeWidth = wholeWidth;
    }
  }
});

var product_list;
var product_ids;
$(window).on('multi_load',function(event){
  product_list = event.product_list;
  product_ids = event.product_ids;

  var intervalMap = new Map();
  // 获取风控规则
  var loadRiskRulesInfo = new Promise(function(resolve, reject){
    riskCheck.getRulesData(product_ids, function(){
      resolve();
    });
  });
  // 获取股票池
  var loadStockPoolInfo = new Promise(function(resolve, reject){
    riskCheck.getStockPoolData(function(){
      resolve();
    });
  });
  // 获取费用规则
  var loadFeeRulesInfo = new Promise(function(resolve, reject){
    riskCheck.getFeeData(product_ids, function(){
      resolve();
    });
  });
  // 获取指令数据
  var loadInsInfo = new Promise(function(resolve, reject){
    resolve();
    // // riskCheck.getRulesData(product_ids, function(){
    // //   resolve();
    // // });
    // $.ajax({
    //   url: window.REQUEST_PREFIX + '/sync/instruction/search_list',
    //   data: {
    //     count: 9999,
    //     type: 'manage',
    //     ins_status_arr: [-1, 2, 3, 4]
    //   },
    //   success: function(res){
    //     if (0 == res.code) {
    //       window.instructionList = res.data.list || [];
    //       resolve();
    //     }else{
    //       reject(res.msg);
    //     }
    //   },
    //   error: function(){
    //     reject('网络异常');
    //   }
    // })
  });

  // 获取运行时数据
  var loadRuntimeFn = function(resolve){
    var url = (window.REQUEST_PREFIX||'')+'/oms/api/get_multi_settlement_info';

    if (true == intervalMap.get('loadRuntimeFn')) {
      return;
    }
    intervalMap.set('loadRuntimeFn', true);

    $.get(url,{
      product_id: product_ids,
      unuse_cache: 1,
    }).done(function(res){
      if(res.code==0){
        window.runtime = res.data;
        // //合并数据
        // product_list.forEach(function(product){
        //   product.runtime = product.runtime || {};
        //   //采用合并老数据的方式，防止没有数据导致整行空白的问题
        //   $.extend(product.runtime, $.pullValue(res,'data.'+product.id+'.data'));
        // });

        //合并数据
        product_list.forEach(function(product){
          product.runtime = product.runtime || {};
          //采用合并老数据的方式，防止没有数据导致整行空白的问题
          $.extend(product.runtime, $.pullValue(res,'data.'+product.id+'.data'));
        });

        // 数据为什么会不更新呢？因为product_list一直都是“multi_load”拿过来的那个对象，所以使用变异方法来使得vue得知此次变化。
        instructionManagePage.ajaxProductList = product_list.filter(function(){
          return true;
        });

        intervalMap.set('loadRuntimeFn', false);

        if ('[object Function]' == Object.prototype.toString.call(resolve)) {
          resolve();
        }
      }else{
        $.omsAlert(res.msg);
      }
    }).fail($.failNotice.bind(null,url,'网络异常')).always(function(){
    });
  };
  var loadRuntimeInfo = new Promise(function(resolve, reject){
    loadRuntimeFn(resolve);
    setInterval(function(){
      if(!product_ids.length){return;}
      loadRuntimeFn();
    }, 4000 + parseInt(Math.random() * 1000));
  });

  // 获取委托单数据
  var loadEntrustFn = function(resolve){
    var url = (window.REQUEST_PREFIX||'') + '/oms/order/get_entrust_list?permission_type=product&type=all';

    if (true == intervalMap.get('loadEntrustFn')) {
      return;
    }
    intervalMap.set('loadEntrustFn', true);

    $.get(url,{
      product_id: product_ids,
      // unuse_cache: 1,
    }).done(function(res){
      if(res.code==0){
        window.entrust_info = res.data.list || [];
        
        intervalMap.set('loadEntrustFn', false);

        if ('[object Function]' == Object.prototype.toString.call(resolve)) {
          resolve();
        }
      }else{
        // window.entrust_info = [];
        $.omsAlert(res.msg);
      }
    }).fail($.failNotice.bind(null,url,'网络异常')).always(function(){
    });
  };
  var loadEntrustInfo = new Promise(function(resolve, reject){
    loadEntrustFn(resolve);
    setInterval(function(){
      if(!product_ids.length){return;}
      loadEntrustFn();
    }, 4000 + parseInt(Math.random() * 1000));
  });

  Promise.all([loadRiskRulesInfo, loadStockPoolInfo, loadFeeRulesInfo, loadInsInfo, loadRuntimeInfo, loadEntrustInfo]).then(function(){
    // console.log('此时才获取了交易所需要的基本数据。');
    // 此时获取了交易所需要的基本数据之后，根据product_list来绘制组件
    instructionManagePage.loadList(product_list);
  }).catch(function(err){
    $.omsAlert(err);
  })


  tradeControllor.$refs['trade-foot'].loadData();

  var last_order_create_nav_index = $.omsGetLocalJsonData('etc','order_create_nav_index',0);
  if (1 == last_order_create_nav_index) {
    tradeControllor.$refs['trade-menu'].chgActive('single-sell');
  }else{
    tradeControllor.$refs['trade-menu'].chgActive('single-buy');
  }

  (function(){
    //根据交易时段显示／收缩底部菜单栏
    var url = (window.REQUEST_PREFIX||'')+"/oms/helper/is_trade_day";
    $.get(url).done(function(res){
      if (0 == res.code) {
        if (1 == res.data.is) {
          window.is_trade_day = true;
          tradeControllor.do_hide = false;
        }else{
          window.is_trade_day = false;
          tradeControllor.do_hide = true;
        }
      }
    });
  })();

  /** Begin: 委托／指令创建部分布局照抄以前的方式 代码来自于multi/product/main.blade.php */
  var me = $(this);
  $('html').css('background','#fff');
  $(function(){
    var section_height = 271;
    var section = $('html').find('section.create-order').first();

    if(/mobile/i.test(navigator.userAgent)){return section.find('>.head').hide();}

    $('html').addClass('black-turnoff');//全局使用 黑色主题
    $('section.create-order').first().addClass('fixed transition');

    var container = me.closest('.main-container');
    var side_nav = $('html').find('.side-nav').first();
    var scroll_reable_transition;

    strategy_scrollbar_full();

    function strategy_scrollbar_full(){
      var ghost_section = $('<div>').appendTo(container);
      $(window).on('table:rendered order_create:nav:change side_nav_status:changed resize scroll',resize);

      resize({type:null});
      function resize(event){
        if(event.type=='scroll'){
          clearTimeout(scroll_reable_transition);
          section.removeClass('transition');
          scroll_reable_transition = setTimeout(function(){
              event.type == 'scroll' && section.addClass('transition');
          });
        }

        var side_nav_status = side_nav.is('.open') ? 'open' : 'close';
        var left = side_nav_status=='close' ? 60 : (side_nav.width()||255);
        var side_nav_width = side_nav_status=='close' ? 60 : (side_nav.width()||255);
        // var left = 60;
        left -= window.scrollX;
        var tmpWidth = container.outerWidth();
        section.css({
          'left': left
        });
        ghost_section.height(section.height());

        // 修改底部宽度
        let leftWidth = Math.max($('.container-fluid').outerWidth() + window.scrollX - side_nav_width, 1080);
        tradeControllor.setWidth(leftWidth, $('.main-container').outerWidth());
      }
    }
  });
  /** End: 委托／指令创建部分布局照抄以前的方式 */

  // var getRiskPostion = function(){
  //   //######################### 风控增补数据 ########################
  //   // $.get((window.REQUEST_PREFIX||'')+'/oms/helper/risk_position',{product_id:product_ids}, function(res){
  //   //   if (0 == res.code) {
  //   //     window.risk_position = res.data;
  //   //   }
  //   // });
  //   //######################### 风控增补数据 ########################

  //   //######################### 持仓数据 ########################
  //   // $.get((window.REQUEST_PREFIX||'')+'/oms/api/multi_position_realtime',{product_id:product_ids}, function(res){
  //   //   if (0 == res.code) {
  //   //     window.position_realtime = res.data;
  //   //   }
  //   // });
  //   //######################### 持仓数据 ########################

  //   // Begin: 行情数据 暂时不需要这些数据，因为已经从别的地方拿了。
  //   // $.get( window.REQUEST_PREFIX + '/oms/api/multi_position_realtime',{product_id:product_ids}, function(res){
  //   //   if (0 == res.code) {
  //   //     window.runtime_position = res.data;
  //   //   }
  //   // });
  //   // End: 行情数据
  // };
  // getRiskPostion();
  // setInterval(function(){
  //   getRiskPostion();
  // },5000);
  
  instructionManagePage.$refs['product-position'].loadOrderList();
  setInterval(function(){
    instructionManagePage.$refs['product-position'].loadOrderList();
  },5000);
})
