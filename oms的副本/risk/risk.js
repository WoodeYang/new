/**
 * 风控监控页面
 * Author: liuzeyafzy@gmail.com
 */
// 
const permissionArr = {
  'PERMISSION_RISK_HANDLE': 24, //风控监控
  'PERMISSION_PRODUCT_RISK': 26 //风控设置
};
let supportPage = [];
let product_ids = [];
if (window.LOGIN_INFO.permission[permissionArr['PERMISSION_RISK_HANDLE']]) {
  supportPage.push(0);
}
if (window.LOGIN_INFO.permission[permissionArr['PERMISSION_PRODUCT_RISK']]) {
  supportPage.push(1);
  supportPage.push(2);
  product_ids = window.LOGIN_INFO.role_permission[permissionArr['PERMISSION_PRODUCT_RISK']]
}

if (0 == supportPage.length) {
  $.omsAlert('权限异常');
}

var totals = {};
var allStockIdArr = [];
let jc;
var riskVue

var common_stockPool = [];
var common_stockPool_v2 = common_stockPool;
var getStockPool = function(resolve, reject){
  $.ajax({
    url: '/rms-pub/stock_pool/get_list',
    success: function({code, msg, data}){
      while(common_stockPool.length > 0)
      {
        common_stockPool.pop();
      }
      console.log(common_stockPool)
      data.forEach(e => {
        common_stockPool.push(e);
      })
      if (Object.prototype.toString.call(resolve) == "[object Function]") {
        resolve();
      }
    },
    error: function(){
      if (Object.prototype.toString.call(reject) == "[object Function]") {
        reject();
      }
    }
  });
};
var promiseGetStockPool = new Promise(function(resolve, reject){
  // 获取股票池
  getStockPool(resolve, reject)
})

// 导航组件
Vue.component('risk-nav-li',{
  template:`<li v-bind:class="{active:index==current}" @click="toMe"><slot></slot></li>`,
  props:['index','current'],
  data(){
    return {
    }
  },
  methods:{
    toMe(){
      this.$emit('change',this.index)
    }
  }
});

$(window).on('multi_load', function(event){
  var product_list = event.product_list;
  // var product_ids = event.product_ids;

  promiseGetStockPool.then(function(){
    riskVue = new Vue({
      el:"#risk",
      data:{
        selected_rules: [],

        supportPage: supportPage,
        current: supportPage[0]|0, // 当前导航索引，0，1，2，对应navlist数组索引
        navlist:['风控监控','独立风控设置','联合风控设置'],
        select_all:false,
        totals: {},// 账户全部风控监控信息在totals之中,其他基于此数据的信息，在computed之中，
        totalsUnion: {},
        displayTotals: {},
        totalsCopy:JSON.parse(JSON.stringify(totals)),
        checkallstatus:false,
        setdozenarr:[],// 批量设置的product_id
        setsingle:[],// 单个设置时候的product_id
        independentSelected:[],// 依据批量设置或者单个设置来控制,内容为product_id;
        independentSelectedData:{},//监视independentSelected生产的原始数据
        independentSelectedDataNum:0,// 默认用户不选择产品进行设置
        isRotate:false,// 刷新时候默认动画class不存在,刷新按钮选择依赖
        inSelectedRisk:[],// [{},{},...,{}],处理得到的每个产品的详细风险数据
        displayUnionRisk: [], //联合风控
        
        // 产品选中列表
        productSelected:[],//搜索框搜索结果列表
        // 告警类型选中列表
        warnSelected:'',

        // 过滤，产品列表多选框的options
        products:[],
        // 过滤，告警类型列表多选框的options
        warntypes:[{ 
          value:1, // risk_type
          label:'禁买股票池风控'
        },{
          value:2,
          label:'净值仓位风控'
        },{
          value:3,
          label:'个股仓位风控'
        },{
          value:4,
          label:'举牌风控'
        },{
          value:5,
          label:'对敲风控'
        }],

        multiple_select:[],

        isSlideDown:false,// 继续选择与否
        stockPool: common_stockPool,

        // // 修改的规则
        // curEditRule
      },
      beforeMount(){
        let that = this;
        that.products = [];
        Object.keys(this.totals).forEach(function(e,index){
          that.products.push({
            value:e,
            label:that.totals[e]['product_name']
          })
        })
      },
      watch:{
        independentSelected: function(newArr, oldArr){
          // 重置已经选择的产品是否选择，然后再根据目前的arr来添加
          Object.keys(this.totals).forEach(e => {
            this.totals[e]['checked'] = false;
          })
          newArr.forEach(k=>{
            if (this.totals[k]) {
              this.totals[k]['checked'] = true;
            }
          })

          this.inSelectedRisk = [];
          newArr.forEach(e => {
            let ruleDetailsArr = this.displayRuleDetails(this.totals[e].risks, {
              product_name: this.totals[e].product_name,
              product_id: this.totals[e].product_id
            });
            this.inSelectedRisk = this.inSelectedRisk.concat(ruleDetailsArr);
          })
        },
        productSelected: function(){
          this.prepareDisplay();
        },
        warnSelected: function(){
          this.prepareDisplay();
        }
      },
      methods:{
        multiDeleteRule(){
          if (0 == this.selected_rules.length) {
            $.omsAlert('请选择风控规则');
            return false;
          }
          
          let trStr = '';
          var ruleIdArr = [];
          this.selected_rules.forEach(e => {
            ruleIdArr.push(e.rule_id);
            trStr += `<tr>
                  <td style="padding-left: 50px; width: 110px;">`+ e.product_name +`</td>
                  <td style="padding-left: 20px; width: 110px;">`+ GetNameByRiskType(e.risk_type) +`</td>
                  <td>`+ GetPreVal(e.risk_type, e.pre_val) + GetLimitVal(e.risk_type, e.limit_val) + GetLimitAction(e.risk_type, e.limit_action) +`</td>
                </tr>`
          })

          var that = this;
          // GetNameByRiskType(type)
          let html = `
            <table>
              <thead>
                <tr>
                  <td style="padding-left: 50px; width: 110px;">产品</td>
                  <td style="padding-left: 20px; width: 110px;">风控类别</td>
                  <td>风控规则</td>
                </tr>
              </thead>
              <tbody>`+ trStr +`</tbody>
            </table>
          `;

          $.confirm({
            title: '删除确认',
            content: html,
            closeIcon: true,
            confirmButton: '确认',
            cancelButton: false,
            confirm: function(){
              $.startLoading('正在删除...');
              $.ajax({
                url: '/rms-pub/rule/delete',
                type: 'post',
                data: {
                  id: ruleIdArr.join(',')
                },
                success: function({code, msg, data}){
                  $.clearLoading();
                  riskVue.getList();
                  riskVue.getListCo();
                  $.omsAlert('删除成功');
                },
                error: function(){
                  $.clearLoading();
                }
              })
            }
          });
        },
        multi_delete: function(){
          let arr = this.multi_delete;
          if (0 == arr.length) {
            $.omsAlert('请选择风控');
            return;
          }
        },
        selectProduct: function(id){
          Vue.set(this.independentSelected, 0, id)
          // this.independentSelected[0] = id;
        },
        checkPermission: function(id){
          if (this.supportPage.some(e => {
            return e == id;
          })) {
            return true;
          }else{
            return false;
          }
        },
        displayRuleDetails(risks, inObj){
          let _this = this;
          let arr = [];
          Object.keys(risks).forEach(function(e, i){
            risks[e].forEach(function(el){
              // if (1 == el.status) {
                arr.push(el);
              // }
            })
          });

          let ruleDetailArr = [];

          arr.forEach(function(e){
            let pre_val_arr = [];
            let limit_val_arr = [];
            let limit_action_arr = [];

            displayRules.forEach(function(el){
              // 找到匹配的风控出来
              // 接口处的是risk_type，而前端页面自定义的是type
              if (e.risk_type == el.type) {
                // 准备pre_val，limit_val、limit_action
                el.pre_val.forEach(pre => {
                  let obj = {};
                  obj.name = pre.name;
                  if ('select' == pre.type) {
                    common_stockPool.forEach(stockPool => {
                      if (e.pre_val[0] == stockPool.id) {
                        obj.value = stockPool.pool_name;
                      }
                    })
                  }else if('input' == pre.type){
                    obj.value = pre.operator + e.pre_val[0] + pre.unit;
                  }else if('select2' == pre.type){
                    let str = '';
                    pre.options.forEach(option => {
                      if (e.pre_val[0] == option.value) {
                        str = option.label;
                      }
                    });
                    obj.value = str;
                  }

                  pre_val_arr.push(obj);
                });

                el.limit_val.forEach(limit => {
                  let obj = {};
                  obj.name = limit.name;
                  if ('select' == limit.type) {
                    common_stockPool.forEach(stockPool => {
                      if (e.limit_val[0] == stockPool.id) {
                        obj.value = stockPool.pool_name;
                      }
                    })
                  }else if('input' == limit.type){
                    obj.value = limit.operator + e.limit_val[0] + limit.unit;
                  }

                  limit_val_arr.push(obj);
                });

                let obj = {};
                obj.name = el.limit_actionInfo.name;
                el.limit_action.forEach(action => {
                  if (e.limit_action == action.type) {
                    obj.value = action.name;
                  }
                })
                limit_action_arr.push(obj);
              }
            });

            // 这里千万记得第一个参数是空对象，因为assign会修改第一个参数，导致所有的都是同一份数据。
            var tmpObj = Object.assign({}, inObj, {
              risk_type: e.risk_type,
              rule_id: e.rule_id,
              pre_val: e.pre_val,
              limit_val: e.limit_val,
              limit_action: e.limit_action,

              pre_val_arr: pre_val_arr,
              limit_val_arr: limit_val_arr,
              limit_action_arr: limit_action_arr
            })

            ruleDetailArr.push(tmpObj);
          })

          return ruleDetailArr;
          // console.log(ruleDetailArr);
        },
        getListCo: function(){
          var _this = this;
          $.ajax({
            url: '/rms-pub/rule/get_list_co',
            success: function({code, msg, data}){
              if (0 == code) {
                _this.totalsUnion = data;

                _this.displayUnionRisk = [];

                let ruleDetailsArr = _this.displayRuleDetails(_this.totalsUnion, {
                  product_name: '所有产品',
                  product_id: '-1'
                });
                _this.displayUnionRisk = _this.displayUnionRisk.concat(ruleDetailsArr);

                // _this.prepareUnionDisplay();
              }else{
                $.omsAlert(msg)
              }
            },
            error: function(e){
              $.omsAlert('网络异常')
            }
          })
        },
        getList: function(){
          var _this = this;
          this.isRotate = true;
          $.ajax({
            url: '/rms-pub/rule/get_risk',
            data: {
              product_id: product_ids.join(',')
            },
            success: function({code, msg, data}){
              if (0 == code) {
                _this.totals = data;

                _this.products = [];
                Object.keys(_this.totals).forEach(function(e,index){
                  _this.products.push({
                    value:e,
                    label:_this.totals[e]['product_name']
                  });
                });

                _this.prepareDisplay();
              }else{
                $.omsAlert(msg);
              }
              _this.isRotate = false;
            },
            error: function(e){
              $.omsAlert('网络异常');
              _this.isRotate = false;
            }
          });
        },
        prepareDisplay:function(){
          // displayTotals productSelected warnSelected
          var rtn = {};
          Object.keys(this.totals).forEach(e => {
            let someFlag = this.warnSelected.some(el => {
              var tmpFlag = false;
              Object.keys(this.totals[e].risks).forEach(ele => {
                if (this.totals[e].risks[ele].some(element => {
                    return element.risk_type == el;
                })) {
                  tmpFlag = true;
                }
              });
              return tmpFlag;
              // return el == this.totals[e].
            });

            if (this.productSelected.some(el => {
              return el == e;
            }) && (someFlag || this.warnSelected.length == this.warntypes.length)) {
              rtn[e] = this.totals[e];
            }
          });

          this.displayTotals = rtn;
          this.independentSelected = JSON.parse(JSON.stringify(this.independentSelected));
        },
        changeNav(v){ // 导航栏切换
          this.current = v;
        },
        checkall(){ // 全选
          this.checkallstatus = !this.checkallstatus;
        },
        setdozenfn(ischeck,product_id){ // 只保存选中的产品的product_id
          if(ischeck){ // add
            this.setdozenarr.push(product_id);
          }else{ //del
            for(let i = this.setdozenarr.length - 1 ; i >= 0 ; i--){
              if(this.setdozenarr[i]==product_id){
                this.setdozenarr.splice(i,1);
              }  
            }
          }
        },
        setdozengo(){ // 将选中的product_id 数组传递独立风险控制,并且tabq切换
          if(this.setdozenarr.length < 1){
            $.omsAlert('请先勾选产品');
            return;
          }
          this.independentSelected = JSON.parse(JSON.stringify(this.setdozenarr));
          this.changeNav(1);
        },
        setsinglefn(product_id){
          this.setsingle = [];
          this.setsingle.push(product_id);
          this.independentSelected = JSON.parse(JSON.stringify(this.setsingle));
          this.changeNav(1);
        },
        refresh(){// 风控监控页面刷新
          this.getList();

          // this.isRotate = true;
          // let that = this;
          // // 这里用定时器来模拟ajax异步操作,更新totals,以及其副本即可
          // setTimeout(function(){
          //   that.totals = totals;
          //   that.totalsCopy = JSON.parse(JSON.stringify(totals))
          //   that.isRotate = false;
          // },1000)
        },
        productPreviewSilde(){ // 风控设置收起与展开
          this.isSlideDown = !this.isSlideDown;
          console.log("clicked more",this.isSlideDown)
        },
        productPreviewEnsure(){// 独立风控设置  确定选择产品
          this.isSlideDown = !this.isSlideDown;
          let that = this;

          Object.keys(that.totals).forEach((e)=>{
            that.totals[e]['checked'] = false;
          })
          that.independentSelected.forEach(k=>{
            that.totals[k]['checked'] = true;
          })

          // // 下面会进行具体数据操作，那么需要保障所操纵的数据是最新的，用ajax重新刷新totals
          // this.$nextTick(function(){
          //   // that.totals = totals;
          //   // 因数据刷新没有绑定选择的状态，需要在此处添加
          //   Object.keys(that.totals).forEach((e)=>{
          //     that.totals[e]['checked'] = false;
          //   })
          //   that.independentSelected.forEach(k=>{
          //     that.totals[k]['checked'] = true;
          //   })
          // });
        },
        // 独立风控设置 取消产品选择
        // 有一个bug，取消之后，this.independentSelected依旧是被修改的状态，不会恢复
        productPreviewCancel(){
          this.isSlideDown = !this.isSlideDown;
        },
        // 修改选中的产品
        changeindependentSelectedData(product_id){
          if(this.independentSelected.indexOf(product_id) < 0){
            this.independentSelected.push(product_id)
          }else{
            let index = this.independentSelected.indexOf(product_id);
            if(index>=0){
              this.independentSelected.splice(index,1)
              console.log(product_id,JSON.parse(JSON.stringify(this.independentSelected)))
            }
          }
          
        },
      }
    });

    riskVue.getList();
    riskVue.getListCo();
  })

});

