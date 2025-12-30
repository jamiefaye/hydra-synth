// Emit GLSL code from JavaScript AST

import { RESERVED_VARS, VERTEX_VARYINGS } from './reserved-vars.js'

// Math constants
const MATH_CONSTANTS = {
  'PI': '3.14159265358979',
  'E': '2.71828182845905',
  'LN2': '0.693147180559945',
  'LN10': '2.302585092994046',
  'LOG2E': '1.4426950408889634',
  'LOG10E': '0.4342944819032518',
  'SQRT2': '1.4142135623730951',
  'SQRT1_2': '0.7071067811865476'
}

// Ensure number has decimal point for GLSL float
function ensureFloat(value) {
  const s = value.toString()
  if (s.includes('.') || s.includes('e') || s.includes('E')) {
    return s
  }
  return s + '.0'
}

export function emitGLSL(ast) {
  return emit(ast)
}

function emit(node) {
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'number') {
        return ensureFloat(node.value)
      }
      if (typeof node.value === 'boolean') {
        return node.value ? 'true' : 'false'
      }
      return String(node.value)

    case 'Identifier': {
      const name = node.name
      // Map reserved vars to GLSL equivalents
      if (RESERVED_VARS[name]) {
        return RESERVED_VARS[name].glsl
      }
      // Pass through function names and other identifiers
      return name
    }

    case 'BinaryExpression':
    case 'LogicalExpression': {
      const left = emit(node.left)
      const right = emit(node.right)
      let op = node.operator

      // Handle power operator
      if (op === '**') {
        return `pow(${left}, ${right})`
      }

      return `(${left} ${op} ${right})`
    }

    case 'UnaryExpression':
      return `${node.operator}${emit(node.argument)}`

    case 'CallExpression': {
      const callee = emit(node.callee)
      const args = node.arguments.map(emit).join(', ')
      return `${callee}(${args})`
    }

    case 'MemberExpression': {
      // Handle _v.property -> v_property
      if (node.object.type === 'Identifier' && node.object.name === '_v') {
        const propName = node.property.name || node.property.value
        const glslName = VERTEX_VARYINGS[propName]
        if (glslName) {
          return glslName
        }
      }

      // Handle Math.* constants and functions
      if (node.object.type === 'Identifier' && node.object.name === 'Math') {
        const prop = node.property.name
        // Check if it's a constant
        if (MATH_CONSTANTS[prop]) {
          return MATH_CONSTANTS[prop]
        }
        // Otherwise it's a function name - just return lowercase
        return prop.toLowerCase()
      }

      // Handle swizzles and property access (e.g., vec.xy, color.rgb)
      const obj = emit(node.object)
      const prop = node.computed
        ? `[${emit(node.property)}]`
        : `.${node.property.name || node.property.value}`
      return `${obj}${prop}`
    }

    case 'ConditionalExpression':
      return `(${emit(node.test)} ? ${emit(node.consequent)} : ${emit(node.alternate)})`

    case 'SequenceExpression':
      // Multiple expressions separated by comma
      return node.expressions.map(emit).join(', ')

    case 'ParenthesizedExpression':
      return `(${emit(node.expression)})`

    default:
      throw new Error(`Unsupported AST node type in GLSL emitter: ${node.type}`)
  }
}
