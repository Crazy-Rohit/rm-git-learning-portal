/* Gives every chapter <h3> an id (chN-sM) and a "#" anchor link.
   The sidebar sub-links (40-sidebar.js) rely on these ids. */
chapters.forEach(function(ch){
  $$('h3',ch).forEach(function(h,i){
    h.id=ch.id+'-s'+(i+1);
    var a=document.createElement('a');a.className='anchor';a.href='#'+h.id;a.textContent='#';a.setAttribute('aria-label','Link to this section');h.insertBefore(a,h.firstChild);
  });
});