/**
* 修改、添加列表时候显示不同的内容,自定义准备数据
*/ 
let displayRules = [
  {
    name: '禁买股票池风控',
    display: true,
    num: 0,
    type: 1,
    pre_val: [{
      name: '证券属于',
      type: 'select',
      value: '-1',
      required: true,
      placeHolder: '请选择股票池',
      addition: [{
        text: '自定义股票池',
        action: 'addCustomStockPool'
      }]
    }],
    limit_val: [], // 无限制条件
    hideAction: true,
    limit_actionInfo: {
      name: '预警操作',
      required: false,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
    //   type: 0,
    //   name: '预警提醒'
    // },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '净值仓位风控',
    display: true,
    num: 0,
    type: 2,
    pre_val: [{
      // 单位净值
      name: '单位净值',
      type: 'input',
      value: '',
      operator: '<', // 运算符，显示在内容前
      placeHolder: '请输入数字',
      unit: '', // 数量单位
      inputReg: /^\d{1,4}\.?\d{0,4}$/,
      reg: '^[1-9]/d*/./d*|0/./d*[1-9]/d*$' // 正则表达式的字符串，使用的时候记得new RegExp()
    }],
    limit_val: [{
      // 最大仓位限制
      name: '仓位',
      type: 'input',
      operator: '>',
      value: '',
      placeHolder: '请输入数字',
      unit: '%',
      inputReg: /^\d{1,4}\.?\d{0,2}$/,
      reg: '/^\d*$/'
    }],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '个股仓位风控',
    display: true,
    num: 0,
    type: 3,
    pre_val: [{
      name: '证券属于',
      type: 'select',
      value: '-1',
      required: true,
      placeHolder: '请选择股票池',
      addition: [{
        text: '自定义股票池',
        action: 'addCustomStockPool'
      }]
    }],
    limit_val: [{
      name: '个股仓位',
      type: 'input',
      value: '',
      operator: '≥',
      placeHolder: '请输入数字',
      unit: '%',
      inputReg: /^\d{1,4}\.?\d{0,2}$/,
      reg: '^[1-9]/d*/./d*|0/./d*[1-9]/d*$'
    }],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '举牌风控',
    display: true,
    num: 0,
    type: 4,
    pre_val: [{
      name: '监控内容',
      type: 'select2',
      value: '-4',
      required: true,
      placeHolder: '请选择监控内容',
      options: [{
        label: '个股持仓数量／总股本',
        value: '-4'
      }]
    }],
    limit_val: [{
      name: '',
      type: 'input',
      value: '',
      operator: '≥',
      placeHolder: '请输入数字',
      unit: '%',
      inputReg: /^\d{1,4}\.?\d{0,2}$/,
      reg: '^[1-9]/d*/./d*|0/./d*[1-9]/d*$'
    }],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '对敲风控',
    display: true,
    num: 0,
    type: 5,
    pre_val: [{
      name: '监控内容',
      type: 'select2',
      value: '-5',
      required: true,
      placeHolder: '请选择监控内容',
      options: [{
        label: '提交委托与未成交委托反向',
        value: '-5'
      }]
    }],
    limit_val: [],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '个股仓位风控',
    display: true,
    num: 0,
    type: 6,
    pre_val: [{
      name: '证券属于',
      type: 'select',
      value: '-1',
      required: true,
      placeHolder: '请选择股票池',
      addition: [{
        text: '自定义股票池',
        action: 'addCustomStockPool'
      }]
    }],
    limit_val: [{
      name: '个股仓位',
      type: 'input',
      value: '',
      operator: '≥',
      placeHolder: '请输入数字',
      unit: '%',
      inputReg: /^\d{1,4}\.?\d{0,2}$/,
      reg: '^[1-9]/d*/./d*|0/./d*[1-9]/d*$'
    }],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '举牌风控',
    display: true,
    num: 0,
    type: 7,
    pre_val: [{
      name: '监控内容',
      type: 'select2',
      value: '-4',
      required: true,
      placeHolder: '请选择监控内容',
      options: [{
        label: '个股持仓数量／总股本',
        value: '-4'
      }]
    }],
    limit_val: [{
      name: '',
      type: 'input',
      value: '',
      operator: '≥',
      placeHolder: '请输入数字',
      unit: '%',
      inputReg: /^\d{1,4}\.?\d{0,2}$/,
      reg: '^[1-9]/d*/./d*|0/./d*[1-9]/d*$'
    }],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },

  {
    name: '对敲风控',
    display: true,
    num: 0,
    type: 8,
    pre_val: [{
      name: '监控内容',
      type: 'select2',
      value: '-5',
      required: true,
      placeHolder: '请选择监控内容',
      options: [{
        label: '提交委托与未成交委托反向',
        value: '-5'
      }]
    }],
    limit_val: [],
    limit_actionInfo: {
      name: '预警操作',
      required: true,
      value: '0',
      placeHolder: '请选择预警类型'
    },
    limit_action: [{
      type: 0,
      name: '预警提醒'
    },{
      type: 1,
      name: '禁止买入'
    }]
  },
];

// 复制插件
Vue.component('selectize-stock-pool', {
  props: ['options', 'value'],
  template: `
    <select>
      <slot></slot>
    </select>
  `,
  mounted: function () {
    var vm = this;
    var selectize = $(this.$el).selectize({
      delimiter: ',',
      persist: true,
      placeholder: '请选择股票池',
      valueField: 'id',
      labelField: 'pool_name',
      addPrecedence: true,
      sortField: [],
      render: {
        'option': function(data, escape) {
          var field_label = this.settings.labelField;
          // 需要做一个判断，因为需要支持用户点击后新增股票池。
          if (!isFinite(data.id)) {
            return '<div class="option" style="border-top: 1px dashed #000;">' + escape(data[field_label]) + '</div>';
          }else{
            return '<div class="option">' + escape(data[field_label]) + '</div>';
          }
        }
      },
      onChange: function(v){
        // "自定义股票池"被选中时，不修改父组件的值，同时恢复子组件中selectize的值。仅触发父组件函数显示“自定义股票池”
        if (!isFinite(v)) {
          vm.$emit('show_stock_pool', v);
          this.setValue(vm.value);
        }else{
          vm.$emit('input', v);
        }
      }
    })[0].selectize;
    // selectize.clearOptions(true);
    var newOptions = this.options.concat({
      pool_name: '自定义股票池',
      id: Infinity
    })
    // selectize.addOption(this.options);
    selectize.addOption(newOptions);
    selectize.setValue(this.value);
    selectize = null;
  },
  watch: {
    value: function (value) {
      // update value
      $(this.$el).selectize()[0].selectize.setValue(value);
    },
    options: function (options) {
      // // update options
      var value = this.value;
      var selectize = $(this.$el).selectize()[0].selectize;
      selectize.clearOptions(true);
      var newOptions = this.options.concat({
        pool_name: '自定义股票池',
        id: Infinity
      })
      // selectize.addOption(this.options);
      selectize.addOption(newOptions);
      selectize.setValue(value);
      selectize = null;
    }
  }
  ,
  destroyed: function () {
    $(this.$el).off().selectize()[0].selectize.destroy();
  }
});

Vue.component('risk-monitoring-row',{
  mixins: [numberMixin],
  props:['row','checkboxall'],// row:totols 中的每一行的信息
  template:`
    <div class="risk-monitoring_row">
      <div class="risk-monitor_td_first ellipsis" style="width:145px">
        <span v-bind:class="[risknum>0?'icon-alert':'icon-normal']"></span>
        <input v-if="false" type="checkbox" :checked="ischeck" style="margin-right:5px" @click="checktocheck">
        <span v-text="row.product_name" :title="row.product_name"></span>
      </div>
      <div class="risk-monitor_td al risk_ellispis" style="width:70px">
        {{row.name}}
      </div>
      <div class="risk-monitor_td al" style="width:70px;color:#1CBF62;">
        {{numeralNumber(row.net_value, 4)}}
      </div>
      <div class="risk-monitor_td ac" style="width:70px">
        {{numeralPercent(row.position)}}
      </div>
      <div class="risk-monitor_td ac" style="width:105px">
        {{numeralNumber(row.total_assets, 2)}}
      </div>
      <div class="risk-monitor_td ac" style="width:100px">
        {{risknum}}
      </div>
      <div class="risk-monitor_td al" style="width:200px;margin-right:30px;position:relative;" @mouseover="showtypedetails" @mouseout="showtypedetails" >
        <div class="risk-monitor_short risk_ellispis">
          {{risktypes}}
        </div>
        <div class="risk-monitor_shadow" v-show="show_risk_type_details">
          {{risktypes_html}}
        </div>
      </div>
      <div class="risk-monitor_td ac" style="width:400px;margin-right:30px;position:relative" @mouseover="showdescsdetails" @mouseout="showdescsdetails">
        <div class="risk-monitor_short risk_ellispis">
          <div v-for="singleRule in riskDetails" style="display: flex;">
            <div v-for="pre_val in singleRule.pre_val_arr" style="margin-right: 5px;">
              <span>{{pre_val.name}}</span>
              <span>{{pre_val.value}}</span>
            </div>
            <div v-for="limit_val in singleRule.limit_val_arr" style="margin-right: 5px;">
              <span>{{limit_val.name}}</span>
              <span>{{limit_val.value}}</span>
            </div>
            <div v-for="limit_action in singleRule.limit_action_arr" style="margin-right: 5px;">
              <span>{{limit_action.value}}</span>
            </div>
          </div>
        </div>
        <div class="risk-monitor_shadow al"  v-show="show_risk_descs_details">
          <div v-for="singleRule in riskDetails" style="display: flex;">
            <div v-for="pre_val in singleRule.pre_val_arr" style="margin-right: 5px;">
              <span>{{pre_val.name}}</span>
              <span>{{pre_val.value}}</span>
            </div>
            <div v-for="limit_val in singleRule.limit_val_arr" style="margin-right: 5px;">
              <span>{{limit_val.name}}</span>
              <span>{{limit_val.value}}</span>
            </div>
            <div v-for="limit_action in singleRule.limit_action_arr" style="margin-right: 5px;">
              <span>{{limit_action.value}}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="flex: 1;text-align: right;padding-right:20px;">
        <div v-if="false" class="risk-monitor_td_btn" @click="decrease">
          <span class="risk-monitor_decrease">降仓</span>
        </div> 
        <div class="risk-monitor_td_btn" @click="set">
          <span class="risk-monitor_increase">设置</span>
        </div>
      </div>
    </div>
  `,
  mounted(){
    // console.log(this.row)
  },
  data(){
    return {
      show_risk_type_details:false,
      show_risk_descs_details:false,
      ischeck:false,      
    }
  },
  watch:{
    checkboxall:function(n,o){ // 根元素，全选与非全选
      this.ischeck = n;
    },
    ischeck:function(n,o){
      this.$emit('setdozen',n,this.row.product_id);
    }
  },
  computed:{
    // 风控条数,status == 1 为触发，status == 0 为不触发
    risknum(){
      let n = 0;
      let _this = this;

      Object.values(_this.row.risks).forEach(function(e){
        e.forEach(function(el){
          // 测试已经与产品确认，这里展示的是配置的风控，而不是触警的风控
          // if (1 == el.status) {
            n++;
          // }
        })
      })

      return n;
    },
    // 触发风险类别，一般字符串
    risktypes(){
      return this.tranformtypes(true);
    },
    // 触发风险类别，弹框形式
    risktypes_html(){
      return this.tranformtypes(false);
    },
    riskDetails(){
      return this.displayRuleDetails();
      // let ruleDetailArr = this.displayRuleDetails();

    }
  },
  methods:{
    showtypedetails(){
      this.show_risk_type_details = !this.show_risk_type_details;
    },
    showdescsdetails(){
      this.show_risk_descs_details = !this.show_risk_descs_details;
    },
    // 获取已触发风控的风控数组
    getActiveRulesArr(){
      let _this = this;
      let arr = [];
      const riskInfo = {
        target:'禁买股票池风控',
        wholePosition:'净值仓位风控',
        onePosition:'个股仓位风控',
        placards:'举牌风控',
        controTrade:'对敲风控'
      };

      Object.keys(this.row.risks).forEach(function(e, i){
        if (_this.row.risks[e].some(function(el){
          return 1 == el.status;
        })) {
          arr.push(riskInfo[e]);
        }
      });

      return arr;
    },
    // flag 为true 时显示普通文本，为false显示弹出框文本
    tranformtypes(flag){
      var riskArr = this.getActiveRulesArr();
      let str = '';

      if (riskArr.length == 0) {
        str = '- -';
      }else{
        str = riskArr.join('、');
      }
      
      return str;
    },
    // 给定risks结构，计算出所有的风控
    displayRuleDetails(){
      let _this = this;
      let arr = [];
      Object.keys(this.row.risks).forEach(function(e, i){
        _this.row.risks[e].forEach(function(el){
          if (1 == el.status) {
            arr.push(el);
          }
        })
      });

      let ruleDetailArr = [];

      arr.forEach(function(e){
        let pre_val_arr = [];
        let limit_val_arr = [];
        let limit_action_arr = [];

        displayRules.forEach(function(el){
          // 找到匹配的风控出来
          // 接口处的是risk_type，而前端页面自定义的是type
          if (e.risk_type == el.type) {
            // 准备pre_val，limit_val、limit_action
            el.pre_val.forEach(pre => {
              let obj = {};
              obj.name = pre.name;
              if ('select' == pre.type) {
                common_stockPool.forEach(stockPool => {
                  if (e.pre_val[0] == stockPool.id) {
                    obj.value = stockPool.pool_name;
                  }
                })
              }else if('input' == pre.type){
                obj.value = pre.operator + e.pre_val[0] + pre.unit;
              }else if('select2' == pre.type){
                let str = '';
                pre.options.forEach(option => {
                  if (e.pre_val[0] == option.value) {
                    str = option.label;
                  }
                });
                obj.value = str;
              }

              pre_val_arr.push(obj);
            });

            el.limit_val.forEach(limit => {
              let obj = {};
              obj.name = limit.name;
              if ('select' == limit.type) {
                common_stockPool.forEach(stockPool => {
                  if (e.limit_val[0] == stockPool.id) {
                    obj.value = stockPool.pool_name;
                  }
                })
              }else if('input' == limit.type){
                obj.value = limit.operator + e.pre_val[0] + limit.unit;
              }

              limit_val_arr.push(obj);
            });

            let obj = {};
            obj.name = el.limit_actionInfo.name;
            el.limit_action.forEach(action => {
              if (e.limit_action == action.type) {
                obj.value = action.name;
              }
            })
            limit_action_arr.push(obj);
          }
        });

        ruleDetailArr.push({
          pre_val_arr: pre_val_arr,
          limit_val_arr: limit_val_arr,
          limit_action_arr: limit_action_arr
        });
      })

      return ruleDetailArr;
      // console.log(ruleDetailArr);
    },
    checktocheck(){ // 选中checkbox,选中自己，发送事件
      this.ischeck = !this.ischeck;
    },
    decrease(){  // 降仓跳转,跳转到委托管理页面,待完善
      console.log(this.row.product_id) 

    },
    set(){  // 设置，跳转到独立风控页面，并勾选(只设置单选项)
      this.$emit('setsingle',this.row.product_id)
    }
  }
});

// 页面混合，vue的语法
let reportMixin = {
  // mounted: function(){
  //   // 切换菜单时，会触发mounted事件，
  //   let sortData = '';
  //   common_storage.getItem(this.typeStr, (rtn) => {
  //     if (0 == rtn.code) {
  //       this.order = rtn.data.order;
  //       this.order_by = rtn.data.order_by;
  //       // display_rules 根据保存的field_sort进行排序
  //       // rtn.data.field_sort 从尾到头遍历，一旦匹配则unshift添加到display_rules数组前面，且删除原来那个元素。（注意，display_rules长度及元素位置在变化，所以应该从0开始计数）
  //       for (let i = rtn.data.field_sort.length - 1; i >= 0; i--) {
  //         for (let j = 0, length = this.display_rules.length; j < length; j++) {
  //           if (this.display_rules[j].id == rtn.data.field_sort[i]) {
  //             let obj = this.display_rules[j];
  //             this.display_rules.splice(j, 1);
  //             this.display_rules.unshift(obj);
  //           }
  //         }
  //       }

  //       // // console.log('typeStr: ' + this.typeStr);
  //       // this.$emit('order', {
  //       //   order: this.order,
  //       //   order_by: this.order_by,
  //       //   typeStr: this.typeStr,
  //       //   display_rules: this.display_rules
  //       // });
  //     }

  //     this.$emit('order', {
  //       order: this.order,
  //       order_by: this.order_by,
  //       typeStr: this.typeStr,
  //       display_rules: this.display_rules
  //     });

  //   });

  // },
  computed: {
    // 可拖动插件的入参
    dragOptions () {
      return  {
        animation: 0,
        // group: 'description',
        // disabled: !this.editable,
        ghostClass: 'ghost'
      };
    }
  },
  methods: {
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
      // 用户切换排序命令，需要保存新的排序
      let obj = {};
      obj.field_sort = this.display_rules.map(function(e){
        return e.id
      });
      obj.order_by = this.order_by;
      obj.order = this.order;

      this.$emit('order', {order: this.order,
        order_by: this.order_by,
        typeStr: this.typeStr,
        display_rules: this.display_rules
      });
      common_storage.setItem(this.typeStr, obj);
    },
    onMove: function({relatedContext, draggedContext}){
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
    },
    onEnd: function(){
      // 用户切换表格排序，需要保存新的排序
      let obj = {};
      obj.field_sort = this.display_rules.map(function(e){
        return e.id
      });
      obj.order_by = this.order_by;
      obj.order = this.order;
      common_storage.setItem(this.typeStr, obj);
    },
    displayValue: function(sub_value, rule){
      let value = sub_value[rule.id];
      if ((rule.format != '') && (rule.format instanceof Array) && (this[rule.format[0]] instanceof Function)) {
        // value = this[rule.format].call(this, value, )
        let args = [value].concat(rule.format.slice(1))
        value = this[rule.format[0]].apply(this, args);

      }
      if (rule.unit) {
        return value + rule.unit;
      }else{
        return value;
      }
    },
    checkPositive: function(num){
      return parseFloat(num) > 0;
    },
    checkNegative: function(num){
      return parseFloat(num) < 0;
    }
  }
};
let riskDetailData = {
  typeStr: 'risk_detail_data',
  order: '',
  order_by: '',
  display_rules: [{
    id: 'product_name',
    label: '产品',
    format: '',
    class: 'left20 width250'
  }, {
    id: 'risk_type_str',
    label: '风控类别',
    showOrder: true,
    format: '',
    class: 'left20 width250'
  }, {
    id: 'risk_rule',
    label: '风控规则',
    format: '',
    class: 'left20'
  }]
}
Vue.component('vue-risk-detail', {
  mixins: [reportMixin],
  props: ['in_selected_risk', 'independent_selected'],// in_selected_risk是风控数据，independent_selected是选中的产品，independent_selected主要是为了解决列表为空的显示
  template: `
  <table class="newweb-common-grid">
    <thead>
      <tr>
        <th>
          <input type="checkbox" v-model="selectAll" @change="chgSelectAll()" />
        </th>
        <th v-for="rule in display_rules" v-bind:class="rule.class">
          <span>{{rule.label}}</span>
          <a v-if="rule.showOrder" class="icon-sortBy" v-on:click="chgSort(rule.id)">
            <i class="icon-asc" :class="{active: (order_by == rule.id && order == 'asc')}"></i>
            <i class="icon-desc" :class="{active: (order_by == rule.id && order == 'desc')}"></i>
          </a>
        </th>
        <th></th>
      </tr>
    </thead>
    <tbody v-if="display_data && display_data.length > 0" v-for="row in display_data">
      <tr>
        <td>
          <input type="checkbox" v-model="row.web_checked" @change="chgSelectedRules()" />
        </td>
        <td v-for="rule in display_rules" v-if="rule.id != 'risk_rule'" v-bind:class="rule.class" :title="displayValue(row, rule)" style="text-overflow: ellipsis;max-width: 200px;overflow: hidden;white-space: nowrap;">
          {{displayValue(row, rule)}}
        </td>
        <td v-for="rule in display_rules" v-if="rule.id == 'risk_rule'" class="left20">
          <div v-for="pre_val in row.pre_val_arr" style="margin-right: 5px;">
            <span>{{pre_val.name}}</span>
            <span style="color: rgb(33, 150, 243)">{{pre_val.value}}</span>
          </div>
          <div v-for="limit_val in row.limit_val_arr" style="margin-right: 5px;">
            <span>{{limit_val.name}}</span>
            <span style="color: rgb(33, 150, 243)">{{limit_val.value}}</span>
          </div>
          <div v-for="limit_action in row.limit_action_arr" style="margin-right: 5px;">
            <span style="color: rgb(244, 67, 54);">{{limit_action.value}}</span>
          </div>
        </td>
        <td>
          <a class="details_list_btn_modify" @click="editRule(row, row.rule_id, row.risk_type)">修改</a>
          <a class="details_list_btn_del" @click="deleteRule(row.rule_id, row.risk_type)">删除</a>
        </td>
      </tr>
      <tr v-if="row.rule_id == curEditRule.rule_id">
        <td colspan="999" style="background: #F7F7F7;height: 84px;">
          <template v-for="rule in rulesNeedShow" v-if="rule.type == row.risk_type">
            <!-- Begin：pre_val条件 -->
            <template v-for="(val, index) in rule.pre_val">
              <label class="rules-label">
                <span v-text="val.name"></span>
                <template v-if="'input' == val.type">
                  <div class="rules_input" style="display: inline-block;">
                    <span v-text="val.operator"></span>
                    <input :placeholder="val.placeHolder" type="text" v-model="curEditRule.pre_val[index]" @keydown="checkKeyDown($event, val.inputReg, curEditRule.pre_val[index]);return false;" />
                    <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <select :value="val.value" v-model="curEditRule.pre_val[index]">
                    <option v-if="val.required" disabled="disabled" value="default" v-text="val.placeHolder"></option>
                    <option v-if="!val.required" value="default" v-text="val.placeHolder"></option>
                    <option v-for="(v, i) in stockPool" v-text="v.pool_name" :value="v.id"></option>
                  </select>
                </template>
                <template v-if="'select2' == val.type">
                  <select style="font-size: 12px;" :value="val.value" v-model="curEditRule.pre_val[index]">
                    <option v-for="option in val.options" v-text="option.label" :value="option.value"></option>
                  </select>
                </template>
              </label>
            </template>
            <!-- End：pre_val条件 -->

            <!-- Begin：limit_val条件 -->
            <template v-for="(val, index) in rule.limit_val">
              <label class="rules-label">
                <span v-text="val.name"></span>
                <template v-if="'input' == val.type">
                  <div class="rules_input" style="display: inline-block;">
                      <span v-text="val.operator"></span>
                      <input type="text" :placeholder="val.placeHolder" v-model="curEditRule.limit_val[index]" @keydown="checkKeyDown($event, val.inputReg, curEditRule.limit_val[index]);return false;" />
                      <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <select :value="val.value" v-model="curEditRule.limit_val[index]">
                      <option v-if="val.required" disabled="disabled" value="default" v-text="val.placeHolder"></option>
                      <option v-if="!val.required" value="default" v-text="val.placeHolder"></option>
                      <option v-for="(v, i) in stockPool" v-text="v.pool_name" :value="v.id"></option>
                  </select>
                </template>
              </label>
            </template>
            <!-- End：limit_val条件 -->

            <!-- Begin：limit_actionInfo条件 --> 
            <label v-if="rule.hideAction !== true" class="rules-label">{{rule.limit_actionInfo.name}}
              <select :value="rule.limit_actionInfo.value" v-model="curEditRule.limit_action">
                <option v-if="rule.limit_actionInfo.required" disabled="disabled" value="default" v-text="rule.limit_actionInfo.placeHolder"></option>
                <option v-if="!rule.limit_actionInfo.required" value="default" v-text="rule.limit_actionInfo.placeHolder"></option>
                <option v-for="(val, index) in rule.limit_action" v-text="val.name" :value="val.type"></option>
              </select>
            </label>
            <!-- End：limit_actionInfo条件 -->

            <div class="btnDiv" style="float: right;">
              <a class="ui-btn btn-save" v-on:click="saveEdit()">保存</a>
              <a class="ui-btn btn-cancel" v-on:click="cancelEdit()">取消</a>
            </div>
          <template>
        </td>
      </tr>
    </tbody>
    <tbody v-if="display_data && Object.keys(display_data).length == 0 && 0 == independent_selected.length">
      <tr>
        <td class="left30" colspan="99">请选择产品</td>
      </tr>
    </tbody>
    <tbody v-if="display_data && Object.keys(display_data).length == 0 && 0 != independent_selected.length">
      <tr>
        <td class="left30" colspan="99">暂未添加任何风控</td>
      </tr>
    </tbody>
  </table>
  `,
  data(){
    return Object.assign({
      selectAll: false,
      displayRules: displayRules,
      stockPool: common_stockPool,
      display_data: [],
      source_data: [],
      curEditRule: {
        product_id: '',
        rule_id: '',
        risk_type: '',
        pre_val: [],
        limit_val: [],
        limit_action: 0
      },
    }, riskDetailData)
    // return riskDetailData;
  },
  watch: {
    in_selected_risk: function(){
      this.source_data = this.in_selected_risk.map(e => {
        e.web_checked = false;
        e.risk_type_str = this.displayRiskType(e.risk_type);
        return e;
      });

      var arr = JSON.parse(JSON.stringify(this.source_data));
      this.display_data = VUECOMPONENT.sort(arr, this.order, this.order_by);
    },
    order: function(){
      var arr = JSON.parse(JSON.stringify(this.source_data));
      this.display_data = VUECOMPONENT.sort(arr, this.order, this.order_by);
    },
    order_by: function(){
      var arr = JSON.parse(JSON.stringify(this.source_data));
      this.display_data = VUECOMPONENT.sort(arr, this.order, this.order_by);
    },
  },
  computed: {
    // display_data(){
    //   return this.in_selected_risk.map(e => {
    //     e.web_checked = false;
    //     return e;
    //   });
    // },
    rulesNeedShow(){
      var rtn = [];
      // var tmpType = parseInt(this.curentRuleType);
      this.displayRules.forEach(function(e){
        rtn.push(e);
      });

      

      return rtn;
    },
  },
  methods: {
    checkKeyDown: function(e, reg, value){
      if (8 == e.keyCode) {
        return;
      }

      if (/\S/.test(e.key)) {
        if (reg.test(value + e.key)) {
          // value = value + e.key;
          return true;
        }
        e.preventDefault();
        return false;
      }
      e.preventDefault();
      return false;
    },
    chgSelectAll: function(){
      var _this = this;
      let arr = [];
      this.display_data.forEach(e => {
        e.web_checked = _this.selectAll;
        arr.push(e);
      });
      this.$emit('chg_select_rules', arr);
    },
    chgSelectedRules: function(){
      let arr = [];
      this.display_data.forEach(e => {
        if (e.web_checked) {
          arr.push(e);
        }
      });
      // console.log(arr);

      if (this.display_data.length > 0 && this.display_data.every(e => {
        return e.web_checked == true;
      })) {
        this.selectAll = true;
      }else{
        this.selectAll = false;
      }
      this.$emit('chg_select_rules', arr)
    },
    displayRiskType(val){
      let rtn = '';
      displayRules.forEach(e => {
        if (e.type == val) {
          rtn = e.name;
        }
      });
      return rtn;
    },
    editRule(row, id, type){
      var _this = this;
      this.curEditRule.rule_id = id;
      this.curEditRule.risk_type = type;
      this.curEditRule.product_id = row.product_id;

      this.curEditRule.pre_val = row.pre_val;
      this.curEditRule.limit_val = row.limit_val;
      this.curEditRule.limit_action = row.limit_action;
    },
    deleteRule(id, type){
      // GetNameByRiskType(type)
      var thisRule;
      this.in_selected_risk.forEach(e => {
        if (e.rule_id == id) {
          thisRule = e;
        }
      });

      var that = this;
      // GetNameByRiskType(type)
      let html = `
        <table>
          <thead>
            <tr>
              <td style="padding-left: 50px; width: 110px;">产品</td>
              <td style="padding-left: 20px; width: 110px;">风控类别</td>
              <td>风控规则</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding-left: 50px; width: 110px;">`+ thisRule.product_name +`</td>
              <td style="padding-left: 20px; width: 110px;">`+ GetNameByRiskType(thisRule.risk_type) +`</td>
              <td>`+ GetPreVal(type, thisRule.pre_val) + GetLimitVal(type, thisRule.limit_val) + GetLimitAction(type, thisRule.limit_action) +`</td>
            </tr>
          </tbody>
        </table>
      `;

      $.confirm({
        title: '删除确认',
        content: html,
        closeIcon: true,
        confirmButton: '确认',
        cancelButton: false,
        confirm: function(){
          $.startLoading('正在删除...');
          $.ajax({
            url: '/rms-pub/rule/delete',
            type: 'post',
            data: {
              id: id
            },
            success: function({code, msg, data}){
              $.clearLoading();
              riskVue.getList();
              riskVue.getListCo();
              $.omsAlert('删除成功');
            },
            error: function(){
              $.clearLoading();
            }
          })
        }
      });
    },
    resetEditRule: function(){
      this.curEditRule={
        product_id: '',
        rule_id: '',
        risk_type: '',
        pre_val: [],
        limit_val: [],
        limit_action: 0
      };
    },
    cancelEdit: function(){
      this.resetEditRule();
    },
    saveEdit: function(){
      var tmpEditRule = this.curEditRule;

      var pre_val_arr = tmpEditRule.pre_val.filter(function(e){
        return e != undefined;
      });
      var pre_val = pre_val_arr.join(',');
      var limit_val_arr = tmpEditRule.limit_val.filter(function(e){
        return e != undefined;
      });
      var limit_val = limit_val_arr.join(',');
      var status = true;
      if (pre_val_arr.length < tmpEditRule.pre_val.length || limit_val_arr.length < tmpEditRule.limit_val.length) {
        status = false;
      }

      pre_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,4})?$/.test(e) || '' == e) {
          status = false;
        }
      });
      limit_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,4})?$/.test(e) || '' == e) {
          status = false;
        }
      })
      if (false == status) {
        $.omsAlert('请输入正确的数字');
        return;
      }

      // console.log(this.curEditRule);

      var _this = this;
      $.startLoading('正在修改...');
      $.ajax({
        url: '/rms-pub/rule/modify',
        type: 'post',
        data: {
          id: tmpEditRule.rule_id,
          product_id: tmpEditRule.product_id,
          risk_type: tmpEditRule.risk_type,
          pre_val: tmpEditRule.pre_val.join(','),
          limit_val: tmpEditRule.limit_val.join(',') || '-1',
          limit_action: tmpEditRule.limit_action
        },
        success: function({code, msg, data}){
          $.clearLoading();
          if (0 == code) {
            riskVue.getList();
            $.omsAlert('修改成功');
            _this.resetEditRule();
          }else{
            $.omsAlert('修改失败，请重试。');
          }
        },
        error: function(){
          $.clearLoading();
        }
      })
    },
  }
})

