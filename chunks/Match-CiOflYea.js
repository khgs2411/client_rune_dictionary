import{B as ge,s as Ee,L as _e}from"./LoginForm-m-r-4Je8.js";import{B as ce,C as $e,R as Ke,D as Ae,E as J,i as N,G as ie,H as de,I as Re,J as De,K as Te,L as Oe,Z as oe,M as j,N as ze,O as me,P as Fe,Q as ve,m as y,S as Ve,p as Z,r as Ie,v as A,o as d,y as D,c as v,j as K,F as W,q as Q,b,w as be,T as se,n as O,t as T,U as xe,e as V,h as q,a as ee,V as _,W as x,X as Y,Y as We,A as w,d as te,f as g,$ as Ge,_ as ne,a0 as pe,a1 as ae,a2 as le,a3 as ye,a4 as Be,a5 as he,a6 as we,a7 as He,a8 as re,a9 as Ne,aa as Ye,ab as Ue,ac as Xe,u as qe}from"./index-BP3zyFpF.js";import"./index-DF1ASrjw.js";var Ze=({dt:t})=>`
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
`,je={root:function(e){var n=e.instance;return["p-contextmenu p-component",{"p-contextmenu-mobile":n.queryMatches}]},rootList:"p-contextmenu-root-list",item:function(e){var n=e.instance,o=e.processedItem;return["p-contextmenu-item",{"p-contextmenu-item-active":n.isItemActive(o),"p-focus":n.isItemFocused(o),"p-disabled":n.isItemDisabled(o)}]},itemContent:"p-contextmenu-item-content",itemLink:"p-contextmenu-item-link",itemIcon:"p-contextmenu-item-icon",itemLabel:"p-contextmenu-item-label",submenuIcon:"p-contextmenu-submenu-icon",submenu:"p-contextmenu-submenu",separator:"p-contextmenu-separator"},Je=ce.extend({name:"contextmenu",style:Ze,classes:je}),Qe={name:"BaseContextMenu",extends:J,props:{model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},global:{type:Boolean,default:!1},breakpoint:{type:String,default:"960px"},tabindex:{type:Number,default:0},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:Je,provide:function(){return{$pcContextMenu:this,$parentInstance:this}}},Le={name:"ContextMenuSub",hostName:"ContextMenu",extends:J,emits:["item-click","item-mouseenter","item-mousemove"],props:{items:{type:Array,default:null},menuId:{type:String,default:null},focusedItemId:{type:String,default:null},root:{type:Boolean,default:!1},visible:{type:Boolean,default:!1},level:{type:Number,default:0},templates:{type:Object,default:null},activeItemPath:{type:Object,default:null},tabindex:{type:Number,default:0}},methods:{getItemId:function(e){return"".concat(this.menuId,"_").concat(e.key)},getItemKey:function(e){return this.getItemId(e)},getItemProp:function(e,n,o){return e&&e.item?ve(e.item[n],o):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},getItemLabelId:function(e){return"".concat(this.menuId,"_").concat(e.key,"_label")},getPTOptions:function(e,n,o){return this.ptm(e,{context:{item:n.item,active:this.isItemActive(n),focused:this.isItemFocused(n),disabled:this.isItemDisabled(n),index:o}})},isItemActive:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemFocused:function(e){return this.focusedItemId===this.getItemId(e)},isItemGroup:function(e){return N(e.items)},onItemClick:function(e,n){this.getItemProp(n,"command",{originalEvent:e,item:n.item}),this.$emit("item-click",{originalEvent:e,processedItem:n,isFocus:!0})},onItemMouseEnter:function(e,n){this.$emit("item-mouseenter",{originalEvent:e,processedItem:n})},onItemMouseMove:function(e,n){this.$emit("item-mousemove",{originalEvent:e,processedItem:n,isFocus:!0})},getAriaSetSize:function(){var e=this;return this.items.filter(function(n){return e.isItemVisible(n)&&!e.getItemProp(n,"separator")}).length},getAriaPosInset:function(e){var n=this;return e-this.items.slice(0,e).filter(function(o){return n.isItemVisible(o)&&n.getItemProp(o,"separator")}).length+1},onEnter:function(){Ve(this.$refs.container,this.level)},getMenuItemProps:function(e,n){return{action:y({class:this.cx("itemLink"),tabindex:-1},this.getPTOptions("itemLink",e,n)),icon:y({class:[this.cx("itemIcon"),this.getItemProp(e,"icon")]},this.getPTOptions("itemIcon",e,n)),label:y({class:this.cx("itemLabel")},this.getPTOptions("itemLabel",e,n)),submenuicon:y({class:this.cx("submenuIcon")},this.getPTOptions("submenuicon",e,n))}}},components:{AngleRightIcon:Ae},directives:{ripple:Ke}},et=["tabindex"],tt=["id","aria-label","aria-disabled","aria-expanded","aria-haspopup","aria-level","aria-setsize","aria-posinset","data-p-active","data-p-focused","data-p-disabled"],nt=["onClick","onMouseenter","onMousemove"],it=["href","target"],ot=["id"],st=["id"];function at(t,e,n,o,s,i){var r=Z("AngleRightIcon"),m=Z("ContextMenuSub",!0),f=Ie("ripple");return d(),A(xe,y({name:"p-contextmenusub",onEnter:i.onEnter},t.ptm("menu.transition")),{default:D(function(){return[n.root||n.visible?(d(),v("ul",y({key:0,ref:"container",tabindex:n.tabindex},t.ptm("rootList")),[(d(!0),v(W,null,Q(n.items,function(a,c){return d(),v(W,{key:i.getItemKey(a)},[i.isItemVisible(a)&&!i.getItemProp(a,"separator")?(d(),v("li",y({key:0,id:i.getItemId(a),style:i.getItemProp(a,"style"),class:[t.cx("item",{processedItem:a}),i.getItemProp(a,"class")],role:"menuitem","aria-label":i.getItemLabel(a),"aria-disabled":i.isItemDisabled(a)||void 0,"aria-expanded":i.isItemGroup(a)?i.isItemActive(a):void 0,"aria-haspopup":i.isItemGroup(a)&&!i.getItemProp(a,"to")?"menu":void 0,"aria-level":n.level+1,"aria-setsize":i.getAriaSetSize(),"aria-posinset":i.getAriaPosInset(c),ref_for:!0},i.getPTOptions("item",a,c),{"data-p-active":i.isItemActive(a),"data-p-focused":i.isItemFocused(a),"data-p-disabled":i.isItemDisabled(a)}),[b("div",y({class:t.cx("itemContent"),onClick:function(p){return i.onItemClick(p,a)},onMouseenter:function(p){return i.onItemMouseEnter(p,a)},onMousemove:function(p){return i.onItemMouseMove(p,a)},ref_for:!0},i.getPTOptions("itemContent",a,c)),[n.templates.item?(d(),A(se(n.templates.item),{key:1,item:a.item,hasSubmenu:i.getItemProp(a,"items"),label:i.getItemLabel(a),props:i.getMenuItemProps(a,c)},null,8,["item","hasSubmenu","label","props"])):be((d(),v("a",y({key:0,href:i.getItemProp(a,"url"),class:t.cx("itemLink"),target:i.getItemProp(a,"target"),tabindex:"-1",ref_for:!0},i.getPTOptions("itemLink",a,c)),[n.templates.itemicon?(d(),A(se(n.templates.itemicon),{key:0,item:a.item,class:O(t.cx("itemIcon"))},null,8,["item","class"])):i.getItemProp(a,"icon")?(d(),v("span",y({key:1,class:[t.cx("itemIcon"),i.getItemProp(a,"icon")],ref_for:!0},i.getPTOptions("itemIcon",a,c)),null,16)):K("",!0),b("span",y({id:i.getItemLabelId(a),class:t.cx("itemLabel"),ref_for:!0},i.getPTOptions("itemLabel",a,c)),T(i.getItemLabel(a)),17,ot),i.getItemProp(a,"items")?(d(),v(W,{key:2},[n.templates.submenuicon?(d(),A(se(n.templates.submenuicon),{key:0,active:i.isItemActive(a),class:O(t.cx("submenuIcon"))},null,8,["active","class"])):(d(),A(r,y({key:1,class:t.cx("submenuIcon"),ref_for:!0},i.getPTOptions("submenuicon",a,c)),null,16,["class"]))],64)):K("",!0)],16,it)),[[f]])],16,nt),i.isItemVisible(a)&&i.isItemGroup(a)?(d(),A(m,y({key:0,id:i.getItemId(a)+"_list",role:"menu",class:t.cx("submenu"),menuId:n.menuId,focusedItemId:n.focusedItemId,items:a.items,templates:n.templates,activeItemPath:n.activeItemPath,level:n.level+1,visible:i.isItemActive(a)&&i.isItemGroup(a),pt:t.pt,unstyled:t.unstyled,onItemClick:e[0]||(e[0]=function(l){return t.$emit("item-click",l)}),onItemMouseenter:e[1]||(e[1]=function(l){return t.$emit("item-mouseenter",l)}),onItemMousemove:e[2]||(e[2]=function(l){return t.$emit("item-mousemove",l)}),"aria-labelledby":i.getItemLabelId(a),ref_for:!0},t.ptm("submenu")),null,16,["id","class","menuId","focusedItemId","items","templates","activeItemPath","level","visible","pt","unstyled","aria-labelledby"])):K("",!0)],16,tt)):K("",!0),i.isItemVisible(a)&&i.getItemProp(a,"separator")?(d(),v("li",y({key:1,id:i.getItemId(a),style:i.getItemProp(a,"style"),class:[t.cx("separator"),i.getItemProp(a,"class")],role:"separator",ref_for:!0},t.ptm("separator")),null,16,st)):K("",!0)],64)}),128))],16,et)):K("",!0)]}),_:1},16,["onEnter"])}Le.render=at;var Me={name:"ContextMenu",extends:Qe,inheritAttrs:!1,emits:["focus","blur","show","hide","before-show","before-hide"],target:null,outsideClickListener:null,resizeListener:null,documentContextMenuListener:null,matchMediaListener:null,pageX:null,pageY:null,container:null,list:null,data:function(){return{focused:!1,focusedItemInfo:{index:-1,level:0,parentKey:""},activeItemPath:[],visible:!1,submenuVisible:!1,query:null,queryMatches:!1}},watch:{activeItemPath:function(e){N(e)?(this.bindOutsideClickListener(),this.bindResizeListener()):this.visible||(this.unbindOutsideClickListener(),this.unbindResizeListener())}},mounted:function(){this.bindMatchMediaListener(),this.global&&this.bindDocumentContextMenuListener()},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.unbindDocumentContextMenuListener(),this.unbindMatchMediaListener(),this.container&&this.autoZIndex&&oe.clear(this.container),this.target=null,this.container=null},methods:{getItemProp:function(e,n){return e?ve(e[n]):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemGroup:function(e){return N(this.getItemProp(e,"items"))},isItemSeparator:function(e){return this.getItemProp(e,"separator")},getProccessedItemLabel:function(e){return e?this.getItemLabel(e.item):void 0},isProccessedItemGroup:function(e){return e&&N(e.items)},toggle:function(e){this.visible?this.hide():this.show(e)},show:function(e){this.$emit("before-show"),this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""},j(this.list),this.pageX=e.pageX,this.pageY=e.pageY,this.visible?this.position():this.visible=!0,e.stopPropagation(),e.preventDefault()},hide:function(){this.$emit("before-hide"),this.visible=!1,this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""}},onFocus:function(e){this.focused=!0,this.focusedItemInfo=this.focusedItemInfo.index!==-1?this.focusedItemInfo:{index:-1,level:0,parentKey:""},this.$emit("focus",e)},onBlur:function(e){this.focused=!1,this.focusedItemInfo={index:-1,level:0,parentKey:""},this.searchValue="",this.$emit("blur",e)},onKeyDown:function(e){var n=e.metaKey||e.ctrlKey;switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"ArrowLeft":this.onArrowLeftKey(e);break;case"ArrowRight":this.onArrowRightKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Space":this.onSpaceKey(e);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"PageDown":case"PageUp":case"Backspace":case"ShiftLeft":case"ShiftRight":break;default:!n&&Fe(e.key)&&this.searchItems(e,e.key);break}},onItemChange:function(e,n){var o=e.processedItem,s=e.isFocus;if(!me(o)){var i=o.index,r=o.key,m=o.level,f=o.parentKey,a=o.items,c=N(a),l=this.activeItemPath.filter(function(p){return p.parentKey!==f&&p.parentKey!==r});c&&(l.push(o),this.submenuVisible=!0),this.focusedItemInfo={index:i,level:m,parentKey:f},s&&j(this.list),!(n==="hover"&&this.queryMatches)&&(this.activeItemPath=l)}},onItemClick:function(e){var n=e.processedItem,o=this.isProccessedItemGroup(n),s=this.isSelected(n);if(s){var i=n.index,r=n.key,m=n.level,f=n.parentKey;this.activeItemPath=this.activeItemPath.filter(function(a){return r!==a.key&&r.startsWith(a.key)}),this.focusedItemInfo={index:i,level:m,parentKey:f},j(this.list)}else o?this.onItemChange(e):this.hide()},onItemMouseEnter:function(e){this.onItemChange(e,"hover")},onItemMouseMove:function(e){this.focused&&this.changeFocusedItemIndex(e,e.processedItem.index)},onArrowDownKey:function(e){var n=this.focusedItemInfo.index!==-1?this.findNextItemIndex(this.focusedItemInfo.index):this.findFirstFocusedItemIndex();this.changeFocusedItemIndex(e,n),e.preventDefault()},onArrowUpKey:function(e){if(e.altKey){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.popup&&this.hide(),e.preventDefault()}else{var s=this.focusedItemInfo.index!==-1?this.findPrevItemIndex(this.focusedItemInfo.index):this.findLastFocusedItemIndex();this.changeFocusedItemIndex(e,s),e.preventDefault()}},onArrowLeftKey:function(e){var n=this,o=this.visibleItems[this.focusedItemInfo.index],s=this.activeItemPath.find(function(r){return r.key===o.parentKey}),i=me(o.parent);i||(this.focusedItemInfo={index:-1,parentKey:s?s.parentKey:""},this.searchValue="",this.onArrowDownKey(e)),this.activeItemPath=this.activeItemPath.filter(function(r){return r.parentKey!==n.focusedItemInfo.parentKey}),e.preventDefault()},onArrowRightKey:function(e){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);o&&(this.onItemChange({originalEvent:e,processedItem:n}),this.focusedItemInfo={index:-1,parentKey:n.key},this.searchValue="",this.onArrowDownKey(e)),e.preventDefault()},onHomeKey:function(e){this.changeFocusedItemIndex(e,this.findFirstItemIndex()),e.preventDefault()},onEndKey:function(e){this.changeFocusedItemIndex(e,this.findLastItemIndex()),e.preventDefault()},onEnterKey:function(e){if(this.focusedItemInfo.index!==-1){var n=ie(this.list,'li[id="'.concat("".concat(this.focusedItemIdx),'"]')),o=n&&ie(n,'[data-pc-section="itemlink"]');o?o.click():n&&n.click();var s=this.visibleItems[this.focusedItemInfo.index],i=this.isProccessedItemGroup(s);!i&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex())}e.preventDefault()},onSpaceKey:function(e){this.onEnterKey(e)},onEscapeKey:function(e){this.hide(),!this.popup&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex()),e.preventDefault()},onTabKey:function(e){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.hide()},onEnter:function(e){ze(e,{position:"absolute"}),this.position(),this.autoZIndex&&oe.set("menu",e,this.baseZIndex+this.$primevue.config.zIndex.menu)},onAfterEnter:function(){this.bindOutsideClickListener(),this.bindResizeListener(),this.$emit("show"),j(this.list)},onLeave:function(){this.$emit("hide"),this.container=null},onAfterLeave:function(e){this.autoZIndex&&oe.clear(e),this.unbindOutsideClickListener(),this.unbindResizeListener()},position:function(){var e=this.pageX+1,n=this.pageY+1,o=this.container.offsetParent?this.container.offsetWidth:De(this.container),s=this.container.offsetParent?this.container.offsetHeight:Te(this.container),i=Oe(),r=window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0,m=window.scrollX||document.documentElement.scrollLeft||document.body.scrollLeft||0;e+o-m>i.width&&(e-=o),n+s-r>i.height&&(n-=s),e<m&&(e=m),n<r&&(n=r),this.container.style.left=e+"px",this.container.style.top=n+"px"},bindOutsideClickListener:function(){var e=this;this.outsideClickListener||(this.outsideClickListener=function(n){var o=e.container&&!e.container.contains(n.target),s=e.visible?!(e.target&&(e.target===n.target||e.target.contains(n.target))):!0;o&&s&&e.hide()},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindResizeListener:function(){var e=this;this.resizeListener||(this.resizeListener=function(){e.visible&&!Re()&&e.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},bindDocumentContextMenuListener:function(){var e=this;this.documentContextMenuListener||(this.documentContextMenuListener=function(n){n.button===2&&e.show(n)},document.addEventListener("contextmenu",this.documentContextMenuListener))},unbindDocumentContextMenuListener:function(){this.documentContextMenuListener&&(document.removeEventListener("contextmenu",this.documentContextMenuListener),this.documentContextMenuListener=null)},bindMatchMediaListener:function(){var e=this;if(!this.matchMediaListener){var n=matchMedia("(max-width: ".concat(this.breakpoint,")"));this.query=n,this.queryMatches=n.matches,this.matchMediaListener=function(){e.queryMatches=n.matches},this.query.addEventListener("change",this.matchMediaListener)}},unbindMatchMediaListener:function(){this.matchMediaListener&&(this.query.removeEventListener("change",this.matchMediaListener),this.matchMediaListener=null)},isItemMatched:function(e){var n;return this.isValidItem(e)&&((n=this.getProccessedItemLabel(e))===null||n===void 0?void 0:n.toLocaleLowerCase().startsWith(this.searchValue.toLocaleLowerCase()))},isValidItem:function(e){return!!e&&!this.isItemDisabled(e.item)&&!this.isItemSeparator(e.item)&&this.isItemVisible(e.item)},isValidSelectedItem:function(e){return this.isValidItem(e)&&this.isSelected(e)},isSelected:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},findFirstItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidItem(n)})},findLastItemIndex:function(){var e=this;return de(this.visibleItems,function(n){return e.isValidItem(n)})},findNextItemIndex:function(e){var n=this,o=e<this.visibleItems.length-1?this.visibleItems.slice(e+1).findIndex(function(s){return n.isValidItem(s)}):-1;return o>-1?o+e+1:e},findPrevItemIndex:function(e){var n=this,o=e>0?de(this.visibleItems.slice(0,e),function(s){return n.isValidItem(s)}):-1;return o>-1?o:e},findSelectedItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidSelectedItem(n)})},findFirstFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findFirstItemIndex():e},findLastFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findLastItemIndex():e},searchItems:function(e,n){var o=this;this.searchValue=(this.searchValue||"")+n;var s=-1,i=!1;return this.focusedItemInfo.index!==-1?(s=this.visibleItems.slice(this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}),s=s===-1?this.visibleItems.slice(0,this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}):s+this.focusedItemInfo.index):s=this.visibleItems.findIndex(function(r){return o.isItemMatched(r)}),s!==-1&&(i=!0),s===-1&&this.focusedItemInfo.index===-1&&(s=this.findFirstFocusedItemIndex()),s!==-1&&this.changeFocusedItemIndex(e,s),this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(function(){o.searchValue="",o.searchTimeout=null},500),i},changeFocusedItemIndex:function(e,n){this.focusedItemInfo.index!==n&&(this.focusedItemInfo.index=n,this.scrollInView())},scrollInView:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:-1,n=e!==-1?"".concat(this.$id,"_").concat(e):this.focusedItemIdx,o=ie(this.list,'li[id="'.concat(n,'"]'));o&&o.scrollIntoView&&o.scrollIntoView({block:"nearest",inline:"start"})},createProcessedItems:function(e){var n=this,o=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,s=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:"",r=[];return e&&e.forEach(function(m,f){var a=(i!==""?i+"_":"")+f,c={item:m,index:f,level:o,key:a,parent:s,parentKey:i};c.items=n.createProcessedItems(m.items,o+1,c,a),r.push(c)}),r},containerRef:function(e){this.container=e},listRef:function(e){this.list=e?e.$el:void 0}},computed:{processedItems:function(){return this.createProcessedItems(this.model||[])},visibleItems:function(){var e=this,n=this.activeItemPath.find(function(o){return o.key===e.focusedItemInfo.parentKey});return n?n.items:this.processedItems},focusedItemIdx:function(){return this.focusedItemInfo.index!==-1?"".concat(this.$id).concat(N(this.focusedItemInfo.parentKey)?"_"+this.focusedItemInfo.parentKey:"","_").concat(this.focusedItemInfo.index):null}},components:{ContextMenuSub:Le,Portal:$e}};function rt(t,e,n,o,s,i){var r=Z("ContextMenuSub"),m=Z("Portal");return d(),A(m,{appendTo:t.appendTo},{default:D(function(){return[V(xe,y({name:"p-contextmenu",onEnter:i.onEnter,onAfterEnter:i.onAfterEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},t.ptm("transition")),{default:D(function(){return[s.visible?(d(),v("div",y({key:0,ref:i.containerRef,class:t.cx("root")},t.ptmi("root")),[V(r,{ref:i.listRef,id:t.$id+"_list",class:O(t.cx("rootList")),role:"menubar",root:!0,tabindex:t.tabindex,"aria-orientation":"vertical","aria-activedescendant":s.focused?i.focusedItemIdx:void 0,menuId:t.$id,focusedItemId:s.focused?i.focusedItemIdx:void 0,items:i.processedItems,templates:t.$slots,activeItemPath:s.activeItemPath,"aria-labelledby":t.ariaLabelledby,"aria-label":t.ariaLabel,level:0,visible:s.submenuVisible,pt:t.pt,unstyled:t.unstyled,onFocus:i.onFocus,onBlur:i.onBlur,onKeydown:i.onKeyDown,onItemClick:i.onItemClick,onItemMouseenter:i.onItemMouseEnter,onItemMousemove:i.onItemMouseMove},null,8,["id","class","tabindex","aria-activedescendant","menuId","focusedItemId","items","templates","activeItemPath","aria-labelledby","aria-label","visible","pt","unstyled","onFocus","onBlur","onKeydown","onItemClick","onItemMouseenter","onItemMousemove"])],16)):K("",!0)]}),_:1},16,["onEnter","onAfterEnter","onLeave","onAfterLeave"])]}),_:1},8,["appendTo"])}Me.render=rt;var ut=({dt:t})=>`
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
`,ct={root:"p-inputgroup"},lt=ce.extend({name:"inputgroup",style:ut,classes:ct}),dt={name:"BaseInputGroup",extends:J,style:lt,provide:function(){return{$pcInputGroup:this,$parentInstance:this}}},ke={name:"InputGroup",extends:dt,inheritAttrs:!1};function mt(t,e,n,o,s,i){return d(),v("div",y({class:t.cx("root")},t.ptmi("root")),[q(t.$slots,"default")],16)}ke.render=mt;var pt={root:"p-inputgroupaddon"},ht=ce.extend({name:"inputgroupaddon",classes:pt}),ft={name:"BaseInputGroupAddon",extends:J,style:ht,provide:function(){return{$pcInputGroupAddon:this,$parentInstance:this}}},Pe={name:"InputGroupAddon",extends:ft,inheritAttrs:!1};function gt(t,e,n,o,s,i){return d(),v("div",y({class:t.cx("root")},t.ptmi("root")),[q(t.$slots,"default")],16)}Pe.render=gt;class Se extends ge{constructor(){super("api","http://localhost:3000")}async ping(){return(await this.post("ping",{})).data}async handshake(e,n,o){return(await this.post("handshake",{username:e,password:n,api_key:o})).data}}class vt extends ge{constructor(){super("match","http://localhost:3000")}async createMatch(e,n){return this.post("create",{target:n,entity:e})}async acceptMatch(e){return this.post("accept",{matchId:e})}async decline(e){return this.post("decline",{matchId:e})}}const It=" Would like to battle",bt=()=>{const t=new vt,e=ee();async function n(i,r){try{return await t.createMatch(i,r)}catch{e.toast.error("Something went wrong","top-left")}}async function o(i){try{return await t.acceptMatch(i)}catch{e.toast.error("Something went wrong","top-left")}}async function s(i){try{return await t.decline(i)}catch{e.toast.error("Something went wrong","top-left")}}return{challenge:n,accept:o,decline:s}},xt=t=>{function e(o,s,i){if(!s.trim()||!o)return;if((i==null?void 0:i.type)===_.WHISPER){n(o,s,i.target);return}const r={type:(i==null?void 0:i.type)||_.MESSAGE,content:{message:s},channel:(i==null?void 0:i.channel)||"global",timestamp:new Date().toISOString(),client:o,metadata:i==null?void 0:i.metadata};t(JSON.stringify(r))}function n(o,s,i){if(!s.trim()||!o||!i)return;const r={type:_.WHISPER,content:{message:s,target:i},channel:"global",timestamp:new Date().toISOString(),client:o};t(JSON.stringify(r))}return{sendMessage:e,sendWhisper:n}},ue=t=>{const e=x(()=>Y.ToPascalCase(t.channel??"server")),n=x(()=>t.client??t.content.client),o=x(()=>t.type),s=x(()=>t.content),i=x(()=>o.value===_.MESSAGE||o.value===_.WHISPER||o.value===_.BROADCAST),r=x(()=>o.value===_.WHISPER),m=x(()=>o.value===_.BROADCAST),f=x(()=>o.value===_.PROMPT),a=x(()=>o.value==_.SYSTEM),c=x(()=>o.value===_.ERROR),l=x(()=>o.value.includes(".")),p=x(()=>{var E,$;return l.value?"System":((E=n.value)==null?void 0:E.name)||(($=n.value)==null?void 0:$.id)||"System"}),L=x(()=>(Y.Log(`[${t.url}] - Heartbeat received`),o.value==="pong")),C=x(()=>t.timestamp?new Date(t.timestamp).toLocaleTimeString():"???");function M(E){return o.value===E}return{data:t,room:e,client:n,type:o,content:s,isSystemMessage:a,isErrorMessage:c,isGenericMessage:l,sender:p,formattedTime:C,isMessage:i,isWhisper:r,isBroadcast:m,isPrompt:f,isHeartbeat:L,is:M}},yt=()=>{const t=We("prompt",void 0,{static_instance:!0});function e(o){t.$next("prompt",o)}function n(){t.$next("clear",{})}return{next:e,clear:n}},wt=t=>{const e=yt();t.is(_.SYSTEM)&&console.log(t.data),t.is(_.ERROR)&&console.log(t.data),t.is("match")&&e.next({message:It,from:t.client.value,time:10,metadata:t.data,callback:(n,o)=>{o.metadata&&console.log(n,o.metadata)}})},fe=20,Lt="ws://localhost:3000",Mt=(t,e)=>{const n=w({interval:fe*1e3,pongTimeout:fe*1e3,message:"ping"}),o=w({retries:20,delay:1e3,onFailed:a});function s(c,l,p){const L=p?p.data:"";Y.Log(`[${l.url}] - ${c}:`,L)}function i(c,l){try{const p=JSON.parse(l.data),L=ue(p);L.isMessage.value?(s("Received message",c,l),e.value.push(L.data)):wt(L)}catch(p){console.log(JSON.stringify(l.data)),console.log(p)}}function r(c){var p;s("Connected",c);const l=((p=t.value)==null?void 0:p.name)||"Guest";e.value.push({type:"system",content:{message:`Connected to chat server as ${l}`},timestamp:new Date().toISOString()})}function m(c,l){var p;Y.Log(`[${c.url}] - Disconnected!`,c.readyState,l),e.value.push({type:"system",content:{message:`Disconnected from chat server (code: ${l.code})`,client:{id:((p=t.value)==null?void 0:p.id)||"Guest",name:"Guest"}},timestamp:new Date().toISOString()})}function f(c,l){Y.Warn(`[${c.url}] - WebSocket error:`,l),e.value.push({type:"error",content:{message:"Error with chat connection"},timestamp:new Date().toISOString()})}function a(){Y.Warn("Failed to connect WebSocket after multiple retries"),e.value.push({type:"error",content:{message:"Failed to reconnect to the server after multiple attempts"},timestamp:new Date().toISOString()})}return{autoReconnect:o.value,heartbeat:n.value,onConnected:r,onDisconnected:m,onMessage:i,onError:f,protocols:t.value?[`${t.value.id}-${t.value.name}`]:void 0}},kt={class:"timestamp"},Pt={class:"message-content"},St={key:1,class:"ml-2"},Ct={key:3,class:"ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"},Et={key:4,class:"pi pi-angle-right ml-auto"},_t=te({__name:"ChatMessage",props:{message:{}},emits:["whisper","match"],setup(t,{emit:e}){const n=t,o=e,{room:s,content:i,isSystemMessage:r,isErrorMessage:m,isGenericMessage:f,sender:a,formattedTime:c,client:l}=ue(n.message),p=ee(),L=ue(n.message),C=w(),M=w([{label:"Whisper",icon:"pi pi-comment",command:()=>o("whisper",l.value)},{label:"Match",icon:"pi pi-bolt",command:()=>o("match",l.value)}]),E=$=>{$.stopPropagation(),$.preventDefault(),!L.isSystemMessage.value&&C.value.show($)};return($,U)=>{const X=Z("ChatMessage",!0),G=Ie("ripple");return g(p).guards.IsArray(g(i).message)?(d(!0),v(W,{key:0},Q(g(i).message,(S,z)=>(d(),v("div",{key:z},[V(X,{message:S},null,8,["message"])]))),128)):(d(),v("div",{key:1,class:"message",onContextmenu:E},[b("span",kt,"["+T(g(c))+" - "+T(g(s))+"]",1),b("span",{class:O(["sender",{"system-indicator":g(r),"error-indicator":g(m),"generic-indicator":g(f)}])},T(g(a))+":",3),b("span",Pt,T(g(i).message),1),V(g(Me),{ref_key:"menu",ref:C,model:M.value},{item:D(({item:S,props:z})=>[be((d(),v("a",y({class:""},z.action),[S.icon?(d(),v("span",{key:0,class:O(S.icon)},null,2)):K("",!0),S.label?(d(),v("span",St,T(S.label),1)):K("",!0),S.badge?(d(),A(g(Ge),{key:2,class:"ml-auto",value:S.badge},null,8,["value"])):K("",!0),S.shortcut?(d(),v("span",Ct,T(S.shortcut),1)):K("",!0),S.items?(d(),v("i",Et)):K("",!0)],16)),[[G]])]),_:1},8,["model"])],32))}}}),$t=ne(_t,[["__scopeId","data-v-85f6b685"]]),Kt={class:"window-title"},At={class:"window-controls"},Rt={class:"window-content"},Dt=["onMousedown"],Tt=te({__name:"ChatWindow",props:{storageKey:{},initialPosition:{},initialSize:{},minWidth:{},minHeight:{},containerRef:{}},emits:["logout"],setup(t){He(u=>({"86ac1316":`${c()}px`,"04cc74e0":`${l()}px`,"29fec16c":i.value?`${i.value.left}px`:"0","64aa5ca5":i.value?`${M.value}px`:"0","21e46b7a":i.value?`${i.value.width}px`:"100%"}));const e=t,n=w(null),o=pe(`${e.storageKey}-position`,e.initialPosition??{x:20,y:20}),s=pe(`${e.storageKey}-size`,e.initialSize??{width:600,height:500}),i=w(null),r=w(!1),m=w(!1),f=w(null),a=w({x:0,y:0}),c=()=>e.minWidth??300,l=()=>e.minHeight??200;ae(()=>e.containerRef,p,{immediate:!0});function p(){var u;i.value=((u=e.containerRef)==null?void 0:u.getBoundingClientRect())??null}function L(){if(!n.value)return;const u=n.value.getBoundingClientRect(),h=i.value??{left:0,top:0,width:window.innerWidth,height:window.innerHeight},I=h.left+h.width-u.width,P=h.top+h.height-u.height;o.value={x:Math.max(h.left,Math.min(I,o.value.x)),y:Math.max(h.top,Math.min(P,o.value.y))}}const C=x(()=>window.innerWidth<=1024),M=x(()=>i.value?window.innerHeight-i.value.bottom:0);function E(u){C.value||(r.value=!0,a.value={x:u.clientX-o.value.x,y:u.clientY-o.value.y},p(),z("drag"))}function $(u){var F;if(!r.value)return;const h=u.clientX-a.value.x,I=u.clientY-a.value.y,P=i.value,R=(F=n.value)==null?void 0:F.getBoundingClientRect();if(P&&R){const H=P.left+P.width-R.width,Ce=P.top+P.height-R.height;o.value={x:Math.max(P.left,Math.min(H,h)),y:Math.max(P.top,Math.min(Ce,I))}}else o.value={x:Math.max(0,Math.min(window.innerWidth-s.value.width,h)),y:Math.max(0,Math.min(window.innerHeight-s.value.height,I))}}function U(){r.value=!1,B("drag")}function X(u){C.value||(m.value=!0,f.value=u,p(),z("resize"))}function G(u){if(!m.value||!n.value)return;const h=n.value.getBoundingClientRect(),I=i.value;let P=s.value.width,R=s.value.height,F=o.value.y;if(f.value==="bottom-right")P=Math.max(c(),u.clientX-h.left),R=Math.max(l(),u.clientY-h.top);else if(f.value==="top-right"){P=Math.max(c(),u.clientX-h.left);const H=h.top-u.clientY;R=Math.max(l(),h.height+H),R>l()&&(F=u.clientY)}if(I){if(f.value==="bottom-right")P=Math.min(P,I.left+I.width-h.left),R=Math.min(R,I.top+I.height-h.top);else if(f.value==="top-right"){P=Math.min(P,I.left+I.width-h.left);const H=h.bottom-I.top;R>H&&(R=H,F=I.top),F=Math.max(F,I.top)}}s.value={width:P,height:R},f.value==="top-right"&&(o.value={...o.value,y:F}),L()}function S(){m.value=!1,f.value=null,B("resize")}function z(u){u==="drag"?(document.addEventListener("mousemove",$),document.addEventListener("mouseup",U)):(document.addEventListener("mousemove",G),document.addEventListener("mouseup",S))}function B(u){u==="drag"?(document.removeEventListener("mousemove",$),document.removeEventListener("mouseup",U)):(document.removeEventListener("mousemove",G),document.removeEventListener("mouseup",S))}function k(){p(),L()}return le(()=>{L(),window.addEventListener("resize",k),C.value&&i.value&&(o.value={x:i.value.left,y:i.value.bottom-s.value.height})}),ae(i,u=>{C.value&&u&&(o.value={x:u.left,y:u.bottom-s.value.height})},{deep:!0}),ye(()=>{B("drag"),B("resize"),window.removeEventListener("resize",k)}),(u,h)=>(d(),v("div",{class:"chat-window",style:Be({position:"fixed",left:`${g(o).x}px`,top:`${g(o).y}px`,width:`${g(s).width}px`,height:`${g(s).height}px`}),ref_key:"windowRef",ref:n},[b("div",{class:"window-header",onMousedown:E},[b("div",Kt,[q(u.$slots,"title",{},()=>[h[1]||(h[1]=re("Window"))],!0)]),b("div",At,[q(u.$slots,"controls",{},void 0,!0),V(g(we),{class:"p-button-rounded p-button-text p-button-sm logout-button",icon:"pi pi-sign-out",onClick:h[0]||(h[0]=he(I=>u.$emit("logout"),["stop"])),title:"Logout"})])],32),b("div",Rt,[q(u.$slots,"default",{},void 0,!0)]),(d(),v(W,null,Q(["bottom-right","top-right"],I=>b("div",{key:I,class:O(["resize-handle",I]),onMousedown:he(P=>X(I),["prevent"])},null,42,Dt)),64))],4))}}),Ot=ne(Tt,[["__scopeId","data-v-70936a20"]]),zt={class:"client-name"},Ft={class:"chat-content"},Vt={class:"input-area"},Wt={class:"input-wrapper"},Gt={class:"flex align-items-center gap-2 whisper-indicator"},Bt=te({__name:"Chat",props:{client:{},containerRef:{}},emits:["logout"],setup(t,{emit:e}){const n=t,o=e,s=new Se,i=ee(),r=w([]),m=w(""),f=w(null),a=Mt(w(n.client),r),{status:c,send:l,close:p}=Ne(Lt,a),L=xt(l),C=w("broadcast"),M=w(null),E=x(()=>C.value==="whisper");function $(k){L.sendMessage(n.client,k||m.value,{type:E.value?_.WHISPER:_.BROADCAST,target:M.value}),m.value="",C.value="broadcast",S(null)}function U(){p(),o("logout"),i.lib.Log("User logged out:",n.client)}function X(){f.value&&f.value.scrollTo({top:f.value.scrollHeight,behavior:"smooth"})}function G(k){i.lib.Log("Whispering to:",k),C.value="whisper",S(k)}function S(k){M.value=k}function z(k){i.lib.Log("Matching with:",k),bt().challenge(n.client,k)}async function B(){await s.ping().then(()=>{$("Hello, world!")}).catch(k=>{i.toast.error("Error pinging API: "+k)})}return ae(r,()=>Ue(()=>{X()}),{deep:!0}),le(()=>{B(),i.lib.Log("Chat mounted with client:",n.client)}),ye(()=>p()),(k,u)=>(d(),A(Ot,{"container-ref":k.containerRef,storageKey:"chat",minWidth:300,minHeight:200,initialSize:{width:600,height:500},onLogout:U},{title:D(()=>[u[3]||(u[3]=re("Connected as: ")),b("span",zt,T(k.client?`(${k.client.name})`:""),1)]),controls:D(()=>[b("div",{class:O(["status-indicator",g(c)])},null,2)]),default:D(()=>[b("div",Ft,[b("div",{ref_key:"messagesContainer",ref:f,class:"messages"},[(d(!0),v(W,null,Q(r.value,(h,I)=>(d(),A($t,{onWhisper:G,onMatch:z,key:I,message:h},null,8,["message"]))),128))],512),b("div",Vt,[b("div",Wt,[V(g(ke),null,{default:D(()=>[E.value?(d(),A(g(Pe),{key:0},{default:D(()=>{var h;return[b("div",Gt,[u[4]||(u[4]=b("i",{class:"pi pi-user"},null,-1)),b("span",null,"Whisper: "+T((h=M.value)==null?void 0:h.name),1)])]}),_:1})):K("",!0),V(g(Ee),{modelValue:m.value,"onUpdate:modelValue":u[0]||(u[0]=h=>m.value=h),onKeyup:u[1]||(u[1]=Ye(()=>$(),["enter"])),class:O({"whisper-indicator":E.value}),placeholder:"Enter message...",disabled:g(c)!=="OPEN"},null,8,["modelValue","class","disabled"])]),_:1}),V(g(we),{onClick:u[2]||(u[2]=()=>$()),disabled:g(c)!=="OPEN"||!m.value.trim()},{default:D(()=>u[5]||(u[5]=[re(" Send ")])),_:1},8,["disabled"])])])])]),_:1},8,["container-ref"]))}}),Ht=ne(Bt,[["__scopeId","data-v-a7dfd6a3"]]),Nt={class:"match flex column gap large"},Yt={key:0,class:"loading-container"},Ut=te({__name:"Match",setup(t){const e=new Se,n=ee(),o=Xe("viewportRef"),s=w(!0),i=w(null),r=qe(),m=x(()=>r.username),f=x(()=>r.password),a=x(()=>"r_d_25c9dd62-ba12-44de-b303-67ef659ba7bd"),c=w(!n.lib.IsEmpty(m.value));document.documentElement.style.setProperty("--match-bg-url","url(/client_rune_dictionary/match.webp)");function p(M){r.username=M.username,L()}async function L(){try{c.value=!0,s.value=!0;const M=await e.handshake(m.value,f.value,a.value);if(!M.status)throw new Error("Invalid handshake response");i.value={id:M.data.id,name:M.data.name},n.lib.Log("Handshake successful - client data:",i.value),s.value=!1}catch(M){c.value=!1,n.lib.Warn("Handshake failed:",M)}}function C(){i.value=null,r.username="",c.value=!1,n.lib.Log("User logged out, returning to login screen")}return le(()=>{c.value&&L()}),(M,E)=>(d(),v("div",Nt,[b("div",{class:O(["viewport",{background:c.value}]),ref_key:"viewportRef",ref:o},[c.value?(d(),v(W,{key:0},[s.value?(d(),v("div",Yt,E[0]||(E[0]=[b("div",{class:"loading-spinner"},null,-1),b("p",null,"Connecting to chat server...",-1)]))):i.value?(d(),A(Ht,{key:1,"container-ref":g(o),client:i.value,onLogout:C},null,8,["container-ref","client"])):K("",!0)],64)):(d(),A(_e,{key:1,title:"Start Chat",onSubmit:p}))],2)]))}}),jt=ne(Ut,[["__scopeId","data-v-7c0dc3f4"]]);export{jt as default};
