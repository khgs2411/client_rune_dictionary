import{E as C,R as L,S as A,T as D,U as B,V as R,w as T,c as p,o as b,g as s,H as S,n as w,y as P,G as h,C as y,W as _,X as m,Y as G,I as x,J as E,x as I,Z as q,j as f,d as H,$ as M,r as k,a0 as U,h as O,a as $,K as W,p as Y,D as J}from"./index.BZqEJO9I.js";import{s as X}from"./index.Ip4tK_Ge.js";var Z=({dt:t})=>`
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
`,Q={root:function(e){var n=e.instance,r=e.props;return["p-togglebutton p-component",{"p-togglebutton-checked":n.active,"p-invalid":n.$invalid,"p-togglebutton-sm p-inputfield-sm":r.size==="small","p-togglebutton-lg p-inputfield-lg":r.size==="large"}]},content:"p-togglebutton-content",icon:"p-togglebutton-icon",label:"p-togglebutton-label"},tt=C.extend({name:"togglebutton",style:Z,classes:Q}),et={name:"BaseToggleButton",extends:A,props:{onIcon:String,offIcon:String,onLabel:{type:String,default:"Yes"},offLabel:{type:String,default:"No"},iconPos:{type:String,default:"left"},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null},size:{type:String,default:null}},style:tt,provide:function(){return{$pcToggleButton:this,$parentInstance:this}}};function v(t){"@babel/helpers - typeof";return v=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},v(t)}function nt(t,e,n){return(e=ot(e))in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function ot(t){var e=it(t,"string");return v(e)=="symbol"?e:e+""}function it(t,e){if(v(t)!="object"||!t)return t;var n=t[Symbol.toPrimitive];if(n!==void 0){var r=n.call(t,e);if(v(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(t)}var z={name:"ToggleButton",extends:et,inheritAttrs:!1,emits:["change"],methods:{getPTOptions:function(e){var n=e==="root"?this.ptmi:this.ptm;return n(e,{context:{active:this.active,disabled:this.disabled}})},onChange:function(e){!this.disabled&&!this.readonly&&(this.writeValue(!this.d_value,e),this.$emit("change",e))},onBlur:function(e){var n,r;(n=(r=this.formField).onBlur)===null||n===void 0||n.call(r,e)}},computed:{active:function(){return this.d_value===!0},hasLabel:function(){return B(this.onLabel)&&B(this.offLabel)},label:function(){return this.hasLabel?this.d_value?this.onLabel:this.offLabel:" "},dataP:function(){return D(nt({checked:this.active,invalid:this.$invalid},this.size,this.size))}},directives:{ripple:L}},rt=["tabindex","disabled","aria-pressed","aria-label","aria-labelledby","data-p-checked","data-p-disabled","data-p"],at=["data-p"];function lt(t,e,n,r,u,o){var l=R("ripple");return T((b(),p("button",h({type:"button",class:t.cx("root"),tabindex:t.tabindex,disabled:t.disabled,"aria-pressed":t.d_value,onClick:e[0]||(e[0]=function(){return o.onChange&&o.onChange.apply(o,arguments)}),onBlur:e[1]||(e[1]=function(){return o.onBlur&&o.onBlur.apply(o,arguments)})},o.getPTOptions("root"),{"aria-label":t.ariaLabel,"aria-labelledby":t.ariaLabelledby,"data-p-checked":o.active,"data-p-disabled":t.disabled,"data-p":o.dataP}),[s("span",h({class:t.cx("content")},o.getPTOptions("content"),{"data-p":o.dataP}),[S(t.$slots,"default",{},function(){return[S(t.$slots,"icon",{value:t.d_value,class:w(t.cx("icon"))},function(){return[t.onIcon||t.offIcon?(b(),p("span",h({key:0,class:[t.cx("icon"),t.d_value?t.onIcon:t.offIcon]},o.getPTOptions("icon")),null,16)):P("",!0)]}),s("span",h({class:t.cx("label")},o.getPTOptions("label")),y(o.label),17)]})],16,at)],16,rt)),[[l]])}z.render=lt;var st=({dt:t})=>`
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
`,ut={root:function(e){var n=e.instance;return["p-selectbutton p-component",{"p-invalid":n.$invalid}]}},dt=C.extend({name:"selectbutton",style:st,classes:ut}),ct={name:"BaseSelectButton",extends:A,props:{options:Array,optionLabel:null,optionValue:null,optionDisabled:null,multiple:Boolean,allowEmpty:{type:Boolean,default:!0},dataKey:null,ariaLabelledby:{type:String,default:null},size:{type:String,default:null}},style:dt,provide:function(){return{$pcSelectButton:this,$parentInstance:this}}};function gt(t,e){var n=typeof Symbol<"u"&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=K(t))||e){n&&(t=n);var r=0,u=function(){};return{s:u,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(a){throw a},f:u}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,l=!0,i=!1;return{s:function(){n=n.call(t)},n:function(){var a=n.next();return l=a.done,a},e:function(a){i=!0,o=a},f:function(){try{l||n.return==null||n.return()}finally{if(i)throw o}}}}function bt(t){return ht(t)||ft(t)||K(t)||pt()}function pt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function K(t,e){if(t){if(typeof t=="string")return V(t,e);var n={}.toString.call(t).slice(8,-1);return n==="Object"&&t.constructor&&(n=t.constructor.name),n==="Map"||n==="Set"?Array.from(t):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?V(t,e):void 0}}function ft(t){if(typeof Symbol<"u"&&t[Symbol.iterator]!=null||t["@@iterator"]!=null)return Array.from(t)}function ht(t){if(Array.isArray(t))return V(t)}function V(t,e){(e==null||e>t.length)&&(e=t.length);for(var n=0,r=Array(e);n<e;n++)r[n]=t[n];return r}var j={name:"SelectButton",extends:ct,inheritAttrs:!1,emits:["change"],methods:{getOptionLabel:function(e){return this.optionLabel?m(e,this.optionLabel):e},getOptionValue:function(e){return this.optionValue?m(e,this.optionValue):e},getOptionRenderKey:function(e){return this.dataKey?m(e,this.dataKey):this.getOptionLabel(e)},isOptionDisabled:function(e){return this.optionDisabled?m(e,this.optionDisabled):!1},isOptionReadonly:function(e){if(this.allowEmpty)return!1;var n=this.isSelected(e);return this.multiple?n&&this.d_value.length===1:n},onOptionSelect:function(e,n,r){var u=this;if(!(this.disabled||this.isOptionDisabled(n)||this.isOptionReadonly(n))){var o=this.isSelected(n),l=this.getOptionValue(n),i;if(this.multiple)if(o){if(i=this.d_value.filter(function(d){return!_(d,l,u.equalityKey)}),!this.allowEmpty&&i.length===0)return}else i=this.d_value?[].concat(bt(this.d_value),[l]):[l];else{if(o&&!this.allowEmpty)return;i=o?null:l}this.writeValue(i,e),this.$emit("change",{event:e,value:i})}},isSelected:function(e){var n=!1,r=this.getOptionValue(e);if(this.multiple){if(this.d_value){var u=gt(this.d_value),o;try{for(u.s();!(o=u.n()).done;){var l=o.value;if(_(l,r,this.equalityKey)){n=!0;break}}}catch(i){u.e(i)}finally{u.f()}}}else n=_(this.d_value,r,this.equalityKey);return n}},computed:{equalityKey:function(){return this.optionValue?null:this.dataKey},dataP:function(){return D({invalid:this.$invalid})}},directives:{ripple:L},components:{ToggleButton:z}},yt=["aria-labelledby","data-p"];function vt(t,e,n,r,u,o){var l=G("ToggleButton");return b(),p("div",h({class:t.cx("root"),role:"group","aria-labelledby":t.ariaLabelledby},t.ptmi("root"),{"data-p":o.dataP}),[(b(!0),p(x,null,E(t.options,function(i,d){return b(),I(l,{key:o.getOptionRenderKey(i),modelValue:o.isSelected(i),onLabel:o.getOptionLabel(i),offLabel:o.getOptionLabel(i),disabled:t.disabled||o.isOptionDisabled(i),unstyled:t.unstyled,size:t.size,readonly:o.isOptionReadonly(i),onChange:function(g){return o.onOptionSelect(g,i,d)},pt:t.ptm("pcToggleButton")},q({_:2},[t.$slots.option?{name:"default",fn:f(function(){return[S(t.$slots,"option",{option:i,index:d},function(){return[s("span",h({ref_for:!0},t.ptm("pcToggleButton").label),y(o.getOptionLabel(i)),17)]})]}),key:"0"}:void 0]),1032,["modelValue","onLabel","offLabel","disabled","unstyled","size","readonly","onChange","pt"])}),128))],16,yt)}j.render=vt;const mt={class:"dictionary-view min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900"},$t={class:"container mx-auto px-4 pb-12"},wt={class:"flex justify-center mb-12"},_t={class:"cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"},kt={class:"card-header-wrapper relative overflow-hidden h-48"},St=["alt","src"],xt={class:"card-icon absolute top-4 right-4 text-4xl opacity-50 group-hover:opacity-100 transition-opacity"},Vt={class:"text-2xl font-bold text-primary-300 text-center flex items-center justify-center gap-2"},Bt={class:"text-primary-400/80 text-center italic"},Ot={class:"text-color text-center h-20 flex items-center justify-center"},Ct=H({__name:"Dictionary",setup(t){const e=M(),n=k("runes"),r=k([{key:"runes",label:"Runes"},{key:"aspects",label:"Aspects"}]),u=a=>({Generate:"✨",View:"📖",Create:"🔮",Edit:"✏️",Delete:"🗑️"})[a]||"📜",o=a=>({Generate:"pi pi-sparkles",View:"pi pi-eye",Create:"pi pi-plus-circle",Edit:"pi pi-pencil",Delete:"pi pi-trash"})[a]||"pi pi-book",l=a=>({Generate:"Forge Runeability",View:"Browse Collection",Create:"Craft New Rune",Edit:"Modify Rune",Delete:"Destroy Rune"})[a]||a,i=a=>({Generate:"bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700",View:"bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",Create:"bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",Edit:"bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",Delete:"bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"})[a]||"bg-primary-600 hover:bg-primary-700",d=k({runes:[{title:"Generate",subtitle:"Generate a new Runeability",content:"Begin the Runeability creation process by selecting the desired Runes.",img:"/client_rune_dictionary/rune_generation.webp"},{title:"View",subtitle:"View Runes",content:"View a list of all existing Runes",hidden:!1,img:"/client_rune_dictionary/rune_get.webp"},{title:"Create",subtitle:"Create a Rune",content:"Create a new Rune",hidden:!1,img:"/client_rune_dictionary/rune_create.webp"},{title:"Edit",subtitle:"Edit a Rune",content:"Edit the properties of a Rune",hidden:!1,img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete a Rune",content:"Delete a Rune",hidden:!1,img:"/client_rune_dictionary/rune_delete.webp"}],aspects:[{title:"Create",subtitle:"Create an Aspect",content:"Create an Aspect and assign it to the relevant runes.",img:"/client_rune_dictionary/aspect_create.webp"},{title:"View",subtitle:"View Aspects",content:"View a list of all existing Aspects",hidden:!1,img:"/client_rune_dictionary/aspect_get.webp"},{title:"Edit",subtitle:"Edit an Aspect",content:"Edit the properties of an Aspect.",img:"/client_rune_dictionary/edit.webp"},{title:"Delete",subtitle:"Delete an Aspect",content:"Delete an Aspect",hidden:!1,img:"/client_rune_dictionary/aspect_delete.webp"}]});return(a,g)=>{const F=R("ripple");return b(),p("div",mt,[g[2]||(g[2]=U('<div class="dictionary-header relative py-12 px-4 text-center overflow-hidden" data-v-5a3bcb15><div class="absolute inset-0 bg-black/30" data-v-5a3bcb15></div><div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/20 to-transparent" data-v-5a3bcb15></div><div class="relative z-10" data-v-5a3bcb15><h1 class="text-5xl md:text-6xl font-bold text-primary-200 mb-4 drop-shadow-lg" data-v-5a3bcb15>Tome of Knowledge</h1><p class="text-xl text-primary-300/80" data-v-5a3bcb15>Master the ancient arts of runecraft</p></div></div>',1)),s("div",$t,[s("div",wt,[O($(j),{allowEmpty:!1,"option-value":"key","option-label":"label",modelValue:n.value,"onUpdate:modelValue":g[0]||(g[0]=c=>n.value=c),options:r.value,class:"rpg-select-button"},null,8,["modelValue","options"])]),s("div",_t,[(b(!0),p(x,null,E(d.value[n.value],(c,N)=>(b(),p(x,{key:c.title},[c.hidden?P("",!0):T((b(),I($(X),{key:0,class:w(["rpg-card group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl",`card-enter-${N}`])},{header:f(()=>[s("div",kt,[s("img",{alt:c.title,class:"card-image w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",src:c.img??`https://placehold.co/400x200/${$(e).currentTheme.value.split("#")[1]}/FFF`},null,8,St),g[1]||(g[1]=s("div",{class:"card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"},null,-1)),s("div",xt,y(u(c.title)),1)])]),title:f(()=>[s("h3",Vt,[s("i",{class:w(o(c.title))},null,2),Y(" "+y(c.title),1)])]),subtitle:f(()=>[s("p",Bt,y(c.subtitle),1)]),content:f(()=>[s("p",Ot,y(c.content),1)]),footer:f(()=>[O($(W),{label:l(c.title),icon:"pi pi-arrow-right",iconPos:"right",class:w(["w-full rpg-button",i(c.title)])},null,8,["label","class"])]),_:2},1032,["class"])),[[F]])],64))),128))])])])}}}),Dt=J(Ct,[["__scopeId","data-v-5a3bcb15"]]);export{Dt as default};