Vue.component('vue-risk-description', {
  props: ['cur_display_rule'],
  template: `
    <div>
      <template v-if="1 == cur_display_rule.type">
        <p>禁买股票池风控：设置该策略不能买入某一股票池中的股票。</p>
        <p>---即不得买入<span style="color: #2196F3">选定股票池</span>中的股票，若购买则触发<span style="color: #F44336">预警操作</span>。（股票池需自行创建）</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>设定：证券属于黑名单股票池，禁止买入</p>
        <p>场景1：</p>
        <p>当提交指令或委托买入黑名单股票池中的股票时，<span style="color: #F44336">提示触警，执行不成功</span>。</p>
      </template>
      <template v-if="2 == cur_display_rule.type">
        <p>净值仓位风控即是：根据单位净值，控制策略整体仓位上限。</p>
        <p>---即当单位净值小于<span style="color: #2196F3">设定值</span>时，策略整体仓位需小于等于<span style="color: #2196F3">设定值（百分比）</span>，否则触发<span style="color: #F44336">预警操作</span>。</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>设定：单位净值小于1.1，最大仓位限制70%</p>
        <p>单位净值小于0.9，最大仓位限制50%</p>
        <p>场景1：</p>
        <p>目前单位净值1.1，仓位70%。则在不卖出任何股票的情况下，本策略不能再继续购买任何有价证券。<span style="color: #F44336">若希望买入某有价证券，则应该先卖出部分持仓，方可买入</span>。</p>
        <p>场景2：</p>
        <p>当单位净值从1.1下跌至0.9后（当前仓位60%）。策略标记触警，并且策略<span style="color: #F44336">不能买入有价证券，只能卖出有价证券，直至仓位≤50%为止。此场景风控员可对策略进行卖出调仓。</span></p>
        <p>场景3：</p>
        <p>当单位净值从0.85上涨至1.1后（当前仓位50%），系统将自动放宽仓位限制至70%，<span style="color: #F44336">策略可加仓买入有价证券</span>。</p>
      </template>
      <template v-if="3 == cur_display_rule.type">
        <p>个股仓位风控：根据股票，控制该股仓位上限</p>
        <p>---即<span style="color: #2196F3">选定股票池</span>（不选则代表不限证券）中的股票，个股仓位需小于等于<span>设定值</span>，否则触发<span style="color: #F44336">预警操作</span>。</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定： 证券属于创业板，个股仓位≥40%，禁止买入</p>
        <p>个股仓位≥60%，禁止买入</p>
        <p>场景1：</p>
        <p>当买入某股所占仓位大于60%（包含已持部分），则提交指令或委托时，<span style="color: #F44336">提示触警，执行不成功</span>。</p>
        <p>场景2：</p>
        <p>当买入某创业板股票所占仓位大于40%（包含已持部分），则提交指令或委托时，<span style="color: #F44336">提示触警，执行不成功</span>。</p>
      </template>
      <template v-if="4 == cur_display_rule.type">
        <p>举牌风控：设置个股在单个产品中持仓数量/总股本上限</p>
        <p>---即个股持仓数量/总股本需小于<span style="color: #2196F3">设定值</span>，否则触发<span style="color: #F44336">预警操作</span>。</p>
         <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定：个股持仓数量/总股本≥3%，给予预警提示</p>
        <p>个股持股数量/总股本禁止≥5%；</p>
        <p>场景1：</p>
        <p>当买入某股将导致该产品该股持仓数量/该股总股本≥3%，则提交指令或委托时，<span style="color: #F44336">提示触警，但仍可强制执行</span>。</p>
        <p>场景2：</p>
        <p>当买入某股将导致该产品该股持仓数量/该股总股本≥5%，则提交指令或委托时，<span style="color: #F44336">提示触警，委托提交失败</span>。</p>
      </template>
      <template v-if="5 == cur_display_rule.type">
        <p>对敲风控：设置单个产品中当有未成交挂单时，不允许该产品提交同一股票的反向委托</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定：提交委托禁止与未成交委托反向</p>
        <p>场景1：</p>
        <p>若该产品挂单中一笔卖出000727，则此时提交委托买入000727会导致触发风控规则，<span style="color: #F44336">不得提交委托</span>。</p>
      </template>
      <template v-if="6 == cur_display_rule.type">
        <p>个股仓位风控：根据股票，控制该股占公司全产品资产权重上限</p>
        <p>---即<span style="color: #2196F3">选定股票池</span>（不选则代表不限证券）中的股票，全公司持有某个股市值占公司全产品资产权重需小于<span>设定值</span>，否则触发<span style="color: #F44336">预警操作</span>。</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定： 证券属于创业板，个股仓位≥40%，禁止买入</p>
        <p>个股仓位≥60%，禁止买入</p>
        <p>场景1：</p>
        <p>当买入某股将导致该股在全公司产品的持仓总市值占公司全产品的总资产权重大于等于60%，则提交指令或委托时，<span style="color: #F44336">提示触警，不得提交委托</span>。</p>
        <p>场景2：</p>
        <p>当买入某股将导致该股在全公司产品的持仓总市值占公司全产品的总资产权重大于等于40%，则提交指令或委托时，<span style="color: #F44336">提示触警，但仍可强制执行</span>。</p>
      </template>
      <template v-if="7 == cur_display_rule.type">
        <p>举牌风控：设置个股在公司持仓总数量/总股本上限</p>
        <p>---即个股在公司持仓总数量/总股本需小于<span style="color: #2196F3">设定值</span>，否则触发<span style="color: #F44336">预警操作</span>。</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定： 个股持仓数量/总股本≥3%，给予预警提示</p>
        <p>个股持股数量/总股本禁止≥5%；</p>
        <p>场景1：</p>
        <p>当买入某股将导致全公司该股持仓总数量/该股总股本≥3%，则提交指令或委托时，<span style="color: #F44336">提示触警，但仍可强制执行</span>。</p>
        <p>场景2：</p>
        <p>当买入某股将导致全公司该股持仓总数量/该股总股本≥5%，则提交指令或委托时，<span style="color: #F44336">提示触警，委托提交失败</span>。</p>
      </template>
      <template v-if="8 == cur_display_rule.type">
        <p>对敲风控：设置全公司当有未成交挂单时，不允许任何产品提交同一股票的反向委托</p>
        <p style="display: inline-block;"></p>
        <p>场景举例：</p>
        <p>若设定： 提交委托禁止与未成交委托反向</p>
        <p>场景1：</p>
        <p>若公司挂单中有一笔卖出000727，则此时任何产品提交委托买入000727都会导致<span style="color: #F44336">触发风控规则，不得提交委托</span>。</p>
      </template>
    </div>
  `,

})

