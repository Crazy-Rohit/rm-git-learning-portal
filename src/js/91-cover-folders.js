/* Fold / unfold the part folders in the cover file browser. */
$$('.fbg > .fold').forEach(function(f){function t(){f.parentNode.classList.toggle('open')}f.addEventListener('click',t);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}})});
