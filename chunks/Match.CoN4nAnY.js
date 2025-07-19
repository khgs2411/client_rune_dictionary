import{B as W,W as N,c as d,o as u,m as g,a as t,X as D,Y as $,$ as pe,l as he,u as me,a0 as fe,a1 as ve,v as B,n as v,x as i,Q as I,S as K,A as S,t as l,k,w as f,F as P,a2 as V,N as ge,p as ye,a3 as C,M as be,_ as Se}from"./index.BuKbf9fQ.js";import{s as we}from"./index.DbCD8hbv.js";var Me=({dt:s})=>`
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
`,$e={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Be=W.extend({name:"progressspinner",style:Me,classes:$e}),ke={name:"BaseProgressSpinner",extends:N,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:Be,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},q={name:"ProgressSpinner",extends:ke,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},_e=["fill","stroke-width"];function xe(s,e,a,p,m,r){return u(),d("div",g({class:s.cx("root"),role:"progressbar"},s.ptmi("root")),[(u(),d("svg",g({class:s.cx("spin"),viewBox:"25 25 50 50",style:r.svgStyle},s.ptm("spin")),[t("circle",g({class:s.cx("circle"),cx:"50",cy:"50",r:"20",fill:s.fill,"stroke-width":s.strokeWidth,strokeMiterlimit:"10"},s.ptm("circle")),null,16,_e)],16))],16)}q.render=xe;var Le=({dt:s})=>`
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
`,De={root:"p-scrollpanel p-component",contentContainer:"p-scrollpanel-content-container",content:"p-scrollpanel-content",barX:"p-scrollpanel-bar p-scrollpanel-bar-x",barY:"p-scrollpanel-bar p-scrollpanel-bar-y"},Te=W.extend({name:"scrollpanel",style:Le,classes:De}),ze={name:"BaseScrollPanel",extends:N,props:{step:{type:Number,default:5}},style:Te,provide:function(){return{$pcScrollPanel:this,$parentInstance:this}}},G={name:"ScrollPanel",extends:ze,inheritAttrs:!1,initialized:!1,documentResizeListener:null,documentMouseMoveListener:null,documentMouseUpListener:null,frame:null,scrollXRatio:null,scrollYRatio:null,isXBarClicked:!1,isYBarClicked:!1,lastPageX:null,lastPageY:null,timer:null,outsideClickListener:null,data:function(){return{orientation:"vertical",lastScrollTop:0,lastScrollLeft:0}},mounted:function(){this.$el.offsetParent&&this.initialize()},updated:function(){!this.initialized&&this.$el.offsetParent&&this.initialize()},beforeUnmount:function(){this.unbindDocumentResizeListener(),this.frame&&window.cancelAnimationFrame(this.frame)},methods:{initialize:function(){this.moveBar(),this.bindDocumentResizeListener(),this.calculateContainerHeight()},calculateContainerHeight:function(){var e=getComputedStyle(this.$el),a=getComputedStyle(this.$refs.xBar),p=pe(this.$el)-parseInt(a.height,10);e["max-height"]!=="none"&&p===0&&(this.$refs.content.offsetHeight+parseInt(a.height,10)>parseInt(e["max-height"],10)?this.$el.style.height=e["max-height"]:this.$el.style.height=this.$refs.content.offsetHeight+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)+"px")},moveBar:function(){var e=this;if(this.$refs.content){var a=this.$refs.content.scrollWidth,p=this.$refs.content.clientWidth,m=(this.$el.clientHeight-this.$refs.xBar.clientHeight)*-1;this.scrollXRatio=p/a;var r=this.$refs.content.scrollHeight,h=this.$refs.content.clientHeight,y=(this.$el.clientWidth-this.$refs.yBar.clientWidth)*-1;this.scrollYRatio=h/r,this.frame=this.requestAnimationFrame(function(){e.$refs.xBar&&(e.scrollXRatio>=1?(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&$(e.$refs.xBar,"p-scrollpanel-hidden")):(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&D(e.$refs.xBar,"p-scrollpanel-hidden"),e.$refs.xBar.style.cssText="width:"+Math.max(e.scrollXRatio*100,10)+"%; inset-inline-start:"+Math.abs(e.$refs.content.scrollLeft)/a*100+"%;bottom:"+m+"px;")),e.$refs.yBar&&(e.scrollYRatio>=1?(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&$(e.$refs.yBar,"p-scrollpanel-hidden")):(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&D(e.$refs.yBar,"p-scrollpanel-hidden"),e.$refs.yBar.style.cssText="height:"+Math.max(e.scrollYRatio*100,10)+"%; top: calc("+e.$refs.content.scrollTop/r*100+"% - "+e.$refs.xBar.clientHeight+"px); inset-inline-end:"+y+"px;"))})}},onYBarMouseDown:function(e){this.isYBarClicked=!0,this.$refs.yBar.focus(),this.lastPageY=e.pageY,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&$(this.$refs.yBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&$(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onXBarMouseDown:function(e){this.isXBarClicked=!0,this.$refs.xBar.focus(),this.lastPageX=e.pageX,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&$(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&$(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onScroll:function(e){this.lastScrollLeft!==e.target.scrollLeft?(this.lastScrollLeft=e.target.scrollLeft,this.orientation="horizontal"):this.lastScrollTop!==e.target.scrollTop&&(this.lastScrollTop=e.target.scrollTop,this.orientation="vertical"),this.moveBar()},onKeyDown:function(e){if(this.orientation==="vertical")switch(e.code){case"ArrowDown":{this.setTimer("scrollTop",this.step),e.preventDefault();break}case"ArrowUp":{this.setTimer("scrollTop",this.step*-1),e.preventDefault();break}case"ArrowLeft":case"ArrowRight":{e.preventDefault();break}}else if(this.orientation==="horizontal")switch(e.code){case"ArrowRight":{this.setTimer("scrollLeft",this.step),e.preventDefault();break}case"ArrowLeft":{this.setTimer("scrollLeft",this.step*-1),e.preventDefault();break}case"ArrowDown":case"ArrowUp":{e.preventDefault();break}}},onKeyUp:function(){this.clearTimer()},repeat:function(e,a){this.$refs.content[e]+=a,this.moveBar()},setTimer:function(e,a){var p=this;this.clearTimer(),this.timer=setTimeout(function(){p.repeat(e,a)},40)},clearTimer:function(){this.timer&&clearTimeout(this.timer)},onDocumentMouseMove:function(e){this.isXBarClicked?this.onMouseMoveForXBar(e):this.isYBarClicked?this.onMouseMoveForYBar(e):(this.onMouseMoveForXBar(e),this.onMouseMoveForYBar(e))},onMouseMoveForXBar:function(e){var a=this,p=e.pageX-this.lastPageX;this.lastPageX=e.pageX,this.frame=this.requestAnimationFrame(function(){a.$refs.content.scrollLeft+=p/a.scrollXRatio})},onMouseMoveForYBar:function(e){var a=this,p=e.pageY-this.lastPageY;this.lastPageY=e.pageY,this.frame=this.requestAnimationFrame(function(){a.$refs.content.scrollTop+=p/a.scrollYRatio})},onFocus:function(e){this.$refs.xBar.isSameNode(e.target)?this.orientation="horizontal":this.$refs.yBar.isSameNode(e.target)&&(this.orientation="vertical")},onBlur:function(){this.orientation==="horizontal"&&(this.orientation="vertical")},onDocumentMouseUp:function(){this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&D(this.$refs.yBar,"p-scrollpanel-grabbed"),this.$refs.xBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&D(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&D(document.body,"p-scrollpanel-grabbed"),this.unbindDocumentMouseListeners(),this.isXBarClicked=!1,this.isYBarClicked=!1},requestAnimationFrame:function(e){var a=window.requestAnimationFrame||this.timeoutFrame;return a(e)},refresh:function(){this.moveBar()},scrollTop:function(e){var a=this.$refs.content.scrollHeight-this.$refs.content.clientHeight;e=e>a?a:e>0?e:0,this.$refs.content.scrollTop=e},timeoutFrame:function(e){setTimeout(e,0)},bindDocumentMouseListeners:function(){var e=this;this.documentMouseMoveListener||(this.documentMouseMoveListener=function(a){e.onDocumentMouseMove(a)},document.addEventListener("mousemove",this.documentMouseMoveListener)),this.documentMouseUpListener||(this.documentMouseUpListener=function(a){e.onDocumentMouseUp(a)},document.addEventListener("mouseup",this.documentMouseUpListener))},unbindDocumentMouseListeners:function(){this.documentMouseMoveListener&&(document.removeEventListener("mousemove",this.documentMouseMoveListener),this.documentMouseMoveListener=null),this.documentMouseUpListener&&(document.removeEventListener("mouseup",this.documentMouseUpListener),this.documentMouseUpListener=null)},bindDocumentResizeListener:function(){var e=this;this.documentResizeListener||(this.documentResizeListener=function(){e.moveBar()},window.addEventListener("resize",this.documentResizeListener))},unbindDocumentResizeListener:function(){this.documentResizeListener&&(window.removeEventListener("resize",this.documentResizeListener),this.documentResizeListener=null)}},computed:{contentId:function(){return this.$id+"_content"}}},Re=["id"],Ae=["aria-controls","aria-valuenow"],Pe=["aria-controls","aria-valuenow"];function Ce(s,e,a,p,m,r){return u(),d("div",g({class:s.cx("root")},s.ptmi("root")),[t("div",g({class:s.cx("contentContainer")},s.ptm("contentContainer")),[t("div",g({ref:"content",id:r.contentId,class:s.cx("content"),onScroll:e[0]||(e[0]=function(){return r.onScroll&&r.onScroll.apply(r,arguments)}),onMouseenter:e[1]||(e[1]=function(){return r.moveBar&&r.moveBar.apply(r,arguments)})},s.ptm("content")),[he(s.$slots,"default")],16,Re)],16),t("div",g({ref:"xBar",class:s.cx("barx"),tabindex:"0",role:"scrollbar","aria-orientation":"horizontal","aria-controls":r.contentId,"aria-valuenow":m.lastScrollLeft,onMousedown:e[2]||(e[2]=function(){return r.onXBarMouseDown&&r.onXBarMouseDown.apply(r,arguments)}),onKeydown:e[3]||(e[3]=function(h){return r.onKeyDown(h)}),onKeyup:e[4]||(e[4]=function(){return r.onKeyUp&&r.onKeyUp.apply(r,arguments)}),onFocus:e[5]||(e[5]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)}),onBlur:e[6]||(e[6]=function(){return r.onBlur&&r.onBlur.apply(r,arguments)})},s.ptm("barx"),{"data-pc-group-section":"bar"}),null,16,Ae),t("div",g({ref:"yBar",class:s.cx("bary"),tabindex:"0",role:"scrollbar","aria-orientation":"vertical","aria-controls":r.contentId,"aria-valuenow":m.lastScrollTop,onMousedown:e[7]||(e[7]=function(){return r.onYBarMouseDown&&r.onYBarMouseDown.apply(r,arguments)}),onKeydown:e[8]||(e[8]=function(h){return r.onKeyDown(h)}),onKeyup:e[9]||(e[9]=function(){return r.onKeyUp&&r.onKeyUp.apply(r,arguments)}),onFocus:e[10]||(e[10]=function(){return r.onFocus&&r.onFocus.apply(r,arguments)})},s.ptm("bary"),{"data-pc-group-section":"bar"}),null,16,Pe)],16)}G.render=Ce;const He={class:"match"},Fe={class:"content"},Ue={key:0,class:"flex gap large wrap match-card-wrapper"},Ye={key:0,class:"wip-badge"},Xe={class:"card-header-container"},Ee=["alt","src"],Ie={key:0,class:"loading-overlay"},Ke={class:"text-center flex"},Ve={class:"text-center flex"},We={class:"flex text-center"},Ne={key:1,class:"match-result-screen"},qe={class:"result-container"},Ge={class:"result-header"},Oe={class:"result-title"},Qe={class:"result-subtitle"},je={class:"result-stats"},Je={class:"stat-row"},Ze={class:"stat-value"},et={class:"stat-row"},tt={class:"stat-value"},st={class:"stat-row"},nt={class:"stat-value"},at={class:"stat-row"},rt={class:"stat-value"},ot={class:"session-stats"},it={class:"stats-grid"},lt={class:"stat-item"},ct={class:"stat-number"},ut={class:"stat-item"},dt={class:"stat-number"},pt={class:"stat-item"},ht={class:"stat-number"},mt={class:"stat-item"},ft={class:"stat-number"},vt={class:"result-actions"},gt={key:2,class:"game-interface"},yt={class:"game-header"},bt={class:"match-info"},St={class:"match-type"},wt={class:"match-id"},Mt={class:"battle-area"},$t={class:"player-section"},Bt={class:"player-card"},kt={class:"player-info"},_t={class:"health-bar"},xt={class:"health-text"},Lt={key:0},Dt={class:"enemy-section"},Tt={class:"enemy-card"},zt={class:"enemy-info"},Rt={class:"health-bar"},At={class:"health-text"},Pt={key:0},Ct={class:"game-actions"},Ht={class:"action-panel"},Ft={class:"actions-grid"},Ut={class:"log-entries"},Yt={class:"log-timestamp"},Xt={class:"log-message"},Et={key:0,class:"log-entry system"},It=me({__name:"Match",setup(s){const e=fe(),a=ve(),{inLobby:p,inMatch:m,isFinished:r}=a,h=B(!0),y=B(!1),_=B(!1),b=B([]),w=B(null),F="/client_rune_dictionary/",U=B([{type:"pvp",title:"Player versus Player",subtitle:"Challenge other players to a duel",content:"Test your skills against other players in real-time combat using your runeabilities.",wip:!0,disabled:!0,loading:!1},{type:"pve",title:"Player versus Environment",subtitle:"Challenge the environment",content:"Face off against AI-controlled opponents and test your strategies.",wip:!1,disabled:!1,loading:!1}]);document.documentElement.style.setProperty("--match-bg-url",`url(${F}match.webp)`);async function O(o){console.log(`Selected match type: ${o.type}`),o.type==="pve"?await Q(o):await ae(o)}async function Q(o){if(!o.loading)try{if(o.loading=!0,z("pvp","disabled",!0),m.value){e.toast.error("You are already in a match","center");return}const n=await a.pve();console.log("PVE match created:",n),w.value="pve",j()}catch(n){console.error("PVE match error:",n),e.toast.error("Something went wrong","top-left")}finally{z("pvp","disabled",!0),o.loading=!1}}function j(){h.value=!0,y.value=!1,_.value=!1,b.value=[],M("system","Match started! It's your turn.")}function J(){return w.value?w.value==="pve"?"Player vs AI":"Player vs Player":"Unknown Match"}function T(){return w.value?w.value==="pve"?"AI Opponent":"Enemy Player":"Enemy"}async function Z(){if(!(!h.value||_.value))try{_.value=!0,a.matchStore.gameState.actionsPerformed++;const o=Math.floor(Math.random()*11)+15;if(a.matchStore.gameState.enemyHealth-=o,a.matchStore.gameState.enemyHealth<0&&(a.matchStore.gameState.enemyHealth=0),M("player",`You attack for ${o} damage! Enemy health: ${a.matchStore.gameState.enemyHealth}`),a.matchStore.gameState.enemyHealth<=0){H("victory");return}ee(),w.value==="pve"&&setTimeout(()=>{se()},1500)}catch(o){console.error("Attack failed:",o),e.toast.error("Attack failed","top-right")}finally{_.value=!1}}function ee(){h.value=!1,y.value=!0,M("system",`${T()}'s turn...`)}function te(){h.value=!0,y.value=!1,M("system","Your turn!")}function se(){const o=Math.floor(Math.random()*11)+10;if(a.matchStore.gameState.playerHealth-=o,a.matchStore.gameState.playerHealth<0&&(a.matchStore.gameState.playerHealth=0),M("enemy",`${T()} attacks for ${o} damage! Your health: ${a.matchStore.gameState.playerHealth}`),a.matchStore.gameState.playerHealth<=0){H("defeat");return}setTimeout(()=>{te()},1e3)}function H(o){M("system",`Match ended: ${o.toUpperCase()}!`);const n={result:o};a.onGameEvent({data:{type:"match.end",...n},client:{value:null},isValid:!0})}function M(o,n){b.value.unshift({type:o,message:n,timestamp:new Date}),b.value.length>50&&(b.value=b.value.slice(-50))}function ne(o){return o.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}async function ae(o){o.loading=!0,z("pve","disabled",!0),o.disabled=!0,z("pve","disabled",!1)}function z(o,n,x){const L=U.value.find(A=>A.type===o);L&&(L[n]=x)}function re(){var n;switch((n=a.matchStore.matchResult)==null?void 0:n.result){case"victory":return"Victory!";case"defeat":return"Defeat";case"draw":return"Draw";case"disconnect":return"Disconnected";default:return"Match Complete"}}function oe(){var n;switch((n=a.matchStore.matchResult)==null?void 0:n.result){case"victory":return"You have successfully defeated the AI opponent!";case"defeat":return"The AI opponent proved to be too strong this time.";case"draw":return"Both fighters fell in an epic battle!";case"disconnect":return"The match ended due to a connection issue.";default:return"The match has concluded."}}function ie(){var n;switch((n=a.matchStore.matchResult)==null?void 0:n.result){case"victory":return"pi pi-trophy";case"defeat":return"pi pi-times-circle";case"draw":return"pi pi-minus-circle";case"disconnect":return"pi pi-wifi";default:return"pi pi-check-circle"}}function le(){var n;switch((n=a.matchStore.matchResult)==null?void 0:n.result){case"victory":return"victory";case"defeat":return"defeat";case"draw":return"draw";case"disconnect":return"disconnect";default:return"default"}}function ce(o){const n=Math.floor(o/60),x=o%60;return`${n}:${x.toString().padStart(2,"0")}`}function R(){return a.getMatchStats()}async function ue(){try{await a.startRematch()}catch(o){console.error("Failed to start rematch:",o)}}function de(){a.returnToLobby()}return(o,n)=>{var L,A,Y,X;const x=be("ripple");return u(),d("div",He,[t("div",{class:S(["viewport",{opaque:i(p),background:i(m)}])},[t("div",Fe,[i(p)?(u(),d("div",Ue,[(u(!0),d(I,null,K(U.value,c=>(u(),d("div",{key:c.type,class:"match-card-wrapper-outer"},[c.wip?(u(),d("span",Ye,"WIP")):v("",!0),ge((u(),ye(i(we),{class:S(["match-card",c.type,{disabled:c.disabled||c.loading,loading:c.loading}]),onClick:E=>!c.disabled&&!c.loading&&O(c)},{header:f(()=>[t("div",Xe,[t("img",{alt:`${c.type} header`,class:"card-image",src:`${i(F)}match.webp`},null,8,Ee),c.loading?(u(),d("div",Ie,[k(i(q),{size:"large","stroke-width":"3"}),n[1]||(n[1]=t("p",null,"Starting match...",-1))])):v("",!0)])]),title:f(()=>[t("span",Ke,l(c.title),1)]),subtitle:f(()=>[t("span",Ve,l(c.subtitle),1)]),content:f(()=>[t("p",We,l(c.content),1)]),_:2},1032,["class","onClick"])),[[x]])]))),128))])):v("",!0),i(r)?(u(),d("div",Ne,[t("div",qe,[t("div",Ge,[t("div",{class:S(["result-icon",le()])},[t("i",{class:S(ie())},null,2)],2),t("h2",Oe,l(re()),1),t("p",Qe,l(oe()),1)]),t("div",je,[t("div",Je,[n[2]||(n[2]=t("span",{class:"stat-label"},"Match Duration:",-1)),t("span",Ze,l(ce(((L=i(a).matchStore.matchResult)==null?void 0:L.duration)||0)),1)]),t("div",et,[n[3]||(n[3]=t("span",{class:"stat-label"},"Your Health:",-1)),t("span",tt,l(((A=i(a).matchStore.matchResult)==null?void 0:A.playerHealth)||0)+" HP",1)]),t("div",st,[n[4]||(n[4]=t("span",{class:"stat-label"},"Enemy Health:",-1)),t("span",nt,l(((Y=i(a).matchStore.matchResult)==null?void 0:Y.enemyHealth)||0)+" HP",1)]),t("div",at,[n[5]||(n[5]=t("span",{class:"stat-label"},"Actions Performed:",-1)),t("span",rt,l(((X=i(a).matchStore.matchResult)==null?void 0:X.actionsPerformed)||0),1)])]),t("div",ot,[n[10]||(n[10]=t("h3",null,"Session Statistics",-1)),t("div",it,[t("div",lt,[t("span",ct,l(R().victories),1),n[6]||(n[6]=t("span",{class:"stat-text"},"Victories",-1))]),t("div",ut,[t("span",dt,l(R().defeats),1),n[7]||(n[7]=t("span",{class:"stat-text"},"Defeats",-1))]),t("div",pt,[t("span",ht,l(R().winRate)+"%",1),n[8]||(n[8]=t("span",{class:"stat-text"},"Win Rate",-1))]),t("div",mt,[t("span",ft,l(R().totalMatches),1),n[9]||(n[9]=t("span",{class:"stat-text"},"Total Matches",-1))])])]),t("div",vt,[k(i(P),{onClick:ue,severity:"success",size:"large",class:"rematch-button"},{default:f(()=>n[11]||(n[11]=[t("i",{class:"pi pi-refresh"},null,-1),C(" Rematch ")])),_:1}),k(i(P),{onClick:de,severity:"secondary",size:"large",class:"lobby-button"},{default:f(()=>n[12]||(n[12]=[t("i",{class:"pi pi-home"},null,-1),C(" Return to Lobby ")])),_:1})])])])):v("",!0),i(m)?(u(),d("div",gt,[t("div",yt,[t("div",bt,[t("span",St,l(J()),1),t("span",wt,"Match: "+l(i(a).matchStore.currentMatchId||"Unknown"),1)])]),t("div",Mt,[t("div",$t,[t("div",Bt,[n[14]||(n[14]=t("div",{class:"player-avatar"},[t("i",{class:"pi pi-user",style:{"font-size":"2rem",color:"var(--p-primary-color)"}})],-1)),t("div",kt,[n[13]||(n[13]=t("h3",null,"You",-1)),t("div",_t,[t("div",{class:"health-fill",style:V({width:`${i(a).matchStore.gameState.playerHealth/i(a).matchStore.gameState.playerMaxHealth*100}%`})},null,4),t("span",xt,l(i(a).matchStore.gameState.playerHealth)+" / "+l(i(a).matchStore.gameState.playerMaxHealth),1)])]),t("div",{class:S(["turn-indicator",{active:h.value}])},[h.value?(u(),d("span",Lt,"Your Turn")):v("",!0)],2)])]),n[16]||(n[16]=t("div",{class:"vs-divider"},[t("span",{class:"vs-text"},"VS")],-1)),t("div",Dt,[t("div",Tt,[n[15]||(n[15]=t("div",{class:"enemy-avatar"},[t("i",{class:"pi pi-android",style:{"font-size":"2rem",color:"var(--p-orange-500)"}})],-1)),t("div",zt,[t("h3",null,l(T()),1),t("div",Rt,[t("div",{class:"health-fill enemy",style:V({width:`${i(a).matchStore.gameState.enemyHealth/i(a).matchStore.gameState.enemyMaxHealth*100}%`})},null,4),t("span",At,l(i(a).matchStore.gameState.enemyHealth)+" / "+l(i(a).matchStore.gameState.enemyMaxHealth),1)])]),t("div",{class:S(["turn-indicator",{active:y.value}])},[y.value?(u(),d("span",Pt,l(T())+"'s Turn",1)):v("",!0)],2)])])]),t("div",Ct,[t("div",Ht,[n[19]||(n[19]=t("h4",null,"Actions",-1)),t("div",Ft,[k(i(P),{disabled:!h.value||_.value,onClick:Z,severity:"danger",size:"large",class:"attack-button"},{default:f(()=>n[17]||(n[17]=[t("i",{class:"pi pi-bolt"},null,-1),C(" Attack ")])),_:1},8,["disabled"]),k(i(P),{onClick:n[0]||(n[0]=c=>H("victory")),severity:"success",size:"small",class:"demo-button"},{default:f(()=>n[18]||(n[18]=[t("i",{class:"pi pi-trophy"},null,-1),C(" Test Victory ")])),_:1})])])]),k(i(G),{class:"game-log",style:{height:"200px",width:"100%"}},{default:f(()=>[n[21]||(n[21]=t("h4",null,"Combat Log",-1)),t("div",Ut,[(u(!0),d(I,null,K(b.value,(c,E)=>(u(),d("div",{key:E,class:S(["log-entry",c.type])},[t("span",Yt,l(ne(c.timestamp)),1),t("span",Xt,l(c.message),1)],2))),128)),b.value.length===0?(u(),d("div",Et,n[20]||(n[20]=[t("span",{class:"log-message"},"Match started! Waiting for first turn...",-1)]))):v("",!0)])]),_:1})])):v("",!0)])],2)])}}}),Wt=Se(It,[["__scopeId","data-v-4f5aaa29"]]);export{Wt as default};
