import{d as u,u as i,s as l,a as d,c as m,b as p,e as f,f as _,g,o as h,_ as w}from"./index.CpNmOZPM.js";import{A as L,L as b}from"./LoginForm.BzHMsZMp.js";import"./index.BCTvQpqj.js";const v={class:"login-container flex justify-center items-center min-h-screen bg-surface-ground"},x={class:"w-full max-w-md"},A=u({__name:"Login",setup(k){const n=new L,s=i(),r=g(),{loading:o}=l(s),a=d();async function c(e){try{s.username=e.username,s.password=e.password,o.value=!0;const t=await n.login(e.username,e.password);s.setAuthorized(t.authorized),a.toast.success("Login successful"),r.push("/app"),setTimeout(()=>{o.value=!1},1001)}catch{o.value=!1,a.toast.error("Failed to login. Please check your credentials.")}}return(e,t)=>(h(),m("div",v,[p("div",x,[f(b,{title:"Welcome Back",submitLabel:"Sign In",showPassword:!0,loading:_(o),onSubmit:c},null,8,["loading"])])]))}}),I=w(A,[["__scopeId","data-v-8465eeec"]]);export{I as default};
