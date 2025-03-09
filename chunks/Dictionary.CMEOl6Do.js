import{B as S,R as B,i as k,r as L,w as O,c as g,o as u,b as d,h as $,n as z,j as A,m as b,t as f,k as y,l as h,p as E,F as w,q as V,v as x,x as K,y as p,d as F,z as P,A as v,e as q,f as m,_ as N}from"./index.CtyQxtuj.js";import{s as C,a as j}from"./index.Bk12LIm-.js";var G=({dt:t})=>`
.p-togglebutton {
    display: inline-flex;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    position: relative;
    color: ${t("togglebutton.color")};
    background: ${t("togglebutton.background")};
    border: 1px solid ${t("togglebutton.border.color")};
    padding: ${t("togglebutton.padding")};
    font-size: 1rem;
    font-family: inherit;
    font-feature-settings: inherit;
    transition: background ${t("togglebutton.transition.duration")}, color ${t("togglebutton.transition.duration")}, border-color ${t("togglebutton.transition.duration")},
        outline-color ${t("togglebutton.transition.duration")}, box-shadow ${t("togglebutton.transition.duration")};
    border-radius: ${t("togglebutton.border.radius")};
    outline-color: transparent;
    font-weight: ${t("togglebutton.font.weight")};
}

.p-togglebutton-content {
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: ${t("togglebutton.gap")};
    padding: ${t("togglebutton.content.padding")};
    background: transparent;
    border-radius: ${t("togglebutton.content.border.radius")};
    transition: background ${t("togglebutton.transition.duration")}, color ${t("togglebutton.transition.duration")}, border-color ${t("togglebutton.transition.duration")},
            outline-color ${t("togglebutton.transition.duration")}, box-shadow ${t("togglebutton.transition.duration")};
}

.p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
    background: ${t("togglebutton.hover.background")};
    color: ${t("togglebutton.hover.color")};
}

.p-togglebutton.p-togglebutton-checked {
    background: ${t("togglebutton.checked.background")};
    border-color: ${t("togglebutton.checked.border.color")};
    color: ${t("togglebutton.checked.color")};
}

.p-togglebutton-checked .p-togglebutton-content {
    background: ${t("togglebutton.content.checked.background")};
    box-shadow: ${t("togglebutton.content.checked.shadow")};
}

.p-togglebutton:focus-visible {
    box-shadow: ${t("togglebutton.focus.ring.shadow")};
    outline: ${t("togglebutton.focus.ring.width")} ${t("togglebutton.focus.ring.style")} ${t("togglebutton.focus.ring.color")};
    outline-offset: ${t("togglebutton.focus.ring.offset")};
}

.p-togglebutton.p-invalid {
    border-color: ${t("togglebutton.invalid.border.color")};
}

.p-togglebutton:disabled {
    opacity: 1;
    cursor: default;
    background: ${t("togglebutton.disabled.background")};
    border-color: ${t("togglebutton.disabled.border.color")};
    color: ${t("togglebutton.disabled.color")};
}

.p-togglebutton-label,
.p-togglebutton-icon {
    position: relative;
    transition: none;
}

.p-togglebutton-icon {
    color: ${t("togglebutton.icon.color")};
}

.p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
    color: ${t("togglebutton.icon.hover.color")};
}

.p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
    color: ${t("togglebutton.icon.checked.color")};
}

.p-togglebutton:disabled .p-togglebutton-icon {
    color: ${t("togglebutton.icon.disabled.color")};
}

.p-togglebutton-sm {
    padding: ${t("togglebutton.sm.padding")};
    font-size: ${t("togglebutton.sm.font.size")};
}

.p-togglebutton-sm .p-togglebutton-content {
    padding: ${t("togglebutton.content.sm.padding")};
}

.p-togglebutton-lg {
    padding: ${t("togglebutton.lg.padding")};
    font-size: ${t("togglebutton.lg.font.size")};
}

.p-togglebutton-lg .p-togglebutton-content {
    padding: ${t("togglebutton.content.lg.padding")};
}
`,H={root:function(e){var n=e.instance,a=e.props;return["p-togglebutton p-component",{"p-togglebutton-checked":n.active,"p-invalid":n.$invalid,"p-togglebutton-sm p-inputfield-sm":a.size==="small","p-togglebutton-lg p-inputfield-lg":a.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},U=S.extend({name:"togglebutton",style:G,classes:H}),M={name:"BaseToggleButton",extends:C,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},iconPos:{type:String,default:"left"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null}},style:U,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}},T={name:"ToggleButton",extends:M,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(e){var n=e==="root"?this.ptmi:this.ptm;return n(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit("change",e))},onBlur:function(e){var n,a;(n=(a=this.formField).onBlur)===null||n===void 0||n.call(a,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return k(this.onLabel)&&k(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "}},directives:{ripple:B}},W=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled"];function Y(t,e,n,a,s,o){var r=L("ripple");return O((u(),g("button",b({type:"button",class:t.cx("root"),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:e[0]||(e[0]=function(){return o.onChange&&o.onChange.apply(o,arguments)}),onBlur:e[1]||(e[1]=function(){return o.onBlur&&o.onBlur.apply(o,arguments)})},o.getPTOptions("root"),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":o.active,"data-p-disabled":t.disabled}),[d("span",b({class:t.cx("content")},o.getPTOptions("content")),[$(t.$slots,"default",{},function(){return[$(t.$slots,"icon",{value:t.d_value,class:z(t.cx("icon"))},function(){return[t.onIcon||t.offIcon?(u(),g("span",b({key:0,class:[t.cx("icon"),t.d_value?t.onIcon:t.offIcon]},o.getPTOptions("icon")),null,16)):A("",!0)]}),d("span",b({class:t.cx("label")},o.getPTOptions("label")),f(o.label),17)]})],16)],16,W)),[[r]])}T.render=Y;var J=({dt:t})=>`
.p-selectbutton {
    display: inline-flex;
    user-select: none;
    vertical-align: bottom;
    outline-color: transparent;
    border-radius: ${t("selectbutton.border.radius")};
}

.p-selectbutton .p-togglebutton {
    border-radius: 0;
    border-width: 1px 1px 1px 0;
}

.p-selectbutton .p-togglebutton:focus-visible {
    position: relative;
    z-index: 1;
}

.p-selectbutton .p-togglebutton:first-child {
    border-inline-start-width: 1px;
    border-start-start-radius: ${t("selectbutton.border.radius")};
    border-end-start-radius: ${t("selectbutton.border.radius")};
}

.p-selectbutton .p-togglebutton:last-child {
    border-start-end-radius: ${t("selectbutton.border.radius")};
    border-end-end-radius: ${t("selectbutton.border.radius")};
}

.p-selectbutton.p-invalid {
    outline: 1px solid ${t("selectbutton.invalid.border.color")};
    outline-offset: 0;
}
`,Q={root:function(e){var n=e.instance;return["p-selectbutton p-component",{"p-invalid":n.$invalid}]}},X=S.extend({name:"selectbutton",style:J,classes:Q}),Z={name:"BaseSelectButton",extends:C,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null}},style:X,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function tt(t,e){var n=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=D(t))||e){n&&(t=n);var a=0,s=function(){};return{s,n:function(){return a>=t.length?{done:!0}:{done:!1,value:t[a++]}},e:function(c){throw c},f:s}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,r=!0,l=!1;return{s:function(){n=n.call(t)},n:function(){var c=n.next();return r=c.done,c},e:function(c){l=!0,o=c},f:function(){try{r||n.return==null||n.return()}finally{if(l)throw o}}}}function et(t){return lt(t)||ot(t)||D(t)||nt()}function nt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function D(t,e){if(t){if(typeof t=="string")return _(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_(t,e):void 0}}function ot(t){if(typeof Symbol<"u"&&t[Symbol.iterator]!=null||t["@@iterator"]!=null)return Array.from(t)}function lt(t){if(Array.isArray(t))return _(t)}function _(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,a=Array(e);n<e;n++)a[n]=t[n];return a}var I={name:"SelectButton",extends:Z,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(e){return this.optionLabel?h(e,this.optionLabel):e},getOptionValue:function(e){return this.optionValue?h(e,this.optionValue):e},getOptionRenderKey:function(e){return this.dataKey?h(e,this.dataKey):this.getOptionLabel(e)},isOptionDisabled:function(e){return this.optionDisabled?h(e,this.optionDisabled):!1},onOptionSelect:function(e,n,a){var s=this;if(!(this.disabled||this.isOptionDisabled(n))){var o=this.isSelected(n);if(!(o&&!this.allowEmpty)){var r=this.getOptionValue(n),l;this.multiple?o?l=this.d_value.filter(function(i){return!y(i,r,s.equalityKey)}):l=this.d_value?[].concat(et(this.d_value),[r]):[r]:l=o?null:r,this.writeValue(l,e),this.$emit("change",{event:e,value:l})}}},isSelected:function(e){var n=!1,a=this.getOptionValue(e);if(this.multiple){if(this.d_value){var s=tt(this.d_value),o;try{for(s.s();!(o=s.n()).done;){var r=o.value;if(y(r,a,this.equalityKey)){n=!0;break}}}catch(l){s.e(l)}finally{s.f()}}}else n=y(this.d_value,a,this.equalityKey);return n}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey}},directives:{ripple:B},components:{ToggleButton:T}},it=["aria-labelledby"];function at(t,e,n,a,s,o){var r=E("ToggleButton");return u(),g("div",b({class:t.cx("root"),role:"group","aria-labelledby":t.ariaLabelledby},t.ptmi("root")),[(u(!0),g(w,null,V(t.options,function(l,i){return u(),x(r,{key:o.getOptionRenderKey(l),modelValue:o.isSelected(l),onLabel:o.getOptionLabel(l),offLabel:o.getOptionLabel(l),disabled:t.disabled||o.isOptionDisabled(l),unstyled:t.unstyled,size:t.size,readonly:!t.allowEmpty&&o.isSelected(l),onChange:function(R){return o.onOptionSelect(R,l,i)},pt:t.ptm("pcToggleButton")},K({_:2},[t.$slots.option?{name:"default",fn:p(function(){return[$(t.$slots,"option",{option:l,index:i},function(){return[d("span",b({ref_for:!0},t.ptm("pcToggleButton").label),f(o.getOptionLabel(l)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,it)}I.render=at;const rt={class:"dictionary flex start column gap large"},st={class:"flex gap large wrap",style:{width:"80%"}},ut=["src"],dt={class:"text-center flex"},ct={class:"text-center flex"},gt={style:{height:"80px"},class:"flex text-center"},bt=F({__name:"Dictionary",setup(t){const e=P(),n=v("runes"),a=v([{key:"runes",label:"Runes"},{key:"aspects",label:"Aspects"}]),s=v({runes:[{title:"Generate",subtitle:"Generate a new Runeability",content:"Begin the Runeability creation process by selecting the desired Runes.",img:"/client_rune_dictionary/rune_generation.webp"},{title:"View",subtitle:"View Runes",content:"View a list of all existing Runes",hidden:!1,img:"/client_rune_dictionary/rune_get.webp"},{title:"Create",subtitle:"Create a Rune",content:"Create a new Rune",hidden:!1,img:"/client_rune_dictionary/rune_create.webp"},{title:"Edit",subtitle:"Edit a Rune",content:"Edit the properties of a Rune",hidden:!1,img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete a Rune",content:"Delete a Rune",hidden:!1,img:"/client_rune_dictionary/rune_delete.webp"}],aspects:[{title:"Create",subtitle:"Create an Aspect",content:"Create an Aspect and assign it to the relevant runes.",img:"/client_rune_dictionary/aspect_create.webp"},{title:"View",subtitle:"View Aspects",content:"View a list of all existing Aspects",hidden:!1,img:"/client_rune_dictionary/aspect_get.webp"},{title:"Edit",subtitle:"Edit an Aspect",content:"Edit the properties of an Aspect.",img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete an Aspect",content:"Delete an Aspect",hidden:!1,img:"/client_rune_dictionary/aspect_delete.webp"}]});return(o,r)=>{const l=L("ripple");return u(),g("div",rt,[q(m(I),{allowEmpty:!1,"option-value":"key","option-label":"label",modelValue:n.value,"onUpdate:modelValue":r[0]||(r[0]=i=>n.value=i),options:a.value},null,8,["modelValue","options"]),d("div",st,[(u(!0),g(w,null,V(s.value[n.value],i=>(u(),g(w,{key:i.title},[i.hidden?A("",!0):O((u(),x(m(j),{key:0,class:"card"},{header:p(()=>[d("img",{alt:"user header",class:"card-image",src:i.img??`https://placehold.co/400x200/${m(e).currentTheme.value.split("#")[1]}/FFF`},null,8,ut)]),title:p(()=>[d("span",dt,f(i.title),1)]),subtitle:p(()=>[d("span",ct,f(i.subtitle),1)]),content:p(()=>[d("p",gt,f(i.content),1)]),_:2},1024)),[[l]])],64))),128))])])}}}),ht=N(bt,[["__scopeId","data-v-8d4814b4"]]);export{ht as default};
