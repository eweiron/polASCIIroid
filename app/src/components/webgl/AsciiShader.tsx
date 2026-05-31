// src/components/webgl/AsciiShader.ts

export const AsciiShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tAscii;
    uniform float uHover;
    uniform float uCharCount;
    
    varying vec2 vUv;

    void main() {
      vec2 photoUv = vec2(vUv.x, vUv.y);
      vec4 originalColor = texture2D(tDiffuse, photoUv);
      
      // Ajusta este número al tamaño de grid que ya te había gustado antes (40, 60, 80)
      float gridSize = 60.0; 
      
      // Volvemos a usar uvPixel para que el color se aplique en bloques cuadrados perfectos
      vec2 uvPixel = floor(photoUv * gridSize) / gridSize;
      vec4 pixelatedColor = texture2D(tDiffuse, uvPixel); 
      
      float brightness = dot(pixelatedColor.rgb, vec3(0.299, 0.587, 0.114));
      
    
      // Le sumamos la fuerza del hover al brillo. Al multiplicarlo por 1.5, 
      // forzamos a que los caracteres "exploten" hacia los símbolos más claros
      float mutatedBrightness = clamp(brightness + (uHover * -0.9), 0.0, 1.0);
      
      vec2 localUv = fract(vUv * gridSize);
      
      // Usamos el brillo MUTADO para elegir el índice del carácter
      float charIndex = floor(mutatedBrightness * (uCharCount - 0.1));
      float charWidth = 1.0 / uCharCount;
      float atlasX = (charIndex + localUv.x) * charWidth;
      vec2 atlasUv = vec2(atlasX, localUv.y);
      
      vec4 asciiTexel = texture2D(tAscii, atlasUv);
      
      // Esto rescata el grosor de la tipografía pero la mantiene 100% nítida y sin difuminar.
      float crispChar = step(0.1, asciiTexel.r);
      
      vec4 coloredAscii = vec4(pixelatedColor.rgb * crispChar* 1.9 , 1.0);
      
      gl_FragColor = mix(coloredAscii, originalColor, uHover);
    }
  `,
};
