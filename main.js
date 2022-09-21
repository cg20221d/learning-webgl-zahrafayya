function main() 
{
    var kanvas = document.getElementById("kanvas");

    // gl itu seperti kuas, cat, palet, dan alat-alat lainnya untuk menggambar
    var gl = kanvas.getContext("webgl");

    var vertices = [
        0.5, 0.0, 0.0, 1.0, 1.0,   // A: kanan atas (CYAN)
        0.0, -0.5, 1.0, 0.0, 1.0,   // B: bawah tengah (MAGENTA)
        -0.5, 0.0, 1.0, 1.0, 0.0,  // C: kiri atas (YELLOW)
        0.0, 0.5, 1.0, 1.0, 1.0    // D: atas tengah (WHITE)
    ];

    // pindahin vertices ke GPU dari CPU
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // KOMPONEN-KOMPONEN PADA GLSL DAN JS
    // 1: attribute = variabel yang ada pada .glsl
    // 2: varying = variabel yang dapat dipassing dari vertex ke fragment dan sebaliknya
    // 3: uniform = variabel yang bisa dipassing dari js ke glsl vertex/fragment

    // Vertex Shader
    var vertexShaderCode = /* yang akan ditulis di dalam sini adalah source code .glsl */
    `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform float uTheta;
    uniform float uX;
    uniform float uY;

    varying vec3 vColor; 

    void main()
    {
        float x = -sin(uTheta) * aPosition.x + cos(uTheta) * aPosition.y + uX;
        float y = cos(uTheta) * aPosition.x + sin(uTheta) * aPosition.y + uY;
        gl_PointSize = 10.0;
        gl_Position =  vec4(x, y, 0.0, 1.0); 

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
    var x = 0.0;
    var y = 0.0;
    var freeze = false;

    // Variabel pointer ke GLSL
    var uTheta = gl.getUniformLocation(shaderProgram, "uTheta");
    var uX = gl.getUniformLocation(shaderProgram, "uX");
    var uY = gl.getUniformLocation(shaderProgram, "uY");

    // Mengajari GPU bagaimana cara mengoleksi nilai 
    // posisi dari ARRAY_BUFFER untuk setiap vertex
    // yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        0 * Float32Array.BYTES_PER_ELEMENT); // mulai dari array elemen ke-0
    gl.enableVertexAttribArray(aPosition);

    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        2 * Float32Array.BYTES_PER_ELEMENT); // mulai dari array elemen ke-2
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
        if (event.keyCode == 32) freeze = true;
        if (event.keyCode == 68) x += 0.1;
        if (event.keyCode == 65) x -= 0.1;
        if (event.keyCode == 87) y += 0.1;
        if (event.keyCode == 83) y -= 0.1;
    }
    function onKeyUp(event)
    {
        if (event.keyCode == 32) freeze = false;
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);


    function render()
    {
        setTimeout(function(){
            gl.clearColor(1.0, 0.65, 0, 1.0); // values of red, green, blue, alpha
            gl.clear(gl.COLOR_BUFFER_BIT);
    
            if (!freeze)
            {
                theta -= 0.1;
                gl.uniform1f(uTheta, theta); // uniform1f() -> mentransfer uniform 1 saja yg berupa float
    
            }
            gl.uniform1f(uX, x);
            gl.uniform1f(uY, y);

            // contoh pentransferan lain
            // var vector2D = [x, y];
            // gl.uniform2f(uTheta, vector2D[0], vector2D[1]);
            // gl.uniform2fv(uTheta, vector2D);
    
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
             // kecepatannya sama seperti clockspeed cpu
            render();
        }, 1000/60); // 60 fps
    }

    render();
}

    