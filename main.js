function main() 
{
    var kanvas = document.getElementById("kanvas");

    // gl itu seperti kuas, cat, palet, dan alat-alat lainnya untuk menggambar
    var gl = kanvas.getContext("webgl");

    var vertices = [
        // 0.5, 0.0, 0.0, 1.0, 1.0,   // A: kanan atas (CYAN)
        // 0.0, -0.5, 1.0, 0.0, 1.0,   // B: bawah tengah (MAGENTA)
        // -0.5, 0.0, 1.0, 1.0, 0.0,  // C: kiri atas (YELLOW)
        // 0.0, 0.5, 1.0, 1.0, 1.0    // D: atas tengah (WHITE)
    
        // Face A       // Red
        -1, -1, -1,     1, 0, 0,    // Index:  0    
         1, -1, -1,     1, 0, 0,    // Index:  1
         1,  1, -1,     1, 0, 0,    // Index:  2
        -1,  1, -1,     1, 0, 0,    // Index:  3
        // Face B       // Yellow
        -1, -1,  1,     1, 1, 0,    // Index:  4
         1, -1,  1,     1, 1, 0,    // Index:  5
         1,  1,  1,     1, 1, 0,    // Index:  6
        -1,  1,  1,     1, 1, 0,    // Index:  7
        // Face C       // Green
        -1, -1, -1,     0, 1, 0,    // Index:  8
        -1,  1, -1,     0, 1, 0,    // Index:  9
        -1,  1,  1,     0, 1, 0,    // Index: 10
        -1, -1,  1,     0, 1, 0,    // Index: 11
        // Face D       // Blue
         1, -1, -1,     0, 0, 1,    // Index: 12
         1,  1, -1,     0, 0, 1,    // Index: 13
         1,  1,  1,     0, 0, 1,    // Index: 14
         1, -1,  1,     0, 0, 1,    // Index: 15
        // Face E       // Orange
        -1, -1, -1,     1, 0.5, 0,  // Index: 16
        -1, -1,  1,     1, 0.5, 0,  // Index: 17
         1, -1,  1,     1, 0.5, 0,  // Index: 18
         1, -1, -1,     1, 0.5, 0,  // Index: 19
        // Face F       // White
        -1,  1, -1,     1, 1, 1,    // Index: 20
        -1,  1,  1,     1, 1, 1,    // Index: 21
         1,  1,  1,     1, 1, 1,    // Index: 22
         1,  1, -1,     1, 1, 1     // Index: 23

    ];

    var indices = [
        0, 1, 2,     0, 2, 3,     // Face A
        4, 5, 6,     4, 6, 7,     // Face B
        8, 9, 10,    8, 10, 11,   // Face C
        12, 13, 14,  12, 14, 15,  // Face D
        16, 17, 18,  16, 18, 19,  // Face E
        20, 21, 22,  20, 22, 23   // Face F    
    ];

    // pindahin vertices ke GPU dari CPU
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // KOMPONEN-KOMPONEN PADA GLSL DAN JS
    // 1: attribute = variabel yang ada pada .glsl
    // 2: varying = variabel yang dapat dipassing dari vertex ke fragment dan sebaliknya
    // 3: uniform = variabel yang bisa dipassing dari js ke glsl vertex/fragment

    // Vertex Shader
    var vertexShaderCode = /* yang akan ditulis di dalam sini adalah source code .glsl */
    `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    varying vec3 vColor; 

    void main()
    {
        // Tanpa Perkalian Matriks

        // float x = -sin(uTheta) * aPosition.x + cos(uTheta) * aPosition.y + uDx;
        // float y = cos(uTheta) * aPosition.x + sin(uTheta) * aPosition.y + uDy;
        // gl_PointSize = 10.0;
        // gl_Position =  vec4(x, y, 0.0, 1.0); 

        // Dengan Perkalian Matriks
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);

        // vec4. 4 di sana adalah yang dimaksud di ppt "setiap lambang 2,3,4 di vec yang menggambarkan dimensi"
        
        vColor = aColor;
    }
    `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject); // menjadi .o

    // Fragment Shader
    var fragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;
    void main()
    {
        gl_FragColor = vec4(vColor, 1.0);

    }
    `;
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderCode);
    gl.compileShader(fragmentShaderObject); // menjadi .o

    var shaderProgram = gl.createProgram(); // wadah dari executable (.exe)

    // kedua .o di atas dimasukkan ke dalam wadah
    gl.attachShader(shaderProgram, vertexShaderObject);
    gl.attachShader(shaderProgram, fragmentShaderObject);

    // wadah diaduk (linking)
    gl.linkProgram(shaderProgram);

    // alat (kuas) dipakai
    gl.useProgram(shaderProgram);

    // Variabel lokal
    var theta = 0.0;
    var dx = 0.0;
    var dy = 0.0;
    var freeze = false;

    // Variabel pointer ke GLSL
    // var uTheta = gl.getUniformLocation(shaderProgram, "uTheta");
    // var uDx = gl.getUniformLocation(shaderProgram, "uDx");
    // var uDy = gl.getUniformLocation(shaderProgram, "uDy");
    var uModel = gl.getUniformLocation(shaderProgram, "uModel");

    // View
    var cameraX = 0.0;
    var cameraZ = 5.0;
    var uView = gl.getUniformLocation(shaderProgram, "uView"); 
    var view = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(
        view,
        [cameraX, 0.0, cameraZ],
        [cameraX, 0.0, -10],
        [0.0, 1.0, 0.0]
    );

    // Projection
    var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");
    var perspective = glMatrix.mat4.create();
    glMatrix.mat4.perspective(perspective, Math.PI/3, 1.0, 0.5, 10.0);

    // Mengajari GPU bagaimana cara mengoleksi nilai 
    // posisi dari ARRAY_BUFFER untuk setiap vertex
    // yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 
        6 * Float32Array.BYTES_PER_ELEMENT, 
        0 * Float32Array.BYTES_PER_ELEMENT); // mulai dari array elemen ke-0
    gl.enableVertexAttribArray(aPosition);

    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 
        6 * Float32Array.BYTES_PER_ELEMENT, 
        3 * Float32Array.BYTES_PER_ELEMENT); // mulai dari array elemen ke-3
    gl.enableVertexAttribArray(aColor);

    // Grafika interaktif
    // Tetikus
    function onMouseClick(event)
    {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick);

    // Papan ketuk
    function onKeyDown(event)
    {
        if (event.keyCode == 32) freeze = !freeze;
        if (event.keyCode == 68) dx += 0.1;
        if (event.keyCode == 65) dx -= 0.1;
        if (event.keyCode == 87) dy += 0.1;
        if (event.keyCode == 83) dy -= 0.1;
    }
    function onKeyUp(event)
    {
        // if (event.keyCode == 32) freeze = false;
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);


    function render()
    {
        setTimeout(function(){
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(1.0, 0.65, 0, 1.0); // values of red, green, blue, alpha
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
            if (!freeze)
            {
                theta -= 0.1;
                // gl.uniform1f(uTheta, theta); // uniform1f() -> mentransfer uniform 1 saja yg berupa float
    
            }
            // gl.uniform1f(uDx, dx);
            // gl.uniform1f(uDy, dy);

            // contoh pentransferan lain
            // var vector2D = [x, y];
            // gl.uniform2f(uTheta, vector2D[0], vector2D[1]);
            // gl.uniform2fv(uTheta, vector2D);

            var model = glMatrix.mat4.create();
            glMatrix.mat4.translate(
                model, model, [dx, dy, 0.0]
            );
            glMatrix.mat4.rotateX(
                model, model, theta
            );
            glMatrix.mat4.rotateY(
                model, model, theta
            );
            glMatrix.mat4.rotateZ(
                model, model, theta
            );
            gl.uniformMatrix4fv(uModel, false, model);
            gl.uniformMatrix4fv(uView, false, view);
            gl.uniformMatrix4fv(uProjection, false, perspective);

            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
             // kecepatannya sama seperti clockspeed cpu
            render();
        }, 1000/60); // 60 fps
    }

    render();
}

    