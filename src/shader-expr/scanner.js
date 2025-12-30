// Scan AST for reserved variables and determine expression level

import { makeTraveler } from 'astravel'
import { RESERVED_VARS, VERTEX_VARYINGS, LEVEL_PRIORITY, MATH_FUNCTIONS, VECTOR_CONSTRUCTORS } from './reserved-vars.js'
import { ShaderExprError } from './errors.js'

export function scanExpression(ast, source) {
  const foundVars = new Set()
  const unknownVars = []
  let maxLevel = 'uniform'

  const traveler = makeTraveler({
    go: function (node, state) {
      if (node.type === 'Identifier') {
        const name = node.name

        // Check if it's a known reserved variable
        if (RESERVED_VARS[name]) {
          foundVars.add(name)
          const varLevel = RESERVED_VARS[name].level
          if (LEVEL_PRIORITY[varLevel] > LEVEL_PRIORITY[maxLevel]) {
            maxLevel = varLevel
          }
        }
        // Check if it's a math function or vector constructor (allowed)
        else if (MATH_FUNCTIONS.has(name) || VECTOR_CONSTRUCTORS.has(name)) {
          // allowed, no action needed
        }
        // Check if it's a known JS Math constant
        else if (name === 'Math') {
          // Math.sin, Math.PI etc - will be handled by MemberExpression
        }
        // Unknown variable - might be an error
        else if (!state.inCall && !state.inMember) {
          unknownVars.push({ name, start: node.start })
        }
      }

      // Handle _v.property access (vertex varyings)
      if (node.type === 'MemberExpression') {
        if (node.object.type === 'Identifier' && node.object.name === '_v') {
          const propName = node.property.name || node.property.value
          if (VERTEX_VARYINGS[propName]) {
            foundVars.add(`_v.${propName}`)
            if (LEVEL_PRIORITY['vertex'] > LEVEL_PRIORITY[maxLevel]) {
              maxLevel = 'vertex'
            }
          } else {
            throw new ShaderExprError(
              `Unknown vertex varying '_v.${propName}'. Available: ${Object.keys(VERTEX_VARYINGS).join(', ')}`,
              source,
              node.start
            )
          }
        }

        // Handle Math.* - transform to direct function call
        if (node.object.type === 'Identifier' && node.object.name === 'Math') {
          // Math.sin, Math.PI etc - these are allowed
          foundVars.add(`Math.${node.property.name}`)
        }
      }

      // Track context for unknown variable detection
      const prevInCall = state.inCall
      const prevInMember = state.inMember

      if (node.type === 'CallExpression') {
        state.inCall = true
      }
      if (node.type === 'MemberExpression') {
        state.inMember = true
      }

      // Call parent's go method
      this.super.go.call(this, node, state)

      state.inCall = prevInCall
      state.inMember = prevInMember
    }
  })

  traveler.go(ast, { inCall: false, inMember: false })

  // Report unknown variables with helpful suggestions
  if (unknownVars.length > 0) {
    const unknown = unknownVars[0]
    let suggestion = ''

    // Common mistakes
    if (unknown.name === 'st') suggestion = " Did you mean '_st'?"
    if (unknown.name === 'uv') suggestion = " Did you mean '_st' or '_v.uv'?"
    if (unknown.name === 'c0') suggestion = " Did you mean '_c0'?"
    if (unknown.name === 'v') suggestion = " Did you mean '_v.position', '_v.normal', etc?"
    if (unknown.name === 'ix' || unknown.name === 'i') suggestion = " Did you mean '_ix' (instance index)?"

    throw new ShaderExprError(
      `Unknown variable '${unknown.name}'.${suggestion} Shader expressions can reference: _st, _c0, _v.*, _ix, time, resolution, mouse`,
      source,
      unknown.start
    )
  }

  return { foundVars, level: maxLevel }
}
