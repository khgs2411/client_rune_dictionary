import{B as O,R as B,g as L,h as A,i as k,r as V,w as x,c as g,o as u,b as d,j as _,n as E,k as C,m as b,t as f,l as v,p as y,q as K,F as w,v as T,x as P,y as F,z as p,d as j,A as q,C as m,e as N,f as $,D as G,_ as H}from"./index.odJwoyAD.js";var U=({dt:t})=>`
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
`,M={root:function(e){var n=e.instance,i=e.props;return["p-togglebutton p-component",{"p-togglebutton-checked":n.active,"p-invalid":n.$invalid,"p-togglebutton-sm p-inputfield-sm":i.size==="small","p-togglebutton-lg p-inputfield-lg":i.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},W=O.extend({name:"togglebutton",style:U,classes:M}),Y={name:"BaseToggleButton",extends:L,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},iconPos:{type:String,default:"left"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null}},style:W,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function h(t){"@babel/helpers - typeof";return h=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},h(t)}function J(t,e,n){return(e=Q(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function Q(t){var e=X(t,"string");return h(e)=="symbol"?e:e+""}function X(t,e){if(h(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var i=n.call(t,e);if(h(i)!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var R={name:"ToggleButton",extends:Y,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(e){var n=e==="root"?this.ptmi:this.ptm;return n(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit("change",e))},onBlur:function(e){var n,i;(n=(i=this.formField).onBlur)===null||n===void 0||n.call(i,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return k(this.onLabel)&&k(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "},dataP:function(){return A(J({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:B}},Z=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled","data-p"],tt=["data-p"];function et(t,e,n,i,s,o){var r=V("ripple");return x((u(),g("button",b({type:"button",class:t.cx("root"),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:e[0]||(e[0]=function(){return o.onChange&&o.onChange.apply(o,arguments)}),onBlur:e[1]||(e[1]=function(){return o.onBlur&&o.onBlur.apply(o,arguments)})},o.getPTOptions("root"),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":o.active,"data-p-disabled":t.disabled,"data-p":o.dataP}),[d("span",b({class:t.cx("content")},o.getPTOptions("content"),{"data-p":o.dataP}),[_(t.$slots,"default",{},function(){return[_(t.$slots,"icon",{value:t.d_value,class:E(t.cx("icon"))},function(){return[t.onIcon||t.offIcon?(u(),g("span",b({key:0,class:[t.cx("icon"),t.d_value?t.onIcon:t.offIcon]},o.getPTOptions("icon")),null,16)):C("",!0)]}),d("span",b({class:t.cx("label")},o.getPTOptions("label")),f(o.label),17)]})],16,tt)],16,Z)),[[r]])}R.render=et;var nt=({dt:t})=>`
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
`,ot={root:function(e){var n=e.instance;return["p-selectbutton p-component",{"p-invalid":n.$invalid}]}},lt=O.extend({name:"selectbutton",style:nt,classes:ot}),it={name:"BaseSelectButton",extends:L,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null}},style:lt,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function at(t,e){var n=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=D(t))||e){n&&(t=n);var i=0,s=function(){};return{s,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(c){throw c},f:s}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,r=!0,l=!1;return{s:function(){n=n.call(t)},n:function(){var c=n.next();return r=c.done,c},e:function(c){l=!0,o=c},f:function(){try{r||n.return==null||n.return()}finally{if(l)throw o}}}}function rt(t){return dt(t)||ut(t)||D(t)||st()}function st(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function D(t,e){if(t){if(typeof t=="string")return S(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?S(t,e):void 0}}function ut(t){if(typeof Symbol<"u"&&t[Symbol.iterator]!=null||t["@@iterator"]!=null)return Array.from(t)}function dt(t){if(Array.isArray(t))return S(t)}function S(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,i=Array(e);n<e;n++)i[n]=t[n];return i}var z={name:"SelectButton",extends:it,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(e){return this.optionLabel?y(e,this.optionLabel):e},getOptionValue:function(e){return this.optionValue?y(e,this.optionValue):e},getOptionRenderKey:function(e){return this.dataKey?y(e,this.dataKey):this.getOptionLabel(e)},isOptionDisabled:function(e){return this.optionDisabled?y(e,this.optionDisabled):!1},isOptionReadonly:function(e){if(this.allowEmpty)return!1;var n=this.isSelected(e);return this.multiple?n&&this.d_value.length===1:n},onOptionSelect:function(e,n,i){var s=this;if(!(this.disabled||this.isOptionDisabled(n)||this.isOptionReadonly(n))){var o=this.isSelected(n),r=this.getOptionValue(n),l;if(this.multiple)if(o){if(l=this.d_value.filter(function(a){return!v(a,r,s.equalityKey)}),!this.allowEmpty&&l.length===0)return}else l=this.d_value?[].concat(rt(this.d_value),[r]):[r];else{if(o&&!this.allowEmpty)return;l=o?null:r}this.writeValue(l,e),this.$emit("change",{event:e,value:l})}},isSelected:function(e){var n=!1,i=this.getOptionValue(e);if(this.multiple){if(this.d_value){var s=at(this.d_value),o;try{for(s.s();!(o=s.n()).done;){var r=o.value;if(v(r,i,this.equalityKey)){n=!0;break}}}catch(l){s.e(l)}finally{s.f()}}}else n=v(this.d_value,i,this.equalityKey);return n}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey},dataP:function(){return A({invalid:this.$invalid})}},directives:{ripple:B},components:{ToggleButton:R}},ct=["aria-labelledby","data-p"];function gt(t,e,n,i,s,o){var r=K("ToggleButton");return u(),g("div",b({class:t.cx("root"),role:"group","aria-labelledby":t.ariaLabelledby},t.ptmi("root"),{"data-p":o.dataP}),[(u(!0),g(w,null,T(t.options,function(l,a){return u(),P(r,{key:o.getOptionRenderKey(l),modelValue:o.isSelected(l),onLabel:o.getOptionLabel(l),offLabel:o.getOptionLabel(l),disabled:t.disabled||o.isOptionDisabled(l),unstyled:t.unstyled,size:t.size,readonly:o.isOptionReadonly(l),onChange:function(I){return o.onOptionSelect(I,l,a)},pt:t.ptm("pcToggleButton")},F({_:2},[t.$slots.option?{name:"default",fn:p(function(){return[_(t.$slots,"option",{option:l,index:a},function(){return[d("span",b({ref_for:!0},t.ptm("pcToggleButton").label),f(o.getOptionLabel(l)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,ct)}z.render=gt;const bt={class:"dictionary flex start column gap large"},pt={class:"flex gap large wrap",style:{width:"80%"}},ft=["src"],ht={class:"text-center flex"},yt={class:"text-center flex"},vt={style:{height:"80px"},class:"flex text-center"},mt=j({__name:"Dictionary",setup(t){const e=q(),n=m("runes"),i=m([{key:"runes",label:"Runes"},{key:"aspects",label:"Aspects"}]),s=m({runes:[{title:"Generate",subtitle:"Generate a new Runeability",content:"Begin the Runeability creation process by selecting the desired Runes.",img:"/client_rune_dictionary/rune_generation.webp"},{title:"View",subtitle:"View Runes",content:"View a list of all existing Runes",hidden:!1,img:"/client_rune_dictionary/rune_get.webp"},{title:"Create",subtitle:"Create a Rune",content:"Create a new Rune",hidden:!1,img:"/client_rune_dictionary/rune_create.webp"},{title:"Edit",subtitle:"Edit a Rune",content:"Edit the properties of a Rune",hidden:!1,img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete a Rune",content:"Delete a Rune",hidden:!1,img:"/client_rune_dictionary/rune_delete.webp"}],aspects:[{title:"Create",subtitle:"Create an Aspect",content:"Create an Aspect and assign it to the relevant runes.",img:"/client_rune_dictionary/aspect_create.webp"},{title:"View",subtitle:"View Aspects",content:"View a list of all existing Aspects",hidden:!1,img:"/client_rune_dictionary/aspect_get.webp"},{title:"Edit",subtitle:"Edit an Aspect",content:"Edit the properties of an Aspect.",img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete an Aspect",content:"Delete an Aspect",hidden:!1,img:"/client_rune_dictionary/aspect_delete.webp"}]});return(o,r)=>{const l=V("ripple");return u(),g("div",bt,[N($(z),{allowEmpty:!1,"option-value":"key","option-label":"label",modelValue:n.value,"onUpdate:modelValue":r[0]||(r[0]=a=>n.value=a),options:i.value},null,8,["modelValue","options"]),d("div",pt,[(u(!0),g(w,null,T(s.value[n.value],a=>(u(),g(w,{key:a.title},[a.hidden?C("",!0):x((u(),P($(G),{key:0,class:"card"},{header:p(()=>[d("img",{alt:"user header",class:"card-image",src:a.img??`https://placehold.co/400x200/${$(e).currentTheme.value.split("#")[1]}/FFF`},null,8,ft)]),title:p(()=>[d("span",ht,f(a.title),1)]),subtitle:p(()=>[d("span",yt,f(a.subtitle),1)]),content:p(()=>[d("p",vt,f(a.content),1)]),_:2},1024)),[[l]])],64))),128))])])}}}),_t=H(mt,[["__scopeId","data-v-8d4814b4"]]);export{_t as default};
