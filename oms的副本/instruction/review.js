/**
 * Author: jiangjian; liuzeyafzy@gmail.com
 * 指令审核
 */

var tableData_wait = [{
  th: "stock.stock_code", //证劵代码
  show_type: 'checkbox',
  name: "证券代码",
  class_name: "stock.stock_code",
  float: 'right'
}, {
  th: "stock.stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'right'
}, {
  th: "stock.market_name",
  show_type: "text",
  name: "交易市场",
  class_name: "vue_text_default",
  float: 'right'
}, {
  th: "gathering.product_name_list",
  show_type: "text",
  name: "产品账户",
  class_name: "vue_number_default",
  float: 'right'
},{
  th: "gathering.unit_name_list",
  show_type: "text",
  name: "单元名称",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "instruction.invest_type",
  show_type: "text",
  name: "投资类型",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "gathering.deal_direction_name",
  show_type: "text",
  name: "买卖标记",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "gathering.price",
  show_type: "text",
  name: "价格",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "gathering.ins_amount",
  show_type: "text",
  name: "指令数量",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "gathering.ins_balance",
  show_type: "text",
  name: "金额",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "instruction.entrust_flag",
  show_type: "text",
  name: "标识",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.ins_id",
  show_type: "text",
  name: "原委托序号",
  class_name: "",
  float: 'left'
}, {
  th: "instruction.creator_name",
  show_type: "text",
  name: "创建人",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.created_at",
  show_type: "text",
  name: "创建时间",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.status_desc",
  show_type: "text",
  name: "审批状态",
  class_name: "vue_input_default",
  float: 'left'
}];

var tableData_result = [{
  th: "stock.stock_code", //证劵代码
  show_type: 'text',
  name: "证券代码",
  class_name: "stock.stock_code",
  float: 'right'
}, {
  th: "stock.stock_name",
  show_type: "text",
  name: "证券名称",
  class_name: "vue_text_default",
  float: 'right'
}, {
  th: "gathering.product_name_list",
  show_type: "text",
  name: "产品账户",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "gathering.unit_name_list",
  show_type: "text",
  name: "单元名称",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "instruction.invest_type",
  show_type: "text",
  name: "投资类型",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "gathering.deal_direction_name",
  show_type: "text",
  name: "买卖标记",
  class_name: "vue_number_default",
  float: 'right'
}, {
  th: "gathering.price",
  show_type: "text",
  name: "价格",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "gathering.ins_amount",
  show_type: "text",
  name: "指令数量",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "gathering.ins_balance",
  show_type: "text",
  name: "金额",
  class_name: "vue_number_default",
  float: 'left'
}, {
  th: "instruction.entrust_flag",
  show_type: "text",
  name: "标识",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.ins_id",
  show_type: "text",
  name: "原委托序号",
  class_name: "vue_input_default",
  float: 'left'
}, {
  th: "instruction.creator_name",
  show_type: "text",
  name: "创建人",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.created_at",
  show_type: "text",
  name: "创建时间",
  class_name: "vue_input_default",
  float: 'right'
}, {
  th: "instruction.review_username",
  show_type: "text",
  name: "审批人",
  class_name: "vue_input_default",
  float: 'left'
}, {
  th: "instruction.review_time",
  show_type: "text",
  name: "审批时间",
  class_name: "vue_input_default",
  float: 'left'
}, {
  th: "instruction.refuse_reason",
  show_type: "text",
  name: "拒绝原因",
  class_name: "vue_input_default",
  float: 'left'
}, {
  th: "instruction.status_desc",
  show_type: "text",
  name: "审批状态",
  class_name: "vue_input_default",
  float: 'left'
}];

