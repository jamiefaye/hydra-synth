/*
Format for adding functions to hydra. For each entry in this file, hydra automatically generates a glsl function and javascript function with the same name. You can also ass functions dynamically using setFunction(object).

{
  name: 'osc', // name that will be used to access function in js as well as in glsl
  type: 'src', // can be 'src', 'color', 'combine', 'combineCoords'. see below for more info
  inputs: [
    {
      name: 'freq',
      type: 'float',
      default: 0.2
    },
    {
      name: 'sync',
      type: 'float',
      default: 0.1
    },
    {
      name: 'offset',
      type: 'float',
      default: 0.0
    }
  ],
    glsl: `
      vec2 st = _st;
      float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
      float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
      float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
      return vec4(r, g, b, 1.0);
   `
}

// The above code generates the glsl function:
`vec4 osc(vec2 _st, float freq, float sync, float offset){
 vec2 st = _st;
 float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
 float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
 float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
 return vec4(r, g, b, 1.0);
}`


Types and default arguments for hydra functions.
The value in the 'type' field lets the parser know which type the function will be returned as well as default arguments.

const types = {
  'src': {
    returnType: 'vec4',
    args: ['vec2 _st']
  },
  'coord': {
    returnType: 'vec2',
    args: ['vec2 _st']
  },
  'color': {
    returnType: 'vec4',
    args: ['vec4 _c0']
  },
  'combine': {
    returnType: 'vec4',
    args: ['vec4 _c0', 'vec4 _c1']
  },
  'combineCoord': {
    returnType: 'vec2',
    args: ['vec2 _st', 'vec4 _c0']
  }
}

*/


// A source function that reads a texture as a camera would see a monitor: black beyond its
// edges instead of the wrap src() does. Blair's cameras look at monitors in a dark room, and
// so a feedback loop that pulls back or turns recedes into black instead of tiling itself.
const insideGlsl = 'vec2 m = step(vec2(0.), p) * step(p, vec2(1.));'
const insideWgsl = 'let m = step(vec2<f32>(0.), p) * step(p, vec2<f32>(1.));'

// The 13-tap blur kernel, written once: centre, a ring at `radius` (4 axis + 4 diagonal taps)
// and a ring at 2*radius (4 axis taps). Offsets are in units of r = (radius, radius * aspect)
// so the kernel is round. blur() wraps like src(); blurb() reads black beyond the texture.
const BLUR_TAPS = [[0, 0, 0.2],
  [1, 0, 0.12], [-1, 0, 0.12], [0, 1, 0.12], [0, -1, 0.12],
  [0.7071, 0.7071, 0.06], [-0.7071, -0.7071, 0.06], [0.7071, -0.7071, 0.06], [-0.7071, 0.7071, 0.06],
  [2, 0, 0.02], [-2, 0, 0.02], [0, 2, 0.02], [0, -2, 0.02]]
const fl = (n) => Number.isInteger(n) ? `${n}.` : `${n}`
const blurBody = (lang, black) => {
  const v2 = lang === 'wgsl' ? 'vec2<f32>' : 'vec2'
  const sample = (uv) => lang === 'wgsl' ? `textureSample(tex, samptex, ${uv})` : `texture2D(tex, ${uv})`
  const lines = lang === 'wgsl'
    ? [`let r = vec2<f32>(radius, radius * resolution.x / resolution.y);`, `var c = vec4<f32>(0.);`, `var p: vec2<f32>;`]
    : [`vec2 r = vec2(radius, radius * resolution.x / resolution.y);`, `vec4 c = vec4(0.);`, `vec2 p;`]
  if (black) lines.push(lang === 'wgsl' ? 'var m: vec2<f32>;' : 'vec2 m;')
  for (const [x, y, w] of BLUR_TAPS) {
    lines.push(`p = _st + ${v2}(${fl(x)}, ${fl(y)}) * r;`)
    if (black) {
      lines.push((lang === 'wgsl' ? insideWgsl : insideGlsl).replace(/^(let|vec2) m =/, 'm ='))
      lines.push(`c += ${sample('p')} * (m.x * m.y) * ${fl(w)};`)
    } else {
      lines.push(`c += ${sample('fract(p)')} * ${fl(w)};`)
    }
  }
  lines.push('return c;')
  return lines.map(l => '   ' + l).join('\n')
}
const blurEntry = (name, black) => ({
  name,
  type: 'src',
  inputs: [
    { type: 'sampler2D', name: 'tex', default: NaN },
    { type: 'float', name: 'radius', default: 0.005 }
  ],
  glsl: blurBody('glsl', black),
  wgsl: blurBody('wgsl', black)
})

export default () => [
  {
  name: 'noise',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 10,
    },
{
      type: 'float',
      name: 'offset',
      default: 0.1,
    }
  ],
  glsl:
`   return vec4(vec3(_noise(vec3(_st*scale, offset*time))), 1.0);`,
  wgsl:
