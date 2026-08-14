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
   FLECHAS - ÚLTIMAS 3 JUGADAS
========================================================= */

let lastThreeMoves = [];


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

            const square = document.createElement("div");

            square.classList.add("chess-square");

            const isLight = (row + col) % 2 === 0;

            square.classList.add(
                isLight ? "light-square" : "dark-square"
            );

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {

                const pieceElement =
                    document.createElement("span");

                pieceElement.classList.add(
                    "chess-piece",
                    piece.color
                );

                pieceElement.textContent =
                    PIECES[piece.color][piece.type];

                square.appendChild(pieceElement);

            }

            square.addEventListener(
                "click",
                () => handleSquareClick(row, col)
            );

            chessBoard.appendChild(square);

        }

    }

    /*
       Volvemos a dibujar las flechas después
       de reconstruir el tablero.
    */

    requestAnimationFrame(() => {
        drawAllMoveArrows();
    });

}


/* =========================================================
   AGREGAR FLECHA
========================================================= */

function addMoveArrow(from, to) {

    if (!from || !to) return;

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

    drawAllMoveArrows();

}


/* =========================================================
   DIBUJAR TODAS LAS FLECHAS
========================================================= */

function drawAllMoveArrows() {

    const canvas =
        document.getElementById("moveCanvas");

    const boardElement =
        document.getElementById("chessBoard");

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
            move.fromCol * squareWidth +
            squareWidth / 2;

        const startY =
            move.fromRow * squareHeight +
            squareHeight / 2;

        const endX =
            move.toCol * squareWidth +
            squareWidth / 2;

        const endY =
            move.toRow * squareHeight +
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


        /*
           LÍNEA
        */

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


        /*
           PUNTA DE LA FLECHA
        */

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
   ACTUALIZAR TAMAÑO DE LAS FLECHAS
========================================================= */

window.addEventListener(
    "resize",
    () => {

        setTimeout(
            drawAllMoveArrows,
            100
        );

    }
);


/* =========================================================
   CLICK EN TABLERO
========================================================= */

function handleSquareClick(row, col) {

    if (gameOver) return;

    if (currentTurn !== "white") return;

    const piece =
        board[row][col];


    /*
       SI NO HAY PIEZA SELECCIONADA
    */

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

        highlightSelectedSquare();

        showPossibleMoves(
            row,
            col
        );

        return;

    }


    /*
       CLICK SOBRE OTRA PIEZA PROPIA
    */

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


    /*
       INTENTAR MOVER
    */

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

        showError(
            "Ese movimiento no es válido para esa pieza."
        );

        highlightErrorSquare(
            row,
            col
        );

        return;

    }


    /*
       MOVIMIENTO CORRECTO
    */

    makePlayerMove(
        from,
        to
    );

}


/* =========================================================
   HACER MOVIMIENTO DEL JUGADOR
========================================================= */

function makePlayerMove(from, to) {

    const movingPiece =
        board[from.row][from.col];

    const capturedPiece =
        board[to.row][to.col];


    const moveText =
        createMoveNotation(
            from,
            to,
            movingPiece
        );


    board[to.row][to.col] =
        movingPiece;

    board[from.row][from.col] =
        null;


    /*
       AGREGAR FLECHA
    */

    addMoveArrow(
        from,
        to
    );


    selectedSquare =
        null;


    totalMoves++;

    goodMoves++;


    if (capturedPiece) {

        playerScore +=
            PIECE_VALUES[
                capturedPiece.type
            ] * 10;

    } else {

        playerScore += 5;

    }


    updateScores();


    addMoveToHistory(
        moveText,
        "player"
    );


    showAnalysis(
        "¡Buena jugada!",
        `Moviste ${getPieceName(movingPiece.type)} correctamente.`,
        "success"
    );


    clearHighlights();


    renderBoard();


    currentTurn =
        "black";


    updateGameMessage(
        "La IA está pensando..."
    );


    setTimeout(
        makeAIMove,
        getAIDelay()
    );

}


/* =========================================================
   MOVIMIENTO IA
========================================================= */

