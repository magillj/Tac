/* JS for Tac, currently tested only with board size of 3x3 cells */
/* Built around the idea that I'll come back later and add functions to support different sized boards */

/////////////////////////////////////////////////////////////////////////
/*                        Global Variables                             */
/////////////////////////////////////////////////////////////////////////

// An object that keeps track of the game
var gamestate;
var GAME_CONSTANTS = {
    values: { // Player is assumed to be X, for now
        empty: 0,
        x: 1,
        o: -1
    }
};


/////////////////////////////////////////////////////////////////////////
/*                        General Helpers                              */
/////////////////////////////////////////////////////////////////////////

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Generates a standardized error message
function createErrorMessage(callFunc, error) {
    return "Error in " + callFunc + ": " + error;
}

// Parses a cell id in to an object with rows and columns
// Assumes format is 'cell_rowNum_colNum' where rowNum and colNum are integers
function parseId(id) {
    var coordinateString = id.substring(id.indexOf('_') + 1, id.length); // Should be rowNum_colNum
    var rowNum = coordinateString.substring(0, coordinateString.indexOf('_'));
    var colNum = coordinateString.substring(coordinateString.indexOf('_') + 1, coordinateString.length);

    return {
        row: rowNum,
        col: colNum
    };
}

function constructId (row, col) {
    return "cell_" + row + "_" + col;
}

// Gets the numerical sum of all the values in a column
function getColumnValue(col) {
    var sum = 0;
    for (var i = 0; i < gamestate.size; i++) {
        sum += gamestate.board[i][col];
    }
    return sum;
}

// Gets the numerical sum of all the values in a row
function getRowValue(row) {
    var sum = 0;
    for (var j = 0; j < gamestate.size; j++) {
        sum += gamestate.board[row][j];
    }
    return sum;
}

function getDiagonalValue() {
    var sum = 0;
    for (var i = 0; i < gamestate.size; i++) {
        sum += gamestate.board[i][i];
    }
    return sum;
}

function getAntiDiagonalValue() {
    var sum = 0;
    for (var i = 0; i < gamestate.size; i++) {
        sum += gamestate.board[i][gamestate.size - 1 - i];
    }
    return sum;
}

// Checks the values of a row/column/diagonal sum to determine if a player has won.
// Returns an object with a flag set if there is a winner and a message of who won.
function checkSum(sum) {
    var output = {
        isWinner: false,
        message: ""
    };

    if (sum == GAME_CONSTANTS.values.x * 3) {
        output.isWinner = true;
        output.message = "X has won";
    } else if (sum == GAME_CONSTANTS.values.o * 3) {
        output.isWinner = true;
        output.message = "O has won";
    }

    return output;
}

// Examines the gamestate.board to see if anyone has one or if there are no more spots left.
// Takes in the row and column of the last move (for efficiency).
// Returns an object with a flag set if there is a winner and a message of who won. If the message is empty the game
// is still active.
function checkGameOver(lastRow, lastCol) {
    // Check current column
    var result = checkSum(getColumnValue(lastCol));
    if (result.isWinner) {
        return result;
    }

    // Check the current row
    result = checkSum(getRowValue(lastRow));
    if (result.isWinner) {
        return result;
    }

    // Check the current diagonal
    if (lastCol === lastRow) {
        // On the diagonal
        result = checkSum(getDiagonalValue());
        if (result.isWinner) {
            return result;
        }
    }

    // Check anti diagonal
    if (lastCol == (gamestate.size - 1) - lastRow) {
        // On the anti diagonal
        result = checkSum(getAntiDiagonalValue());
        if (result.isWinner) {
            return result;
        }
    }

    // Check if its a draw
    var draw = true;
    for (var i = 0; i < gamestate.size && draw; i++) {
        draw = $.inArray(GAME_CONSTANTS.values.empty, gamestate.board[i]) == -1;
    }

    if (draw) {
        return {
            isWinner: false,
            message: "The game is a draw!"
        }
    }

    // This means it's still an active game
    return {
        isWinner: false,
        message: ""
    };
}

