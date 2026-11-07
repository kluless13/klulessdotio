// The sky's look was approved by Angad from docs/superpowers/specs/assets/sky-test.html. Keep values in step with it.
export const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }"

export const FRAG = `
precision highp float;
uniform vec2 uRes, uFlashPos; uniform float uT, uCover, uRain, uFog, uGray, uDark, uNight, uMinL, uMaxL, uFlash;
uniform vec2 uSun; uniform vec3 uTop, uMid, uHor, uLit, uShade, uSunCol;
float h1(float x){ return fract(sin(x * 127.1) * 43758.5453); }
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * f * (f * (f * 6. - 15.) + 10.);
  return mix(mix(h2(i), h2(i + vec2(1., 0.)), f.x), mix(h2(i + vec2(0., 1.)), h2(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 3; i++) { v += a * vn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return v * 1.11; }
float fbm5(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * vn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return v * 1.03; }
// One layer of falling rain: thin, slightly slanted streaks, each in its own column
float streak(vec2 uv, float aspect, float columns, float rows, float speed, float density, float seed){
  float px = (uv.x * aspect + uv.y * .16) * columns, cx = floor(px);
  float py = uv.y * rows + uT * speed + h1(cx + seed) * 37., cy = floor(py);
  float r = h2(vec2(cx, cy) + seed);
  if (r > density) return 0.;
  float x = fract(px) - .5 + (fract(r * 91.7) - .5) * .5, l = fract(py);
  return smoothstep(.2, .02, abs(x)) * smoothstep(0., .35, l) * smoothstep(1., .45, l) * (.45 + .55 * fract(r * 37.1));
}
// Rain and storms get their own sky: a low cloud deck lit from above, pale light under it, and rain falling out of it
vec3 stormSky(vec2 uv, float aspect, vec2 ds){
  float hard = smoothstep(.6, 1., uRain);
  vec2 q = vec2(uv.x * aspect * .62 + uT * (.012 + hard * .012), uv.y * 2.3 - uT * .002);
  vec2 w = vec2(fbm5(q * .8 + 1.7), fbm5(q * .8 + vec2(6.1, 2.3) + uT * .004)) - .5;
  vec2 c = q * 1.6 + w * .85;
  float d = fbm5(c), up = fbm5(c + vec2(.03, .16));
  float shade = clamp((d - up) * 3.4 + .5, 0., 1.);
  float base = .24 + fbm(vec2(uv.x * aspect * .7 + uT * .01, 3.)) * .14;
  float deck = smoothstep(base - .17, base + .27, uv.y + (d - .5) * .3);
  vec3 lit = mix(vec3(.5, .53, .58), vec3(.24, .26, .32), uNight);
  vec3 dark = mix(vec3(.2, .23, .28), vec3(.075, .085, .115), uNight);
  lit *= mix(vec3(1.), vec3(.64, .68, .74), hard);
  dark *= mix(vec3(1.), vec3(.42, .48, .52), hard);
  lit += uSunCol * exp(-dot(ds, ds) * 3.) * .14 * (1. - uNight);
  vec3 cloud = mix(dark, lit, shade * smoothstep(.3, .72, d + .12));
  cloud *= mix(.62, 1., smoothstep(base, base + .4, uv.y));
  float horLum = dot(uHor, vec3(.3, .59, .11));
  vec3 gapTint = mix(vec3(horLum), uHor, .6);
  vec3 gap = mix(gapTint * (.82 - hard * .24), gapTint * .22 + vec3(.13, .11, .12), uNight);
  vec3 col = mix(gap, cloud, deck);
  // Rain shafts: wide, slanted curtains hanging from the cloud base
  float sway = (fbm(vec2(uv.y * 2.6, uT * .02 + 9.)) - .5) * .28;
  float f = fbm(vec2((uv.x * aspect + uv.y * .3 + sway) * 1.35 + uT * .018, uT * .01 + 4.));
  float shaft = smoothstep(.24, .82, f) * (1. - smoothstep(base - .05, base + .4, uv.y) * .8);
  col = mix(col, mix(dark, lit, .35), shaft * (.42 + hard * .22));
  // Lightning lights the cloud from inside, so the flash shows its shape
  if (uFlash > .001) {
    vec2 fp = (uv - uFlashPos) * vec2(aspect, 1.4);
    float near = exp(-dot(fp, fp) * 3.2);
    // The lit side of each cloud catches most of the light, which keeps the shapes visible
    col *= 1. + uFlash * (.22 + near * deck * (.5 + shade * 2.4));
    col += vec3(.04, .05, .08) * uFlash * (near + .3);
    // Scales the whole colour down together, since clipping one channel would tint the flash
    float peak = max(col.r, max(col.g, col.b));
    if (peak > .95) col *= .95 / peak;
  }
  float drops = streak(uv, aspect, 120., 9., 13., .1 + hard * .1, 2.) * .08 + streak(uv, aspect, 170., 22., 20., .16 + hard * .14, 9.) * .055;
  return col + vec3(.75, .8, .88) * drops * (.6 + hard * .5) * (1. - uNight * .45);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float aspect = uRes.x / uRes.y;
  // Large, slow colour fields. Nothing here has an edge or a shape.
  vec2 wp = vec2(uv.x * aspect * .75 + uT * .007, uv.y * .85 - uT * .002);
  vec2 warp = vec2(fbm(wp * .8 + 3.), fbm(wp * .8 + 8.)) - .5;
  float wobble = fbm(wp * 1.1 + warp) - .5;
  float t = clamp(uv.y + wobble * (.1 + uCover * .24), 0., 1.);
  vec3 col = t < .42 ? mix(uHor, uMid, smoothstep(0., .42, t)) : mix(uMid, uTop, smoothstep(.42, 1., t));
  float lum = dot(col, vec3(.3, .59, .11));
  vec3 grayTint = vec3(lum) * vec3(.97, 1., 1.05);
  col = mix(col, grayTint, uGray);
  // Cloud cover: soft patches of lit and shaded colour
  float n = fbm(wp * 1.25 + warp * 1.4);
  float th = mix(.7, .3, uCover);
  float patchy = smoothstep(th - .14, th + .2, n);
  vec3 cl = mix(uShade, uLit, smoothstep(.34, .68, n));
  cl = mix(cl, vec3(dot(cl, vec3(.3, .59, .11))), uGray * .8);
  col = mix(col, cl, patchy * (.3 + uCover * .55));
  // The sun or moon is only ever a glow
  vec2 ds = (uv - uSun) * vec2(aspect, 1.);
  float d2 = dot(ds, ds);
  vec3 glow = uSunCol * exp(-d2 * 2.6) * .62 * (1. - uCover * .72) * (1. - uNight * .78);
  glow += uSunCol * exp(-uv.y * 5.2) * exp(-abs(uv.x - uSun.x) * 1.1) * .34 * (1. - uGray) * (1. - uNight);
  col = 1. - (1. - col) * (1. - clamp(glow, 0., 1.));
  // Faint warm light from the city on the lower sky at night
  col += vec3(.15, .09, .06) * uNight * exp(-uv.y * 4.) * (.35 + uCover * .65);
  // Mist lifts and flattens the lower sky
  col = mix(col, mix(vec3(.82, .85, .88) * (1. - uNight * .85), grayTint, .35), uFog * smoothstep(.85, .05, uv.y) * .8);
  col *= 1. - uDark;
  if (uRain > .001) col = stormSky(uv, aspect, ds);
  vec3 lin = pow(clamp(col, 0., 1.), vec3(2.2));
  float L = dot(lin, vec3(.2126, .7152, .0722));
  // Brightness limits ease in gradually. A hard cut-off would flatten the sky and leave visible edges.
  float kLo = uMinL * 1.45, kHi = uMaxL * .62;
  if (L < kLo) { float target = kLo - (kLo - uMinL) * (1. - exp(-(kLo - L) / (kLo - uMinL))); lin = mix(lin, vec3(1.), (target - L) / (1. - L)); }
  if (L > kHi) { float target = kHi + (uMaxL - kHi) * (1. - exp(-(L - kHi) / (uMaxL - kHi))); lin *= target / L; }
  col = pow(lin, vec3(1. / 2.2));
  // Rounds each colour by less than one level with no pattern, which stops slow gradients showing as thin lines
  vec2 fc = gl_FragCoord.xy;
  vec3 rounding = vec3(h2(fc), h2(fc + 17.3), h2(fc + 41.7)) - .5;
  gl_FragColor = vec4(clamp(col + rounding / 255., 0., 1.), 1.);
}`

export const UNIFORMS = ["uRes", "uT", "uCover", "uRain", "uFog", "uGray", "uDark", "uNight", "uMinL", "uMaxL", "uSun", "uTop", "uMid", "uHor", "uLit", "uShade", "uSunCol", "uFlash", "uFlashPos"] as const
