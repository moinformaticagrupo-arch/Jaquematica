/* =========================================================
   AJEDREZ IA - SCRIPT PRINCIPAL
   Matemática + Ajedrez + Inteligencia Artificial
========================================================= */


/* =========================================================
   VARIABLES PRINCIPALES
========================================================= */

const chessBoard = document.getElementById("chessBoard");
const aiChessBoard = document.getElementById("aiChessBoard");

const gameMessage = document.getElementById("gameMessage");
const gameMessageText = document.getElementById("gameMessageText");

const analysisContent = document.getElementById("analysisContent");
const moveHistory = document.getElementById("moveHistory");

const playerScoreElement = document.getElementById("playerScore");
const aiScoreElement = document.getElementById("aiScore");

const scorePlayer = document.getElementById("scorePlayer");
const scoreAI = document.getElementById("scoreAI");

const aiDifficultyLabel =
    document.getElementById("aiDifficultyLabel");


/* =========================================================
   PIEZAS
========================================================= */

const PIECES = {

    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }

};


/* =========================================================
   VALORES DE LAS PIEZAS
========================================================= */

const PIECE_VALUES = {

    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100

};


/* =========================================================
   ESTADO DEL JUEGO
========================================================= */

let board = [];

let selectedSquare = null;

let currentTurn = "white";

let gameOver = false;

let difficulty = "medium";

let playerScore = 0;

let aiScore = 0;

let totalGames = 0;

let totalWins = 0;

let totalMoves = 0;

let goodMoves = 0;

let moveNumber = 1;
/* =========================================================
   REGLAS DE TABLAS
========================================================= */

let halfmoveClock = 0;

let positionHistory = [];

/* =========================================================
   RELOJ DE PARTIDA
========================================================= */

let gameTime = 300;

let playerTime = 300;

let aiTime = 300;

let gameTimer = null;

let clockStarted = false;


/* =========================================================
   HISTORIAL PARA DESHACER
========================================================= */

let undoHistory = [];

let pendingUndoState = null;


/* =========================================================
   MOVIMIENTO IA PENDIENTE
========================================================= */

let aiMoveTimeout = null;


/* =========================================================
   REGLAS ESPECIALES DE AJEDREZ
========================================================= */

let castlingRights = {

    whiteKing: true,

    whiteRookKing: true,

    whiteRookQueen: true,

    blackKing: true,

    blackRookKing: true,

    blackRookQueen: true

};

let enPassantTarget = null;


/* =========================================================
   FLECHAS - ÚLTIMAS 3 JUGADAS
========================================================= */

let lastThreeMoves = [];


/* =========================================================
   MOVIMIENTOS PARA LA CUADRÍCULA
========================================================= */

let gridMoves = [];


/* =========================================================
   IA VS IA
========================================================= */

let aiBoard = [];

let aiTurn = "white";

let aiPlaying = false;

let aiPaused = false;

let aiMoveTimer = null;

let aiSpeed = 3000;

let aiMoveCount = 0;


/* =========================================================
   POSICIÓN INICIAL
========================================================= */

function createInitialBoard() {

    return [

        [

            { type: "rook", color: "black" },

            { type: "knight", color: "black" },

            { type: "bishop", color: "black" },

            { type: "queen", color: "black" },

            { type: "king", color: "black" },

            { type: "bishop", color: "black" },

            { type: "knight", color: "black" },

            { type: "rook", color: "black" }

        ],

        [

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" },

            { type: "pawn", color: "black" }

        ],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" },

            { type: "pawn", color: "white" }

        ],

        [

            { type: "rook", color: "white" },

            { type: "knight", color: "white" },

            { type: "bishop", color: "white" },

            { type: "queen", color: "white" },

            { type: "king", color: "white" },

            { type: "bishop", color: "white" },

            { type: "knight", color: "white" },

            { type: "rook", color: "white" }

        ]

    ];

}


/* =========================================================
   CREAR TABLERO
========================================================= */

function renderBoard() {

    if (!chessBoard) return;

    chessBoard.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("div");

            square.classList.add(
                "chess-square"
            );

            const isLight =
                (row + col) % 2 === 0;

            square.classList.add(

                isLight
                    ? "light-square"
                    : "dark-square"

            );

            square.dataset.row = row;

            square.dataset.col = col;

            const piece =
                board[row][col];

            if (piece) {

                const pieceElement =
                    document.createElement("span");

                pieceElement.classList.add(
                    "chess-piece",
                    piece.color
                );

                pieceElement.textContent =
                    PIECES[piece.color][piece.type];

                square.appendChild(
                    pieceElement
                );

            }

            square.addEventListener(

                "click",

                () =>
                    handleSquareClick(
                        row,
                        col
                    )

            );

            chessBoard.appendChild(
                square
            );

        }

    }


    requestAnimationFrame(() => {

        drawAllMoveArrows();

        drawGridMoves();

    });

}


/* =========================================================
   AGREGAR FLECHA
========================================================= */

function addMoveArrow(from, to) {

    if (!from || !to) return;


    /* Flechas del tablero */

    lastThreeMoves.push({

        fromRow: from.row,

        fromCol: from.col,

        toRow: to.row,

        toCol: to.col

    });


    /* Mantener solamente las últimas 3 */

    if (lastThreeMoves.length > 3) {

        lastThreeMoves.shift();

    }


    /* Guardar todos los movimientos
       para dibujarlos en la cuadrícula */

    gridMoves.push({

        fromRow: from.row,

        fromCol: from.col,

        toRow: to.row,

        toCol: to.col

    });


    drawAllMoveArrows();

    drawGridMoves();

}


/* =========================================================
   DIBUJAR TODAS LAS FLECHAS
========================================================= */

function drawAllMoveArrows() {

    const canvas =
        document.getElementById(
            "moveCanvas"
        );

    const boardElement =
        document.getElementById(
            "chessBoard"
        );

    if (!canvas || !boardElement) return;

    const rect =
        boardElement.getBoundingClientRect();

    if (

        rect.width <= 0 ||

        rect.height <= 0

    ) {

        return;

    }


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;


    canvas.style.width =
        `${rect.width}px`;

    canvas.style.height =
        `${rect.height}px`;


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );


    ctx.clearRect(

        0,

        0,

        rect.width,

        rect.height

    );


    const squareWidth =
        rect.width / 8;

    const squareHeight =
        rect.height / 8;


    lastThreeMoves.forEach(move => {

        const startX =

            move.fromCol *
            squareWidth +
            squareWidth / 2;

        const startY =

            move.fromRow *
            squareHeight +
            squareHeight / 2;

        const endX =

            move.toCol *
            squareWidth +
            squareWidth / 2;

        const endY =

            move.toRow *
            squareHeight +
            squareHeight / 2;


        const angle =

            Math.atan2(

                endY - startY,

                endX - startX

            );


        const arrowSize =

            Math.min(

                18,

                squareWidth * 0.25

            );


        ctx.beginPath();

        ctx.moveTo(

            startX,

            startY

        );

        ctx.lineTo(

            endX,

            endY

        );

        ctx.lineWidth = 6;

        ctx.strokeStyle =
            "rgba(255, 193, 7, 0.95)";

        ctx.lineCap =
            "round";

        ctx.lineJoin =
            "round";

        ctx.stroke();


        /* Punta de la flecha */

        ctx.beginPath();

        ctx.moveTo(

            endX,

            endY

        );

        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle - Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle - Math.PI / 6
            )

        );

        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle + Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle + Math.PI / 6
            )

        );

        ctx.closePath();

        ctx.fillStyle =
            "rgba(255, 193, 7, 0.95)";

        ctx.fill();

    });

}


/* =========================================================
   DIBUJAR MOVIMIENTOS EN LA CUADRÍCULA
========================================================= */

function drawGridMoves() {

    const canvas =
        document.getElementById(
            "gridCanvas"
        );

    const boardElement =
        document.getElementById(
            "gridBoard"
        );

    if (!canvas || !boardElement) return;

    const rect =
        boardElement.getBoundingClientRect();

    if (

        rect.width <= 0 ||

        rect.height <= 0

    ) {

        return;

    }


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;


    canvas.style.width =
        `${rect.width}px`;

    canvas.style.height =
        `${rect.height}px`;


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0

    );


    ctx.clearRect(

        0,

        0,

        rect.width,

        rect.height

    );


    const squareWidth =
        rect.width / 8;

    const squareHeight =
        rect.height / 8;


    gridMoves.forEach(move => {

        const startX =

            move.fromCol *
            squareWidth +
            squareWidth / 2;

        const startY =

            move.fromRow *
            squareHeight +
            squareHeight / 2;

        const endX =

            move.toCol *
            squareWidth +
            squareWidth / 2;

        const endY =

            move.toRow *
            squareHeight +
            squareHeight / 2;


        const angle =

            Math.atan2(

                endY - startY,

                endX - startX

            );


        const arrowSize =

            Math.min(

                15,

                squareWidth * 0.22

            );


        ctx.beginPath();

        ctx.moveTo(

            startX,

            startY

        );

        ctx.lineTo(

            endX,

            endY

        );

        ctx.lineWidth = 4;

        ctx.strokeStyle =
            "rgba(255, 193, 7, 0.85)";

        ctx.lineCap =
            "round";

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(

            endX,

            endY

        );

        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle - Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle - Math.PI / 6
            )

        );

        ctx.lineTo(

            endX -
            arrowSize *
            Math.cos(
                angle + Math.PI / 6
            ),

            endY -
            arrowSize *
            Math.sin(
                angle + Math.PI / 6
            )

        );

        ctx.closePath();

        ctx.fillStyle =
            "rgba(255, 193, 7, 0.85)";

        ctx.fill();

    });

}


/* =========================================================
   REDIBUJAR FLECHAS AL CAMBIAR TAMAÑO
========================================================= */

window.addEventListener(

    "resize",

    () => {

        drawAllMoveArrows();

        drawGridMoves();

    }

);


/* =========================================================
   CLONAR TABLERO
========================================================= */

function cloneBoard(position) {

    return position.map(row =>

        row.map(piece =>

            piece
                ? {
                    type: piece.type,
                    color: piece.color
                }
                : null

        )

    );

}


/* =========================================================
   RETRASO DE LA IA
========================================================= */

function getAIDelay() {

    if (difficulty === "easy") {

        return 1000;

    }

    if (difficulty === "hard") {

        return 250;

    }

    return 600;

}


/* =========================================================
   COLOR OPUESTO
========================================================= */

function getOpponentColor(color) {

    return color === "white"
        ? "black"
        : "white";

}


/* =========================================================
   COMPROBAR CASILLA DENTRO DEL TABLERO
========================================================= */

function isInsideBoard(row, col) {

    return (

        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8

    );

}


/* =========================================================
   BUSCAR REY
========================================================= */

function findKing(position, color) {

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                position[row][col];

            if (

                piece &&

                piece.color === color &&

                piece.type === "king"

            ) {

                return {
                    row,
                    col
                };

            }

        }

    }

    return null;

}


/* =========================================================
   COMPROBAR SI UNA CASILLA ES ATACADA
========================================================= */

function isSquareAttacked(

    position,
    row,
    col,
    byColor

) {

    /* Peones */

    const pawnRow =
        byColor === "white"
            ? row + 1
            : row - 1;

    for (
        const pawnCol of [col - 1, col + 1]
    ) {

        if (
            isInsideBoard(
                pawnRow,
                pawnCol
            )
        ) {

            const piece =
                position[pawnRow][pawnCol];

            if (

                piece &&

                piece.color === byColor &&

                piece.type === "pawn"

            ) {

                return true;

            }

        }

    }


    /* Caballos */

    const knightMoves = [

        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1]

    ];


    for (const [dr, dc] of knightMoves) {

        const r = row + dr;

        const c = col + dc;

        if (
            !isInsideBoard(r, c)
        ) continue;

        const piece =
            position[r][c];

        if (

            piece &&

            piece.color === byColor &&

            piece.type === "knight"

        ) {

            return true;

        }

    }


    /* Reyes */

    for (
        let dr = -1;
        dr <= 1;
        dr++
    ) {

        for (
            let dc = -1;
            dc <= 1;
            dc++
        ) {

            if (
                dr === 0 &&
                dc === 0
            ) continue;

            const r = row + dr;

            const c = col + dc;

            if (
                !isInsideBoard(r, c)
            ) continue;

            const piece =
                position[r][c];

            if (

                piece &&

                piece.color === byColor &&

                piece.type === "king"

            ) {

                return true;

            }

        }

    }


    /* Torres y damas */

    const rookDirections = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    for (
        const [dr, dc]
        of rookDirections
    ) {

        let r = row + dr;

        let c = col + dc;

        while (
            isInsideBoard(r, c)
        ) {

            const piece =
                position[r][c];

            if (piece) {

                if (

                    piece.color === byColor &&

                    (
                        piece.type === "rook" ||
                        piece.type === "queen"
                    )

                ) {

                    return true;

                }

                break;

            }

            r += dr;

            c += dc;

        }

    }


    /* Alfiles y damas */

    const bishopDirections = [

        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]

    ];


    for (
        const [dr, dc]
        of bishopDirections
    ) {

        let r = row + dr;

        let c = col + dc;

        while (
            isInsideBoard(r, c)
        ) {

            const piece =
                position[r][c];

            if (piece) {

                if (

                    piece.color === byColor &&

                    (
                        piece.type === "bishop" ||
                        piece.type === "queen"
                    )

                ) {

                    return true;

                }

                break;

            }

            r += dr;

            c += dc;

        }

    }


    return false;

}


/* =========================================================
   COMPROBAR JAQUE
========================================================= */

function isKingInCheck(position, color) {

    const king =
        findKing(
            position,
            color
        );

    if (!king) return true;

    return isSquareAttacked(

        position,

        king.row,

        king.col,

        getOpponentColor(color)

    );

}
/* =========================================================
   COMPROBAR MOVIMIENTO DE PEÓN
========================================================= */