var review_vm = new Vue({
  el:'[review_top]',
  data:{
    'table_data':tableData_wait,
    'status':"wait",
    'list_data':[],
    'timer':'',
    'checkarr':[],
    'checkAll':false,
    'newdata':'',
    'loading':false,
  },
  template:`
    <div style="background: white; padding: 0 0 20px;flex:1">
      <div class="review_top">
        <h2>指令审批</h2>
        <button class="pass" @click="btn_pass" v-show="status=='wait'">通过</button>
        <button class="refuse" @click="btn_refuse" v-show="status=='wait'">拒绝</button>
        <div class="btn-box">
          <label><input name="approval" type="radio" value="" checked @click="btn_click('wait')"/>待审批指令 </label> 
          <label><input name="approval" type="radio" value="" @click="btn_click('done')" />已审批指令 </label>
          <a v-if="status=='done'" style="height: 32px;display: inline-block;line-height: 32px;background-color: #e8e9ed;border-radius: 4px;" class="custom-grey-btn custom-grey-btn__export" :class="{'doBtnExport_bgd': true}"  v-on:click="doExport()">
            <i class="oms-icon oms-icon-export"></i>导出
          </a>
          <a refresh-btn="" @click="btn_refresh" v-bind:class="{'loading': loading}" class="refresh oms-btn gray refresh-btn loading-loading right" href="javascript:;"><i class="oms-icon refresh"></i>刷新</a>
        </div>
      </div>
      <div class="review_section" >
        <table class="newweb-common-grid">
          <tbody>
            <tr>
              <th  v-for="(item,index) in table_data" :style="{'text-align':item.float}"">
                  <input type="checkbox"  v-if="item.show_type=='checkbox'" @change="check_all" v-model=checkAll />
                  <span>{{item.name}}</span>
              </th>
            </tr>
            <tr v-for="(list_item,list_index) in list_data">
              <td  v-for="(head_item,head_index) in table_data" :style="{'text-align':head_item.float}">
                <input type="checkbox" v-if="head_item.show_type=='checkbox'" @change="check_one" v-model=checkarr[list_index] />
                <span  v-bind:style="get_secStyle_with_th(list_item,head_item.th)">{{ get_sec_with_th(list_item,head_item.th) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div> 
    </div>
  `,
  mounted(){
    let self = this;
    this.review_ajax();
    this.checkarr  = new Array(this.list_data.length);
    for(let i =0;i<this.checkarr.length;i++){
      this.checkarr[i]  = false;
    };

    setInterval(function(){
      self.review_ajax();
    }, 1000 * 3);
  },
  watch:{
    status(ele){
      if(ele == "done"){
        this.table_data = tableData_result;
      }
      if(ele == "wait"){
        this.table_data = tableData_wait;
      }
    },
    // list_data(){
    //   this.checkarr  = new Array(this.list_data.length);
    //   for(let i =0;i<this.checkarr.length;i++){
    //     this.checkarr[i]  = false;
    //   }
    // }
  },
  methods:{
    doExport: function(){
      window.location.href = window.REQUEST_PREFIX + '/sync/pb_ins/export_reviewed' +'?org_id='+window.LOGIN_INFO.org_id;

      // let _this = this;
      // $.ajax({
      //   url: window.REQUEST_PREFIX + '/sync/pb_ins/export_reviewed',
      //   data: {
      //     org_id: window.LOGIN_INFO.org_id
      //   },
      //   type: 'get',
      //   success: function({msg, code, data}){
      //     if (0 == code) {

      //     }else{
      //       $.omsAlert(msg);
      //     }
      //   },
      //   error: function(){
      //       $.omsAlert('网络异常');
      //   }
      // })
    },
    review_ajax(){
      var self = this;
      if(!this.loading){
        var url = (window.REQUEST_PREFIX||'')+'/sync/pb_ins/review_lists?status='+this.status;
        self.loading = true;
        $.get(url,"").done(function(res){
          if(res.code == 0){
            if(!self.isObjectValueEqual(self.list_data,res.data.list)){
              self.list_data = res.data.list;

              self.checkarr  = new Array(self.list_data.length);
              for(let i =0; i<self.checkarr.length;i++){
                self.checkarr[i]  = false;
              }
            }
          }else{
            $.omsAlert(res.msg);
          }
          self.loading = false;
        }).fail($.failNotice.bind(null,url)).always(function(){
          self.loading = false;
        });
      }
    },
    get_sec_with_th(list_item,th){
      let route =  th.split('.');
      let temp = list_item;
      route.forEach(function(ele){
        temp = temp[ele];
      })
      if(th=="instruction.review_status"){
        if(temp == 0){
          temp = "已撤销"
        }
        if(temp == 1){
          temp = "审批通过"
        }
        if(temp == 2){
          temp = "审批拒绝"
        }
        if(temp == 3){
          temp = "待审批"
        }
      }

      return temp;
    },
    get_secStyle_with_th(list_item,th){
      let route =  th.split('.');
      let temp = list_item;
      route.forEach(function(ele){
        temp = temp[ele];
      })

      if(th=="instruction.status_desc"){

        let result =  list_item['instruction'].review_status
        if(result == 0){
          temp = "color: black;"
        }
        if(result == 1){
          temp = "color: black;"
        }
        if(result == 2){
          temp = "color: #F44336;"
        }
        if(result == 3){
          temp = "color: #F44336;"
        }
      }

      return temp;
    },
    btn_click(status){
      this.status = status;
      this.list_data = [];
      this.checkarr  = new Array(this.list_data.length);
      for(let i =0; i<this.checkarr.length;i++){
        this.checkarr[i]  = false;
      }
      this.review_ajax();
    },
    btn_refresh(){
      this.review_ajax();
    },
    btn_pass(){
      let temp = [];
      var self = this;
      this.checkarr.forEach(function(ele,index){
        if(ele){
          temp.push(self.list_data[index].instruction.id)
        }
      });
      if (0 == temp.length) {
        $.omsAlert('请选择指令');
        return;
      }
      let result = temp.join(',');

      if(result){
        var self = this;
        var url = (window.REQUEST_PREFIX||'')+'/sync/pb_ins/review';
        self.loading = true;
        $.post(url,{
          id:result,
          review_status:1,
          refuse_reason:"",
          ins_amount:'',
        }).done(function(res){
          if(res.code == 0){
            $.omsAlert('指令审批成功');
          }else{
            $.omsAlert(res.msg);
          }
          self.loading = false;
          self.review_ajax();
        }).fail(()=>{
          $.failNotice.bind(null,url).always(function(){
            $.omsAlert('指令审批失败');
            self.loading = false
          })
        })
      }
    },
    btn_refuse(){
      let temp = [];
      var self = this;
      this.checkarr.forEach(function(ele,index){
        if(ele){
          temp.push(self.list_data[index].instruction.id)
        }
      });
      if (0 == temp.length) {
        $.omsAlert('请选择指令');
        return;
      }
      let result = temp.join(',');
      if(result){
        var self = this;
        // clearTimeout(this.timer)
        var url = (window.REQUEST_PREFIX||'')+'/sync/pb_ins/review';
        self.loading = true
        $.post(url,{id:result,review_status:2,refuse_reason:""}).done(function(res){
          if(res.code == 0){
            $.omsAlert('指令审批成功');
          }else{
            $.omsAlert(res.msg);
          }
          self.loading = false
          self.review_ajax();
        }).fail(()=>{
          $.failNotice.bind(null,url).always(function(){
            $.omsAlert('指令审批失败');
            self.loading = false
          })
        });
      }
    },
    check_all(event){
      //全选按钮
      this.checkarr  = new Array(this.list_data.length);
      for(let i =0;i<this.checkarr.length;i++){
        this.checkarr[i]  = event.target.checked;
      }
    },
    check_one(){
      //列表checkbox
      let bool = true;
      this.checkarr.forEach(function(ele){
        if( ele== false){
          bool = false
        }
      })
      if(bool){
        this.checkAll = true;
      }else{
        this.checkAll = false;
      }
    },
    isObjectValueEqual(a, b) {
      return JSON.stringify(b) ==  JSON.stringify(a)
    }
  }
})

