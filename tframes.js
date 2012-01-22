/**
 * author: ytoshima
 */

/**
 * Returns string representation of thread in high-level interface, i.e.
 * jvm.threads[n].
 */
function threadToString(thr) {
  return "Thread " + thr.tid + " " + thr.name + " " + + thr.priority + " " + thr.threadStatus
}

/**
 * Returns string representation of a frame in high-level interface, i.e.
 * jvm.threads[n].frames[m].
 */
function frameToString(fr) {
  try {
    return "fr bci=" + fr.bci + " this=" + fr.thisObject + " thr=" + 
        fr.thread + " line=" + fr.line
  } catch (e) {
    return "e: " + e.toString()
  }
}

/**
 * Returns string representation of method of high-level interface, e.g.
 * jvm.threads[n].frames[m].method
 */
function methodToString(m) {
  return m.holder.name + "::" + m.name + " " + m.signature
}

/**
 * Returns string representation of locals of high-level interface.
 * Since jvm.threads[n].frames[m].locals does not look valid,
 * interpretation mostly fails.
 */
function localsToString(ls) {
  if (ls == undefined || ls.length == undefined) {
    return "<n/a>";
  } else {
    return "[" + ls.join(", ") + "]";
  }
}

/**
 * Prints thread info using SA's high-level interface.
 * Unfortunatelly, this does not work well.  It cannot access locals
 */
function threads_high_api() {
  var threads = jvm.threads
  for (i=0; i< threads.length; i++) {
    // println("Thread " + threads[i].tid + " " + threads[i].name);
    println(threadToString(threads[i]));
    var frames = threads[i].frames
    println(" frames length " + frames.length);
    for (j=0; j<frames.length; j++) {
      println("  " + frameToString(frames[j]));
      println("  " + methodToString(frames[j].method));
      try {
        println("  " + localsToString(frames[j].locals));
      } catch (e) {
        println("  e: " + e);
      }
    }
  }
}

/**
 * Convert StackValue to readable string
 */
function sv2string(sv) {
  importPackage(Packages.sun.jvm.hotspot.runtime);
  switch (sv.type) {
  case BasicType.tBoolean:
    return sv.integer == 1 ? "true" : "false"
  case BasicType.tChar:
    return String.fromCharCode(sv.integer);
  case BasicType.tFloat:
  case BasicType.tDouble:
    return "floating point is not yet supported.";
  case BasicType.tByte:
  case BasicType.tShort:
  case BasicType.tInt:
    return sv.integer.toString();
  case BasicType.tLong:
    return "long is not supported yet";
  case BasicType.tObject:
    //return sv.getObject().toString();
    return addr2oop(sv.getObject()).klass.name.asString() + "@" + sv.getObject()
  default:
    return "type=" + sv.type + " is not supported";
  } 
}

/**
 * Returns string representation of locals array.
 * locals is a sun/jvm/hotspot/runtime/StackValueCollection .
 */
function locals2string(lcls) {
  var arr = new Array();
  for (i=0; i<lcls.size(); i++) {
    arr.push(sv2string(lcls.get(i)));
  }
  return "[" + arr.join(",") + "]"
}

/**
 * Returns string representation of sun/jvm/hotspot/oops/Method
 */
function method2string(m) {
  // name and signature are Symbol, thus asString needs to be called.
  // Otherwise, they become '...Symbol@0x...'.
  return m.methodHolder.name.asString() + "." + m.name.asString() + " " + m.signature.asString()
}

/**
 * Processes some fields of
 * sun.jvm.hotspot.runtime.JavaVFrame
 * Real object might be sun.jvm.hotspot.runtime.InterpretedVFrame, etc
 */
function vframe2string(vf) {
  return "vfr method " + method2string(vf.method) + " sp=" + vf.frame.SP + 
      "\n    locals: " +  vf.locals.size() + " " + locals2string(vf.locals);
}

/**
 * Returns string representation of sun/jvm/hotspot/runtime/MonitorInfo
 * The owner is assigned to owner field if !ownerIsScalarReplaced.
 * Otherwise, ownerKlass has the owner.
 */
function monitor2string(m) {
  var owner = 
    m.ownerIsScalarReplaced() ? m.ownerKlass() : m.owner();
  var ownerStr = "<unkonwn>";
  try {
    ownerStr = addr2oop(owner).klass.name.asString() + "@" + owner;
  } catch (e) {}

  return "Mon("+ ownerStr + "," + m.lock() +")";
}

/**
 * Process sun.jvm.hotspot.runtime.MonitorInfo List.
 */
function monitors2string(vf) {
  var arr = new Array();
  // 'for in' does not work for java.util.List
  for (i=0; i<vf.monitors.size(); i++) {
    arr.push(monitor2string(vf.monitors.get(i)));
  }

  return "[" + arr.join(",") + "]";
}

/**
 * Processes some fields of
 * sun.jvm.hotspot.runtime.JavaThread
 */
function javaThread2String(thr) {
  return "JavaThread " + thr.getThreadName() + " sbase=" + thr.getStackBase() + " ssz=" + thr.getStackSize() + " lastJavaFP=" + thr.getLastJavaFP();
}

/**
 * Print threads using low-level interface.
 */
function threads_low_api() {
  forEachJavaThread(function(t) {
    println(javaThread2String(t));

    /* forEachFrame does not work...
    try {
      forEachFrame(t, function(f) {
        println(" f: " + f);
      });
    } catch (e) {
      println(" e: " + e);
    }
    */

    try {
      forEachVFrame(t, function(f) {
        try {
          println("  " + vframe2string(f));
          if (f.monitors.size() > 0) { 
            println("    monitors: " + monitors2string(f));
          }
        } catch (e) {
          println("  Error processing vframe: " + e.toString());
        }
      });
    } catch (e) {
      println("  e forEachVFrame: " + e);
    }
  });
}