function isPawnMove(position, from, to, piece) {

    const direction =
        piece.color === "white"
            ? -1
            : 1;

    const startRow =
        piece.color === "white"
            ? 6
            : 1;

    const rowDiff =
        to.row - from.row;

    const colDiff =
        to.col - from.col;

    const target =
        position[to.row][to.col];


    /* AVANCE NORMAL */

    if (
        colDiff === 0 &&
        rowDiff === direction &&
        !target
    ) {

        return true;

    }


    /* AVANCE DOBLE DESDE LA POSICIÓN INICIAL */

    if (
        colDiff === 0 &&
        rowDiff === direction * 2 &&
        from.row === startRow &&
        !target &&
        !position[
            from.row + direction
        ][
            from.col
        ]
    ) {

        return true;

    }


    /* CAPTURA DIAGONAL */

    if (
        Math.abs(colDiff) === 1 &&
        rowDiff === direction &&
        target &&
        target.color !== piece.color &&
        target.type !== "king"
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   COMPROBAR CAMINO LIBRE
========================================================= */

function isPathClear(
    position,
    from,
    to
) {

    const rowStep =
        Math.sign(
            to.row - from.row
        );

    const colStep =
        Math.sign(
            to.col - from.col
        );


    let row =
        from.row + rowStep;

    let col =
        from.col + colStep;


    while (
        row !== to.row ||
        col !== to.col
    ) {

        if (
            position[row][col]
        ) {

            return false;

        }


        row += rowStep;

        col += colStep;

    }


    return true;

}


/* =========================================================
   MOVIMIENTO PSEUDOLEGAL
========================================================= */

function isPseudoLegalMove(
    position,
    from,
    to
) {

    const piece =
        position[
            from.row
        ][
            from.col
        ];


    if (!piece) {

        return false;

    }


    const target =
        position[
            to.row
        ][
            to.col
        ];


    /* No se puede capturar una pieza propia */

    if (
        target &&
        target.color === piece.color
    ) {

        return false;

    }


    /* En ajedrez no se captura directamente al rey */

    if (
        target &&
        target.type === "king"
    ) {

        return false;

    }


    const rowDiff =
        to.row - from.row;

    const colDiff =
        to.col - from.col;


    switch (piece.type) {


        /* =================================================
           PEÓN
        ================================================= */

        case "pawn":

            return isPawnMove(
                position,
                from,
                to,
                piece
            );


        /* =================================================
           CABALLO
        ================================================= */

        case "knight":

            return (

                (
                    Math.abs(rowDiff) === 2 &&
                    Math.abs(colDiff) === 1
                )

                ||

                (
                    Math.abs(rowDiff) === 1 &&
                    Math.abs(colDiff) === 2
                )

            );


        /* =================================================
           ALFIL
        ================================================= */

        case "bishop":

            if (
                Math.abs(rowDiff) !==
                Math.abs(colDiff)
            ) {

                return false;

            }


            return isPathClear(
                position,
                from,
                to
            );


        /* =================================================
           TORRE
        ================================================= */

        case "rook":

            if (
                rowDiff !== 0 &&
                colDiff !== 0
            ) {

                return false;

            }


            return isPathClear(
                position,
                from,
                to
            );


        /* =================================================
           DAMA
        ================================================= */

        case "queen":

            if (

                rowDiff !== 0 &&

                colDiff !== 0 &&

                Math.abs(rowDiff) !==
                Math.abs(colDiff)

            ) {

                return false;

            }


            return isPathClear(
                position,
                from,
                to
            );


        /* =================================================
           REY
        ================================================= */

        case "king":

            return (

                Math.abs(rowDiff) <= 1 &&

                Math.abs(colDiff) <= 1

            );

    }


    return false;

}


/* =========================================================
   ENROQUE
========================================================= */

function getCastlingMove(
    position,
    from,
    to,
    color
) {

    const row =
        color === "white"
            ? 7
            : 0;


    /* El rey tiene que estar en e1/e8 */

    if (

        from.row !== row ||

        from.col !== 4 ||

        to.row !== row

    ) {

        return null;

    }


    /* No se puede enrocar estando en jaque */

    if (
        isKingInCheck(
            position,
            color
        )
    ) {

        return null;

    }


    /* =====================================================
       ENROQUE CORTO
    ===================================================== */

    if (
        to.col === 6
    ) {

        const canCastle =

            color === "white"

                ? (
                    castlingRights.whiteKing &&
                    castlingRights.whiteRookKing
                )

                : (
                    castlingRights.blackKing &&
                    castlingRights.blackRookKing
                );


        const rook =
            position[row][7];


        if (

            !canCastle ||

            !rook ||

            rook.type !== "rook" ||

            rook.color !== color

        ) {

            return null;

        }


        /* f1/f8 y g1/g8 deben estar libres */

        if (

            position[row][5] ||

            position[row][6]

        ) {

            return null;

        }


        /* El rey no puede atravesar
           una casilla atacada */

        if (

            isSquareAttacked(

                position,

                row,
                5,
                getOpponentColor(color)

            )

            ||

            isSquareAttacked(

                position,

                row,
                6,
                getOpponentColor(color)

            )

        ) {

            return null;

        }


        return {

            from,

            to,

            castle: "king"

        };

    }


    /* =====================================================
       ENROQUE LARGO
    ===================================================== */

    if (
        to.col === 2
    ) {

        const canCastle =

            color === "white"

                ? (
                    castlingRights.whiteKing &&
                    castlingRights.whiteRookQueen
                )

                : (
                    castlingRights.blackKing &&
                    castlingRights.blackRookQueen
                );


        const rook =
            position[row][0];


        if (

            !canCastle ||

            !rook ||

            rook.type !== "rook" ||

            rook.color !== color

        ) {

            return null;

        }


        /* b1/b8, c1/c8 y d1/d8 libres */

        if (

            position[row][1] ||

            position[row][2] ||

            position[row][3]

        ) {

            return null;

        }


        /* El rey no puede atravesar
           casillas atacadas */

        if (

            isSquareAttacked(

                position,

                row,
                3,
                getOpponentColor(color)

            )

            ||

            isSquareAttacked(

                position,

                row,
                2,
                getOpponentColor(color)

            )

        ) {

            return null;

        }


        return {

            from,

            to,

            castle: "queen"

        };

    }


    return null;

}


/* =========================================================
   CAPTURA AL PASO
========================================================= */

function getEnPassantMove(
    position,
    from,
    to,
    piece
) {

    if (

        piece.type !== "pawn" ||

        !enPassantTarget

    ) {

        return null;

    }


    if (

        to.row !==
        enPassantTarget.row ||

        to.col !==
        enPassantTarget.col

    ) {

        return null;

    }


    const direction =

        piece.color === "white"
            ? -1
            : 1;


    if (

        to.row - from.row !== direction ||

        Math.abs(
            to.col - from.col
        ) !== 1

    ) {

        return null;

    }


    /* La casilla de destino debe estar vacía */

    if (
        position[to.row][to.col]
    ) {

        return null;

    }


    /* Peón que será capturado */

    const capturedPawn =

        position[
            from.row
        ][
            to.col
        ];


    if (

        !capturedPawn ||

        capturedPawn.type !== "pawn" ||

        capturedPawn.color === piece.color

    ) {

        return null;

    }


    return {

        from,

        to,

        enPassant: true

    };

}


/* =========================================================
   SIMULAR MOVIMIENTO
========================================================= */

function simulateMove(
    position,
    move
) {

    const copy =
        cloneBoard(position);


    const piece =
        copy[
            move.from.row
        ][
            move.from.col
        ];


    if (!piece) {

        return copy;

    }


    /* Movimiento normal */

    copy[
        move.to.row
    ][
        move.to.col
    ] = piece;


    copy[
        move.from.row
    ][
        move.from.col
    ] = null;


    /* =====================================================
       CAPTURA AL PASO
    ===================================================== */

    if (
        move.enPassant
    ) {

        copy[
            move.from.row
        ][
            move.to.col
        ] = null;

    }


    /* =====================================================
       ENROQUE CORTO
    ===================================================== */

    if (
        move.castle === "king"
    ) {

        const row =
            move.from.row;


        copy[row][5] =
            copy[row][7];


        copy[row][7] =
            null;

    }


    /* =====================================================
       ENROQUE LARGO
    ===================================================== */

    if (
        move.castle === "queen"
    ) {

        const row =
            move.from.row;


        copy[row][3] =
            copy[row][0];


        copy[row][0] =
            null;

    }


    /* =====================================================
       PROMOCIÓN AUTOMÁTICA
       Por ahora siempre promociona a DAMA
    ===================================================== */

    if (

        piece.type === "pawn" &&

        (
            move.to.row === 0 ||

            move.to.row === 7
        )

    ) {

        copy[
            move.to.row
        ][
            move.to.col
        ] = {

            type: "queen",

            color: piece.color

        };

    }


    return copy;

}


/* =========================================================
   COMPROBAR MOVIMIENTO LEGAL
========================================================= */

function isLegalMove(
    position,
    from,
    to
) {

    const piece =
        position[
            from.row
        ][
            from.col
        ];


    if (!piece) {

        return false;

    }


    const target =
        position[
            to.row
        ][
            to.col
        ];


    if (

        target &&

        target.color === piece.color

    ) {

        return false;

    }


    /* Nunca capturar directamente al rey */

    if (

        target &&

        target.type === "king"

    ) {

        return false;

    }


    let move = null;


    /* =====================================================
       ENROQUE
    ===================================================== */

    if (

        piece.type === "king" &&

        Math.abs(
            to.col - from.col
        ) === 2

    ) {

        move =
            getCastlingMove(

                position,

                from,

                to,

                piece.color

            );


        if (!move) {

            return false;

        }

    }

    else {


        /* Movimiento normal */

        if (

            !isPseudoLegalMove(

                position,

                from,

                to

            )

        ) {


            /* Intentar captura al paso */

            move =
                getEnPassantMove(

                    position,

                    from,

                    to,

                    piece

                );


            if (!move) {

                return false;

            }

        }

        else {

            move = {

                from,

                to

            };

        }

    }


    /* Simular movimiento */

    const simulated =
        simulateMove(
            position,
            move
        );


    /* El propio rey nunca puede quedar en jaque */

    return !isKingInCheck(

        simulated,

        piece.color

    );

}


/* =========================================================
   OBTENER TODOS LOS MOVIMIENTOS LEGALES
========================================================= */

function getAllLegalMoves(
    position,
    color
) {

    const moves = [];


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const piece =
                position[row][col];


            if (

                !piece ||

                piece.color !== color

            ) {

                continue;

            }


            for (
                let targetRow = 0;
                targetRow < 8;
                targetRow++
            ) {

                for (
                    let targetCol = 0;
                    targetCol < 8;
                    targetCol++
                ) {

                    const from = {

                        row,

                        col

                    };


                    const to = {

                        row: targetRow,

                        col: targetCol

                    };


                    /* =================================================
                       ENROQUE
                    ================================================= */

                    if (

                        piece.type === "king" &&

                        Math.abs(
                            targetCol - col
                        ) === 2

                    ) {

                        const castle =

                            getCastlingMove(

                                position,

                                from,

                                to,

                                color

                            );


                        if (castle) {

                            const simulated =

                                simulateMove(

                                    position,

                                    castle

                                );


                            if (

                                !isKingInCheck(

                                    simulated,

                                    color

                                )

                            ) {

                                moves.push(
                                    castle
                                );

                            }

                        }


                        continue;

                    }


                    let move = null;


                    /* Movimiento normal */

                    if (

                        isPseudoLegalMove(

                            position,

                            from,

                            to

                        )

                    ) {

                        move = {

                            from,

                            to

                        };

                    }

                    else {

                        /* Captura al paso */

                        move =

                            getEnPassantMove(

                                position,

                                from,

                                to,

                                piece

                            );

                    }


                    if (!move) {

                        continue;

                    }


                    const simulated =

                        simulateMove(

                            position,

                            move

                        );


                    /* No permitir dejar al propio rey
                       en jaque */

                    if (

                        !isKingInCheck(

                            simulated,

                            color

                        )

                    ) {

                        moves.push(
                            move
                        );

                    }

                }

            }

        }

    }


    return moves;

}


/* =========================================================
   OBTENER CASILLA HTML
========================================================= */

function getSquare(
    row,
    col
) {

    if (!chessBoard) {

        return null;

    }


    return chessBoard.querySelector(

        `[data-row="${row}"][data-col="${col}"]`

    );

}


/* =========================================================
   LIMPIAR RESALTADOS
========================================================= */

function clearHighlights() {

    if (!chessBoard) return;


    chessBoard
        .querySelectorAll(
            ".selected-square, .possible-move, .capture-move, .error-square"
        )
        .forEach(
            square => {

                square.classList.remove(
                    "selected-square"
                );

                square.classList.remove(
                    "possible-move"
                );

                square.classList.remove(
                    "capture-move"
                );

                square.classList.remove(
                    "error-square"
                );

            }
        );

}


/* =========================================================
   RESALTAR PIEZA SELECCIONADA
========================================================= */

function highlightSelectedSquare() {

    if (!selectedSquare) return;


    const square =
        getSquare(

            selectedSquare.row,

            selectedSquare.col

        );


    if (!square) return;


    square.classList.add(
        "selected-square"
    );

}


/* =========================================================
   MOSTRAR MOVIMIENTOS POSIBLES
========================================================= */

function showPossibleMoves(
    row,
    col
) {

    const moves =

        getAllLegalMoves(

            board,

            "white"

        );


    moves.forEach(
        move => {

            if (

                move.from.row === row &&

                move.from.col === col

            ) {

                const square =

                    getSquare(

                        move.to.row,

                        move.to.col

                    );


                if (!square) return;


                square.classList.add(
                    "possible-move"
                );


                if (

                    board[
                        move.to.row
                    ][
                        move.to.col
                    ]

                ) {

                    square.classList.add(
                        "capture-move"
                    );

                }

            }

        }
    );

}


/* =========================================================
   RESALTAR ERROR
========================================================= */

function highlightErrorSquare(
    row,
    col
) {

    const square =
        getSquare(
            row,
            col
        );


    if (!square) return;


    square.classList.add(
        "error-square"
    );


    setTimeout(
        () => {

            square.classList.remove(
                "error-square"
            );

        },
        500
    );

}
/* =========================================================
   CLICK EN EL TABLERO
========================================================= */

function handleSquareClick(row, col) {

    if (gameOver) return;

    /* Solamente puede mover el jugador con blancas */

    if (currentTurn !== "white") {

        return;

    }


    const piece =
        board[row][col];


    /* =====================================================
       SI NO HAY PIEZA SELECCIONADA
    ===================================================== */

    if (!selectedSquare) {

        if (
            !piece ||
            piece.color !== "white"
        ) {

            showMessage(
                "Seleccioná una pieza blanca.",
                "error"
            );

            return;

        }


        selectedSquare = {

            row,
            col

        };


        clearHighlights();

        highlightSelectedSquare();

        showPossibleMoves(
            row,
            col
        );

        return;

    }


    /* =====================================================
       SI SELECCIONA OTRA PIEZA BLANCA
    ===================================================== */

    if (
        piece &&
        piece.color === "white"
    ) {

        selectedSquare = {

            row,
            col

        };


        clearHighlights();

        highlightSelectedSquare();

        showPossibleMoves(
            row,
            col
        );

        return;

    }


    /* =====================================================
       INTENTAR REALIZAR MOVIMIENTO
    ===================================================== */

    const from =
        selectedSquare;

    const to = {

        row,
        col

    };


    if (
        !isLegalMove(
            board,
            from,
            to
        )
    ) {

        showMessage(
            "Ese movimiento no es válido.",
            "error"
        );


        highlightErrorSquare(
            row,
            col
        );


        return;

    }


    makePlayerMove(
        from,
        to
    );

}


/* =========================================================
   ACTUALIZAR DERECHOS DE ENROQUE
========================================================= */

function updateCastlingRightsAfterMove(
    movingPiece,
    from,
    to,
    capturedPiece
) {

    if (!movingPiece) return;


    /* =====================================================
       SI SE MUEVE EL REY
    ===================================================== */

    if (
        movingPiece.type === "king"
    ) {

        if (
            movingPiece.color === "white"
        ) {

            castlingRights.whiteKing =
                false;

        } else {

            castlingRights.blackKing =
                false;

        }

    }


    /* =====================================================
       SI SE MUEVE UNA TORRE
    ===================================================== */

    if (
        movingPiece.type === "rook"
    ) {


        /* TORRE BLANCA DEL LADO DEL REY */

        if (

            movingPiece.color === "white" &&

            from.row === 7 &&

            from.col === 7

        ) {

            castlingRights.whiteRookKing =
                false;

        }


        /* TORRE BLANCA DEL LADO DE LA DAMA */

        if (

            movingPiece.color === "white" &&

            from.row === 7 &&

            from.col === 0

        ) {

            castlingRights.whiteRookQueen =
                false;

        }


        /* TORRE NEGRA DEL LADO DEL REY */

        if (

            movingPiece.color === "black" &&

            from.row === 0 &&

            from.col === 7

        ) {

            castlingRights.blackRookKing =
                false;

        }


        /* TORRE NEGRA DEL LADO DE LA DAMA */

        if (

            movingPiece.color === "black" &&

            from.row === 0 &&

            from.col === 0

        ) {

            castlingRights.blackRookQueen =
                false;

        }

    }


    /* =====================================================
       SI CAPTURAN UNA TORRE
    ===================================================== */

    if (

        capturedPiece &&

        capturedPiece.type === "rook"

    ) {


        /* TORRE BLANCA EN h1 */

        if (

            capturedPiece.color === "white" &&

            to.row === 7 &&

            to.col === 7

        ) {

            castlingRights.whiteRookKing =
                false;

        }


        /* TORRE BLANCA EN a1 */

        if (

            capturedPiece.color === "white" &&

            to.row === 7 &&

            to.col === 0

        ) {

            castlingRights.whiteRookQueen =
                false;

        }


        /* TORRE NEGRA EN h8 */

        if (

            capturedPiece.color === "black" &&

            to.row === 0 &&

            to.col === 7

        ) {

            castlingRights.blackRookKing =
                false;

        }


        /* TORRE NEGRA EN a8 */

        if (

            capturedPiece.color === "black" &&

            to.row === 0 &&

            to.col === 0

        ) {

            castlingRights.blackRookQueen =
                false;

        }

    }

}


/* =========================================================
   EJECUTAR MOVIMIENTO COMPLETO
========================================================= */

function executeMoveOnBoard(move) {

    const from =
        move.from;

    const to =
        move.to;


    const movingPiece =
        board[
            from.row
        ][
            from.col
        ];


    if (!movingPiece) {

        return {

            movingPiece: null,

            capturedPiece: null

        };

    }


    let capturedPiece =
        board[
            to.row
        ][
            to.col
        ];


    /* Actualizar derechos de enroque */

    updateCastlingRightsAfterMove(

        movingPiece,

        from,

        to,

        capturedPiece

    );


    /* =====================================================
       MOVIMIENTO NORMAL
    ===================================================== */

    board[
        to.row
    ][
        to.col
    ] =
        movingPiece;


    board[
        from.row
    ][
        from.col
    ] =
        null;


    /* =====================================================
       CAPTURA AL PASO
    ===================================================== */

    if (
        move.enPassant
    ) {

        capturedPiece =
            board[
                from.row
            ][
                to.col
            ];


        board[
            from.row
        ][
            to.col
        ] =
            null;

    }


    /* =====================================================
       ENROQUE CORTO
    ===================================================== */

    if (
        move.castle === "king"
    ) {

        const row =
            from.row;


        board[row][5] =
            board[row][7];


        board[row][7] =
            null;

    }


    /* =====================================================
       ENROQUE LARGO
    ===================================================== */

    if (
        move.castle === "queen"
    ) {

        const row =
            from.row;


        board[row][3] =
            board[row][0];


        board[row][0] =
            null;

    }


    /* =====================================================
       PROMOCIÓN DEL PEÓN
       Por ahora se convierte automáticamente en DAMA
    ===================================================== */

    if (

        movingPiece.type === "pawn" &&

        (
            to.row === 0 ||

            to.row === 7

        )

    ) {

        movingPiece.type =
            "queen";

    }


    /* =====================================================
       ACTUALIZAR CAPTURA AL PASO
    ===================================================== */

    enPassantTarget =
        null;


    if (

        movingPiece.type === "pawn" &&

        Math.abs(
            to.row - from.row
        ) === 2

    ) {

        enPassantTarget = {

            row:
                (from.row + to.row) / 2,

            col:
                from.col

        };

    }


    return {

        movingPiece,

        capturedPiece

    };

}


/* =========================================================
   ESTADO DE LA POSICIÓN
========================================================= */

function getPositionStatus(color) {

    const inCheck =
        isKingInCheck(
            board,
            color
        );


    const legalMoves =
        getAllLegalMoves(
            board,
            color
        );


    /* =====================================================
       JAQUE MATE
    ===================================================== */

    if (

        inCheck &&

        legalMoves.length === 0

    ) {

        return "checkmate";

    }


    /* =====================================================
       REY AHOGADO
    ===================================================== */

    if (

        !inCheck &&

        legalMoves.length === 0

    ) {

        return "stalemate";

    }


    /* =====================================================
       JAQUE
    ===================================================== */

    if (inCheck) {

        return "check";

    }


    return "normal";

}


/* =========================================================
   MOSTRAR ESTADO DEL AJEDREZ
========================================================= */

function showChessStatus(
    color,
    status
) {


    /* =====================================================
       JAQUE
    ===================================================== */

    if (
        status === "check"
    ) {

        if (
            color === "white"
        ) {

            showMessage(
                "⚠️ ¡JAQUE! Tu rey está en jaque.",
                "error"
            );


            showAnalysis(
                "⚠️ JAQUE",
                "Tu rey está siendo atacado. Debés realizar un movimiento que elimine el jaque.",
                "error"
            );

        } else {

            showMessage(
                "⚠️ ¡JAQUE! El rey de la IA está en jaque.",
                "success"
            );


            showAnalysis(
                "⚠️ JAQUE A LA IA",
                "El rey de la IA está siendo atacado.",
                "success"
            );

        }


        return;

    }


    /* =====================================================
       JAQUE MATE
    ===================================================== */

    if (
        status === "checkmate"
    ) {

        if (
            color === "white"
        ) {

            endGame(
                "ai",
                "checkmate"
            );

        } else {

            endGame(
                "player",
                "checkmate"
            );

        }


        return;

    }


    /* =====================================================
       REY AHOGADO
    ===================================================== */

    if (
        status === "stalemate"
    ) {

        gameOver =
            true;


        if (
            typeof stopGameClock ===
            "function"
        ) {

            stopGameClock();

        }


        updateGameMessage(
            "🤝 Tablas por rey ahogado."
        );


        showAnalysis(
            "🤝 REY AHOGADO",
            "No existen movimientos legales y el rey no está en jaque. La partida termina en tablas.",
            "success"
        );


        return;

    }

}


/* =========================================================
   MOVIMIENTO DEL JUGADOR
========================================================= */

