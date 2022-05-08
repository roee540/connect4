class Connect4 {
  constructor(selector) {
    this.ROWS = 6;
    this.COLS = 7;
    this.player = "red";
    this.PLAYER_PIECE = 1;
    this.AI_PIECE = 2;
    this.boardMatrix = [];
    this.selector = selector;
    this.board;
    this.isGameOver = false;
    this.firstGame = false;
    this.onPlayerMove = function () {};
    this.createGrid();
    this.createBoardMatrix();
    this.SelectFirstTurn();
    this.startGame();
  }

  createGrid() {
    this.board = $(this.selector);
    this.board.empty();
    this.isGameOver = false;
    this.boardMatrix = [];
    this.player = "red";
    for (let rows = 0; rows < this.ROWS; rows++) {
      var row = $("<div>").addClass("row");
      for (let cols = 0; cols < this.COLS; cols++) {
        var col = $("<div>")
          .addClass("col empty")
          .attr("data-col", cols)
          .attr("data-row", rows);
        row.append(col);
      }
      this.board.append(row);
    }
  }

  createBoardMatrix() {
    for (var i = 0; i < this.ROWS; i++) {
      this.boardMatrix[i] = [];
      for (var j = 0; j < this.COLS; j++) {
        this.boardMatrix[i][j] = 0;
      }
    }
  }

  SelectFirstTurn() {
    var turn = Math.floor(Math.random() * 1.99) + 1;
    if (turn == this.AI_PIECE) {
      this.player = "black";
    }
  }

  startGame() {
    const that = this;

    that.board.on("mouseenter", ".col.empty", function () {
      if (that.isGameOver) return;
      const col = $(this).data("col");
      const $lastEmptyCell = findLastEmptyCell(col);
      $lastEmptyCell.addClass(`next-red`);
    });

    that.board.on("mouseleave", ".col", function () {
      $(".col").removeClass(`next-${that.player}`);
    });

    that.board.on("click", ".col.empty", function () {
      if (that.isGameOver) return;
      const col = $(this).data("col");
      const $lastEmptyCell = findLastEmptyCell(col);
      that.boardMatrix[$lastEmptyCell.data("row")][
        $lastEmptyCell.data("col")
      ] = 1;

      $lastEmptyCell.addClass(that.player);
      $lastEmptyCell.data("player", that.player);
      $lastEmptyCell.removeClass(`empty next-${that.player}`);
      let winner = that.winning_move(that.boardMatrix, that.PLAYER_PIECE);

      if (winner) {
        that.isGameOver = true;
        setTimeout(() => {
          that.player = "red";
          alert(`Game Over! Player ${that.player} has won!`);
          $(".col.empty").removeClass("empty");
          return;
        }, 500);
      }
      that.player = "black";
      that.onPlayerMove();

      setTimeout(() => {
        if (that.player == "black") {
          AiMove(that.boardMatrix);
          that.player = "red";
        }
      }, 500);
    });

    function findLastEmptyCell(col) {
      const cells = $(`.col[data-col='${col}']`);
      for (let i = cells.length - 1; i >= 0; i--) {
        const $cell = $(cells[i]);
        if ($cell.hasClass("empty")) {
          return $cell;
        }
      }
      return null;
    }

    function AiMove(boardMatrix) {
      var aiPosition = that.AiBrain(boardMatrix);
      var row = aiPosition[0];
      var col = aiPosition[1];
      const $lastEmptyCell = findLastEmptyCell(col);

      $lastEmptyCell.removeClass(`empty next-${that.player}`);
      $lastEmptyCell.addClass(that.player);
      $lastEmptyCell.data("player", that.player);
      let winner = that.winning_move(boardMatrix, that.AI_PIECE);

      if (winner) {
        that.isGameOver = true;
        setTimeout(() => {
          that.player = "black";
          alert(`Game Over! Player ${that.player} has won!`);
          $(".col.empty").removeClass("empty");
          return;
        }, 500);
      }
      that.player = "red";
      that.onPlayerMove();
    }

    if (that.player == "black") {
      AiMove(that.boardMatrix);
      that.player = "red";
    }
  }

  winning_move(boardMatrix, piece) {
    for (c = 0; c < this.COLS - 3; c++) {
      for (r = 0; r < this.ROWS; r++) {
        if (
          boardMatrix[r][c] == piece &&
          boardMatrix[r][c + 1] == piece &&
          boardMatrix[r][c + 2] == piece &&
          boardMatrix[r][c + 3] == piece
        ) {
          return true;
        }
      }
    }

    for (var c = 0; c < this.COLS; c++) {
      for (var r = 0; r < this.ROWS - 3; r++) {
        if (
          boardMatrix[r][c] == piece &&
          boardMatrix[r + 1][c] == piece &&
          boardMatrix[r + 2][c] == piece &&
          boardMatrix[r + 3][c] == piece
        ) {
          return true;
        }
      }
    }

    for (var c = 0; c < this.COLS - 3; c++) {
      for (var r = 0; r < this.ROWS - 3; r++) {
        if (
          boardMatrix[r][c] == piece &&
          boardMatrix[r + 1][c + 1] == piece &&
          boardMatrix[r + 2][c + 2] == piece &&
          boardMatrix[r + 3][c + 3] == piece
        ) {
          return true;
        }
      }
    }

    for (var c = 0; c <= this.COLS - 3; c++) {
      for (var r = 3; r < this.ROWS; r++) {
        if (
          boardMatrix[r][c] == piece &&
          boardMatrix[r - 1][c + 1] == piece &&
          boardMatrix[r - 2][c + 2] == piece &&
          boardMatrix[r - 3][c + 3] == piece
        ) {
          return true;
        }
      }
    }
    return false;
  }

  AiBrain(boardMatrix) {
    var that = this;

    function choose(choices) {
      var index = Math.floor(Math.random() * choices.length);
      return choices[index];
    }

    function is_valid_location(boardMatrix, col) {
      return boardMatrix[0][col] == 0;
    }

    function get_valid_locations(boardMatrix) {
      var valid_locations = [];
      for (var col = 0; col < that.COLS; col++) {
        if (is_valid_location(boardMatrix, col)) {
          valid_locations.push(col);
        }
      }
      return valid_locations;
    }

    function get_next_open_row(boardMatrix, col) {
      for (var r = that.ROWS - 1; r >= 0; r--) {
        if (boardMatrix[r][col] == 0) {
          return r;
        }
      }
    }

    function drop_piece(boardMatrix, row, col, piece) {
      boardMatrix[row][col] = piece;
    }

    function is_terminal_node(boardMatrix) {
      return (
        that.winning_move(boardMatrix, that.PLAYER_PIECE) ||
        that.winning_move(boardMatrix, that.AI_PIECE) ||
        get_valid_locations(boardMatrix).length == 0
      );
    }

    function evaluate_window(board_window, piece) {
      var score = 0;
      var opp_piece = that.PLAYER_PIECE;
      var count_piece = 0;
      var count_empty = 0;
      var count_player = 0;
      for (var i = 0; i < board_window[0].length; i++) {
        if (board_window[0][i] == piece) {
          count_piece++;
        } else if (board_window[0][i] == 0) {
          count_empty++;
        } else if (board_window[0][i] == opp_piece) {
          count_player++;
        }
      }
      if (count_piece == 4) {
        score += 100;
      } else if (count_piece == 3 && count_empty == 1) {
        score += 5;
      } else if (count_piece == 2 && count_empty == 2) {
        score += 2;
      }

      if (count_player == 3 && count_empty == 1) {
        score -= 4;
      }

      return score;
    }

    function score_position(boardMatrix, AI_PIECE) {
      var score = 0;
      var center_count = 0;
      var center_array = [];
      for (var i = 0; i < that.ROWS; i++) {
        center_array.push(boardMatrix[i][3]);
      }

      for (var j = 0; j <= center_array.length; j++) {
        if (center_array[j] == AI_PIECE) {
          center_count++;
        }
      }
      score += center_count * 3;

      for (var r = 0; r < that.ROWS; r++) {
        var col;
        var row_array = [];
        for (col in boardMatrix[r]) {
          row_array.push(boardMatrix[r][col]);
        }
        for (var c = 0; c < that.COLS - 3; c++) {
          var board_window = [row_array.slice(c, c + 4)];
          score += evaluate_window(board_window, AI_PIECE);
        }
      }

      for (var c = 0; c < that.COLS; c++) {
        var col_array = [];
        for (var i = 0; i < that.ROWS; i++) {
          col_array.push(boardMatrix[i][c]);
        }
        for (var r = 0; r < that.ROWS - 3; r++) {
          var board_window = [col_array.slice(r, r + 4)];
          score += evaluate_window(board_window, AI_PIECE);
        }
      }

      for (var r = 0; r < that.ROWS - 3; r++) {
        for (var c = 0; c < that.COLS - 3; c++) {
          var board_window = [];
          for (var i = 0; i < 4; i++) {
            var row = r + i;
            var col = c + i;
            board_window.push(boardMatrix[row][col]);
          }
          score += evaluate_window(board_window, AI_PIECE);
        }
      }

      for (var r = 0; r < that.ROWS - 3; r++) {
        for (var c = 0; c < that.COLS - 3; c++) {
          var board_window = [];
          for (var i = 0; i < 4; i++) {
            var row = r + 3 - i;
            var col = c + i;
            board_window.push(boardMatrix[row][col]);
          }
          score += evaluate_window(board_window, AI_PIECE);
        }
      }

      return score;
    }

    function copyBoardMatrix(boardMatrix) {
      var b_copy = [];
      for (var i = 0; i < that.ROWS; i++) {
        b_copy[i] = [...boardMatrix[i]];
      }
      return b_copy;
    }

    function minMax(boardMatrix, depth, alpha, beta, maximizingPlayer) {
      var i = 0;
      var j = 0;
      var valid_locations = get_valid_locations(boardMatrix);
      var is_terminal = is_terminal_node(boardMatrix);
      if (depth == 0 || is_terminal) {
        if (is_terminal) {
          if (that.winning_move(boardMatrix, that.AI_PIECE)) {
            return [null, 100000000000000];
          } else if (that.winning_move(boardMatrix, that.PLAYER_PIECE)) {
            return [null, -10000000000000];
          } else {
            return [null, 0];
          }
        } else {
          return [null, score_position(boardMatrix, that.AI_PIECE)];
        }
      }
      if (maximizingPlayer) {
        var value = Number.NEGATIVE_INFINITY;
        var column = choose(valid_locations);
        for (i; i < valid_locations.length; i++) {
          var col = valid_locations[i];
          var row = get_next_open_row(boardMatrix, col);
          var b_copy = copyBoardMatrix(boardMatrix);
          drop_piece(b_copy, row, parseInt(col, 10), that.AI_PIECE);
          var new_score = minMax(b_copy, depth - 1, alpha, beta, false)[1];
          if (new_score > value) {
            value = new_score;
            column = col;
          }
          alpha = Math.max(alpha, value);
          if (alpha >= beta) {
            break;
          }
        }

        return [column, value];
      } else value = Number.POSITIVE_INFINITY;
      column = choose(valid_locations);
      for (j; j < valid_locations.length; j++) {
        col = valid_locations[j];
        row = get_next_open_row(boardMatrix, col);
        b_copy = copyBoardMatrix(boardMatrix);
        drop_piece(b_copy, row, parseInt(col, 10), that.PLAYER_PIECE);
        new_score = minMax(b_copy, depth - 1, alpha, beta, true)[1];
        if (new_score < value) {
          value = new_score;
          column = col;
        }
        beta = Math.min(beta, value);
        if (alpha >= beta) {
          break;
        }
      }
      return [column, value];
    }

    var minMaxResult = [];
    var minMaxResult = minMax(
      boardMatrix,
      5,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      true
    );
    var col = minMaxResult[0];
    if (is_valid_location(boardMatrix, col)) {
      var row = get_next_open_row(boardMatrix, col);
      drop_piece(boardMatrix, row, col, that.AI_PIECE);
    }
    return [row, col];
  }

  restart() {
    window.location.reload();
  }
}
