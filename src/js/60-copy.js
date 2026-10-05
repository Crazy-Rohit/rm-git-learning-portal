/* Copy button on every <pre>; copies only the "$ " command lines when present. */
function codeText(pre){
  var code=pre.querySelector('code')||pre;
  var lines=code.innerText.replace(/\n$/,'').split('\n');
  var cmds=lines.filter(function(l){return /^\$ /.test(l)}).map(function(l){return l.slice(2)});
  return (cmds.length?cmds:lines).join('\n');
}
function copyText(t){
  if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(t)}
  return new Promise(function(res,rej){var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')?res():rej()}catch(e){rej(e)}document.body.removeChild(ta)});
}
$$('pre').forEach(function(pre){
  var b=document.createElement('button');b.type='button';b.className='copy';b.setAttribute('aria-label','Copy commands');
  b.innerHTML='<svg class="i"><use href="#i-copy"/></svg><span>Copy</span>';
  pre.appendChild(b);
  b.addEventListener('click',function(){
    copyText(codeText(pre)).then(function(){b.classList.add('done');b.querySelector('span').textContent='Copied';setTimeout(function(){b.classList.remove('done');b.querySelector('span').textContent='Copy'},1600)},function(){b.querySelector('span').textContent='Press Ctrl+C';setTimeout(function(){b.querySelector('span').textContent='Copy'},1600)});
  });
});
