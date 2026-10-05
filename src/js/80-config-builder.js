/* Chapter 5 live "git config" command builder. */
var fName=$('#cfgName'),fEmail=$('#cfgEmail'),fEd=$('#cfgEditor'),fOs=$('#cfgOs'),out=$('#cfgOut');
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function q(s){return '"'+s.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"'}
function renderCfg(){
  var n=fName.value.trim()||'Your Name',e=fEmail.value.trim()||'you@example.com';
  var ed={vscode:'code --wait',nano:'nano',vim:'vim'}[fEd.value];
  var crlf=fOs.value==='windows'?'true':'input';
  var P='<span class="p">$</span> ';
  out.innerHTML=
    '<span class="c"># who you are</span>\n'+
    P+'git config --global user.name '+esc(q(n))+'\n'+
    P+'git config --global user.email '+esc(q(e))+'\n\n'+
    '<span class="c"># defaults</span>\n'+
    P+'git config --global init.defaultBranch main\n'+
    P+'git config --global core.editor '+esc(q(ed))+'\n'+
    P+'git config --global core.autocrlf '+crlf+'\n\n'+
    '<span class="c"># check</span>\n'+
    P+'git config --list';
}
[fName,fEmail,fEd,fOs].forEach(function(el){el.addEventListener('input',renderCfg);el.addEventListener('change',renderCfg)});
renderCfg();