// 新增风控
Vue.component('vue-single-addrisk',{
  props:['independent_selected', 'display_rules_arr', 'products', 'in_selected_risk'],//productId list
  template:`
    <div class="risk_rules" id="risk_rules">
      <div class="junior_rules">
        <ul>
          <template v-for="display_type in display_rules_arr">
            <li v-if="display_type == display.type" v-for="(display, i) in displayRules" v-on:mouseup="setSelected(display.type)">
               <label :class="[{selected: checkSelected(display.type)}]">
                   <span class="rules_name">{{display.name}}</span>
                   <input class="rules_selected" name="rules_selected" type="radio" />
                   <span class="rules_status">已设置：{{ getDisplayRulesNum(display.type) }}条</span>
               </label>
            </li>
          </template>
        </ul>
        <template v-if="0 >= selected">
          <p class="empty-text">
             请先选择风控类别
          </p>
        </template>
        <template v-else>
          <div class="rules_describe">
            <div class="rules_describe_title" :class="[{displayed: showDescription}]">
              <span class="rules_describe_span">风控规则说明</span>
              <span class="rules_describe_display" v-on:click="changeDescription">{{showDescription?'收起':'展开'}}<i></i></span>
            </div>

            <vue-risk-description :cur_display_rule="curDisplayRule" class="rules_describe_content" :class="[{displayed: showDescription}]"></vue-risk-description>
          </div>
           
          <div class="rules_add" style="display: block;">
            <!-- 新增规则选择 -->
            <template v-for="(val, index) in curDisplayRule.pre_val">
              <label>{{val.name}}
                <template v-if="'input' == val.type">
                  <div class="rules_input">
                    <span v-text="val.operator"></span>
                    <input :placeholder="val.placeHolder" type="text" :value="val.value" v-model="addRule_preVal[index]" @keydown="checkKeyDown($event, val.inputReg, addRule_preVal[index]);return false;" />
                    <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <div class="rules_select">
                    <selectize-stock-pool :options="stockPool" v-model="addRule_preVal[index]" v-on:show_stock_pool="showStockPool" >
                    </selectize-stock-pool>
                  </div>
                </template>
                <template v-if="'select2' == val.type">
                  <select style="font-size: 12px;" :value="val.value" v-model="addRule_preVal[index]">
                    <option v-for="option in val.options" v-text="option.label" :value="option.value"></option>
                  </select>
                </template>
              </label>
            </template>
            <template v-for="(val, index) in curDisplayRule.limit_val">
              <label>{{val.name}}
                <template v-if="'input' == val.type">
                  <div class="rules_input">
                    <span v-text="val.operator"></span>
                    <input type="text" :placeholder="val.placeHolder" :value="val.value" v-model="addRule_limitVal[index]" @keydown="checkKeyDown($event, val.inputReg, addRule_limitVal[index]);return false;" />
                    <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <select :value="val.value" v-model="addRule_limitVal[index]">
                    <option v-if="val.required" disabled="disabled" value="default" v-text="val.placeHolder"></option>
                    <option v-if="!val.required" value="default" v-text="val.placeHolder"></option>
                    <option v-for="(v, i) in stockPool" v-text="v.pool_name" :value="v.id"></option>
                  </select>
                </template>
              </label>
            </template>
            <label v-if="curDisplayRule.hideAction !== true">{{curDisplayRule.limit_actionInfo.name}}
              <select :value="addRule_actionValue" v-model="addRule_actionValue">
                <option v-if="curDisplayRule.limit_actionInfo.required" disabled="disabled" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
                <option v-if="!curDisplayRule.limit_actionInfo.required" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
                <option v-for="(val, index) in curDisplayRule.limit_action" v-text="val.name" :value="val.type"></option>
               </select>
             </label>
          </div>

          <h3 class="vue-common-title" style="margin-left: 30px; margin-top: 30px;">新增风控预览</h3>
          <div class="rules_added" style="min-height: initial;padding: 0;">
            <table class="newweb-common-grid">
              <thead>
                <tr>
                  <th class="left20 width250">产品</th>
                  <th class="left20 width250">风控类别</th>
                  <th class="left20">风控规则</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in independent_selected">
                  <td class="left20 width250" style="text-overflow: ellipsis;max-width: 200px;overflow: hidden;white-space: nowrap;">{{showProductName(product)}}</td>
                  <td class="left20 width250">{{showRuleType(curDisplayRule.type)}}</td>
                  <td class="left20">
                    <div class="risk_details_text">
                      <template v-if="undefined !== addRule_preVal[index]" v-for="(val, index) in curDisplayRule.pre_val">
                        <span v-if="curDisplayRule.hideAction !== true" v-text="val.name"></span>
                        <template v-if="'input' == val.type">
                          <span style="color: #2196F3;" v-text="val.operator + ' ' + addRule_preVal[index] + val.unit"></span>
                          <span>，</span>
                        </template>
                        <template v-if="'select' == val.type">
                          <span style="color: #2196F3;" v-text="getStockPoolByCode(addRule_preVal[index])"></span>
                          <span v-if="curDisplayRule.hideAction !== true">，</span>
                        </template>
                        <template v-if="'select2' == val.type">
                          <span style="color: #2196F3;" v-text="getRulesDisplayByValue(val, addRule_preVal[index])"></span>
                          <span v-if="curDisplayRule.hideAction !== true">，</span>
                        </template>
                      </template>
                      <template v-if="undefined !== addRule_limitVal[index]" v-for="(val, index) in curDisplayRule.limit_val">
                        <span v-text="val.name"></span>
                        <template v-if="'input' == val.type">
                            <span style="color: #2196F3;" v-text="val.operator + ' ' + addRule_limitVal[index] + val.unit"></span>
                            <span>，</span>
                        </template>
                        <template v-if="'select' == val.type">
                          <span style="color: #2196F3;" v-text="rule.limit_val[addRule_limitVal[index]]"></span>
                          <span>，</span>
                        </template>
                      </template>
                      <template v-if="'' !== addRule_actionValue">
                        <template v-if="curDisplayRule.hideAction !== true">
                          <span>提交指令及委托时</span>
                          <span>，</span>
                        </template>
                        <template v-for="(val, index) in curDisplayRule.limit_action">
                          <span v-if="val.type == addRule_actionValue" v-text="val.name" style="color:#F44336;margin-right: 20px;"></span>
                        </template>
                      </template>
                      <span style="color:#a29e9e;">（新增规则预览）</span>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            <table>
          </div>
          <div class="rules_btns" style="text-align:right">
            <a v-bind:class="{'disabled': checkSubmitDisabled()}" class="ui-btn add" v-on:click="rule_add" style="margin-right:45px">确认添加</a>
          </div>
        </template>
      </div>
    </div>
  `,
  data(){
    return {
      isNormal: true,
      selected: 0,
      showDescription: true,

      selected: 0,
      value: 0,
      options: [
        { id: 1, text: 'Hello' },
        { id: 2, text: 'World' }
      ],
      // 股票池
      stockPool: common_stockPool,
      addRule_preVal: new Array(10),
      addRule_limitVal: new Array(10),
      addRule_actionValue: 1,
      //显示规则，不同的风控规则显示不同的内容
      displayRules: displayRules,
      curDisplayRule: {},
      //实际规则，包含很多种类型
      rules: [],
      // 当前选中类型下的规则，由rules和selected得到，只是为了减少计算量
      curRules: [],
    }
  },
  created(){
    // $(document).on('keydown', '.rules_input>input', function (e) {
    //   if (8 == e.keyCode) {
    //     return;
    //   }
    //   if (/\S/.test(e.key)) {
    //     if (/^\d+\.?\d{0,3}$/.test($(this).val() + e.key)) {
    //       return true;
    //     }
    //     return false;
    //   }
    //   return false;
    // });
  },
  methods: {
    checkKeyDown: function(e, reg, value){
      if (8 == e.keyCode) {
        return;
      }

      if (/\S/.test(e.key)) {
        if (reg.test(value + e.key)) {
          // value = value + e.key;
          return true;
        }
        e.preventDefault();
        return false;
      }
      e.preventDefault();
      return false;
    },
    checkSubmitDisabled: function(){
      let that = this;
      var pre_val_arr = this.addRule_preVal.filter(function(e){
        return e != undefined;
      });
      var pre_val = pre_val_arr.join(',');
      var limit_val_arr = this.addRule_limitVal.filter(function(e){
        return e != undefined;
      });
      var limit_val = limit_val_arr.join(',');
      var status = true;
      if (pre_val_arr.length < this.curDisplayRule.pre_val.length || limit_val_arr.length < this.curDisplayRule.limit_val.length) {
        status = false;
      }
      pre_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      });
      limit_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      })
      return !status;
    },
    showRuleType: function(type){
      let str = '';
      this.displayRules.forEach(function(e){
        if (e.type == type) {
          str = e.name;
        }
      });
      return str;
    },
    showProductName: function(id){
      let name = '';
      this.products.forEach(function(e){
        if (e.value == id) {
          name = e.label;
        }
      });
      return name;
    },
    getOptions: function(v){
      var rtn = [];
      v.forEach(function(e){
        rtn.push({
          id: e.type,
          text: e.name
        });
      });
      return rtn;
    },
    getStockOptions: function(v){
      var rtn = [];
      v.forEach(function(e){
        rtn.push({
          id: e.id,
          text: e.pool_name
        });
      });
      return rtn;
    },
    getDisplayRulesData: function(){
      return this.curDisplayRule;
      // var rtn = {};
      // var selected = this.selected;
      // this.displayRules.forEach(function(e){
      //   if (selected == e.type) {
      //     rtn = e;
      //   }
      // });
      // return rtn;
    },
    showStockPool: function(){
      allStockIdArr = [];
      var html = `
      <div class="custom-stock-pool">
        <div class="custom-stock-pool-add">
          <div class="stock-input">
            <input class="custom-stock-pool-input" placeHolder="请输入证券代码或名称" />
            <ul class="custom-stock-suggest">
            </ul>
            <span class="custom-stock-suggested"></span>
          </div>
          <span class="custom-stock-add" style="display:none;">添加</span>
        </div>
        <div class="custom-stock-pool-display">
          <ul style="height: 170px; display: block; overflow-y: scroll; overflow-x: hidden;">
            
          </ul>
          <div class="stock-empty">
            <a><i></i>清空选择</a>
          </div>
        </div>
        <div class="custom-stock-pool-info">
          <input class="custom-stock-pool-name" maxlength="20" placeholder="请输入新建股票池名称(不得超过20个字)" />
          <span class="error-tip hidden"></span>
        </div>
        <div class="custom-stock-pool-btn">
          <a class="ui-btn btn-save">确定</a>
        </div>
      </div>
      `;
      jc = $.confirm({
        title: '自定义股票池',
        boxWidth: '680px',
        content: html,
        closeIcon: true,
        columnClass: 'custom-stockpool-width',
        confirmButton: false,
        cancelButton: false
      });
    },
    setTypeJunior: function(){
      this.isNormal = true;
    },
    setTypeSenior: function(){
      this.isNormal = false;
    },
    getStockPoolByCode: function(i){
      var rtn = '';
      this.stockPool.forEach(function(e){
        if (parseInt(e.id) == parseInt(i)) {
          rtn = e.pool_name;
        }
      });
      return rtn;
    },
    getRulesDisplayByValue: function(pre_rule, value){
      var rtn = '';
      pre_rule.options.forEach(e => {
        if (e.value == value) {
          rtn = e.label;
        }
      })
      return rtn;
    },
    getStockPool: function(){
      getStockPool();
    },
    doCustom: function(){
      // 无用
      console.log(111111);
    },
    checkSelected: function(i){
      return this.selected == i;
    },
    chgCurDisplayRuleByNum: function(i){
      // 修改当前显示规则模版
      var rtn = {};
      var selected = i;
      this.displayRules.forEach(function(e){
        if (selected == e.type) {
          rtn = e;
        }
      });
      this.curDisplayRule = rtn;

      // 修改下发值记录默认值
      this.addRule_preVal = new Array(10);
      this.addRule_limitVal = new Array(10);
      this.addRule_actionValue = 1;

      let _this = this;
      this.curDisplayRule.pre_val.forEach(function(e, index){
        // _this.addRule_preVal[index] = e.value;
        _this.addRule_preVal.splice(index, 1, e.value);
      });

      this.curDisplayRule.limit_val.forEach(function(e, index){
        // _this.addRule_limitVal[index] = e.value;
        _this.addRule_limitVal.splice(index, 1, e.value);
      });
    },
    setSelected: function(i){
      this.selected = i;
      if ('true' == localStorage.getItem('user_id_' + window.LOGIN_INFO.user_id + '.rules_displayed_' + i)) {
        this.showDescription = false;
      } else {
        localStorage.setItem('user_id_' + window.LOGIN_INFO.user_id + '.rules_displayed_' + i, 'true');
        this.showDescription = true;
      }
      this.chgCurDisplayRuleByNum(i);
      this.chgCurRulesByNum(i);
      this.$forceUpdate();
    },
    getDisplayRulesNum: function(type){
      var rtn = 0;
      this.in_selected_risk.forEach(function(e){
        if (type == e.risk_type) {
          rtn++;
        }
      });
      return rtn;
    },
    changeDescription: function(){
      this.showDescription = !this.showDescription;
      return this.showDescription;
    },
    chgCurRulesByNum: function(i){
      let that = this;
      var tmpArr = [];
      Object.keys(that.rules).forEach(function(e){
        Object.values(that.rules[e]).forEach(function(el){
          if (el.risk_type == i) {
            tmpArr.push(el);
          }
        })
      });
      this.curRules = tmpArr;
    },
    rule_add: function(){
      let that = this;
      if (this.checkSubmitDisabled()) {
        return false;
      }
      var pre_val_arr = this.addRule_preVal.filter(function(e){
        return e != undefined;
      });
      var pre_val = pre_val_arr.join(',');
      var limit_val_arr = this.addRule_limitVal.filter(function(e){
        return e != undefined;
      });
      var limit_val = limit_val_arr.join(',');
      var status = true;
      if (pre_val_arr.length < this.curDisplayRule.pre_val.length || limit_val_arr.length < this.curDisplayRule.limit_val.length) {
        status = false;
      }
      pre_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      });
      limit_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      })
      // // 针对禁买股票池的特殊处理
      // if (1 == this.curDisplayRule.type && false == status) {
      //   $.omsAlert('请选择股票池');
      //   return;
      // }
      // if (false == status) {
      //   $.omsAlert('请输入正确的数字');
      //   return;
      // }
      $.startLoading();
      $.ajax({
        url: '/rms-pub/rule/add',
        type: 'post',
        data: {
          product_id: this.independent_selected.join(','),
          risk_type: this.curDisplayRule.type,
          pre_val: pre_val,
          limit_val: limit_val || '-1',
          limit_action: this.addRule_actionValue
        },
        success: function({code, msg, data}){
          $.clearLoading()
          if (0 == code) {
            riskVue.getList();

            // $('.junior_rules label.selected').click();
            $.omsAlert('添加成功');
            // productRules.setSelected(productRules.selected);
          }else{
            $.omsAlert(msg);
          }
        },
        error: function(){
          $.clearLoading()
          $.omsAlert('网络异常')
        }
      })
    }
  },

});

