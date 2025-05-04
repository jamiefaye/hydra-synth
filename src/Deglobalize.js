import {Parser} from "acorn";
import {generate}  from "astring";
import { defaultTraveler, attachComments, makeTraveler } from 'astravel';

const watchListArray = ["time", "fps"];
const watchList = new Set(watchListArray);

// Function to convert all instances of global variables on the watchlist to be
// preceeded by a prefix like "_h.", which converts from a global variable to a member expression
// We do all this because the JS function creator captures primitive types as
// initial values rather than as changeable variables.

function Deglobalize(textIn, prefix) {
	 const ignore = Function.prototype;
	 // filter-out "zero length space" characters.
	 let textCleaned = textIn.replace(/[\u200B-\u200D\uFEFF]/g, '');
	 let text = 'async function* f() {\n' + textCleaned + '\n}'; // Hack to get acorn to accept yield statement.
	 let traveler = makeTraveler({
  	go: function(node, state) {
        if (node.type === 'Identifier') {
					if (watchList.has(node.name)) {
            	state.refTab.push(node);
       		 }
      }
        // Call the parent's `go` method
        this.super.go.call(this, node, state);
      },
     //MemberExpression: ignore
    });

        // Parse to AST
   var comments = [];
   let ast;
   try {
     ast = Parser.parse(text, {
     			locations: false,
     			ecmaVersion: "latest",
     			allowReserved: true,
     			allowAwaitOutsideFunction: true,
          onComment: comments
        }
      );
   } catch (err) {
    console.log("Deglobalize err: " + err);
    console.log(textCleaned);
    return textCleaned;
  }
		let state = {
    	refTab: []
		}
				// find the places to change.
    		traveler.go(ast, state);
 
    		// If none found, just return the input.
    	 if (state.refTab.length === 0) return textCleaned;

			 for (let i = 0; i < state.refTab.length; ++i) {
			 		let node = state.refTab[i];
			 		let vn = node.name;
			 		node.name = prefix + '.' + vn; // can you say hack!
			 		/*
			 		node.type = "MemberExpression";
			 		delete node.name;
			 		node.object = {"type": "identifier", "name": prefix};
			 		node.property = {"type": "identifier", "name": vn};
			 		node.computed = false;
			 		node.optional = false;
			 		*/
			 }

        // Put the comments back.
        //attachComments(ast, comments);
        let regen = generate(ast);
        
        return stripOutStuff(regen);
}

function stripOutStuff(inp) {
	  // get rid of the async function at the front and that final '}'.
	  let firstX = inp.indexOf('{');
    let lastX = inp.lastIndexOf('}');
    if (firstX === -1 || lastX === -1) return inp;
    let outp = inp.substring(firstX + 1, lastX);
    return outp;
}


export {Deglobalize}