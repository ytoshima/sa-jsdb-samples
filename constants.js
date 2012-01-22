/**
 * print Int/Long constants
 * See hotspot/agent/doc/jsdb.html
 * author: ytoshima
 */

/**
 * print Int constants
 */
function printIntConstants() {
  var arr = new Array();
  forEachVMIntConst(function(nm) { arr.push(nm); });
  arr.sort();
  // 'for in' does not work with array.
  for (i=0; i<arr.length; i++) println(arr[i] + ": " + findVMIntConst(arr[i]));
}

/**
 * print Long constants
 */
function printLongConstants() {
  var arr = new Array();
  forEachVMLongConst(function(nm) { arr.push(nm); });
  arr.sort();
  // 'for in' does not work with array.
  for (i=0; i<arr.length; i++) println(arr[i] + ": " + findVMLongConst(arr[i]));
}

/**
 * print both Int and Long constants.
 */
function printConstatns() {
  printIntConstants();
  printLongConstants();
}

/**
 * print constants.
 */
function vmconstants() {
  printConstatns();
}