Vue.component('vue-combined-addrisk',{
  props:['independent_selected', 'display_rules_arr', 'products', 'in_selected_risk'],//productId list
  template:`
    <div class="risk_rules" id="risk_rules">
      <div class="junior_rules">
        <ul>
          <template v-for="display_type in display_rules_arr">
            <li v-if="display_type == display.type" v-for="(display, i) in displayRules" v-on:mouseup="setSelected(display.type)">
               <label :class="[{selected: checkSelected(display.type)}]">
                   <span class="rules_name">{{display.name}}</span>
                   <input class="rules_selected" name="rules_selected" type="radio" />
                   <span class="rules_status">已设置：{{ getDisplayRulesNum(display.type) }}条</span>
               </label>
            </li>
          </template>
        </ul>
        <template v-if="0 >= selected">
          <p class="empty-text">
             请先选择风控类别
          </p>
        </template>
        <template v-else>
          <div class="rules_describe">
            <div class="rules_describe_title" :class="[{displayed: showDescription}]">
              <span class="rules_describe_span">风控规则说明</span>
              <span class="rules_describe_display" v-on:click="changeDescription">{{showDescription?'收起':'展开'}}<i></i></span>
            </div>

            <vue-risk-description :cur_display_rule="curDisplayRule" class="rules_describe_content" :class="[{displayed: showDescription}]"></vue-risk-description>
          </div>
           
          <div class="rules_add" style="display: block;">
            <!-- 新增规则选择 -->
            <template v-for="(val, index) in curDisplayRule.pre_val">
              <label>{{val.name}}
                <template v-if="'input' == val.type">
                  <div class="rules_input">
                    <span v-text="val.operator"></span>
                    <input :placeholder="val.placeHolder" type="text" :value="val.value" v-model="addRule_preVal[index]" @keydown="checkKeyDown($event, val.inputReg, addRule_preVal[index]);return false;" />
                    <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <div class="rules_select">
                    <selectize-stock-pool :options="stockPool" v-model="addRule_preVal[index]" v-on:show_stock_pool="showStockPool" >
                    </selectize-stock-pool>
                  </div>
                </template>
                <template v-if="'select2' == val.type">
                  <select style="font-size: 12px;" :value="val.value" v-model="addRule_preVal[index]">
                    <option v-for="option in val.options" v-text="option.label" :value="option.value"></option>
                  </select>
                </template>
              </label>
            </template>
            <template v-for="(val, index) in curDisplayRule.limit_val">
              <label>{{val.name}}
                <template v-if="'input' == val.type">
                  <div class="rules_input">
                    <span v-text="val.operator"></span>
                    <input type="text" :placeholder="val.placeHolder" :value="val.value" v-model="addRule_limitVal[index]" @keydown="checkKeyDown($event, val.inputReg, addRule_limitVal[index]);return false;" />
                    <span class="rules_input_unit" v-text="val.unit"></span>
                  </div>
                </template>
                <template v-if="'select' == val.type">
                  <select :value="val.value" v-model="addRule_limitVal[index]">
                    <option v-if="val.required" disabled="disabled" value="default" v-text="val.placeHolder"></option>
                    <option v-if="!val.required" value="default" v-text="val.placeHolder"></option>
                    <option v-for="(v, i) in stockPool" v-text="v.pool_name" :value="v.id"></option>
                  </select>
                </template>
              </label>
            </template>
            <label v-if="curDisplayRule.hideAction !== true">{{curDisplayRule.limit_actionInfo.name}}
              <!-- <select2 :options="getOptions(curDisplayRule.limit_action)" v-model="addRule_actionValue">
                <option v-if="curDisplayRule.limit_actionInfo.required" disabled="disabled" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
                <option v-if="!curDisplayRule.limit_actionInfo.required" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
              </select2> -->
              <select :value="addRule_actionValue" v-model="addRule_actionValue">
                <option v-if="curDisplayRule.limit_actionInfo.required" disabled="disabled" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
                <option v-if="!curDisplayRule.limit_actionInfo.required" value="default" v-text="curDisplayRule.limit_actionInfo.placeHolder"></option>
                <!-- <template> -->
                <option v-for="(val, index) in curDisplayRule.limit_action" v-text="val.name" :value="val.type"></option>
                <!-- </template> -->
               </select>
             </label>
          </div>

          <h3 class="vue-common-title" style="margin-left: 30px; margin-top: 30px;">新增风控预览</h3>
          <div class="rules_added" style="min-height: initial;padding: 0;">
            <table class="newweb-common-grid">
              <thead>
                <tr>
                  <th class="left20 width250">产品</th>
                  <th class="left20 width250">风控类别</th>
                  <th class="left20">风控规则</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in independent_selected">
                  <td class="left20 width250" style="text-overflow: ellipsis;max-width: 200px;overflow: hidden;white-space: nowrap;">{{showProductName(product)}}</td>
                  <td class="left20 width250">{{showRuleType(curDisplayRule.type)}}</td>
                  <td class="left20">
                    <div class="risk_details_text">
                      <template v-if="undefined !== addRule_preVal[index]" v-for="(val, index) in curDisplayRule.pre_val">
                        <span v-if="curDisplayRule.hideAction !== true" v-text="val.name"></span>
                        <template v-if="'input' == val.type">
                          <span style="color: #2196F3;" v-text="val.operator + ' ' + addRule_preVal[index] + val.unit"></span>
                          <span>，</span>
                        </template>
                        <template v-if="'select' == val.type">
                          <span style="color: #2196F3;" v-text="getStockPoolByCode(addRule_preVal[index])"></span>
                          <span v-if="curDisplayRule.hideAction !== true">，</span>
                        </template>
                        <template v-if="'select2' == val.type">
                          <span style="color: #2196F3;" v-text="getRulesDisplayByValue(val, addRule_preVal[index])"></span>
                          <span v-if="curDisplayRule.hideAction !== true">，</span>
                        </template>
                      </template>
                      <template v-if="undefined !== addRule_limitVal[index]" v-for="(val, index) in curDisplayRule.limit_val">
                        <span v-text="val.name"></span>
                        <template v-if="'input' == val.type">
                            <span style="color: #2196F3;" v-text="val.operator + ' ' + addRule_limitVal[index] + val.unit"></span>
                            <span>，</span>
                        </template>
                        <template v-if="'select' == val.type">
                          <span style="color: #2196F3;" v-text="rule.limit_val[addRule_limitVal[index]]"></span>
                          <span>，</span>
                        </template>
                      </template>
                      <template v-if="'' !== addRule_actionValue">
                        <template v-if="curDisplayRule.hideAction !== true">
                          <span>提交指令及委托时</span>
                          <span>，</span>
                        </template>
                        <template v-for="(val, index) in curDisplayRule.limit_action">
                          <span v-if="val.type == addRule_actionValue" v-text="val.name" style="color:#F44336;margin-right: 20px;"></span>
                        </template>
                      </template>
                      <span style="color:#a29e9e;">（新增规则预览）</span>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            <table>
          </div>
          <div class="rules_btns" style="text-align:right">
            <a v-bind:class="{'disabled': checkSubmitDisabled()}" class="ui-btn add" v-on:click="rule_add" style="margin-right:45px">确认添加</a>
          </div>
        </template>
      </div>
    </div>
  `,
  data(){
    return {
      isNormal: true,
      selected: 0,
      showDescription: true,

      selected: 0,
      value: 0,
      options: [
        { id: 1, text: 'Hello' },
        { id: 2, text: 'World' }
      ],
      // 股票池
      stockPool: common_stockPool,
      addRule_preVal: new Array(10),
      addRule_limitVal: new Array(10),
      addRule_actionValue: 1,
      //显示规则，不同的风控规则显示不同的内容
      displayRules: displayRules,
      curDisplayRule: {},
      //实际规则，包含很多种类型
      rules: [],
      // 当前选中类型下的规则，由rules和selected得到，只是为了减少计算量
      curRules: []
    }
  },
  created(){
    // $(document).on('keydown', '.rules_input>input', function (e) {
    //   if (8 == e.keyCode) {
    //     return;
    //   }
    //   if (/\S/.test(e.key)) {
    //     if (/^\d+\.?\d{0,3}$/.test($(this).val() + e.key)) {
    //       return true;
    //     }
    //     return false;
    //   }
    //   return false;
    // });
  },
  methods: {
    checkKeyDown: function(e, reg, value){
      if (8 == e.keyCode) {
        return;
      }

      if (/\S/.test(e.key)) {
        if (reg.test(value + e.key)) {
          // value = value + e.key;
          return true;
        }
        e.preventDefault();
        return false;
      }
      e.preventDefault();
      return false;
    },
    checkSubmitDisabled: function(){
      let that = this;
      var pre_val_arr = this.addRule_preVal.filter(function(e){
        return e != undefined;
      });
      var pre_val = pre_val_arr.join(',');
      var limit_val_arr = this.addRule_limitVal.filter(function(e){
        return e != undefined;
      });
      var limit_val = limit_val_arr.join(',');
      var status = true;
      if (pre_val_arr.length < this.curDisplayRule.pre_val.length || limit_val_arr.length < this.curDisplayRule.limit_val.length) {
        status = false;
      }
      pre_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      });
      limit_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      })
      return !status;
    },
    showRuleType: function(type){
      let str = '';
      this.displayRules.forEach(function(e){
        if (e.type == type) {
          str = e.name;
        }
      });
      return str;
    },
    showProductName: function(id){
      let name = '';
      this.products.forEach(function(e){
        if (e.value == id) {
          name = e.label;
        }
      });

      if ('' == name && -1 == id) {
        name = '全部产品'
      }
      return name;
    },
    getOptions: function(v){
      var rtn = [];
      v.forEach(function(e){
        rtn.push({
          id: e.type,
          text: e.name
        });
      });
      return rtn;
    },
    getStockOptions: function(v){
      var rtn = [];
      v.forEach(function(e){
        rtn.push({
          id: e.id,
          text: e.pool_name
        });
      });
      return rtn;
    },
    getDisplayRulesData: function(){
      return this.curDisplayRule;
      // var rtn = {};
      // var selected = this.selected;
      // this.displayRules.forEach(function(e){
      //   if (selected == e.type) {
      //     rtn = e;
      //   }
      // });
      // return rtn;
    },
    showStockPool: function(){
      allStockIdArr = [];
      var html = `
      <div class="custom-stock-pool">
        <div class="custom-stock-pool-add">
          <div class="stock-input">
            <input class="custom-stock-pool-input" placeHolder="请输入证券代码或名称" />
            <ul class="custom-stock-suggest">
            </ul>
            <span class="custom-stock-suggested"></span>
          </div>
          <span class="custom-stock-add" style="display:none;">添加</span>
        </div>
        <div class="custom-stock-pool-display">
          <ul style="height: 170px; display: block; overflow-y: scroll; overflow-x: hidden;">
            
          </ul>
          <div class="stock-empty">
            <a><i></i>清空选择</a>
          </div>
        </div>
        <div class="custom-stock-pool-info">
          <input class="custom-stock-pool-name" maxlength="20" placeholder="请输入新建股票池名称(不得超过20个字)" />
          <span class="error-tip hidden"></span>
        </div>
        <div class="custom-stock-pool-btn">
          <a class="ui-btn btn-save">确定</a>
        </div>
      </div>
      `;
      jc = $.confirm({
        title: '自定义股票池',
        boxWidth: '680px',
        content: html,
        closeIcon: true,
        columnClass: 'custom-stockpool-width',
        confirmButton: false,
        cancelButton: false
      });
    },
    setTypeJunior: function(){
      this.isNormal = true;
    },
    setTypeSenior: function(){
      this.isNormal = false;
    },
    getStockPoolByCode: function(i){
      var rtn = '';
      this.stockPool.forEach(function(e){
        if (parseInt(e.id) == parseInt(i)) {
          rtn = e.pool_name;
        }
      });
      return rtn;
    },
    getRulesDisplayByValue: function(pre_rule, value){
      var rtn = '';
      pre_rule.options.forEach(e => {
        if (e.value == value) {
          rtn = e.label;
        }
      })
      return rtn;
    },
    getStockPool: function(){
      getStockPool();
    },
    doCustom: function(){
      // 无用
      console.log(111111);
    },
    checkSelected: function(i){
      return this.selected == i;
    },
    chgCurDisplayRuleByNum: function(i){
      // 修改当前显示规则模版
      var rtn = {};
      var selected = i;
      this.displayRules.forEach(function(e){
        if (selected == e.type) {
          rtn = e;
        }
      });
      this.curDisplayRule = rtn;

      // 修改下发值记录默认值
      this.addRule_preVal = new Array(10);
      this.addRule_limitVal = new Array(10);
      this.addRule_actionValue = 1;

      let _this = this;
      this.curDisplayRule.pre_val.forEach(function(e, index){
        // _this.addRule_preVal[index] = e.value;
        _this.addRule_preVal.splice(index, 1, e.value);
      });

      this.curDisplayRule.limit_val.forEach(function(e, index){
        // _this.addRule_limitVal[index] = e.value;
        _this.addRule_limitVal.splice(index, 1, e.value);
      });
    },
    setSelected: function(i){
      this.selected = i;
      if ('true' == localStorage.getItem('user_id_' + window.LOGIN_INFO.user_id + '.rules_displayed_' + i)) {
        this.showDescription = false;
      } else {
        localStorage.setItem('user_id_' + window.LOGIN_INFO.user_id + '.rules_displayed_' + i, 'true');
        this.showDescription = true;
      }
      this.chgCurDisplayRuleByNum(i);
      this.chgCurRulesByNum(i);
      this.$forceUpdate();
    },
    getDisplayRulesNum: function(type){
      var rtn = 0;
      this.in_selected_risk.forEach(function(e){
        if (type == e.risk_type) {
          rtn++;
        }
      });
      return rtn;
    },
    changeDescription: function(){
      this.showDescription = !this.showDescription;
      return this.showDescription;
    },
    chgCurRulesByNum: function(i){
      let that = this;
      var tmpArr = [];
      Object.keys(that.rules).forEach(function(e){
        Object.values(that.rules[e]).forEach(function(el){
          if (el.risk_type == i) {
            tmpArr.push(el);
          }
        })
      });
      this.curRules = tmpArr;
    },
    rule_add: function(){
      let that = this;
      if (this.checkSubmitDisabled()) {
        return false;
      }
      var pre_val_arr = this.addRule_preVal.filter(function(e){
        return e != undefined;
      });
      var pre_val = pre_val_arr.join(',');
      var limit_val_arr = this.addRule_limitVal.filter(function(e){
        return e != undefined;
      });
      var limit_val = limit_val_arr.join(',');
      var status = true;
      if (pre_val_arr.length < this.curDisplayRule.pre_val.length || limit_val_arr.length < this.curDisplayRule.limit_val.length) {
        status = false;
      }
      pre_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      });
      limit_val_arr.forEach(function(e){
        if (isNaN(Number(e)) || false == /^\-?\d+(\.\d{1,3})?$/.test(e) || '' == e) {
          status = false;
        }
      })
      // // 针对禁买股票池的特殊处理
      // if (1 == this.curDisplayRule.type && false == status) {
      //   $.omsAlert('请选择股票池');
      //   return;
      // }
      // if (false == status) {
      //   $.omsAlert('请输入正确的数字');
      //   return;
      // }
      $.startLoading()
      $.ajax({
        url: '/rms-pub/rule/add_co',
        type: 'post',
        data: {
          // product_id: this.productId,
          risk_type: this.curDisplayRule.type,
          pre_val: pre_val,
          limit_val: limit_val || '-1',
          limit_action: this.addRule_actionValue
        },
        success: function({code, msg, data}){
          $.clearLoading();
          if (0 == code) {
            riskVue.getListCo();

            // $('.junior_rules label.selected').click();
            $.omsAlert('添加成功');
            // productRules.setSelected(productRules.selected);
          }else{
            $.omsAlert(msg);
          }
        },
        error: function(){
          $.clearLoading();
          $.omsAlert('网络异常')
        }
      })
    }
  },

});



