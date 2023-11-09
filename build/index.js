import * as gpio from "gpio";
import * as display from "./display.js";
import * as pins from "./pin_config.js";
import * as pieces from "./pieces.js";
import * as colors from "./libs/colors.js";
gpio.pinMode(pins.UP, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.DOWN, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.LEFT, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.RIGHT, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.ENTER, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.SW_L_UP, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.SW_L_DOWN, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.SW_R_UP, gpio.PinMode.INPUT_PULLUP);
gpio.pinMode(pins.SW_R_DOWN, gpio.PinMode.INPUT_PULLUP);
gpio.on("falling", pins.UP, () => {
    move_up();
    //drawFrame();
});
gpio.on("falling", pins.DOWN, () => {
    move_down();
    //drawFrame();
});
gpio.on("falling", pins.LEFT, () => {
    move_left();
    //drawFrame();
});
gpio.on("falling", pins.RIGHT, () => {
    move_right();
    //drawFrame();
});
/*
gpio.on("falling", pins.ENTER, () => {

});*/
/*
gpio.on("falling", pins.SW_L_UP, () => {

});*/
gpio.on("falling", pins.SW_L_DOWN, () => {
    newPiece();
    //drawFrame();
});
/*
gpio.on("falling", pins.SW_R_UP, () => {
    
});*/
gpio.on("falling", pins.SW_R_DOWN, () => {
    rotatePiece();
    drawFrame();
});
let brightness = 2;
const calculated_colors = [
    colors.off,
    colors.rainbow(pieces.colors[1], brightness),
    colors.rainbow(pieces.colors[2], brightness),
    colors.rainbow(pieces.colors[3], brightness),
    colors.rainbow(pieces.colors[4], brightness),
    colors.rainbow(pieces.colors[5], brightness),
    colors.rainbow(pieces.colors[6], brightness),
    colors.rainbow(pieces.colors[7], brightness),
];
let savedArray = new Array(display.height);
for (let i = 0; i < display.height; i++) {
    savedArray[i] = new Array(display.width).fill(0);
}
let displayArray = new Array(display.height);
for (let i = 0; i < display.height; i++) {
    displayArray[i] = new Array(display.width).fill(0);
}
let activePiece;
function interact() {
    activePiece.last_rotation = activePiece.rotation;
    activePiece.last_pos_x = activePiece.pos_x;
    activePiece.last_pos_y = activePiece.pos_y;
}
function undo() {
    activePiece.rotation = activePiece.last_rotation;
    activePiece.pos_x = activePiece.last_pos_x;
    activePiece.pos_y = activePiece.last_pos_y;
}
function rotatePiece() {
    interact();
    activePiece.rotation++;
    drawFrame();
}
function move_left() {
    interact();
    activePiece.pos_x--;
    activePiece.cmd = "left";
    drawFrame();
}
function move_right() {
    interact();
    activePiece.pos_x++;
    activePiece.cmd = "right";
    drawFrame();
}
function move_down() {
    interact();
    activePiece.pos_y++;
    activePiece.cmd = "down";
    drawFrame();
}
// DEV
function move_up() {
    interact();
    activePiece.pos_y--;
    activePiece.cmd = "up";
    drawFrame();
}
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    // Create a new empty matrix with swapped dimensions
    const rotatedMatrix = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Swap rows and columns
            rotatedMatrix[col][rows - 1 - row] = matrix[row][col];
        }
    }
    return rotatedMatrix;
}
function newPiece() {
    let piece_type;
    try {
        piece_type = activePiece.type;
    }
    catch (error) {
        piece_type = 0;
    }
    piece_type++;
    if (piece_type == 7) {
        piece_type = 0;
    }
    let y = 1;
    if (piece_type == 0 || piece_type == 1) {
        y = 0;
    }
    activePiece = { pos_x: 5, pos_y: y, last_pos_x: 5, last_pos_y: y, type: piece_type, rotation: 0, last_rotation: 0, cmd: "" };
}
function preparePiece() {
    while (activePiece.rotation > 3) {
        activePiece.rotation -= 4;
    }
    let out_matrix = pieces.table[activePiece.type];
    for (let i = 0; i < activePiece.rotation; i++) {
        out_matrix = rotateMatrix(out_matrix);
    }
    return out_matrix;
}
function savePlaced() {
    for (let y = 0; y < display.height; y++) {
        for (let x = 0; x < display.width; x++) {
            savedArray[x][y] = displayArray[x][y];
        }
    }
}
function test(matrix) {
    const p_h = matrix.length;
    const p_w = matrix[0].length;
    const center_x = pieces.centers[activePiece.type][0];
    const center_y = pieces.centers[activePiece.type][1];
    for (let y = 0; y < p_h; y++) {
        for (let x = 0; x < p_w; x++) {
            if (matrix[y][x] != 0) {
                const p_x = activePiece.pos_x + x - center_x;
                const p_y = activePiece.pos_y + y - center_y;
                if (p_x >= display.width || p_x < 0) {
                    undo();
                    return;
                }
                else if (p_y >= display.height) {
                    savePlaced();
                    checkLines();
                    newPiece();
                    return;
                }
                if (p_y >= 0 && savedArray[p_x][p_y] != 0) {
                    if (activePiece.cmd == "down") {
                        savePlaced();
                        checkLines();
                        newPiece();
                        return;
                    }
                    else {
                        undo();
                        return;
                    }
                }
            }
        }
    }
}
function checkLines() {
    for (let y = 0; y < display.height; y++) {
        let full = true;
        for (let x = 0; x < display.width; x++) {
            if (displayArray[x][y] == 0) {
                full = false;
            }
        }
        if (full == true) {
            for (let i = y; i > 0; i--) {
                for (let o = 0; o < display.width; o++) {
                    displayArray[o][i] = displayArray[o][i - 1];
                    savedArray[o][i] = savedArray[o][i - 1];
                }
            }
        }
    }
}
function drawSaved() {
    for (let y = 0; y < display.height; y++) {
        for (let x = 0; x < display.width; x++) {
            displayArray[x][y] = savedArray[x][y];
        }
    }
}
function drawPiece(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[0].length; x++) {
            if (matrix[y][x] != 0) {
                let p_x = activePiece.pos_x + x - pieces.centers[activePiece.type][0];
                let p_y = activePiece.pos_y + y - pieces.centers[activePiece.type][1];
                if (p_x >= 0) {
                    displayArray[p_x][p_y] = matrix[y][x];
                }
            }
        }
    }
}
function printToDisplay() {
    for (let y = 0; y < display.height; y++) {
        for (let x = 0; x < display.width; x++) {
            display.setColor(x, y, calculated_colors[displayArray[x][y]]);
        }
    }
    display.show();
}
function drawFrame() {
    /*savedArray = new Array(display.height);
    for (let i = 0; i < display.height; i++) {
        savedArray[i] = new Array(display.width).fill(0);
    }*/
    test(preparePiece());
    drawSaved();
    drawPiece(preparePiece());
    printToDisplay();
}
// main loop
async function main() {
    newPiece();
    drawFrame();
    while (true) {
        move_down();
        drawFrame();
        await sleep(1000);
    }
}
main();
/*
setInterval(() => {
    // activePiece.rotation++;
    drawFrame();
}, 100)*/
