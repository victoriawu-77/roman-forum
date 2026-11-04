(function(){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function init(){
    const targets=document.querySelectorAll(".m2-lede,.m2-fade");
    document.querySelectorAll(".mid2 ol").forEach(ol=>[...ol.children].forEach((li,i)=>li.style.setProperty("--d",i*0.08+"s")));
    if(reduced||!("IntersectionObserver" in window)){targets.forEach(t=>t.classList.add("is-in"));}
    else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-in");io.unobserve(e.target);}}),{threshold:.15,rootMargin:"0px 0px -6% 0px"});targets.forEach(t=>io.observe(t));}
    const sec=document.querySelector(".m2-time"),fill=document.querySelector(".m2-fill");
    if(!sec||!fill)return;
    const up=()=>{if(reduced){fill.style.width="100%";return;}const r=sec.getBoundingClientRect(),v=innerHeight;const t=Math.max(0,Math.min(1,(v*0.9-r.top)/(v*0.5)));fill.style.width=t*100+"%";};
    addEventListener("scroll",up,{passive:true});addEventListener("resize",up);up();
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
