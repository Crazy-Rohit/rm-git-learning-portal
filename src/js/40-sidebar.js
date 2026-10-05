/* Builds the sidebar TOC from .part and .chapter elements; filter box, "t" shortcut, mobile drawer. */
var toc=$('#toc');
function icon(id){return '<svg class="i"><use href="#'+id+'"/></svg>'}
var h='<a href="#cover" data-nav="cover">'+icon('i-book')+'Cover</a><a href="#how" data-nav="how">'+icon('i-info')+'How to read this handbook</a>';
$$('.part').forEach(function(pt){
  var n=pt.getAttribute('data-n');
  h+='<div class="grp" data-part="'+n+'"><button type="button" class="gh" aria-expanded="false"><svg class="i chev"><use href="#i-chev"/></svg>'+icon('i-folder')+'<span>Part '+n+': '+pt.getAttribute('data-title')+'</span></button><div class="gbody">';
  chapters.filter(function(c){return c.getAttribute('data-part')===n}).forEach(function(ch){
    var subs=$$('h3',ch).map(function(x){return '<a href="#'+x.id+'" data-sub="'+x.id+'">'+x.textContent.replace(/^#/,'')+'</a>'}).join('');
    h+='<a href="#'+ch.id+'" data-ch="'+ch.id+'"><span class="num">'+ch.getAttribute('data-no')+'</span><span>'+ch.getAttribute('data-title')+'</span><span class="ok">'+icon('i-checkc')+'</span></a><div class="subs" data-for="'+ch.id+'">'+subs+'</div>';
  });
  h+='</div></div>';
});
toc.innerHTML=h;
function openGroup(g){g.classList.add('open');var b=$('.gh',g);if(b)b.setAttribute('aria-expanded','true')}
$$('.gh',toc).forEach(function(b){b.addEventListener('click',function(){var g=b.parentNode,o=g.classList.toggle('open');b.setAttribute('aria-expanded',String(o))})});

/* filter and shortcut */
var filter=$('#filter');
filter.addEventListener('input',function(){
  var q=filter.value.trim().toLowerCase();
  $$('a[data-ch]',toc).forEach(function(a){var s=a.textContent.toLowerCase();var hit=!q||s.indexOf(q)>-1;a.style.display=hit?'':'none';var sub=$('.subs[data-for="'+a.getAttribute('data-ch')+'"]',toc);if(q&&sub)sub.style.display='none';else if(sub)sub.style.display=''});
});
filter.addEventListener('keydown',function(e){if(e.key==='Enter'){var a=$$('a[data-ch]',toc).filter(function(x){return x.style.display!=='none'})[0];if(a){location.hash=a.getAttribute('href');filter.blur()}}});
document.addEventListener('keydown',function(e){
  var tag=(e.target.tagName||'').toLowerCase();
  if(e.key==='Escape'){document.body.classList.remove('nav-open')}
  if(e.key==='t'&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&tag!=='input'&&tag!=='textarea'&&tag!=='select'){e.preventDefault();document.body.classList.add('nav-open');filter.focus()}
});

filter.addEventListener('input',function(){var q=filter.value.trim();toc.classList.toggle('filtering',!!q);$$('.grp',toc).forEach(function(g){var vis=$$('a[data-ch]',g).some(function(a){return a.style.display!=='none'});g.style.display=(!q||vis)?'':'none'})});
/* mobile drawer */
$('#menuBtn').addEventListener('click',function(){document.body.classList.toggle('nav-open')});
$('#scrim').addEventListener('click',function(){document.body.classList.remove('nav-open')});
toc.addEventListener('click',function(e){if(e.target.closest('a'))document.body.classList.remove('nav-open')});