/**
 * 用到的老版本的函数
 */
function GetNameByRiskType(type){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == e.type) {
      rtn = e.name;
    }
  });
  return rtn;
};

function GetPreVal(type, pre_val){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == Number(e.type)) {
      e.pre_val.forEach(function(el, index){
        if ('select' == el.type) {
          rtn += el.name + '<span style="margin-left: 5px;margin-right: 5px;color:#2196F3;">' + GetPoolNameById(pre_val[index]) + '</span>，';
        }else if('input' == el.type){
          rtn += el.name + '<span style="margin-left: 5px;margin-right: 5px;color:#2196F3;">' + (el.operator||'') + pre_val[index] + (el.unit||'') + '</span>，';
        }
      });
    }
  });
  return rtn;
}

function GetLimitVal(type, limit_val){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == e.type) {
      e.limit_val.forEach(function(el, index){
        rtn += el.name + '<span style="margin-left: 5px;margin-right: 5px;color:#2196F3;">' + (el.operator||'') + limit_val[index] + (el.unit||'') + '</span>，';
      });
    }
  });
  return rtn;
}


function GetLimitAction(type, limit_action){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == e.type) {
      e.limit_action.forEach(function(el){
        if (el.type == limit_action) {
          rtn += '<span style="color:#F44048">' + el.name + '</span>';
        }
      })
    }
  });
  return rtn;
}


