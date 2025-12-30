// Parse shader expression strings into AST using acorn

import { Parser } from 'acorn'
import { ShaderExprError } from './errors.js'

// Validate the AST doesn't contain disallowed constructs
function validateAST(ast, source) {
  const disallowed = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
    'ClassDeclaration',
    'ClassExpression',
    'AwaitExpression',
    'ImportExpression',
    'AssignmentExpression',
    'UpdateExpression',
    'BlockStatement',
    'VariableDeclaration',
    'ForStatement',
    'WhileStatement',
    'DoWhileStatement',
    'IfStatement',
    'SwitchStatement',
    'TryStatement',
    'ThrowStatement'
  ]

  function check(node) {
    if (!node || typeof node !== 'object') return

    if (disallowed.includes(node.type)) {
      throw new ShaderExprError(
        `${node.type} not allowed in shader expressions. Use pure expressions only.`,
        source,
        node.start
      )
    }

    // Check array access (might allow later but restrict for now)
    if (node.type === 'MemberExpression' && node.computed) {
      const prop = node.property
      // Allow numeric literals for array access like arr[0]
      if (prop.type !== 'Literal' || typeof prop.value !== 'number') {
        throw new ShaderExprError(
          'Dynamic array access not allowed in shader expressions. Use fixed indices only.',
          source,
          node.start
        )
      }
    }

    // Recursively check all child nodes
    for (const key in node) {
      if (key === 'type' || key === 'start' || key === 'end') continue
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(check)
      } else if (child && typeof child === 'object') {
        check(child)
      }
    }
  }

  check(ast)
}

export function parseExpression(exprString) {
  // Clean input - remove zero-width characters
  const cleaned = exprString.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

  if (!cleaned) {
    throw new ShaderExprError('Empty shader expression', exprString)
  }

  // Wrap in parentheses to parse as expression
  const wrapped = `(${cleaned})`

  let ast
  try {
    ast = Parser.parse(wrapped, {
      ecmaVersion: 'latest',
      allowReserved: true
    })
  } catch (err) {
    throw new ShaderExprError(
      `Parse error: ${err.message}`,
      exprString,
      err.pos ? err.pos - 1 : null // adjust for our wrapping parenthesis
    )
  }

  // Extract the expression from: Program > ExpressionStatement > expression
  if (!ast.body || !ast.body[0] || ast.body[0].type !== 'ExpressionStatement') {
    throw new ShaderExprError('Expected an expression', exprString)
  }

  const expr = ast.body[0].expression

  // Validate no disallowed constructs
  validateAST(expr, exprString)

  return expr
}
