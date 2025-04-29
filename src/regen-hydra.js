import HydraSource from "./hydra-source.js"
import GlslSource from "./glsl-source.js"
import Output from "./output.js"
import {OutputWgsl} from "./outputWgsl.js"

function isObject (item) {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

function isLiteralObject(a) {
    return (!!a) && (a.constructor === Object);
};

function isArray(a) {
    return (!!a) && (a.constructor === Array);
};

function isFunction(f) {
	return typeof f === 'function';
}

// A class that takes aa hydra transform list and turns it back into a Javascript expression.
class RegenHydra {

	constructor(glslSource, output, hydra) {
		this.glslSource = glslSource;
		this.output = output;
		this.hydra = hydra;
		this.outs = [];
		this.depth = 0;
	}

	gen(transforms) {
		for (let i = 0; i < transforms.length; ++i) {
			let xf = transforms[i];
			if (i > 0) this.outs.push('.');
			this.outs.push(xf.name);
			this.outs.push('(');
			let args = xf.userArgs;
			if (args && args.length > 0) {
				for (let j = 0; j < args.length; ++j) {
					let a = args[j];
					if (j > 0) this.outs.push(',');
					if (isFunction(a)) {
						this.outs.push(a.toString());
					} else 
					if (typeof a === 'string' || a instanceof String) {
						this.outs.push(a);
					} else
					if (isObject(a)) {
						if (a instanceof HydraSource) {
							//this.outs.push('(');
							this.outs.push(a.label);
							//this.outs.push(')');
						} else
							if (a instanceof GlslSource || a instanceof Output || a instanceof OutputWgsl) {
							this.depth++;
							if(isArray(a.transforms))this.gen(a.transforms);
							 else this.outs.push(a.label);
							this.depth--;
						}
					} else
						if (typeof a === 'number' && !isNaN(a)) {
						 this.outs.push(a);
						} else if (isArray(a)) {
							this.outs.push('[');
							for (let k = 0; k < a.length; ++k) {
								if (k > 0) this.outs.push(', ');
								this.outs.push(a[k]);
							}
							this.outs.push(']');					
						}
						else {
							console.log("Unknown item type used in arglist " + a);
							this.outs.push(a);
						}
				}
				
			}
			this.outs.push(')');
		}
	}

	generate() {
		let xforms = this.glslSource.transforms;
		this.gen(xforms);
		this.outs.push(".out(");
		if (this.output.label !== 'o0') this.outs.push(this.output.label);
		this.outs.push(");");
		let os = this.outs.join('');
		return os;
	}

} // end class

function regenerate(glslSource, output) {

	let hydra = output.hydraSynth
	let regen = new RegenHydra(glslSource, output, hydra);
	let genStr = regen.generate();
	hydra.noteRegenString(regen.output.chanNum, genStr);
	console.log(genStr);
}
export {RegenHydra, regenerate}