function makePlayerMove(
    from,
    to
) {

    /* =====================================================
       GUARDAR ESTADO PARA DESHACER
    ===================================================== */

    saveUndoState();


    /* =====================================================
       INICIAR RELOJ
    ===================================================== */

    if (
        typeof startGameClock ===
        "function"
    ) {

        startGameClock();

    }


    /* =====================================================
       BUSCAR EL MOVIMIENTO LEGAL REAL
    ===================================================== */

    const legalMoves =
        getAllLegalMoves(
            board,
            "white"
        );


    const move =
        legalMoves.find(

            candidate =>

                candidate.from.row ===
                    from.row &&

                candidate.from.col ===
                    from.col &&

                candidate.to.row ===
                    to.row &&

                candidate.to.col ===
                    to.col

        );


    if (!move) {

        undoHistory.pop();


        showMessage(
            "Ese movimiento dejaría a tu rey en jaque.",
            "error"
        );


        return;

    }


    const movingPiece =
        board[
            from.row
        ][
            from.col
        ];


    const movingPieceType =
        movingPiece.type;


    const capturedPiece =

        move.enPassant

            ? board[
                from.row
            ][
                to.col
            ]

            : board[
                to.row
            ][
                to.col
            ];


    /* =====================================================
       NOTACIÓN
    ===================================================== */

    const moveText =
        createMoveNotation(
            from,
            to,
            movingPiece
        );


    /* =====================================================
       EJECUTAR
    ===================================================== */

    executeMoveOnBoard(
        move
    );


    /* =====================================================
       FLECHA
    ===================================================== */

    addMoveArrow(
        from,
        to
    );


    selectedSquare =
        null;


    totalMoves++;

    goodMoves++;


    /* =====================================================
       PUNTUACIÓN
    ===================================================== */

    if (capturedPiece) {

        playerScore +=

            PIECE_VALUES[
                capturedPiece.type
            ] * 10;

    } else {

        playerScore += 5;

    }


    updateScores();


    /* =====================================================
       HISTORIAL
    ===================================================== */

    addMoveToHistory(
        moveText,
        "player"
    );


    clearHighlights();

    renderBoard();


    /* =====================================================
       CAMBIAR TURNO
    ===================================================== */

    currentTurn =
        "black";


    /* =====================================================
       COMPROBAR ESTADO DEL REY NEGRO
    ===================================================== */

    const blackStatus =
        getPositionStatus(
            "black"
        );


    if (
        blackStatus === "checkmate"
    ) {

        showChessStatus(
            "black",
            "checkmate"
        );


        return;

    }


    if (
        blackStatus === "stalemate"
    ) {

        showChessStatus(
            "black",
            "stalemate"
        );


        return;

    }


    if (
        blackStatus === "check"
    ) {

        showChessStatus(
            "black",
            "check"
        );

    } else {

        showAnalysis(
            "¡Buena jugada!",
            `Moviste ${getPieceName(movingPieceType)} correctamente.`,
            "success"
        );


        updateGameMessage(
            "La IA está pensando..."
        );

    }


    /* =====================================================
       DAR TURNO A LA IA
    ===================================================== */

    aiMoveTimeout =
        setTimeout(
            makeAIMove,
            getAIDelay()
        );

}
/* =========================================================
   MOVIMIENTO IA
========================================================= */

function makeAIMove() {

    aiMoveTimeout = null;

    if (gameOver) return;


    /* =====================================================
       OBTENER TODOS LOS MOVIMIENTOS LEGALES
    ===================================================== */

    const possibleMoves =
        getAllLegalMoves(
            board,
            "black"
        );


    /* =====================================================
       SI NO HAY MOVIMIENTOS
    ===================================================== */

    if (
        possibleMoves.length === 0
    ) {

        const status =
            isKingInCheck(
                board,
                "black"
            )
                ? "checkmate"
                : "stalemate";


        showChessStatus(
            "black",
            status
        );


        return;

    }


    /* =====================================================
       ELEGIR MOVIMIENTO
    ===================================================== */

    const selectedMove =
        chooseAIMove(
            possibleMoves
        );


    if (!selectedMove) return;


    const movingPiece =
        board[
            selectedMove.from.row
        ][
            selectedMove.from.col
        ];


    /* =====================================================
       PIEZA CAPTURADA
    ===================================================== */

    const capturedPiece =

        selectedMove.enPassant

            ? board[
                selectedMove.from.row
            ][
                selectedMove.to.col
            ]

            : board[
                selectedMove.to.row
            ][
                selectedMove.to.col
            ];


    const movingPieceType =
        movingPiece.type;


    /* =====================================================
       NOTACIÓN
    ===================================================== */

    const moveText =
        createMoveNotation(
            selectedMove.from,
            selectedMove.to,
            movingPiece
        );


    /* =====================================================
       EJECUTAR MOVIMIENTO
    ===================================================== */

    executeMoveOnBoard(
        selectedMove
    );


    /* =====================================================
       FLECHA DEL MOVIMIENTO
    ===================================================== */

    addMoveArrow(
        selectedMove.from,
        selectedMove.to
    );


    /* =====================================================
       PUNTUACIÓN IA
    ===================================================== */

    if (capturedPiece) {

        aiScore +=
            PIECE_VALUES[
                capturedPiece.type
            ] * 10;

    }


    updateScores();


    /* =====================================================
       HISTORIAL
    ===================================================== */

    addMoveToHistory(
        moveText,
        "ai"
    );


    clearHighlights();

    renderBoard();


    /* =====================================================
       RESALTAR MOVIMIENTO DE LA IA
    ===================================================== */

    highlightAISquare(
        selectedMove.from.row,
        selectedMove.from.col
    );


    highlightAISquare(
        selectedMove.to.row,
        selectedMove.to.col
    );


    /* =====================================================
       CAMBIAR TURNO
    ===================================================== */

    currentTurn =
        "white";


    /* =====================================================
       COMPROBAR ESTADO DEL REY BLANCO
    ===================================================== */

    const whiteStatus =
        getPositionStatus(
            "white"
        );


    /* =====================================================
       JAQUE MATE
    ===================================================== */

    if (
        whiteStatus === "checkmate"
    ) {

        showChessStatus(
            "white",
            "checkmate"
        );


        return;

    }


    /* =====================================================
       REY AHOGADO
    ===================================================== */

    if (
        whiteStatus === "stalemate"
    ) {

        showChessStatus(
            "white",
            "stalemate"
        );


        return;

    }


    /* =====================================================
       JAQUE
    ===================================================== */

    if (
        whiteStatus === "check"
    ) {

        showChessStatus(
            "white",
            "check"
        );


        showAnalysis(

            "🤖 Movimiento de la IA",

            `La IA movió ${getPieceName(movingPieceType)} y te dejó en jaque.`,

            "ai"

        );

    }

    else {

        showAnalysis(

            "Movimiento de la IA",

            `La IA movió ${getPieceName(movingPieceType)}.`,

            "ai"

        );


        updateGameMessage(
            "Tu turno. Elegí una pieza."
        );

    }

}


/* =========================================================
   ELEGIR MOVIMIENTO DE LA IA
========================================================= */

function chooseAIMove(moves) {

    if (
        moves.length === 0
    ) {

        return null;

    }


    /* =====================================================
       DIFICULTAD FÁCIL
    ===================================================== */

    if (
        difficulty === "easy"
    ) {

        return moves[
            Math.floor(
                Math.random() *
                moves.length
            )
        ];

    }


    /* =====================================================
       DIFICULTAD MEDIA
    ===================================================== */

    if (
        difficulty === "medium"
    ) {

        const captures =
            moves.filter(
                move => {

                    if (
                        move.enPassant
                    ) {

                        return true;

                    }


                    return !!board[
                        move.to.row
                    ][
                        move.to.col
                    ];

                }
            );


        if (

            captures.length > 0 &&

            Math.random() > 0.35

        ) {

            return captures[
                Math.floor(
                    Math.random() *
                    captures.length
                )
            ];

        }


        return moves[
            Math.floor(
                Math.random() *
                moves.length
            )
        ];

    }


    /* =====================================================
       DIFICULTAD DIFÍCIL
    ===================================================== */

    if (
        difficulty === "hard"
    ) {

        const scoredMoves =
            moves.map(
                move => {

                    let score =
                        Math.random() * 3;


                    const target =
                        move.enPassant

                            ? board[
                                move.from.row
                            ][
                                move.to.col
                            ]

                            : board[
                                move.to.row
                            ][
                                move.to.col
                            ];


                    /* Valorar capturas */

                    if (target) {

                        score +=
                            PIECE_VALUES[
                                target.type
                            ] * 10;

                    }


                    /* Valorar jaques */

                    const simulated =
                        simulateMove(
                            board,
                            move
                        );


                    if (
                        isKingInCheck(
                            simulated,
                            "white"
                        )
                    ) {

                        score += 12;

                    }


                    return {

                        move,

                        score

                    };

                }

            );


        scoredMoves.sort(

            (a, b) =>
                b.score - a.score

        );


        return scoredMoves[0].move;

    }


    /* =====================================================
       DIFICULTAD EXPERTA
    ===================================================== */

    if (
        difficulty === "expert"
    ) {

        return findBestMove(
            board,
            "black"
        );

    }


    return moves[0];

}


/* =========================================================
   MINI MOTOR DE IA
========================================================= */

function findBestMove(
    position,
    color
) {

    const moves =
        getAllLegalMoves(
            position,
            color
        );


    if (
        moves.length === 0
    ) {

        return null;

    }


    let bestMove =
        moves[0];


    let bestScore =
        -Infinity;


    for (
        const move of moves
    ) {

        /* =================================================
           SIMULAR EL MOVIMIENTO
        ================================================= */

        const copy =
            simulateMove(
                position,
                move
            );


        /* =================================================
           PIEZA CAPTURADA
        ================================================= */

        const captured =

            move.enPassant

                ? position[
                    move.from.row
                ][
                    move.to.col
                ]

                : position[
                    move.to.row
                ][
                    move.to.col
                ];


        let score =
            Math.random() * 2;


        /* =================================================
           VALOR DE CAPTURA
        ================================================= */

        if (captured) {

            score +=
                PIECE_VALUES[
                    captured.type
                ] * 20;

        }


        /* =================================================
           EVALUAR POSICIÓN
        ================================================= */

        score +=
            evaluatePosition(
                copy,
                color
            );


        /* =================================================
           PREMIAR JAQUE
        ================================================= */

        const opponent =
            getOpponentColor(
                color
            );


        if (
            isKingInCheck(
                copy,
                opponent
            )
        ) {

            score += 15;

        }


        /* =================================================
           ELEGIR MEJOR MOVIMIENTO
        ================================================= */

        if (
            score > bestScore
        ) {

            bestScore =
                score;


            bestMove =
                move;

        }

    }


    return bestMove;

}


/* =========================================================
   EVALUAR POSICIÓN
========================================================= */

function evaluatePosition(
    position,
    color
) {

    let score = 0;


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const piece =
                position[row][col];


            if (!piece) continue;


            const value =
                PIECE_VALUES[
                    piece.type
                ];


            if (
                piece.color === color
            ) {

                score += value;

            }

            else {

                score -= value;

            }

        }

    }


    return score;

}


/* =========================================================
   OBTENER NOMBRE DE LA PIEZA
========================================================= */

function getPieceName(type) {

    const names = {

        pawn: "peón",

        knight: "caballo",

        bishop: "alfil",

        rook: "torre",

        queen: "dama",

        king: "rey"

    };


    return names[type] || type;

}


/* =========================================================
   RESALTAR MOVIMIENTO DE LA IA
========================================================= */

function highlightAISquare(
    row,
    col
) {

    const square =
        getSquare(
            row,
            col
        );


    if (!square) return;


    square.classList.add(
        "ai-move-highlight"
    );


    setTimeout(
        () => {

            square.classList.remove(
                "ai-move-highlight"
            );

        },
        900
    );

}
/* =========================================================
   CREAR NOTACIÓN DEL MOVIMIENTO
========================================================= */

function createMoveNotation(
    from,
    to,
    piece
) {

    if (!piece) return "";


    const files = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h"
    ];


    const fromSquare =

        files[from.col] +

        (8 - from.row);


    const toSquare =

        files[to.col] +

        (8 - to.row);


    /* =====================================================
       ENROQUE CORTO
    ===================================================== */

    if (

        piece.type === "king" &&

        Math.abs(
            to.col - from.col
        ) === 2 &&

        to.col > from.col

    ) {

        return "O-O";

    }


    /* =====================================================
       ENROQUE LARGO
    ===================================================== */

    if (

        piece.type === "king" &&

        Math.abs(
            to.col - from.col
        ) === 2 &&

        to.col < from.col

    ) {

        return "O-O-O";

    }


    const pieceLetters = {

        pawn: "",

        knight: "C",

        bishop: "A",

        rook: "T",

        queen: "D",

        king: "R"

    };


    const letter =
        pieceLetters[
            piece.type
        ] || "";


    const target =
        board[
            to.row
        ][
            to.col
        ];


    const isCapture =
        !!target;


    /* =====================================================
       PEÓN
    ===================================================== */

    if (
        piece.type === "pawn"
    ) {

        if (isCapture) {

            return (

                files[from.col] +

                "x" +

                toSquare

            );

        }


        return toSquare;

    }


    /* =====================================================
       PIEZAS
    ===================================================== */

    return (

        letter +

        (
            isCapture
                ? "x"
                : ""
        ) +

        toSquare

    );

}


/* =========================================================
   AGREGAR MOVIMIENTO AL HISTORIAL
========================================================= */

function addMoveToHistory(
    text,
    player
) {

    if (!moveHistory) return;


    const item =
        document.createElement(
            "div"
        );


    item.classList.add(
        "history-move"
    );


    if (
        player === "player"
    ) {

        item.classList.add(
            "player-move"
        );

    }

    else {

        item.classList.add(
            "ai-move"
        );

    }


    item.textContent =
        `${moveNumber}. ${text}`;


    moveHistory.appendChild(
        item
    );


    /* =====================================================
       CADA DOS MOVIMIENTOS AUMENTA EL NÚMERO
    ===================================================== */

    if (
        player === "ai"
    ) {

        moveNumber++;

    }


    /* Bajar automáticamente al último movimiento */

    moveHistory.scrollTop =
        moveHistory.scrollHeight;

}


/* =========================================================
   MOSTRAR MENSAJE DEL JUEGO
========================================================= */

function showMessage(
    message,
    type = "info"
) {

    if (
        gameMessageText
    ) {

        gameMessageText.textContent =
            message;

    }


    if (
        gameMessage
    ) {

        gameMessage.classList.remove(
            "success",
            "error",
            "warning",
            "info"
        );


        gameMessage.classList.add(
            type
        );

    }

}


/* =========================================================
   ACTUALIZAR MENSAJE PRINCIPAL
========================================================= */

function updateGameMessage(
    message
) {

    if (
        gameMessageText
    ) {

        gameMessageText.textContent =
            message;

    }

}


/* =========================================================
   MOSTRAR ANÁLISIS
========================================================= */

function showAnalysis(
    title,
    text,
    type = "info"
) {

    if (
        !analysisContent
    ) {

        return;

    }


    const analysis =
        document.createElement(
            "div"
        );


    analysis.classList.add(
        "analysis-item"
    );


    if (type) {

        analysis.classList.add(
            type
        );

    }


    const titleElement =
        document.createElement(
            "strong"
        );


    titleElement.textContent =
        title;


    const textElement =
        document.createElement(
            "p"
        );


    textElement.textContent =
        text;


    analysis.appendChild(
        titleElement
    );


    analysis.appendChild(
        textElement
    );


    analysisContent.appendChild(
        analysis
    );


    analysisContent.scrollTop =
        analysisContent.scrollHeight;

}


/* =========================================================
   ACTUALIZAR PUNTUACIONES
========================================================= */

function updateScores() {

    if (
        playerScoreElement
    ) {

        playerScoreElement.textContent =
            playerScore;

    }


    if (
        aiScoreElement
    ) {

        aiScoreElement.textContent =
            aiScore;

    }


    if (
        scorePlayer
    ) {

        scorePlayer.textContent =
            playerScore;

    }


    if (
        scoreAI
    ) {

        scoreAI.textContent =
            aiScore;

    }

}


/* =========================================================
   ACTUALIZAR ETIQUETA DE DIFICULTAD
========================================================= */

function updateDifficultyLabel() {

    if (
        !aiDifficultyLabel
    ) {

        return;

    }


    const names = {

        easy: "Fácil",

        medium: "Media",

        hard: "Difícil",

        expert: "Experta"

    };


    aiDifficultyLabel.textContent =

        names[difficulty] ||
        difficulty;

}


/* =========================================================
   CAMBIAR DIFICULTAD
========================================================= */

function setDifficulty(
    newDifficulty
) {

    if (
        !newDifficulty
    ) {

        return;

    }


    difficulty =
        newDifficulty;


    updateDifficultyLabel();


    showMessage(

        `Dificultad de la IA: ${newDifficulty}`,

        "info"

    );

}


/* =========================================================
   LEER DIFICULTAD DESDE SELECT
========================================================= */

function initializeDifficulty() {

    const select =
        document.getElementById(
            "difficultySelect"
        );


    if (!select) return;


    difficulty =
        select.value ||
        "medium";


    select.addEventListener(
        "change",
        function () {

            difficulty =
                this.value;


            updateDifficultyLabel();

        }
    );


    updateDifficultyLabel();

}


/* =========================================================
   ACTUALIZAR RELOJ
========================================================= */

function updateClockDisplay() {

    const playerClock =
        document.getElementById(
            "playerClock"
        );


    const aiClock =
        document.getElementById(
            "aiClock"
        );


    if (
        playerClock
    ) {

        playerClock.textContent =
            formatTime(
                playerTime
            );

    }


    if (
        aiClock
    ) {

        aiClock.textContent =
            formatTime(
                aiTime
            );

    }

}


/* =========================================================
   FORMATEAR TIEMPO
========================================================= */

function formatTime(
    seconds
) {

    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        String(minutes)
            .padStart(2, "0") +

        ":" +

        String(remainingSeconds)
            .padStart(2, "0")

    );

}


/* =========================================================
   INICIAR RELOJ
========================================================= */

function startGameClock() {

    if (
        clockStarted
    ) {

        return;

    }


    clockStarted =
        true;


    if (
        gameTimer
    ) {

        clearInterval(
            gameTimer
        );

    }


    gameTimer =
        setInterval(
            updateGameClock,
            1000
        );


    updateClockDisplay();

}


/* =========================================================
   ACTUALIZAR RELOJ DE LA PARTIDA
========================================================= */

function updateGameClock() {

    if (gameOver) {

        stopGameClock();

        return;

    }


    if (
        currentTurn === "white"
    ) {

        playerTime--;

        if (
            playerTime <= 0
        ) {

            playerTime = 0;

            updateClockDisplay();

            endGame(
                "ai",
                "time"
            );

            return;

        }

    }

    else {

        aiTime--;

        if (
            aiTime <= 0
        ) {

            aiTime = 0;

            updateClockDisplay();

            endGame(
                "player",
                "time"
            );

            return;

        }

    }


    updateClockDisplay();

}


/* =========================================================
   DETENER RELOJ
========================================================= */

function stopGameClock() {

    if (
        gameTimer
    ) {

        clearInterval(
            gameTimer
        );

    }


    gameTimer =
        null;


    clockStarted =
        false;

}


/* =========================================================
   OBTENER TIEMPO DEL SELECT
========================================================= */

function getSelectedGameTime() {

    const select =
        document.getElementById(
            "gameTimeSelect"
        );


    if (!select) {

        return 300;

    }


    const value =
        parseInt(
            select.value,
            10
        );


    if (
        Number.isNaN(value)
    ) {

        return 300;

    }


    return value;

}


/* =========================================================
   CONFIGURAR RELOJ
========================================================= */

function setupGameClock() {

    gameTime =
        getSelectedGameTime();


    playerTime =
        gameTime;


    aiTime =
        gameTime;


    clockStarted =
        false;


    updateClockDisplay();

}


