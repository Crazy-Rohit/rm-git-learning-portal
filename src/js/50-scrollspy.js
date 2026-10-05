/* Highlights the current chapter/section in the sidebar and drives the header progress bar. */
var marks=$$('.chapter h3'),ticking=false,lastKey='';
function setActive(chId,subId,coverId){
  var key=chId+'|'+subId+'|'+coverId;if(key===lastKey)return;lastKey=key;
  $$('a.active',toc).forEach(function(a){a.classList.remove('active')});
  $$('.subs',toc).forEach(function(s){s.classList.toggle('open',s.getAttribute('data-for')===chId)});
  var link=null;
  if(subId){link=$('a[data-sub="'+subId+'"]',toc)}else if(chId){link=$('a[data-ch="'+chId+'"]',toc)}else if(coverId){link=$('a[data-nav="'+coverId+'"]',toc)}
  if(link){link.classList.add('active');var gg=link.closest('.grp');if(gg)openGroup(gg);
    if(chId&&subId){var p=$('a[data-ch="'+chId+'"]',toc);if(p)p.classList.add('active')}
    var side=$('#side'),r=link.getBoundingClientRect(),sr=side.getBoundingClientRect();
    if(r.top<sr.top+60||r.bottom>sr.bottom-20){side.scrollTop+=r.top-sr.top-sr.height/3}}
}
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(function(){
    ticking=false;
    var d=document.documentElement,max=d.scrollHeight-d.clientHeight;
    $('#bar').style.width=(max>0?Math.min(100,d.scrollTop/max*100):0)+'%';
    var curCh=null,curSub=null,cover=$('#how').getBoundingClientRect().top<=160?'how':'cover';
    chapters.forEach(function(ch){if(ch.getBoundingClientRect().top<=160)curCh=ch});
    if(curCh){marks.forEach(function(m){if(curCh.contains(m)&&m.getBoundingClientRect().top<=160)curSub=m})}
    setActive(curCh?curCh.id:'',curSub?curSub.id:'',curCh?'':cover);
  });
}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);onScroll();
