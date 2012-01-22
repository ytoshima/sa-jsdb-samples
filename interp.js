/**
 * author: @ytoshima
 */

/**
 * Prints codelets summary
 * Each entry is an instance of sun.jvm.hotspot.interpreter.InterpreterCodelet.
 * forEachInterpCodelet iterates through Codelets in template interpreter
 * (AbstractInterpreter).  Entries may be a various kind of handler,
 * a return entry, a deoptimization entry, a safepoint entry,
 * a method entry, a intrinsic?, a bytecode, a fastbytecode, etc.
 */
function printCodeletSummary() {
  forEachInterpCodelet(function(clet) {
    println("# " + clet.toString());
    println(" desc: " + clet.description);
    println(" addr: " + clet.address);
    println(" size: " + clet.size + " , codeSize: " + clet.codeSize());
    println(" (begin,end): (" + clet.codeBegin() + "," + clet.codeEnd() + ")");
  });
}
