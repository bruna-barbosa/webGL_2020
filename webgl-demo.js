var cubeRotation = 1.0;
var piramideRotation = 10.0;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers_cubo = initBuffers_cubo(gl);
  const buffers_piramide = initBuffers_piramide(gl);
  const buffers_esfera = initBuffers_esfera(gl);
  
  // Aqui vamos fazer uma lista com todos os objetos a desenhar
  buffers = [buffers_cubo, buffers_piramide, buffers_esfera];

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
  
  
	draw(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


// Esta função vai iterar na lista com os objetos a desenhar
// em cada uma dessas iterações aplica uma matriz composta pelos 
// movimentos que queremos executar (translate, rotate, scale)
function draw(gl, programInfo, buffers, deltaTime){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Criar as martizes compostas, uma por objeto (translate, rotate, scale)
	// Matriz do cubo
	let m1 = mat4.create();
	mat4.translate(m1, m1,[2.5, 0.0, -16.0]);
	mat4.rotate(m1, m1, cubeRotation * .7, [0, 1, 0]);
	mat4.scale(m1, m1, [2,2,2]);
	
	// Matriz da piramide
	let m2 = mat4.create();
	mat4.translate(m2, m2,[-2.5, 0.0, -16.0]);
	mat4.rotate(m2, m2, piramideRotation, [1, 1, 0]);
	
	// Matriz da esfera
	let m3 = m1
		
	matrizes = [m1, m2, m3]
	
	for (i = 0; i < buffers.length; i++) {
		drawScene(gl, programInfo, buffers[i], deltaTime, matrizes[i]);
		}	
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//

//Criar o buffer da piramide
function initBuffers_piramide(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Back face
    -1.0, -1.0, -1.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     1.0, -1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    [1.0,  1.0,  0.0,  1.0],    // Front face: green
    [1.0,  1.0,  0.0,  1.0],    // Back face: green
    [1.0,  1.0,  0.0,  1.0],    // Bottom face: green
    [1.0,  1.0,  0.0,  1.0],    // Right face: green
    [1.0,  1.0,  0.0,  1.0],    // Left face: green
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//Criar o buffer do cubo
function initBuffers_cubo(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    [0.0,  1.0,  0.0,  1.0],    // Front face: white
    [0.0,  1.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  1.0,  0.0,  1.0],    // Bottom face: blue
    [0.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [0.0,  1.0,  0.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//Criar o buffer da esfera
function initBuffers_esfera(gl){
	// Create a buffer for the cube's vertex positions.
	const positionBuffer = gl.createBuffer();
	
	// Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	const grau = Math.PI; const ordem = Math.PI; const raio = Math.PI

	function create_vertices_esfera(grau, ordem, raio) {
		// Valores a definidos pelo user
		const stacks = grau
		const sectors = ordem
		const radius = raio
		
		
		PI = Math.PI; 
		const sectorStep = 2 * PI / sectors;
		const stackStep = PI / stacks;
		
		let sectorAngle; let stackAngle;
		let x; let y; let z; let xy;
		let xn; let yn; let zn;
		let lengthInv = 1.0 / radius;
		let normals = []; let texCoords = []; let vertices = [];

		
		for (i = 0; i < stacks; i++) {
			
			stackAngle = PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
			xy = radius * Math.cos(stackAngle);             // r * cos(u)
			z = radius * Math.sin(stackAngle);				// r * sin(u)
			
			// add (sectorCount+1) vertices per stack
			// the first and last vertices have same position and normal, but different tex coords
			for(j = 0; j <= sectors; j++){
				sectorAngle = j * sectorStep;           // starting from 0 to 2pi

				// vertex position (x, y, z)
				x = xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
				y = xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)
				vertices.push(x);
				vertices.push(y);
				vertices.push(z);

				// normalized vertex normal (nx, ny, nz)
				nx = x * lengthInv;
				ny = y * lengthInv;
				nz = z * lengthInv;
				normals.push(nx);
				normals.push(ny);
				normals.push(nz);

				// vertex tex coord (s, t) range between [0, 1]
				s = j / sectors;
				t = i / stacks;
				texCoords.push(s);
				texCoords.push(t);
			}	
		}
		return 	vertices
	}

	//Criar uma lista com todas as coordenadas da 
	//superfície da esfera
	// // const coords_positions = (create_vertices_esfera(10, 10, 10))
	const positions = (create_vertices_esfera(grau, ordem, raio))

	//Função geradora de uma lista de índices dos triângulos
	//da superfície da esfera
	function triangles_esfera(stacks, sectors){
		let indices = [];
		let k1; let k2;
		
		for(i = 0; i<stacks; i++) {
			
			k1 = parseInt(i * (sectors + 1));
			k2 = parseInt(k1 + sectors + 1);
			
			for(j = 0; j<sectors; j++){
				
				if(i!=0){
					indices.push(k1);
					indices.push(k2);
					indices.push(k1+1);
				}
				
				if(i != (stacks - 1)){
					indices.push(k1+1);
					indices.push(k2);
					indices.push(k2+1);
				}
			}	
		}
		return indices
	}

	//cirar uma lista com os índices das coordenadas
	const indices = triangles_esfera(grau, ordem)//[]

	console.log("positions: ",positions);
	console.log("indices: ",indices);
	
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Now set up the colors for the faces. We'll use solid colors
	// for each face.
	let faceColors = []
	for(i=0; i<positions.length; i++){
		faceColors.push([1.0,  0.0,  0.0,  1.0]);
		//cor vermelha uniforme para todas as faces
	}
	  
	// Convert the array of colors into a table for all the vertices.

	var colors = [];

	for (var j = 0; j < faceColors.length; j++) {
		const c = faceColors[j];

		// Repeat each color four times for the 4 vertices of the face
		colors = colors.concat(c, c, c, c);
	}
	
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

  // const indices = [
    // 0,  1,  2,      0,  2,  3,    // front
    // 4,  5,  6,      4,  6,  7,    // back
    // 8,  9,  10,     8,  10, 11,   // top
    // 12, 13, 14,     12, 14, 15,   // bottom
    // 16, 17, 18,     16, 18, 19,   // right
    // 20, 21, 22,     20, 22, 23,   // left
  // ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

	return {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
	};
}








//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, deltaTime, matriz) {


  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  let modelViewMatrix = matriz //mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

	// // --->>> matrizComposta * modelViewMatrix
  // console.log(modelViewMatrix);
  console.log(matriz);
  // modelViewMatrix = multiply(modelViewMatrix, matriz);
  // console.log(modelViewMatrix);
  
  // mat4.translate(modelViewMatrix,     // destination matrix
                 // modelViewMatrix,     // matrix to translate
                 // [2.5, 0.0, -16.0]);  // amount to translate
  // // mat4.rotate(modelViewMatrix,  // destination matrix
              // // modelViewMatrix,  // matrix to rotate
              // // cubeRotation,     // amount to rotate in radians
              // // [0, 0, 1]);       // axis to rotate around (Z)
  // mat4.rotate(modelViewMatrix,  // destination matrix
              // modelViewMatrix,  // matrix to rotate
              // cubeRotation * .7,// amount to rotate in radians
              // [0, 1, 0]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
  piramideRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

