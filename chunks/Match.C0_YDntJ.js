import{B as ce,C as Ce,R as Ee,D as _e,E as J,i as N,G as ie,H as de,I as $e,J as Ke,K as Ae,L as Re,Z as oe,M as j,N as De,O as me,P as Te,Q as ge,m as y,S as Oe,p as Z,r as ve,v as A,o as d,y as D,c as v,j as K,F as W,q as Q,b,w as Ie,T as se,n as O,t as T,U as be,e as V,h as q,a as ee,V as E,W as x,X as Y,Y as ze,A as w,d as te,f as g,$ as Fe,_ as ne,a0 as pe,a1 as ae,a2 as le,a3 as xe,a4 as Ve,a5 as he,a6 as ye,a7 as We,a8 as re,a9 as Ge,aa as He,ab as Be,ac as Ne,u as Ye}from"./index.DBvWv2VX.js";import{B as we,s as Ue,A as Xe,L as qe}from"./LoginForm.BXMnZwLL.js";import"./index._4FIEZqX.js";var Ze=({dt:t})=>`
.p-contextmenu {
    background: ${t("contextmenu.background")};
    color: ${t("contextmenu.color")};
    border: 1px solid ${t("contextmenu.border.color")};
    border-radius: ${t("contextmenu.border.radius")};
    box-shadow: ${t("contextmenu.shadow")};
    min-width: 12.5rem;
}

.p-contextmenu-root-list,
.p-contextmenu-submenu {
    margin: 0;
    padding: ${t("contextmenu.list.padding")};
    list-style: none;
    outline: 0 none;
    display: flex;
    flex-direction: column;
    gap: ${t("contextmenu.list.gap")};
}

.p-contextmenu-submenu {
    position: absolute;
    display: flex;
    flex-direction: column;
    min-width: 100%;
    z-index: 1;
    background: ${t("contextmenu.background")};
    color: ${t("contextmenu.color")};
    border: 1px solid ${t("contextmenu.border.color")};
    border-radius: ${t("contextmenu.border.radius")};
    box-shadow: ${t("contextmenu.shadow")};
}

.p-contextmenu-item {
    position: relative;
}

.p-contextmenu-item-content {
    transition: background ${t("contextmenu.transition.duration")}, color ${t("contextmenu.transition.duration")};
    border-radius: ${t("contextmenu.item.border.radius")};
    color: ${t("contextmenu.item.color")};
}

.p-contextmenu-item-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    color: inherit;
    padding: ${t("contextmenu.item.padding")};
    gap: ${t("contextmenu.item.gap")};
    user-select: none;
}

.p-contextmenu-item-label {
    line-height: 1;
}

.p-contextmenu-item-icon {
    color: ${t("contextmenu.item.icon.color")};
}

.p-contextmenu-submenu-icon {
    color: ${t("contextmenu.submenu.icon.color")};
    margin-left: auto;
    font-size: ${t("contextmenu.submenu.icon.size")};
    width: ${t("contextmenu.submenu.icon.size")};
    height: ${t("contextmenu.submenu.icon.size")};
}

.p-contextmenu-submenu-icon:dir(rtl) {
    margin-left: 0;
    margin-right: auto;
}

.p-contextmenu-item.p-focus > .p-contextmenu-item-content {
    color: ${t("contextmenu.item.focus.color")};
    background: ${t("contextmenu.item.focus.background")};
}

.p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-item-icon {
    color: ${t("contextmenu.item.icon.focus.color")};
}

.p-contextmenu-item.p-focus > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
    color: ${t("contextmenu.submenu.icon.focus.color")};
}

.p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover {
    color: ${t("contextmenu.item.focus.color")};
    background: ${t("contextmenu.item.focus.background")};
}

.p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-item-icon {
    color: ${t("contextmenu.item.icon.focus.color")};
}

.p-contextmenu-item:not(.p-disabled) > .p-contextmenu-item-content:hover .p-contextmenu-submenu-icon {
    color: ${t("contextmenu.submenu.icon.focus.color")};
}

.p-contextmenu-item-active > .p-contextmenu-item-content {
    color: ${t("contextmenu.item.active.color")};
    background: ${t("contextmenu.item.active.background")};
}

.p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-item-icon {
    color: ${t("contextmenu.item.icon.active.color")};
}

.p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
    color: ${t("contextmenu.submenu.icon.active.color")};
}

.p-contextmenu-separator {
    border-block-start: 1px solid ${t("contextmenu.separator.border.color")};
}

.p-contextmenu-enter-from,
.p-contextmenu-leave-active {
    opacity: 0;
}

.p-contextmenu-enter-active {
    transition: opacity 250ms;
}

.p-contextmenu-mobile .p-contextmenu-submenu {
    position: static;
    box-shadow: none;
    border: 0 none;
    padding-inline-start: ${t("tieredmenu.submenu.mobile.indent")};
    padding-inline-end: 0;
}

.p-contextmenu-mobile .p-contextmenu-submenu-icon {
    transition: transform 0.2s;
    transform: rotate(90deg);
}

.p-contextmenu-mobile .p-contextmenu-item-active > .p-contextmenu-item-content .p-contextmenu-submenu-icon {
    transform: rotate(-90deg);
}
`,je={root:function(e){var n=e.instance;return["p-contextmenu p-component",{"p-contextmenu-mobile":n.queryMatches}]},rootList:"p-contextmenu-root-list",item:function(e){var n=e.instance,o=e.processedItem;return["p-contextmenu-item",{"p-contextmenu-item-active":n.isItemActive(o),"p-focus":n.isItemFocused(o),"p-disabled":n.isItemDisabled(o)}]},itemContent:"p-contextmenu-item-content",itemLink:"p-contextmenu-item-link",itemIcon:"p-contextmenu-item-icon",itemLabel:"p-contextmenu-item-label",submenuIcon:"p-contextmenu-submenu-icon",submenu:"p-contextmenu-submenu",separator:"p-contextmenu-separator"},Je=ce.extend({name:"contextmenu",style:Ze,classes:je}),Qe={name:"BaseContextMenu",extends:J,props:{model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},global:{type:Boolean,default:!1},breakpoint:{type:String,default:"960px"},tabindex:{type:Number,default:0},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:Je,provide:function(){return{$pcContextMenu:this,$parentInstance:this}}},Le={name:"ContextMenuSub",hostName:"ContextMenu",extends:J,emits:["item-click","item-mouseenter","item-mousemove"],props:{items:{type:Array,default:null},menuId:{type:String,default:null},focusedItemId:{type:String,default:null},root:{type:Boolean,default:!1},visible:{type:Boolean,default:!1},level:{type:Number,default:0},templates:{type:Object,default:null},activeItemPath:{type:Object,default:null},tabindex:{type:Number,default:0}},methods:{getItemId:function(e){return"".concat(this.menuId,"_").concat(e.key)},getItemKey:function(e){return this.getItemId(e)},getItemProp:function(e,n,o){return e&&e.item?ge(e.item[n],o):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},getItemLabelId:function(e){return"".concat(this.menuId,"_").concat(e.key,"_label")},getPTOptions:function(e,n,o){return this.ptm(e,{context:{item:n.item,active:this.isItemActive(n),focused:this.isItemFocused(n),disabled:this.isItemDisabled(n),index:o}})},isItemActive:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemFocused:function(e){return this.focusedItemId===this.getItemId(e)},isItemGroup:function(e){return N(e.items)},onItemClick:function(e,n){this.getItemProp(n,"command",{originalEvent:e,item:n.item}),this.$emit("item-click",{originalEvent:e,processedItem:n,isFocus:!0})},onItemMouseEnter:function(e,n){this.$emit("item-mouseenter",{originalEvent:e,processedItem:n})},onItemMouseMove:function(e,n){this.$emit("item-mousemove",{originalEvent:e,processedItem:n,isFocus:!0})},getAriaSetSize:function(){var e=this;return this.items.filter(function(n){return e.isItemVisible(n)&&!e.getItemProp(n,"separator")}).length},getAriaPosInset:function(e){var n=this;return e-this.items.slice(0,e).filter(function(o){return n.isItemVisible(o)&&n.getItemProp(o,"separator")}).length+1},onEnter:function(){Oe(this.$refs.container,this.level)},getMenuItemProps:function(e,n){return{action:y({class:this.cx("itemLink"),tabindex:-1},this.getPTOptions("itemLink",e,n)),icon:y({class:[this.cx("itemIcon"),this.getItemProp(e,"icon")]},this.getPTOptions("itemIcon",e,n)),label:y({class:this.cx("itemLabel")},this.getPTOptions("itemLabel",e,n)),submenuicon:y({class:this.cx("submenuIcon")},this.getPTOptions("submenuicon",e,n))}}},components:{AngleRightIcon:_e},directives:{ripple:Ee}},et=["tabindex"],tt=["id","aria-label","aria-disabled","aria-expanded","aria-haspopup","aria-level","aria-setsize","aria-posinset","data-p-active","data-p-focused","data-p-disabled"],nt=["onClick","onMouseenter","onMousemove"],it=["href","target"],ot=["id"],st=["id"];function at(t,e,n,o,a,i){var r=Z("AngleRightIcon"),m=Z("ContextMenuSub",!0),h=ve("ripple");return d(),A(be,y({name:"p-contextmenusub",onEnter:i.onEnter},t.ptm("menu.transition")),{default:D(function(){return[n.root||n.visible?(d(),v("ul",y({key:0,ref:"container",tabindex:n.tabindex},t.ptm("rootList")),[(d(!0),v(W,null,Q(n.items,function(s,c){return d(),v(W,{key:i.getItemKey(s)},[i.isItemVisible(s)&&!i.getItemProp(s,"separator")?(d(),v("li",y({key:0,id:i.getItemId(s),style:i.getItemProp(s,"style"),class:[t.cx("item",{processedItem:s}),i.getItemProp(s,"class")],role:"menuitem","aria-label":i.getItemLabel(s),"aria-disabled":i.isItemDisabled(s)||void 0,"aria-expanded":i.isItemGroup(s)?i.isItemActive(s):void 0,"aria-haspopup":i.isItemGroup(s)&&!i.getItemProp(s,"to")?"menu":void 0,"aria-level":n.level+1,"aria-setsize":i.getAriaSetSize(),"aria-posinset":i.getAriaPosInset(c),ref_for:!0},i.getPTOptions("item",s,c),{"data-p-active":i.isItemActive(s),"data-p-focused":i.isItemFocused(s),"data-p-disabled":i.isItemDisabled(s)}),[b("div",y({class:t.cx("itemContent"),onClick:function(p){return i.onItemClick(p,s)},onMouseenter:function(p){return i.onItemMouseEnter(p,s)},onMousemove:function(p){return i.onItemMouseMove(p,s)},ref_for:!0},i.getPTOptions("itemContent",s,c)),[n.templates.item?(d(),A(se(n.templates.item),{key:1,item:s.item,hasSubmenu:i.getItemProp(s,"items"),label:i.getItemLabel(s),props:i.getMenuItemProps(s,c)},null,8,["item","hasSubmenu","label","props"])):Ie((d(),v("a",y({key:0,href:i.getItemProp(s,"url"),class:t.cx("itemLink"),target:i.getItemProp(s,"target"),tabindex:"-1",ref_for:!0},i.getPTOptions("itemLink",s,c)),[n.templates.itemicon?(d(),A(se(n.templates.itemicon),{key:0,item:s.item,class:O(t.cx("itemIcon"))},null,8,["item","class"])):i.getItemProp(s,"icon")?(d(),v("span",y({key:1,class:[t.cx("itemIcon"),i.getItemProp(s,"icon")],ref_for:!0},i.getPTOptions("itemIcon",s,c)),null,16)):K("",!0),b("span",y({id:i.getItemLabelId(s),class:t.cx("itemLabel"),ref_for:!0},i.getPTOptions("itemLabel",s,c)),T(i.getItemLabel(s)),17,ot),i.getItemProp(s,"items")?(d(),v(W,{key:2},[n.templates.submenuicon?(d(),A(se(n.templates.submenuicon),{key:0,active:i.isItemActive(s),class:O(t.cx("submenuIcon"))},null,8,["active","class"])):(d(),A(r,y({key:1,class:t.cx("submenuIcon"),ref_for:!0},i.getPTOptions("submenuicon",s,c)),null,16,["class"]))],64)):K("",!0)],16,it)),[[h]])],16,nt),i.isItemVisible(s)&&i.isItemGroup(s)?(d(),A(m,y({key:0,id:i.getItemId(s)+"_list",role:"menu",class:t.cx("submenu"),menuId:n.menuId,focusedItemId:n.focusedItemId,items:s.items,templates:n.templates,activeItemPath:n.activeItemPath,level:n.level+1,visible:i.isItemActive(s)&&i.isItemGroup(s),pt:t.pt,unstyled:t.unstyled,onItemClick:e[0]||(e[0]=function(l){return t.$emit("item-click",l)}),onItemMouseenter:e[1]||(e[1]=function(l){return t.$emit("item-mouseenter",l)}),onItemMousemove:e[2]||(e[2]=function(l){return t.$emit("item-mousemove",l)}),"aria-labelledby":i.getItemLabelId(s),ref_for:!0},t.ptm("submenu")),null,16,["id","class","menuId","focusedItemId","items","templates","activeItemPath","level","visible","pt","unstyled","aria-labelledby"])):K("",!0)],16,tt)):K("",!0),i.isItemVisible(s)&&i.getItemProp(s,"separator")?(d(),v("li",y({key:1,id:i.getItemId(s),style:i.getItemProp(s,"style"),class:[t.cx("separator"),i.getItemProp(s,"class")],role:"separator",ref_for:!0},t.ptm("separator")),null,16,st)):K("",!0)],64)}),128))],16,et)):K("",!0)]}),_:1},16,["onEnter"])}Le.render=at;var Me={name:"ContextMenu",extends:Qe,inheritAttrs:!1,emits:["focus","blur","show","hide","before-show","before-hide"],target:null,outsideClickListener:null,resizeListener:null,documentContextMenuListener:null,matchMediaListener:null,pageX:null,pageY:null,container:null,list:null,data:function(){return{focused:!1,focusedItemInfo:{index:-1,level:0,parentKey:""},activeItemPath:[],visible:!1,submenuVisible:!1,query:null,queryMatches:!1}},watch:{activeItemPath:function(e){N(e)?(this.bindOutsideClickListener(),this.bindResizeListener()):this.visible||(this.unbindOutsideClickListener(),this.unbindResizeListener())}},mounted:function(){this.bindMatchMediaListener(),this.global&&this.bindDocumentContextMenuListener()},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.unbindDocumentContextMenuListener(),this.unbindMatchMediaListener(),this.container&&this.autoZIndex&&oe.clear(this.container),this.target=null,this.container=null},methods:{getItemProp:function(e,n){return e?ge(e[n]):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemGroup:function(e){return N(this.getItemProp(e,"items"))},isItemSeparator:function(e){return this.getItemProp(e,"separator")},getProccessedItemLabel:function(e){return e?this.getItemLabel(e.item):void 0},isProccessedItemGroup:function(e){return e&&N(e.items)},toggle:function(e){this.visible?this.hide():this.show(e)},show:function(e){this.$emit("before-show"),this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""},j(this.list),this.pageX=e.pageX,this.pageY=e.pageY,this.visible?this.position():this.visible=!0,e.stopPropagation(),e.preventDefault()},hide:function(){this.$emit("before-hide"),this.visible=!1,this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""}},onFocus:function(e){this.focused=!0,this.focusedItemInfo=this.focusedItemInfo.index!==-1?this.focusedItemInfo:{index:-1,level:0,parentKey:""},this.$emit("focus",e)},onBlur:function(e){this.focused=!1,this.focusedItemInfo={index:-1,level:0,parentKey:""},this.searchValue="",this.$emit("blur",e)},onKeyDown:function(e){var n=e.metaKey||e.ctrlKey;switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"ArrowLeft":this.onArrowLeftKey(e);break;case"ArrowRight":this.onArrowRightKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Space":this.onSpaceKey(e);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"PageDown":case"PageUp":case"Backspace":case"ShiftLeft":case"ShiftRight":break;default:!n&&Te(e.key)&&this.searchItems(e,e.key);break}},onItemChange:function(e,n){var o=e.processedItem,a=e.isFocus;if(!me(o)){var i=o.index,r=o.key,m=o.level,h=o.parentKey,s=o.items,c=N(s),l=this.activeItemPath.filter(function(p){return p.parentKey!==h&&p.parentKey!==r});c&&(l.push(o),this.submenuVisible=!0),this.focusedItemInfo={index:i,level:m,parentKey:h},a&&j(this.list),!(n==="hover"&&this.queryMatches)&&(this.activeItemPath=l)}},onItemClick:function(e){var n=e.processedItem,o=this.isProccessedItemGroup(n),a=this.isSelected(n);if(a){var i=n.index,r=n.key,m=n.level,h=n.parentKey;this.activeItemPath=this.activeItemPath.filter(function(s){return r!==s.key&&r.startsWith(s.key)}),this.focusedItemInfo={index:i,level:m,parentKey:h},j(this.list)}else o?this.onItemChange(e):this.hide()},onItemMouseEnter:function(e){this.onItemChange(e,"hover")},onItemMouseMove:function(e){this.focused&&this.changeFocusedItemIndex(e,e.processedItem.index)},onArrowDownKey:function(e){var n=this.focusedItemInfo.index!==-1?this.findNextItemIndex(this.focusedItemInfo.index):this.findFirstFocusedItemIndex();this.changeFocusedItemIndex(e,n),e.preventDefault()},onArrowUpKey:function(e){if(e.altKey){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.popup&&this.hide(),e.preventDefault()}else{var a=this.focusedItemInfo.index!==-1?this.findPrevItemIndex(this.focusedItemInfo.index):this.findLastFocusedItemIndex();this.changeFocusedItemIndex(e,a),e.preventDefault()}},onArrowLeftKey:function(e){var n=this,o=this.visibleItems[this.focusedItemInfo.index],a=this.activeItemPath.find(function(r){return r.key===o.parentKey}),i=me(o.parent);i||(this.focusedItemInfo={index:-1,parentKey:a?a.parentKey:""},this.searchValue="",this.onArrowDownKey(e)),this.activeItemPath=this.activeItemPath.filter(function(r){return r.parentKey!==n.focusedItemInfo.parentKey}),e.preventDefault()},onArrowRightKey:function(e){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);o&&(this.onItemChange({originalEvent:e,processedItem:n}),this.focusedItemInfo={index:-1,parentKey:n.key},this.searchValue="",this.onArrowDownKey(e)),e.preventDefault()},onHomeKey:function(e){this.changeFocusedItemIndex(e,this.findFirstItemIndex()),e.preventDefault()},onEndKey:function(e){this.changeFocusedItemIndex(e,this.findLastItemIndex()),e.preventDefault()},onEnterKey:function(e){if(this.focusedItemInfo.index!==-1){var n=ie(this.list,'li[id="'.concat("".concat(this.focusedItemIdx),'"]')),o=n&&ie(n,'[data-pc-section="itemlink"]');o?o.click():n&&n.click();var a=this.visibleItems[this.focusedItemInfo.index],i=this.isProccessedItemGroup(a);!i&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex())}e.preventDefault()},onSpaceKey:function(e){this.onEnterKey(e)},onEscapeKey:function(e){this.hide(),!this.popup&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex()),e.preventDefault()},onTabKey:function(e){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.hide()},onEnter:function(e){De(e,{position:"absolute"}),this.position(),this.autoZIndex&&oe.set("menu",e,this.baseZIndex+this.$primevue.config.zIndex.menu)},onAfterEnter:function(){this.bindOutsideClickListener(),this.bindResizeListener(),this.$emit("show"),j(this.list)},onLeave:function(){this.$emit("hide"),this.container=null},onAfterLeave:function(e){this.autoZIndex&&oe.clear(e),this.unbindOutsideClickListener(),this.unbindResizeListener()},position:function(){var e=this.pageX+1,n=this.pageY+1,o=this.container.offsetParent?this.container.offsetWidth:Ke(this.container),a=this.container.offsetParent?this.container.offsetHeight:Ae(this.container),i=Re(),r=window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0,m=window.scrollX||document.documentElement.scrollLeft||document.body.scrollLeft||0;e+o-m>i.width&&(e-=o),n+a-r>i.height&&(n-=a),e<m&&(e=m),n<r&&(n=r),this.container.style.left=e+"px",this.container.style.top=n+"px"},bindOutsideClickListener:function(){var e=this;this.outsideClickListener||(this.outsideClickListener=function(n){var o=e.container&&!e.container.contains(n.target),a=e.visible?!(e.target&&(e.target===n.target||e.target.contains(n.target))):!0;o&&a&&e.hide()},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindResizeListener:function(){var e=this;this.resizeListener||(this.resizeListener=function(){e.visible&&!$e()&&e.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},bindDocumentContextMenuListener:function(){var e=this;this.documentContextMenuListener||(this.documentContextMenuListener=function(n){n.button===2&&e.show(n)},document.addEventListener("contextmenu",this.documentContextMenuListener))},unbindDocumentContextMenuListener:function(){this.documentContextMenuListener&&(document.removeEventListener("contextmenu",this.documentContextMenuListener),this.documentContextMenuListener=null)},bindMatchMediaListener:function(){var e=this;if(!this.matchMediaListener){var n=matchMedia("(max-width: ".concat(this.breakpoint,")"));this.query=n,this.queryMatches=n.matches,this.matchMediaListener=function(){e.queryMatches=n.matches},this.query.addEventListener("change",this.matchMediaListener)}},unbindMatchMediaListener:function(){this.matchMediaListener&&(this.query.removeEventListener("change",this.matchMediaListener),this.matchMediaListener=null)},isItemMatched:function(e){var n;return this.isValidItem(e)&&((n=this.getProccessedItemLabel(e))===null||n===void 0?void 0:n.toLocaleLowerCase().startsWith(this.searchValue.toLocaleLowerCase()))},isValidItem:function(e){return!!e&&!this.isItemDisabled(e.item)&&!this.isItemSeparator(e.item)&&this.isItemVisible(e.item)},isValidSelectedItem:function(e){return this.isValidItem(e)&&this.isSelected(e)},isSelected:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},findFirstItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidItem(n)})},findLastItemIndex:function(){var e=this;return de(this.visibleItems,function(n){return e.isValidItem(n)})},findNextItemIndex:function(e){var n=this,o=e<this.visibleItems.length-1?this.visibleItems.slice(e+1).findIndex(function(a){return n.isValidItem(a)}):-1;return o>-1?o+e+1:e},findPrevItemIndex:function(e){var n=this,o=e>0?de(this.visibleItems.slice(0,e),function(a){return n.isValidItem(a)}):-1;return o>-1?o:e},findSelectedItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidSelectedItem(n)})},findFirstFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findFirstItemIndex():e},findLastFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findLastItemIndex():e},searchItems:function(e,n){var o=this;this.searchValue=(this.searchValue||"")+n;var a=-1,i=!1;return this.focusedItemInfo.index!==-1?(a=this.visibleItems.slice(this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}),a=a===-1?this.visibleItems.slice(0,this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}):a+this.focusedItemInfo.index):a=this.visibleItems.findIndex(function(r){return o.isItemMatched(r)}),a!==-1&&(i=!0),a===-1&&this.focusedItemInfo.index===-1&&(a=this.findFirstFocusedItemIndex()),a!==-1&&this.changeFocusedItemIndex(e,a),this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(function(){o.searchValue="",o.searchTimeout=null},500),i},changeFocusedItemIndex:function(e,n){this.focusedItemInfo.index!==n&&(this.focusedItemInfo.index=n,this.scrollInView())},scrollInView:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:-1,n=e!==-1?"".concat(this.$id,"_").concat(e):this.focusedItemIdx,o=ie(this.list,'li[id="'.concat(n,'"]'));o&&o.scrollIntoView&&o.scrollIntoView({block:"nearest",inline:"start"})},createProcessedItems:function(e){var n=this,o=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:"",r=[];return e&&e.forEach(function(m,h){var s=(i!==""?i+"_":"")+h,c={item:m,index:h,level:o,key:s,parent:a,parentKey:i};c.items=n.createProcessedItems(m.items,o+1,c,s),r.push(c)}),r},containerRef:function(e){this.container=e},listRef:function(e){this.list=e?e.$el:void 0}},computed:{processedItems:function(){return this.createProcessedItems(this.model||[])},visibleItems:function(){var e=this,n=this.activeItemPath.find(function(o){return o.key===e.focusedItemInfo.parentKey});return n?n.items:this.processedItems},focusedItemIdx:function(){return this.focusedItemInfo.index!==-1?"".concat(this.$id).concat(N(this.focusedItemInfo.parentKey)?"_"+this.focusedItemInfo.parentKey:"","_").concat(this.focusedItemInfo.index):null}},components:{ContextMenuSub:Le,Portal:Ce}};function rt(t,e,n,o,a,i){var r=Z("ContextMenuSub"),m=Z("Portal");return d(),A(m,{appendTo:t.appendTo},{default:D(function(){return[V(be,y({name:"p-contextmenu",onEnter:i.onEnter,onAfterEnter:i.onAfterEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},t.ptm("transition")),{default:D(function(){return[a.visible?(d(),v("div",y({key:0,ref:i.containerRef,class:t.cx("root")},t.ptmi("root")),[V(r,{ref:i.listRef,id:t.$id+"_list",class:O(t.cx("rootList")),role:"menubar",root:!0,tabindex:t.tabindex,"aria-orientation":"vertical","aria-activedescendant":a.focused?i.focusedItemIdx:void 0,menuId:t.$id,focusedItemId:a.focused?i.focusedItemIdx:void 0,items:i.processedItems,templates:t.$slots,activeItemPath:a.activeItemPath,"aria-labelledby":t.ariaLabelledby,"aria-label":t.ariaLabel,level:0,visible:a.submenuVisible,pt:t.pt,unstyled:t.unstyled,onFocus:i.onFocus,onBlur:i.onBlur,onKeydown:i.onKeyDown,onItemClick:i.onItemClick,onItemMouseenter:i.onItemMouseEnter,onItemMousemove:i.onItemMouseMove},null,8,["id","class","tabindex","aria-activedescendant","menuId","focusedItemId","items","templates","activeItemPath","aria-labelledby","aria-label","visible","pt","unstyled","onFocus","onBlur","onKeydown","onItemClick","onItemMouseenter","onItemMousemove"])],16)):K("",!0)]}),_:1},16,["onEnter","onAfterEnter","onLeave","onAfterLeave"])]}),_:1},8,["appendTo"])}Me.render=rt;var ut=({dt:t})=>`
.p-inputgroup,
.p-inputgroup .p-iconfield,
.p-inputgroup .p-floatlabel,
.p-inputgroup .p-iftalabel {
    display: flex;
    align-items: stretch;
    width: 100%;
}

.p-inputgroup .p-inputtext,
.p-inputgroup .p-inputwrapper {
    flex: 1 1 auto;
    width: 1%;
}

.p-inputgroupaddon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${t("inputgroup.addon.padding")};
    background: ${t("inputgroup.addon.background")};
    color: ${t("inputgroup.addon.color")};
    border-block-start: 1px solid ${t("inputgroup.addon.border.color")};
    border-block-end: 1px solid ${t("inputgroup.addon.border.color")};
    min-width: ${t("inputgroup.addon.min.width")};
}