function makeAIMove() {

    if (gameOver) return;


    const possibleMoves =
        getAllLegalMoves(
            board,
            "black"
        );


    if (
        possibleMoves.length === 0
    ) {

        endGame("player");

        return;

    }


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


    const capturedPiece =
        board[
            selectedMove.to.row
        ][
            selectedMove.to.col
        ];


    const moveText =
        createMoveNotation(
            selectedMove.from,
            selectedMove.to,
            movingPiece
        );


    board[
        selectedMove.to.row
    ][
        selectedMove.to.col
    ] =
        movingPiece;


    board[
        selectedMove.from.row
    ][
        selectedMove.from.col
    ] =
        null;


    /*
       AGREGAR FLECHA DE LA IA
    */

    addMoveArrow(
        selectedMove.from,
        selectedMove.to
    );


    if (capturedPiece) {

        aiScore +=
            PIECE_VALUES[
                capturedPiece.type
            ] * 10;

    }


    updateScores();


    addMoveToHistory(
        moveText,
        "ai"
    );


    clearHighlights();


    renderBoard();


    /*
       RESALTAR CASILLAS DEL MOVIMIENTO IA
    */

    highlightAISquare(
        selectedMove.from.row,
        selectedMove.from.col
    );

    highlightAISquare(
        selectedMove.to.row,
        selectedMove.to.col
    );


    showAnalysis(
        "Movimiento de la IA",
        `La IA movió ${getPieceName(movingPiece.type)}.`,
        "ai"
    );


    currentTurn =
        "white";


    updateGameMessage(
        "Tu turno. Elegí una pieza."
    );


    if (
        checkGameEnd()
    ) {

        return;

    }

}


/* =========================================================
   ELEGIR MOVIMIENTO IA
========================================================= */

function chooseAIMove(moves) {

    if (
        moves.length === 0
    ) {

        return null;

    }


    /*
       FÁCIL
    */

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


    /*
       MEDIO
    */

    if (
        difficulty === "medium"
    ) {

        const captures =
            moves.filter(
                move =>
                    board[
                        move.to.row
                    ][
                        move.to.col
                    ]
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


    /*
       DIFÍCIL
    */

    if (
        difficulty === "hard"
    ) {

        const scoredMoves =
            moves.map(
                move => {

                    let score =
                        Math.random() * 3;


                    const target =
                        board[
                            move.to.row
                        ][
                            move.to.col
                        ];


                    if (target) {

                        score +=
                            PIECE_VALUES[
                                target.type
                            ] * 10;

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


    /*
       EXPERTO
    */

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

        const copy =
            cloneBoard(
                position
            );


        const captured =
            copy[
                move.to.row
            ][
                move.to.col
            ];


        copy[
            move.to.row
        ][
            move.to.col
        ] =
            copy[
                move.from.row
            ][
                move.from.col
            ];


        copy[
            move.from.row
        ][
            move.from.col
        ] =
            null;


        let score =
            Math.random() * 2;


        if (captured) {

            score +=
                PIECE_VALUES[
                    captured.type
                ] * 20;

        }


        score +=
            evaluatePosition(
                copy,
                color
            );


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

            } else {

                score -= value;

            }

        }

    }


    return score;

}


/* =========================================================
   MOVIMIENTOS LEGALES
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


    if (!piece) return false;


    if (
        from.row === to.row &&
        from.col === to.col
    ) {

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


    const rowDiff =
        to.row - from.row;

    const colDiff =
        to.col - from.col;


    switch (
        piece.type
    ) {

        case "pawn":

            return isPawnMove(
                position,
                from,
                to,
                piece
            );


        case "knight":

            return (
                Math.abs(rowDiff) === 2 &&
                Math.abs(colDiff) === 1
            ) ||
            (
                Math.abs(rowDiff) === 1 &&
                Math.abs(colDiff) === 2
            );


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


        case "king":

            return (
                Math.abs(rowDiff) <= 1 &&
                Math.abs(colDiff) <= 1
            );

    }


    return false;

}


/* =========================================================
   PEÓN
========================================================= */

function isPawnMove(
    position,
    from,
    to,
    piece
) {

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
        position[
            to.row
        ][
            to.col
        ];


    /*
       AVANCE
    */

    if (
        colDiff === 0 &&
        rowDiff === direction &&
        !target
    ) {

        return true;

    }


    /*
       DOBLE AVANCE
    */

    if (
        colDiff === 0 &&
        from.row === startRow &&
        rowDiff === direction * 2 &&
        !target &&
        !position[
            from.row + direction
        ][
            from.col
        ]
    ) {

        return true;

    }


    /*
       CAPTURA
    */

    if (
        Math.abs(colDiff) === 1 &&
        rowDiff === direction &&
        target &&
        target.color !== piece.color
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   CAMINO LIBRE
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
   OBTENER TODOS LOS MOVIMIENTOS
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

                    if (
                        isLegalMove(
                            position,
                            {
                                row,
                                col
                            },
                            {
                                row: targetRow,
                                col: targetCol
                            }
                        )
                    ) {

                        moves.push({

                            from: {
                                row,
                                col
                            },

                            to: {
                                row: targetRow,
                                col: targetCol
                            }

                        });

                    }

                }

            }

        }

    }


    return moves;

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
        1200
    );

}


