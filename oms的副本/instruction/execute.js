/**
 * 指令执行页面
 * Author: liuzeyafzy@gmail.com
 */

let instructionExecutePage;
let tradeControllor;
let market = 'marketA';

// 指令执行表格数据
let instructionExecuteData = {
  typeStr: '',
  order: '',
  order_by: '',
  display_rules: [{
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
    class: 'left20'
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
    type: 'text', // 当前挂单
    id: 'pending_order_number',
    label: '当前挂单',
    format: '',
    class: 'left20'
  },{
    type: 'percent2',
    id: 'complete_progress',
    sub_id: 'progress',
    label: '执行进度',
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
  
  // },{
  //   type: 'text',
  //   id: 'status_name',
  //   label: '指令状态',
  //   format: '',
  //   class: 'left20'
  },{
    type: 'btn',
    id: 'status',
    label: '操作',
    format: ['displayStatusForExecute'],
    btnClickFn: 'doExecute',
    class: 'left20 width100'
  }]
};

let entrust_query_arr = [{
  id: 'entrustAndDeal',
  uri: window.REQUEST_PREFIX + '/oms/order/getEntrustAndDealList?permission_type=product&type=all&count=9999&market=1',
  gridDataStr: 'entrustAndDealGrid',
  display_rules: [{
    id: 'product_name',
    label: '产品',
    format: '',
    class: 'cell-left'
  },{
    id: 'stock_id',
    label: '证券代码',
    format: '',
    class: 'cell-left'
  },{
    id: 'stock_name',
    label: '证券名称',
    format: '',
    class: 'cell-left'
  },{
    id: 'entrust_type_name',
    label: '买卖标志',
    class: 'cell-left'
  },{
    id: 'entrust_amount_by_group',
    label: '有效委托数量',
    format: ['numeralNumber', 0],
    tips: '有效委托数量不含废单及已撤销的委托数量',
    class: 'cell-right'
  },{
    id: 'ins_volume_by_group',
    label: '成交数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'deal_avg_price',
    label: '成交均价',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  }]
},{
  id: 'entrustListA',
  uri: window.REQUEST_PREFIX + '/oms/order/get_entrust_list?permission_type=product&type=all&count=9999&market=1',
  gridDataStr: 'entrustListAGrid',
  // 证券代码 证券名称 买卖标志 产品 委托价格 委托数量 成交均价 成交数量 已撤数量 订单状态 报价方式 参考汇率 委托时间 更新时间
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
    id: 'bs_symbol_text',
    label: '买卖标志',
    class: 'cell-left'
  },{
    id: 'product_name',
    label: '产品',
    class: 'cell-left'
  },{
    id: 'entrust_price',
    label: '委托价格',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  },{
    id: 'entrust_amount',
    label: '委托数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'deal_price',
    label: '成交均价',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  },{
    id: 'deal_amount',
    label: '成交数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'cancel_volume',
    label: '已撤数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'vendor_status_text',
    label: '订单状态',
    class: 'cell-right'
  },{
    id: 'quote_type_text',
    label: '报价方式',
    format: '',
    class: 'cell-right'
  },{
    id: 'exchange_rate',
    label: '参考汇率',
    format: '',
    class: 'cell-right'
  },{
    id: 'created_at',
    label: '委托时间',
    format: ['unixTime', 3],
    class: 'cell-right'
  },{
    id: 'updated_at',
    label: '更新时间',
    format: ['unixTime', 3],
    class: 'cell-right'
  }]
},{
  id: 'entrustListH',
  uri: window.REQUEST_PREFIX + '/oms/order/get_entrust_list?permission_type=product&type=all&count=9999&market=2',
  gridDataStr: 'entrustListHGrid',
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
    id: 'bs_symbol_text',
    label: '买卖标志',
    class: 'cell-left'
  },{
    id: 'product_name',
    label: '产品',
    class: 'cell-left'
  },{
    id: 'entrust_price',
    label: '委托价格',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  },{
    id: 'entrust_amount',
    label: '委托数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'deal_price',
    label: '成交均价',
    format: ['numeralNumber', 3],
    class: 'cell-right'
  },{
    id: 'deal_amount',
    label: '成交数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'cancel_volume',
    label: '已撤数量',
    format: ['numeralNumber', 0],
    class: 'cell-right'
  },{
    id: 'vendor_status_text',
    label: '订单状态',
    class: 'cell-right'
  },{
    id: 'quote_type_text',
    label: '报价方式',
    format: '',
    class: 'cell-right'
  },{
    id: 'exchange_rate',
    label: '参考汇率',
    format: '',
    class: 'cell-right'
  },{
    id: 'created_at',
    label: '委托时间',
    format: ['unixTime', 3],
    class: 'cell-right'
  },{
    id: 'updated_at',
    label: '更新时间',
    format: ['unixTime', 3],
    class: 'cell-right'
  }]
}];