/* =========================================================
   CAMBIAR TIEMPO DE PARTIDA
========================================================= */

function changeGameTime() {

    if (
        clockStarted
    ) {

        return;

    }


    setupGameClock();

}


/* =========================================================
   EVENTO DEL SELECTOR DE TIEMPO
========================================================= */

function initializeGameTimeSelector() {

    const select =
        document.getElementById(
            "gameTimeSelect"
        );


    if (!select) return;


    select.addEventListener(
        "change",
        function () {

            changeGameTime();

        }
    );


    setupGameClock();

}


/* =========================================================
   FINALIZAR PARTIDA
========================================================= */

function endGame(
    winner,
    reason = "normal"
) {

    if (gameOver) {

        return;

    }


    gameOver =
        true;


    stopGameClock();


    if (
        aiMoveTimeout
    ) {

        clearTimeout(
            aiMoveTimeout
        );

        aiMoveTimeout =
            null;

    }


    totalGames++;


    /* =====================================================
       JAQUE MATE
    ===================================================== */

    if (
        reason === "checkmate"
    ) {

        if (
            winner === "player"
        ) {

            totalWins++;

            playerScore += 100;


            updateGameMessage(
                "♚ ¡JAQUE MATE! ¡Ganaste!"
            );


            showMessage(
                "♚ ¡JAQUE MATE! ¡Victoria!",
                "success"
            );


            showAnalysis(
                "🏆 JAQUE MATE",
                "El rey de la IA no tiene ningún movimiento legal. ¡Ganaste la partida!",
                "success"
            );

        }

        else {

            aiScore += 100;


            updateGameMessage(
                "♚ JAQUE MATE. Ganó la IA."
            );


            showMessage(
                "♚ ¡JAQUE MATE! Ganó la IA.",
                "error"
            );


            showAnalysis(
                "♚ JAQUE MATE",
                "Tu rey no tiene ningún movimiento legal para escapar del jaque.",
                "error"
            );

        }


        updateScores();


        return;

    }


    /* =====================================================
       TIEMPO AGOTADO
    ===================================================== */

    if (
        reason === "time"
    ) {

        if (
            winner === "player"
        ) {

            totalWins++;


            updateGameMessage(
                "⏱️ ¡Ganaste por tiempo!"
            );


            showMessage(
                "⏱️ ¡Ganaste! La IA se quedó sin tiempo.",
                "success"
            );


            showAnalysis(
                "⏱️ VICTORIA POR TIEMPO",
                "El reloj de la IA llegó a cero.",
                "success"
            );

        }

        else {

            updateGameMessage(
                "⏱️ Se acabó tu tiempo."
            );


            showMessage(
                "⏱️ Se acabó tu tiempo. Ganó la IA.",
                "error"
            );


            showAnalysis(
                "⏱️ DERROTA POR TIEMPO",
                "Tu reloj llegó a cero.",
                "error"
            );

        }


        return;

    }


    /* =====================================================
       FINAL NORMAL
    ===================================================== */

    if (
        winner === "player"
    ) {

        totalWins++;

        playerScore += 100;


        updateGameMessage(
            "🎉 ¡Ganaste la partida!"
        );


        showMessage(
            "🎉 ¡Victoria!",
            "success"
        );

    }

    else {

        aiScore += 100;


        updateGameMessage(
            "🤖 Ganó la IA."
        );


        showMessage(
            "🤖 Ganó la IA.",
            "error"
        );

    }


    updateScores();

}
/* =========================================================
   REINICIAR PARTIDA
========================================================= */

function resetGame() {

    /* Detener reloj */

    stopGameClock();


    /* Cancelar movimiento pendiente de la IA */

    if (aiMoveTimeout) {

        clearTimeout(aiMoveTimeout);

        aiMoveTimeout = null;

    }


    /* =====================================================
       REINICIAR TABLERO
    ===================================================== */

    board =
        createInitialBoard();


    /* =====================================================
       REINICIAR ESTADO
    ===================================================== */

    selectedSquare = null;

    currentTurn = "white";

    gameOver = false;

    moveNumber = 1;

    playerScore = 0;

    aiScore = 0;

    totalMoves = 0;

    goodMoves = 0;


    /* =====================================================
       REINICIAR REGLAS ESPECIALES
    ===================================================== */

    castlingRights = {

        whiteKing: true,

        whiteRookKing: true,

        whiteRookQueen: true,

        blackKing: true,

        blackRookKing: true,

        blackRookQueen: true

    };


    enPassantTarget = null;


    /* =====================================================
       REINICIAR FLECHAS
    ===================================================== */

    lastThreeMoves = [];

    gridMoves = [];


    /* =====================================================
       LIMPIAR HISTORIAL
    ===================================================== */

    if (moveHistory) {

        moveHistory.innerHTML = "";

    }


    /* =====================================================
       LIMPIAR ANÁLISIS
    ===================================================== */

    if (analysisContent) {

        analysisContent.innerHTML = "";

    }


    /* =====================================================
       LIMPIAR MENSAJES
    ===================================================== */

    if (gameMessage) {

        gameMessage.classList.remove(
            "success",
            "error",
            "warning"
        );

    }


    updateGameMessage(
        "Tu turno. Elegí una pieza."
    );


    /* =====================================================
       ACTUALIZAR PUNTUACIÓN
    ===================================================== */

    updateScores();


    /* =====================================================
       DIBUJAR TABLERO
    ===================================================== */

    renderBoard();


    /* =====================================================
       DIBUJAR CUADRÍCULA
    ===================================================== */

    if (
        typeof drawGridMoves === "function"
    ) {

        drawGridMoves();

    }


    /* =====================================================
       ACTUALIZAR RELOJ
    ===================================================== */

    setupGameClock();


    /* =====================================================
       MENSAJE INICIAL
    ===================================================== */

    showAnalysis(

        "♟️ Nueva partida",

        "La partida comenzó nuevamente. Las blancas juegan primero.",

        "info"

    );

}


/* =========================================================
   INICIALIZAR PARTIDA
========================================================= */

function initializeGame() {

    /* Crear tablero */

    board =
        createInitialBoard();


    /* Estado inicial */

    selectedSquare = null;

    currentTurn = "white";

    gameOver = false;

    moveNumber = 1;


    /* Puntuaciones */

    playerScore = 0;

    aiScore = 0;


    /* Estadísticas */

    totalMoves = 0;

    goodMoves = 0;


    /* =====================================================
       DERECHOS DE ENROQUE
    ===================================================== */

    castlingRights = {

        whiteKing: true,

        whiteRookKing: true,

        whiteRookQueen: true,

        blackKing: true,

        blackRookKing: true,

        blackRookQueen: true

    };


    /* =====================================================
       AL PASAR
    ===================================================== */

    enPassantTarget = null;


    /* =====================================================
       FLECHAS
    ===================================================== */

    lastThreeMoves = [];

    gridMoves = [];


    /* =====================================================
       RELOJ
    ===================================================== */

    setupGameClock();


    /* =====================================================
       DIBUJAR
    ===================================================== */

    renderBoard();


    if (
        typeof drawGridMoves === "function"
    ) {

        drawGridMoves();

    }


    /* =====================================================
       MENSAJE
    ===================================================== */

    updateGameMessage(
        "Tu turno. Elegí una pieza."
    );


    /* =====================================================
       PUNTUACIÓN
    ===================================================== */

    updateScores();


    /* =====================================================
       DIFICULTAD
    ===================================================== */

    initializeDifficulty();


    /* =====================================================
       SELECTOR DE TIEMPO
    ===================================================== */

    initializeGameTimeSelector();


    /* =====================================================
       EVENTOS DEL TABLERO
    ===================================================== */

    initializeBoardEvents();


    /* =====================================================
       BOTONES
    ===================================================== */

    initializeButtons();


    /* =====================================================
       ANÁLISIS INICIAL
    ===================================================== */

    showAnalysis(

        "♟️ Partida lista",

        "Las blancas comienzan. Podés realizar jaque, jaque mate, enroque, captura al paso y promoción.",

        "info"

    );

}


/* =========================================================
   EVENTOS DEL TABLERO
========================================================= */

function initializeBoardEvents() {

    if (!chessBoard) return;


    /* =====================================================
       EVITAR REGISTRAR EVENTOS DOS VECES
    ===================================================== */

    if (
        chessBoard.dataset.eventsInitialized === "true"
    ) {

        return;

    }


    chessBoard.dataset.eventsInitialized =
        "true";


    chessBoard.addEventListener(
        "click",
        handleSquareClick
    );

}


/* =========================================================
   INICIALIZAR BOTONES
========================================================= */

function initializeButtons() {

    /* =====================================================
       BOTÓN DESHACER
    ===================================================== */

    const undoButton =
        document.getElementById(
            "undoMoveButton"
        );


    if (
        undoButton &&
        undoButton.dataset.initialized !== "true"
    ) {

        undoButton.dataset.initialized =
            "true";


        undoButton.addEventListener(
            "click",
            undoLastMove
        );

    }


    /* =====================================================
       BOTÓN REINICIAR
    ===================================================== */

    const restartButton =
        document.getElementById(
            "restartGameButton"
        );


    if (
        restartButton &&
        restartButton.dataset.initialized !== "true"
    ) {

        restartButton.dataset.initialized =
            "true";


        restartButton.addEventListener(
            "click",
            resetGame
        );

    }


    /* =====================================================
       BOTÓN NUEVA PARTIDA
    ===================================================== */

    const newGameButton =
        document.getElementById(
            "newGameButton"
        );


    if (
        newGameButton &&
        newGameButton.dataset.initialized !== "true"
    ) {

        newGameButton.dataset.initialized =
            "true";


        newGameButton.addEventListener(
            "click",
            resetGame
        );

    }


    /* =====================================================
       BOTÓN PISTA
    ===================================================== */

    const hintButton =
        document.getElementById(
            "hintButton"
        );


    if (
        hintButton &&
        hintButton.dataset.initialized !== "true"
    ) {

        hintButton.dataset.initialized =
            "true";


        hintButton.addEventListener(
            "click",
            showHint
        );

    }

}


/* =========================================================
   MOSTRAR PISTA
========================================================= */

function showHint() {

    if (gameOver) {

        return;

    }


    if (
        currentTurn !== "white"
    ) {

        showMessage(
            "Esperá el turno de la IA.",
            "warning"
        );

        return;

    }


    const legalMoves =
        getAllLegalMoves(
            board,
            "white"
        );


    if (
        legalMoves.length === 0
    ) {

        return;

    }


    /* =====================================================
       BUSCAR MOVIMIENTO CON CAPTURA
    ===================================================== */

    let hintMove =
        legalMoves.find(
            move => {

                if (
                    move.enPassant
                ) {

                    return true;

                }


                return !!board[
                    move.to.row
                ][
                    move.to.col
                ];

            }
        );


    /* =====================================================
       SI NO HAY CAPTURA, ELEGIR UNO
    ===================================================== */

    if (!hintMove) {

        hintMove =
            legalMoves[
                Math.floor(
                    Math.random() *
                    legalMoves.length
                )
            ];

    }


    /* =====================================================
       MOSTRAR PISTA
    ===================================================== */

    clearHighlights();


    highlightSelectedSquare(
        hintMove.from.row,
        hintMove.from.col
    );


    const targetSquare =
        getSquare(
            hintMove.to.row,
            hintMove.to.col
        );


    if (targetSquare) {

        targetSquare.classList.add(
            "hint-square"
        );


        setTimeout(
            () => {

                targetSquare.classList.remove(
                    "hint-square"
                );

            },
            1500
        );

    }


    /* =====================================================
       FLECHA DE PISTA
    ===================================================== */

    addMoveArrow(

        hintMove.from,

        hintMove.to

    );


    showMessage(
        "💡 Pista: probá este movimiento.",
        "info"
    );


    showAnalysis(

        "💡 Pista",

        "La aplicación te marcó un movimiento legal que podés realizar.",

        "info"

    );

}


/* =========================================================
   MOSTRAR ESTADO INICIAL
========================================================= */

function updateInitialStatus() {

    const status =
        getPositionStatus(
            "white"
        );


    if (
        status === "check"
    ) {

        showChessStatus(
            "white",
            "check"
        );

    }

    else if (
        status === "checkmate"
    ) {

        showChessStatus(
            "white",
            "checkmate"
        );

    }

    else if (
        status === "stalemate"
    ) {

        showChessStatus(
            "white",
            "stalemate"
        );

    }

}


/* =========================================================
   COMPROBAR FINAL DE PARTIDA
========================================================= */

function checkGameEnd() {

    if (gameOver) {

        return true;

    }


    const playerStatus =
        getPositionStatus(
            "white"
        );


    const aiStatus =
        getPositionStatus(
            "black"
        );
    /* =====================================================
       TABLAS POR MATERIAL INSUFICIENTE
    ===================================================== */

    if (
        isInsufficientMaterial(board)
    ) {

        showInsufficientMaterialDraw();

        return true;

    }

    /* =====================================================
       JAQUE MATE A LA IA
    ===================================================== */

    if (
        aiStatus === "checkmate"
    ) {

        showChessStatus(
            "black",
            "checkmate"
        );


        endGame(
            "player",
            "checkmate"
        );


        return true;

    }


    /* =====================================================
       JAQUE MATE AL JUGADOR
    ===================================================== */

    if (
        playerStatus === "checkmate"
    ) {

        showChessStatus(
            "white",
            "checkmate"
        );


        endGame(
            "ai",
            "checkmate"
        );


        return true;

    }


    /* =====================================================
       TABLAS POR AHOGADO
    ===================================================== */

    if (
        aiStatus === "stalemate" ||
        playerStatus === "stalemate"
    ) {

        gameOver =
            true;


        stopGameClock();


        updateGameMessage(
            "🤝 Tablas por ahogado."
        );


        showMessage(
            "🤝 La partida terminó en tablas.",
            "warning"
        );


        showAnalysis(

            "🤝 TABLAS",

            "El jugador que debía mover no está en jaque, pero no tiene ningún movimiento legal.",

            "info"

        );


        return true;

    }


    return false;

}


/* =========================================================
   COMPROBAR JAQUE DEL TURNO ACTUAL
========================================================= */

function checkCurrentTurnStatus() {

    if (gameOver) {

        return;

    }


    const status =
        getPositionStatus(
            currentTurn
        );


    if (
        status === "checkmate"
    ) {

        const winner =
            currentTurn === "white"
                ? "ai"
                : "player";


        showChessStatus(
            currentTurn,
            "checkmate"
        );


        endGame(
            winner,
            "checkmate"
        );


        return;

    }


    if (
        status === "stalemate"
    ) {

        checkGameEnd();

        return;

    }


    if (
        status === "check"
    ) {

        showChessStatus(
            currentTurn,
            "check"
        );

    }

}
/* =========================================================
   DESHACER MOVIMIENTO
========================================================= */

function undoLastMove() {

    if (!undoHistory || undoHistory.length === 0) {

        showMessage(
            "No hay movimientos para deshacer.",
            "warning"
        );

        return;

    }


    /* =====================================================
       CANCELAR MOVIMIENTO PENDIENTE DE LA IA
    ===================================================== */

    if (aiMoveTimeout) {

        clearTimeout(aiMoveTimeout);

        aiMoveTimeout = null;

    }


    const previousState =
        undoHistory.pop();


    if (!previousState) {

        return;

    }


    /* =====================================================
       RESTAURAR TABLERO
    ===================================================== */

    board =
        cloneBoard(
            previousState.board
        );


    /* =====================================================
       RESTAURAR TURNO
    ===================================================== */

    currentTurn =
        previousState.currentTurn;


    /* =====================================================
       RESTAURAR ESTADO DE PARTIDA
    ===================================================== */

    gameOver =
        previousState.gameOver;


    /* =====================================================
       RESTAURAR PUNTUACIONES
    ===================================================== */

    playerScore =
        previousState.playerScore;

    aiScore =
        previousState.aiScore;


    /* =====================================================
       RESTAURAR ESTADÍSTICAS
    ===================================================== */

    totalGames =
        previousState.totalGames;

    totalWins =
        previousState.totalWins;

    totalMoves =
        previousState.totalMoves;

    goodMoves =
        previousState.goodMoves;


    /* =====================================================
       RESTAURAR NÚMERO DE MOVIMIENTO
    ===================================================== */

    moveNumber =
        previousState.moveNumber;


    /* =====================================================
       RESTAURAR ENROQUE
    ===================================================== */

    castlingRights =
        JSON.parse(
            JSON.stringify(
                previousState.castlingRights
            )
        );


    /* =====================================================
       RESTAURAR AL PASAR
    ===================================================== */

    enPassantTarget =
        previousState.enPassantTarget
            ? {
                row:
                    previousState
                        .enPassantTarget
                        .row,

                col:
                    previousState
                        .enPassantTarget
                        .col
            }
            : null;


    /* =====================================================
       RESTAURAR FLECHAS
    ===================================================== */

    lastThreeMoves =
        previousState.lastThreeMoves
            ? [
                ...previousState
                    .lastThreeMoves
            ]
            : [];


    gridMoves =
        previousState.gridMoves
            ? [
                ...previousState
                    .gridMoves
            ]
            : [];


    /* =====================================================
       RESTAURAR HISTORIAL
    ===================================================== */

    if (
        moveHistory &&
        previousState.historyHTML !== undefined
    ) {

        moveHistory.innerHTML =
            previousState.historyHTML;

    }


    /* =====================================================
       RESTAURAR RELOJ
    ===================================================== */

    playerTime =
        previousState.playerTime;

    aiTime =
        previousState.aiTime;


    /* =====================================================
       LIMPIAR SELECCIÓN
    ===================================================== */

    selectedSquare =
        null;


    clearHighlights();


    /* =====================================================
       ACTUALIZAR TABLERO
    ===================================================== */

    renderBoard();


    /* =====================================================
       REDIBUJAR FLECHAS
    ===================================================== */

    if (
        typeof drawAllMoveArrows ===
        "function"
    ) {

        drawAllMoveArrows();

    }


    /* =====================================================
       REDIBUJAR CUADRÍCULA
    ===================================================== */

    if (
        typeof drawGridMoves ===
        "function"
    ) {

        drawGridMoves();

    }


    /* =====================================================
       ACTUALIZAR PUNTUACIÓN
    ===================================================== */

    updateScores();


    /* =====================================================
       ACTUALIZAR RELOJ
    ===================================================== */

    updateClockDisplay();


    /* =====================================================
       MENSAJE
    ===================================================== */

    if (
        currentTurn === "white"
    ) {

        updateGameMessage(
            "Movimiento deshecho. Tu turno."
        );

    }

    else {

        updateGameMessage(
            "Movimiento deshecho. Turno de la IA."
        );

    }


    showMessage(
        "↩️ Movimiento deshecho.",
        "info"
    );


    showAnalysis(

        "↩️ Movimiento deshecho",

        "La posición anterior de la partida fue restaurada.",

        "info"

    );


    /* =====================================================
       REINICIAR RELOJ SI LA PARTIDA SIGUE ACTIVA
    ===================================================== */

    if (
        !gameOver &&
        !clockStarted
    ) {

        startGameClock();

    }

}


