/* Shared helpers used by every module. All js/*.js files are concatenated
   (in filename order) into one IIFE by build.js, so anything declared here
   with `var` is visible to the other modules. */
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var root=document.documentElement;
var chapters=$$('.chapter');
