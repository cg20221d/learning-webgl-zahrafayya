function main() 
{
    var kanvas = document.getElementById("kanvas");

    // gl itu seperti kuas, cat, palet, dan alat-alat lainnya untuk menggambar
    var gl = kanvas.getContext("webgl");

    var vertices = [
        0.5, 0.5, 
        0.0, 0.0, 
        -0.5, 0.5
    ];

    // pindahin vertices ke GPU dari CPU
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Vertex Shader
    var vertexShaderCode = /* yang akan ditulis di dalam sini adalah source code .glsl */
    `
    attribute vec2 aPosition;
    void main()
    {
        float x = aPosition.x;
        float y = aPosition.y;
        gl_PointSize = 10.0;
        gl_Position =  vec4(x, y, 0.0, 1.0); 

        // vec4. 4 di sana adalah yang dimaksud di ppt "setiap lambang 2,3,4 di vec yang menggambarkan dimensi"
    }
    `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject); // menjadi .o

    // Fragment Shader
    var fragmentShaderCode = `
    precision mediump float;
    void main()
    {
        float r = 0.0;
        float g = 0.0;
        float b = 1.0;
        gl_FragColor = vec4(r, g, b, 1.0);

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

    // Mengajari GPU bagaimana cara mengoleksi nilai 
    // posisi dari ARRAY_BUFFER untuk setiap vertex
    // yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.clearColor(1.0, 0.65, 0, 1.0); // values of red, green, blue, alpha
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 3);
}