$(window).on('multi_load', function(event){
  var product_list = event.product_list;
  var product_ids = event.product_ids;
  
  // 指令管理表格
  Vue.component('vue-instruction-execute', {
    // props: ['ajax_list'],
    template: `
      <div class="instruction-manage">
        <div class="instruction-manage__header" style="padding: 10px 30px 10px;display: flex;">
          <h2 style="display: inline-block;">{{title}}</h2>
          <div style="flex:1"></div>
          <label style="margin-right: 20px;padding-top: 10px;"><i style="width: 12px;height: 12px;display: inline-block;background: #FB8927;margin-right: 5px;"></i>已完成比例</label>
          <label style="margin-right: 40px;padding-top: 10px;"><i style="width: 12px;height: 12px;display: inline-block;background: #FFDE00;margin-right: 5px;"></i>挂单比例</label>
          <a @click="loadManageList()" class="bem-ui-btn bem-ui-btn__refresh-btn" v-bind:class="{'loading': 'loading' == loadingStatus}"><i></i>刷新</a>
        </div>
        <table class="instruction-manage__body newweb-common-grid oms-nothing-table" v-bind:class="{'nothing': showManageList.length == 0}">
          <thead>
            <tr>
              <vue-common-grid-th v-for="rule in rulesData.display_rules" :rule="rule" :row="gridHead" @change="chgAll($event)"></vue-common-grid-th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in showManageList">
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
        title: '指令执行',
        ajax_list: [],
        loadingStatus: '',
        rulesData: instructionExecuteData,
        showAborted: true,
        showFinished: true,
        gridHead: {
          web_checked: false
        },
        // checkedAll: false,
        // ajaxManageList: [],
        showManageList: [],
      }
    },
    beforeMount: function(){
      this.loadManageList();
    },
    watch: {
      ajax_list: function(){
        this.readyShowList();
      },
      showManageList: {
        handler: function(){
          if (this.showManageList.every(e => true === e.web_checked)) {
            this.gridHead.web_checked = true;
          }else{
            this.gridHead.web_checked = false;
          }
        },
        deep: true
      }
    },
    methods: {
      loadManageList: function(){
        let _this = this;
        this.loadingStatus = 'loading';
        $.ajax({
          url: window.REQUEST_PREFIX + '/sync/instruction/search_list',
          data: {
            count: 9999,
            type: 'execute',
            ins_status_arr: [-1, 2, 3, 4]
          },
          success: function(res){
            _this.loadingStatus = '';
            if (0 == res.code) {
              _this.ajax_list = res.data.list || [];
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
        this.ajax_list.forEach((e) => {
          let obj = {};
          obj.web_checked = false;
          obj.id = e.instruction.id;
          // 股票代码
          obj.stock_id = e.stock.stock_id;
          // 股票名称
          obj.stock_name = e.stock.stock_name;
          // 产品名称
          obj.product_name = e.gathering.product_name_list.join('，');
          obj.sub_list = e.sub_list;

          // 交易方向、买卖标志
          obj.deal_direction = e.gathering.deal_direction;
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
          // 本次调仓
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
          // 当前挂单
          obj.pending_order_number = e.gathering.pending_order_number;
          // 完成进度百分比
          obj.progress = e.gathering.progress;
          // 挂单进度百分比
          obj.complete_progress = e.gathering.complete_progress;
          // 创建日期
          obj.created_at = e.instruction.created_at;
          // 创建人
          obj.creator_name = e.instruction.creator_name;
          // 基金经理
          obj.fund_manager_name = e.instruction.fund_manager_name;
          // 指令状态
          obj.status_name = e.instruction.status_name;
          obj.status = e.instruction.status; //(2提交成功，3正在执行，4执行完毕，-1终止执行)
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

  // 订单列表
  let orginfo_theme = window.LOGIN_INFO.org_info.theme;// 非3表示机构版
  Vue.component('vue-order-list', {
    template: `
      <section class="order-list new-design">
        <a id="anchor-orderlist" style="position: relative;top:-65px;display: block;height: 0;width:0;"></a>
        <div class="hd">
          <span class="section-title">订单</span>
          
          <span class="order-list-ctrls left loading-loading list-ctrls">
            <label v-if="3 == orginfo_theme" class="order-label" v-bind:class="{'active': curActive == 'entrust'}"><input v-model="curActive" type="radio" name="display_type" value="entrust" />今日委托（{{entrustGrid_listNum || 0}}笔）</label>
            <label v-if="3 == orginfo_theme" class="order-label" v-bind:class="{'active': curActive == 'deal'}"><input v-model="curActive" type="radio" name="display_type" value="deal" />今日成交（{{dealGrid_listNum || 0}}笔）</label>
            <label v-if="3 != orginfo_theme" class="order-label" v-bind:class="{'active': curActive == 'entrustAndDeal'}">
              <input v-model="curActive" type="radio" name="display_type" value="entrustAndDeal" />
              委托成交汇总
            </label>
            <label v-if="3 != orginfo_theme" class="order-label" v-bind:class="{'active': curActive == 'entrustListA'}">
              <input v-model="curActive" type="radio" name="display_type" value="entrustListA" />
              委托明细A（{{entrustListAGrid_listNum || 0}}笔）
            </label>
            <label v-if="3 != orginfo_theme && false" class="order-label" v-bind:class="{'active': curActive == 'entrustListH'}">
              <input v-model="curActive" type="radio" name="display_type" value="entrustListH" />
              委托明细H（{{entrustListHGrid_listNum || 0}}笔）
            </label>
          </span>
          <span v-if="'entrustListA' == curActive || 'entrustListH' == curActive || (orginfo_theme == 3 && curActive == 'entrust')" class="order-list-ctrls left loading-loading">
            <label style="margin-right: 20px;"><input style="margin-right: 5px;" type="checkbox" v-model="hideRevert" />隐藏已撤</label>
            <label style="margin-right: 20px;"><input style="margin-right: 5px;" type="checkbox" v-model="hideDeal" />隐藏已成</label>
            <label style="margin-right: 20px;"><input style="margin-right: 5px;" type="checkbox" v-model="hideIssue" />隐藏废单</label>
          </span>
          <a class="oms-btn gray refresh-btn loading-loading right" v-bind:class="{'loading': loadingNum > 0}" href="javascript:;" v-on:click="loadOrderList"><i class="oms-icon refresh"></i>刷新</a>
          <a v-if="curActive == 'revert' || (orginfo_theme == 3 && curActive == 'entrust')" class="oms-btn red revert-btn  right" href="javascript:;" v-on:click="doRevert">撤单</a>
        </div>
        <table class="oms-table loading-loading nothing-nothing" v-bind:class="{'nothing': Object.keys(temporary_order).length == 0 && activeGridList.length == 0}">
          <tbody>
            <tr>
              <th v-if="curActive == 'revert' || (orginfo_theme == 3 && curActive == 'entrust')" style="width: 40px;"></th>
              <th v-if="rule.hide_flag != true" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                <span v-text="rule.label"></span>
                <prompt-language style="width: 15px;display: inline-block;position: absolute;right: -10px;top: 6px;" v-if="'' != rule.tips && undefined != rule.tips" :language_val="rule.tips"></prompt-language>
              </th>
            </tr>
          </tbody>
          <tbody>
            <tr v-if="Object.keys(temporary_order).length > 0">
              <td v-if="curActive == 'revert' || (orginfo_theme == 3 && curActive == 'entrust')">
                <input :disabled="checkDisabled(temporary_order)" type="checkbox" v-model="temporary_order.web_checked" v-on:change="chgSelect(temporary_order)" />
              </td>
              <td v-on:click="changeShow(temporary_order)" v-if="rule.hide_flag != true" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                <span v-bind:class="displayClass(temporary_order, rule)" v-text="displayValue(temporary_order, rule)"></span>
                <div v-if="rule.withMultiIcon && temporary_order.is_batch" v-bind:class="{'icon-show': temporary_order.web_showChildren, 'icon-hide': !temporary_order.web_showChildren}"></div>
              </td>
            </tr>
            <tr v-for="row in activeGridList" v-show="checkShow(row)" v-bind:class="{'sub_order': row.is_sub, 'display_multi': row.web_showChildren}">
              <td v-if="curActive == 'revert' || (orginfo_theme == 3 && curActive == 'entrust')">
                <input :disabled="checkDisabled(row)" type="checkbox" v-model="row.web_checked" v-on:change="chgSelect(row)" />
              </td>
              <td v-on:click="changeShow(row)" v-if="rule.hide_flag != true" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                <span v-bind:class="displayClass(row, rule)" v-text="displayValue(row, rule)"></span>
                <div v-if="rule.withMultiIcon && row.is_batch" v-bind:class="{'icon-show': row.web_showChildren, 'icon-hide': !row.web_showChildren}" ></div>
                <span v-if="rule.withStockType && (3 == checkStockType(row[rule.id]) || 4 == checkStockType(row[rule.id]))" v-bind:class="displayStockClass(row, rule)">
                    {{ displayStockType(row[rule.id]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    `,
    data: function(){
      return {
        // 已经选中的产品信息
        product_list: [],
        checked_count: 0,

        me_can_trade: true,
        gridData: [],
        curActive: (3 == orginfo_theme) ? 'entrust' : 'entrustAndDeal',
        // 记录showChildrenList为true的id
        showChildrenList: new Map(),

        orginfo_theme: orginfo_theme,
        temporary_order: {},

        hideRevert: false,
        hideDeal: false,
        hideIssue: false,

        // 委托列表
        entrustGrid: {},
        entrustGrid_listNum: 0,
        entrustGrid_midGridList: [],
        // 机构版撤单相关已无用，已经改到了底部的菜单
        revertGrid: {},
        revertGrid_listNum: 0,
        revertGrid_midGridList: [],
        // 成交列表
        dealGrid: {},
        dealGrid_listNum: 0,
        dealGrid_midGridList: [],
        // 委托成交列表
        entrustAndDealGrid: {},
        entrustAndDealGrid_listNum: 0,
        entrustAndDealGrid_midGridList: [],
        // 委托明细A
        entrustListAGrid:{},
        entrustListAGrid_listNum: 0,
        entrustListAGrid_midGridList: [],
        // 委托明细H
        entrustListHGrid:{},
        entrustListHGrid_listNum: 0,
        entrustListHGrid_midGridList: [],

        query_arr: entrust_query_arr,
        orderNum: 0,
        // last_loading_timestamp: '',
        loadingNum: 0
      }
    },
    computed: {
      activeGridList: function(){
        var _this = this;
        if ('entrust' == this.curActive) {
          this.entrustGrid_listNum = this.entrustGridList.length;
          return this.entrustGridList;
        }

        if ('revert' == this.curActive) {
          this.revertGrid_listNum = this.revertGridList.length;
          return this.revertGridList;
        }

        if ('deal' == this.curActive) {
          this.dealGrid_listNum = this.dealGridList.length;
          return this.dealGridList;
        }

        // 新增判断所有列表在当前组合选中情况下的数量
        if (0 != this.checked_count) {
          var tmpRtn1 = [];
          var tmpRtn2 = [];
          var tmpRtn3 = [];
          this.product_list.forEach(function(ele){
            if (true == ele.checked) {
              _this.entrustAndDealGridList.forEach(function(e){
                if (e.product_id == ele.product_id){
                  tmpRtn1.push(e);
                }
              });

              _this.entrustListAGridList.forEach(function(e){
                if (e.product_id == ele.product_id){
                  tmpRtn2.push(e);
                }
              });

              _this.entrustListHGridList.forEach(function(e){
                if (e.product_id == ele.product_id){
                  tmpRtn3.push(e);
                }
              });
            }
          });
          _this['entrustAndDealGrid_listNum'] = tmpRtn1.length;
          _this['entrustListAGrid_listNum'] = tmpRtn2.length;
          _this['entrustListHGrid_listNum'] = tmpRtn3.length;
        }else{
          _this['entrustAndDealGrid_listNum'] = _this.entrustAndDealGridList.length;
          _this['entrustListAGrid_listNum'] = _this.entrustListAGridList.length;
          _this['entrustListHGrid_listNum'] = _this.entrustListHGridList.length;
        }

        // 委托成交汇总
        if ('entrustAndDeal' == this.curActive) {
          if (0 == this.checked_count) {
            _this['entrustAndDealGrid_listNum'] = this.entrustAndDealGridList.length;
            return this.entrustAndDealGridList;
          }else{
            var rtn = [];
            this.product_list.forEach(function(ele){
              if (true == ele.checked) {
                _this.entrustAndDealGridList.forEach(function(e){
                  if (e.product_id == ele.product_id){
                    rtn.push(e);
                  }
                });
              }
            });
            _this['entrustAndDealGrid_listNum'] = rtn.length;
            return rtn;
          }
        }

        // 委托A
        if ('entrustListA' == this.curActive) {
          // return this.entrustListAGridList;
          if (0 == this.checked_count) {
            _this['entrustListAGrid_listNum'] = this.entrustListAGridList.length;
            return this.entrustListAGridList;
          }else{
            var rtn = [];
            this.product_list.forEach(function(ele){
              if (true == ele.checked) {
                _this.entrustListAGridList.forEach(function(e){
                  if (e.product_id == ele.product_id){
                    rtn.push(e);
                  }
                });
              }
            });
            rtn = rtn.sort(function(a,b){
              return b.created_at - a.created_at;
            });
            _this['entrustListAGrid_listNum'] = rtn.length;
            return rtn;
          }
        }

        // 委托H
        if ('entrustListH' == this.curActive) {
          // return this.entrustListHGridList;
          if (0 == this.checked_count) {
            _this['entrustListHGrid_listNum'] = this.entrustListHGridList.length;
            return this.entrustListHGridList;
          }else{
            var rtn = [];
            this.product_list.forEach(function(ele){
              if (true == ele.checked) {
                _this.entrustListHGridList.forEach(function(e){
                  if (e.product_id == ele.product_id){
                    rtn.push(e);
                  }
                });
              }
            });
            rtn = rtn.sort(function(a,b){
              return b.created_at - a.created_at;
            });
            _this['entrustListHGrid_listNum'] = rtn.length;
            return rtn;
          }
        }

        return [];
      },
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
      entrustGridList: function(){
        var _this = this;
        var str = 'entrustGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });

        show_batchs.forEach(function(e){
          if (_this.showChildrenList.get(e.batch_no)) {
            e.web_showChildren = true;
          }
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      },
      dealGridList: function(){
        var str = 'dealGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      },
      // 委托成交汇总
      entrustAndDealGridList: function(){
        var str = 'entrustAndDealGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      },
      // 委托A
      entrustListAGridList: function(){
        var str = 'entrustListAGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      },
      // 委托H
      entrustListHGridList: function(){
        var str = 'entrustListHGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      },
      // 可撤单（已废弃）
      revertGridList: function(){
        var str = 'revertGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      }
    },
    methods: {
      hideStockType: function(val){
        return val.split(/\./)[0];
      },
      displayStockClass: function(row, rule){
        var value = row[rule.id];
        var type = this.checkStockType(value);
        if (3 == type) {
          return 'stock-type-hksh';
        }
        if (4 == type) {
          return 'stock-type-hksz'
        }
      },
      checkStockType: function(value){
        if (/\.sh/.test(value.toLowerCase())) {
          return 1;
        }
        if (/\.sz/.test(value.toLowerCase())) {
          return 2;
        }
        if (/\.hksh/.test(value.toLowerCase())) {
          return 3;
        }
        if (/\.hksz/.test(value.toLowerCase())) {
          return 4;
        }
      },
      displayStockType: function(value){
        var type = this.checkStockType(value);
        if (3 == type) {
          return '沪港通'
        }
        if (4 == type) {
          return '深港通'
        }
      },
      changeShow: function(row){
        if (row.is_batch) {
          row.web_showChildren = !row.web_showChildren;

          if (row.web_showChildren == true) {
            this.showChildrenList.set(row.batch_no, true);
          }else{
            this.showChildrenList.set(row.batch_no, false);
          }
        }
      },
      checkDisabled: function(row){
        return (this.statusClass(row) !== 'red' || 6 == row.status || 8 == row.status || 105 == row.status || 108 == row.status) ? true : false
      },
      checkShow: function(row){
        if (row.do_hide) {
          return false;
        }
        if (row.status == 7 && this.hideRevert) {
          return false;
        }
        // if ((row.status == 5 || row.status == 105) && this.hideDeal) {
        //   return false;
        // }
        if ((this.isFinish(row) && row.status != 7 && row.status != 8) && this.hideDeal) {
          return false;
        }
        if (row.status == 8 && this.hideIssue) {
          return false;
        }

        return true;
      },
      doRevert: function(){
        var _this = this;
        var doRevertArr = [];
        var htmlArr = [];
        this.activeGridList.forEach(function(e){
          if (e.is_batch != true && e.web_checked && !(+e.cancel_status) && [1,2,4].some(function(el){
            return el == e.status
          })) {
            doRevertArr.push(e);
            htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left">' + e.product_name + '</td>' +
              '<td class="cell-left">' + e.stock_id + ' ' + e.stock_name + '</td>' +
              '<td class="cell-left">' + _this.entrustTypeCH(e.entrust_type) + '</td>' +
              '<td class="cell-right">' + _this.numeralNumber(e.entrust_price, 3) + '</td>' +
              '<td class="cell-right">' + e.entrust_amount + '</td></tr>');
            
          }
        });

        if (doRevertArr.length == 0) {
          $.omsAlert('请选择需要撤单的订单');
          return;
        }

        var html = htmlArr.join('');
        var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;"><tr><th class="cell-left">策略</th>'+
          '<th class="cell-left">证券</th>'+
          '<th class="cell-left">买卖标志</th>'+
          '<th class="cell-right">委托价格</th>'+
          '<th class="cell-right">委托数量(股)</th></tr>'+html+'</tbody></table>';

        $.confirm({
          title: '撤单确认',
          content: confirmHtml,
          closeIcon: true,
          confirmButton: '确定',
          cancelButton: false,
          confirm: function(){
            var results = [];

            $.startLoading('正在批量撤单...');
            doRevertArr.forEach(function(order){
              order.cancel_res = null;
              results.push(order);
              setTimeout(function(){
                var url = (window.REQUEST_PREFIX||'')+'/oms/workflow/'+order.product_id+'/'+order.id +'/do_cancel?workflow_id=' + order.id;

                if (3 != _this.orginfo_theme) {
                  url = (window.REQUEST_PREFIX||'')+'/oms/workflow/' + order.product_id + '/direct_cancel?entrust_id=' + order.entrust_id + '&stock_id=' + order.stock_code;
                }
                
                $.post(url).done(function(res){
                    order.cancel_res = res;
                }).fail(function(){
                    order.cancel_res = {code:110,msg:'网络错误！'};
                }).always(function(){
                  _this.checkResults(results);
                });
              },Math.random()*500);
            });

          }
        });
      },
      checkResults: function(results){


        var _this = this;
        var waiting_num = results.filter(function(order){
            return !order.cancel_res;
        }).length;
        if(waiting_num){return;}

        var filter_res = {success:[],fail:[]};
        results.forEach(function(order){
            filter_res[$.pullValue(order,'cancel_res.code',NaN) == 0 ? 'success' : 'fail'].push(order);
        });

        var htmlArr = [];
        filter_res.fail.forEach(function(e){
          htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left max-width-120" title="'+ e.product_name +'">' + e.product_name + '</td>' +
            '<td class="cell-left">' + e.stock_id + ' ' + e.stock_name + '</td>' +
            '<td class="cell-left">' + _this.entrustTypeCH(e.entrust_type) + '</td>' +
            '<td class="cell-right">' + _this.numeralNumber(e.entrust_price, 3) + '</td>' +
            '<td class="cell-right">' + e.entrust_amount + '</td>' +
            '<td>' + e.cancel_res.msg + '</td>' +
            '</tr>');
        });

        var html = htmlArr.join('');
        var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;">'+
          '<tr>'+
          '<th class="min-width-40 max-width-120 cell-left">策略</th>'+
          '<th class="min-width-40 cell-left">证券</th>'+
          '<th class="min-width-40 cell-left">买卖标志</th>'+
          '<th class="min-width-40 cell-right">委托价格</th>'+
          '<th class="min-width-40 cell-right">委托数量(股)</th>'+
          '<th class="min-width-40 cell-right">备注</th>' +
          '</tr>'+html+'</tbody></table>';

        $.clearLoading();

        if (filter_res.fail.length == 0) {
          $.omsAlert('撤单请求提交成功')
        }else{
          $.confirm({
            title: '失败提示',
            content: confirmHtml,
            closeIcon: true,
            confirmButton: '确定',
            cancelButton: false
          });
        }

        setTimeout(function(){
          _this.loadOrderList();
        });
        setTimeout(function(){
            _this.loadOrderList();
        }, 2000);
        
      },
      chgSelect: function(row){
        if (row.is_batch) {
          // 修改批量的选中框之后，修改其子项的选中框
          row.orders.forEach(function(e){
            e.web_checked = row.web_checked;
          })
        }
      },
      getGridList: function(str){
        let _this = this;
        var rtn = [];

        // 后端接口返回格式不统一，"委托成交汇总"接口不返回entrust、deal这样的结构，没办法，只能走特殊分支处理
        if('entrustAndDealGrid' == str){
          this[str].list.forEach(function(e){
            var obj = {};
            obj.product_id = e.product_id;
            obj.product_name = e.product_name;
            obj.deal_volume_by_group = e.deal_volume_by_group;
            obj.entrust_amount_by_group = e.entrust_amount_by_group;
            obj.stock_code = e.stock_code;
            obj.stock_id = e.stock_code;
            obj.stock_name = e.stock_name;
            obj.entrust_type_name = e.entrust_type_name;
            obj.deal_avg_price = e.deal_avg_price;
            rtn.push(obj);
          });
          this[str + '_midGridList'] = rtn;
          return;
        }

        this.temporary_order = {};

        this[str].list.forEach(function(e){
          var obj = {};
          obj.web_checked = false;
          // 批量处理序号
          obj.batch_no = e.entrust.batch_no;
          // 证券代码
          // obj.stock_id = e.stock_info ? e.stock_info.stock_id : '';
          obj.stock_id = ('' == e.stock.code) ? (e.stock_info ? e.stock_info.stock_id : '') : e.stock.code;
          // 机构版撤单id，仅revert表格使用
          obj.entrust_id = e.entrust_id;
          // 机构版股票代码，仅revert表格使用
          obj.stock_code = e.stock ? e.stock.code : '';
          // 证券名称
          obj.stock_name = ('' == e.stock.name) ? (e.stock_info ? e.stock_info.stock_name : '') : e.stock.name;
          // 买卖标志
          obj.entrust_type = e.entrust.type;
          // 策略
          obj.product_name = e.product ? e.product.name : '';
          // 委托价格
          obj.entrust_price = e.entrust.price;
          // 委托数量
          obj.entrust_amount = parseFloat(e.entrust.amount);
          // 成交均价
          obj.deal_price = e.deal.price;
          // 成交数量
          obj.deal_amount = e.deal.amount;
          // 已撤数量
          obj.cancel_volume = e.entrust.cancel_volume;
          // 订单状态
          obj.status = e.status;
          // 报价方式
          obj.entrust_model = e.entrust.model;
          // 委托时间
          obj.created_at = e.created_at;
          // 更新时间 //在已成交的订单中，这就是成交时间
          obj.updated_at = e.updated_at;

          // 汇率
          obj.exchange_rate = e.entrust.exchange_rate;
          // 买卖方向
          obj.bs_symbol_text = e.entrust.bs_symbol_text;
          // 报价方式
          obj.quote_type_text = e.entrust.quote_type_text;
          // 订单状态
          obj.vendor_status_text = e.entrust.vendor_status_text;

          obj.cancel_status = e.cancel_status;
          obj.id = e.id;
          obj.product_id = e.product_id;


          rtn.push(obj);
        });

        var batch_orders = {};
        rtn.forEach(function(e){
          if (e.batch_no) {
            e.sub_order = e.batch_no;
            (batch_orders[e.batch_no] = batch_orders[e.batch_no] || []).push(e);
          }
        });

        rtn = rtn.sort(function(a, b){
          // return a.batch_no < b.batch_no ? 1 : -1;
          return a.created_at < b.created_at ? 1 : -1;
        })

        var show_batchs = [];
        for(var batch_no in batch_orders){
          if (batch_orders[batch_no].length>1) {

          }
          // 得到批量的显示内容
          var first_order = batch_orders[batch_no].sort(function(o1,o2){
            return o1.updated_at>o2.updated_at ? 1 : -1;
          })[0];

          // todo 这里的参数格式要变一下
          var batch = {
            is_batch: true,

            web_checked: false,
            web_showChildren: false,

            batch_no: first_order.batch_no,
            updated_at: first_order.updated_at,
            created_at: first_order.created_at,

            orders: batch_orders[batch_no],

            // 证券代码
            stock_id : first_order.stock_id,
            // 证券名称
            stock_name : first_order.stock_name,
            // 买卖标志
            entrust_type : first_order.entrust_type,
            // 策略
            product_name : '多策略',//first_order.product_name,
            // 委托价格
            entrust_price : first_order.entrust_price,
            // 委托数量
            entrust_amount : 0, // first_order.entrust_amount,
            // 成交均价
            deal_price : 0, //first_order.deal_price,
            deal_value : 0, //first_order.deal_value,
            // 成交数量
            deal_amount : 0, //first_order.deal_amount,
            // 已撤数量
            cancel_volume: 0,
            // 订单状态
            status : 0, //first_order.status,
            // 报价方式
            entrust_model : first_order.entrust_model,
            // 委托时间
            created_at : first_order.created_at,
            // 更新时间 //在已成交的订单中，这就是成交时间
            updated_at : first_order.updated_at,

            product: {
                name: '多策略',
                length: batch_orders[batch_no].length
            },

            all_status: [],

            cancel_status: "",
            all_cancel_status: [],
            can_cancel: false,

            all_finish_status: []//,

            // me_can_trade: first_order.me_can_trade
          };

          batch_orders[batch_no].forEach(function(order){
            var deal_price = +$.pullValue(order,'deal_price')||0;
            var deal_amount = +$.pullValue(order,'deal_amount')||0;
            var deal_value = deal_price*deal_amount;

            // $.pushValue(order,'deal_value',deal_value);
            batch.deal_value += deal_value;
            batch.deal_amount += deal_amount;
            batch.deal_price = batch.deal_amount ? batch.deal_value/batch.deal_amount : 0;

            var entrust_amount = +$.pullValue(order,'entrust_amount')||0;
            batch.entrust_amount += entrust_amount;

            batch.all_status.push(+order.status||0);
            batch.all_cancel_status.push(+order.cancel_status||0);

            order.can_cancel = /1|2|4/.test( order.status ) && !/1|2/.test( order.cancel_status );

            order.is_finish = _this.isFinish(order);
            batch.all_finish_status.push(order.is_finish?1:0);

            //########## 断定是否可以撤单
            batch.can_cancel = batch.can_cancel || order.can_cancel;
          });

          //########### Batch 状态处理
          // 这里for循环最终执行的条件似乎是：all_status是全为一个数字元素的数组。比如说：[1,1,1,1,1,1,1]
          [1,2,3,4,5,6,7,8,9].forEach(function(status_no){
            batch.all_status.filter(function(status){return status==status_no}).length == batch.all_status.length && (batch.status = status_no);
          });
          // 这里for循环最终执行的条件似乎是：all_cancel_status是全为一个数字元素的数组。
          [1,2].forEach(function(cancel_status_no){
            batch.all_cancel_status.filter(function(cancel_status){
              return cancel_status==cancel_status_no
            }).length == batch.all_cancel_status.length && (batch.cancel_status = cancel_status_no);
          });

          // 多策略状态展示逻辑遵守单策略订单状态显示逻辑
          // 以已完成、已完成（有废单）、未完成描述策略订单状态。
          // 1、当策略订单中有待完成的订单时：委托、部分成交、等待撤单等，显示未完成。
          // 2、当策略订单中所有订单操作时：全部成交、全部撤单显示已完成；
          // 3、当策略中有废单，其余订单全部完成时，显示：已完成（有废单）

          // 这里的枚举实在是不清楚什么含义
          if(!batch.status){
            batch.status = /0/.test( batch.all_finish_status.join('') ) ? 101 : (
              /8/.test( batch.all_status.join('') ) ? 108 : 105
            );
          }

          show_batchs.push(batch);
        }

        // 这里实际上也包含了只有一个元素的带有batch_no的数据列，在随后的插入数据操作中注意过滤
        show_batchs = show_batchs.filter(function(e){
          return e.orders.length > 1;
        });

        show_batchs.forEach(function(e){
          var batch_no = e.batch_no;
          var index = rtn.findIndex(function(el){
            return el.batch_no == batch_no;
          });
          e.orders.forEach(function(el){
            el.is_sub = true;
          });
          rtn.splice(index, 0, e);
        });

        // this[str + '_midGridList'] = [];
        this[str + '_midGridList'] = rtn;
      },
      // 判断是否已经结束
      isFinish: function(order){
          if( order.status == 3 ){ return true; }
          if( order.status == 5 ){ return true; }
          if( order.status == 7 ){ return true; }
          if( order.status == 8 ){ return true; }
          if( order.status == 9 ){ return true; }
          if( order.status == 105 ){ return true; }
          if( order.status == 108 ){ return true; }
          if( order.order_status == 4 ){ return true; }
          if( order.cancel_status == 2 ){ return true; }
          return false;
      },
      entrustTypeCH: function(v){
        switch(v.toString()){
          case '1': return '买入';
          case '2': return '卖出';
          case '101': return '融券';
        }
      },
      entrustTypeClass: function(v){
        switch(v.toString()){
          case '1': return 'red';
          case '2': return 'blue';
          case '101': return '';
        }
      },
      statusCH: function(v){
        switch(v.toString()){
          case '1': return '等待执行';
          case '2': return '已委托';
          case '3': return '已退回';
          case '4': return '部分成交';
          case '5': return '全部成交';
          case '6': return '等待撤单';
          case '7': return '已撤单';
          case '8': return '废单';
          case '9': return '已删除';

          //多策略订单合并状态
          case '101': return '未完成';
          case '105': return '已完成';
          case '108': return '已完成（有废单）';

          //刚刚添加的订单
          case '0': return '提交中..';

          default: return '- -';
        }
      },
      // // 判断是否已经结束
      // isFinish: function(order){
      //     if( order.status == 3 ){ return true; }
      //     if( order.status == 5 ){ return true; }
      //     if( order.status == 7 ){ return true; }
      //     if( order.status == 8 ){ return true; }
      //     if( order.status == 9 ){ return true; }
      //     if( order.status == 105 ){ return true; }
      //     if( order.status == 108 ){ return true; }
      //     if( order.order_status == 4 ){ return true; }
      //     if( order.cancel_status == 2 ){ return true; }
      //     return false;
      // },
      statusClass: function(v){
        if (this.isFinish(v) == false && v.status != 0) {
          return 'red';
        }else{
          return '';
        }
      },
      entrustModelType: function(v){
        switch(v.toString()){
          case '1': return '限价';
          case '2': return '市价';
          case '3': return '市价(对手方最优价格)';
          case '4': return '市价(本方最优价格)';
          case '5': return '市价(即时成交剩余撤单)';
          case '6': return '市价(最优五档即时成交剩余撤单)';
          case '7': return '市价(全额成交或撤单)';
          case '8': return '市价(最优五档即时成交剩余转限)';
        }
      },
      unixTime: function(unixTimeStamp){
        if (undefined == unixTimeStamp) {
          return '--';
        }

        var momentor = /\-/.test(unixTimeStamp) ? moment : moment.unix;// if hyphen is tested, it's sqlTimeStr and use moment, else use moment.unix
        return  moment().format('YYYY-MM-DD') === momentor(unixTimeStamp).format('YYYY-MM-DD')
            ? momentor(unixTimeStamp).format('HH:mm:ss')
            : momentor(unixTimeStamp).format('M月D日 HH:mm:ss');
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
        // this.last_loading_timestamp = new Date().valueOf();
        this.query_arr.forEach(function(e){
          var last_loading_timestamp = new Date().valueOf();
          _this[e.gridDataStr].last_loading_timestamp = last_loading_timestamp;

          _this[e.gridDataStr].loadingStatus = 'loading';
          _this.loadingNum += 1;
          $.getJSON(e.uri, {product_id: product_ids}).done(function(res){
            if( _this[e.gridDataStr].last_loading_timestamp != last_loading_timestamp ){return;}

            if (0 == res.code) {
              var orders = res.data.list || [];
              // // 额外，更新当天所有委托信息
              // if (e.gridDataStr == 'entrustGrid') {
              //   window.entrust_info = orders;
              // }
              mergeOrderStocksInfo(orders).then(function(){
                mergeProductsBriefInfo(orders).then(function(){
                  _this[e.gridDataStr]['list'] = orders;
                  // 计算数量，在后面根据选中产品也进行了对改字段的修改。以后面的为准
                  // 但是有些不过滤的就以此处为准
                  if (0 == _this.checked_count) {
                    _this[e.gridDataStr+ '_listNum'] = orders.length;
                  }else{
                    var ordersLength = 0;
                    _this.product_list.forEach(function(ele){
                      if (true == ele.checked) {
                        orders.forEach(function(e){
                          if (e.product_id == ele.product_id){
                            ordersLength++;
                          }
                        });
                      }
                    });
                    _this[e.gridDataStr+ '_listNum'] = ordersLength;
                  }
                  
                  _this[e.gridDataStr]['last_updated_timestamp'] = res.timestamp;
                  _this.getGridList(e.gridDataStr);
                })
              })
            }
          }).always(function(){
            _this.loadingNum -= 1;
            _this[e.gridDataStr].loadingStatus = '';
          });
        });

        // 额外，更新当天所有委托信息
        $.getJSON(window.REQUEST_PREFIX + '/oms/order/get_entrust_list?permission_type=product&type=all', {
          product_id: product_ids
        }).done(function(res){
          if (0 == res.code) {
            var orders = res.data.list || [];
            window.entrust_info = orders;

            // mergeOrderStocksInfo(orders).then(function(){
            //   mergeProductsBriefInfo(orders).then(function(){
            //     window.entrust_info = orders;
            //   });
            // });

          }
        })
      }
    }
  })

  // 指令执行页面展示
  instructionExecutePage = new Vue({
    el: '#instruction-execute',
    data: {
      ajaxExecuteList: [],
      ajaxProductList: [],
    },
    methods: {
      doExecute: function(row, rule){

        tradeFlow.chgSelectIns(row);
      },
      loadList: function(product_list){
        this.ajaxExecuteList = window.instructionList;
        this.ajaxProductList = product_list;
        // this.readyShowList();


      },
    }
  });

  // 页面底部交易部分，基于原来的逻辑实现
  // var board = $('#order_create_id').find('>.body>.right-board');
  Vue.component('vue-trade-menu', {
    props: [],
    template: `
    <div class="left-nav">
      <div class="trade-nav" style="overflow: visible;">
        <div v-if="3 != org_info_theme && false" class="trade-nav__market" @click="chgCurMarket('marketA')" v-bind:class="{'active': 'marketA' == curMarket}">沪深交易A</div>
        <div v-if="3 != org_info_theme && false" class="trade-nav__market" @click="chgCurMarket('marketH')" v-bind:class="{'active': 'marketH' == curMarket}" style="margin-right: 55px;">沪港通交易H</div>

        <span class="trade-nav__item single-buy" v-bind:class="{'active': 'single-buy' == curActive, 'disabled': 'single-buy' != curActive}">个股买入</span>
        <span class="trade-nav__item single-sell" v-bind:class="{'active': 'single-sell' == curActive, 'disabled': 'single-sell' != curActive}">个股卖出</span>
        <span class="trade-nav__item do_revert" v-bind:class="{'active': 'do_revert' == curActive}" @click="chgActive('do_revert')">撤单<i v-if="displayRevertNum > 0" class="trade-nav__item--tip" v-text="displayRevertNum"></i></span>
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
          <vue-stock-search ref="stock-search" :disabled="true" :custom_cls="'trade-custom-tmp-class'" :stock_input_id="stock_input_type_id" :placeholder="'请输入股票代码'" v-on:stock_id="chgStockId($event)" v-on:stock_input="stock_input_type_id = $event"></vue-stock-search>
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
          <input v-if="1 == trade_model" v-model="trade_price" @change="chgTradePrice()" class="vue-trade-form__content--input" placeholder="请输入指令价格" />
          <input v-if="2 == trade_model" disabled="disabled" :value="'市价'" @change="chgTradePrice()" class="vue-trade-form__content--input" placeholder="请输入指令价格" />
        </div>
      </div>
      <div v-if="false" class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
        <label class="vue-trade-form__label">下单方式</label>
        <div class="vue-trade-form__content">
          <select class="vue-trade-form__content--select" v-model="add_ins_method" @change="chgInsMethod()">
            <option value="3">按指令数量</option>
            <option value="1">按目标仓位</option>
            <option value="2">按总资产比例</option>
          </select>
        </div>
      </div>
      <div class="vue-trade-form__line" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
        <label class="vue-trade-form__label">{{'single-buy' == cur_active ? '本次委买' : '本次委卖'}}</label>
        <div class="vue-trade-form__content">
          <input v-model="trade_num" @change="chgTradeNum()" class="vue-trade-form__content--input" placeholder="请输入数量" />
          <span></span>
        </div>
      </div>
      <div class="vue-trade-form__line" style="flex-direction: row-reverse;justify-content: space-between;" v-bind:class="'single-buy' == cur_active ? 'buy-color-cls' : 'sell-color-cls'">
        <a v-bind:class="{'disabled': checkSubmitDisabled}" class="vue-trade-form__btn" @click="multiProductsSubmit()">{{'single-buy' == cur_active ? '提交委买' : '提交委卖'}}</a>
        <span v-show="showOrHide" style="margin-left: 30px;margin-top:10px;line-height:28px;color:#2ECC71;">预计{{'single-buy' == cur_active ? '买入' : '卖出'}}{{can_trade_num_total}}股</span>
      </div>
    </form>
    `,
    data: function(){
      return {
        stock_id: '',
        stock_input_type_id: '',
        trade_model: 1,
        trade_price: '',
        trade_num: '',
        showOrHide: false,
        can_trade_num_total: 0,
        add_ins_method: 3, // 1按目标仓位 2按总资产比例 3按指令数量

        checkSubmitDisabled: true,
      }
    },
    mounted: function(){
      // 接收从五档行情触发的事件
      $(window).on('trade-5__priceClick', (event) => {
        this.trade_price = event.price;
        this.chgTradePrice();
      })
    },
    methods: {
      setCheckSubmitDisabled: function(value){
        this.checkSubmitDisabled = value;
      },
      setTotalInfo: function(obj){
        this.showOrHide = obj.showOrHide;
        this.can_trade_num_total = obj.trade_num;
      },
      setFormData: function(obj){
        // this.stock_id = obj.stock_id;
        this.$refs['stock-search'].selectOneStock(obj.stock_id, obj.stock_name);
        this.trade_model = obj.trade_mode;
        this.trade_price = obj.trade_price;
        this.trade_num = obj.trade_num;
        // this.chgStockId(obj.stock_id);
        // console.log(this.stock_id);
      },
      chgStockId: function(event){
        this.stock_id = event;
        this.$emit('stock_id', this.stock_id);
        // tradeFlow.chgStockId(this.stock_id);
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
      },
      chgTradeNum: function(){
        tradeFlow.chgTradeNum(this.trade_num);
      },
      multiProductsSubmit: function(){
        // console.log('multiProductsSubmit')
        tradeControllor.$refs['trade-preview'].multiProductsSubmit();
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
            <b @click="priceClick(ajaxStockDetail.last_price)" class="vue-trade-5__main-info--last-price" style="cursor: pointer;">{{numeralNumber(ajaxStockDetail.last_price, 3)}}</b>
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
      }
    },
    watch: {
      stock_id: function(){
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
            _this.ajaxStockDetail = data[0];
            tradeFlow.shgStockDetail(_this.ajaxStockDetail);
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
  });

  // 撤单模块
  var query_arr = [{
    id: 'revert',
    uri: window.REQUEST_PREFIX + '/oms/order/getCanBeCanceledList?permission_type=product&type=all&count=9999',
    gridDataStr: 'revertGrid',
    display_rules: [{
      id: 'stock_id',
      label: '证券代码',
      withMultiIcon: true,
      withStockType: true,
      format: ['hideStockType'],
      class: ''
    },{
      id: 'stock_name',
      label: '证券名称',
      format: '',
      class: 'cell-left'
    },{
      // 专户版买卖标志
      id: 'entrust_type',
      label: '买卖标志',
      hide_flag: (3 == orginfo_theme) ? false : true,
      format: ['entrustTypeCH'],
      classFormat: ['entrustTypeClass'],
      class: 'cell-left'
    },{
      // 机构版买卖标志
      id: 'bs_symbol_text',
      label: '买卖标志',
      hide_flag: (3 == orginfo_theme) ? true : false,
      class: 'cell-left'
    },{
      id: 'product_name',
      label: '策略',
      format: '',
      class: 'cell-left'
    },{
      id: 'entrust_price',
      label: '委托价格',
      format: ['numeralNumber', 3],
      class: 'cell-right'
    },{
      id: 'entrust_amount',
      label: '委托数量',
      format: '',
      class: 'cell-right'
    },{
      id: 'deal_price',
      label: '成交价格',
      format: ['numeralNumber', 3],
      class: 'cell-right'
    },{
      id: 'deal_amount',
      label: '成交数量',
      format: '',
      class: 'cell-right'
    },{
      // 专户版订单状态
      id: 'status',
      label: '订单状态',
      hide_flag: (3 == orginfo_theme) ? false : true,
      format: ['statusCH'],
      classFormat: ['statusClass'],
      class: 'cell-left'
    },{
      // 机构版订单状态
      id: 'vendor_status_text',
      label: '订单状态',
      hide_flag: (3 == orginfo_theme) ? true : false,
      // format: ['statusCH'],
      // classFormat: ['statusClass'],
      class: 'cell-left'
    },{
      // 专户版报价方式
      id: 'entrust_model',
      label: '报价方式',
      hide_flag: (3 == orginfo_theme) ? false : true,
      format: ['entrustModelType'],
      class: 'cell-left'
    },{
      // 机构版报价方式
      id: 'quote_type_text',
      label: '报价方式',
      hide_flag: (3 == orginfo_theme) ? true : false,
      class: 'cell-left'
    // },{
    //   id: 'created_at',
    //   label: '委托时间',
    //   format: ['unixTime'],
    //   class: 'cell-right'
    // },{
    //   id: 'updated_at',
    //   label: '更新时间',
    //   format: ['unixTime'],
    //   class: 'cell-right'

    // },{
    //   // 机构版 港股 字段
    //   id: 'exchange_rate',
    //   label: '参考汇率',
    //   hide_flag: (3 == orginfo_theme) ? true : false,
    //   doHideWhenMarketA: true,
    //   format: '',
    //   class: 'cell-left'
    }]
  }];
  Vue.component('vue-trade-revert', {
    // el: '#do_revert',
    template: `
      <section class="order-list new-design" style="min-height: 245px; max-height: 400px; overflow: auto;margin: 0;">
        <a id="anchor-orderList" style="position: relative;top:-65px;display: block;height: 0;width:0;"></a>
        <div class="hd">
          <span class="section-title" style="font-size: 16px; color: #222222;">可撤订单</span>
          <a class="oms-btn gray refresh-btn loading-loading right" v-bind:class="{'loading': loadingNum > 0}" href="javascript:;" v-on:click="loadOrderList"><i class="oms-icon refresh"></i>刷新</a>
          <a class="oms-btn red revert-btn  right" href="javascript:;" v-on:click="doRevert">撤单</a>
        </div>
        <div style="max-height: 193px;overflow: auto;">
          <table class="oms-table loading-loading nothing-nothing" v-bind:class="{'nothing': Object.keys(temporary_order).length == 0 && activeGridList.length == 0}">
            <tbody>
              <tr>
                <th style="width: 40px;">
                  <input type="checkbox" v-model="selectAll" v-on:change="chgSelectAll()" />
                </th>
                <th v-if="rule.hide_flag != true" v-show="rule.doHideWhenMarketA != true || 'marketA' != market" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                  <span v-text="rule.label"></span>
                </th>
              </tr>
            </tbody>
            <tbody>
              <tr v-if="Object.keys(temporary_order).length > 0">
                <td>
                  <input :disabled="checkDisabled(temporary_order)" type="checkbox" v-model="temporary_order.web_checked" v-on:change="chgSelect(temporary_order)" />
                </td>
                <td v-on:click="changeShow(temporary_order)" v-if="rule.hide_flag != true" v-show="rule.doHideWhenMarketA != true || 'marketA' != market" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                  <span v-bind:class="displayClass(temporary_order, rule)" v-text="displayValue(temporary_order, rule)"></span>
                  <div v-if="rule.withMultiIcon && temporary_order.is_batch" v-bind:class="{'icon-show': temporary_order.web_showChildren, 'icon-hide': !temporary_order.web_showChildren}"></div>
                </td>
              </tr>
              <tr v-for="row in activeGridList" v-show="checkShow(row)" v-bind:class="{'sub_order': row.is_sub, 'display_multi': row.web_showChildren}">
                <td>
                  <input :disabled="checkDisabled(row)" type="checkbox" v-model="row.web_checked" v-on:change="chgSelect(row)" />
                </td>
                <td v-on:click="changeShow(row)" v-if="rule.hide_flag != true" v-show="rule.doHideWhenMarketA != true || 'marketA' != market" v-for="rule in curQueryInfo.display_rules" v-bind:class="rule.class">
                  <span v-bind:class="displayClass(row, rule)" v-text="displayValue(row, rule)"></span>
                  <div v-if="rule.withMultiIcon && row.is_batch" v-bind:class="{'icon-show': row.web_showChildren, 'icon-hide': !row.web_showChildren}" ></div>
                  <span v-if="rule.withStockType && (3 == checkStockType(row[rule.id]) || 4 == checkStockType(row[rule.id]))" v-bind:class="displayStockClass(row, rule)">
                    @{{ displayStockType(row[rule.id]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `,
    mounted: function(){
      // 可撤单获取数据
      this.loadOrderList();
    },
    data(){
      return {
        // doShow: false,
        me_can_trade: true,
        gridData: [],
        curActive: 'revert',
        market: 'marketA',

        selectAll: false,
        selectList: new Map(),

        orginfo_theme: orginfo_theme,
        temporary_order: {},

        hideRevert: false,
        hideDeal: false,
        hideIssue: false,

        revertGrid: {},
        revertGrid_midGridList: [],
        query_arr: query_arr,
        orderNum: 0,
        // last_loading_timestamp: '',
        loadingNum: 0
      }
    },
    watch: {
    },
    computed: {
      activeGridList: function(){
        if ('revert' == this.curActive) {
          this.selectAll = this.revertGridList.every(function(e){
            return e.web_checked == true;
          });
          return this.revertGridList;
        }
      },
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
      revertGridList: function(){
        var str = 'revertGrid';
        var rtn = this[str + '_midGridList'];
        var show_batchs = [];

        rtn.forEach(function(e){
          if (e.is_batch) {
            show_batchs.push(e);
          }
        });

        // 处理决定是否勾选的数据
        show_batchs.forEach(function(e){
          if (e.orders.every(function(el){
            return el.web_checked == true;
          }) == true) {
            e.web_checked = true;
          }else{
            e.web_checked = false;
          }
        })

        // 处理决定是否显示的数据
        rtn.forEach(function(el){
          el.do_hide = false;
        });
        show_batchs.forEach(function(e){
          if (!e.web_showChildren) {
            rtn.forEach(function(el){
              if (el.batch_no == '' || true == el.is_batch || e.batch_no != el.batch_no) {
                // el.do_hide = false; //不能设置为false，因为有些本来设置为true的又被修改为false
              }else{
                el.do_hide = true;
              }
            })
          }
        })
        return rtn;
      }
    },
    methods: {
      hideStockType: function(val){
        return val.split(/\./)[0];
      },
      checkStockType: function(value){
        if (/\.sh/.test(value.toLowerCase())) {
          return 1;
        }
        if (/\.sz/.test(value.toLowerCase())) {
          return 2;
        }
        if (/\.hksh/.test(value.toLowerCase())) {
          return 3;
        }
        if (/\.hksz/.test(value.toLowerCase())) {
          return 4;
        }
      },
      displayStockClass: function(row, rule){
        var value = row[rule.id];
        var type = this.checkStockType(value);
        if (3 == type) {
          return 'stock-type-hksh';
        }
        if (4 == type) {
          return 'stock-type-hksz'
        }
      },
      displayStockType: function(value){
        var type = this.checkStockType(value);
        if (3 == type) {
          return '沪港通'
        }
        if (4 == type) {
          return '深港通'
        }
      },
      changeShow: function(row){
        if (row.is_batch) {
          row.web_showChildren = !row.web_showChildren;
        }
      },
      checkDisabled: function(row){
        return (this.statusClass(row) !== 'red' || 6 == row.status || 8 == row.status || 105 == row.status || 108 == row.status) ? true : false
      },
      checkShow: function(row){
        if (row.do_hide) {
          return false;
        }
        if (row.status == 7 && this.hideRevert) {
          return false;
        }
        // if ((row.status == 5 || row.status == 105) && this.hideDeal) {
        //   return false;
        // }
        if ((this.isFinish(row) && row.status != 7 && row.status != 8) && this.hideDeal) {
          return false;
        }
        if (row.status == 8 && this.hideIssue) {
          return false;
        }

        return true;
      },
      doRevert: function(){
        var _this = this;
        var doRevertArr = [];
        var htmlArr = [];
        this.activeGridList.forEach(function(e){
          if (e.is_batch != true && e.web_checked && !(+e.cancel_status) && [1,2,4].some(function(el){
            return el == e.status
          })) {
            doRevertArr.push(e);

            htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left">' + e.product_name + '</td>' +
              '<td class="cell-left">' + e.stock_id + ' ' + e.stock_name + '</td>' +
              '<td class="cell-left">' + e.bs_symbol_text + '</td>' +
              '<td class="cell-left">' + e.quote_type_text + '</td>'+
              '<td class="cell-right">' + e.entrust_price + '</td>' +
              '<td class="cell-right">' + e.entrust_amount + '</td></tr>');
            
          }
        });

        if (doRevertArr.length == 0) {
          $.omsAlert('请选择需要撤单的订单');
          return;
        }

        var html = htmlArr.join('');
        var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;"><tr><th class="cell-left">策略</th>'+
          '<th class="cell-left">证券</th>'+
          '<th class="cell-left">买卖标志</th>'+
          '<th class="cell-left">报价方式</th>'+
          '<th class="cell-right">委托价格</th>'+
          '<th class="cell-right">委托数量(股)</th></tr>'+html+'</tbody></table>';

        $.confirm({
          title: '撤单确认',
          content: confirmHtml,
          closeIcon: true,
          confirmButton: '确定',
          cancelButton: false,
          confirm: function(){
            var results = [];

            $.startLoading('正在批量撤单...');
            doRevertArr.forEach(function(order){
              order.cancel_res = null;
              results.push(order);
              setTimeout(function(){
                var url = (window.REQUEST_PREFIX||'')+'/oms/workflow/'+order.product_id+'/'+order.id +'/do_cancel?workflow_id=' + order.id;

                if (3 != _this.orginfo_theme) {
                  url = (window.REQUEST_PREFIX||'')+'/oms/workflow/' + order.product_id + '/direct_cancel?entrust_id=' + order.entrust_id + '&stock_id=' + order.stock_code;
                  if ('marketA' == market) {
                    url += '&market=1';
                  }else if('marketHSH' == market){
                    url += '&market=2';
                  }else if('marketHSZ' == market){
                    url += '&market=3';
                  }
                }
                
                $.post(url).done(function(res){
                  order.cancel_res = res;
                }).fail(function(){
                  order.cancel_res = {code:110,msg:'网络错误！'};
                }).always(function(){
                  _this.checkResults(results);
                });
              },Math.random()*500);
            });

          }
        });
      },
      checkResults: function(results){
        var _this = this;
        var waiting_num = results.filter(function(order){
            return !order.cancel_res;
        }).length;
        if(waiting_num){return;}

        var filter_res = {success:[],fail:[]};
        results.forEach(function(order){
            filter_res[$.pullValue(order,'cancel_res.code',NaN) == 0 ? 'success' : 'fail'].push(order);
        });

        $(window).trigger({
          type: 'multi_products:create_order:finish'
        });

        var htmlArr = [];
        filter_res.fail.forEach(function(e){
          htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left max-width-120" title="'+ e.product_name +'">' + e.product_name + '</td>' +
            '<td class="cell-left">' + e.stock_id + ' ' + e.stock_name + '</td>' +
            '<td class="cell-left">' + _this.entrustTypeCH(e.entrust_type) + '</td>' +
            '<td class="cell-right">' + e.entrust_price + '</td>' +
            '<td class="cell-right">' + e.entrust_amount + '</td>' +
            '<td>' + e.cancel_res.msg + '</td>' +
            '</tr>');
        });

        var html = htmlArr.join('');
        var confirmHtml = '<table class="custom_confirm"><tbody style="width:100%;display: inline-table;">'+
          '<tr>'+
          '<th class="min-width-40 max-width-120 cell-left">策略</th>'+
          '<th class="min-width-40 cell-left">证券</th>'+
          '<th class="min-width-40 cell-left">买卖标志</th>'+
          '<th class="min-width-40 cell-right">委托价格</th>'+
          '<th class="min-width-40 cell-right">委托数量(股)</th>'+
          '<th class="min-width-40 cell-right">备注</th>' +
          '</tr>'+html+'</tbody></table>';

        $.clearLoading();

        if (filter_res.fail.length == 0) {
          $.omsAlert('撤单请求提交成功')
        }else{
          $.confirm({
            title: '失败提示',
            content: confirmHtml,
            closeIcon: true,
            confirmButton: '确定',
            cancelButton: false
          });
        }

        setTimeout(function(){
          _this.loadOrderList();
        });
        setTimeout(function(){
            _this.loadOrderList();
        }, 2000);
      },
      chgSelect: function(row){
        var _this = this;
        if (row.is_batch) {
          // 修改批量的选中框之后，修改其子项的选中框
          row.orders.forEach(function(e){
            e.web_checked = row.web_checked;
          })
        }
      },
      chgSelectAll: function(){
        var _this = this;
        // this.selectAll = !this.selectAll;
        this.activeGridList.forEach(function(e){
          e.web_checked = _this.selectAll;
        })
      },
      getGridList: function(str){
        let _this = this;
        var rtn = [];

        this.temporary_order = {};

        this[str].list.forEach(function(e){
          var obj = {};
          obj.web_checked = false;
          if (_this.selectList.get(e.entrust_id)) {
            obj.web_checked = true;
          }
          // 批量处理序号
          obj.batch_no = e.entrust.batch_no;
          // 证券代码
          // obj.stock_id = e.stock_info ? e.stock_info.stock_id : '';
          obj.stock_id = ('' == e.stock.code) ? (e.stock_info ? e.stock_info.stock_id : '') : e.stock.code;
          // 机构版撤单id，仅revert表格使用
          obj.entrust_id = e.entrust_id;
          // 机构版股票代码，仅revert表格使用
          obj.stock_code = e.stock ? e.stock.code : '';
          // 证券名称
          obj.stock_name = ('' == e.stock.name) ? (e.stock_info ? e.stock_info.stock_name : '') : e.stock.name;
          // 买卖标志
          obj.entrust_type = e.entrust.type;
          // 策略
          obj.product_name = e.product ? e.product.name : '';
          // 委托价格
          obj.entrust_price = e.entrust.price;
          // 委托数量
          obj.entrust_amount = e.entrust.amount;
          // 成交价格
          obj.deal_price = e.deal.price;
          // 成交数量
          obj.deal_amount = e.deal.amount;
          // 已撤数量
          // 原有接口找不到该字段，暂时不加
          // 订单状态
          obj.status = e.status;
          // 报价方式
          obj.entrust_model = e.entrust.model;
          // 委托时间
          obj.created_at = e.created_at;
          // 更新时间 //在已成交的订单中，这就是成交时间
          obj.updated_at = e.updated_at;

          obj.cancel_status = e.cancel_status;
          obj.id = e.id;
          obj.product_id = e.product_id;

          // 汇率
          obj.exchange_rate = e.entrust.exchange_rate;
          // 买卖方向
          obj.bs_symbol_text = e.entrust.bs_symbol_text;
          // 报价方式
          obj.quote_type_text = e.entrust.quote_type_text;
          // 订单状态
          obj.vendor_status_text = e.entrust.vendor_status_text;

          rtn.push(obj);
        });

        var batch_orders = {};
        rtn.forEach(function(e){
          if (e.batch_no) {
            e.sub_order = e.batch_no;
            (batch_orders[e.batch_no] = batch_orders[e.batch_no] || []).push(e);
          }
        });

        rtn = rtn.sort(function(a, b){
          // return a.batch_no < b.batch_no ? 1 : -1;
          return a.created_at < b.created_at ? 1 : -1;
        })

        var show_batchs = [];
        for(var batch_no in batch_orders){
          if (batch_orders[batch_no].length>1) {

          }
          // 得到批量的显示内容
          var first_order = batch_orders[batch_no].sort(function(o1,o2){
            return o1.updated_at>o2.updated_at ? 1 : -1;
          })[0];

          // todo 这里的参数格式要变一下
          var batch = {
            is_batch: true,

            web_checked: false,
            web_showChildren: false,

            batch_no: first_order.batch_no,
            updated_at: first_order.updated_at,
            created_at: first_order.created_at,

            orders: batch_orders[batch_no],

            // 证券代码
            stock_id : first_order.stock_id,
            // 证券名称
            stock_name : first_order.stock_name,
            // 买卖标志
            entrust_type : first_order.entrust_type,
            // 策略
            product_name : '多策略',//first_order.product_name,
            // 委托价格
            entrust_price : first_order.entrust_price,
            // 委托数量
            entrust_amount : 0, // first_order.entrust_amount,
            // 成交价格
            deal_price : 0, //first_order.deal_price,
            deal_value : 0, //first_order.deal_value,
            // 成交数量
            deal_amount : 0, //first_order.deal_amount,
            // 已撤数量
            // 原有接口找不到该字段，暂时不加
            // 订单状态
            status : 0, //first_order.status,
            // 报价方式
            entrust_model : first_order.entrust_model,
            // 委托时间
            created_at : first_order.created_at,
            // 更新时间 //在已成交的订单中，这就是成交时间
            updated_at : first_order.updated_at,

            product: {
                name: '多策略',
                length: batch_orders[batch_no].length
            },

            all_status: [],

            cancel_status: "",
            all_cancel_status: [],
            can_cancel: false,

            all_finish_status: []//,

            // me_can_trade: first_order.me_can_trade
          };

          batch_orders[batch_no].forEach(function(order){
            var deal_price = +$.pullValue(order,'deal_price')||0;
            var deal_amount = +$.pullValue(order,'deal_amount')||0;
            var deal_value = deal_price*deal_amount;

            // $.pushValue(order,'deal_value',deal_value);
            batch.deal_value += deal_value;
            batch.deal_amount += deal_amount;
            batch.deal_price = batch.deal_amount ? batch.deal_value/batch.deal_amount : 0;

            var entrust_amount = +$.pullValue(order,'entrust_amount')||0;
            batch.entrust_amount += entrust_amount;

            batch.all_status.push(+order.status||0);
            batch.all_cancel_status.push(+order.cancel_status||0);

            order.can_cancel = /1|2|4/.test( order.status ) && !/1|2/.test( order.cancel_status );

            order.is_finish = _this.isFinish(order);
            batch.all_finish_status.push(order.is_finish?1:0);

            //########## 断定是否可以撤单
            batch.can_cancel = batch.can_cancel || order.can_cancel;
          });

          //########### Batch 状态处理
          // 这里for循环最终执行的条件似乎是：all_status是全为一个数字元素的数组。比如说：[1,1,1,1,1,1,1]
          [1,2,3,4,5,6,7,8,9].forEach(function(status_no){
            batch.all_status.filter(function(status){return status==status_no}).length == batch.all_status.length && (batch.status = status_no);
          });
          // 这里for循环最终执行的条件似乎是：all_cancel_status是全为一个数字元素的数组。
          [1,2].forEach(function(cancel_status_no){
            batch.all_cancel_status.filter(function(cancel_status){
              return cancel_status==cancel_status_no
            }).length == batch.all_cancel_status.length && (batch.cancel_status = cancel_status_no);
          });

          // 多策略状态展示逻辑遵守单策略订单状态显示逻辑
          // 以已完成、已完成（有废单）、未完成描述策略订单状态。
          // 1、当策略订单中有待完成的订单时：委托、部分成交、等待撤单等，显示未完成。
          // 2、当策略订单中所有订单操作时：全部成交、全部撤单显示已完成；
          // 3、当策略中有废单，其余订单全部完成时，显示：已完成（有废单）

          // 这里的枚举实在是不清楚什么含义
          if(!batch.status){
            batch.status = /0/.test( batch.all_finish_status.join('') ) ? 101 : (
              /8/.test( batch.all_status.join('') ) ? 108 : 105
            );
          }

          show_batchs.push(batch);
        }

        // 这里实际上也包含了只有一个元素的带有batch_no的数据列，在随后的插入数据操作中注意过滤
        show_batchs = show_batchs.filter(function(e){
          return e.orders.length > 1;
        });

        show_batchs.forEach(function(e){
          var batch_no = e.batch_no;
          var index = rtn.findIndex(function(el){
            return el.batch_no == batch_no;
          });
          e.orders.forEach(function(el){
            el.is_sub = true;
          });
          rtn.splice(index, 0, e);
        });

        // this[str + '_midGridList'] = [];
        this[str + '_midGridList'] = rtn;
      },
      // 判断是否已经结束
      isFinish: function(order){
          if( order.status == 3 ){ return true; }
          if( order.status == 5 ){ return true; }
          if( order.status == 7 ){ return true; }
          if( order.status == 8 ){ return true; }
          if( order.status == 9 ){ return true; }
          if( order.status == 105 ){ return true; }
          if( order.status == 108 ){ return true; }
          if( order.order_status == 4 ){ return true; }
          if( order.cancel_status == 2 ){ return true; }
          return false;
      },
      entrustTypeCH: function(v){
        switch(v.toString()){
          case '1': return '买入';
          case '2': return '卖出';
          case '101': return '融券';
        }
      },
      entrustTypeClass: function(v){
        switch(v.toString()){
          case '1': return 'red';
          case '2': return 'blue';
          case '101': return '';
        }
      },
      statusCH: function(v){
        switch(v.toString()){
          case '1': return '等待执行';
          case '2': return '已委托';
          case '3': return '已退回';
          case '4': return '部分成交';
          case '5': return '全部成交';
          case '6': return '等待撤单';
          case '7': return '已撤单';
          case '8': return '废单';
          case '9': return '已删除';

          //多策略订单合并状态
          case '101': return '未完成';
          case '105': return '已完成';
          case '108': return '已完成（有废单）';

          //刚刚添加的订单
          case '0': return '提交中..';

          default: return '- -';
        }
      },
      statusClass: function(v){
        if (this.isFinish(v) == false && v.status != 0) {
          return 'red';
        }else{
          return '';
        }
      },
      entrustModelType: function(v){
        switch(v.toString()){
          case '1': return '限价';
          case '2': return '市价';
          case '3': return '市价(对手方最优价格)';
          case '4': return '市价(本方最优价格)';
          case '5': return '市价(即时成交剩余撤单)';
          case '6': return '市价(最优五档即时成交剩余撤单)';
          case '7': return '市价(全额成交或撤单)';
          case '8': return '市价(最优五档即时成交剩余转限)';
        }
      },
      unixTime: function(unixTimeStamp){
        if (undefined == unixTimeStamp) {
          return '--';
        }

        var momentor = /\-/.test(unixTimeStamp) ? moment : moment.unix;// if hyphen is tested, it's sqlTimeStr and use moment, else use moment.unix
        return  moment().format('YYYY-MM-DD') === momentor(unixTimeStamp).format('YYYY-MM-DD')
            ? momentor(unixTimeStamp).format('HH:mm:ss')
            : momentor(unixTimeStamp).format('M月D日 HH:mm:ss');
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
        // // 机构版才获取数据
        // if (3 == this.orginfo_theme) {
        //   return
        // }

        let _this = this;
        // this.last_loading_timestamp = new Date().valueOf();

        this.query_arr.forEach(function(e){
          var last_loading_timestamp = new Date().valueOf();
          _this[e.gridDataStr].last_loading_timestamp = last_loading_timestamp;

          _this[e.gridDataStr].loadingStatus = 'loading';
          _this.loadingNum += 1;
          var url = e.uri;
          // if ('marketA' == market) {
          //   url += '&market=1';
          // }else if('marketB' == market){
          //   url += '&market=2';
          // }

          var marketType = 1;
          if ('marketA' == market) {
            marketType = 1;
          }else if('marketHSH' == market){
            marketType = 2;
          }else if('marketHSZ' == market){
            marketType = 3;
          }

          $.getJSON(url, {product_id: product_ids, market: marketType}).done(function(res){
            if( _this[e.gridDataStr].last_loading_timestamp != last_loading_timestamp ){return;}

            if (0 == res.code) {
              var orders = res.data.list || [];
              // 额外，更新当天所有委托信息
              if (e.gridDataStr == 'entrustGrid') {
                window.entrust_info = orders;
              }
              mergeOrderStocksInfo(orders).then(function(){
                mergeProductsBriefInfo(orders).then(function(){
                  _this[e.gridDataStr]['list'] = orders;
                  // _this[e.gridDataStr+ '_listNum'] = orders.length;
                  _this[e.gridDataStr]['last_updated_timestamp'] = res.timestamp;

                  // 判断已有this[str].list是否有web_checked //之前这段代码在ajax调用之前，但是会有一个问题，两段代码之间的时刻，如果用户修改了web_checked，会导致记录下来的与实际不对。
                  if (_this.activeGridList) {
                    _this.activeGridList.forEach(function(e){
                      if (e.web_checked) {
                        _this.selectList.set(e.entrust_id, true);
                      }else{
                        _this.selectList.set(e.entrust_id, false);
                      }
                    });
                  }

                  _this.getGridList(e.gridDataStr);

                  if ('revertGrid' == e.gridDataStr) {
                    $(window).trigger({
                      type:'revertGrid_listNum',
                      num: orders.length
                    });
                  }
                })
              })
            }else{
              if (e.gridDataStr == 'entrustGrid') {
                window.entrust_info = [];
              }
            }
          }).always(function(){
            _this.loadingNum -= 1;
            _this[e.gridDataStr].loadingStatus = '';
          });
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
          <table class="oms-preview-table loading-loading nothing-nothing" style="width: 100%;height: 100%;">
            <thead>
              <tr class="hd">
                <th  class="oms-preview-table__content--left oms-preview-table__max-width-130" style="flex:2">
                  <input type="checkbox" v-model="gridHead_web_checked" @change="chgAll()"  style="width: inherit;height:inherit;"/>
                  产品名称
                </th>
                <th  class="oms-preview-table__content--left">预期进度</th>
                <th  class="oms-preview-table__content--right">挂单数量</th>
                <th  class="oms-preview-table__content--right">缺口数量</th>
                <th  class="oms-preview-table__content--right">本次委买</th>
              </tr>
            </thead>
            <tbody class="loading-hide" style="line-height: 30px;height: 100%;">
              <tr v-for="row in display_arr" style="border-bottom: 1px solid #E2E2E2;" v-bind:class="[{'error-line': row.riskRtn && row.riskRtn.code != 0}]">
                <td class="oms-preview-table__content--left oms-preview-table__max-width-130"  style="flex:2">
                  <input type="checkbox" v-model="row.web_checked" @change="chgSingle(row)" style="width: inherit;height:inherit;"/>
                  <span>{{row.product_name}}</span>
                </td>
                <td class="oms-preview-table__content--left">
                  {{numeralPercent(row.progress)}}
                </td>
                <td class="oms-preview-table__content--right">
                  <span>{{row.pending_order_number}}</span>
                </td>
                <td class="oms-preview-table__content--right">
                  <span>{{row.gap_number}}</span>
                </td>
                <td class="oms-preview-table__content--right">
                  <span>{{row.trade_num}}</span>
                  <prompt-language v-if="row.riskRtn && 0 != row.riskRtn.code" :language_val="row.riskRtn && row.riskRtn.msg"></prompt-language>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="vue-trade-preview__controller" style="height: 24px;line-height: 24px;font-size: 12px;">
          <div style="width: 35%;padding-left: 20px;">汇总</div>
          <div style="width: 20%;"></div>
          <div style="width: 15%;text-align: right;padding-right: 10px;">{{totalInfo.pending_order_number}}</div>
          <div style="width: 15%;text-align: right;padding-right: 10px;">{{totalInfo.gap_number}}</div>
          <div style="width: 15%;text-align: right;padding-right: 10px;">{{totalInfo.trade_num}}</div>
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
        totalInfo: {
          pending_order_number: 0,
          gap_number: 0,
          trade_num: 0,
        },
        gridHead_web_checked: true,

        // 选中的产品信息
        checkedProductList: [],
        select_ins: {},
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
        // 交易数量
        trade_num: '',
        // // 交易方式，仅展示用
        // trade_user_type: 1,

        // 批量交易数量
        multi_num: '',

        // 按同等目标仓位的输入值
        allDstPosition: '',
        // 按同等调仓比例的输入值
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
      },
    },
    methods: {
      checkSubmitDisabled: function(){
        let flag = false;
        this.display_arr.forEach(e => {
          if (e.web_checked) {
            if (undefined == e.trade_num || '' == e.trade_num || 0 == e.trade_num) {
              flag = true;
            }
            if (!e.riskRtn) {
              flag = true;
            }else if (0 != e.riskRtn.code) {
              flag = true;
            }
          }
        });

        if (this.display_arr.every(e => false == e.web_checked)) {
          return true;
        }

        return flag;
      },
      chgAll: function(){
        let value = this.gridHead_web_checked;
        this.display_arr.forEach(function(e){
          e.web_checked = value;
        });

        this.checkRow();
        this.refreshDisplay();
      },
      chgSingle: function(){
        if (this.display_arr.every(e => true === e.web_checked)) {
          this.gridHead_web_checked = true;
        }else{
          this.gridHead_web_checked = false;
        }
        this.display_arr = this.display_arr.filter(function(){
          return true;
        });

        this.checkRow();
        this.refreshDisplay();
      },
      // 决定该组件是否显示
      showOrHide: function(){
        // 选中产品为空，则隐藏
        if (0 == this.display_arr.length) {
          return false;
        }

        return true;
      },
      multiProductsSubmit: function(){
        let _this = this;
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
          htmlArr.push('<tr style="border-bottom: 1px solid #E2E2E2;"><td class="cell-left">'+ e.product_name + '</td>'+
            '<td class="cell-left">'+ typeStr1 +'</td>'+
            '<td class="cell-left">'+ typeStr2 +'</td>'+
            // '<td class="cell-right" style="max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+ priceStr +'">'+ priceStr +'</td>'+
            '<td class="cell-right">'+ e.trade_num +'</td>'+
            '<td class="cell-right">'+ Number((e.trade_num * ins_price).toFixed(2)) +'</td></tr>');
          totalAmount += e.trade_num;
          totalMoney += e.trade_num * ins_price;
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

            let product_id_arr = [];
            let sub_list = {};
            _this.display_arr.forEach(function(e){
              product_id_arr.push(e.product_id);
              sub_list[e.product_id] = {};
              sub_list[e.product_id]['target_position'] = e.dst_position;
              sub_list[e.product_id]['current_adjust_position'] = e.chg_position;
              sub_list[e.product_id]['ins_volume'] = e.trade_num;

              setTimeout(function(){
                $.post((window.REQUEST_PREFIX||'')+'/oms/workflow/'+e.product_id+'/add_hand_order',{
                  ins_id: _this.select_ins.id,
                  trade_mode: _this.trade_mode,
                  trade_direction: _this.trade_direction,
                  trade_market: 1,
                  price: ins_price,
                  trade_number_method: 'volume',
                  volume: e.trade_num,
                  stock_code: _this.stock_id,
                  // batch_no: 
                  is_manual_order: 0,
                  market:1
                }).done(function(res){
                    e.add_hand_order_res = res;
                    // 原流程是从后端返回的数据中获取委托数量，现在改为从请求中读取
                    e.add_hand_order_res.data.entrust_amount = e.trade_num;
                }).fail(function(){
                    e.add_hand_order_res = {code:110,msg:'网络错误！'};
                }).always(function(){
                  checkResults(_this.display_arr);
                });
              },Math.random()*200);
            });

            // $.post((window.REQUEST_PREFIX||'')+'/sync/instruction/manage_add',{
            //   stock_id: _this.stock_id,
            //   quote_type: _this.trade_mode,
            //   quote_price: _this.trade_price,
            //   direction: _this.trade_direction,
            //   // add_ins_method: _this.add_ins_method,
            //   product_id: product_id_arr,
            //   sub_list: sub_list
            // }).done(function(res){
            //     if (0 == res.code) {
            //       $.omsAlert('提交成功');
            //     }else{
            //       $.omsAlert(res.msg);
            //     }
            //     $.clearLoading();
            // }).fail(function(){
            //     // product.add_hand_order_res = {code:110,msg:'网络错误！'};
            //     $.omsAlert('网络错误！');
            //     $.clearLoading();
            // }).always(function(){

            // });
          }
        });

        function checkResults(results){

          for (let i = 0; i < results.length; i++) {
            let row = results[i];
            //row.add_hand_order_res;
            //服务端返回数据对应理解
            let res = row.add_hand_order_res;
            //模拟数据
            // res ={"code":0,
            //         "msg":"",
            //         "data":{
            //          "000001.SZ":{
            //             "code": 5022111,
            //             "msg": "hello,workd",
            //             "data": {
            //                 "msg": [
            //                     "已触发风控:0329股票池禁止买入",
            //                     "已触发风控(公司):0329股票池禁止买入"
            //                 ],
            //                 "limit_action": 1
            //             }
            //         }}
            //     }
            //是否显示继续购买按钮
            if (res.code == 0) {
                //购买成功
                row.btnType = false;
                row.msg = ["委托成功"];
                row.entrustStatus = "pass";
                row.style = {}
            } else if(res.code == 5022111){
                if (res.data[_this.stock_detail.stock_id]) {
                  let temp = res.data[_this.stock_detail.stock_id];
                  if (temp.code == 5022111) {
                    //提示性风控
                    if (temp.msg == "") {
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
                        row.msg = []
                      } else {
                        row.msg = [temp.msg];
                      }
                      row.msg.unshift("委托失败");
                    }


                  } else {
                    //禁止性风控
                    row.btnType = false;
                    row.msg = temp.data.msg;
                    row.msg.unshift("委托失败");
                    row.entrustStatus = "fail";
                    row.style = {
                      color: "＃F44336"
                    }
                  }
                } else {
                  row.btnType = false;
                  row.entrustStatus = "pass";
                  row.msg = ["委托成功"];
                  row.style = {

                  }
                }

            } else{
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
          }
          let contentChild = Vue.extend({
            data() {
              let ins_price;
              if (1 == _this.trade_direction) {
                ins_price = _this.stock_detail.stop_top;
              }else{
                ins_price = _this.stock_detail.stop_down;
              }
              if (1 == _this.trade_mode) {
                ins_price = _this.trade_price;
              }
              return {
                tableData: results,
                form_data: _this.stock_detail,
                ins_price:ins_price
              }
            },
            template: `
            <div style="position:relative">
            <span style="position: absolute;top: -36px;left: 91px;font-size:12px;">股票：{{form_data.stock_code}}&nbsp;&nbsp;{{form_data.stock_name}}&nbsp;&nbsp;价格：{{ins_price}}</span>
            <div class="vue-form-confirmation">
                <table style="width:500px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                            <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">产品账户</th>
                            <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">数量</th>
                            <th class="vue-form-confirmation__text-align-left" style="color:rgba(74,74,74,0.5);">备注</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr  v-for="row in tableData" style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                            <td class="vue-form-confirmation__text-align-left">{{row.product_name}}</td>
                            <td class="vue-form-confirmation__text-align-left">{{row.trade_num}}</td>
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
                var self = this;
                var ins_volume_arr = [];
                var policy_amount_arr = [];
                var batch_no = $.randomNo(LOGIN_INFO.user_id, 30);
                var is_manual_order = 1; //忽略提示性风控

                $.post((window.REQUEST_PREFIX || '') + '/oms/workflow/' + row.product_id + '/add_hand_order', {
                  ignore_tips:1,
                  ins_id: _this.select_ins.id,
                  trade_mode: _this.trade_mode,
                  trade_direction: _this.trade_direction,
                  trade_market: 1,
                  price: self.ins_price,
                  trade_number_method: 'volume',
                  volume: row.trade_num,
                  stock_code: _this.stock_id,
                  is_manual_order: 0,
                  market:1
                }).done(function(res) {
                  console.log(res);
                  if (res.code == 0) {
                    row.btnType = false;
                    row.entrustStatus = "pass";
                    row.msg.unshift('委托成功');
                    row.msg.length = 1;
                    row.style = {

                    }
                  } else {
                    row.btnType = false;
                    row.msg = [];
                    row.msg.unshift(res.msg);
                    row.msg.unshift('委托失败');
                    row.entrustStatus = "fail";
                    row.style = {
                      color: "red"
                    }
                  }
                  self.tableData = Object.assign({}, self.tableData)

                }).fail(function() {
                  row.btnType = false;
                  row.entrustStatus = "fail";
                  row.msg = ["委托失败"];
                  row.style = {

                  }
                  self.tableData = Object.assign({}, self.tableData)
                })


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

        }
      },
      // 强制刷新页面
      refreshDisplay: function(){
        let _this = this;
        if ('' == this.trade_num || '' == this.trade_price) {
          return;
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
              enable_sell_volume = e.enable_sell_volume;

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
            volume: e.trade_num,                               // 交易数量
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
            stock_entrust_num: stock_entrust_num, //该产品已委托该股票数量
            stock_total_share: stock_total_share, //该股票总股票数量，即总股本

            // 联合风控：举牌
            stock_all_position_num: stock_all_position_num, //所有的持仓汇总该股票数量
            stock_all_entrust_num: stock_all_entrust_num, //所有的委托汇总该股票数量

            // 对敲
            stock_entrust_buy_num: stock_entrust_buy_num, //该产品已委托买入数量
            stock_entrust_sell_num: stock_entrust_sell_num, //该产品已委托卖出数量

            // 联合风控：对敲
            stock_all_entrust_buy_num: stock_all_entrust_buy_num, //所有的产品已委托买入数量
            stock_all_entrust_sell_num: stock_all_entrust_sell_num, //所有的产品已委托卖出数量
          });
          e.riskRtn = obj;
        });

        // 强制刷新
        this.display_arr = this.display_arr.filter(function(e){
          return true;
        });

        // 新增了一个流程，在风控处理之后，将是否需要禁用的标志传给trade-form组件，
        this.$nextTick(() => {
          let flag = this.checkSubmitDisabled();
          tradeControllor.$refs['trade-form'].setCheckSubmitDisabled(flag);
        })
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
        // this.checkedProductList = obj.checkedProductList;
        this.select_ins = obj.select_ins;
        this.stock_id = obj.stock_id;
        this.stock_detail = obj.stock_detail;
        this.trade_mode = obj.trade_mode;
        this.trade_price = obj.trade_price;
        this.trade_num = obj.trade_num;
        this.add_ins_method = obj.add_ins_method;

        obj.select_ins && obj.select_ins.sub_list && obj.select_ins.sub_list.forEach(function(e){
          e.web_checked = true;
        });

        this.display_arr = obj.select_ins.sub_list || [];

        this.checkRow();

        this.refreshDisplay();
      },
      checkRow: function(){
        let _this = this;

        let totalGapNumber = 0;
        this.display_arr.forEach(function(e){
          //合并数据
          e.runtime = e.runtime || {};
          $.extend(e.runtime, $.pullValue(window.runtime, e.product_id + '.data'));
          // e.runtime = window.runtime[e.product_id].data;
          // product_list.forEach(function(product){
          //   product.runtime = product.runtime || {};
          //   //采用合并老数据的方式，防止没有数据导致整行空白的问题
          //   $.extend(product.runtime, $.pullValue(res,'data.'+product.id+'.data'));
          // });

          // 计算缺口数量
          // e.gap_number = Math.abs(e.ins_volume - e.current_volume - e.pending_order_number);
          e.gap_number = e.diff_number; //直接由后端接口提供
          // 计算总的缺口额的时候，也只要计算选中的产品的汇总
          if (e.web_checked) {
            totalGapNumber += e.gap_number;
          }
        });

        _this.totalInfo.pending_order_number = 0;
        _this.totalInfo.gap_number = 0;
        _this.totalInfo.trade_num = 0;

        this.display_arr.forEach((e) => {
          if (e.web_checked) {
            if (0 == totalGapNumber) {
              e.trade_num = 0;
            }else{
              e.trade_num = Math.min(Math.floor(e.gap_number / totalGapNumber * _this.trade_num / 100) * 100, e.gap_number);
            }
            
            // 计算总的缺口额的时候，也只要计算选中的产品的汇总
            _this.totalInfo.pending_order_number += e.pending_order_number;
            _this.totalInfo.gap_number += e.gap_number;
            _this.totalInfo.trade_num += e.trade_num;
          }else{
            e.trade_num = 0;
          }
        });
        this.$root.$refs['trade-form'].setTotalInfo({
          showOrHide: this.showOrHide(),
          trade_num: this.totalInfo.trade_num
        });

        if (this.display_arr.every(e => true === e.web_checked)) {
          this.gridHead_web_checked = true;
        }else{
          this.gridHead_web_checked = false;
        }
      },
      setDealPrice(val){
        //  设置交易价格
        this.stock_detail.deal_price = val;

      }
    }
  });

  /**
   * 交易流程使用的vue，其不参与页面显示，但他是整个交易流程。//附，使用中发现一个问题，root组件内部不能使用tradeFlow，只有Vue.component定义的组件能够使用
   * 他的数据来自于各个组件的关键数据，他的数据决定了目前处于交易的哪一个步骤，
   *
   */
  var tradeFlow = new Vue({
    data: {
      curActive: '', // single-buy; single-sell
      // // 选中的产品信息
      // checkedProductList: [],
      // 选中的指令信息
      select_ins: [],
      // 股票id，示例：“601288.SH”
      stock_id: '',
      stock_name: '',
      stock_detail: {},
      // form_data: {},
      trade_mode: 1,
      trade_price: '',
      trade_num: '',
      add_ins_method: 3,
    },
    watch: {
    },
    methods: {
      // Begin: 外部调用，获取提交时需要的数据
      chgCurActive: function(val){
        this.curActive = val
      },
      // chgCheckedProduct: function(arr){
      //   this.checkedProductList = arr;
      //   this.setSubmitData();
      // },

      // 修改选中的指令
      chgSelectIns: function(val){
        if (1 == val.deal_direction) {
          tradeControllor.$refs['trade-menu'].chgActive('single-buy');
        }else{
          tradeControllor.$refs['trade-menu'].chgActive('single-sell');
        }
        this.select_ins = val;
        this.stock_id = this.select_ins.stock_id;
        this.stock_name = this.select_ins.stock_name;

        // 重置其他
        this.trade_mode = 1;
        this.trade_price = '';
        this.trade_num = '';

        this.setSubmitData();
        this.setFormData();
      },
      // chgStockId: function(id){
      //   this.stock_id = id;
      //   this.setSubmitData();
      // },
      shgStockDetail: function(val){
        this.stock_detail = val;
        this.setSubmitData();
      },
      chgTradeMode: function(val){
        this.trade_mode = val;
        this.setSubmitData();
      },
      chgTradePrice: function(val){
        this.trade_price = val;
        this.setSubmitData();
      },
      chgInsMethod: function(val){
        this.add_ins_method = val;
        this.setSubmitData();
      },
      chgTradeNum: function(val){
        this.trade_num = val;
        this.setSubmitData();
      },
      // End: 外部调用，获取提交时需要的数据
      // Begin: 内部处理
      // 检查数据是否ok，ok则全部交给
      setSubmitData: function(){
        // 将数据提交给预览模块
        tradeControllor.$refs['trade-preview'].setSubmitData({
          // checkedProductList: [this.select_ins],
          select_ins: this.select_ins,
          stock_id: this.stock_id,
          stock_detail: this.stock_detail,
          // form_data: this.form_data,
          trade_mode: this.trade_mode,
          trade_price: this.trade_price,
          trade_num: this.trade_num,
          add_ins_method: this.add_ins_method,
        })
      },
      setFormData: function(){
        tradeControllor.$refs['trade-form'].setFormData({
          stock_id: this.stock_id,
          stock_name: this.stock_name,
          trade_mode: this.trade_mode,
          trade_price: this.trade_price,
          trade_num: this.trade_num,
        })
      },
      // End: 内部处理
    }
  });

  // 交易控制部分
  tradeControllor = new Vue({
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
  // 风控持仓
  var loadRiskPositionFn = function(resolve){
    if (true == intervalMap.get('loadRiskPositionFn')) {
      return;
    }
    intervalMap.set('loadRiskPositionFn', true);
    $.get((window.REQUEST_PREFIX||'')+'/oms/helper/risk_position',{product_id:product_ids}, function(res){
      if (0 == res.code) {
        window.risk_position = res.data;
        if ('[object Function]' == Object.prototype.toString.call(resolve)) {
          resolve();
        }
      }
      intervalMap.set('loadRiskPositionFn', false);
    });
  }
  var loadRIskPositionInfo = new Promise(function(resolve, reject){
    loadRiskPositionFn(resolve)
    setInterval(function(){
      loadRiskPositionFn()
    }, 5000);
  });

  // 持仓数据
  var loadPositionRealtimeFn = function(resolve){
    if (true == intervalMap.get('loadPositionRealtimeFn')) {
      return;
    }
    intervalMap.set('loadPositionRealtimeFn', true);
    $.get((window.REQUEST_PREFIX||'')+'/oms/api/multi_position_realtime',{product_id:product_ids}, function(res){
      if (0 == res.code) {
        var position_realtime = [];
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

        window.position_realtime = position_realtime;

        intervalMap.set('loadPositionRealtimeFn', false);

        if ('[object Function]' == Object.prototype.toString.call(resolve)) {
          resolve();
        }
      }
    });
  }
  var loadPositionRealtimeInfo = new Promise(function(resolve, reject){
    loadPositionRealtimeFn(resolve);
    setInterval(function(){
      loadPositionRealtimeFn();
    }, 5000);
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

  // // 获取指令数据
  // var loadInsInfo = new Promise(function(resolve, reject){
  //   $.ajax({
  //     url: window.REQUEST_PREFIX + '/sync/instruction/search_list',
  //     data: {
  //       count: 9999,
  //       type: 'execute',
  //       ins_status_arr: [-1, 2, 3, 4]
  //     },
  //     success: function(res){
  //       if (0 == res.code) {
  //         window.instructionList = res.data.list || [];
  //         resolve();
  //       }else{
  //         reject(res.msg);
  //       }
  //     },
  //     error: function(){
  //       reject('网络异常');
  //     }
  //   })
  // });
  Promise.all([loadRiskRulesInfo, loadStockPoolInfo, loadFeeRulesInfo, loadRIskPositionInfo, loadPositionRealtimeInfo, loadRuntimeInfo]).then(function(){
    console.log('此时才获取了交易所需要的基本数据。');
    // 此时获取了交易所需要的基本数据之后，根据product_list来绘制组件
    instructionExecutePage.loadList(product_list);
  }).catch(function(err){
    $.omsAlert(err);
  })

  instructionExecutePage.$refs['order-list'].loadOrderList();

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

  // 订单下单成功后触发该事件。
  $(window).on('multi_products:create_order:finish', function(e){
    tradeControllor.$refs['trade-revert'].loadOrderList();
    // doRevert.loadOrderList();
    setTimeout(function(){
      tradeControllor.$refs['trade-revert'].loadOrderList();
      // doRevert.loadOrderList();
    },5000);
  });

  // last_update接口触发刷新事件
  // 单纯搜索自定义事件名称是搜不出来东西的。
  // 因为以前的人用的是字符串拼接的方式。只有在维护了这种代码之后，才能够发现这种处理方式实在是极其难以维护
  // 拼接字符串的代码在 standard.blade.php 文件中
  $(window).on('entrust_update_updated',function(event){
    var flag = false;
    tradeControllor.$refs['trade-revert'] && tradeControllor.$refs['trade-revert'].query_arr && tradeControllor.$refs['trade-revert'].query_arr.forEach(function(e){
      if (tradeControllor.$refs['trade-revert'][e.gridDataStr].last_updated_timestamp < event.updated_timestamp) {
        flag = true;
      }
    });

    if( flag ){
      tradeControllor.$refs['trade-revert'].loadOrderList();
      // doRevert.loadOrderList();

      // // setTimeout(function(){
      // //   doRevert.loadOrderList();
      // // },5000);
    }
  });
  
})

