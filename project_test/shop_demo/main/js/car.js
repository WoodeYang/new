
//要确保在初始化实际例子之前注册组建
//否则报错：did you register the component correctly? For recursive components, make sure to provide the "name" option.
Vue.component('todo-item', {
    props: ['todo'],
    template: '<div>{{todo.text}}</div>'
})
var ts_content = {
    template: '<div>test content01</div>',
    props: ['param1']
}
var vm = new Vue({
    components: {
        'ts-component': ts_content
    },
    el: "#app",
    data: {
        title: "hele",
        productList: [],
        totalMoney: 0,
        checkAllFlag: false,
        ts_item: [{text: '01'},{text: '02'},{text: '03'}]
    },
    filters: {
        formatMoney : function(value){
            return "￥" + value.toFixed(2);
        }
    },
    //页面加载触发
    mounted: function(){
        this.$nextTick(function () {
            this.cartview();
        })
    },
    //方法
    methods: {
        cartview: function(){
            var _this = this;
            this.$http.get("data/cartData.json").then(function(res){
                _this.productList = res.data.result.list;
                _this.totalMoney = res.data.result.totalMoney
            })
        },
        changeMoney: function(product, way){
            if(way > 0){
                product.productQuantity++
            }else{
                product.productQuantity--
                if( product.productQuantity < 1){
                     product.productQuantity = 0;
                }
            }
        },
        selectedProduct: function(item){
            if(typeof item.checked == 'undefined'){
                //全局注册
                // Vue.set(item, "checked", true);
                //局部注册
                this.$set(item, "checked", true)
            }else{
                item.checked = !item.checked;
            }
        },
        checkAll: function(flag){
            // this.checkAllFlag = !this.checkAllFlag;
            // var _this = this;
            // if( this.checkAllFlag){
            //     this.productList.forEach(function(item, index){
            //         if(typeof item.checked == 'undefined'){
            //             _this.$set(item, "checked", true);
            //         }else{
            //             item.checked = true;
            //         }
            //     })
            // }
            this.checkAllFlag = flag;
            var _this = this;
            this.productList.forEach(function(item, index){
                if(typeof item.checked == 'undefined'){
                    _this.$set(item, "checked", _this.checkAllFlag);
                }else{
                    item.checked =  _this.checkAllFlag;
                }
            })
        }
    }
})

Vue.filter("money", function(value,type){
    return "￥" + value.toFixed(2) + type;
})