/* =========================================================
   GUARDAR ESTADO PARA DESHACER
========================================================= */

function saveUndoState() {

    const state = {

        board:
            cloneBoard(
                board
            ),


        currentTurn:
            currentTurn,


        gameOver:
            gameOver,


        playerScore:
            playerScore,


        aiScore:
            aiScore,


        totalGames:
            totalGames,


        totalWins:
            totalWins,


        totalMoves:
            totalMoves,


        goodMoves:
            goodMoves,


        moveNumber:
            moveNumber,


        castlingRights:
            JSON.parse(
                JSON.stringify(
                    castlingRights
                )
            ),


        enPassantTarget:
            enPassantTarget
                ? {
                    row:
                        enPassantTarget
                            .row,

                    col:
                        enPassantTarget
                            .col
                }
                : null,


        lastThreeMoves:
            [
                ...lastThreeMoves
            ],


        gridMoves:
            [
                ...gridMoves
            ],


        playerTime:
            playerTime,


        aiTime:
            aiTime,


        historyHTML:
            moveHistory
                ? moveHistory.innerHTML
                : ""

    };


    undoHistory.push(
        state
    );


    /* =====================================================
       EVITAR UN HISTORIAL INFINITO
    ===================================================== */

    if (
        undoHistory.length > 50
    ) {

        undoHistory.shift();

    }

}


/* =========================================================
   LIMPIAR HISTORIAL DE DESHACER
========================================================= */

function clearUndoHistory() {

    undoHistory = [];

}


/* =========================================================
   GUARDAR MOVIMIENTO ANTES DE REALIZARLO
========================================================= */

function prepareUndoForMove() {

    if (gameOver) {

        return false;

    }


    saveUndoState();


    return true;

}


/* =========================================================
   ACTUALIZAR BOTÓN DESHACER
========================================================= */

function updateUndoButton() {

    const button =
        document.getElementById(
            "undoMoveButton"
        );


    if (!button) {

        return;

    }


    if (
        undoHistory.length === 0
    ) {

        button.disabled = true;

        button.classList.add(
            "disabled"
        );

    }

    else {

        button.disabled = false;

        button.classList.remove(
            "disabled"
        );

    }

}


/* =========================================================
   GUARDAR ESTADO Y ACTUALIZAR BOTÓN
========================================================= */

function saveUndoStateAndUpdate() {

    saveUndoState();

    updateUndoButton();

}


/* =========================================================
   LIMPIAR TODO EL ESTADO DE DESHACER
========================================================= */

function resetUndoSystem() {

    undoHistory = [];

    updateUndoButton();

}


/* =========================================================
   VERSIÓN SEGURA DE GUARDAR ESTADO
========================================================= */

function saveGameStateForUndo() {

    if (!board) {

        return;

    }


    const state = {

        board:
            cloneBoard(
                board
            ),


        currentTurn:
            currentTurn,


        gameOver:
            gameOver,


        playerScore:
            playerScore,


        aiScore:
            aiScore,


        totalGames:
            totalGames,


        totalWins:
            totalWins,


        totalMoves:
            totalMoves,


        goodMoves:
            goodMoves,


        moveNumber:
            moveNumber,


        castlingRights:
            JSON.parse(
                JSON.stringify(
                    castlingRights
                )
            ),


        enPassantTarget:
            enPassantTarget
                ? {
                    row:
                        enPassantTarget
                            .row,

                    col:
                        enPassantTarget
                            .col
                }
                : null,


        lastThreeMoves:
            [
                ...lastThreeMoves
            ],


        gridMoves:
            [
                ...gridMoves
            ],


        playerTime:
            playerTime,


        aiTime:
            aiTime,


        historyHTML:
            moveHistory
                ? moveHistory.innerHTML
                : ""

    };


    undoHistory.push(
        state
    );


    if (
        undoHistory.length > 50
    ) {

        undoHistory.shift();

    }


    updateUndoButton();

}


/* =========================================================
   MOSTRAR ESTADO DEL BOTÓN DESHACER AL CARGAR
========================================================= */

function initializeUndoSystem() {

    const button =
        document.getElementById(
            "undoMoveButton"
        );


    if (!button) {

        return;

    }


    button.disabled = true;


    updateUndoButton();

}
/* =========================================================
   CONTROL DE JAQUE Y JAQUE MATE
========================================================= */

function showChessStatus(color, status) {

    if (status === "check") {

        if (color === "white") {

            updateGameMessage(
                "♚ ¡JAQUE! Tu rey está en peligro."
            );

            showMessage(
                "♚ ¡JAQUE! Tu rey está en peligro.",
                "error"
            );

            showAnalysis(
                "⚠️ JAQUE",
                "Tu rey está siendo atacado. Tenés que mover el rey o bloquear/capturar la pieza atacante.",
                "error"
            );

        }

        else {

            updateGameMessage(
                "♚ ¡JAQUE! El rey de la IA está en peligro."
            );

            showMessage(
                "♚ ¡JAQUE! El rey de la IA está en jaque.",
                "success"
            );

            showAnalysis(
                "⚔️ JAQUE A LA IA",
                "El rey de la IA está siendo atacado. La IA deberá escapar del jaque.",
                "success"
            );

        }

        return;
    }


    if (status === "checkmate") {

        if (color === "white") {

            updateGameMessage(
                "♚ ¡JAQUE MATE! Ganó la IA."
            );

            showMessage(
                "♚ ¡JAQUE MATE! Ganó la IA.",
                "error"
            );

            showAnalysis(
                "♚ JAQUE MATE",
                "Tu rey está en jaque y no existe ningún movimiento legal para escapar.",
                "error"
            );

        }

        else {

            updateGameMessage(
                "♚ ¡JAQUE MATE! ¡Ganaste!"
            );

            showMessage(
                "♚ ¡JAQUE MATE! ¡Ganaste!",
                "success"
            );

            showAnalysis(
                "🏆 JAQUE MATE",
                "El rey de la IA está en jaque y no tiene ningún movimiento legal para escapar.",
                "success"
            );

        }

        return;
    }


    if (status === "stalemate") {

        updateGameMessage(
            "🤝 Tablas por ahogado."
        );

        showMessage(
            "🤝 Tablas por ahogado.",
            "warning"
        );

        showAnalysis(
            "🤝 TABLAS",
            "El jugador no está en jaque, pero no tiene movimientos legales.",
            "info"
        );

    }

}


/* =========================================================
   COMPROBAR SI EL REY ESTÁ EN JAQUE
========================================================= */

function checkForCheck(color) {

    return isKingInCheck(
        board,
        color
    );

}


/* =========================================================
   COMPROBAR JAQUE MATE
========================================================= */

function checkForCheckmate(color) {

    const legalMoves =
        getAllLegalMoves(
            board,
            color
        );


    return (

        legalMoves.length === 0 &&

        isKingInCheck(
            board,
            color
        )

    );

}


/* =========================================================
   COMPROBAR AHOGADO
========================================================= */

function checkForStalemate(color) {

    const legalMoves =
        getAllLegalMoves(
            board,
            color
        );


    return (

        legalMoves.length === 0 &&

        !isKingInCheck(
            board,
            color
        )

    );

}


/* =========================================================
   OBTENER ESTADO COMPLETO DE UNA POSICIÓN
========================================================= */

function getCurrentPositionStatus(color) {

    const inCheck =
        isKingInCheck(
            board,
            color
        );


    const legalMoves =
        getAllLegalMoves(
            board,
            color
        );


    if (
        legalMoves.length === 0
    ) {

        if (inCheck) {

            return "checkmate";

        }

        return "stalemate";

    }


    if (inCheck) {

        return "check";

    }


    return "normal";

}


/* =========================================================
   MARCAR EL REY EN JAQUE
========================================================= */

function highlightKingInCheck(color) {

    const kingPosition =
        findKing(
            board,
            color
        );


    if (!kingPosition) {

        return;

    }


    const square =
        getSquare(
            kingPosition.row,
            kingPosition.col
        );


    if (!square) {

        return;

    }


    square.classList.add(
        "king-in-check"
    );


    setTimeout(
        () => {

            square.classList.remove(
                "king-in-check"
            );

        },
        1800
    );

}


/* =========================================================
   MOSTRAR JAQUE EN EL TABLERO
========================================================= */

function displayCheckStatus(color) {

    if (
        !isKingInCheck(
            board,
            color
        )
    ) {

        return;

    }


    highlightKingInCheck(
        color
    );

}


/* =========================================================
   COMPROBAR ESTADO DESPUÉS DE UN MOVIMIENTO
========================================================= */

function updatePositionAfterMove() {

    const opponent =
        getOpponentColor(
            currentTurn
        );


    const status =
        getCurrentPositionStatus(
            opponent
        );


    if (
        status === "check"
    ) {

        displayCheckStatus(
            opponent
        );

        showChessStatus(
            opponent,
            "check"
        );

        return "check";

    }


    if (
        status === "checkmate"
    ) {

        displayCheckStatus(
            opponent
        );

        showChessStatus(
            opponent,
            "checkmate"
        );

        return "checkmate";

    }


    if (
        status === "stalemate"
    ) {

        showChessStatus(
            opponent,
            "stalemate"
        );

        return "stalemate";

    }


    return "normal";

}


/* =========================================================
   DETECTAR PIEZA ATACANTE DEL REY
========================================================= */

function findCheckingPieces(
    color
) {

    const king =
        findKing(
            board,
            color
        );


    if (!king) {

        return [];

    }


    const opponent =
        getOpponentColor(
            color
        );


    const attackers = [];


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const piece =
                board[row][col];


            if (
                !piece ||
                piece.color !== opponent
            ) {

                continue;

            }


            if (
                isPseudoLegalMove(
                    board,
                    {
                        row,
                        col
                    },
                    king,
                    false
                )
            ) {

                attackers.push({

                    row,

                    col,

                    piece

                });

            }

        }

    }


    return attackers;

}


/* =========================================================
   MOSTRAR PIEZAS QUE ESTÁN DANDO JAQUE
========================================================= */

function highlightCheckingPieces(
    color
) {

    const attackers =
        findCheckingPieces(
            color
        );


    attackers.forEach(
        attacker => {

            const square =
                getSquare(
                    attacker.row,
                    attacker.col
                );


            if (!square) {

                return;

            }


            square.classList.add(
                "checking-piece"
            );


            setTimeout(
                () => {

                    square.classList.remove(
                        "checking-piece"
                    );

                },
                1800
            );

        }
    );

}


/* =========================================================
   COMPROBAR REY DESPUÉS DEL MOVIMIENTO
========================================================= */

