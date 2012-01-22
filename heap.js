/**
 * Prints java heap information
 * author: ytoshima
 */

/**
 * Check java heap related falgs and returns a map which contains the
 * flag name and its value pairs.
 */
function getHeapFlags() {
  var heapTypeFlags = ['UseParallelGC', 'UseConcMarkSweepGC', 'UseParNew', 'UseSerialGC', 'UseG1GC'];
  var heapFlags = {};
  for (i = 0; i < heapTypeFlags.length; i++) {
    var f = heapTypeFlags[i];
    var addr = sym2addr("libjvm.so", f);
    if (addr != undefined) {
      var val = readBytesAt(addr, 1)[0];
      heapFlags[f] = val;
    }
  }
  return heapFlags;
}

/**
 * Returns base class name (after the last dot) of fully qualified
 * class name.
 */
function baseClassName(fqcn) {
  var lastDotLoc = fqcn.lastIndexOf('.');
  // str.substr(str.length) does not throw an exception.  Rely on the
  // behavior for now.
  // if '.' was not fund, lastDotLoc is -1, thus returns fqcn.substr(0)=fqcn.
  return fqcn.substr(lastDotLoc+1);
}

function formatSpace(space, name) {
  return name + " space " + space.capacity()/1024 + "K, " + 
          (100*space.used()/space.capacity()).toFixed(2) + 
          "% used [" + 
          space.bottom() + ", " + space.top() + ", " + 
          space.end() + ")";
}

/**
 * Print Generation and Space information of java heap.
 * Currently, only YoungGen in ParallelScavengeHeap for 
 * 32-bit is implemented.
 */
function printCollectedHeap() {
  var heapFlags = getHeapFlags();
  if (heapFlags['UseParallelGC'] > 0) {
    // newVMObject(addr) does not work, so it needs to be instanciated in
    // longer way.  whatis(addr) returns ParallelScavengeHeap, though.
    importPackage(Packages.sun.jvm.hotspot.gc_implementation.parallelScavenge);
    if (jvm.addressSize == 32) {
      // Get the address of Universe::_collectedHeap
      // sym2addr does not perform mangling...
      var addr = sym2addr("libjvm.so", "_ZN8Universe14_collectedHeapE");
      // readWordsAt(addr, num-words) returns long[] and its elements are
      // valid addresses.  Same can be done by manipulating readBytesAt()
      // result, but byte-swap needs to be done manually on little-endian
      // system. 
      var heapAddr = readWordsAt(addr, 1)[0];
      var psh      = new ParallelScavengeHeap(num2addr(heapAddr));
      var youngGen = psh.youngGen();
      var oldGen   = psh.oldGen();
      var permGen  = psh.permGen();

      println("Young Gen: " + baseClassName(youngGen.getClass().name));
      print("  capacity: " + youngGen.capacity()/1024 + "k ");
      println("  used: " + (youngGen.used()/1024).toFixed(2) + "k ");
      // spaces are instances of MutableSpace
   
      var edenSpace = youngGen.edenSpace();      
      var fromSpace = youngGen.fromSpace();      
      var toSpace = youngGen.toSpace();      
      println("  " + formatSpace(edenSpace, "eden"));
      println("  " + formatSpace(fromSpace, "from"));
      println("  " + formatSpace(toSpace,   "to  "));

    } else if (jvm.addressSize == 64) {
      println("64 bit is not supported yet.");
    }
  }
}

/**
 *
 */
function heapInfo() {
  var heapTypeFlags = ['UseParallelGC', 'UseConcMarkSweepGC', 'UseParNew', 'UseSerialGC', 'UseG1GC'];
  for (i = 0; i < heapTypeFlags.length; i++) {
    var f = heapTypeFlags[i];
    var addr = sym2addr("libjvm.so", f);
    if (addr != undefined) {
      var val = readBytesAt(addr, 1)[0];
      println(f + " = " + val);
    }
  }
}