.p-inputgroupaddon:first-child,
.p-inputgroupaddon + .p-inputgroupaddon {
    border-inline-start: 1px solid ${t("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:last-child {
    border-inline-end: 1px solid ${t("inputgroup.addon.border.color")};
}

.p-inputgroupaddon:has(.p-button) {
    padding: 0;
    overflow: hidden;
}

.p-inputgroupaddon .p-button {
    border-radius: 0;
}

.p-inputgroup > .p-component,
.p-inputgroup > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iconfield > .p-component,
.p-inputgroup > .p-floatlabel > .p-component,
.p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel > .p-component,
.p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
    border-radius: 0;
    margin: 0;
}

.p-inputgroupaddon:first-child,
.p-inputgroup > .p-component:first-child,
.p-inputgroup > .p-inputwrapper:first-child > .p-component,
.p-inputgroup > .p-iconfield:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-component,
.p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-component,
.p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
    border-start-start-radius: ${t("inputgroup.addon.border.radius")};
    border-end-start-radius: ${t("inputgroup.addon.border.radius")};
}

.p-inputgroupaddon:last-child,
.p-inputgroup > .p-component:last-child,
.p-inputgroup > .p-inputwrapper:last-child > .p-component,
.p-inputgroup > .p-iconfield:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-component,
.p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-component,
.p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
    border-start-end-radius: ${t("inputgroup.addon.border.radius")};
    border-end-end-radius: ${t("inputgroup.addon.border.radius")};
}

