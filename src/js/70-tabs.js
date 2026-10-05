/* Accessible tabs; OS tabs (data-os) auto-select from the user agent. */
$$('.tabs').forEach(function(g){
  var btns=$$('[role=tab]',g),panels=$$('[role=tabpanel]',g);
  function sel(i){btns.forEach(function(b,j){b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1});panels.forEach(function(p,j){p.hidden=j!==i})}
  btns.forEach(function(b,i){b.addEventListener('click',function(){sel(i)})});
  g.addEventListener('keydown',function(e){
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    var i=btns.findIndex(function(b){return b.getAttribute('aria-selected')==='true'});
    var n=(i+(e.key==='ArrowRight'?1:-1)+btns.length)%btns.length;sel(n);btns[n].focus();
  });
  var ua=navigator.userAgent,start=0;
  if(g.getAttribute('data-os')){if(/Mac/.test(ua)&&!/iPhone|iPad/.test(ua))start=1;else if(/Linux|X11/.test(ua)&&!/Android/.test(ua))start=2}
  sel(start);
});
