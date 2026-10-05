/* Exercise checkboxes persisted in localStorage; sidebar ticks and progress bar. */
var boxes=$$('.tasks input');
function updateDone(){
  var tot=boxes.length,done=boxes.filter(function(b){return b.checked}).length;
  $('#xpText').textContent='Exercises done: '+done+' of '+tot;
  $('#xpBar').style.width=(tot?done/tot*100:0)+'%';
  chapters.forEach(function(ch){
    var bs=$$('.tasks input',ch),all=bs.length>0&&bs.every(function(b){return b.checked});
    var a=$('a[data-ch="'+ch.id+'"]',toc);if(a)a.classList.toggle('done',all);
  });
}
boxes.forEach(function(c){
  c.checked=store.get('hb-'+c.getAttribute('data-k'))==='1';
  c.addEventListener('change',function(){store.set('hb-'+c.getAttribute('data-k'),c.checked?'1':'0');updateDone()});
});
updateDone();
