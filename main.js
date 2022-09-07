function main() 
{
    var kanvas = document.getElementById("kanvas");

    // gl itu seperti kuas, cat, palet, dan alat-alat lainnya untuk menggambar
    var gl = kanvas.getContext("webgl");

    // Vertex Shader
    var vertexShaderCode = `
    void main()
    {

    }
    `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject); // menjadi .o

    // Fragment Shader
    var fragmentShaderCode = `
    void main()
    {

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

    gl.clearColor(0.5, 0.5, 0.5, 1.0); // values of red, green, blue, alpha
    gl.clear(gl.COLOR_BUFFER_BIT);
}