/* =========================================================
   RESALTAR MOVIMIENTO IA
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
        2500
    );

}


/* =========================================================
   LIMPIAR RESALTADOS
========================================================= */

function clearHighlights() {

    if (!chessBoard) return;


    chessBoard
        .querySelectorAll(
            ".selected-square, .possible-move, .capture-move"
        )
        .forEach(
            square => {

                square.classList.remove(
                    "selected-square",
                    "possible-move",
                    "capture-move"
                );

            }
        );

}


/* =========================================================
   OBTENER CASILLA
========================================================= */

function getSquare(
    row,
    col
) {

    if (!chessBoard) return null;


    return chessBoard.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

}


/* =========================================================
   MENSAJE
========================================================= */

function updateGameMessage(
    message
) {

    if (!gameMessageText) return;


    gameMessageText.textContent =
        message;

}


function showMessage(
    message,
    type = ""
) {

    updateGameMessage(
        message
    );


    if (!gameMessage) return;


    gameMessage.classList.remove(
        "success",
        "error"
    );


    if (type) {

        gameMessage.classList.add(
            type
        );

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    showMessage(
        message,
        "error"
    );


    const modal =
        document.getElementById(
            "errorModal"
        );


    const modalText =
        document.getElementById(
            "errorModalText"
        );


    if (modalText) {

        modalText.textContent =
            message;

    }


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   ANÁLISIS
========================================================= */

function showAnalysis(
    title,
    description,
    type
) {

    if (!analysisContent) return;


    let icon = "♟";


    if (
        type === "success"
    ) {

        icon = "✓";

    }


    if (
        type === "ai"
    ) {

        icon = "🤖";

    }


    analysisContent.innerHTML = `

        <div class="analysis-result ${type}">

            <div class="analysis-result-icon">
                ${icon}
            </div>

            <div>

                <strong>
                    ${title}
                </strong>

                <p>
                    ${description}
                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   HISTORIAL
========================================================= */

function addMoveToHistory(
    move,
    player
) {

    if (!moveHistory) return;


    const empty =
        moveHistory.querySelector(
            ".history-empty"
        );


    if (empty) {

        empty.remove();

    }


    const moveElement =
        document.createElement(
            "div"
        );


    moveElement.classList.add(
        "history-move"
    );


    const number =
        document.createElement(
            "span"
        );


    number.classList.add(
        "move-number"
    );


    number.textContent =
        moveNumber + ".";


    const text =
        document.createElement(
            "span"
        );


    text.classList.add(
        "move-text"
    );


    text.textContent =
        move;


    if (
        player === "ai"
    ) {

        text.classList.add(
            "ai-history-move"
        );

    }


    moveElement.appendChild(
        number
    );


    moveElement.appendChild(
        text
    );


    moveHistory.appendChild(
        moveElement
    );


    if (
        player === "ai"
    ) {

        moveNumber++;

    }


    moveHistory.scrollTop =
        moveHistory.scrollHeight;

}


/* =========================================================
   NOTACIÓN
========================================================= */

function createMoveNotation(
    from,
    to,
    piece
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


    const fromSquare =
        files[from.col] +
        (8 - from.row);


    const toSquare =
        files[to.col] +
        (8 - to.row);


    const symbols = {

        king: "R",
        queen: "D",
        rook: "T",
        bishop: "A",
        knight: "C",
        pawn: ""

    };


    return (
        symbols[piece.type] +
        fromSquare +
        " → " +
        toSquare
    );

}


/* =========================================================
   NOMBRE DE PIEZA
========================================================= */

function getPieceName(
    type
) {

    const names = {

        pawn: "peón",
        knight: "caballo",
        bishop: "alfil",
        rook: "torre",
        queen: "dama",
        king: "rey"

    };


    return names[type] ||
        "pieza";

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
   DIFICULTAD
========================================================= */

function setDifficulty(
    level
) {

    difficulty =
        level;


    const names = {

        easy: "Nivel fácil",
        medium: "Nivel medio",
        hard: "Nivel difícil",
        expert: "Nivel experto"

    };


    if (
        aiDifficultyLabel
    ) {

        aiDifficultyLabel.textContent =
            names[level];

    }


    document
        .querySelectorAll(
            ".difficulty-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.difficulty === level
                );

            }
        );


    showMessage(
        `Dificultad cambiada a ${names[level]}.`
    );

}


/* =========================================================
   VELOCIDAD IA VS IA
========================================================= */

function updateSpeed() {

    const slider =
        document.getElementById(
            "speedSlider"
        );


    if (!slider) return;


    const value =
        Number(
            slider.value
        );


    aiSpeed =
        value * 1000;


    const speedValue =
        document.getElementById(
            "speedValue"
        );


    if (speedValue) {

        speedValue.textContent =
            `${value} segundo${value !== 1 ? "s" : ""}`;

    }

}


/* =========================================================
   IA VS IA - INICIAR
========================================================= */

function startAIGame() {

    stopAIGame();


    aiBoard =
        createInitialBoard();


    aiTurn =
        "white";


    aiPlaying =
        true;


    aiPaused =
        false;


    aiMoveCount =
        0;


    renderAIBoard();


    const status =
        document.getElementById(
            "aiGameStatus"
        );


    if (status) {

        status.textContent =
            "La IA de blancas está pensando...";

    }


    const startButton =
        document.getElementById(
            "startAIButton"
        );


    if (startButton) {

        startButton.textContent =
            "⟳ Partida en curso";

    }


    runAIMove();

}


/* =========================================================
   IA VS IA - MOVIMIENTO
========================================================= */

function runAIMove() {

    if (!aiPlaying) return;

    if (aiPaused) return;


    const possibleMoves =
        getAllLegalMoves(
            aiBoard,
            aiTurn
        );


    if (
        possibleMoves.length === 0
    ) {

        finishAIGame();

        return;

    }


    const move =
        chooseAIMoveForSimulation(
            possibleMoves,
            aiTurn
        );


    if (!move) {

        finishAIGame();

        return;

    }


    showAIThinking(
        aiTurn,
        true
    );


    const thinkingTime =
        Math.min(
            1000,
            Math.max(
                400,
                aiSpeed / 3
            )
        );


    setTimeout(
        () => {

            if (
                !aiPlaying ||
                aiPaused
            ) {

                return;

            }


            const piece =
                aiBoard[
                    move.from.row
                ][
                    move.from.col
                ];


            const captured =
                aiBoard[
                    move.to.row
                ][
                    move.to.col
                ];


            aiBoard[
                move.to.row
            ][
                move.to.col
            ] =
                piece;


            aiBoard[
                move.from.row
            ][
                move.from.col
            ] =
                null;


            aiMoveCount++;


            renderAIBoard();


            highlightAISimulationMove(
                move
            );


            updateCurrentAIMove(
                piece,
                move,
                captured
            );


            showAIThinking(
                aiTurn,
                false
            );


            aiTurn =
                aiTurn === "white"
                    ? "black"
                    : "white";


            const status =
                document.getElementById(
                    "aiGameStatus"
                );


            if (status) {

                status.textContent =
                    aiTurn === "white"
                        ? "La IA de blancas está pensando..."
                        : "La IA de negras está pensando...";

            }


            aiMoveTimer =
                setTimeout(
                    runAIMove,
                    aiSpeed
                );

        },
        thinkingTime
    );

}


/* =========================================================
   ELEGIR MOVIMIENTO PARA IA VS IA
========================================================= */

function chooseAIMoveForSimulation(
    moves,
    color
) {

    if (
        !moves.length
    ) {

        return null;

    }


    const captures =
        moves.filter(
            move => {

                return !!aiBoard[
                    move.to.row
                ][
                    move.to.col
                ];

            }
        );


    if (
        captures.length &&
        Math.random() < 0.65
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


/* =========================================================
   RENDER IA VS IA
========================================================= */

function renderAIBoard() {

    if (!aiChessBoard) return;


    aiChessBoard.innerHTML = "";


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

            const square =
                document.createElement(
                    "div"
                );


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


            square.dataset.row =
                row;


            square.dataset.col =
                col;


            const piece =
                aiBoard[row][col];


            if (piece) {

                const pieceElement =
                    document.createElement(
                        "span"
                    );


                pieceElement.classList.add(
                    "chess-piece",
                    piece.color
                );


                pieceElement.textContent =
                    PIECES[
                        piece.color
                    ][
                        piece.type
                    ];


                square.appendChild(
                    pieceElement
                );

            }


            aiChessBoard.appendChild(
                square
            );

        }

    }

}


/* =========================================================
   RESALTAR MOVIMIENTO IA VS IA
========================================================= */

function highlightAISimulationMove(
    move
) {

    if (!aiChessBoard) return;


    const from =
        aiChessBoard.querySelector(
            `[data-row="${move.from.row}"][data-col="${move.from.col}"]`
        );


    const to =
        aiChessBoard.querySelector(
            `[data-row="${move.to.row}"][data-col="${move.to.col}"]`
        );


    if (from) {

        from.classList.add(
            "ai-move-highlight"
        );

    }


    if (to) {

        to.classList.add(
            "ai-move-highlight"
        );

    }


    setTimeout(
        () => {

            if (from) {

                from.classList.remove(
                    "ai-move-highlight"
                );

            }


            if (to) {

                to.classList.remove(
                    "ai-move-highlight"
                );

            }

        },
        Math.max(
            1000,
            aiSpeed - 300
        )
    );

}


/* =========================================================
   MOVIMIENTO ACTUAL IA
========================================================= */

function updateCurrentAIMove(
    piece,
    move,
    captured
) {

    const pieceElement =
        document.getElementById(
            "currentMovePiece"
        );


    const textElement =
        document.getElementById(
            "currentMoveText"
        );


    const descriptionElement =
        document.getElementById(
            "currentMoveDescription"
        );


    if (pieceElement) {

        pieceElement.textContent =
            PIECES[
                piece.color
            ][
                piece.type
            ];

    }


    const notation =
        createMoveNotation(
            move.from,
            move.to,
            piece
        );


    if (textElement) {

        textElement.textContent =
            notation;

    }


    if (
        descriptionElement
    ) {

        if (captured) {

            descriptionElement.textContent =
                `${getPieceName(piece.type)} captura ${getPieceName(captured.type)}.`;

        } else {

            descriptionElement.textContent =
                `${getPieceName(piece.type)} se mueve a una nueva posición.`;

        }

    }

}


/* =========================================================
   INDICADOR "PENSANDO"
========================================================= */

function showAIThinking(
    color,
    visible
) {

    const id =
        color === "white"
            ? "whiteThinking"
            : "blackThinking";


    const element =
        document.getElementById(
            id
        );


    if (!element) return;


    element.classList.toggle(
        "hidden",
        !visible
    );

}


/* =========================================================
   PAUSAR IA
========================================================= */

function toggleAIPause() {

    if (!aiPlaying) return;


    aiPaused =
        !aiPaused;


    const button =
        document.getElementById(
            "pauseAIButton"
        );


    if (aiPaused) {

        clearTimeout(
            aiMoveTimer
        );


        if (button) {

            button.innerHTML =
                "▶ Continuar";

        }


        const status =
            document.getElementById(
                "aiGameStatus"
            );


        if (status) {

            status.textContent =
                "Demostración pausada.";

        }

    } else {

        if (button) {

            button.innerHTML =
                "⏸ Pausar";

        }


        runAIMove();

    }

}


/* =========================================================
   DETENER IA
========================================================= */

function stopAIGame() {

    aiPlaying =
        false;


    aiPaused =
        false;


    clearTimeout(
        aiMoveTimer
    );


    showAIThinking(
        "white",
        false
    );


    showAIThinking(
        "black",
        false
    );

}


/* =========================================================
   FINALIZAR IA VS IA
========================================================= */

function finishAIGame() {

    aiPlaying =
        false;


    clearTimeout(
        aiMoveTimer
    );


    const status =
        document.getElementById(
            "aiGameStatus"
        );


    if (status) {

        status.textContent =
            "La demostración terminó.";

    }


    const startButton =
        document.getElementById(
            "startAIButton"
        );


    if (startButton) {

        startButton.textContent =
            "▶ Iniciar partida";

    }

}


/* =========================================================
   REINICIAR PARTIDA DEL ALUMNO
========================================================= */

function resetGame() {

    board =
        createInitialBoard();


    selectedSquare =
        null;


    currentTurn =
        "white";


    gameOver =
        false;


    playerScore =
        0;


    aiScore =
        0;


    moveNumber =
        1;


    /*
       LIMPIAR FLECHAS
    */

    lastThreeMoves = [];


    const canvas =
        document.getElementById(
            "moveCanvas"
        );


    if (canvas) {

        const ctx =
            canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    if (moveHistory) {

        moveHistory.innerHTML = `

            <div class="history-empty">
                Todavía no hay movimientos.
            </div>

        `;

    }


    updateScores();


    clearHighlights();


    renderBoard();


    showAnalysis(
        "Nueva partida",
        "Seleccioná una pieza blanca para comenzar.",
        ""
    );


    updateGameMessage(
        "Tu turno. Elegí una pieza."
    );

}


/* =========================================================
   COMPROBAR FINAL
========================================================= */

function checkGameEnd() {

    const whiteMoves =
        getAllLegalMoves(
            board,
            "white"
        );


    const blackMoves =
        getAllLegalMoves(
            board,
            "black"
        );


    if (
        whiteMoves.length === 0
    ) {

        endGame("ai");

        return true;

    }


    if (
        blackMoves.length === 0
    ) {

        endGame("player");

        return true;

    }


    return false;

}


/* =========================================================
   FINAL DE PARTIDA
========================================================= */

function endGame(
    winner
) {

    gameOver =
        true;


    totalGames++;


    if (
        winner === "player"
    ) {

        totalWins++;


        playerScore +=
            100;


        updateScores();


        const winModal =
            document.getElementById(
                "winModal"
            );


        const winScore =
            document.getElementById(
                "winModalScore"
            );


        if (winScore) {

            winScore.textContent =
                "+100";

        }


        if (winModal) {

            winModal.classList.remove(
                "hidden"
            );

        }


        updateGameMessage(
            "¡Ganaste la partida!"
        );

    } else {

        updateGameMessage(
            "La IA ganó la partida."
        );


        showAnalysis(
            "Partida terminada",
            "La inteligencia artificial consiguió la victoria.",
            "ai"
        );

    }


    updateStatistics();

}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function updateStatistics() {

    const games =
        document.getElementById(
            "statGames"
        );


    const wins =
        document.getElementById(
            "statWins"
        );


    const accuracy =
        document.getElementById(
            "statAccuracy"
        );


    const totalScore =
        document.getElementById(
            "statTotalScore"
        );


    if (games) {

        games.textContent =
            totalGames;

    }


    if (wins) {

        wins.textContent =
            totalWins;

    }


    const accuracyValue =
        totalMoves > 0
            ? Math.round(
                (
                    goodMoves /
                    totalMoves
                ) * 100
            )
            : 0;


    if (accuracy) {

        accuracy.textContent =
            `${accuracyValue}%`;

    }


    if (totalScore) {

        totalScore.textContent =
            playerScore;

    }


    const progress =
        Math.min(
            100,
            playerScore
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    const progressPercent =
        document.getElementById(
            "progressPercent"
        );


    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    if (progressPercent) {

        progressPercent.textContent =
            `${progress}%`;

    }


    const progressLevel =
        document.getElementById(
            "progressLevel"
        );


    if (progressLevel) {

        if (
            playerScore >= 1000
        ) {

            progressLevel.textContent =
                "Experto";

        } else if (
            playerScore >= 500
        ) {

            progressLevel.textContent =
                "Avanzado";

        } else if (
            playerScore >= 250
        ) {

            progressLevel.textContent =
                "Intermedio";

        } else {

            progressLevel.textContent =
                "Principiante";

        }

    }

}


/* =========================================================
   CAMBIO DE SECCIONES
========================================================= */

function changeSection(
    sectionId
) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const section =
        document.getElementById(
            sectionId
        );


    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    const navButton =
        document.querySelector(
            `[data-section="${sectionId}"]`
        );


    if (navButton) {

        navButton.classList.add(
            "active"
        );

    }


    /*
       Si volvemos a la sección del tablero,
       recalculamos las flechas.
    */

    setTimeout(
        drawAllMoveArrows,
        100
    );

}


/* =========================================================
   NUEVA PARTIDA
========================================================= */

const newGameButton =
    document.getElementById(
        "newGameButton"
    );


if (newGameButton) {

    newGameButton.addEventListener(
        "click",
        resetGame
    );

}


/* =========================================================
   REINICIAR PARTIDA
========================================================= */

const restartGameButton =
    document.getElementById(
        "restartGameButton"
    );


if (restartGameButton) {

    restartGameButton.addEventListener(
        "click",
        resetGame
    );

}


/* =========================================================
   DIFICULTAD
========================================================= */

document
    .querySelectorAll(
        ".difficulty-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setDifficulty(
                        button.dataset.difficulty
                    );

                }
            );

        }
    );


/* =========================================================
   NAVEGACIÓN
========================================================= */

document
    .querySelectorAll(
        ".nav-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    changeSection(
                        button.dataset.section
                    );

                }
            );

        }
    );


/* =========================================================
   VELOCIDAD
========================================================= */

const speedSlider =
    document.getElementById(
        "speedSlider"
    );


if (speedSlider) {

    speedSlider.addEventListener(
        "input",
        updateSpeed
    );

}


/* =========================================================
   INICIAR IA VS IA
========================================================= */

const startAIButton =
    document.getElementById(
        "startAIButton"
    );


if (startAIButton) {

    startAIButton.addEventListener(
        "click",
        () => {

            if (aiPlaying) {

                return;

            }

            startAIGame();

        }
    );

}


/* =========================================================
   PAUSAR IA
========================================================= */

const pauseAIButton =
    document.getElementById(
        "pauseAIButton"
    );


if (pauseAIButton) {

    pauseAIButton.addEventListener(
        "click",
        toggleAIPause
    );

}


/* =========================================================
   REINICIAR IA VS IA
========================================================= */

const resetAIButton =
    document.getElementById(
        "resetAIButton"
    );


if (resetAIButton) {

    resetAIButton.addEventListener(
        "click",
        startAIGame
    );

}


/* =========================================================
   CERRAR MODAL ERROR
========================================================= */

const closeErrorModal =
    document.getElementById(
        "closeErrorModal"
    );


const errorModalButton =
    document.getElementById(
        "errorModalButton"
    );


function closeErrorModalFunction() {

    const modal =
        document.getElementById(
            "errorModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


if (closeErrorModal) {

    closeErrorModal.addEventListener(
        "click",
        closeErrorModalFunction
    );

}


if (errorModalButton) {

    errorModalButton.addEventListener(
        "click",
        closeErrorModalFunction
    );

}


/* =========================================================
   CERRAR MODAL VICTORIA
========================================================= */

const winModalButton =
    document.getElementById(
        "winModalButton"
    );


if (winModalButton) {

    winModalButton.addEventListener(
        "click",
        () => {

            const modal =
                document.getElementById(
                    "winModal"
                );


            if (modal) {

                modal.classList.add(
                    "hidden"
                );

            }


            resetGame();

        }
    );

}


/* =========================================================
   UTILIDAD: CLONAR TABLERO
========================================================= */

function cloneBoard(
    position
) {

    return position.map(
        row =>
            row.map(
                piece =>
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
   UTILIDAD: DELAY IA
========================================================= */

function getAIDelay() {

    switch (
        difficulty
    ) {

        case "easy":

            return 800;


        case "medium":

            return 1100;


        case "hard":

            return 1500;


        case "expert":

            return 1900;


        default:

            return 1100;

    }

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

function initializeGame() {

    board =
        createInitialBoard();


    aiBoard =
        createInitialBoard();


    currentTurn =
        "white";


    aiTurn =
        "white";


    difficulty =
        "medium";


    aiSpeed =
        3000;


    lastThreeMoves = [];


    renderBoard();


    renderAIBoard();


    updateScores();


    updateSpeed();


    updateStatistics();


    showAnalysis(
        "Listo para jugar",
        "Seleccioná una pieza blanca para comenzar.",
        ""
    );


    updateGameMessage(
        "Tu turno. Elegí una pieza."
    );


    /*
       Asegurar que las flechas
       tengan el tamaño correcto.
    */

    setTimeout(
        drawAllMoveArrows,
        200
    );

}


/* =========================================================
   ARRANCAR
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGame
    );

} else {

    initializeGame();

}