// Attempts to make a move, returning true if the move is made, false otherwise. Throws exception if move is impossible
// or playerSymbol is not an X or an O (case insensitive)
function makeMove(row, col, playerSymbol) {
    playerSymbol = playerSymbol.toUpperCase();

    if (row >= gamestate.size || row < 0 || col >= gamestate.size || col < 0) {
        throw createErrorMessage("makeMove", "Improper input: Column=" + col + ", Row=" + row);
    }

    if (playerSymbol !== "O" && playerSymbol !== "X") {
        throw createErrorMessage("makeMove", "Improper input: playerSymbol=" + playerSymbol);
    }

    var cell = $("#" + constructId(row, col))[0];

    if (!cell.innerHTML) {
        cell.innerHTML = playerSymbol;
        gamestate.board[row][col] = playerSymbol === "X" ? GAME_CONSTANTS.values.x : GAME_CONSTANTS.values.o;

        return true;
    }

    return false;
}

function resetBoardOfThreeGamestate() {
    gamestate = {
        active: true,
        board: [[0,0,0],[0,0,0],[0,0,0]], // A matrix to represent the board
        playerTurn: true, // Thus, X: true, O: false
        lastMove: { // For the AI to make a move faster
            lastRow: null,
            lastCol: null
        },
        size: 3 // Number of cells in a row/column
    };
}

function resetGame() {
    // TODO: In the future, configure this based on user settings
    // Reset the gamestate
    resetBoardOfThreeGamestate();
    // Reset the board
    $(".cell").each(function() {
        $(this)[0].innerHTML = "";
    });
}

// Finishes the current game by displaying the game status and resetting the game if they want to play again
function endGame(winnerMessage) {
    if (confirm(winnerMessage + " Play again?")) {
        resetGame();
    } else {
        gamestate.active = false;
    }
}

/////////////////////////////////////////////////////////////////////////
/*                        Page Initialization                          */
/////////////////////////////////////////////////////////////////////////

// Generates a 3 x 3 tic tac toe board
function generateBoardOfThree() {
    // Used to generate the grid
    var styles = [["br bb", "bl bb br", "bl bb"],
        ["br bt bb", "br bl bt bb", "bl bt bb"],
        ["br bt", "bl bt br", "bl bt"]];

    for (var i = 0; i < 3; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < 3; j++) {
            var cell = document.createElement("td");
            cell.className = "cell " + styles[i][j];
            cell.id = constructId(i, j);
            row.appendChild(cell);
            cell.addEventListener('click', function(){
                updatePlayerChoice($(this)[0].id);
            });
        }
        $("#tac_board").append(row);
    }

    resetBoardOfThreeGamestate();
}

/////////////////////////////////////////////////////////////////////////
/*                    Main Game Engine Functions                       */
/////////////////////////////////////////////////////////////////////////

function updatePlayerChoice(cellId) {
    var coordinates = parseId(cellId);

    // Attempt to make the move
    if (makeMove(coordinates.row, coordinates.col, "X")) {
        // Check the game status
        processGameStatus(coordinates.row, coordinates.col);
    }
}

function processGameStatus(row, col) {
    var result = checkGameOver(row, col);
    if (result.isWinner || result.message) {
        endGame(result.message);
    } else {
        // Switch whose playerTurn it is
        gamestate.playerTurn = !gamestate.playerTurn;
        // If it's the AI's playerTurn, have them make their move
        if (!gamestate.playerTurn) {
            makeAIMove();
        }
    }
}

function gameStateSave() {
    if (!gamestate.active) {
        resetGame();
    }
    chrome.storage.sync.set({
        gamestate: gamestate
    });
}

/////////////////////////////////////////////////////////////////////////
/*                               AI                                    */
/////////////////////////////////////////////////////////////////////////

// Gets all hte empty cells on the board
function getAllEmptyCells() {
    var cellsList = [];
    $(".cell").each(function() {
        if (!$(this)[0].innerHTML) {
            cellsList.push($(this)[0]);
        }
    });
    return cellsList;
}

function makeAIMove() {
    // TODO: Base this off a difficulty setting

    // Randomly select an open spot to move (this is going to the easiest difficulty)
    var emptyCells = getAllEmptyCells();
    var coordinates = parseId(emptyCells[getRandomInt(0,emptyCells.length)].id);
    makeMove(coordinates.row, coordinates.col, "O");

    processGameStatus(coordinates.row, coordinates.col);
}

/////////////////////////////////////////////////////////////////////////
/*                           Run On Eval                               */
/////////////////////////////////////////////////////////////////////////

/* Failing code for saving only on the popup's close
 var port = chrome.runtime.connect({name: "TacCloseDetector"});

 port.onDisconnect = gameStateSave;
 */
generateBoardOfThree();