function GetPreValType(type, index){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == e.type) {
      rtn = e.pre_val[index].type;
    }
  });
  return rtn;
}



function GetLimitValType(type, index){
  type = Number(type);
  var rtn = '';
  displayRules.forEach(function(e){
    if (type == e.type) {
      if (e.limit_val[index] == undefined) {
        rtn = 'select';
      }else{
        rtn = e.limit_val[index].type;
      }
    }
  });
  return rtn;
}


function GetPoolNameById(id){
  var rtn = '';
  common_stockPool.forEach(function(e){
    if (Number(e.id) == Number(id)) {
      rtn = e.pool_name;
    }
  });

  return rtn;
}



/**
 * 老代码jq部分
 */
var validPreVal;
$(document).on('keydown', '.rules_input>input', function (e) {
  validPreVal = $(this).val();
}).on('keyup', '.rules_input>input', function (e) {
  validPreVal = undefined;
});

$(document).on('keyup', '.custom-stock-pool-input', function(e){
  $(this).attr('data-id', '').attr('data-name', '');
  searchStock($(this));
});
$(document).on('focus', '.custom-stock-pool-input', function(e){
  $('.custom-stock-suggested').hide();
  var stock_id = $(this).attr('data-id');
  stock_id && $(this).val(stock_id.match(/\d*/)[0]);

  searchStock($('.custom-stock-pool-input'));
}).on('blur', '.custom-stock-pool-input', function(e){
  // 焦点离开时，如果stock_id以及保存了，那么显示正确的stock_name
  // 所以，当stock_id不正确时，需要清空stock_id
  var stock_id = $(this).attr('data-id');
  var stock_name = $(this).attr('data-name');
  if ('' != stock_id) {
    $(this).val(stock_id);
    $('.custom-stock-suggested').html(stock_name).show();
  }
  
}).on('blur', '.stock-input', function(e){
  // blur与click事件顺序问题，已将click修改为mousedown
  $('.custom-stock-suggest').slideUp(200);
});
$(document).on('mousedown', '.custom-stock-suggest>li', function(){
  selectOneStock(this);

  var customInput = $('.custom-stock-pool-input')
  var stock_id = customInput.attr('data-id');
  var stock_name = customInput.attr('data-name');
  if ('' == stock_id || '' == stock_name) {
    return;
  }
  customInput.attr('data-id', '').attr('data-name', '').val('');
  $('.custom-stock-suggested').html('');
  if (allStockIdArr.some(function(e){
    return e == stock_id;
  })) {
    return;
  }
  allStockIdArr.push(stock_id);
  $('.custom-stock-pool-display>ul').append('<li><span class="stock-name" data-id="'+ stock_id +'">'+ stock_id.match(/\d*/)[0] + ' &nbsp; ' + stock_name +'</span><span class="btn-del">删除</span></li>');
});
$(document).on('click', '.btn-del', function(){
  var stock_id = $(this).parents('li').find('.stock-name').attr('data-id');
  allStockIdArr = allStockIdArr.filter(function(e){
    return e != stock_id;
  });
  $(this).parents('li').remove();
});
$(document).on('click', '.stock-empty>a', function(){
  allStockIdArr = [];
  $('.custom-stock-pool-display>ul').empty();
});

