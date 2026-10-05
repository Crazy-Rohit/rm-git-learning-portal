/* Multiple-choice quizzes: reveal right/wrong and the explanation. */
$$('.quiz .q').forEach(function(q){
  var ans=parseInt(q.getAttribute('data-a'),10),opts=$$('.opt',q);
  opts.forEach(function(o,i){o.addEventListener('click',function(){
    if(q.getAttribute('data-done'))return;q.setAttribute('data-done','1');
    opts.forEach(function(x,j){x.disabled=true;if(j===ans)x.classList.add('right')});
    if(i!==ans)o.classList.add('wrong');
    var e=$('.qe',q);if(e)e.hidden=false;
  })});
});