function verifyKingSafety() {

    if (!board) {

        return false;

    }


    const whiteKing =
        findKing(
            board,
            "white"
        );


    const blackKing =
        findKing(
            board,
            "black"
        );


    if (
        !whiteKing ||
        !blackKing
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   COMPROBAR QUE NO HAYA DOS REYES EN JAQUE
========================================================= */

function verifyPosition() {

    if (
        !verifyKingSafety()
    ) {

        return false;

    }


    const whiteCheck =
        isKingInCheck(
            board,
            "white"
        );


    const blackCheck =
        isKingInCheck(
            board,
            "black"
        );


    /*
       En una posición legal normalmente no deberían
       quedar ambos reyes en jaque al mismo tiempo.
    */

    if (
        whiteCheck &&
        blackCheck
    ) {

        console.warn(
            "Posición de ajedrez sospechosa: ambos reyes están en jaque."
        );

    }


    return true;

}


/* =========================================================
   ACTUALIZAR ESTADO VISUAL DEL REY
========================================================= */

function refreshKingStatus() {

    if (!board) {

        return;

    }


    const whiteStatus =
        getCurrentPositionStatus(
            "white"
        );


    const blackStatus =
        getCurrentPositionStatus(
            "black"
        );


    if (
        whiteStatus === "check"
    ) {

        displayCheckStatus(
            "white"
        );

    }


    if (
        blackStatus === "check"
    ) {

        displayCheckStatus(
            "black"
        );

    }

}


/* =========================================================
   COMPROBACIÓN FINAL DESPUÉS DE CADA MOVIMIENTO
========================================================= */

function processMoveResult() {

    if (
        !verifyPosition()
    ) {

        return false;

    }


    const status =
        updatePositionAfterMove();


    if (
        status === "checkmate"
    ) {

        checkGameEnd();

        return false;

    }


    if (
        status === "stalemate"
    ) {

        checkGameEnd();

        return false;

    }


    return true;

}


/* =========================================================
   MENSAJE SEGÚN EL TURNO
========================================================= */

function updateTurnMessage() {

    if (gameOver) {

        return;

    }


    if (
        currentTurn === "white"
    ) {

        if (
            isKingInCheck(
                board,
                "white"
            )
        ) {

            updateGameMessage(
                "♚ ¡JAQUE! Tenés que defender tu rey."
            );

        }

        else {

            updateGameMessage(
                "Tu turno. Elegí una pieza."
            );

        }

    }

    else {

        if (
            isKingInCheck(
                board,
                "black"
            )
        ) {

            updateGameMessage(
                "♚ La IA está en jaque."
            );

        }

        else {

            updateGameMessage(
                "🤖 Turno de la IA..."
            );

        }

    }

}


/* =========================================================
   COMPROBACIÓN DE MOVIMIENTOS LEGALES
========================================================= */

function hasLegalMoves(
    color
) {

    const moves =
        getAllLegalMoves(
            board,
            color
        );


    return moves.length > 0;

}


/* =========================================================
   COMPROBAR SI EL JUGADOR ESTÁ ATRAPADO
========================================================= */

function isPlayerTrapped() {

    return !hasLegalMoves(
        "white"
    );

}


/* =========================================================
   COMPROBAR SI LA IA ESTÁ ATRAPADA
========================================================= */

function isAITrapped() {

    return !hasLegalMoves(
        "black"
    );

}
/* =========================================================
   PROMOCIÓN DE PEONES
========================================================= */

function promotePawnIfNeeded(row, col) {

    const piece =
        board[row][col];


    if (!piece) {

        return;

    }


    if (
        piece.type !== "pawn"
    ) {

        return;

    }


    /* =====================================================
       PEÓN BLANCO LLEGÓ A LA ÚLTIMA FILA
    ===================================================== */

    if (
        piece.color === "white" &&
        row === 0
    ) {

        board[row][col] = {

            type: "queen",

            color: "white"

        };


        showMessage(
            "♕ ¡Promoción! Tu peón se convirtió en dama.",
            "success"
        );


        showAnalysis(

            "♕ PROMOCIÓN",

            "Tu peón llegó al final del tablero y se convirtió automáticamente en dama.",

            "success"

        );

    }


    /* =====================================================
       PEÓN NEGRO LLEGÓ A LA ÚLTIMA FILA
    ===================================================== */

    if (
        piece.color === "black" &&
        row === 7
    ) {

        board[row][col] = {

            type: "queen",

            color: "black"

        };


        showMessage(
            "♕ La IA promocionó un peón a dama.",
            "info"
        );


        showAnalysis(

            "♕ PROMOCIÓN DE LA IA",

            "El peón de la IA llegó al final y se convirtió automáticamente en dama.",

            "ai"

        );

    }

}


/* =========================================================
   DETECTAR SI EL MOVIMIENTO ES UNA PROMOCIÓN
========================================================= */

function isPromotionMove(
    move
) {

    if (!move) {

        return false;

    }


    const piece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    if (!piece) {

        return false;

    }


    if (
        piece.type !== "pawn"
    ) {

        return false;

    }


    return (

        (
            piece.color === "white" &&
            move.to.row === 0
        ) ||

        (
            piece.color === "black" &&
            move.to.row === 7
        )

    );

}


/* =========================================================
   PROMOCIÓN AUTOMÁTICA A DAMA
========================================================= */

function handlePromotion(
    move
) {

    if (
        !isPromotionMove(
            move
        )
    ) {

        return;

    }


    promotePawnIfNeeded(

        move.to.row,

        move.to.col

    );

}


/* =========================================================
   DETECTAR ENROQUE
========================================================= */

function isCastlingMove(
    move
) {

    if (!move) {

        return false;

    }


    const piece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    if (!piece) {

        return false;

    }


    return (

        piece.type === "king" &&

        Math.abs(
            move.to.col -
            move.from.col
        ) === 2

    );

}


/* =========================================================
   OBTENER NOMBRE DEL ENROQUE
========================================================= */

function getCastlingNotation(
    move
) {

    if (
        !isCastlingMove(
            move
        )
    ) {

        return "";

    }


    if (
        move.to.col >
        move.from.col
    ) {

        return "O-O";

    }


    return "O-O-O";

}


/* =========================================================
   DETECTAR CAPTURA AL PASO
========================================================= */

function isEnPassantMove(
    move
) {

    return !!(
        move &&
        move.enPassant
    );

}


/* =========================================================
   OBTENER NOTACIÓN ESPECIAL
========================================================= */

function getSpecialMoveNotation(
    move
) {

    if (
        isCastlingMove(
            move
        )
    ) {

        return getCastlingNotation(
            move
        );

    }


    if (
        isEnPassantMove(
            move
        )
    ) {

        const files = [

            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"

        ];


        return (

            files[
                move.from.col
            ] +

            "x" +

            files[
                move.to.col
            ] +

            (
                8 -
                move.to.row
            )

        );

    }


    return null;

}


/* =========================================================
   NOTACIÓN COMPLETA DEL MOVIMIENTO
========================================================= */

function getFullMoveNotation(
    move
) {

    if (!move) {

        return "";

    }


    const special =
        getSpecialMoveNotation(
            move
        );


    if (special) {

        return special;

    }


    const piece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    if (!piece) {

        return "";

    }


    return createMoveNotation(

        move.from,

        move.to,

        piece

    );

}


/* =========================================================
   AGREGAR SÍMBOLO DE JAQUE O JAQUE MATE
========================================================= */

function addCheckSymbol(
    notation,
    color
) {

    if (!notation) {

        return "";

    }


    const opponent =
        getOpponentColor(
            color
        );


    const status =
        getCurrentPositionStatus(
            opponent
        );


    if (
        status === "checkmate"
    ) {

        return notation + "#";

    }


    if (
        status === "check"
    ) {

        return notation + "+";

    }


    return notation;

}


/* =========================================================
   NOTACIÓN FINAL DEL MOVIMIENTO
========================================================= */

function createFinalMoveNotation(
    move,
    color
) {

    let notation =
        getFullMoveNotation(
            move
        );


    notation =
        addCheckSymbol(
            notation,
            color
        );


    return notation;

}


/* =========================================================
   CONTADOR DE MOVIMIENTOS
========================================================= */

function updateMoveCounter() {

    totalMoves++;


    const moveCounter =
        document.getElementById(
            "moveCounter"
        );


    if (
        moveCounter
    ) {

        moveCounter.textContent =
            totalMoves;

    }


    const totalMovesElement =
        document.getElementById(
            "totalMoves"
        );


    if (
        totalMovesElement
    ) {

        totalMovesElement.textContent =
            totalMoves;

    }

}


/* =========================================================
   CONTADOR DE BUENOS MOVIMIENTOS
========================================================= */

function registerGoodMove() {

    goodMoves++;


    const goodMovesElement =
        document.getElementById(
            "goodMoves"
        );


    if (
        goodMovesElement
    ) {

        goodMovesElement.textContent =
            goodMoves;

    }

}


/* =========================================================
   EVALUAR SI UNA JUGADA ES BUENA
========================================================= */

function evaluatePlayerMove(
    move
) {

    if (!move) {

        return false;

    }


    const movingPiece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    if (!movingPiece) {

        return false;

    }


    /* =====================================================
       DAR JAQUE
    ===================================================== */

    const simulated =
        simulateMove(
            board,
            move
        );


    if (
        isKingInCheck(
            simulated,
            "black"
        )
    ) {

        return true;

    }


    /* =====================================================
       CAPTURAR UNA PIEZA
    ===================================================== */

    if (
        move.enPassant
    ) {

        return true;

    }


    if (
        board[
            move.to.row
        ][
            move.to.col
        ]
    ) {

        return true;

    }


    /* =====================================================
       ENROQUE
    ===================================================== */

    if (
        isCastlingMove(
            move
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   REGISTRAR ESTADÍSTICAS DEL MOVIMIENTO
========================================================= */

function registerMoveStats(
    move
) {

    updateMoveCounter();


    if (
        evaluatePlayerMove(
            move
        )
    ) {

        registerGoodMove();

    }

}


/* =========================================================
   ACTUALIZAR HISTORIAL CON NOTACIÓN ESPECIAL
========================================================= */

function addFormattedMoveToHistory(
    move,
    color
) {

    const notation =
        createFinalMoveNotation(
            move,
            color
        );


    addMoveToHistory(

        notation,

        color === "white"
            ? "player"
            : "ai"

    );


    return notation;

}


/* =========================================================
   GUARDAR MOVIMIENTO EN LAS FLECHAS
========================================================= */

function registerMoveArrow(
    move
) {

    if (!move) {

        return;

    }


    addMoveArrow(

        move.from,

        move.to

    );


    if (
        typeof drawAllMoveArrows ===
        "function"
    ) {

        drawAllMoveArrows();

    }

}


/* =========================================================
   ACTUALIZAR CUADRÍCULA DESPUÉS DEL MOVIMIENTO
========================================================= */

function updateMoveGrid(
    move
) {

    if (!move) {

        return;

    }


    gridMoves.push({

        from: {

            row:
                move.from.row,

            col:
                move.from.col

        },

        to: {

            row:
                move.to.row,

            col:
                move.to.col

        }

    });


    /*
       Guardamos solamente los últimos movimientos
       para no llenar la cuadrícula.
    */

    if (
        gridMoves.length > 20
    ) {

        gridMoves.shift();

    }


    if (
        typeof drawGridMoves ===
        "function"
    ) {

        drawGridMoves();

    }

}


/* =========================================================
   REGISTRAR MOVIMIENTO COMPLETO
========================================================= */

function registerCompletedMove(
    move,
    color
) {

    if (!move) {

        return;

    }


    registerMoveStats(
        move
    );


    addFormattedMoveToHistory(

        move,

        color

    );


    registerMoveArrow(
        move
    );


    updateMoveGrid(
        move
    );


    handlePromotion(
        move
    );


    renderBoard();


    refreshKingStatus();

}


/* =========================================================
   PREPARAR MOVIMIENTO
========================================================= */

function prepareMove(
    move
) {

    if (!move) {

        return false;

    }


    if (gameOver) {

        return false;

    }


    if (
        !isLegalMove(
            board,
            move.from,
            move.to,
            currentTurn
        )
    ) {

        return false;

    }


    saveGameStateForUndo();


    return true;

}


/* =========================================================
   FINALIZAR TURNO DEL JUGADOR
========================================================= */

function finishPlayerTurn(
    move
) {

    currentTurn =
        "black";

    /* Iniciar el reloj una vez realizado el primer movimiento válido. */
    if (!gameOver && !clockStarted) {
        startGameClock();
    }


    selectedSquare =
        null;


    clearHighlights();


    renderBoard();


    refreshKingStatus();


    const status =
        getCurrentPositionStatus(
            "black"
        );


    if (
        status === "checkmate"
    ) {

        showChessStatus(
            "black",
            "checkmate"
        );


        endGame(
            "player",
            "checkmate"
        );


        return;

    }


    if (
        status === "stalemate"
    ) {

        checkGameEnd();

        return;

    }


    if (
        status === "check"
    ) {

        highlightKingInCheck(
            "black"
        );

        highlightCheckingPieces(
            "black"
        );

    }


    updateTurnMessage();


    /* =====================================================
       INICIAR TURNO DE LA IA
    ===================================================== */

    if (!gameOver) {

        aiMoveTimeout =
            setTimeout(
                makeAIMove,
                getAIDelay()
            );

    }

}


/* =========================================================
   FINALIZAR TURNO DE LA IA
========================================================= */

function finishAITurn(
    move
) {

    currentTurn =
        "white";


    selectedSquare =
        null;


    clearHighlights();


    renderBoard();


    refreshKingStatus();


    const status =
        getCurrentPositionStatus(
            "white"
        );


    if (
        status === "checkmate"
    ) {

        showChessStatus(
            "white",
            "checkmate"
        );


        endGame(
            "ai",
            "checkmate"
        );


        return;

    }


    if (
        status === "stalemate"
    ) {

        checkGameEnd();

        return;

    }


    if (
        status === "check"
    ) {

        highlightKingInCheck(
            "white"
        );

        highlightCheckingPieces(
            "white"
        );

    }


    updateTurnMessage();

}


/* =========================================================
   VERIFICAR FINAL DA PARTIDA APÓS MOVIMENTO
========================================================= */

function finalizePosition() {

    const whiteStatus =
        getCurrentPositionStatus(
            "white"
        );


    const blackStatus =
        getCurrentPositionStatus(
            "black"
        );


    if (
        whiteStatus === "checkmate"
    ) {

        endGame(
            "ai",
            "checkmate"
        );

        return false;

    }


    if (
        blackStatus === "checkmate"
    ) {

        endGame(
            "player",
            "checkmate"
        );

        return false;

    }


    if (
        whiteStatus === "stalemate" ||
        blackStatus === "stalemate"
    ) {

        checkGameEnd();

        return false;

    }


    return true;

}


/* =========================================================
   ACTUALIZAR INTERFAZ DESPUÉS DEL MOVIMIENTO
========================================================= */

function refreshGameInterface() {

    renderBoard();


    if (
        typeof drawAllMoveArrows ===
        "function"
    ) {

        drawAllMoveArrows();

    }


    if (
        typeof drawGridMoves ===
        "function"
    ) {

        drawGridMoves();

    }


    updateScores();


    updateClockDisplay();


    updateUndoButton();


    refreshKingStatus();

}
/* =========================================================
   EVENTOS FINALES Y CONTROL DE LA PARTIDA
========================================================= */


/* =========================================================
   SELECCIÓN DE PIEZAS
========================================================= */

function selectPiece(row, col) {

    if (gameOver) {

        return;

    }


    const piece =
        board[row][col];


    if (!piece) {

        return;

    }


    if (
        piece.color !== currentTurn
    ) {

        return;

    }


    selectedSquare = {

        row: row,

        col: col

    };


    clearHighlights();


    highlightSelectedSquare(
        row,
        col
    );


    showPossibleMoves(
        row,
        col
    );

}


/* =========================================================
   REALIZAR MOVIMIENTO DEL JUGADOR
========================================================= */

function performPlayerMove(
    from,
    to
) {

    if (gameOver) {

        return false;

    }


    if (
        currentTurn !== "white"
    ) {

        return false;

    }


    const legalMove =
        getAllLegalMoves(
            board,
            "white"
        ).find(
            move =>

                move.from.row === from.row &&

                move.from.col === from.col &&

                move.to.row === to.row &&

                move.to.col === to.col

        );


    if (!legalMove) {

        highlightErrorSquare(
            to.row,
            to.col
        );


        showMessage(
            "❌ Movimiento ilegal.",
            "error"
        );


        return false;

    }


    /* =====================================================
       GUARDAR PARA DESHACER
    ===================================================== */

    saveGameStateForUndo();


    /* =====================================================
       PIEZA ANTES DEL MOVIMIENTO
    ===================================================== */

    const movingPiece =
        board[
            legalMove.from.row
        ][
            legalMove.from.col
        ];


    if (!movingPiece) {

        return false;

    }


    /* =====================================================
       REALIZAR MOVIMIENTO
    ===================================================== */

    const capturedPiece = legalMove.enPassant
        ? board[legalMove.from.row][legalMove.to.col]
        : board[legalMove.to.row][legalMove.to.col];

    const movingPieceType = movingPiece.type;

    executeMoveOnBoard(
        legalMove
    );

    /* =====================================================
       REGLA DE LOS 50 MOVIMIENTOS
    ===================================================== */

    if (
        movingPieceType === "pawn" ||
        capturedPiece
    ) {

        halfmoveClock = 0;

    } else {

        halfmoveClock++;

    }
    /* =====================================================
       REGISTRAR MOVIMIENTO
    ===================================================== */

    registerCompletedMove(
        legalMove,
        "white"
    );


    /* =====================================================
       ACTUALIZAR DERECHOS DE ENROQUE
    ===================================================== */

    /* executeMoveOnBoard ya actualizó los derechos de enroque. */


    /* =====================================================
       ACTUALIZAR AL PASAR
    ===================================================== */

    if (
        movingPiece.type === "pawn" &&

        Math.abs(
            legalMove.to.row -
            legalMove.from.row
        ) === 2
    ) {

        enPassantTarget = {

            row:
                (
                    legalMove.from.row +
                    legalMove.to.row
                ) / 2,

            col:
                legalMove.from.col

        };

    }

    else {

        enPassantTarget =
            null;

    }


    /* =====================================================
       ACTUALIZAR TABLERO
    ===================================================== */

    renderBoard();


    refreshGameInterface();


    /* =====================================================
       COMPROBAR ESTADO DEL REY NEGRO
    ===================================================== */

    const blackStatus =
        getCurrentPositionStatus(
            "black"
        );


    if (
        blackStatus === "checkmate"
    ) {

        highlightKingInCheck(
            "black"
        );


        showChessStatus(
            "black",
            "checkmate"
        );


        endGame(
            "player",
            "checkmate"
        );


        return true;

    }


    if (
        blackStatus === "stalemate"
    ) {

        checkGameEnd();

        return true;

    }


    if (
        blackStatus === "check"
    ) {

        highlightKingInCheck(
            "black"
        );


        highlightCheckingPieces(
            "black"
        );


        showChessStatus(
            "black",
            "check"
        );

    }


    /* =====================================================
       CAMBIAR TURNO
    ===================================================== */

    currentTurn =
        "black";


    selectedSquare =
        null;


    clearHighlights();


    updateTurnMessage();


    /* =====================================================
       MOVIMIENTO DE LA IA
    ===================================================== */

    if (!gameOver) {

        aiMoveTimeout =
            setTimeout(
                makeAIMove,
                getAIDelay()
            );

    }


    return true;

}


/* =========================================================
   VALIDAR Y REALIZAR MOVIMIENTO
========================================================= */

function tryPlayerMove(
    from,
    to
) {

    if (!from || !to) {

        return false;

    }


    if (
        !isInsideBoard(
            to.row,
            to.col
        )
    ) {

        return false;

    }


    return performPlayerMove(
        from,
        to
    );

}


/* =========================================================
   CLICK SOBRE UNA CASILLA
========================================================= */

function handleBoardClick(
    event
) {

    if (gameOver) {

        return;

    }


    if (
        currentTurn !== "white"
    ) {

        return;

    }


    const square =
        event.target.closest(
            ".square"
        );


    if (!square) {

        return;

    }


    const row =
        parseInt(
            square.dataset.row,
            10
        );


    const col =
        parseInt(
            square.dataset.col,
            10
        );


    if (
        Number.isNaN(row) ||
        Number.isNaN(col)
    ) {

        return;

    }


    /* =====================================================
       NO HAY PIEZA SELECCIONADA
    ===================================================== */

    if (!selectedSquare) {

        const piece =
            board[row][col];


        if (
            piece &&
            piece.color === "white"
        ) {

            selectPiece(
                row,
                col
            );

        }


        return;

    }


    /* =====================================================
       CLICK EN LA MISMA CASILLA
    ===================================================== */

    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        selectedSquare =
            null;


        clearHighlights();


        updateTurnMessage();


        return;

    }


    /* =====================================================
       CLICK EN OTRA PIEZA BLANCA
    ===================================================== */

    const clickedPiece =
        board[row][col];


    if (
        clickedPiece &&
        clickedPiece.color === "white"
    ) {

        selectPiece(
            row,
            col
        );


        return;

    }


    /* =====================================================
       INTENTAR MOVIMIENTO
    ===================================================== */

    const from = {

        row:
            selectedSquare.row,

        col:
            selectedSquare.col

    };


    const to = {

        row: row,

        col: col

    };


    tryPlayerMove(
        from,
        to
    );

}


/* =========================================================
   CONECTAR CLICK DEL TABLERO
========================================================= */

function initializeChessBoardClick() {

    if (!chessBoard) {

        return;

    }


    if (
        chessBoard.dataset.clickReady ===
        "true"
    ) {

        return;

    }


    chessBoard.dataset.clickReady =
        "true";


    chessBoard.addEventListener(
        "click",
        handleBoardClick
    );

}


/* =========================================================
   DETECTAR TECLADO
========================================================= */

function initializeKeyboardControls() {

    document.addEventListener(
        "keydown",
        function(event) {

            /* ESC = cancelar selección */

            if (
                event.key === "Escape"
            ) {

                selectedSquare =
                    null;


                clearHighlights();


                updateTurnMessage();

            }


            /* U = deshacer */

            if (
                event.key.toLowerCase() ===
                "u"
            ) {

                undoLastMove();

            }


            /* R = reiniciar */

            if (
                event.key.toLowerCase() ===
                "r"
            ) {

                resetGame();

            }

        }
    );

}


/* =========================================================
   BOTÓN DE NUEVA PARTIDA
========================================================= */

function initializeNewGameButton() {

    const button =
        document.getElementById(
            "newGameButton"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.ready ===
        "true"
    ) {

        return;

    }


    button.dataset.ready =
        "true";


    button.addEventListener(
        "click",
        function() {

            resetGame();

        }
    );

}


/* =========================================================
   BOTÓN DE REINICIO
========================================================= */

function initializeRestartButton() {

    const button =
        document.getElementById(
            "restartGameButton"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.ready ===
        "true"
    ) {

        return;

    }


    button.dataset.ready =
        "true";


    button.addEventListener(
        "click",
        function() {

            resetGame();

        }
    );

}


/* =========================================================
   BOTÓN DE DESHACER
========================================================= */

function initializeUndoButton() {

    const button =
        document.getElementById(
            "undoMoveButton"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.ready ===
        "true"
    ) {

        return;

    }


    button.dataset.ready =
        "true";


    button.addEventListener(
        "click",
        function() {

            undoLastMove();

        }
    );


    updateUndoButton();

}


/* =========================================================
   BOTÓN DE PISTA
========================================================= */

function initializeHintButton() {

    const button =
        document.getElementById(
            "hintButton"
        );


    if (!button) {

        return;

    }


    if (
        button.dataset.ready ===
        "true"
    ) {

        return;

    }


    button.dataset.ready =
        "true";


    button.addEventListener(
        "click",
        function() {

            showHint();

        }
    );

}


/* =========================================================
   INICIALIZAR TODOS LOS CONTROLES
========================================================= */

function initializeAllControls() {

    initializeChessBoardClick();

    initializeKeyboardControls();

    initializeNewGameButton();

    initializeRestartButton();

    initializeUndoButton();

    initializeHintButton();

}


/* =========================================================
   ACTUALIZAR TABLERO Y ESTADO
========================================================= */

function refreshBoardState() {

    if (!board) {

        return;

    }


    renderBoard();


    clearHighlights();


    refreshKingStatus();


    if (
        typeof drawAllMoveArrows ===
        "function"
    ) {

        drawAllMoveArrows();

    }


    if (
        typeof drawGridMoves ===
        "function"
    ) {

        drawGridMoves();

    }


    updateScores();


    updateClockDisplay();


    updateUndoButton();


    updateTurnMessage();

}


/* =========================================================
   COMPROBACIÓN DE INICIO
========================================================= */

function validateInitialBoard() {

    if (!board) {

        console.error(
            "No se pudo crear el tablero."
        );


        return false;

    }


    const whiteKing =
        findKing(
            board,
            "white"
        );


    const blackKing =
        findKing(
            board,
            "black"
        );


    if (
        !whiteKing ||
        !blackKing
    ) {

        console.error(
            "No se encontraron ambos reyes."
        );


        return false;

    }


    return true;

}


/* =========================================================
   INICIO COMPLETO DEL JUEGO
========================================================= */

function startChessGame() {

    console.log(
        "♟️ Iniciando JAQUEMÁTICA..."
    );


    initializeGame();


    initializeAllControls();


    initializeUndoSystem();


    if (
        !validateInitialBoard()
    ) {

        return;

    }


    refreshBoardState();


    console.log(
        "♟️ JAQUEMÁTICA iniciada correctamente."
    );

}


/* =========================================================
   INICIAR CUANDO CARGA EL DOCUMENTO
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startChessGame
    );

}

else {

    startChessGame();

}


/* =========================================================
   SEGURIDAD ANTE CAMBIO DE TAMAÑO
========================================================= */

window.addEventListener(
    "resize",
    function() {

        setTimeout(
            function() {

                if (
                    typeof drawAllMoveArrows ===
                    "function"
                ) {

                    drawAllMoveArrows();

                }


                if (
                    typeof drawGridMoves ===
                    "function"
                ) {

                    drawGridMoves();

                }

            },
            50
        );

    }
);


/* =========================================================
   SEGURIDAD ANTE CIERRE DE PÁGINA
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        if (gameTimer) {

            clearInterval(
                gameTimer
            );

        }


        if (aiMoveTimeout) {

            clearTimeout(
                aiMoveTimeout
            );

        }

    }
);


/* =========================================================
   DEBUG OPCIONAL
========================================================= */

function getGameDebugInfo() {

    return {

        turn:
            currentTurn,

        gameOver:
            gameOver,

        difficulty:
            difficulty,

        playerTime:
            playerTime,

        aiTime:
            aiTime,

        totalMoves:
            totalMoves,

        playerScore:
            playerScore,

        aiScore:
            aiScore,

        inCheckWhite:
            isKingInCheck(
                board,
                "white"
            ),

        inCheckBlack:
            isKingInCheck(
                board,
                "black"
            ),

        whiteLegalMoves:
            getAllLegalMoves(
                board,
                "white"
            ).length,

        blackLegalMoves:
            getAllLegalMoves(
                board,
                "black"
            ).length

    };

}


/* =========================================================
   EXPONER DEBUG EN LA CONSOLA
========================================================= */

window.getChessDebug =
    getGameDebugInfo;
    /* =========================================================
   FUNCIONES DE SEGURIDAD Y COMPATIBILIDAD
========================================================= */


/* =========================================================
   EVITAR ERRORES SI ALGÚN ELEMENTO NO EXISTE
========================================================= */

function safeGetElement(id) {

    const element =
        document.getElementById(id);

    return element || null;

}


/* =========================================================
   ACTUALIZAR ESTADÍSTICAS EN PANTALLA
========================================================= */

function updateStatisticsDisplay() {

    const elements = {

        totalGames:
            safeGetElement("totalGames"),

        totalWins:
            safeGetElement("totalWins"),

        totalMoves:
            safeGetElement("totalMoves"),

        goodMoves:
            safeGetElement("goodMoves")

    };


    if (
        elements.totalGames
    ) {

        elements.totalGames.textContent =
            totalGames;

    }


    if (
        elements.totalWins
    ) {

        elements.totalWins.textContent =
            totalWins;

    }


    if (
        elements.totalMoves
    ) {

        elements.totalMoves.textContent =
            totalMoves;

    }


    if (
        elements.goodMoves
    ) {

        elements.goodMoves.textContent =
            goodMoves;

    }

}


/* =========================================================
   ACTUALIZAR TODA LA INFORMACIÓN
========================================================= */

function updateEverything() {

    updateScores();

    updateStatisticsDisplay();

    updateClockDisplay();

    updateUndoButton();

    updateTurnMessage();

}


/* =========================================================
   COMPROBAR TABLERO
========================================================= */

function validateBoard() {

    if (!Array.isArray(board)) {

        console.error(
            "El tablero no es válido."
        );

        return false;

    }


    if (
        board.length !== 8
    ) {

        console.error(
            "El tablero no tiene 8 filas."
        );

        return false;

    }


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        if (
            !Array.isArray(
                board[row]
            )
        ) {

            return false;

        }


        if (
            board[row].length !== 8
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================================
   COMPROBAR QUE LOS REYES EXISTAN
========================================================= */

function validateKings() {

    const whiteKing =
        findKing(
            board,
            "white"
        );


    const blackKing =
        findKing(
            board,
            "black"
        );


    return !!(
        whiteKing &&
        blackKing
    );

}


/* =========================================================
   COMPROBACIÓN GENERAL
========================================================= */

function runGameValidation() {

    if (
        !validateBoard()
    ) {

        return false;

    }


    if (
        !validateKings()
    ) {

        console.error(
            "Falta uno de los reyes."
        );

        return false;

    }


    return true;

}


/* =========================================================
   RECUPERAR PARTIDA SI HUBO ERROR
========================================================= */

function recoverGame() {

    try {

        if (
            !runGameValidation()
        ) {

            board =
                createInitialBoard();


            currentTurn =
                "white";


            gameOver =
                false;


            selectedSquare =
                null;


            castlingRights = {

                whiteKing: true,

                whiteRookKing: true,

                whiteRookQueen: true,

                blackKing: true,

                blackRookKing: true,

                blackRookQueen: true

            };


            enPassantTarget =
                null;


            renderBoard();


            updateGameMessage(
                "La partida fue restaurada."
            );

        }

    }

    catch (error) {

        console.error(
            "Error recuperando la partida:",
            error
        );

    }

}


/* =========================================================
   GUARDAR POSICIÓN ACTUAL
========================================================= */

function getCurrentGameState() {

    return {

        board:
            cloneBoard(
                board
            ),

        turn:
            currentTurn,

        gameOver:
            gameOver,

        playerScore:
            playerScore,

        aiScore:
            aiScore,

        playerTime:
            playerTime,

        aiTime:
            aiTime,

        moveNumber:
            moveNumber,

        totalMoves:
            totalMoves,

        goodMoves:
            goodMoves,

        castlingRights:
            JSON.parse(
                JSON.stringify(
                    castlingRights
                )
            ),

        enPassantTarget:
            enPassantTarget
                ? {

                    row:
                        enPassantTarget.row,

                    col:
                        enPassantTarget.col

                }
                : null

    };

}


/* =========================================================
   RESTAURAR POSICIÓN
========================================================= */

function restoreGameState(
    state
) {

    if (!state) {

        return false;

    }


    try {

        board =
            cloneBoard(
                state.board
            );


        currentTurn =
            state.turn;


        gameOver =
            state.gameOver;


        playerScore =
            state.playerScore;


        aiScore =
            state.aiScore;


        playerTime =
            state.playerTime;


        aiTime =
            state.aiTime;


        moveNumber =
            state.moveNumber;


        totalMoves =
            state.totalMoves;


        goodMoves =
            state.goodMoves;


        castlingRights =
            JSON.parse(
                JSON.stringify(
                    state.castlingRights
                )
            );


        enPassantTarget =
            state.enPassantTarget
                ? {

                    row:
                        state
                            .enPassantTarget
                            .row,

                    col:
                        state
                            .enPassantTarget
                            .col

                }
                : null;


        refreshBoardState();


        return true;

    }

    catch (error) {

        console.error(
            "No se pudo restaurar la posición:",
            error
        );


        return false;

    }

}


/* =========================================================
   DETENER COMPLETAMENTE LA PARTIDA
========================================================= */

function stopCompleteGame() {

    gameOver =
        true;


    stopGameClock();


    if (aiMoveTimeout) {

        clearTimeout(
            aiMoveTimeout
        );

        aiMoveTimeout =
            null;

    }


    selectedSquare =
        null;


    clearHighlights();


    updateTurnMessage();

}


/* =========================================================
   REANUDAR PARTIDA
========================================================= */

function resumeGame() {

    if (!board) {

        return;

    }


    if (
        gameOver
    ) {

        return;

    }


    if (
        !clockStarted
    ) {

        startGameClock();

    }


    updateTurnMessage();

}


/* =========================================================
   REINICIAR SOLAMENTE EL TABLERO
========================================================= */

function resetBoardOnly() {

    board =
        createInitialBoard();


    selectedSquare =
        null;


    currentTurn =
        "white";


    gameOver =
        false;


    moveNumber =
        1;


    castlingRights = {

        whiteKing: true,

        whiteRookKing: true,

        whiteRookQueen: true,

        blackKing: true,

        blackRookKing: true,

        blackRookQueen: true

    };


    enPassantTarget =
        null;


    lastThreeMoves = [];

    gridMoves = [];


    renderBoard();


    clearHighlights();


    updateTurnMessage();

}


/* =========================================================
   LIMPIAR PANTALLA
========================================================= */

function clearGameInterface() {

    if (moveHistory) {

        moveHistory.innerHTML =
            "";

    }


    if (analysisContent) {

        analysisContent.innerHTML =
            "";

    }


    clearHighlights();


    lastThreeMoves =
        [];


    gridMoves =
        [];


    if (
        typeof drawAllMoveArrows ===
        "function"
    ) {

        drawAllMoveArrows();

    }


    if (
        typeof drawGridMoves ===
        "function"
    ) {

        drawGridMoves();

    }

}


/* =========================================================
   MENSAJE DE ERROR GENERAL
========================================================= */

function showGameError(
    message
) {

    console.error(
        message
    );


    showMessage(
        "❌ " + message,
        "error"
    );

}


/* =========================================================
   COMPROBAR MOVIMIENTO ANTES DE EJECUTARLO
========================================================= */

function validateMoveBeforeExecution(
    move,
    color
) {

    if (!move) {

        return false;

    }


    if (
        !board
    ) {

        return false;

    }


    if (
        !isInsideBoard(
            move.from.row,
            move.from.col
        )
    ) {

        return false;

    }


    if (
        !isInsideBoard(
            move.to.row,
            move.to.col
        )
    ) {

        return false;

    }


    const piece =
        board[
            move.from.row
        ][
            move.from.col
        ];


    if (!piece) {

        return false;

    }


    if (
        piece.color !== color
    ) {

        return false;

    }


    return isLegalMove(
        board,
        move.from,
        move.to,
        color
    );

}


/* =========================================================
   LIMPIAR MOVIMIENTO SELECCIONADO
========================================================= */

function cancelSelectedMove() {

    selectedSquare =
        null;


    clearHighlights();


    updateTurnMessage();

}


/* =========================================================
   ACTUALIZAR EL ESTADO DEL JUEGO
========================================================= */

function updateGameState() {

    if (!board) {

        return;

    }


    const whiteStatus =
        getCurrentPositionStatus(
            "white"
        );


    const blackStatus =
        getCurrentPositionStatus(
            "black"
        );


    if (
        whiteStatus === "check"
    ) {

        highlightKingInCheck(
            "white"
        );

    }


    if (
        blackStatus === "check"
    ) {

        highlightKingInCheck(
            "black"
        );

    }


    if (
        whiteStatus === "checkmate"
    ) {

        endGame(
            "ai",
            "checkmate"
        );

        return;

    }


    if (
        blackStatus === "checkmate"
    ) {

        endGame(
            "player",
            "checkmate"
        );

        return;

    }


    if (
        whiteStatus === "stalemate" ||
        blackStatus === "stalemate"
    ) {

        checkGameEnd();

        return;

    }


    updateTurnMessage();

}


/* =========================================================
   MENSAJE DE BIENVENIDA
========================================================= */

function showWelcomeMessage() {

    updateGameMessage(
        "♟️ Tu turno. Elegí una pieza para comenzar."
    );


    showAnalysis(

        "♟️ Bienvenido a JAQUEMÁTICA",

        "Jugá una partida de ajedrez contra la IA. El juego reconoce jaque, jaque mate, enroque, captura al paso y promoción.",

        "info"

    );

}


/* =========================================================
   INICIO FINAL
========================================================= */

function bootChessGame() {

    try {

        if (!board) {

            board =
                createInitialBoard();

        }


        if (
            !validateBoard()
        ) {

            board =
                createInitialBoard();

        }


        if (
            !validateKings()
        ) {

            board =
                createInitialBoard();

        }


        initializeAllControls();


        initializeUndoSystem();


        renderBoard();


        updateEverything();


        if (
            typeof drawAllMoveArrows ===
            "function"
        ) {

            drawAllMoveArrows();

        }


        if (
            typeof drawGridMoves ===
            "function"
        ) {

            drawGridMoves();

        }


        showWelcomeMessage();


        console.log(
            "✅ Sistema de ajedrez cargado correctamente."
        );

        console.log(
            "♚ Jaque y jaque mate: ACTIVADOS"
        );

        console.log(
            "♜ Enroque: ACTIVADO"
        );

        console.log(
            "♟️ Captura al paso: ACTIVADA"
        );

        console.log(
            "♕ Promoción: ACTIVADA"
        );

        console.log(
            "↩️ Deshacer: ACTIVADO"
        );

    }

    catch (error) {

        console.error(
            "❌ Error iniciando el juego:",
            error
        );


        showGameError(
            "No se pudo iniciar correctamente la partida."
        );

    }

}


/* =========================================================
   ARRANQUE FINAL
========================================================= */

window.addEventListener(
    "load",
    function() {

        /*
           Si la partida ya fue iniciada por
           DOMContentLoaded, no la iniciamos
           nuevamente.
        */

        if (
            window.__JAQUEMATICA_STARTED__
        ) {

            return;

        }


        window.__JAQUEMATICA_STARTED__ =
            true;


        bootChessGame();

    }
);


/* =========================================================
   FUNCIONES DISPONIBLES DESDE LA CONSOLA
========================================================= */

window.JAQUEMATICA = {

    getBoard: function() {

        return board;

    },


    getState: function() {

        return getCurrentGameState();

    },


    reset: function() {

        resetGame();

    },


    undo: function() {

        undoLastMove();

    },


    hint: function() {

        showHint();

    },


    debug: function() {

        return getGameDebugInfo();

    }

};


/* =========================================================
   FIN DEL SCRIPT
   JAQUEMÁTICA
========================================================= */
/* =========================================================
   DIBUJAR MOVIMIENTOS EN LA CUADRÍCULA
========================================================= */

function drawGridMoves() {

    const canvas =
        document.getElementById("gridBoard");

    if (!canvas) return;


    const rect =
        canvas.getBoundingClientRect();

    const width =
        rect.width;

    const height =
        rect.height;


    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* =====================================================
       MÁRGENES
    ===================================================== */

    const margenIzq = 35;
    const margenArriba = 20;
    const margenDer = 15;
    const margenAbajo = 30;


    const ancho =
        width -
        margenIzq -
        margenDer;


    const alto =
        height -
        margenArriba -
        margenAbajo;


    const pasoX =
        ancho / 7;

    const pasoY =
        alto / 7;


    /* =====================================================
       LÍNEAS DE LOS MOVIMIENTOS
       SE DIBUJAN ANTES DE LOS PUNTOS
    ===================================================== */

    if (
        typeof gridMoves !== "undefined" &&
        gridMoves.length > 0
    ) {

        gridMoves.forEach(move => {

            const inicioX =
                margenIzq +
                move.fromCol * pasoX;

            const inicioY =
                margenArriba +
                move.fromRow * pasoY;


            const finalX =
                margenIzq +
                move.toCol * pasoX;

            const finalY =
                margenArriba +
                move.toRow * pasoY;


            ctx.beginPath();

            ctx.moveTo(
                inicioX,
                inicioY
            );

            ctx.lineTo(
                finalX,
                finalY
            );


            ctx.strokeStyle =
                "#ffd000";

            ctx.lineWidth = 4;

            ctx.lineCap =
                "round";

            ctx.lineJoin =
                "round";

            ctx.stroke();


            /* PUNTA DE LA LÍNEA */

            const angle =
                Math.atan2(
                    finalY - inicioY,
                    finalX - inicioX
                );

            const arrowSize = 8;


            ctx.beginPath();

            ctx.moveTo(
                finalX,
                finalY
            );

            ctx.lineTo(
                finalX -
                arrowSize *
                Math.cos(
                    angle - Math.PI / 6
                ),

                finalY -
                arrowSize *
                Math.sin(
                    angle - Math.PI / 6
                )
            );

            ctx.lineTo(
                finalX -
                arrowSize *
                Math.cos(
                    angle + Math.PI / 6
                ),

                finalY -
                arrowSize *
                Math.sin(
                    angle + Math.PI / 6
                )
            );

            ctx.closePath();

            ctx.fillStyle =
                "#ffd000";

            ctx.fill();

        });

    }


    /* =====================================================
       PUNTOS DE LA CUADRÍCULA
    ===================================================== */

    ctx.fillStyle =
        "#ffffff";


    for (
        let fila = 0;
        fila < 8;
        fila++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const x =
                margenIzq +
                col * pasoX;

            const y =
                margenArriba +
                fila * pasoY;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                2,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }


    /* =====================================================
       NÚMEROS
    ===================================================== */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    /* NÚMEROS VERTICALES */

    for (
        let fila = 0;
        fila < 8;
        fila++
    ) {

        ctx.fillText(
            8 - fila,
            15,
            margenArriba +
            fila * pasoY
        );

    }


    /* NÚMEROS HORIZONTALES */

    for (
        let col = 0;
        col < 8;
        col++
    ) {

        ctx.fillText(
            col + 1,
            margenIzq +
            col * pasoX,
            height - 10
        );

    }


    /* =====================================================
       EJES
    ===================================================== */

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 1;


    /* EJE VERTICAL */

    ctx.beginPath();

    ctx.moveTo(
        margenIzq - 12,
        margenArriba - 5
    );

    ctx.lineTo(
        margenIzq - 12,
        margenArriba +
        alto + 5
    );

    ctx.stroke();


    /* EJE HORIZONTAL */

    ctx.beginPath();

    ctx.moveTo(
        margenIzq - 5,
        margenArriba +
        alto + 12
    );

    ctx.lineTo(
        margenIzq +
        ancho + 5,
        margenArriba +
        alto + 12
    );

    ctx.stroke();

}
/* =========================================================
   CONTROL PARA AGRANDAR LA CUADRÍCULA
========================================================= */

let gridSize = 190;


function createGridSizeControl() {

    const canvas =
        document.getElementById("gridBoard");

    if (!canvas) return;


    const container =
        canvas.parentElement;

    if (!container) return;


    if (
        document.getElementById(
            "gridSizeControl"
        )
    ) {
        return;
    }


    const controls =
        document.createElement("div");

    controls.id =
        "gridSizeControl";

    controls.className =
        "grid-size-control";


    controls.innerHTML = `

        <div class="grid-size-label">
            Tamaño de cuadrícula
        </div>

        <div class="grid-size-row">

            <button
                type="button"
                id="gridSizeMinus"
                class="grid-size-button"
            >
                −
            </button>

            <input
                type="range"
                id="gridSizeSlider"
                min="160"
                max="280"
                value="190"
                step="10"
            >

            <button
                type="button"
                id="gridSizePlus"
                class="grid-size-button"
            >
                +
            </button>

        </div>

        <div
            id="gridSizeValue"
            class="grid-size-value"
        >
            190 px
        </div>

    `;


    container.appendChild(
        controls
    );


    const slider =
        document.getElementById(
            "gridSizeSlider"
        );

    const minus =
        document.getElementById(
            "gridSizeMinus"
        );

    const plus =
        document.getElementById(
            "gridSizePlus"
        );

    const value =
        document.getElementById(
            "gridSizeValue"
        );


    function updateGridSize() {

        gridSize =
            parseInt(
                slider.value
            );


        const height =
            Math.round(
                gridSize * 0.79
            );


        canvas.style.width =
            gridSize + "px";

        canvas.style.height =
            height + "px";


        value.textContent =
            gridSize + " px";


        drawGridMoves();

    }


    slider.addEventListener(
        "input",
        updateGridSize
    );


    minus.addEventListener(
        "click",
        () => {

            let size =
                parseInt(
                    slider.value
                );

            size -= 10;

            if (size < 160) {
                size = 160;
            }

            slider.value =
                size;

            updateGridSize();

        }
    );


    plus.addEventListener(
        "click",
        () => {

            let size =
                parseInt(
                    slider.value
                );

            size += 10;

            if (size > 280) {
                size = 280;
            }

            slider.value =
                size;

            updateGridSize();

        }
    );


    updateGridSize();

}


/* Crear el control */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        createGridSizeControl
    );

} else {

    createGridSizeControl();

}

/* =========================================================
   PARCHE FINAL DE INTEGRACIÓN HTML + JS
   - Navegación
   - Dificultad
   - Deshacer
   - IA vs IA
   - Estadísticas
   - Evita listeners duplicados
========================================================= */

let bestScore = 0;
let statisticsHistory = [];
let aiCastlingRights = null;
let aiEnPassantTarget = null;

function loadPersistentStatistics() {
    try {
        const saved = JSON.parse(localStorage.getItem("jaquematica_statistics") || "null");
        if (!saved) return;
        totalGames = Number(saved.totalGames) || 0;
        totalWins = Number(saved.totalWins) || 0;
        bestScore = Number(saved.bestScore) || 0;
        statisticsHistory = Array.isArray(saved.history) ? saved.history : [];
    } catch (error) {
        console.warn("No se pudieron cargar las estadísticas guardadas.", error);
    }
}

function savePersistentStatistics() {
    try {
        localStorage.setItem("jaquematica_statistics", JSON.stringify({
            totalGames,
            totalWins,
            bestScore,
            history: statisticsHistory.slice(-50)
        }));
    } catch (error) {
        console.warn("No se pudieron guardar las estadísticas.", error);
    }
}

function updateStatisticsDisplay() {
    const games = document.getElementById("totalGames");
    const wins = document.getElementById("totalWins");
    const percentage = document.getElementById("winPercentage");
    const best = document.getElementById("bestScore");
    const history = document.getElementById("statisticsHistory");

    if (games) games.textContent = totalGames;
    if (wins) wins.textContent = totalWins;
    if (percentage) {
        percentage.textContent = totalGames > 0
            ? Math.round((totalWins / totalGames) * 100) + "%"
            : "0%";
    }
    if (best) best.textContent = bestScore;

    if (history) {
        if (!statisticsHistory.length) {
            history.innerHTML = `
                <div class="history-empty">
                    <span>📊</span>
                    <p>Todavía no hay partidas registradas.</p>
                </div>`;
        } else {
            history.innerHTML = statisticsHistory.slice().reverse().map(item => `
                <div class="statistics-history-item">
                    <strong>${item.result}</strong>
                    <span>${item.score} puntos · ${item.date}</span>
                </div>
            `).join("");
        }
    }
}

function recordStatisticsResult(result) {
    const score = Math.max(playerScore, 0);
    bestScore = Math.max(bestScore, score);
    statisticsHistory.push({
        result,
        score,
        date: new Date().toLocaleString("es-AR")
    });
    savePersistentStatistics();
    updateStatisticsDisplay();
}

function setDifficulty(newDifficulty) {
    const allowed = ["easy", "medium", "hard", "expert"];
    if (!allowed.includes(newDifficulty)) return;
    difficulty = newDifficulty;
    updateDifficultyLabel();
    document.querySelectorAll(".difficulty-button").forEach(button => {
        button.classList.toggle("active", button.dataset.difficulty === difficulty);
        button.setAttribute("aria-pressed", button.dataset.difficulty === difficulty ? "true" : "false");
    });
    const select = document.getElementById("difficultySelect");
    if (select) select.value = difficulty;
    showMessage("Dificultad de la IA: " + newDifficulty, "info");
}

function initializeDifficulty() {
    const select = document.getElementById("difficultySelect");
    if (select && !select.dataset.ready) {
        select.dataset.ready = "true";
        select.addEventListener("change", () => setDifficulty(select.value));
    }

    document.querySelectorAll(".difficulty-button").forEach(button => {
        if (button.dataset.ready === "true") return;
        button.dataset.ready = "true";
        button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
    });

    const active = document.querySelector(".difficulty-button.active")?.dataset.difficulty;
    if (active && ["easy", "medium", "hard", "expert"].includes(active)) {
        difficulty = active;
    } else if (select?.value) {
        difficulty = select.value;
    }
    updateDifficultyLabel();
}

function initializeButtons() {
    /* La versión anterior registraba dos listeners distintos para deshacer.\n       La integración final se realiza en initializeAllControls(). */
}

function initializeBoardEvents() {
    /* renderBoard() ya asigna un click a cada casilla.\n       No agregar otro listener al contenedor. */
}

function initializeChessBoardClick() {
    /* renderBoard() ya asigna un click a cada casilla. */
}

function handleSquareClick(row, col) {
    if (gameOver || currentTurn !== "white") return;
    if (!isInsideBoard(row, col)) return;

    const piece = board[row][col];

    if (!selectedSquare) {
        if (!piece || piece.color !== "white") {
            showMessage("Seleccioná una pieza blanca.", "error");
            return;
        }
        selectedSquare = { row, col };
        clearHighlights();
        highlightSelectedSquare(row, col);
        showPossibleMoves(row, col);
        return;
    }

    if (piece && piece.color === "white") {
        selectedSquare = { row, col };
        clearHighlights();
        highlightSelectedSquare(row, col);
        showPossibleMoves(row, col);
        return;
    }

    const from = { ...selectedSquare };
    const to = { row, col };
    selectedSquare = null;
    clearHighlights();
    performPlayerMove(from, to);
}

function initializeUndoSystem() {
    const button = document.getElementById("undoButton");
    if (!button) return;
    button.disabled = undoHistory.length === 0;
    updateUndoButton();
}

function updateUndoButton() {
    const button = document.getElementById("undoButton");
    if (!button) return;
    button.disabled = !undoHistory.length;
    button.classList.toggle("disabled", !undoHistory.length);
}

function saveGameStateForUndo() {
    if (!board || !Array.isArray(board)) return;
    undoHistory.push({
        board: cloneBoard(board),
        currentTurn,
        gameOver,
        playerScore,
        aiScore,
        totalGames,
        totalWins,
        totalMoves,
        goodMoves,
        moveNumber,
        halfmoveClock,
        positionHistory: Array.isArray(positionHistory) ? [...positionHistory] : [],
        castlingRights: JSON.parse(JSON.stringify(castlingRights)),
        enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
        lastThreeMoves: [...lastThreeMoves],
        gridMoves: [...gridMoves],
        playerTime,
        aiTime,
        historyHTML: moveHistory ? moveHistory.innerHTML : ""
    });
    if (undoHistory.length > 50) undoHistory.shift();
    updateUndoButton();
}

function saveUndoState() {
    saveGameStateForUndo();
}

function undoLastMove() {
    if (!undoHistory.length) {
        showMessage("No hay movimientos para deshacer.", "warning");
        return false;
    }

    if (aiMoveTimeout) {
        clearTimeout(aiMoveTimeout);
        aiMoveTimeout = null;
    }

    const state = undoHistory.pop();
    board = cloneBoard(state.board);
    currentTurn = state.currentTurn;
    gameOver = state.gameOver;
    playerScore = state.playerScore;
    aiScore = state.aiScore;
    totalGames = state.totalGames;
    totalWins = state.totalWins;
    totalMoves = state.totalMoves;
    goodMoves = state.goodMoves;
    moveNumber = state.moveNumber;
    halfmoveClock = state.halfmoveClock ?? 0;
    positionHistory = Array.isArray(state.positionHistory) ? [...state.positionHistory] : [];
    castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
    enPassantTarget = state.enPassantTarget ? { ...state.enPassantTarget } : null;
    lastThreeMoves = [...(state.lastThreeMoves || [])];
    gridMoves = [...(state.gridMoves || [])];
    playerTime = state.playerTime;
    aiTime = state.aiTime;
    selectedSquare = null;
    clearHighlights();

    if (moveHistory) moveHistory.innerHTML = state.historyHTML || "";
    renderBoard();
    updateScores();
    updateClockDisplay();
    updateStatisticsDisplay();
    updateUndoButton();
    updateTurnMessage();
    if (typeof drawAllMoveArrows === "function") drawAllMoveArrows();
    if (typeof drawGridMoves === "function") drawGridMoves();
    showMessage("↩️ Movimiento deshecho.", "info");
    return true;
}

function initializeNavigation() {
    document.querySelectorAll(".nav-button[data-section]").forEach(button => {
        if (button.dataset.ready === "true") return;
        button.dataset.ready = "true";
        button.addEventListener("click", () => {
            const sectionId = button.dataset.section;
            document.querySelectorAll(".page-section").forEach(section => {
                section.classList.toggle("active-section", section.id === sectionId);
            });
            document.querySelectorAll(".nav-button").forEach(nav => {
                nav.classList.toggle("active", nav === button);
            });
            if (sectionId === "statistics-section") updateStatisticsDisplay();
            if (sectionId === "ai-section") renderAIBoard();
        });
    });
}

function initializeAIControls() {
    const button = document.getElementById("startAIGameButton");
    const speed = document.getElementById("aiSpeedSelect");
    const level = document.getElementById("aiLevelSelect");

    if (speed && speed.dataset.ready !== "true") {
        speed.dataset.ready = "true";
        speed.addEventListener("change", () => {
            aiSpeed = Math.max(100, Number(speed.value) || 1000);
            if (aiPlaying && !aiPaused) scheduleAIMove();
        });
    }

    if (level && level.dataset.ready !== "true") {
        level.dataset.ready = "true";
        level.addEventListener("change", () => {
            /* El nivel se lee en cada movimiento. */
        });
    }

    if (button && button.dataset.ready !== "true") {
        button.dataset.ready = "true";
        button.addEventListener("click", () => {
            if (!aiPlaying) startAIVsAI();
            else if (aiPaused) resumeAIVsAI();
            else pauseAIVsAI();
        });
    }
}

function resetAIBoard() {
    aiBoard = createInitialBoard();
    aiTurn = "white";
    aiMoveCount = 0;
    aiCastlingRights = {
        whiteKing: true, whiteRookKing: true, whiteRookQueen: true,
        blackKing: true, blackRookKing: true, blackRookQueen: true
    };
    aiEnPassantTarget = null;
    const history = document.getElementById("aiMoveHistory");
    if (history) history.innerHTML = `<div class="history-empty"><span>🤖</span><p>La partida todavía no comenzó.</p></div>`;
    setAIMessage("Presioná iniciar para comenzar.");
    renderAIBoard();
}

function setAIMessage(text) {
    const el = document.getElementById("aiGameMessageText");
    if (el) el.textContent = text;
}

function renderAIBoard() {
    const element = document.getElementById("aiChessBoard");
    if (!element || !Array.isArray(aiBoard) || aiBoard.length !== 8) return;
    element.innerHTML = "";
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");
            square.className = "chess-square " + ((row + col) % 2 === 0 ? "light-square" : "dark-square");
            square.dataset.row = row;
            square.dataset.col = col;
            const piece = aiBoard[row][col];
            if (piece) {
                const span = document.createElement("span");
                span.className = "chess-piece " + piece.color;
                span.textContent = PIECES[piece.color][piece.type];
                square.appendChild(span);
            }
            element.appendChild(square);
        }
    }
}

function chooseAIMoveForBoard(position, color, level) {
    const oldBoard = board;
    const oldDifficulty = difficulty;
    const oldRights = castlingRights;
    const oldEnPassant = enPassantTarget;
    board = position;
    difficulty = level;
    castlingRights = aiCastlingRights || castlingRights;
    enPassantTarget = aiEnPassantTarget;
    const moves = getAllLegalMoves(position, color);
    const selected = chooseAIMove(moves);
    board = oldBoard;
    difficulty = oldDifficulty;
    castlingRights = oldRights;
    enPassantTarget = oldEnPassant;
    return selected;
}

function executeAIMoveOnBoard(move) {
    const oldBoard = board;
    const oldRights = castlingRights;
    const oldEnPassant = enPassantTarget;
    board = aiBoard;
    castlingRights = aiCastlingRights;
    enPassantTarget = aiEnPassantTarget;
    const result = executeMoveOnBoard(move);
    aiBoard = board;
    aiCastlingRights = castlingRights;
    aiEnPassantTarget = enPassantTarget;
    board = oldBoard;
    castlingRights = oldRights;
    enPassantTarget = oldEnPassant;
    return result;
}

function getAIVsAILevel() {
    const value = Number(document.getElementById("aiLevelSelect")?.value || 2);
    return ["easy", "medium", "hard", "expert"][Math.max(1, Math.min(4, value)) - 1];
}

function addAIMoveToHistory(text, color) {
    const history = document.getElementById("aiMoveHistory");
    if (!history) return;
    if (history.querySelector(".history-empty")) history.innerHTML = "";
    const item = document.createElement("div");
    item.className = "history-move";
    item.innerHTML = `<span>${color === "white" ? "IA Blanca" : "IA Negra"}</span><strong>${text}</strong>`;
    history.appendChild(item);
    history.scrollTop = history.scrollHeight;
}

function scheduleAIMove() {
    if (!aiPlaying || aiPaused) return;
    if (aiMoveTimer) clearTimeout(aiMoveTimer);
    aiMoveTimer = setTimeout(makeAIVsAIMove, aiSpeed);
}

function makeAIVsAIMove() {
    aiMoveTimer = null;
    if (!aiPlaying || aiPaused) return;

    const color = aiTurn;
    const level = getAIVsAILevel();
    const moves = (() => {
        const oldBoard = board;
        const oldRights = castlingRights;
        const oldEnPassant = enPassantTarget;
        board = aiBoard;
        castlingRights = aiCastlingRights;
        enPassantTarget = aiEnPassantTarget;
        const result = getAllLegalMoves(aiBoard, color);
        board = oldBoard;
        castlingRights = oldRights;
        enPassantTarget = oldEnPassant;
        return result;
    })();

    if (!moves.length) {
        aiPlaying = false;
        aiPaused = false;
        setAIMessage(isKingInCheck(aiBoard, color) ? `${color === "white" ? "IA Blanca" : "IA Negra"} recibió jaque mate.` : "Tablas por rey ahogado.");
        updateAIGameButton();
        return;
    }

    const move = chooseAIMoveForBoard(aiBoard, color, level);
    if (!move) return;

    const movingPiece = aiBoard[move.from.row][move.from.col];
    const text = createMoveNotation(move.from, move.to, movingPiece);
    executeAIMoveOnBoard(move);
    aiMoveCount++;
    addAIMoveToHistory(text, color);
    renderAIBoard();

    const opponent = getOpponentColor(color);
    const status = (() => {
        const oldBoard = board;
        const oldRights = castlingRights;
        const oldEnPassant = enPassantTarget;
        board = aiBoard;
        castlingRights = aiCastlingRights;
        enPassantTarget = aiEnPassantTarget;
        const result = getCurrentPositionStatus(opponent);
        board = oldBoard;
        castlingRights = oldRights;
        enPassantTarget = oldEnPassant;
        return result;
    })();

    if (status === "checkmate" || status === "stalemate") {
        aiPlaying = false;
        aiPaused = false;
        setAIMessage(status === "checkmate" ? `${opponent === "white" ? "IA Negra" : "IA Blanca"} ganó por jaque mate.` : "Tablas por rey ahogado.");
        updateAIGameButton();
        return;
    }

    aiTurn = opponent;
    setAIMessage(`${aiTurn === "white" ? "IA Blanca" : "IA Negra"} está pensando...`);
    scheduleAIMove();
}

function updateAIGameButton() {
    const button = document.getElementById("startAIGameButton");
    if (!button) return;
    if (!aiPlaying) button.textContent = "▶ Iniciar partida";
    else if (aiPaused) button.textContent = "▶ Reanudar";
    else button.textContent = "⏸ Pausar";
}

function startAIVsAI() {
    if (aiMoveTimer) clearTimeout(aiMoveTimer);
    resetAIBoard();
    aiPlaying = true;
    aiPaused = false;
    setAIMessage("IA Blanca está pensando...");
    updateAIGameButton();
    scheduleAIMove();
}

function pauseAIVsAI() {
    aiPaused = true;
    if (aiMoveTimer) {
        clearTimeout(aiMoveTimer);
        aiMoveTimer = null;
    }
    setAIMessage("Partida pausada.");
    updateAIGameButton();
}

function resumeAIVsAI() {
    if (!aiPlaying) return startAIVsAI();
    aiPaused = false;
    setAIMessage(`${aiTurn === "white" ? "IA Blanca" : "IA Negra"} está pensando...`);
    updateAIGameButton();
    scheduleAIMove();
}

function initializeAllControls() {
    initializeDifficulty();
    initializeNewGameButton();
    initializeHintButton();
    initializeNavigation();
    initializeAIControls();
    initializeUndoButton();
    initializeUndoSystem();
    initializeGameTimeSelector();
}

function initializeUndoButton() {
    const button = document.getElementById("undoButton");
    if (!button || button.dataset.finalReady === "true") return;
    button.dataset.finalReady = "true";
    button.addEventListener("click", () => undoLastMove());
    updateUndoButton();
}

function startChessGame() {
    if (window.__JAQUEMATICA_STARTED__) return;
    window.__JAQUEMATICA_STARTED__ = true;
    loadPersistentStatistics();
    initializeGame();
    if (!Array.isArray(board) || board.length !== 8 || !validateKings()) {
        board = createInitialBoard();
    }
    renderBoard();
    updateEverything();
    updateStatisticsDisplay();
    resetAIBoard();
    initializeAllControls();
    showWelcomeMessage();
}

function bootChessGame() {
    startChessGame();
}

/* Evitar que el sistema anterior use el botón inexistente #undoMoveButton. */
function initializeRestartButton() {}

/* Actualizar contador de movimientos una sola vez. */
function updateMoveCounter() {
    totalMoves++;
    const counter = document.getElementById("moveCounter");
    if (counter) counter.textContent = totalMoves;
    updateStatisticsDisplay();
}

function registerGoodMove() {
    goodMoves++;
    const good = document.getElementById("goodMoves");
    if (good) good.textContent = goodMoves;
}

/* Corrección del selector de tiempo: evita listeners duplicados. */
function initializeGameTimeSelector() {
    const select = document.getElementById("gameTimeSelect");
    if (!select) return;
    if (select.dataset.finalReady !== "true") {
        select.dataset.finalReady = "true";
        select.addEventListener("change", changeGameTime);
    }
    setupGameClock();
}

/* Reemplazar el final de partida para que las estadísticas visibles se actualicen. */
const __originalEndGame = endGame;
endGame = function(winner, reason = "normal") {
    const wasOver = gameOver;
    __originalEndGame(winner, reason);
    if (!wasOver && gameOver) {
        if (winner === "player") {
            recordStatisticsResult("Victoria");
        } else {
            recordStatisticsResult(reason === "stalemate" ? "Tablas" : "Derrota");
        }
    }
    updateStatisticsDisplay();
};

/* Mantener estadísticas al reiniciar una partida. */
const __originalResetGame = resetGame;
resetGame = function() {
    __originalResetGame();
    resetUndoSystem();
    updateStatisticsDisplay();
    updateUndoButton();
};

/* Guardar estadísticas cada vez que cambia la puntuación. */
const __originalUpdateScores = updateScores;
updateScores = function() {
    __originalUpdateScores();
    bestScore = Math.max(bestScore, playerScore);
    updateStatisticsDisplay();
};

/* Exponer IA vs IA para depuración y botones externos. */
window.JAQUEMATICA = window.JAQUEMATICA || {};
window.JAQUEMATICA.startAIVsAI = startAIVsAI;
window.JAQUEMATICA.pauseAIVsAI = pauseAIVsAI;
window.JAQUEMATICA.resumeAIVsAI = resumeAIVsAI;
window.JAQUEMATICA.setDifficulty = setDifficulty;
window.JAQUEMATICA.updateStatistics = updateStatisticsDisplay;
