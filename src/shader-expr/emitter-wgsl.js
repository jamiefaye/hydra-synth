// Emit WGSL code from JavaScript AST

import { RESERVED_VARS, VERTEX_VARYINGS, WGSL_VECTOR_CONSTRUCTORS } from './reserved-vars.js'

// Math constants (same values as GLSL)
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

// Ensure number has decimal point for WGSL float
function ensureFloat(value) {
  const s = value.toString()
  if (s.includes('.') || s.includes('e') || s.includes('E')) {
    return s
  }
  return s + '.0'
}

export function emitWGSL(ast) {
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
      // Map reserved vars to WGSL equivalents
      if (RESERVED_VARS[name]) {
        return RESERVED_VARS[name].wgsl
      }
      // Map GLSL vector constructors to WGSL
      if (WGSL_VECTOR_CONSTRUCTORS[name]) {
        return WGSL_VECTOR_CONSTRUCTORS[name]
      }
      // Pass through function names and other identifiers
      return name
    }

    case 'BinaryExpression':
    case 'LogicalExpression': {
      const left = emit(node.left)
      const right = emit(node.right)
      let op = node.operator

      // Handle power operator - WGSL uses pow() like GLSL
      if (op === '**') {
        return `pow(${left}, ${right})`
      }

      // Handle modulo - WGSL % only works for integers, use fract-based approach for floats
      if (op === '%') {
        return `(${left} - ${right} * floor(${left} / ${right}))`
      }

      return `(${left} ${op} ${right})`
    }

    case 'UnaryExpression':
      return `${node.operator}${emit(node.argument)}`

    case 'CallExpression': {
      const callee = emit(node.callee)
      const args = node.arguments.map(emit)

      // Handle GLSL functions that don't exist in WGSL
      if (callee === 'mod' && args.length === 2) {
        // WGSL doesn't have mod() for floats, use: (a - b * floor(a / b))
        return `(${args[0]} - ${args[1]} * floor(${args[0]} / ${args[1]}))`
      }

      return `${callee}(${args.join(', ')})`
    }

    case 'MemberExpression': {
      // Handle _v.property -> ourIn.v_property (vertex varyings in WGSL fragment shader)
      if (node.object.type === 'Identifier' && node.object.name === '_v') {
        const propName = node.property.name || node.property.value
        const glslName = VERTEX_VARYINGS[propName]
        if (glslName) {
          // In WGSL, varyings are accessed via ourIn parameter
          return `ourIn.${glslName}`
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
      // WGSL uses select() instead of ternary, but ternary also works in recent WGSL
      // Using select() for better compatibility: select(falseValue, trueValue, condition)
      return `select(${emit(node.alternate)}, ${emit(node.consequent)}, ${emit(node.test)})`

    case 'SequenceExpression':
      // Multiple expressions separated by comma
      // Note: WGSL doesn't support comma operator the same way, but this is rare in shader expressions
      return node.expressions.map(emit).join(', ')

    case 'ParenthesizedExpression':
      return `(${emit(node.expression)})`

    default:
      throw new Error(`Unsupported AST node type in WGSL emitter: ${node.type}`)
  }
}