`   return vec4<f32>(vec3<f32>(_noise(vec3(_st*scale, offset*time))), 1.0);`,
  needs: ["_noise"]
},
{
  name: 'voronoi',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 5,
    },
{
      type: 'float',
      name: 'speed',
      default: 0.3,
    },
{
      type: 'float',
      name: 'blending',
      default: 0.3,
    }
  ],
  glsl:
`   vec3 color = vec3(.0);
   // Scale
   _st *= scale;
   // Tile the space
   vec2 i_st = floor(_st);
   vec2 f_st = fract(_st);
   float m_dist = 10.;  // minimun distance
   vec2 m_point;        // minimum point
   for (int j=-1; j<=1; j++ ) {
   for (int i=-1; i<=1; i++ ) {
   vec2 neighbor = vec2(float(i),float(j));
   vec2 p = i_st + neighbor;
   vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
   point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
   vec2 diff = neighbor + point - f_st;
   float dist = length(diff);
   if( dist < m_dist ) {
   m_dist = dist;
   m_point = point;
   }
   }
   }
   // Assign a color using the closest point position
   color += dot(m_point,vec2(.3,.6));
   color *= 1.0 - blending*m_dist;
   return vec4(color, 1.0);`,
wgsl:
`
	 var color = vec3<f32>(.0);
   // Scale
   var st = _st * scale;
   // Tile the space
   let i_st = floor(st);
   let f_st = fract(st);
   var m_dist : f32 = 10.;  // minimun distance
   var m_point : vec2<f32>; // minimum point
   for (var j=-1; j<=1; j++ ) {
   for (var i=-1; i<=1; i++ ) {
   var neighbor = vec2<f32>(f32(i),f32(j));
   var p = i_st + neighbor;
   var point = fract(sin(vec2<f32>(dot(p,vec2<f32>(127.1,311.7)),dot(p,vec2<f32>(269.5,183.3))))*43758.5453);
   point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
   let diff = neighbor + point - f_st;
   let dist = length(diff);
   if( dist < m_dist ) {
   m_dist = dist;
   m_point = point;
   }
   }
   }
   // Assign a color using the closest point position
   color = color + dot(m_point,vec2<f32>(.3,.6));
   color = color * (1.0 - blending*m_dist);
 return vec4<f32>(color, 1.0);
`
},
{
  name: 'osc',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'frequency',
      default: 60,
    },
{
      type: 'float',
      name: 'sync',
      default: 0.1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   vec2 st = _st;
   float r = sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5;
   float g = sin((st.x+time*sync)*frequency)*0.5 + 0.5;
   float b = sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5;
   return vec4(r, g, b, 1.0);`,

  wgsl:
`  var st = vec2<f32>(_st);
   let r = f32(sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5);
   let g = f32(sin((st.x+time*sync)*frequency)*0.5 + 0.5);
   let b = f32(sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5);
   return vec4<f32>(r, g, b, 1.0);`
},
{
  name: 'shape',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'sides',
      default: 3,
    },
{
      type: 'float',
      name: 'radius',
      default: 0.3,
    },
{
      type: 'float',
      name: 'smoothing',
      default: 0.01,
    }
  ],
  glsl:
`   vec2 st = _st * 2. - 1.;
   // Angle and radius from the current pixel
   float a = atan(st.x,st.y)+3.1416;
   float r = (2.*3.1416)/sides;
   float d = cos(floor(.5+a/r)*r-a)*length(st);
   return vec4(vec3(1.0-smoothstep(radius,radius + smoothing + 0.0000001,d)), 1.0);`,
  wgsl:
`  var st = _st * 2. - 1.;
   // Angle and radius from the current pixel
   let a = f32(atan2(st.x,st.y)+3.1416);
   let r = f32((2.*3.1416)/sides);
   let d = f32(cos(floor(.5+a/r)*r-a)*length(st));
   return vec4<f32>(vec3<f32>(1.0-smoothstep(radius,radius + smoothing + 0.0000001,d)), 1.0);`
},
{
  name: 'gradient',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   return vec4(_st, sin(time*speed), 1.0);`,
  wgsl:
`   return vec4<f32>(_st, sin(time*speed), 1.0);`
},
{
  name: 'src',
  type: 'src',
  inputs: [
    {
      type: 'sampler2D',
      name: 'tex',
      default: NaN,

    }
  ],
  strange: true,
  glsl:
`   //  vec2 uv = gl_FragCoord.xy/vec2(1280., 720.);
   return texture2D(tex, fract(_st));`,

// This variant should not be actually used as the texture sampler stuff
// is handled explicitly in generateGlsl.
  wgsl:
  `
//		return texture2D(tex, fract(_st));`,
	
},
{
  name: 'srcb',
  type: 'src',
  inputs: [
    {
      type: 'sampler2D',
      name: 'tex',
      default: NaN,
    }
  ],
  // src() that reads black beyond the texture instead of wrapping: what a camera sees past
  // the monitor. Use it on feedback paths that model a camera (blurb() is the blurred one).
  glsl:
`   vec2 p = _st;
   ${insideGlsl}
   return texture2D(tex, p) * (m.x * m.y);`,
  wgsl:
`   let p = _st;
   ${insideWgsl}
   return textureSample(tex, samptex, p) * (m.x * m.y);`
},
{
  name: 'solid',
  type: 'src',
  inputs: [
    {
      type: 'float',
      name: 'r',
      default: 0,
    },
{
      type: 'float',
      name: 'g',
      default: 0,
    },
{
      type: 'float',
      name: 'b',
      default: 0,
    },
{
      type: 'float',
      name: 'a',
      default: 1,
    }
  ],
  glsl:
`   return vec4(r, g, b, a);`,
  wgsl:
`   return vec4<f32>(r, g, b, a);`
},
{
  name: 'rotate',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'angle',
      default: 10,
    },
{
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   vec2 xy = _st - vec2(0.5);
   float ang = angle + speed *time;
   xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
   xy += 0.5;
   return xy;`,
  wgsl:
`  var xy = _st - vec2<f32>(0.5);
   let ang = f32(angle + speed *time);
   xy = mat2x2<f32>(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
   xy = xy + 0.5;
   return xy;`
},
{
  name: 'scale',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1.5,
    },
{
      type: 'float',
      name: 'xMult',
      default: 1,
    },
{
      type: 'float',
      name: 'yMult',
      default: 1,
    },
{
      type: 'float',
      name: 'offsetX',
      default: 0.5,
    },
{
      type: 'float',
      name: 'offsetY',
      default: 0.5,
    }
  ],
  glsl:
`   vec2 xy = _st - vec2(offsetX, offsetY);
   xy*=(1.0/vec2(amount*xMult, amount*yMult));
   xy+=vec2(offsetX, offsetY);
   return xy;
   `,
  wgsl:
`  var xy = _st - vec2<f32>(offsetX, offsetY);
   xy = xy * (1.0/vec2<f32>(amount*xMult, amount*yMult));
   xy = xy + vec2<f32>(offsetX, offsetY);
   return xy;
   `
},
{
  name: 'pixelate',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'pixelX',
      default: 20,
    },
{
      type: 'float',
      name: 'pixelY',
      default: 20,
    }
  ],
  glsl:
`   vec2 xy = vec2(pixelX, pixelY);
   return (floor(_st * xy) + 0.5)/xy;`,
  wgsl:
`  let xy = vec2<f32>(pixelX, pixelY);
   return (floor(_st * xy) + 0.5)/xy;`
},
{
  name: 'posterize',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'bins',
      default: 3,
    },
{
      type: 'float',
      name: 'gamma',
      default: 0.6,
    }
  ],
  glsl:
`   vec4 c2 = pow(_c0, vec4(gamma));
   c2 *= vec4(bins);
   c2 = floor(c2);
   c2/= vec4(bins);
   c2 = pow(c2, vec4(1.0/gamma));
   return vec4(c2.xyz, _c0.a);`,
  wgsl:
`  var c2 : vec4<f32> = pow(_c0, vec4<f32>(gamma));
   c2 = c2 * vec4(bins);
   c2 = floor(c2);
   c2/= vec4(bins);
   c2 = pow(c2, vec4<f32>(1.0/gamma));
   return vec4<f32>(c2.xyz, _c0.a);`
},
{
  name: 'shift',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'r',
      default: 0.5,
    },
{
      type: 'float',
      name: 'g',
      default: 0,
    },
{
      type: 'float',
      name: 'b',
      default: 0,
    },
{
      type: 'float',
      name: 'a',
      default: 0,
    }
  ],
  glsl:
`   vec4 c2 = vec4(_c0);
   c2.r = fract(c2.r + r);
   c2.g = fract(c2.g + g);
   c2.b = fract(c2.b + b);
   c2.a = fract(c2.a + a);
   return vec4(c2.rgba);`,
  wgsl:
`  var c2 = vec4<f32>(_c0);
   c2.r = fract(c2.r + r);
   c2.g = fract(c2.g + g);
   c2.b = fract(c2.b + b);
   c2.a = fract(c2.a + a);
   return vec4<f32>(c2.rgba);`
},
{
  name: 'repeat',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'repeatX',
      default: 3,
    },
{
      type: 'float',
      name: 'repeatY',
      default: 3,
    },
{
      type: 'float',
      name: 'offsetX',
      default: 0,
    },
{
      type: 'float',
      name: 'offsetY',
      default: 0,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(repeatX, repeatY);
   st.x += step(1., mod(st.y,2.0)) * offsetX;
   st.y += step(1., mod(st.x,2.0)) * offsetY;
   return fract(st);`,
  wgsl:
`  var st = _st * vec2<f32>(repeatX, repeatY);
   st.x = st.x + (step(1., _mod(st.y, 2.0)) * offsetX);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) * offsetY);
   return fract(st);`
},
{
  name: 'modulateRepeat',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'repeatX',
      default: 3,
    },
{
      type: 'float',
      name: 'repeatY',
      default: 3,
    },
{
      type: 'float',
      name: 'offsetX',
      default: 0.5,
    },
{
      type: 'float',
      name: 'offsetY',
      default: 0.5,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(repeatX, repeatY);
   st.x += step(1., mod(st.y,2.0)) + _c0.r * offsetX;
   st.y += step(1., mod(st.x,2.0)) + _c0.g * offsetY;
   return fract(st);`,
  wgsl:
`  var st = _st * vec2<f32>(repeatX, repeatY);
   st.x = st.x + (step(1., _mod(st.y, 2.0)) + _c0.r * offsetX);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) + _c0.g * offsetY);
   return fract(st);`
},
{
  name: 'repeatX',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'reps',
      default: 3,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y += step(1., mod(st.x,2.0))* offset;
   return fract(st);`,
  wgsl:
`   var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y = st.y + (step(1., _mod(st.x, 2.0))* offset);
   return fract(st);`
},
{
  name: 'modulateRepeatX',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'reps',
      default: 3,
    },
{
      type: 'float',
      name: 'offset',
      default: 0.5,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y += step(1., mod(st.x,2.0)) + _c0.r * offset;
   return fract(st);`,
  wgsl:
`  var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.y = st.y + (step(1., _mod(st.x, 2.0)) + _c0.r * offset);
   return fract(st);`
},
{
  name: 'repeatY',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'reps',
      default: 3,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(1.0, reps);
   //  float f =  mod(_st.y,2.0);
   st.x += step(1., mod(st.y,2.0))* offset;
   return fract(st);`,
  wgsl:
`   var st = _st * vec2<f32>(1.0, reps);
   //  float f =  mod(_st.y,2.0);
   st.x = st.x + (step(1., _mod(st.y, 2.0))* offset);
   return fract(st);`
},
{
  name: 'modulateRepeatY',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'reps',
      default: 3,
    },
{
      type: 'float',
      name: 'offset',
      default: 0.5,
    }
  ],
  glsl:
`   vec2 st = _st * vec2(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.x += step(1., mod(st.y,2.0)) + _c0.r * offset;
   return fract(st);`,
  wgsl:
