import{B as X,W as N,c as h,o as l,m as $,a as t,X as A,Y as _,$ as oe,l as ie,u as L,a0 as Y,t as c,A as S,n as M,_ as k,k as B,x as p,F as C,w as y,a1 as R,p as w,a2 as E,S as K,Q as V,N as W,M as G,a3 as le,a4 as ce,v as T,a5 as ue,a6 as de,a7 as pe,a8 as he}from"./index.D9ZUk7kD.js";import{s as me}from"./index.Cqyjn1UT.js";var fe=({dt:s})=>`
.p-progressspinner {
    position: relative;
    margin: 0 auto;
    width: 100px;
    height: 100px;
    display: inline-block;
}

.p-progressspinner::before {
    content: "";
    display: block;
    padding-top: 100%;
}

.p-progressspinner-spin {
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    animation: p-progressspinner-rotate 2s linear infinite;
}

.p-progressspinner-circle {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: 0;
    stroke: ${s("progressspinner.colorOne")};
    animation: p-progressspinner-dash 1.5s ease-in-out infinite, p-progressspinner-color 6s ease-in-out infinite;
    stroke-linecap: round;
}

@keyframes p-progressspinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes p-progressspinner-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}
@keyframes p-progressspinner-color {
    100%,
    0% {
        stroke: ${s("progressspinner.colorOne")};
    }
    40% {
        stroke: ${s("progressspinner.colorTwo")};
    }
    66% {
        stroke: ${s("progressspinner.colorThree")};
    }
    80%,
    90% {
        stroke: ${s("progressspinner.colorFour")};
    }
}
`,ye={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},ge=X.extend({name:"progressspinner",style:fe,classes:ye}),ve={name:"BaseProgressSpinner",extends:N,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:ge,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},q={name:"ProgressSpinner",extends:ve,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},be=["fill","stroke-width"];function $e(s,e,n,i,u,a){return l(),h("div",$({class:s.cx("root"),role:"progressbar"},s.ptmi("root")),[(l(),h("svg",$({class:s.cx("spin"),viewBox:"25 25 50 50",style:a.svgStyle},s.ptm("spin")),[t("circle",$({class:s.cx("circle"),cx:"50",cy:"50",r:"20",fill:s.fill,"stroke-width":s.strokeWidth,strokeMiterlimit:"10"},s.ptm("circle")),null,16,be)],16))],16)}q.render=$e;var Me=({dt:s})=>`
.p-scrollpanel-content-container {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
    float: left;
}

.p-scrollpanel-content {
    height: calc(100% + calc(2 * ${s("scrollpanel.bar.size")}));
    width: calc(100% + calc(2 * ${s("scrollpanel.bar.size")}));
    padding-inline: 0 calc(2 * ${s("scrollpanel.bar.size")});
    padding-block: 0 calc(2 * ${s("scrollpanel.bar.size")});
    position: relative;
    overflow: auto;
    box-sizing: border-box;
    scrollbar-width: none;
}

.p-scrollpanel-content::-webkit-scrollbar {
    display: none;
}

.p-scrollpanel-bar {
    position: relative;
    border-radius: ${s("scrollpanel.bar.border.radius")};
    z-index: 2;
    cursor: pointer;
    opacity: 0;
    outline-color: transparent;
    background: ${s("scrollpanel.bar.background")};
    border: 0 none;
    transition: outline-color ${s("scrollpanel.transition.duration")}, opacity ${s("scrollpanel.transition.duration")};
}

.p-scrollpanel-bar:focus-visible {
    box-shadow: ${s("scrollpanel.bar.focus.ring.shadow")};
    outline: ${s("scrollpanel.barfocus.ring.width")} ${s("scrollpanel.bar.focus.ring.style")} ${s("scrollpanel.bar.focus.ring.color")};
    outline-offset: ${s("scrollpanel.barfocus.ring.offset")};
}

.p-scrollpanel-bar-y {
    width: ${s("scrollpanel.bar.size")};
    inset-block-start: 0;
}

.p-scrollpanel-bar-x {
    height: ${s("scrollpanel.bar.size")};
    inset-block-end: 0;
}

.p-scrollpanel-hidden {
    visibility: hidden;
}

.p-scrollpanel:hover .p-scrollpanel-bar,
.p-scrollpanel:active .p-scrollpanel-bar {
    opacity: 1;
}

.p-scrollpanel-grabbed {
    user-select: none;
}
`,we={root:"p-scrollpanel p-component",contentContainer:"p-scrollpanel-content-container",content:"p-scrollpanel-content",barX:"p-scrollpanel-bar p-scrollpanel-bar-x",barY:"p-scrollpanel-bar p-scrollpanel-bar-y"},Be=X.extend({name:"scrollpanel",style:Me,classes:we}),Le={name:"BaseScrollPanel",extends:N,props:{step:{type:Number,default:5}},style:Be,provide:function(){return{$pcScrollPanel:this,$parentInstance:this}}},O={name:"ScrollPanel",extends:Le,inheritAttrs:!1,initialized:!1,documentResizeListener:null,documentMouseMoveListener:null,documentMouseUpListener:null,frame:null,scrollXRatio:null,scrollYRatio:null,isXBarClicked:!1,isYBarClicked:!1,lastPageX:null,lastPageY:null,timer:null,outsideClickListener:null,data:function(){return{orientation:"vertical",lastScrollTop:0,lastScrollLeft:0}},mounted:function(){this.$el.offsetParent&&this.initialize()},updated:function(){!this.initialized&&this.$el.offsetParent&&this.initialize()},beforeUnmount:function(){this.unbindDocumentResizeListener(),this.frame&&window.cancelAnimationFrame(this.frame)},methods:{initialize:function(){this.moveBar(),this.bindDocumentResizeListener(),this.calculateContainerHeight()},calculateContainerHeight:function(){var e=getComputedStyle(this.$el),n=getComputedStyle(this.$refs.xBar),i=oe(this.$el)-parseInt(n.height,10);e["max-height"]!=="none"&&i===0&&(this.$refs.content.offsetHeight+parseInt(n.height,10)>parseInt(e["max-height"],10)?this.$el.style.height=e["max-height"]:this.$el.style.height=this.$refs.content.offsetHeight+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)+"px")},moveBar:function(){var e=this;if(this.$refs.content){var n=this.$refs.content.scrollWidth,i=this.$refs.content.clientWidth,u=(this.$el.clientHeight-this.$refs.xBar.clientHeight)*-1;this.scrollXRatio=i/n;var a=this.$refs.content.scrollHeight,m=this.$refs.content.clientHeight,o=(this.$el.clientWidth-this.$refs.yBar.clientWidth)*-1;this.scrollYRatio=m/a,this.frame=this.requestAnimationFrame(function(){e.$refs.xBar&&(e.scrollXRatio>=1?(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&_(e.$refs.xBar,"p-scrollpanel-hidden")):(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&A(e.$refs.xBar,"p-scrollpanel-hidden"),e.$refs.xBar.style.cssText="width:"+Math.max(e.scrollXRatio*100,10)+"%; inset-inline-start:"+Math.abs(e.$refs.content.scrollLeft)/n*100+"%;bottom:"+u+"px;")),e.$refs.yBar&&(e.scrollYRatio>=1?(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&_(e.$refs.yBar,"p-scrollpanel-hidden")):(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&A(e.$refs.yBar,"p-scrollpanel-hidden"),e.$refs.yBar.style.cssText="height:"+Math.max(e.scrollYRatio*100,10)+"%; top: calc("+e.$refs.content.scrollTop/a*100+"% - "+e.$refs.xBar.clientHeight+"px); inset-inline-end:"+o+"px;"))})}},onYBarMouseDown:function(e){this.isYBarClicked=!0,this.$refs.yBar.focus(),this.lastPageY=e.pageY,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&_(this.$refs.yBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&_(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onXBarMouseDown:function(e){this.isXBarClicked=!0,this.$refs.xBar.focus(),this.lastPageX=e.pageX,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&_(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&_(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onScroll:function(e){this.lastScrollLeft!==e.target.scrollLeft?(this.lastScrollLeft=e.target.scrollLeft,this.orientation="horizontal"):this.lastScrollTop!==e.target.scrollTop&&(this.lastScrollTop=e.target.scrollTop,this.orientation="vertical"),this.moveBar()},onKeyDown:function(e){if(this.orientation==="vertical")switch(e.code){case"ArrowDown":{this.setTimer("scrollTop",this.step),e.preventDefault();break}case"ArrowUp":{this.setTimer("scrollTop",this.step*-1),e.preventDefault();break}case"ArrowLeft":case"ArrowRight":{e.preventDefault();break}}else if(this.orientation==="horizontal")switch(e.code){case"ArrowRight":{this.setTimer("scrollLeft",this.step),e.preventDefault();break}case"ArrowLeft":{this.setTimer("scrollLeft",this.step*-1),e.preventDefault();break}case"ArrowDown":case"ArrowUp":{e.preventDefault();break}}},onKeyUp:function(){this.clearTimer()},repeat:function(e,n){this.$refs.content[e]+=n,this.moveBar()},setTimer:function(e,n){var i=this;this.clearTimer(),this.timer=setTimeout(function(){i.repeat(e,n)},40)},clearTimer:function(){this.timer&&clearTimeout(this.timer)},onDocumentMouseMove:function(e){this.isXBarClicked?this.onMouseMoveForXBar(e):this.isYBarClicked?this.onMouseMoveForYBar(e):(this.onMouseMoveForXBar(e),this.onMouseMoveForYBar(e))},onMouseMoveForXBar:function(e){var n=this,i=e.pageX-this.lastPageX;this.lastPageX=e.pageX,this.frame=this.requestAnimationFrame(function(){n.$refs.content.scrollLeft+=i/n.scrollXRatio})},onMouseMoveForYBar:function(e){var n=this,i=e.pageY-this.lastPageY;this.lastPageY=e.pageY,this.frame=this.requestAnimationFrame(function(){n.$refs.content.scrollTop+=i/n.scrollYRatio})},onFocus:function(e){this.$refs.xBar.isSameNode(e.target)?this.orientation="horizontal":this.$refs.yBar.isSameNode(e.target)&&(this.orientation="vertical")},onBlur:function(){this.orientation==="horizontal"&&(this.orientation="vertical")},onDocumentMouseUp:function(){this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&A(this.$refs.yBar,"p-scrollpanel-grabbed"),this.$refs.xBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&A(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&A(document.body,"p-scrollpanel-grabbed"),this.unbindDocumentMouseListeners(),this.isXBarClicked=!1,this.isYBarClicked=!1},requestAnimationFrame:function(e){var n=window.requestAnimationFrame||this.timeoutFrame;return n(e)},refresh:function(){this.moveBar()},scrollTop:function(e){var n=this.$refs.content.scrollHeight-this.$refs.content.clientHeight;e=e>n?n:e>0?e:0,this.$refs.content.scrollTop=e},timeoutFrame:function(e){setTimeout(e,0)},bindDocumentMouseListeners:function(){var e=this;this.documentMouseMoveListener||(this.documentMouseMoveListener=function(n){e.onDocumentMouseMove(n)},document.addEventListener("mousemove",this.documentMouseMoveListener)),this.documentMouseUpListener||(this.documentMouseUpListener=function(n){e.onDocumentMouseUp(n)},document.addEventListener("mouseup",this.documentMouseUpListener))},unbindDocumentMouseListeners:function(){this.documentMouseMoveListener&&(document.removeEventListener("mousemove",this.documentMouseMoveListener),this.documentMouseMoveListener=null),this.documentMouseUpListener&&(document.removeEventListener("mouseup",this.documentMouseUpListener),this.documentMouseUpListener=null)},bindDocumentResizeListener:function(){var e=this;this.documentResizeListener||(this.documentResizeListener=function(){e.moveBar()},window.addEventListener("resize",this.documentResizeListener))},unbindDocumentResizeListener:function(){this.documentResizeListener&&(window.removeEventListener("resize",this.documentResizeListener),this.documentResizeListener=null)}},computed:{contentId:function(){return this.$id+"_content"}}},ke=["id"],_e=["aria-controls","aria-valuenow"],Te=["aria-controls","aria-valuenow"];function Se(s,e,n,i,u,a){return l(),h("div",$({class:s.cx("root")},s.ptmi("root")),[t("div",$({class:s.cx("contentContainer")},s.ptm("contentContainer")),[t("div",$({ref:"content",id:a.contentId,class:s.cx("content"),onScroll:e[0]||(e[0]=function(){return a.onScroll&&a.onScroll.apply(a,arguments)}),onMouseenter:e[1]||(e[1]=function(){return a.moveBar&&a.moveBar.apply(a,arguments)})},s.ptm("content")),[ie(s.$slots,"default")],16,ke)],16),t("div",$({ref:"xBar",class:s.cx("barx"),tabindex:"0",role:"scrollbar","aria-orientation":"horizontal","aria-controls":a.contentId,"aria-valuenow":u.lastScrollLeft,onMousedown:e[2]||(e[2]=function(){return a.onXBarMouseDown&&a.onXBarMouseDown.apply(a,arguments)}),onKeydown:e[3]||(e[3]=function(m){return a.onKeyDown(m)}),onKeyup:e[4]||(e[4]=function(){return a.onKeyUp&&a.onKeyUp.apply(a,arguments)}),onFocus:e[5]||(e[5]=function(){return a.onFocus&&a.onFocus.apply(a,arguments)}),onBlur:e[6]||(e[6]=function(){return a.onBlur&&a.onBlur.apply(a,arguments)})},s.ptm("barx"),{"data-pc-group-section":"bar"}),null,16,_e),t("div",$({ref:"yBar",class:s.cx("bary"),tabindex:"0",role:"scrollbar","aria-orientation":"vertical","aria-controls":a.contentId,"aria-valuenow":u.lastScrollTop,onMousedown:e[7]||(e[7]=function(){return a.onYBarMouseDown&&a.onYBarMouseDown.apply(a,arguments)}),onKeydown:e[8]||(e[8]=function(m){return a.onKeyDown(m)}),onKeyup:e[9]||(e[9]=function(){return a.onKeyUp&&a.onKeyUp.apply(a,arguments)}),onFocus:e[10]||(e[10]=function(){return a.onFocus&&a.onFocus.apply(a,arguments)})},s.ptm("bary"),{"data-pc-group-section":"bar"}),null,16,Te)],16)}O.render=Se;const Pe={class:"battle-area"},Ae={class:"player-section"},Re={class:"player-card"},De={class:"player-info"},ze={class:"health-bar"},Ce={class:"health-text"},Ue={key:0},Ie={class:"enemy-section"},Fe={class:"enemy-card"},He={class:"enemy-info"},xe={class:"health-bar"},Ye={class:"health-text"},Ee={key:0},Xe=L({__name:"BattleArea",props:{playerHealth:{},playerMaxHealth:{},enemyHealth:{},enemyMaxHealth:{},enemyName:{},isPlayerTurn:{type:Boolean},isEnemyTurn:{type:Boolean}},setup(s){return(e,n)=>(l(),h("div",Pe,[t("div",Ae,[t("div",Re,[n[1]||(n[1]=t("div",{class:"player-avatar"},[t("i",{class:"pi pi-user",style:{"font-size":"2rem",color:"var(--p-primary-color)"}})],-1)),t("div",De,[n[0]||(n[0]=t("h3",null,"You",-1)),t("div",ze,[t("div",{class:"health-fill",style:Y({width:`${e.playerHealth/e.playerMaxHealth*100}%`})},null,4),t("span",Ce,c(e.playerHealth)+" / "+c(e.playerMaxHealth),1)])]),t("div",{class:S(["turn-indicator",{active:e.isPlayerTurn}])},[e.isPlayerTurn?(l(),h("span",Ue,"Your Turn")):M("",!0)],2)])]),n[3]||(n[3]=t("div",{class:"vs-divider"},[t("span",{class:"vs-text"},"VS")],-1)),t("div",Ie,[t("div",Fe,[n[2]||(n[2]=t("div",{class:"enemy-avatar"},[t("i",{class:"pi pi-android",style:{"font-size":"2rem",color:"var(--p-orange-500)"}})],-1)),t("div",He,[t("h3",null,c(e.enemyName),1),t("div",xe,[t("div",{class:"health-fill enemy",style:Y({width:`${e.enemyHealth/e.enemyMaxHealth*100}%`})},null,4),t("span",Ye,c(e.enemyHealth)+" / "+c(e.enemyMaxHealth),1)])]),t("div",{class:S(["turn-indicator",{active:e.isEnemyTurn}])},[e.isEnemyTurn?(l(),h("span",Ee,c(e.enemyName)+"'s Turn",1)):M("",!0)],2)])])]))}}),Ne=k(Xe,[["__scopeId","data-v-34cf0d11"]]),Ke={class:"game-actions"},Ve={class:"action-panel"},We={class:"actions-grid"},Ge=L({__name:"GameActions",props:{isPlayerTurn:{type:Boolean},isProcessingAction:{type:Boolean}},emits:["attack"],setup(s){return(e,n)=>(l(),h("div",Ke,[t("div",Ve,[n[2]||(n[2]=t("h4",null,"Actions",-1)),t("div",We,[B(p(C),{disabled:!e.isPlayerTurn||e.isProcessingAction,onClick:n[0]||(n[0]=i=>e.$emit("attack")),severity:"danger",class:"attack-button"},{default:y(()=>n[1]||(n[1]=[t("i",{class:"pi pi-bolt"},null,-1),R(" Attack ")])),_:1},8,["disabled"])])])]))}}),qe=k(Ge,[["__scopeId","data-v-b0a687eb"]]),Oe={class:"log-entries"},je={class:"log-timestamp"},Qe={class:"log-message"},Je=L({__name:"GameLog",props:{gameLog:{}},setup(s){function e(i){return i.toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}function n(i){switch(i){case"player":return"success";case"enemy":return"info";case"system":return"warn";case"damage":return"error";case"heal":return"secondary";case"victory":return"contrast";case"defeat":return"error";default:return"info"}}return(i,u)=>(l(),w(p(O),{class:"game-log",style:{height:"200px",width:"100%"}},{default:y(()=>[u[1]||(u[1]=t("h4",null,"Combat Log",-1)),t("div",Oe,[i.gameLog.length===0?(l(),w(p(E),{key:0,severity:"info"},{default:y(()=>u[0]||(u[0]=[R(" Match started! Waiting for first turn... ")])),_:1})):M("",!0),(l(!0),h(V,null,K(i.gameLog,(a,m)=>(l(),w(p(E),{key:m,severity:n(a.type)},{default:y(()=>[t("span",je,c(e(a.timestamp)),1),t("span",Qe,c(a.message),1)]),_:2},1032,["severity"]))),128))])]),_:1}))}}),Ze=k(Je,[["__scopeId","data-v-a70bcb46"]]),et={class:"game-interface"},tt={class:"game-header"},st={class:"match-info"},nt={class:"match-type"},at={class:"match-id"},rt=L({__name:"GameInterface",props:{matchTypeLabel:{},matchId:{},enemyName:{},gameState:{},isPlayerTurn:{type:Boolean},isEnemyTurn:{type:Boolean},isProcessingAction:{type:Boolean},gameLog:{}},emits:["attack","leave-match"],setup(s){return(e,n)=>{const i=G("ripple");return l(),h("div",et,[t("div",tt,[t("div",st,[t("span",nt,c(e.matchTypeLabel),1),t("span",at,"Match: "+c(e.matchId||"Unknown"),1)])]),W((l(),w(p(C),{disabled:e.isProcessingAction,size:"small",class:"leavae-match-button pointer",onClick:n[0]||(n[0]=u=>e.$emit("leave-match"))},{default:y(()=>n[2]||(n[2]=[R("Leave Match")])),_:1},8,["disabled"])),[[i]]),B(Ne,{"player-health":e.gameState.playerHealth,"player-max-health":e.gameState.playerMaxHealth,"enemy-health":e.gameState.enemyHealth,"enemy-max-health":e.gameState.enemyMaxHealth,"enemy-name":e.enemyName,"is-player-turn":e.isPlayerTurn,"is-enemy-turn":e.isEnemyTurn},null,8,["player-health","player-max-health","enemy-health","enemy-max-health","enemy-name","is-player-turn","is-enemy-turn"]),B(qe,{"is-player-turn":e.isPlayerTurn,"is-processing-action":e.isProcessingAction,onAttack:n[1]||(n[1]=u=>e.$emit("attack"))},null,8,["is-player-turn","is-processing-action"]),B(Ze,{"game-log":e.gameLog},null,8,["game-log"])])}}}),ot=k(rt,[["__scopeId","data-v-1a97648c"]]),it={class:"match-lobby"},lt={class:"flex gap large wrap match-card-wrapper"},ct={key:0,class:"wip-badge"},ut={class:"card-header-container"},dt=["alt","src"],pt={key:0,class:"loading-overlay"},ht={class:"text-center flex"},mt={class:"text-center flex"},ft={class:"flex text-center"},yt=L({__name:"MatchLobby",props:{matchCards:{},imageUrl:{}},emits:["matchTypeSelected"],setup(s,{emit:e}){const n=e;function i(u){n("matchTypeSelected",u)}return(u,a)=>{const m=G("ripple");return l(),h("div",it,[t("div",lt,[(l(!0),h(V,null,K(u.matchCards,o=>(l(),h("div",{key:o.type,class:"match-card-wrapper-outer"},[o.wip?(l(),h("span",ct,"WIP")):M("",!0),W((l(),w(p(me),{class:S(["match-card",o.type,{disabled:o.disabled||o.loading,loading:o.loading}]),onClick:r=>!o.disabled&&!o.loading&&i(o)},{header:y(()=>[t("div",ut,[t("img",{alt:`${o.type} header`,class:"card-image",src:`${u.imageUrl}match.webp`},null,8,dt),o.loading?(l(),h("div",pt,[B(p(q),{size:"large","stroke-width":"3"}),a[0]||(a[0]=t("p",null,"Starting match...",-1))])):M("",!0)])]),title:y(()=>[t("span",ht,c(o.title),1)]),subtitle:y(()=>[t("span",mt,c(o.subtitle),1)]),content:y(()=>[t("p",ft,c(o.content),1)]),_:2},1032,["class","onClick"])),[[m]])]))),128))])])}}}),gt=k(yt,[["__scopeId","data-v-ea669d36"]]),vt={class:"match-result-screen"},bt={class:"result-container"},$t={class:"result-header"},Mt={class:"result-title"},wt={class:"result-subtitle"},Bt={class:"result-stats"},Lt={class:"stat-row"},kt={class:"stat-value"},_t={class:"stat-row"},Tt={class:"stat-value"},St={class:"stat-row"},Pt={class:"stat-value"},At={class:"stat-row"},Rt={class:"stat-value"},Dt={class:"session-stats"},zt={class:"stats-grid"},Ct={class:"stat-item"},Ut={class:"stat-number"},It={class:"stat-item"},Ft={class:"stat-number"},Ht={class:"stat-item"},xt={class:"stat-number"},Yt={class:"stat-item"},Et={class:"stat-number"},Xt={class:"result-actions"},Nt=L({__name:"MatchResult",props:{matchResult:{},sessionStats:{},isLoading:{type:Boolean}},emits:["rematch","returnToLobby"],setup(s){const e=s;function n(){var r;switch((r=e.matchResult)==null?void 0:r.result){case"victory":return"success";case"defeat":return"danger";case"draw":return"warning";default:return"info"}}function i(){var r;switch((r=e.matchResult)==null?void 0:r.result){case"victory":return"pi pi-trophy";case"defeat":return"pi pi-times-circle";case"draw":return"pi pi-minus-circle";default:return"pi pi-info-circle"}}function u(){var r;switch((r=e.matchResult)==null?void 0:r.result){case"victory":return"Victory!";case"defeat":return"Defeat";case"draw":return"Draw";default:return"Match Complete"}}function a(){var r;switch((r=e.matchResult)==null?void 0:r.result){case"victory":return"You defeated the AI opponent!";case"defeat":return"The AI opponent proved too strong.";case"draw":return"Both fighters fell in battle.";default:return"The match has ended."}}function m(o){const r=Math.floor(o/60),f=o%60;return`${r}:${f.toString().padStart(2,"0")}`}return(o,r)=>{var f,v,b,P;return l(),h("div",vt,[t("div",bt,[t("div",$t,[t("div",{class:S(["result-icon",n()])},[t("i",{class:S(i())},null,2)],2),t("h2",Mt,c(u()),1),t("p",wt,c(a()),1)]),t("div",Bt,[t("div",Lt,[r[2]||(r[2]=t("span",{class:"stat-label"},"Match Duration:",-1)),t("span",kt,c(m(((f=o.matchResult)==null?void 0:f.duration)||0)),1)]),t("div",_t,[r[3]||(r[3]=t("span",{class:"stat-label"},"Your Health:",-1)),t("span",Tt,c(((v=o.matchResult)==null?void 0:v.playerHealth)||0)+" HP",1)]),t("div",St,[r[4]||(r[4]=t("span",{class:"stat-label"},"Enemy Health:",-1)),t("span",Pt,c(((b=o.matchResult)==null?void 0:b.enemyHealth)||0)+" HP",1)]),t("div",At,[r[5]||(r[5]=t("span",{class:"stat-label"},"Actions Performed:",-1)),t("span",Rt,c(((P=o.matchResult)==null?void 0:P.actionsPerformed)||0),1)])]),t("div",Dt,[r[10]||(r[10]=t("h3",null,"Session Statistics",-1)),t("div",zt,[t("div",Ct,[t("span",Ut,c(o.sessionStats.victories),1),r[6]||(r[6]=t("span",{class:"stat-text"},"Victories",-1))]),t("div",It,[t("span",Ft,c(o.sessionStats.defeats),1),r[7]||(r[7]=t("span",{class:"stat-text"},"Defeats",-1))]),t("div",Ht,[t("span",xt,c(o.sessionStats.winRate)+"%",1),r[8]||(r[8]=t("span",{class:"stat-text"},"Win Rate",-1))]),t("div",Yt,[t("span",Et,c(o.sessionStats.totalMatches),1),r[9]||(r[9]=t("span",{class:"stat-text"},"Total Matches",-1))])])]),t("div",Xt,[B(p(C),{loading:o.isLoading,onClick:r[0]||(r[0]=U=>o.$emit("rematch")),severity:"success",size:"large",class:"rematch-button"},{default:y(()=>r[11]||(r[11]=[t("i",{class:"pi pi-refresh"},null,-1),R(" Rematch ")])),_:1},8,["loading"]),B(p(C),{onClick:r[1]||(r[1]=U=>o.$emit("returnToLobby")),disabled:o.isLoading,severity:"secondary",size:"large",class:"lobby-button"},{default:y(()=>r[12]||(r[12]=[t("i",{class:"pi pi-home"},null,-1),R(" Return to Lobby ")])),_:1},8,["disabled"])])])])}}}),Kt=k(Nt,[["__scopeId","data-v-d472f777"]]),Vt={class:"match"},Wt={class:"content"},Gt=L({__name:"Match",setup(s){const e="/client_rune_dictionary/";document.documentElement.style.setProperty("--match-bg-url",`url(${e}match.webp)`);const n=le(),i=ce(),{inLobby:u,inMatch:a,isFinished:m}=i,o=T(!0),r=T(!1),f=T(!1),v=T([]),b=T(null);ue("match",{onPlayerTurn:te,onEnemyTurn:ee,onLogEntry:D});const P=T([{type:"pvp",title:"Player versus Player",subtitle:"Challenge other players to a duel",content:"Test your skills against other players in real-time combat using your runeabilities.",wip:!0,disabled:!0,loading:!1},{type:"pve",title:"Player versus Environment",subtitle:"Challenge the environment",content:"Face off against AI-controlled opponents and test your strategies.",wip:!1,disabled:!1,loading:!1}]);async function U(d){console.log(`Selected match type: ${d.type}`),d.type==="pve"?await j(d):await se(d)}async function j(d){if(!d.loading)try{if(d.loading=!0,z("pvp","disabled",!0),a.value){n.toast.error("You are already in a match","center");return}b.value="pve",Q();const g=await i.pve();console.log("PVE match created:",g)}catch(g){console.error("PVE match error:",g),n.toast.error("Something went wrong","center")}finally{z("pvp","disabled",!0),d.loading=!1}}function Q(){o.value=!0,r.value=!1,f.value=!1,v.value=[],console.log("Set up callbacks for server event integration"),D({type:"system",message:"Match started! It's your turn."})}function J(){return b.value?b.value==="pve"?"Player vs AI":"Player vs Player":"Unknown Match"}function I(){return b.value?b.value==="pve"?"AI Opponent":"Enemy Player":"Enemy"}async function Z(d){if(!(!o.value||f.value))try{f.value=!0,he.Next("match",{cta:"match.action",data:{type:"match.action",actionType:d,matchId:i.store.currentMatchId,channelId:i.store.currentChannelId}})}catch(g){console.error("Attack failed:",g),n.toast.error("Attack failed","center"),f.value=!1}}function ee(){o.value=!1,r.value=!0,D({type:"system",message:`${I()}'s turn...`})}function te(){o.value=!0,r.value=!1,f.value=!1,D({type:"system",message:"Your turn!"})}function D(d){v.value.unshift({type:d.type,message:d.message,timestamp:new Date}),v.value.length>50&&(v.value=v.value.slice(-50))}async function se(d){d.loading=!0,z("pve","disabled",!0),d.disabled=!0,z("pve","disabled",!1)}function z(d,g,H){const x=P.value.find(re=>re.type===d);x&&(x[g]=H)}function ne(){return i.getMatchStats()}async function ae(){try{await i.startRematch()}catch(d){console.error("Failed to start rematch:",d)}}function F(){i.returnToLobby()}return de(()=>{pe.IsNil(b.value)&&i.returnToLobby()}),(d,g)=>(l(),h("div",Vt,[t("div",{class:S(["viewport",{opaque:p(u),background:p(a)}])},[t("div",Wt,[p(u)?(l(),w(gt,{key:0,"match-cards":P.value,"image-url":p(e),onMatchTypeSelected:U},null,8,["match-cards","image-url"])):M("",!0),p(m)?(l(),w(Kt,{key:1,"match-result":p(i).store.matchResult,"session-stats":ne(),"is-loading":p(i).loading.api||p(i).loading.match,onRematch:ae,onReturnToLobby:F},null,8,["match-result","session-stats","is-loading"])):M("",!0),p(a)?(l(),w(ot,{key:2,"match-type-label":J(),"match-id":p(i).store.currentMatchId,"enemy-name":I(),"game-state":p(i).store.gameState,"is-player-turn":o.value,"is-enemy-turn":r.value,"is-processing-action":f.value,"game-log":v.value,onLeaveMatch:F,onAttack:g[0]||(g[0]=H=>Z("attack"))},null,8,["match-type-label","match-id","enemy-name","game-state","is-player-turn","is-enemy-turn","is-processing-action","game-log"])):M("",!0)])],2)]))}}),jt=k(Gt,[["__scopeId","data-v-7c336c46"]]);export{jt as default};
