/* Save-as-PDF buttons; open all <details> before printing. */
function doPrint(){try{window.print()}catch(e){}}
$('#printBtn').addEventListener('click',doPrint);
$$('[data-print]').forEach(function(b){b.addEventListener('click',doPrint)});
window.addEventListener('beforeprint',function(){$$('details').forEach(function(d){d.open=true})});
