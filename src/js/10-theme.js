/* Light / dark theme toggle, persisted in localStorage (hb-theme). */
var mq=window.matchMedia('(prefers-color-scheme: dark)');
function effective(){return root.getAttribute('data-theme')||(mq.matches?'dark':'light')}
function paintTheme(){var d=effective()==='dark';$('#themeBtn use').setAttribute('href',d?'#i-sun':'#i-moon');$('#themeBtn').setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')}
$('#themeBtn').addEventListener('click',function(){var n=effective()==='dark'?'light':'dark';root.setAttribute('data-theme',n);store.set('hb-theme',n);paintTheme()});
if(mq.addEventListener)mq.addEventListener('change',paintTheme);
paintTheme();