.p-inputgroup .p-component:focus,
.p-inputgroup .p-component.p-focus,
.p-inputgroup .p-inputwrapper-focus,
.p-inputgroup .p-component:focus ~ label,
.p-inputgroup .p-component.p-focus ~ label,
.p-inputgroup .p-inputwrapper-focus ~ label {
    z-index: 1;
}

.p-inputgroup > .p-button:not(.p-button-icon-only) {
    width: auto;
}

.p-inputgroup .p-iconfield + .p-iconfield .p-inputtext {
    border-inline-start: 0;
}
`,ct={root:"p-inputgroup"},lt=ce.extend({name:"inputgroup",style:ut,classes:ct}),dt={name:"BaseInputGroup",extends:J,style:lt,provide:function(){return{$pcInputGroup:this,$parentInstance:this}}},ke={name:"InputGroup",extends:dt,inheritAttrs:!1};function mt(t,e,n,o,a,i){return d(),v("div",y({class:t.cx("root")},t.ptmi("root")),[q(t.$slots,"default")],16)}ke.render=mt;var pt={root:"p-inputgroupaddon"},ht=ce.extend({name:"inputgroupaddon",classes:pt}),ft={name:"BaseInputGroupAddon",extends:J,style:ht,provide:function(){return{$pcInputGroupAddon:this,$parentInstance:this}}},Pe={name:"InputGroupAddon",extends:ft,inheritAttrs:!1};function gt(t,e,n,o,a,i){return d(),v("div",y({class:t.cx("root")},t.ptmi("root")),[q(t.$slots,"default")],16)}Pe.render=gt;class vt extends we{constructor(){super("api")}async ping(){return(await this.post("ping",{})).data}}class It extends we{constructor(){super("match")}async createMatch(e,n){return this.post("create",{target:n,entity:e})}async acceptMatch(e){return this.post("accept",{matchId:e})}async decline(e){return this.post("decline",{matchId:e})}}const bt=" Would like to battle",xt=()=>{const t=new It,e=ee();async function n(i,r){try{return await t.createMatch(i,r)}catch{e.toast.error("Something went wrong","top-left")}}async function o(i){try{return await t.acceptMatch(i)}catch{e.toast.error("Something went wrong","top-left")}}async function a(i){try{return await t.decline(i)}catch{e.toast.error("Something went wrong","top-left")}}return{challenge:n,accept:o,decline:a}},yt=t=>{function e(o,a,i){if(!a.trim()||!o)return;if((i==null?void 0:i.type)===E.WHISPER){n(o,a,i.target);return}const r={type:(i==null?void 0:i.type)||E.MESSAGE,content:{message:a},channel:(i==null?void 0:i.channel)||"global",timestamp:new Date().toISOString(),client:o,metadata:i==null?void 0:i.metadata};t(JSON.stringify(r))}function n(o,a,i){if(!a.trim()||!o||!i)return;const r={type:E.WHISPER,content:{message:a,target:i},channel:"global",timestamp:new Date().toISOString(),client:o};t(JSON.stringify(r))}return{sendMessage:e,sendWhisper:n}},ue=t=>{const e=x(()=>Y.ToPascalCase(t.channel??"server")),n=x(()=>t.client??t.content.client),o=x(()=>t.type),a=x(()=>t.content),i=x(()=>o.value===E.MESSAGE||o.value===E.WHISPER||o.value===E.BROADCAST),r=x(()=>o.value===E.WHISPER),m=x(()=>o.value===E.BROADCAST),h=x(()=>o.value===E.PROMPT),s=x(()=>o.value==E.SYSTEM),c=x(()=>o.value===E.ERROR),l=x(()=>o.value.includes(".")),p=x(()=>{var C,$;return l.value?"System":((C=n.value)==null?void 0:C.name)||(($=n.value)==null?void 0:$.id)||"System"}),L=x(()=>(Y.Log(`[${t.url}] - Heartbeat received`),o.value==="pong")),_=x(()=>t.timestamp?new Date(t.timestamp).toLocaleTimeString():"???");function S(C){return o.value===C}return{data:t,room:e,client:n,type:o,content:a,isSystemMessage:s,isErrorMessage:c,isGenericMessage:l,sender:p,formattedTime:_,isMessage:i,isWhisper:r,isBroadcast:m,isPrompt:h,isHeartbeat:L,is:S}},wt=()=>{const t=ze("prompt",void 0,{static_instance:!0});function e(o){t.$next("prompt",o)}function n(){t.$next("clear",{})}return{next:e,clear:n}},Lt=t=>{const e=wt();t.is(E.SYSTEM)&&console.log(t.data),t.is(E.ERROR)&&console.log(t.data),t.is("match")&&e.next({message:bt,from:t.client.value,time:10,metadata:t.data,callback:(n,o)=>{o.metadata&&console.log(n,o.metadata)}})},Mt="wss://topsyde-gaming.duckdns.org:3000",fe=20,kt=(t,e)=>{const n=w({interval:fe*1e3,pongTimeout:fe*1e3,message:"ping"}),o=w({retries:1,delay:1e3,onFailed:s});function a(c,l,p){const L=p?p.data:"";Y.Log(`[${l.url}] - ${c}:`,L)}function i(c,l){try{const p=JSON.parse(l.data),L=ue(p);L.isMessage.value?(a("Received message",c,l),e.value.push(L.data)):Lt(L)}catch(p){console.log(JSON.stringify(l.data)),console.log(p)}}function r(c){var p;a("Connected",c);const l=((p=t.value)==null?void 0:p.name)||"Guest";e.value.push({type:"system",content:{message:`Connected to chat server as ${l}`},timestamp:new Date().toISOString()})}function m(c,l){var p;Y.Log(`[${c.url}] - Disconnected!`,c.readyState,l),e.value.push({type:"system",content:{message:`Disconnected from chat server (code: ${l.code})`,client:{id:((p=t.value)==null?void 0:p.id)||"Guest",name:"Guest"}},timestamp:new Date().toISOString()})}function h(c,l){Y.Warn(`[${c.url}] - WebSocket error:`,l),e.value.push({type:"error",content:{message:"Error with chat connection"},timestamp:new Date().toISOString()})}function s(){Y.Warn("Failed to connect WebSocket after multiple retries"),e.value.push({type:"error",content:{message:"Failed to reconnect to the server after multiple attempts"},timestamp:new Date().toISOString()})}return{autoReconnect:o.value,heartbeat:n.value,onConnected:r,onDisconnected:m,onMessage:i,onError:h,protocols:t.value?[`${t.value.id}-${t.value.name}`]:void 0}},Pt={class:"timestamp"},St={class:"message-content"},Ct={key:1,class:"ml-2"},Et={key:3,class:"ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"},_t={key:4,class:"pi pi-angle-right ml-auto"},$t=te({__name:"ChatMessage",props:{message:{}},emits:["whisper","match"],setup(t,{emit:e}){const n=t,o=e,{room:a,content:i,isSystemMessage:r,isErrorMessage:m,isGenericMessage:h,sender:s,formattedTime:c,client:l}=ue(n.message),p=ee(),L=ue(n.message),_=w(),S=w([{label:"Whisper",icon:"pi pi-comment",command:()=>o("whisper",l.value)},{label:"Match",icon:"pi pi-bolt",command:()=>o("match",l.value)}]),C=$=>{$.stopPropagation(),$.preventDefault(),!L.isSystemMessage.value&&_.value.show($)};return($,U)=>{const X=Z("ChatMessage",!0),G=ve("ripple");return g(p).guards.IsArray(g(i).message)?(d(!0),v(W,{key:0},Q(g(i).message,(P,z)=>(d(),v("div",{key:z},[V(X,{message:P},null,8,["message"])]))),128)):(d(),v("div",{key:1,class:"message",onContextmenu:C},[b("span",Pt,"["+T(g(c))+" - "+T(g(a))+"]",1),b("span",{class:O(["sender",{"system-indicator":g(r),"error-indicator":g(m),"generic-indicator":g(h)}])},T(g(s))+":",3),b("span",St,T(g(i).message),1),V(g(Me),{ref_key:"menu",ref:_,model:S.value},{item:D(({item:P,props:z})=>[Ie((d(),v("a",y({class:""},z.action),[P.icon?(d(),v("span",{key:0,class:O(P.icon)},null,2)):K("",!0),P.label?(d(),v("span",Ct,T(P.label),1)):K("",!0),P.badge?(d(),A(g(Fe),{key:2,class:"ml-auto",value:P.badge},null,8,["value"])):K("",!0),P.shortcut?(d(),v("span",Et,T(P.shortcut),1)):K("",!0),P.items?(d(),v("i",_t)):K("",!0)],16)),[[G]])]),_:1},8,["model"])],32))}}}),Kt=ne($t,[["__scopeId","data-v-85f6b685"]]),At={class:"window-title"},Rt={class:"window-controls"},Dt={class:"window-content"},Tt=["onMousedown"],Ot=te({__name:"ChatWindow",props:{storageKey:{},initialPosition:{},initialSize:{},minWidth:{},minHeight:{},containerRef:{}},emits:["logout"],setup(t){We(u=>({cb5608c0:`${c()}px`,55613476:`${l()}px`,"5f10bbd7":i.value?`${i.value.left}px`:"0","718b694c":i.value?`${S.value}px`:"0","0712d1a4":i.value?`${i.value.width}px`:"100%"}));const e=t,n=w(null),o=pe(`${e.storageKey}-position`,e.initialPosition??{x:20,y:20}),a=pe(`${e.storageKey}-size`,e.initialSize??{width:600,height:500}),i=w(null),r=w(!1),m=w(!1),h=w(null),s=w({x:0,y:0}),c=()=>e.minWidth??300,l=()=>e.minHeight??200;ae(()=>e.containerRef,p,{immediate:!0});function p(){var u;i.value=((u=e.containerRef)==null?void 0:u.getBoundingClientRect())??null}function L(){if(!n.value)return;const u=n.value.getBoundingClientRect(),f=i.value??{left:0,top:0,width:window.innerWidth,height:window.innerHeight},I=f.left+f.width-u.width,k=f.top+f.height-u.height;o.value={x:Math.max(f.left,Math.min(I,o.value.x)),y:Math.max(f.top,Math.min(k,o.value.y))}}const _=x(()=>window.innerWidth<=1024),S=x(()=>i.value?window.innerHeight-i.value.bottom:0);function C(u){_.value||(r.value=!0,s.value={x:u.clientX-o.value.x,y:u.clientY-o.value.y},p(),z("drag"))}function $(u){var F;if(!r.value)return;const f=u.clientX-s.value.x,I=u.clientY-s.value.y,k=i.value,R=(F=n.value)==null?void 0:F.getBoundingClientRect();if(k&&R){const B=k.left+k.width-R.width,Se=k.top+k.height-R.height;o.value={x:Math.max(k.left,Math.min(B,f)),y:Math.max(k.top,Math.min(Se,I))}}else o.value={x:Math.max(0,Math.min(window.innerWidth-a.value.width,f)),y:Math.max(0,Math.min(window.innerHeight-a.value.height,I))}}function U(){r.value=!1,H("drag")}function X(u){_.value||(m.value=!0,h.value=u,p(),z("resize"))}function G(u){if(!m.value||!n.value)return;const f=n.value.getBoundingClientRect(),I=i.value;let k=a.value.width,R=a.value.height,F=o.value.y;if(h.value==="bottom-right")k=Math.max(c(),u.clientX-f.left),R=Math.max(l(),u.clientY-f.top);else if(h.value==="top-right"){k=Math.max(c(),u.clientX-f.left);const B=f.top-u.clientY;R=Math.max(l(),f.height+B),R>l()&&(F=u.clientY)}if(I){if(h.value==="bottom-right")k=Math.min(k,I.left+I.width-f.left),R=Math.min(R,I.top+I.height-f.top);else if(h.value==="top-right"){k=Math.min(k,I.left+I.width-f.left);const B=f.bottom-I.top;R>B&&(R=B,F=I.top),F=Math.max(F,I.top)}}a.value={width:k,height:R},h.value==="top-right"&&(o.value={...o.value,y:F}),L()}function P(){m.value=!1,h.value=null,H("resize")}function z(u){u==="drag"?(document.addEventListener("mousemove",$),document.addEventListener("mouseup",U)):(document.addEventListener("mousemove",G),document.addEventListener("mouseup",P))}function H(u){u==="drag"?(document.removeEventListener("mousemove",$),document.removeEventListener("mouseup",U)):(document.removeEventListener("mousemove",G),document.removeEventListener("mouseup",P))}function M(){p(),L()}return le(()=>{window.addEventListener("resize",M),setTimeout(()=>{L(),_.value&&i.value&&(o.value={x:i.value.left,y:i.value.bottom-a.value.height})})}),ae(i,u=>{_.value&&u&&(o.value={x:u.left,y:u.bottom-a.value.height})},{deep:!0}),xe(()=>{H("drag"),H("resize"),window.removeEventListener("resize",M)}),(u,f)=>(d(),v("div",{class:"chat-window",style:Ve({position:"fixed",left:`${g(o).x}px`,top:`${g(o).y}px`,width:`${g(a).width}px`,height:`${g(a).height}px`}),ref_key:"windowRef",ref:n},[b("div",{class:"window-header",onMousedown:C},[b("div",At,[q(u.$slots,"title",{},()=>[f[1]||(f[1]=re("Window"))],!0)]),b("div",Rt,[q(u.$slots,"controls",{},void 0,!0),V(g(ye),{class:"p-button-rounded p-button-text p-button-sm logout-button",icon:"pi pi-sign-out",onClick:f[0]||(f[0]=he(I=>u.$emit("logout"),["stop"])),title:"Logout"})])],32),b("div",Dt,[q(u.$slots,"default",{},void 0,!0)]),(d(),v(W,null,Q(["bottom-right","top-right"],I=>b("div",{key:I,class:O(["resize-handle",I]),onMousedown:he(k=>X(I),["prevent"])},null,42,Tt)),64))],4))}}),zt=ne(Ot,[["__scopeId","data-v-7b2cafe5"]]),Ft={class:"client-name"},Vt={class:"chat-content"},Wt={class:"input-area"},Gt={class:"input-wrapper"},Ht={class:"flex align-items-center gap-2 whisper-indicator"},Bt=te({__name:"Chat",props:{client:{},containerRef:{}},emits:["logout"],setup(t,{emit:e}){const n=t,o=e,a=new vt,i=ee(),r=w([]),m=w(""),h=w(null),s=w("broadcast"),c=w(null),l=kt(w(n.client),r),{status:p,send:L,close:_}=Ge(Mt,l),S=yt(L),C=x(()=>s.value==="whisper");function $(M){S.sendMessage(n.client,M||m.value,{type:C.value?E.WHISPER:E.BROADCAST,target:c.value}),m.value="",s.value="broadcast",P(null)}function U(){_(),o("logout"),i.lib.Log("User logged out:",n.client)}function X(){h.value&&h.value.scrollTo({top:h.value.scrollHeight,behavior:"smooth"})}function G(M){i.lib.Log("Whispering to:",M),s.value="whisper",P(M)}function P(M){c.value=M}function z(M){i.lib.Log("Matching with:",M),xt().challenge(n.client,M)}async function H(){await a.ping().then(()=>{$("Hello, world!")}).catch(M=>{i.toast.error("Error pinging API: "+M)})}return ae(r,()=>Be(()=>{X()}),{deep:!0}),le(()=>{H(),i.lib.Log("Chat mounted with client:",n.client)}),xe(()=>_()),(M,u)=>(d(),A(zt,{"container-ref":M.containerRef,storageKey:"chat",minWidth:300,minHeight:200,initialSize:{width:600,height:500},onLogout:U},{title:D(()=>[u[3]||(u[3]=re("Connected as: ")),b("span",Ft,T(M.client?`(${M.client.name})`:""),1)]),controls:D(()=>[b("div",{class:O(["status-indicator",g(p)])},null,2)]),default:D(()=>[b("div",Vt,[b("div",{ref_key:"messagesContainer",ref:h,class:"messages"},[(d(!0),v(W,null,Q(r.value,(f,I)=>(d(),A(Kt,{onWhisper:G,onMatch:z,key:I,message:f},null,8,["message"]))),128))],512),b("div",Wt,[b("div",Gt,[V(g(ke),null,{default:D(()=>[C.value?(d(),A(g(Pe),{key:0},{default:D(()=>{var f;return[b("div",Ht,[u[4]||(u[4]=b("i",{class:"pi pi-user"},null,-1)),b("span",null,"Whisper: "+T((f=c.value)==null?void 0:f.name),1)])]}),_:1})):K("",!0),V(g(Ue),{modelValue:m.value,"onUpdate:modelValue":u[0]||(u[0]=f=>m.value=f),onKeyup:u[1]||(u[1]=He(()=>$(),["enter"])),class:O({"whisper-indicator":C.value}),placeholder:"Enter message...",disabled:g(p)!=="OPEN"},null,8,["modelValue","class","disabled"])]),_:1}),V(g(ye),{onClick:u[2]||(u[2]=()=>$()),disabled:g(p)!=="OPEN"||!m.value.trim()},{default:D(()=>u[5]||(u[5]=[re(" Send ")])),_:1},8,["disabled"])])])])]),_:1},8,["container-ref"]))}}),Nt=ne(Bt,[["__scopeId","data-v-ee88e3fa"]]),Yt={class:"match flex column gap large"},Ut={key:0,class:"loading-container"},Xt=te({__name:"Match",setup(t){const e=new Xe("api","https://topsyde-gaming.duckdns.org:3000"),n=ee(),o=Ne("viewportRef"),a=w(!0),i=w(null),r=Ye(),m=x(()=>r.username),h=x(()=>r.password),s=x(()=>"r_d_25c9dd62-ba12-44de-b303-67ef659ba7bd"),c=w(!n.lib.IsEmpty(m.value));document.documentElement.style.setProperty("--match-bg-url","url(/client_rune_dictionary/match.webp)");function p(S){r.username=S.username,L()}async function L(){try{if(c.value=!0,a.value=!0,n.lib.IsEmpty(m.value)||n.lib.IsEmpty(h.value)||n.lib.IsEmpty(s.value))throw new Error("Invalid credentials");const S=await e.handshake(m.value,h.value,s.value);if(!S.status)throw new Error("Invalid handshake response");i.value={id:S.data.id,name:S.data.name},n.lib.Log("Handshake successful - client data:",i.value),a.value=!1}catch(S){c.value=!1,n.toast.error("Handshake failed:"),n.lib.Warn("Handshake failed:",S)}}function _(){i.value=null,r.username="",c.value=!1,n.lib.Log("User logged out, returning to login screen")}return le(()=>{c.value&&L()}),(S,C)=>(d(),v("div",Yt,[b("div",{class:O(["viewport",{background:c.value}]),ref_key:"viewportRef",ref:o},[c.value?(d(),v(W,{key:0},[a.value?(d(),v("div",Ut,C[0]||(C[0]=[b("div",{class:"loading-spinner"},null,-1),b("p",null,"Connecting to chat server...",-1)]))):i.value?(d(),A(Nt,{key:1,"container-ref":g(o),client:i.value,onLogout:_},null,8,["container-ref","client"])):K("",!0)],64)):(d(),A(qe,{key:1,title:"Start Chat",onSubmit:p}))],2)]))}}),Jt=ne(Xt,[["__scopeId","data-v-63e1d032"]]);export{Jt as default};
