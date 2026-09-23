import { Parser } from 'acorn'
import { generate } from 'astring'

// The synth globals a sketch reads live: `time` in `() => time * 0.1` must be read every frame, but
// the function the eval builds would capture a primitive's value once. So every *reference* to one
// of these names becomes a member expression on the prefix (`_h.time`), which reads through.
const watchListArray = ['time', 'fps', 'speed', 'bpm']
const watchList = new Set(watchListArray)
const SKIP_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'comments', 'leadingComments', 'trailingComments'])

/**
 * Rewrite references to the watched globals as `prefix.name`. Only references: a declaration
 * (`let time = 5`), a parameter (`(speed) => ...`), an object key (`{ time: 1 }`), a member name
 * (`foo.speed`), a label or an import name is not a reference and is left as written. A name the
 * sketch declares itself is the sketch's own and is left alone everywhere. `{ time }` shorthand
 * becomes `{ time: prefix.time }`. Text that will not parse comes back unchanged (the eval reports
 * the error). Comments are dropped when anything is rewritten, kept when nothing is.
 */
function Deglobalize (textIn, prefix) {
  // filter-out "zero length space" characters.
  const textCleaned = textIn.replace(/[\u200B-\u200D\uFEFF]/g, '')
  const text = 'async function* f() {\n' + textCleaned + '\n}' // Hack to get acorn to accept yield statement.
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

  // the references to rewrite
  const refs = []
  const visit = (node, parent, key) => {
    if (node.type === 'Identifier') {
      if (!watchList.has(node.name) || declared.has(node.name)) return
      if (parent) {
        if (parent.type === 'MemberExpression' && key === 'property' && !parent.computed) return
        if ((parent.type === 'Property' || parent.type === 'MethodDefinition' || parent.type === 'PropertyDefinition') && key === 'key' && !parent.computed) return
        if (parent.type === 'LabeledStatement' || parent.type === 'BreakStatement' || parent.type === 'ContinueStatement') return
        if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier' || parent.type === 'ExportSpecifier') return
      }
      refs.push(node)
      return
    }
    if (node.type === 'Property' && node.shorthand && node.value.type === 'Identifier') {
      // acorn shares one node between key and value here: keep the key, give the value its own node
      if (watchList.has(node.value.name) && !declared.has(node.value.name)) {
        node.shorthand = false
        node.value = { type: 'Identifier', name: node.value.name }
        refs.push(node.value)
      }
      return
    }
    eachChild(node, (child, k) => visit(child, node, k))
  }
  visit(ast, null, null)

  // If none found, just return the input.
  if (refs.length === 0) return textCleaned

  for (const node of refs) {
    const vn = node.name
    // Transform Identifier node into MemberExpression node
    node.type = 'MemberExpression'
    delete node.name
    node.object = { type: 'Identifier', name: prefix }
    node.property = { type: 'Identifier', name: vn }
    node.computed = false
    node.optional = false
  }
  return stripOutStuff(generate(ast))
}

function stripOutStuff (inp) {
  // get rid of the async function at the front and that final '}'.
  const firstX = inp.indexOf('{')
  const lastX = inp.lastIndexOf('}')
  if (firstX === -1 || lastX === -1) return inp
  return inp.substring(firstX + 1, lastX)
}

export { Deglobalize }