$(document).on('focus', '.custom-stock-pool-name', function(){
  $('.custom-stock-pool-info>.error-tip').html('').addClass('hidden');
});

$(document).on('click', '.btn-save', function(){
  var stock_id_arr = [];
  $('.custom-stock-pool-display>ul>li').each(function(index, e){
    stock_id_arr.push($(e).find('.stock-name').attr('data-id'));
  });
  if (0 == stock_id_arr.length) {
    $('.custom-stock-pool-info>.error-tip').html('请先添加证券').removeClass('hidden');
    return;
  }

  var pool_name = $('.custom-stock-pool-name').val();
  if ('' == pool_name) {
    $('.custom-stock-pool-info>.error-tip').html('请输入股票池名称').removeClass('hidden');
    return;
  }
  if (pool_name.length > 20) {
    $('.custom-stock-pool-info>.error-tip').html('股票池名称不得超过20个字').removeClass('hidden');
    return;
  }

  $.ajax({
    url: '/rms-pub/stock_pool/add',
    type: 'post',
    data: {
      stock_id: stock_id_arr.join(','),
      pool_name: pool_name
    },
    success: function({msg, code, data}){
      if (0 == code) {
        getStockPool();
        jc.close();
        $.omsAlert('自定义股票池成功');
      }else{
        $('.custom-stock-pool-info>.error-tip').html(msg).removeClass('hidden');
      }
    },
    error: function(){
      $.failNotice();
    }
  })
});

function searchStock(_this){
  var inputStockCode = $(_this).val();
  var last_suggest_timestamp = new Date().valueOf();
  $('.custom-stock-pool-input').attr('last_suggest_timestamp',last_suggest_timestamp);
  $('.stock-input').addClass('loading');
  var str = (window.REQUEST_PREFIX||'')+'/oms/helper/code_genius?stock_code='+inputStockCode;
  $.getJSON(str).done(function(res){
    if( last_suggest_timestamp!=$('.custom-stock-pool-input').attr('last_suggest_timestamp') ){return;}
    if(res.code==0 || res.code==1123124){
      var html = '';
      res.data.forEach(function(e){
        html += '<li data-id="' + e.stock_id +'" data-name="'+ e.stock_name +'">' + e.stock_id + ' &nbsp; ' + e.stock_name + '</li>';
      });
      $('.custom-stock-suggest').html(html).slideDown(300);

      // 当只有一个符合条件时，默认选中该项。
      if(1 == res.code.length){
        selectOneStock($('.custom-stock-suggest>li'));
      }
    }else{
        $.omsAlert('获取建议证券列表失败！',false,300);
    }
  }).always(function(){
    if( last_suggest_timestamp!=$('.custom-stock-pool-input').attr('last_suggest_timestamp') ){return;}
    $('.stock-input').removeClass('loading');
  });
}

function selectOneStock(_this){
  // 用户选择时，记录正确的stock_id和stock_name
  var stock_id = $(_this).attr('data-id');
  var stock_name = $(_this).attr('data-name');
  $('.custom-stock-pool-input').attr('data-id', stock_id).attr('data-name', stock_name).val(stock_id);
  $('.custom-stock-suggested').html(stock_name).show();
  $('.custom-stock-suggest').slideUp(200);
}


