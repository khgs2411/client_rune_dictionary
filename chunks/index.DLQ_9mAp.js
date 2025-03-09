import{E as f,i as u,B as $,c as r,o as a,j as n,b as m,m as l,h as d}from"./index.Xj7nJ3XN.js";var V={name:"BaseEditableHolder",extends:f,emits:["update:modelValue","value-change"],props:{modelValue:{type:null,default:void 0},defaultValue:{type:null,default:void 0},name:{type:String,default:void 0},invalid:{type:Boolean,default:void 0},disabled:{type:Boolean,default:!1},formControl:{type:Object,default:void 0}},inject:{$parentInstance:{default:void 0},$pcForm:{default:void 0},$pcFormField:{default:void 0}},data:function(){return{d_value:this.defaultValue||this.modelValue}},watch:{modelValue:function(t){this.d_value=t},defaultValue:function(t){this.d_value=t},$formName:{immediate:!0,handler:function(t){var i,o;this.formField=((i=this.$pcForm)===null||i===void 0||(o=i.register)===null||o===void 0?void 0:o.call(i,t,this.$formControl))||{}}},$formControl:{immediate:!0,handler:function(t){var i,o;this.formField=((i=this.$pcForm)===null||i===void 0||(o=i.register)===null||o===void 0?void 0:o.call(i,this.$formName,t))||{}}},$formDefaultValue:{immediate:!0,handler:function(t){this.d_value!==t&&(this.d_value=t)}},$formValue:{immediate:!1,handler:function(t){var i;(i=this.$pcForm)!==null&&i!==void 0&&i.getFieldState(this.$formName)&&t!==this.d_value&&(this.d_value=t)}}},formField:{},methods:{writeValue:function(t,i){var o,s;this.controlled&&(this.d_value=t,this.$emit("update:modelValue",t)),this.$emit("value-change",t),(o=(s=this.formField).onChange)===null||o===void 0||o.call(s,{originalEvent:i,value:t})},findNonEmpty:function(){for(var t=arguments.length,i=new Array(t),o=0;o<t;o++)i[o]=arguments[o];return i.find(u)}},computed:{$filled:function(){return u(this.d_value)},$invalid:function(){var t,i;return!this.$formNovalidate&&this.findNonEmpty(this.invalid,(t=this.$pcFormField)===null||t===void 0||(t=t.$field)===null||t===void 0?void 0:t.invalid,(i=this.$pcForm)===null||i===void 0||(i=i.getFieldState(this.$formName))===null||i===void 0?void 0:i.invalid)},$formName:function(){var t;return this.$formNovalidate?void 0:this.name||((t=this.$formControl)===null||t===void 0?void 0:t.name)},$formControl:function(){var t;return this.formControl||((t=this.$pcFormField)===null||t===void 0?void 0:t.formControl)},$formNovalidate:function(){var t;return(t=this.$formControl)===null||t===void 0?void 0:t.novalidate},$formDefaultValue:function(){var t,i;return this.findNonEmpty(this.d_value,(t=this.$pcFormField)===null||t===void 0?void 0:t.initialValue,(i=this.$pcForm)===null||i===void 0||(i=i.initialValues)===null||i===void 0?void 0:i[this.$formName])},$formValue:function(){var t,i;return this.findNonEmpty((t=this.$pcFormField)===null||t===void 0||(t=t.$field)===null||t===void 0?void 0:t.value,(i=this.$pcForm)===null||i===void 0||(i=i.getFieldState(this.$formName))===null||i===void 0?void 0:i.value)},controlled:function(){return this.$inProps.hasOwnProperty("modelValue")||!this.$inProps.hasOwnProperty("modelValue")&&!this.$inProps.hasOwnProperty("defaultValue")},filled:function(){return this.$filled}}},c=({dt:e})=>`
.p-card {
    background: ${e("card.background")};
    color: ${e("card.color")};
    box-shadow: ${e("card.shadow")};
    border-radius: ${e("card.border.radius")};
    display: flex;
    flex-direction: column;
}

.p-card-caption {
    display: flex;
    flex-direction: column;
    gap: ${e("card.caption.gap")};
}

.p-card-body {
    padding: ${e("card.body.padding")};
    display: flex;
    flex-direction: column;
    gap: ${e("card.body.gap")};
}

.p-card-title {
    font-size: ${e("card.title.font.size")};
    font-weight: ${e("card.title.font.weight")};
}

.p-card-subtitle {
    color: ${e("card.subtitle.color")};
}
`,p={root:"p-card p-component",header:"p-card-header",body:"p-card-body",caption:"p-card-caption",title:"p-card-title",subtitle:"p-card-subtitle",content:"p-card-content",footer:"p-card-footer"},h=$.extend({name:"card",style:c,classes:p}),v={name:"BaseCard",extends:f,style:h,provide:function(){return{$pcCard:this,$parentInstance:this}}},F={name:"Card",extends:v,inheritAttrs:!1};function y(e,t,i,o,s,g){return a(),r("div",l({class:e.cx("root")},e.ptmi("root")),[e.$slots.header?(a(),r("div",l({key:0,class:e.cx("header")},e.ptm("header")),[d(e.$slots,"header")],16)):n("",!0),m("div",l({class:e.cx("body")},e.ptm("body")),[e.$slots.title||e.$slots.subtitle?(a(),r("div",l({key:0,class:e.cx("caption")},e.ptm("caption")),[e.$slots.title?(a(),r("div",l({key:0,class:e.cx("title")},e.ptm("title")),[d(e.$slots,"title")],16)):n("",!0),e.$slots.subtitle?(a(),r("div",l({key:1,class:e.cx("subtitle")},e.ptm("subtitle")),[d(e.$slots,"subtitle")],16)):n("",!0)],16)):n("",!0),m("div",l({class:e.cx("content")},e.ptm("content")),[d(e.$slots,"content")],16),e.$slots.footer?(a(),r("div",l({key:1,class:e.cx("footer")},e.ptm("footer")),[d(e.$slots,"footer")],16)):n("",!0)],16)],16)}F.render=y;export{F as a,V as s};
