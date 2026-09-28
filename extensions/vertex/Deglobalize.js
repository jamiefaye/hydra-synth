import { Parser } from 'acorn'

// The synth globals a sketch reads live: `time` in `() => time * 0.1` must be read every frame, but
// the function the eval builds would capture a primitive's value once. So every *reference* to one
// of these names becomes a member expression on the prefix (`_h.time`), which reads through.
const watchListArray = ['time', 'fps', 'speed', 'bpm']
const watchList = new Set(watchListArray)
const SKIP_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'comments', 'leadingComments', 'trailingComments'])
const PREFIX = 'async function* f() {\n'

/**
 * Rewrite references to the watched globals as `prefix.name`. Only references: a declaration
 * (`let time = 5`), a parameter (`(speed) => ...`), an object key (`{ time: 1 }`), a member name
 * (`foo.speed`), a label or an import name is not a reference and is left as written. A name the
 * sketch declares itself is the sketch's own and is left alone everywhere. `{ time }` shorthand
 * becomes `{ time: prefix.time }`. Text that will not parse comes back unchanged (the eval reports
 * the error).
 *
 * The rewrite splices the text at the identifiers' own spans (acorn's start/end) rather than
 * regenerating the program, so everything else is as written: comments, spacing, and above all
 * line and column numbers, which is what lets an error in the eval point at the editor's line.
 */
function Deglobalize (textIn, prefix) {
  // filter-out "zero length space" characters.
  const textCleaned = textIn.replace(/[\u200B-\u200D\uFEFF]/g, '')
  const text = PREFIX + textCleaned + '\n}' // the wrapper lets acorn accept yield and await at the top level
  let ast
  try {
    ast = Parser.parse(text, { locations: false, ecmaVersion: 'latest', allowReserved: true, allowAwaitOutsideFunction: true })
  } catch (err) {
    console.log('Deglobalize err: ' + err)
    console.log(textCleaned)
    return textCleaned
  }

  // names the sketch declares (variables, function names and parameters, catch params, classes)
  const declared = new Set()
  const declare = (pat) => {
    if (!pat) return
    switch (pat.type) {
      case 'Identifier': declared.add(pat.name); break
      case 'ObjectPattern': pat.properties.forEach(p => declare(p.type === 'RestElement' ? p.argument : p.value)); break
      case 'ArrayPattern': pat.elements.forEach(declare); break
      case 'RestElement': declare(pat.argument); break
      case 'AssignmentPattern': declare(pat.left); break
      default: break
    }
  }
  const eachChild = (node, fn) => {
    for (const key of Object.keys(node)) {
      if (SKIP_KEYS.has(key)) continue
      const child = node[key]
      if (Array.isArray(child)) child.forEach(c => { if (c && typeof c.type === 'string') fn(c, key) })
      else if (child && typeof child.type === 'string') fn(child, key)
    }
  }
  const scan = (node) => {
    if (node.type === 'VariableDeclarator') declare(node.id)
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') { if (node.id && node !== ast.body[0]) declare(node.id); node.params.forEach(declare) }
    if (node.type === 'CatchClause') declare(node.param)
    if (node.type === 'ClassDeclaration' && node.id) declare(node.id)
    eachChild(node, scan)
  }
  scan(ast)

  // the references to rewrite: { start, end, text } spans in textCleaned
  const edits = []
  const visit = (node, parent, key) => {
    if (node.type === 'Identifier') {
      if (!watchList.has(node.name) || declared.has(node.name)) return
      if (parent) {
        if (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) return
        if ((parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') && key === 'key' && !parent.computed) return
        if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') return
        if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier' || parent.type === 'ExportSpecifier') return
      }
      edits.push({ start: node.start, end: node.end, text: prefix + '.' + node.name })
      return
    }
    if (node.type === 'Property' && node.shorthand && node.value.type === 'Identifier') {
      // `{ time }`: acorn shares one node between key and value; the key stays, the value reads through
      const name = node.value.name
      if (watchList.has(name) && !declared.has(name)) edits.push({ start: node.key.start, end: node.key.end, text: name + ': ' + prefix + '.' + name })
      return
    }
    eachChild(node, (child, k) => visit(child, node, k))
  }
  visit(ast, null, null)

  // If none found, just return the input.
  if (edits.length === 0) return textCleaned

  // splice from the end so earlier offsets stay valid; every edit is within one line, so lines keep their numbers
  let out = textCleaned
  edits.sort((a, b) => b.start - a.start)
  for (const e of edits) out = out.slice(0, e.start - PREFIX.length) + e.text + out.slice(e.end - PREFIX.length)
  return out
}

export { Deglobalize }
