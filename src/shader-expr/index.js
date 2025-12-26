// Main entry point for shader expressions
// Parses string expressions and emits GLSL code

import { parseExpression } from './parser.js'
import { scanExpression } from './scanner.js'
import { emitGLSL } from './emitter-glsl.js'
import { ShaderExprError } from './errors.js'

export class ShaderExpression {
  constructor(exprString) {
    this.source = exprString
    this.ast = parseExpression(exprString)
    const { foundVars, level } = scanExpression(this.ast, exprString)
    this.foundVars = foundVars
    this.level = level
    this._glslCache = null
  }

  toGLSL() {
    if (this._glslCache === null) {
      this._glslCache = emitGLSL(this.ast)
    }
    return this._glslCache
  }

  // Placeholder for future WGSL support
  toWGSL() {
    // For now, just return GLSL - WGSL emitter will be added later
    return this.toGLSL()
  }

  // For compatibility with existing uniform system
  get isUniform() {
    return false
  }

  toString() {
    return this.toGLSL()
  }
}

// Quick check if a string looks like it might be a shader expression
function looksLikeExpression(value) {
  if (typeof value !== 'string') return false

  // Must contain something that looks like an expression:
  // - operators
  // - function calls
  // - reserved variables (including _ix for instance index)
  // - swizzle patterns
  return /[+\-*/%()<>?:]|_st|_c0|_v\.|_ix|time|resolution|mouse|sin|cos|pow|mix|vec[234]/.test(value)
}

// Parse a value as a shader expression if it's a string that looks like one
// Returns null if not a valid expression, throws on parse errors
export function parseShaderExpr(value) {
  if (!looksLikeExpression(value)) {
    return null
  }

  try {
    return new ShaderExpression(value)
  } catch (err) {
    if (err instanceof ShaderExprError) {
      // Re-throw parse/validation errors
      throw err
    }
    // For unexpected errors, log and return null
    console.warn('Shader expression parsing failed:', err)
    return null
  }
}

export { ShaderExprError }
