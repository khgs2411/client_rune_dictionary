import{B as ue,C as Se,R as Ce,D as Ee,E as j,i as B,G as ne,H as le,I as _e,J as Ke,K as $e,L as Ae,Z as ie,M as Z,N as Re,O as de,P as De,Q as fe,m as w,S as Te,p as U,r as ge,v as $,o as m,y as D,c as I,j as K,F as V,q as J,b,w as ve,T as oe,n as O,t as T,U as Ie,e as F,h as Y,a as Q,V as C,W as y,X as N,Y as Oe,A as L,d as ee,f as v,$ as ze,_ as te,a0 as me,a1 as se,a2 as ce,a3 as be,a4 as Fe,a5 as pe,a6 as xe,a7 as Ve,a8 as ae,a9 as We,aa as Ge,ab as He,ac as Be,u as Ne}from"./index.CpNmOZPM.js";import{B as ye,s as Ye,A as Ue,L as Xe}from"./LoginForm.BzHMsZMp.js";import"./index.BCTvQpqj.js";var qe=({dt:t})=>`
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
`,Ze={root:function(e){var n=e.instance;return["p-contextmenu p-component",{"p-contextmenu-mobile":n.queryMatches}]},rootList:"p-contextmenu-root-list",item:function(e){var n=e.instance,o=e.processedItem;return["p-contextmenu-item",{"p-contextmenu-item-active":n.isItemActive(o),"p-focus":n.isItemFocused(o),"p-disabled":n.isItemDisabled(o)}]},itemContent:"p-contextmenu-item-content",itemLink:"p-contextmenu-item-link",itemIcon:"p-contextmenu-item-icon",itemLabel:"p-contextmenu-item-label",submenuIcon:"p-contextmenu-submenu-icon",submenu:"p-contextmenu-submenu",separator:"p-contextmenu-separator"},je=ue.extend({name:"contextmenu",style:qe,classes:Ze}),Je={name:"BaseContextMenu",extends:j,props:{model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},global:{type:Boolean,default:!1},breakpoint:{type:String,default:"960px"},tabindex:{type:Number,default:0},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:je,provide:function(){return{$pcContextMenu:this,$parentInstance:this}}},we={name:"ContextMenuSub",hostName:"ContextMenu",extends:j,emits:["item-click","item-mouseenter","item-mousemove"],props:{items:{type:Array,default:null},menuId:{type:String,default:null},focusedItemId:{type:String,default:null},root:{type:Boolean,default:!1},visible:{type:Boolean,default:!1},level:{type:Number,default:0},templates:{type:Object,default:null},activeItemPath:{type:Object,default:null},tabindex:{type:Number,default:0}},methods:{getItemId:function(e){return"".concat(this.menuId,"_").concat(e.key)},getItemKey:function(e){return this.getItemId(e)},getItemProp:function(e,n,o){return e&&e.item?fe(e.item[n],o):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},getItemLabelId:function(e){return"".concat(this.menuId,"_").concat(e.key,"_label")},getPTOptions:function(e,n,o){return this.ptm(e,{context:{item:n.item,active:this.isItemActive(n),focused:this.isItemFocused(n),disabled:this.isItemDisabled(n),index:o}})},isItemActive:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemFocused:function(e){return this.focusedItemId===this.getItemId(e)},isItemGroup:function(e){return B(e.items)},onItemClick:function(e,n){this.getItemProp(n,"command",{originalEvent:e,item:n.item}),this.$emit("item-click",{originalEvent:e,processedItem:n,isFocus:!0})},onItemMouseEnter:function(e,n){this.$emit("item-mouseenter",{originalEvent:e,processedItem:n})},onItemMouseMove:function(e,n){this.$emit("item-mousemove",{originalEvent:e,processedItem:n,isFocus:!0})},getAriaSetSize:function(){var e=this;return this.items.filter(function(n){return e.isItemVisible(n)&&!e.getItemProp(n,"separator")}).length},getAriaPosInset:function(e){var n=this;return e-this.items.slice(0,e).filter(function(o){return n.isItemVisible(o)&&n.getItemProp(o,"separator")}).length+1},onEnter:function(){Te(this.$refs.container,this.level)},getMenuItemProps:function(e,n){return{action:w({class:this.cx("itemLink"),tabindex:-1},this.getPTOptions("itemLink",e,n)),icon:w({class:[this.cx("itemIcon"),this.getItemProp(e,"icon")]},this.getPTOptions("itemIcon",e,n)),label:w({class:this.cx("itemLabel")},this.getPTOptions("itemLabel",e,n)),submenuicon:w({class:this.cx("submenuIcon")},this.getPTOptions("submenuicon",e,n))}}},components:{AngleRightIcon:Ee},directives:{ripple:Ce}},Qe=["tabindex"],et=["id","aria-label","aria-disabled","aria-expanded","aria-haspopup","aria-level","aria-setsize","aria-posinset","data-p-active","data-p-focused","data-p-disabled"],tt=["onClick","onMouseenter","onMousemove"],nt=["href","target"],it=["id"],ot=["id"];function st(t,e,n,o,a,i){var r=U("AngleRightIcon"),p=U("ContextMenuSub",!0),f=ge("ripple");return m(),$(Ie,w({name:"p-contextmenusub",onEnter:i.onEnter},t.ptm("menu.transition")),{default:D(function(){return[n.root||n.visible?(m(),I("ul",w({key:0,ref:"container",tabindex:n.tabindex},t.ptm("rootList")),[(m(!0),I(V,null,J(n.items,function(s,c){return m(),I(V,{key:i.getItemKey(s)},[i.isItemVisible(s)&&!i.getItemProp(s,"separator")?(m(),I("li",w({key:0,id:i.getItemId(s),style:i.getItemProp(s,"style"),class:[t.cx("item",{processedItem:s}),i.getItemProp(s,"class")],role:"menuitem","aria-label":i.getItemLabel(s),"aria-disabled":i.isItemDisabled(s)||void 0,"aria-expanded":i.isItemGroup(s)?i.isItemActive(s):void 0,"aria-haspopup":i.isItemGroup(s)&&!i.getItemProp(s,"to")?"menu":void 0,"aria-level":n.level+1,"aria-setsize":i.getAriaSetSize(),"aria-posinset":i.getAriaPosInset(c),ref_for:!0},i.getPTOptions("item",s,c),{"data-p-active":i.isItemActive(s),"data-p-focused":i.isItemFocused(s),"data-p-disabled":i.isItemDisabled(s)}),[b("div",w({class:t.cx("itemContent"),onClick:function(h){return i.onItemClick(h,s)},onMouseenter:function(h){return i.onItemMouseEnter(h,s)},onMousemove:function(h){return i.onItemMouseMove(h,s)},ref_for:!0},i.getPTOptions("itemContent",s,c)),[n.templates.item?(m(),$(oe(n.templates.item),{key:1,item:s.item,hasSubmenu:i.getItemProp(s,"items"),label:i.getItemLabel(s),props:i.getMenuItemProps(s,c)},null,8,["item","hasSubmenu","label","props"])):ve((m(),I("a",w({key:0,href:i.getItemProp(s,"url"),class:t.cx("itemLink"),target:i.getItemProp(s,"target"),tabindex:"-1",ref_for:!0},i.getPTOptions("itemLink",s,c)),[n.templates.itemicon?(m(),$(oe(n.templates.itemicon),{key:0,item:s.item,class:O(t.cx("itemIcon"))},null,8,["item","class"])):i.getItemProp(s,"icon")?(m(),I("span",w({key:1,class:[t.cx("itemIcon"),i.getItemProp(s,"icon")],ref_for:!0},i.getPTOptions("itemIcon",s,c)),null,16)):K("",!0),b("span",w({id:i.getItemLabelId(s),class:t.cx("itemLabel"),ref_for:!0},i.getPTOptions("itemLabel",s,c)),T(i.getItemLabel(s)),17,it),i.getItemProp(s,"items")?(m(),I(V,{key:2},[n.templates.submenuicon?(m(),$(oe(n.templates.submenuicon),{key:0,active:i.isItemActive(s),class:O(t.cx("submenuIcon"))},null,8,["active","class"])):(m(),$(r,w({key:1,class:t.cx("submenuIcon"),ref_for:!0},i.getPTOptions("submenuicon",s,c)),null,16,["class"]))],64)):K("",!0)],16,nt)),[[f]])],16,tt),i.isItemVisible(s)&&i.isItemGroup(s)?(m(),$(p,w({key:0,id:i.getItemId(s)+"_list",role:"menu",class:t.cx("submenu"),menuId:n.menuId,focusedItemId:n.focusedItemId,items:s.items,templates:n.templates,activeItemPath:n.activeItemPath,level:n.level+1,visible:i.isItemActive(s)&&i.isItemGroup(s),pt:t.pt,unstyled:t.unstyled,onItemClick:e[0]||(e[0]=function(l){return t.$emit("item-click",l)}),onItemMouseenter:e[1]||(e[1]=function(l){return t.$emit("item-mouseenter",l)}),onItemMousemove:e[2]||(e[2]=function(l){return t.$emit("item-mousemove",l)}),"aria-labelledby":i.getItemLabelId(s),ref_for:!0},t.ptm("submenu")),null,16,["id","class","menuId","focusedItemId","items","templates","activeItemPath","level","visible","pt","unstyled","aria-labelledby"])):K("",!0)],16,et)):K("",!0),i.isItemVisible(s)&&i.getItemProp(s,"separator")?(m(),I("li",w({key:1,id:i.getItemId(s),style:i.getItemProp(s,"style"),class:[t.cx("separator"),i.getItemProp(s,"class")],role:"separator",ref_for:!0},t.ptm("separator")),null,16,ot)):K("",!0)],64)}),128))],16,Qe)):K("",!0)]}),_:1},16,["onEnter"])}we.render=st;var Le={name:"ContextMenu",extends:Je,inheritAttrs:!1,emits:["focus","blur","show","hide","before-show","before-hide"],target:null,outsideClickListener:null,resizeListener:null,documentContextMenuListener:null,matchMediaListener:null,pageX:null,pageY:null,container:null,list:null,data:function(){return{focused:!1,focusedItemInfo:{index:-1,level:0,parentKey:""},activeItemPath:[],visible:!1,submenuVisible:!1,query:null,queryMatches:!1}},watch:{activeItemPath:function(e){B(e)?(this.bindOutsideClickListener(),this.bindResizeListener()):this.visible||(this.unbindOutsideClickListener(),this.unbindResizeListener())}},mounted:function(){this.bindMatchMediaListener(),this.global&&this.bindDocumentContextMenuListener()},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.unbindDocumentContextMenuListener(),this.unbindMatchMediaListener(),this.container&&this.autoZIndex&&ie.clear(this.container),this.target=null,this.container=null},methods:{getItemProp:function(e,n){return e?fe(e[n]):void 0},getItemLabel:function(e){return this.getItemProp(e,"label")},isItemDisabled:function(e){return this.getItemProp(e,"disabled")},isItemVisible:function(e){return this.getItemProp(e,"visible")!==!1},isItemGroup:function(e){return B(this.getItemProp(e,"items"))},isItemSeparator:function(e){return this.getItemProp(e,"separator")},getProccessedItemLabel:function(e){return e?this.getItemLabel(e.item):void 0},isProccessedItemGroup:function(e){return e&&B(e.items)},toggle:function(e){this.visible?this.hide():this.show(e)},show:function(e){this.$emit("before-show"),this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""},Z(this.list),this.pageX=e.pageX,this.pageY=e.pageY,this.visible?this.position():this.visible=!0,e.stopPropagation(),e.preventDefault()},hide:function(){this.$emit("before-hide"),this.visible=!1,this.activeItemPath=[],this.focusedItemInfo={index:-1,level:0,parentKey:""}},onFocus:function(e){this.focused=!0,this.focusedItemInfo=this.focusedItemInfo.index!==-1?this.focusedItemInfo:{index:-1,level:0,parentKey:""},this.$emit("focus",e)},onBlur:function(e){this.focused=!1,this.focusedItemInfo={index:-1,level:0,parentKey:""},this.searchValue="",this.$emit("blur",e)},onKeyDown:function(e){var n=e.metaKey||e.ctrlKey;switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"ArrowLeft":this.onArrowLeftKey(e);break;case"ArrowRight":this.onArrowRightKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Space":this.onSpaceKey(e);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Escape":this.onEscapeKey(e);break;case"Tab":this.onTabKey(e);break;case"PageDown":case"PageUp":case"Backspace":case"ShiftLeft":case"ShiftRight":break;default:!n&&De(e.key)&&this.searchItems(e,e.key);break}},onItemChange:function(e,n){var o=e.processedItem,a=e.isFocus;if(!de(o)){var i=o.index,r=o.key,p=o.level,f=o.parentKey,s=o.items,c=B(s),l=this.activeItemPath.filter(function(h){return h.parentKey!==f&&h.parentKey!==r});c&&(l.push(o),this.submenuVisible=!0),this.focusedItemInfo={index:i,level:p,parentKey:f},a&&Z(this.list),!(n==="hover"&&this.queryMatches)&&(this.activeItemPath=l)}},onItemClick:function(e){var n=e.processedItem,o=this.isProccessedItemGroup(n),a=this.isSelected(n);if(a){var i=n.index,r=n.key,p=n.level,f=n.parentKey;this.activeItemPath=this.activeItemPath.filter(function(s){return r!==s.key&&r.startsWith(s.key)}),this.focusedItemInfo={index:i,level:p,parentKey:f},Z(this.list)}else o?this.onItemChange(e):this.hide()},onItemMouseEnter:function(e){this.onItemChange(e,"hover")},onItemMouseMove:function(e){this.focused&&this.changeFocusedItemIndex(e,e.processedItem.index)},onArrowDownKey:function(e){var n=this.focusedItemInfo.index!==-1?this.findNextItemIndex(this.focusedItemInfo.index):this.findFirstFocusedItemIndex();this.changeFocusedItemIndex(e,n),e.preventDefault()},onArrowUpKey:function(e){if(e.altKey){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.popup&&this.hide(),e.preventDefault()}else{var a=this.focusedItemInfo.index!==-1?this.findPrevItemIndex(this.focusedItemInfo.index):this.findLastFocusedItemIndex();this.changeFocusedItemIndex(e,a),e.preventDefault()}},onArrowLeftKey:function(e){var n=this,o=this.visibleItems[this.focusedItemInfo.index],a=this.activeItemPath.find(function(r){return r.key===o.parentKey}),i=de(o.parent);i||(this.focusedItemInfo={index:-1,parentKey:a?a.parentKey:""},this.searchValue="",this.onArrowDownKey(e)),this.activeItemPath=this.activeItemPath.filter(function(r){return r.parentKey!==n.focusedItemInfo.parentKey}),e.preventDefault()},onArrowRightKey:function(e){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);o&&(this.onItemChange({originalEvent:e,processedItem:n}),this.focusedItemInfo={index:-1,parentKey:n.key},this.searchValue="",this.onArrowDownKey(e)),e.preventDefault()},onHomeKey:function(e){this.changeFocusedItemIndex(e,this.findFirstItemIndex()),e.preventDefault()},onEndKey:function(e){this.changeFocusedItemIndex(e,this.findLastItemIndex()),e.preventDefault()},onEnterKey:function(e){if(this.focusedItemInfo.index!==-1){var n=ne(this.list,'li[id="'.concat("".concat(this.focusedItemIdx),'"]')),o=n&&ne(n,'[data-pc-section="itemlink"]');o?o.click():n&&n.click();var a=this.visibleItems[this.focusedItemInfo.index],i=this.isProccessedItemGroup(a);!i&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex())}e.preventDefault()},onSpaceKey:function(e){this.onEnterKey(e)},onEscapeKey:function(e){this.hide(),!this.popup&&(this.focusedItemInfo.index=this.findFirstFocusedItemIndex()),e.preventDefault()},onTabKey:function(e){if(this.focusedItemInfo.index!==-1){var n=this.visibleItems[this.focusedItemInfo.index],o=this.isProccessedItemGroup(n);!o&&this.onItemChange({originalEvent:e,processedItem:n})}this.hide()},onEnter:function(e){Re(e,{position:"absolute"}),this.position(),this.autoZIndex&&ie.set("menu",e,this.baseZIndex+this.$primevue.config.zIndex.menu)},onAfterEnter:function(){this.bindOutsideClickListener(),this.bindResizeListener(),this.$emit("show"),Z(this.list)},onLeave:function(){this.$emit("hide"),this.container=null},onAfterLeave:function(e){this.autoZIndex&&ie.clear(e),this.unbindOutsideClickListener(),this.unbindResizeListener()},position:function(){var e=this.pageX+1,n=this.pageY+1,o=this.container.offsetParent?this.container.offsetWidth:Ke(this.container),a=this.container.offsetParent?this.container.offsetHeight:$e(this.container),i=Ae(),r=window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0,p=window.scrollX||document.documentElement.scrollLeft||document.body.scrollLeft||0;e+o-p>i.width&&(e-=o),n+a-r>i.height&&(n-=a),e<p&&(e=p),n<r&&(n=r),this.container.style.left=e+"px",this.container.style.top=n+"px"},bindOutsideClickListener:function(){var e=this;this.outsideClickListener||(this.outsideClickListener=function(n){var o=e.container&&!e.container.contains(n.target),a=e.visible?!(e.target&&(e.target===n.target||e.target.contains(n.target))):!0;o&&a&&e.hide()},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindResizeListener:function(){var e=this;this.resizeListener||(this.resizeListener=function(){e.visible&&!_e()&&e.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},bindDocumentContextMenuListener:function(){var e=this;this.documentContextMenuListener||(this.documentContextMenuListener=function(n){n.button===2&&e.show(n)},document.addEventListener("contextmenu",this.documentContextMenuListener))},unbindDocumentContextMenuListener:function(){this.documentContextMenuListener&&(document.removeEventListener("contextmenu",this.documentContextMenuListener),this.documentContextMenuListener=null)},bindMatchMediaListener:function(){var e=this;if(!this.matchMediaListener){var n=matchMedia("(max-width: ".concat(this.breakpoint,")"));this.query=n,this.queryMatches=n.matches,this.matchMediaListener=function(){e.queryMatches=n.matches},this.query.addEventListener("change",this.matchMediaListener)}},unbindMatchMediaListener:function(){this.matchMediaListener&&(this.query.removeEventListener("change",this.matchMediaListener),this.matchMediaListener=null)},isItemMatched:function(e){var n;return this.isValidItem(e)&&((n=this.getProccessedItemLabel(e))===null||n===void 0?void 0:n.toLocaleLowerCase().startsWith(this.searchValue.toLocaleLowerCase()))},isValidItem:function(e){return!!e&&!this.isItemDisabled(e.item)&&!this.isItemSeparator(e.item)&&this.isItemVisible(e.item)},isValidSelectedItem:function(e){return this.isValidItem(e)&&this.isSelected(e)},isSelected:function(e){return this.activeItemPath.some(function(n){return n.key===e.key})},findFirstItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidItem(n)})},findLastItemIndex:function(){var e=this;return le(this.visibleItems,function(n){return e.isValidItem(n)})},findNextItemIndex:function(e){var n=this,o=e<this.visibleItems.length-1?this.visibleItems.slice(e+1).findIndex(function(a){return n.isValidItem(a)}):-1;return o>-1?o+e+1:e},findPrevItemIndex:function(e){var n=this,o=e>0?le(this.visibleItems.slice(0,e),function(a){return n.isValidItem(a)}):-1;return o>-1?o:e},findSelectedItemIndex:function(){var e=this;return this.visibleItems.findIndex(function(n){return e.isValidSelectedItem(n)})},findFirstFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findFirstItemIndex():e},findLastFocusedItemIndex:function(){var e=this.findSelectedItemIndex();return e<0?this.findLastItemIndex():e},searchItems:function(e,n){var o=this;this.searchValue=(this.searchValue||"")+n;var a=-1,i=!1;return this.focusedItemInfo.index!==-1?(a=this.visibleItems.slice(this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}),a=a===-1?this.visibleItems.slice(0,this.focusedItemInfo.index).findIndex(function(r){return o.isItemMatched(r)}):a+this.focusedItemInfo.index):a=this.visibleItems.findIndex(function(r){return o.isItemMatched(r)}),a!==-1&&(i=!0),a===-1&&this.focusedItemInfo.index===-1&&(a=this.findFirstFocusedItemIndex()),a!==-1&&this.changeFocusedItemIndex(e,a),this.searchTimeout&&clearTimeout(this.searchTimeout),this.searchTimeout=setTimeout(function(){o.searchValue="",o.searchTimeout=null},500),i},changeFocusedItemIndex:function(e,n){this.focusedItemInfo.index!==n&&(this.focusedItemInfo.index=n,this.scrollInView())},scrollInView:function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:-1,n=e!==-1?"".concat(this.$id,"_").concat(e):this.focusedItemIdx,o=ne(this.list,'li[id="'.concat(n,'"]'));o&&o.scrollIntoView&&o.scrollIntoView({block:"nearest",inline:"start"})},createProcessedItems:function(e){var n=this,o=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},i=arguments.length>3&&arguments[3]!==void 0?arguments[3]:"",r=[];return e&&e.forEach(function(p,f){var s=(i!==""?i+"_":"")+f,c={item:p,index:f,level:o,key:s,parent:a,parentKey:i};c.items=n.createProcessedItems(p.items,o+1,c,s),r.push(c)}),r},containerRef:function(e){this.container=e},listRef:function(e){this.list=e?e.$el:void 0}},computed:{processedItems:function(){return this.createProcessedItems(this.model||[])},visibleItems:function(){var e=this,n=this.activeItemPath.find(function(o){return o.key===e.focusedItemInfo.parentKey});return n?n.items:this.processedItems},focusedItemIdx:function(){return this.focusedItemInfo.index!==-1?"".concat(this.$id).concat(B(this.focusedItemInfo.parentKey)?"_"+this.focusedItemInfo.parentKey:"","_").concat(this.focusedItemInfo.index):null}},components:{ContextMenuSub:we,Portal:Se}};function at(t,e,n,o,a,i){var r=U("ContextMenuSub"),p=U("Portal");return m(),$(p,{appendTo:t.appendTo},{default:D(function(){return[F(Ie,w({name:"p-contextmenu",onEnter:i.onEnter,onAfterEnter:i.onAfterEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},t.ptm("transition")),{default:D(function(){return[a.visible?(m(),I("div",w({key:0,ref:i.containerRef,class:t.cx("root")},t.ptmi("root")),[F(r,{ref:i.listRef,id:t.$id+"_list",class:O(t.cx("rootList")),role:"menubar",root:!0,tabindex:t.tabindex,"aria-orientation":"vertical","aria-activedescendant":a.focused?i.focusedItemIdx:void 0,menuId:t.$id,focusedItemId:a.focused?i.focusedItemIdx:void 0,items:i.processedItems,templates:t.$slots,activeItemPath:a.activeItemPath,"aria-labelledby":t.ariaLabelledby,"aria-label":t.ariaLabel,level:0,visible:a.submenuVisible,pt:t.pt,unstyled:t.unstyled,onFocus:i.onFocus,onBlur:i.onBlur,onKeydown:i.onKeyDown,onItemClick:i.onItemClick,onItemMouseenter:i.onItemMouseEnter,onItemMousemove:i.onItemMouseMove},null,8,["id","class","tabindex","aria-activedescendant","menuId","focusedItemId","items","templates","activeItemPath","aria-labelledby","aria-label","visible","pt","unstyled","onFocus","onBlur","onKeydown","onItemClick","onItemMouseenter","onItemMousemove"])],16)):K("",!0)]}),_:1},16,["onEnter","onAfterEnter","onLeave","onAfterLeave"])]}),_:1},8,["appendTo"])}Le.render=at;var rt=({dt:t})=>`
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
`,ut={root:"p-inputgroup"},ct=ue.extend({name:"inputgroup",style:rt,classes:ut}),lt={name:"BaseInputGroup",extends:j,style:ct,provide:function(){return{$pcInputGroup:this,$parentInstance:this}}},Me={name:"InputGroup",extends:lt,inheritAttrs:!1};function dt(t,e,n,o,a,i){return m(),I("div",w({class:t.cx("root")},t.ptmi("root")),[Y(t.$slots,"default")],16)}Me.render=dt;var mt={root:"p-inputgroupaddon"},pt=ue.extend({name:"inputgroupaddon",classes:mt}),ht={name:"BaseInputGroupAddon",extends:j,style:pt,provide:function(){return{$pcInputGroupAddon:this,$parentInstance:this}}},ke={name:"InputGroupAddon",extends:ht,inheritAttrs:!1};function ft(t,e,n,o,a,i){return m(),I("div",w({class:t.cx("root")},t.ptmi("root")),[Y(t.$slots,"default")],16)}ke.render=ft;class gt extends ye{constructor(){super("api")}async ping(){return(await this.post("ping",{})).data}}class vt extends ye{constructor(){super("match")}async createMatch(e,n){return this.post("create",{target:n,entity:e})}async acceptMatch(e){return this.post("accept",{matchId:e})}async decline(e){return this.post("decline",{matchId:e})}}const It=" Would like to battle",bt=()=>{const t=new vt,e=Q();async function n(i,r){try{return await t.createMatch(i,r)}catch{e.toast.error("Something went wrong","top-left")}}async function o(i){try{return await t.acceptMatch(i)}catch{e.toast.error("Something went wrong","top-left")}}async function a(i){try{return await t.decline(i)}catch{e.toast.error("Something went wrong","top-left")}}return{challenge:n,accept:o,decline:a}},xt=t=>{function e(o,a,i){if(!a.trim()||!o)return;if((i==null?void 0:i.type)===C.WHISPER){n(o,a,i.target);return}const r={type:(i==null?void 0:i.type)||C.MESSAGE,content:{message:a},channel:(i==null?void 0:i.channel)||"global",timestamp:new Date().toISOString(),client:o,metadata:i==null?void 0:i.metadata};t(JSON.stringify(r))}function n(o,a,i){if(!a.trim()||!o||!i)return;const r={type:C.WHISPER,content:{message:a,target:i},channel:"global",timestamp:new Date().toISOString(),client:o};t(JSON.stringify(r))}return{sendMessage:e,sendWhisper:n}},re=t=>{const e=y(()=>N.ToPascalCase(t.channel??"server")),n=y(()=>t.client??t.content.client),o=y(()=>t.type),a=y(()=>t.content),i=y(()=>o.value===C.MESSAGE||o.value===C.WHISPER||o.value===C.BROADCAST),r=y(()=>o.value===C.WHISPER),p=y(()=>o.value===C.BROADCAST),f=y(()=>o.value===C.PROMPT),s=y(()=>o.value==C.SYSTEM),c=y(()=>o.value===C.ERROR),l=y(()=>o.value.includes(".")),h=y(()=>{var S,_;return l.value?"System":((S=n.value)==null?void 0:S.name)||((_=n.value)==null?void 0:_.id)||"System"}),M=y(()=>(N.Log(`[${t.url}] - Heartbeat received`),o.value==="pong")),E=y(()=>t.timestamp?new Date(t.timestamp).toLocaleTimeString():"???");function P(S){return o.value===S}return{data:t,room:e,client:n,type:o,content:a,isSystemMessage:s,isErrorMessage:c,isGenericMessage:l,sender:h,formattedTime:E,isMessage:i,isWhisper:r,isBroadcast:p,isPrompt:f,isHeartbeat:M,is:P}},yt=()=>{const t=Oe("prompt",void 0,{static_instance:!0});function e(o){t.$next("prompt",o)}function n(){t.$next("clear",{})}return{next:e,clear:n}},wt=t=>{const e=yt();t.is(C.SYSTEM)&&console.log(t.data),t.is(C.ERROR)&&console.log(t.data),t.is("match")&&e.next({message:It,from:t.client.value,time:10,metadata:t.data,callback:(n,o)=>{o.metadata&&console.log(n,o.metadata)}})},Lt="wss://topsyde-gaming.duckdns.org:3000",he=20,Mt=(t,e)=>{const n=L({interval:he*1e3,pongTimeout:he*1e3,message:"ping"}),o=L({retries:1,delay:1e3,onFailed:s});function a(c,l,h){const M=h?h.data:"";N.Log(`[${l.url}] - ${c}:`,M)}function i(c,l){try{const h=JSON.parse(l.data),M=re(h);M.isMessage.value?(a("Received message",c,l),e.value.push(M.data)):wt(M)}catch(h){console.log(JSON.stringify(l.data)),console.log(h)}}function r(c){var h;a("Connected",c);const l=((h=t.value)==null?void 0:h.name)||"Guest";e.value.push({type:"system",content:{message:`Connected to chat server as ${l}`},timestamp:new Date().toISOString()})}function p(c,l){var h;N.Log(`[${c.url}] - Disconnected!`,c.readyState,l),e.value.push({type:"system",content:{message:`Disconnected from chat server (code: ${l.code})`,client:{id:((h=t.value)==null?void 0:h.id)||"Guest",name:"Guest"}},timestamp:new Date().toISOString()})}function f(c,l){N.Warn(`[${c.url}] - WebSocket error:`,l),e.value.push({type:"error",content:{message:"Error with chat connection"},timestamp:new Date().toISOString()})}function s(){N.Warn("Failed to connect WebSocket after multiple retries"),e.value.push({type:"error",content:{message:"Failed to reconnect to the server after multiple attempts"},timestamp:new Date().toISOString()})}return{autoReconnect:o.value,heartbeat:n.value,onConnected:r,onDisconnected:p,onMessage:i,onError:f,protocols:t.value?[`${t.value.id}-${t.value.name}`]:void 0}},kt={class:"timestamp"},Pt={class:"message-content"},St={key:1,class:"ml-2"},Ct={key:3,class:"ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"},Et={key:4,class:"pi pi-angle-right ml-auto"},_t=ee({__name:"ChatMessage",props:{message:{}},emits:["whisper","match"],setup(t,{emit:e}){const n=t,o=e,{room:a,content:i,isSystemMessage:r,isErrorMessage:p,isGenericMessage:f,sender:s,formattedTime:c,client:l}=re(n.message),h=Q(),M=re(n.message),E=L(),P=L([{label:"Whisper",icon:"pi pi-comment",command:()=>o("whisper",l.value)},{label:"Match",icon:"pi pi-bolt",command:()=>o("match",l.value)}]),S=_=>{_.stopPropagation(),_.preventDefault(),!M.isSystemMessage.value&&E.value.show(_)};return(_,X)=>{const W=U("ChatMessage",!0),G=ge("ripple");return v(h).guards.IsArray(v(i).message)?(m(!0),I(V,{key:0},J(v(i).message,(k,R)=>(m(),I("div",{key:R},[F(W,{message:k},null,8,["message"])]))),128)):(m(),I("div",{key:1,class:"message",onContextmenu:S},[b("span",kt,"["+T(v(c))+" - "+T(v(a))+"]",1),b("span",{class:O(["sender",{"system-indicator":v(r),"error-indicator":v(p),"generic-indicator":v(f)}])},T(v(s))+":",3),b("span",Pt,T(v(i).message),1),F(v(Le),{ref_key:"menu",ref:E,model:P.value},{item:D(({item:k,props:R})=>[ve((m(),I("a",w({class:""},R.action),[k.icon?(m(),I("span",{key:0,class:O(k.icon)},null,2)):K("",!0),k.label?(m(),I("span",St,T(k.label),1)):K("",!0),k.badge?(m(),$(v(ze),{key:2,class:"ml-auto",value:k.badge},null,8,["value"])):K("",!0),k.shortcut?(m(),I("span",Ct,T(k.shortcut),1)):K("",!0),k.items?(m(),I("i",Et)):K("",!0)],16)),[[G]])]),_:1},8,["model"])],32))}}}),Kt=te(_t,[["__scopeId","data-v-85f6b685"]]),$t={class:"window-title"},At={class:"window-controls"},Rt={class:"window-content"},Dt=["onMousedown"],Tt=ee({__name:"ChatWindow",props:{storageKey:{},initialPosition:{},initialSize:{},minWidth:{},minHeight:{},containerRef:{}},emits:["logout"],setup(t){Ve(u=>({"304d6002":`${c()}px`,"38559d46":`${l()}px`}));const e=t,n=L(null),o=me(`${e.storageKey}-position`,e.initialPosition??{x:20,y:20}),a=me(`${e.storageKey}-size`,e.initialSize??{width:600,height:500}),i=L(null),r=L(!1),p=L(!1),f=L(null),s=L({x:0,y:0}),c=()=>e.minWidth??300,l=()=>e.minHeight??200;se(()=>e.containerRef,h,{immediate:!0});function h(){var u;i.value=((u=e.containerRef)==null?void 0:u.getBoundingClientRect())??null}function M(){if(!n.value)return;const u=n.value.getBoundingClientRect(),d=i.value??{left:0,top:0,width:window.innerWidth,height:window.innerHeight},g=d.left+d.width-u.width,x=d.top+d.height-u.height;o.value={x:Math.max(d.left,Math.min(g,o.value.x)),y:Math.max(d.top,Math.min(x,o.value.y))}}const E=y(()=>window.innerWidth<=1024);function P(u){E.value||(r.value=!0,s.value={x:u.clientX-o.value.x,y:u.clientY-o.value.y},h(),k("drag"))}function S(u){var z;if(!r.value)return;const d=u.clientX-s.value.x,g=u.clientY-s.value.y,x=i.value,A=(z=n.value)==null?void 0:z.getBoundingClientRect();if(x&&A){const H=x.left+x.width-A.width,Pe=x.top+x.height-A.height;o.value={x:Math.max(x.left,Math.min(H,d)),y:Math.max(x.top,Math.min(Pe,g))}}else o.value={x:Math.max(0,Math.min(window.innerWidth-a.value.width,d)),y:Math.max(0,Math.min(window.innerHeight-a.value.height,g))}}function _(){r.value=!1,R("drag")}function X(u){E.value||(p.value=!0,f.value=u,h(),k("resize"))}function W(u){if(!p.value||!n.value)return;const d=n.value.getBoundingClientRect(),g=i.value;let x=a.value.width,A=a.value.height,z=o.value.y;if(f.value==="bottom-right")x=Math.max(c(),u.clientX-d.left),A=Math.max(l(),u.clientY-d.top);else if(f.value==="top-right"){x=Math.max(c(),u.clientX-d.left);const H=d.top-u.clientY;A=Math.max(l(),d.height+H),A>l()&&(z=u.clientY)}if(g){if(f.value==="bottom-right")x=Math.min(x,g.left+g.width-d.left),A=Math.min(A,g.top+g.height-d.top);else if(f.value==="top-right"){x=Math.min(x,g.left+g.width-d.left);const H=d.bottom-g.top;A>H&&(A=H,z=g.top),z=Math.max(z,g.top)}}a.value={width:x,height:A},f.value==="top-right"&&(o.value={...o.value,y:z}),M()}function G(){p.value=!1,f.value=null,R("resize")}function k(u){u==="drag"?(document.addEventListener("mousemove",S),document.addEventListener("mouseup",_)):(document.addEventListener("mousemove",W),document.addEventListener("mouseup",G))}function R(u){u==="drag"?(document.removeEventListener("mousemove",S),document.removeEventListener("mouseup",_)):(document.removeEventListener("mousemove",W),document.removeEventListener("mouseup",G))}function q(){h(),M()}return ce(()=>{M(),window.addEventListener("resize",q),E.value&&i.value&&(o.value={x:i.value.left,y:i.value.bottom-a.value.height})}),se(i,u=>{E.value&&u&&(o.value={x:u.left,y:u.bottom-a.value.height})},{deep:!0}),be(()=>{R("drag"),R("resize"),window.removeEventListener("resize",q)}),(u,d)=>(m(),I("div",{class:"chat-window",style:Fe({position:"fixed",left:`${v(o).x}px`,top:`${v(o).y}px`,width:`${v(a).width}px`,height:`${v(a).height}px`}),ref_key:"windowRef",ref:n},[b("div",{class:"window-header",onMousedown:P},[b("div",$t,[Y(u.$slots,"title",{},()=>[d[1]||(d[1]=ae("Window"))],!0)]),b("div",At,[Y(u.$slots,"controls",{},void 0,!0),F(v(xe),{class:"p-button-rounded p-button-text p-button-sm logout-button",icon:"pi pi-sign-out",onClick:d[0]||(d[0]=pe(g=>u.$emit("logout"),["stop"])),title:"Logout"})])],32),b("div",Rt,[Y(u.$slots,"default",{},void 0,!0)]),(m(),I(V,null,J(["bottom-right","top-right"],g=>b("div",{key:g,class:O(["resize-handle",g]),onMousedown:pe(x=>X(g),["prevent"])},null,42,Dt)),64))],4))}}),Ot=te(Tt,[["__scopeId","data-v-61e6a4c6"]]),zt={class:"client-name"},Ft={class:"chat-content"},Vt={class:"input-area"},Wt={class:"input-wrapper"},Gt={class:"flex align-items-center gap-2 whisper-indicator"},Ht=ee({__name:"Chat",props:{client:{},containerRef:{}},emits:["logout"],setup(t,{emit:e}){const n=t,o=e,a=new gt,i=Q(),r=L([]),p=L(""),f=L(null),s=L("broadcast"),c=L(null),l=Mt(L(n.client),r),{status:h,send:M,close:E}=We(Lt,l),P=xt(M),S=y(()=>s.value==="whisper");function _(u){P.sendMessage(n.client,u||p.value,{type:S.value?C.WHISPER:C.BROADCAST,target:c.value}),p.value="",s.value="broadcast",k(null)}function X(){E(),o("logout"),i.lib.Log("User logged out:",n.client)}function W(){f.value&&f.value.scrollTo({top:f.value.scrollHeight,behavior:"smooth"})}function G(u){i.lib.Log("Whispering to:",u),s.value="whisper",k(u)}function k(u){c.value=u}function R(u){i.lib.Log("Matching with:",u),bt().challenge(n.client,u)}async function q(){await a.ping().then(()=>{_("Hello, world!")}).catch(u=>{i.toast.error("Error pinging API: "+u)})}return se(r,()=>He(()=>{W()}),{deep:!0}),ce(()=>{q(),i.lib.Log("Chat mounted with client:",n.client)}),be(()=>E()),(u,d)=>(m(),$(Ot,{"container-ref":u.containerRef,storageKey:"chat",minWidth:300,minHeight:200,initialSize:{width:600,height:500},onLogout:X},{title:D(()=>[d[3]||(d[3]=ae("Connected as: ")),b("span",zt,T(u.client?`(${u.client.name})`:""),1)]),controls:D(()=>[b("div",{class:O(["status-indicator",v(h)])},null,2)]),default:D(()=>[b("div",Ft,[b("div",{ref_key:"messagesContainer",ref:f,class:"messages"},[(m(!0),I(V,null,J(r.value,(g,x)=>(m(),$(Kt,{onWhisper:G,onMatch:R,key:x,message:g},null,8,["message"]))),128))],512),b("div",Vt,[b("div",Wt,[F(v(Me),null,{default:D(()=>[S.value?(m(),$(v(ke),{key:0},{default:D(()=>{var g;return[b("div",Gt,[d[4]||(d[4]=b("i",{class:"pi pi-user"},null,-1)),b("span",null,"Whisper: "+T((g=c.value)==null?void 0:g.name),1)])]}),_:1})):K("",!0),F(v(Ye),{modelValue:p.value,"onUpdate:modelValue":d[0]||(d[0]=g=>p.value=g),onKeyup:d[1]||(d[1]=Ge(()=>_(),["enter"])),class:O({"whisper-indicator":S.value}),placeholder:"Enter message...",disabled:v(h)!=="OPEN"},null,8,["modelValue","class","disabled"])]),_:1}),F(v(xe),{onClick:d[2]||(d[2]=()=>_()),disabled:v(h)!=="OPEN"||!p.value.trim()},{default:D(()=>d[5]||(d[5]=[ae(" Send ")])),_:1},8,["disabled"])])])])]),_:1},8,["container-ref"]))}}),Bt=te(Ht,[["__scopeId","data-v-ee88e3fa"]]),Nt={class:"match flex column gap large"},Yt={key:0,class:"loading-container"},Ut=ee({__name:"Match",setup(t){const e=new Ue("api","https://topsyde-gaming.duckdns.org:3000"),n=Q(),o=Be("viewportRef"),a=L(!0),i=L(null),r=Ne(),p=y(()=>r.username),f=y(()=>r.password),s=y(()=>"r_d_25c9dd62-ba12-44de-b303-67ef659ba7bd"),c=L(!n.lib.IsEmpty(p.value));document.documentElement.style.setProperty("--match-bg-url","url(/client_rune_dictionary/match.webp)");function h(P){r.username=P.username,M()}async function M(){try{if(c.value=!0,a.value=!0,n.lib.IsEmpty(p.value)||n.lib.IsEmpty(f.value)||n.lib.IsEmpty(s.value))throw new Error("Invalid credentials");const P=await e.handshake(p.value,f.value,s.value);if(!P.status)throw new Error("Invalid handshake response");i.value={id:P.data.id,name:P.data.name},n.lib.Log("Handshake successful - client data:",i.value),a.value=!1}catch(P){c.value=!1,n.toast.error("Handshake failed:"),n.lib.Warn("Handshake failed:",P)}}function E(){i.value=null,r.username="",c.value=!1,n.lib.Log("User logged out, returning to login screen")}return ce(()=>{c.value&&M()}),(P,S)=>(m(),I("div",Nt,[b("div",{class:O(["viewport",{background:c.value}]),ref_key:"viewportRef",ref:o},[c.value?(m(),I(V,{key:0},[a.value?(m(),I("div",Yt,S[0]||(S[0]=[b("div",{class:"loading-spinner"},null,-1),b("p",null,"Connecting to chat server...",-1)]))):i.value?(m(),$(Bt,{key:1,"container-ref":v(o),client:i.value,onLogout:E},null,8,["container-ref","client"])):K("",!0)],64)):(m(),$(Xe,{key:1,title:"Start Chat",onSubmit:h}))],2)]))}}),jt=te(Ut,[["__scopeId","data-v-63e1d032"]]);export{jt as default};
