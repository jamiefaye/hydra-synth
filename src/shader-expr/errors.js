// Custom error class for shader expression parsing/validation errors

export class ShaderExprError extends Error {
  constructor(message, source, position = null) {
    super(message)
    this.name = 'ShaderExprError'
    this.source = source
    this.position = position
  }

  toString() {
    let msg = `${this.name}: ${this.message}`
    if (this.source) {
      msg += `\n  Expression: "${this.source}"`
    }
    if (this.position !== null) {
      msg += `\n  Position: ${this.position}`
    }
    return msg
  }
}
