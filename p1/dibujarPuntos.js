// Shader de vertices
const VSHADER_SOURCE = `
    attribute vec3 posicion;
    void main() {
        gl_Position = vec4(posicion, 1.0);
        gl_PointSize = 10.0;
    }
`

// Shader de fragmentos
const FSHADER_SOURCE = `
    uniform highp vec3 color;
    void main() {
        gl_FragColor = vec4(color, 1.0)
    }
`

// Globales 
const clicks = [];
let colorFragmento;

function main() {
    // Recupera el lienzo
    const canvas = document.getElementById("canvas");
    const gl = getWebGLConstext(canvas);

    //Cargo shaders en programa de GPU
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("caca");
    }

    // Color de borrado del lienzo
    gl.clearColor(0, 0, 0.3, 1);

    // Localiza el att del shader posicion
    const coordenadas = gl.getAttribLocation(gl.program, 'posicion');

    // Crea buffer, etc
    const bufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertices);
    gl.vertexAttribPointer(coordenadas, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertex(coordenadas);

    // Asignar el mismo color a todos los puntos
    colorFragmento = gl.getUniformLocation(gl.program, 'color');

    // Registrar la call-back del click del raton
    canvas.onmousedown = function(e) { click(e, gl, canvas); };

    // Dibujar 
    render(gl);
} 

function click(e, gl, canvas) {
    // Recuperar la posicion del click
    // El click devuelve la (x, y) en el sistema de referencia
    // del documento. Los puntos que se pasan al shader deben
    // de estar en el cuadrado de lado dos centrado en el canvas

    let x = e.clientX;
    let y = e.clientY;
    const rectanguloCanvas = e.target.getBoundingClientRect();

    // Conversion de coordenadas al sistema webgl por defecto
    x = (x - rectanguloCanvas.left - canvas.width/2) * 2/canvas.width;
    y = (canvas.height/2 - y - rectanguloCanvas.top) * 2/canvas.height;
}