`   var st = _st * vec2<f32>(reps, 1.0);
   //  float f =  mod(_st.y,2.0);
   st.x = st.x + (step(1., _mod(st.y,2.0)) + _c0.r * offset);
   return fract(st);`
},
{
  name: 'kaleid',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'nSides',
      default: 4,
    }
  ],
  glsl:
`   vec2 st = _st;
   st -= 0.5;
   float r = length(st);
   float a = atan(st.y, st.x);
   float pi = 2.*3.1416;
   a = mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return r*vec2(cos(a), sin(a));`,
 wgsl:
`  var st = _st;
   st = st - 0.5;
   let r : f32 = length(st);
   var a : f32 = atan2(st.y, st.x);
   let pi : f32 = 2.*3.1416;
   a = _mod(a, pi/nSides);
   a = abs(a-pi/nSides/2.);
   return r*vec2<f32>(cos(a), sin(a));`
},
{
  name: 'modulateKaleid',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'nSides',
      default: 4,
    }
  ],
  glsl:
`   vec2 st = _st - 0.5;
   float r = length(st);
   float a = atan(st.y, st.x);
   float pi = 2.*3.1416;
   a = mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return (_c0.r+r)*vec2(cos(a), sin(a));`,
  wgsl:
`  var st = _st - 0.5;
   let r : f32= length(st);
   var a : f32 = atan2(st.y, st.x);
   let pi : f32= 2.*3.1416;
   a = _mod(a,pi/nSides);
   a = abs(a-pi/nSides/2.);
   return (_c0.r+r)*vec2<f32>(cos(a), sin(a));`
},
{
  name: 'offset',
  type: 'coord',
  inputs: [
    { type: 'float', name: 'x', default: 0 },
    { type: 'float', name: 'y', default: 0 }
  ],
  // scroll() without the fract(): a translate that lets coordinates leave 0..1, so srcb()/blurb()
  // can read black there. A camera moved off the monitor's axis, not a texture scrolled round.
  glsl:
`   return _st + vec2(x, y);`,
  wgsl:
`   return _st + vec2<f32>(x, y);`
},
{
  name: 'tilt',
  type: 'coord',
  inputs: [
    { type: 'float', name: 'pitch', default: 0 },
    { type: 'float', name: 'yaw', default: 0 },
    { type: 'float', name: 'dist', default: 2.5 }
  ],
  // A pinhole camera looking at a monitor that is turned away from it: the perspective (keystone)
  // that scale/rotate/offset cannot make. Camera at the origin looking down +z, monitor of half-size 1
  // centred at (0, 0, dist), turned by pitch about x (positive: its top leans away) and yaw about y
  // (positive: its right edge leans away). Framed so zero tilt is the identity; dist sets how strong
  // the perspective is (2.5 is a normal lens, 1 a very wide one). Coordinates off the monitor come
  // back far outside 0..1, so srcb()/blurb() read black there and src() wraps as it always did.
  glsl:
`   vec2 u = _st * 2.0 - 1.0;
   float cp = cos(pitch), sp = sin(pitch), cy = cos(yaw), sy = sin(yaw);
   vec3 X = vec3(cy, 0.0, -sy);
   vec3 Y = vec3(sy * sp, cp, cy * sp);
   vec3 N = vec3(sy * cp, -sp, cy * cp);
   vec3 d = vec3(u, dist);
   float denom = dot(d, N);
   if (denom <= 1e-4) return vec2(-10.0);
   vec3 P = (dist * N.z / denom) * d - vec3(0.0, 0.0, dist);
   return vec2(dot(P, X), dot(P, Y)) * 0.5 + 0.5;`,
  wgsl:
`   let u = _st * 2.0 - 1.0;
   let cp = cos(pitch); let sp = sin(pitch); let cy = cos(yaw); let sy = sin(yaw);
   let X = vec3<f32>(cy, 0.0, -sy);
   let Y = vec3<f32>(sy * sp, cp, cy * sp);
   let N = vec3<f32>(sy * cp, -sp, cy * cp);
   let d = vec3<f32>(u, dist);
   let denom = dot(d, N);
   if (denom <= 1e-4) { return vec2<f32>(-10.0); }
   let P = (dist * N.z / denom) * d - vec3<f32>(0.0, 0.0, dist);
   return vec2<f32>(dot(P, X), dot(P, Y)) * 0.5 + 0.5;`
},
{
  name: 'scroll',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'scrollX',
      default: 0.5,
    },
{
      type: 'float',
      name: 'scrollY',
      default: 0.5,
    },
{
      type: 'float',
      name: 'speedX',
      default: 0,
    },
{
      type: 'float',
      name: 'speedY',
      default: 0,
    }
  ],
  glsl:
`
   _st.x += scrollX + time*speedX;
   _st.y += scrollY + time*speedY;
   return fract(_st);`,
  wgsl:
`
	 var st : vec2<f32> = _st;
   st.x = st.x + (scrollX + time*speedX);
   st.y =  st.y + (scrollY + time*speedY);
   return fract(st);`
},
{
  name: 'scrollX',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'scrollX',
      default: 0.5,
    },
{
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   _st.x += scrollX + time*speed;
   return fract(_st);`,
  wgsl:
`  var st : vec2<f32>  = _st;
	 st.x = st.x + (scrollX + time*speed);
   return fract(st);`
},
{
  name: 'modulateScrollX',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'scrollX',
      default: 0.5,
    },
{
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   _st.x += _c0.r*scrollX + time*speed;
   return fract(_st);`,
   wgsl:
`   var st : vec2<f32>  = _st; 
	  st.x = st.x + (_c0.r*scrollX + time*speed);
   return fract(st);`
},
{
  name: 'scrollY',
  type: 'coord',
  inputs: [
    {
      type: 'float',
      name: 'scrollY',
      default: 0.5,
    },
{
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   _st.y += scrollY + time*speed;
   return fract(_st);`,
  wgsl:
`  var st : vec2<f32>  = _st;
   st.y = st.y + (scrollY + time*speed);
   return fract(st);`
},
{
  name: 'modulateScrollY',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'scrollY',
      default: 0.5,
    },
{
      type: 'float',
      name: 'speed',
      default: 0,
    }
  ],
  glsl:
`   _st.y += _c0.r*scrollY + time*speed;
   return fract(_st);`,
  wgsl:
`  var st : vec2<f32>  = _st;
   st.y = st.y + (_c0.r*scrollY + time*speed);
   return fract(st);`
},
{
  name: 'add',
  type: 'combine',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1,
    }
  ],
  glsl:
`   return (_c0+_c1)*amount + _c0*(1.0-amount);`,
  wgsl:
`   return (_c0+_c1)*amount + _c0*(1.0-amount);`
},
{
  name: 'sub',
  type: 'combine',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1,
    }
  ],
  glsl:
`   return (_c0-_c1)*amount + _c0*(1.0-amount);`,
  wgsl:
`   return (_c0-_c1)*amount + _c0*(1.0-amount);`
},
{
  name: 'layer',
  type: 'combine',
  inputs: [

  ],
  glsl:
`   return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));`,
  wgsl:
`   return vec4<f32>(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));`
},
{
  name: 'blend',
  type: 'combine',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 0.5,
    }
  ],
  glsl:
`   return _c0*(1.0-amount)+_c1*amount;`,
  wgsl:
`   return _c0*(1.0-amount)+_c1*amount;`
},
{
  name: 'mult',
  type: 'combine',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1,
    }
  ],
  glsl:
`   return _c0*(1.0-amount)+(_c0*_c1)*amount;`,
  wgsl:
`   return _c0*(1.0-amount)+(_c0*_c1)*amount;`
},
{
  name: 'diff',
  type: 'combine',
  inputs: [

  ],
  glsl:
`   return vec4(abs(_c0.rgb-_c1.rgb), max(_c0.a, _c1.a));`,
  wgsl:
`   return vec4<f32>(abs(_c0.rgb-_c1.rgb), max(_c0.a, _c1.a));`
},
{
  name: 'modulate',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 0.1,
    }
  ],
  glsl:
`   //  return fract(st+(_c0.xy-0.5)*amount);
   return _st + _c0.xy*amount;`,
  wgsl:
`   //  return fract(st+(_c0.xy-0.5)*amount);
   return _st + _c0.xy*amount;`
},
{
  name: 'modulateScale',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'multiple',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 1,
    }
  ],
  glsl:
`   vec2 xy = _st - vec2(0.5);
   xy*=(1.0/vec2(offset + multiple*_c0.r, offset + multiple*_c0.g));
   xy+=vec2(0.5);
   return xy;`,
  wgsl:
`  var xy : vec2<f32> = _st - vec2<f32>(0.5);
   xy =xy *(1.0/vec2<f32>(offset + multiple*_c0.r, offset + multiple*_c0.g));
   xy= xy + vec2<f32>(0.5);
   return xy;`
},
{
  name: 'modulatePixelate',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'multiple',
      default: 10,
    },
{
      type: 'float',
      name: 'offset',
      default: 3,
    }
  ],
  glsl:
`   vec2 xy = vec2(offset + _c0.x*multiple, offset + _c0.y*multiple);
   return (floor(_st * xy) + 0.5)/xy;`,
  wgsl:
`   let xy : vec2<f32> = vec2<f32>(offset + _c0.x*multiple, offset + _c0.y*multiple);
   return (floor(_st * xy) + 0.5)/xy;`
},
{
  name: 'modulateRotate',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'multiple',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   vec2 xy = _st - vec2(0.5);
   float angle = offset + _c0.x * multiple;
   xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
   xy += 0.5;
   return xy;`,
  wgsl:
`  var xy : vec2<f32> = _st - vec2<f32>(0.5);
   let angle = offset + _c0.x * multiple;
   xy = mat2x2<f32>(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
   xy = xy +  0.5;
   return xy;`
},
{
  name: 'modulateHue',
  type: 'combineCoord',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1,
    }
  ],
  glsl:
`   return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);`,
  wgsl:
`   return _st + (vec2<f32>(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);`
},
{
  name: 'invert',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1,
    }
  ],
  glsl:
`   return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);`,
  wgsl:
`   return vec4<f32>((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);`
},
{
  name: 'contrast',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 1.6,
    }
  ],
  glsl:
`   vec4 c = (_c0-vec4(0.5))*vec4(amount) + vec4(0.5);
   return vec4(c.rgb, _c0.a);`,
  wgsl:
`   let c = vec4<f32> ((_c0-vec4(0.5))*vec4(amount) + vec4(0.5));
   return vec4<f32>(c.rgb, _c0.a);`
},
{
  // Negative light back into gamut without adding any. A chroma rotation or a saturation above 1 keeps luminance
  // but can push a channel below zero; a plain floor (max 0) then raises the luminance, and in a feedback loop
  // that is a gain the knobs never asked for. Here the colour is pulled toward its own luminance just far enough
  // for the lowest channel to reach zero: hue and luminance stay. In-gamut colours pass through untouched, exactly.
  // Not for a feedback path: applied every pass it bleeds chroma away (an overdriven loop goes white, a quiet one grey).
  // There a plain floor is the better rail, as on real monitors; this is for a single pass that must not gain light.
  name: 'ingamut',
  type: 'color',
  inputs: [],
  glsl:
`   vec3 c = _c0.rgb;
   float mn = min(c.r, min(c.g, c.b));
   if (mn >= 0.0) return _c0;
   float y = dot(c, vec3(0.299, 0.587, 0.114));
   if (y <= 0.0) return vec4(0.0, 0.0, 0.0, _c0.a);
   return vec4(vec3(y) + (c - vec3(y)) * (y / (y - mn)), _c0.a);`,
  wgsl:
`   let c = _c0.rgb;
   let mn = min(c.r, min(c.g, c.b));
   if (mn >= 0.0) { return _c0; }
   let y = dot(c, vec3<f32>(0.299, 0.587, 0.114));
   if (y <= 0.0) { return vec4<f32>(0.0, 0.0, 0.0, _c0.a); }
   return vec4<f32>(vec3<f32>(y) + (c - vec3<f32>(y)) * (y / (y - mn)), _c0.a);`
},
{
  // Alpha back to a known value (1 by default). Hydra's blend/add/mult treat alpha as a fourth number and
  // srcb/blurb/luma/mask write it, so at the end of a feedback chain it is whatever the path left; with float
  // outputs nothing clamps it on the way round. End a loop with opaque() unless alpha is meant to carry something.
  name: 'opaque',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'alpha',
      default: 1,
    }
  ],
  glsl:
`   return vec4(_c0.rgb, alpha);`,
  wgsl:
`   return vec4<f32>(_c0.rgb, alpha);`
},
{
  // Any affine colour transform in one step: rgb' = M * rgb + offset. Rows first (rr rg rb = what red is made
  // of), then the offset (ro go bo). Hue, saturation, brightness, contrast, white point and per-channel gain are
  // all special cases; composed into one matrix they cost one multiply, behave on values past 0..1 (hue() goes
  // through HSV, which does not), and at neutral are exactly the identity, so nothing ratchets round a loop.
  name: 'colormat',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'rr',
      default: 1,
    },
    {
      type: 'float',
      name: 'rg',
      default: 0,
    },
    {
      type: 'float',
      name: 'rb',
      default: 0,
    },
    {
      type: 'float',
      name: 'gr',
      default: 0,
    },
    {
      type: 'float',
      name: 'gg',
      default: 1,
    },
    {
      type: 'float',
      name: 'gb',
      default: 0,
    },
    {
      type: 'float',
      name: 'br',
      default: 0,
    },
    {
      type: 'float',
      name: 'bg',
      default: 0,
    },
    {
      type: 'float',
      name: 'bb',
      default: 1,
    },
    {
      type: 'float',
      name: 'ro',
      default: 0,
    },
    {
      type: 'float',
      name: 'go',
      default: 0,
    },
    {
      type: 'float',
      name: 'bo',
      default: 0,
    }
  ],
  glsl:
`   vec3 c = _c0.rgb;
   return vec4(dot(vec3(rr, rg, rb), c) + ro, dot(vec3(gr, gg, gb), c) + go, dot(vec3(br, bg, bb), c) + bo, _c0.a);`,
  wgsl:
`   let c = _c0.rgb;
   return vec4<f32>(dot(vec3<f32>(rr, rg, rb), c) + ro, dot(vec3<f32>(gr, gg, gb), c) + go, dot(vec3<f32>(br, bg, bb), c) + bo, _c0.a);`
},
{
  // The rails of a video amplifier: untouched below half the headroom, bending asymptotically onto it
  // above (the arms meet in value and slope), floored at black. After lightherder's front panel. With
  // float outputs an overdriven feedback loop settles into structure instead of a flat white.
  name: 'knee',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'headroom',
      default: 2,
    },
    {
      // 0: each channel bends on its own (a bright colour pales toward white as it nears the rail, as on a real
      //    monitor). 1: the brightest channel sets one factor for all three, so hue and saturation are kept and only
      //    brightness is limited. In between blends the two. In a feedback loop that turns chroma with a matrix, 0 sends
      //    an overdriven centre to white; 1 lets it rest on saturated colour, as Hydra's HSV hue() did by construction.
      type: 'float',
      name: 'keep',
      default: 0,
    }
  ],
  glsl:
`   vec3 x = max(_c0.rgb, vec3(1e-6));
   vec3 bent = vec3(headroom) - vec3(headroom * headroom) / (4.0 * x);
   vec3 per = max(mix(bent, _c0.rgb, step(x, vec3(0.5 * headroom))), vec3(0.0));
   vec3 f = max(_c0.rgb, vec3(0.0));
   float m = max(max(f.r, f.g), max(f.b, 1e-6));
   float km = m <= 0.5 * headroom ? m : headroom - headroom * headroom / (4.0 * m);
   return vec4(mix(per, f * (km / m), keep), _c0.a);`,
  wgsl:
`   let x = max(_c0.rgb, vec3<f32>(1e-6));
   let bent = vec3<f32>(headroom) - vec3<f32>(headroom * headroom) / (4.0 * x);
   let per = max(mix(bent, _c0.rgb, step(x, vec3<f32>(0.5 * headroom))), vec3<f32>(0.0));
   let f = max(_c0.rgb, vec3<f32>(0.0));
   let m = max(max(f.r, f.g), max(f.b, 1e-6));
   let km = select(headroom - headroom * headroom / (4.0 * m), m, m <= 0.5 * headroom);
   return vec4<f32>(mix(per, f * (km / m), keep), _c0.a);`
},
{
  name: 'brightness',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 0.4,
    }
  ],
  glsl:
`   return vec4(_c0.rgb + vec3(amount), _c0.a);`,
  wgsl:
`   return vec4<f32>(_c0.rgb + vec3<f32>(amount), _c0.a);`
},
{
  name: 'mask',
  type: 'combine',
  inputs: [

  ],
  glsl:
  `   float a = _luminance(_c1.rgb);
  return vec4(_c0.rgb*a, a*_c0.a);`,
  wgsl:
  `   let a = _luminance(_c1.rgb);
  return vec4<f32>(_c0.rgb*a, a*_c0.a);`
},

{
  name: 'luma',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'threshold',
      default: 0.5,
    },
{
      type: 'float',
      name: 'tolerance',
      default: 0.1,
    }
  ],
  glsl:
`   float a = smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb));
   return vec4(_c0.rgb*a, a);`,
  wgsl:
`   let a : f32 = smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb));
   return vec4<f32>(_c0.rgb*a, a);`
},
{
  name: 'thresh',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'threshold',
      default: 0.5,
    },
{
      type: 'float',
      name: 'tolerance',
      default: 0.04,
    }
  ],
  glsl:
`   return vec4(vec3(smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb))), _c0.a);`,
  wgsl:
`   return vec4<f32>(vec3<f32>(smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb))), _c0.a);`
},
{
  name: 'color',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'r',
      default: 1,
    },
{
      type: 'float',
      name: 'g',
      default: 1,
    },
{
      type: 'float',
      name: 'b',
      default: 1,
    },
{
      type: 'float',
      name: 'a',
      default: 1,
    }
  ],
  glsl:
`   vec4 c = vec4(r, g, b, a);
   vec4 pos = step(0.0, c); // detect whether negative
   // if > 0, return r * _c0
   // if < 0 return (1.0-r) * _c0
   return vec4(mix((1.0-_c0)*abs(c), c*_c0, pos));`,
  wgsl:
`  let c = vec4<f32>(r, g, b, a);
   let pos : vec4<f32> = step(vec4<f32>(0.0), c); // detect whether negative
   // if > 0, return r * _c0
   // if < 0 return (1.0-r) * _c0
   return vec4<f32>(mix((1.0-_c0)*abs(c), c*_c0, pos));`
},
{
  name: 'saturate',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 2,
    }
  ],
  glsl:
`   const vec3 W = vec3(0.2125, 0.7154, 0.0721);
   vec3 intensity = vec3(dot(_c0.rgb, W));
   return vec4(mix(intensity, _c0.rgb, amount), _c0.a);`,
  wgsl:
`   const W = vec3<f32>(0.2125, 0.7154, 0.0721);
    let intensity = vec3<f32>(dot(_c0.rgb, W));
   return vec4<f32>(mix(intensity, _c0.rgb, amount), _c0.a);`
},
{
  name: 'hue',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'hue',
      default: 0.4,
    }
  ],
  glsl:
`   vec3 c = _rgbToHsv(_c0.rgb);
   c.r += hue;
   //  c.r = fract(c.r);
   return vec4(_hsvToRgb(c), _c0.a);`,
  wgsl:
`   var c  = _rgbToHsv(_c0.rgb);
   c.r = c.r + hue;
   //  c.r = fract(c.r);
   return vec4<f32>(_hsvToRgb(c), _c0.a);`,
   needs: ["_rgbToHsv", "_hsvToRgb"]
},
{
  name: 'colorama',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'amount',
      default: 0.005,
    }
  ],
  glsl:
`   vec3 c = _rgbToHsv(_c0.rgb);
   c += vec3(amount);
   c = _hsvToRgb(c);
   c = fract(c);
   return vec4(c, _c0.a);`,
  wgsl:
`  var c : vec3<f32> = _rgbToHsv(_c0.rgb);
   c = c + vec3<f32>(amount);
   c = _hsvToRgb(c);
   c = fract(c);
   return vec4<f32>(c, _c0.a);`,
  needs: ["_rgbToHsv", "_hsvToRgb"]
},
blurEntry('blur', false),
blurEntry('blurb', true),
{
  name: 'prev',
  type: 'src',
  inputs: [

  ],
  glsl:
`   return texture2D(prevBuffer, fract(_st));`,

// There is only one preview sampler per render chain
// so we can get away with using an unmodified name.
  wgsl:
`   return samplerprev(prevBuffer, fract(_st));`
},
{
  name: 'sum',
  type: 'color',
  inputs: [
    {
      type: 'vec4',
      name: 'scale',
      default: [1, 1, 1, 1],
    }
  ],
  glsl:
`   vec4 v = _c0 * scale;
   return vec4(vec3(v.r + v.g + v.b + v.a), _c0.a);
   }
   float sum(vec2 _st, vec4 scale) { // vec4 is not a typo, because argument type is not overloaded
   vec2 v = _st.xy * scale.xy;
   return v.x + v.y;`,
  wgsl:
`   let v : vec4<f32> = _c0 * scale;
   return vec4<f32>(vec3<f32>(v.r + v.g + v.b + v.a), _c0.a);
   }
   fn sum( _st : vec2<f32>, scale : vec4<f32>) -> f32 { // vec4 is not a typo, because argument type is not overloaded
   let v : vec2<f32> = _st.xy * scale.xy;
   return v.x + v.y;`
},
{
  name: 'r',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   return vec4(_c0.r * scale + offset);`,
  wgsl:
`   return vec4<f32>(_c0.r * scale + offset);`
},
{
  name: 'g',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   return vec4(_c0.g * scale + offset);`,
  wgsl:
`   return vec4<f32>(_c0.g * scale + offset);`
},
{
  name: 'b',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   return vec4(_c0.b * scale + offset);`,
  wgsl:
`   return vec4<f32>(_c0.b * scale + offset);`
},
{
  name: 'a',
  type: 'color',
  inputs: [
    {
      type: 'float',
      name: 'scale',
      default: 1,
    },
{
      type: 'float',
      name: 'offset',
      default: 0,
    }
  ],
  glsl:
`   return vec4(_c0.a * scale + offset);`,
  wgsl:
`   return vec4<f32>(_c0.a * scale + offset);`
}
]
