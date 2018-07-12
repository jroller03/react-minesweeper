var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _ref = _,
    range = _ref.range,
    sampleSize = _ref.sampleSize,
    flatten = _ref.flatten; // lodash

var initialWidth = 16;
var initialHeight = 16;
var initialMines = 40;

// helpers for accessing/modifying minesweeper state
var helpers = {
  // assigns props to the cell with id
  assignCell: function assignCell(state, cellId, props) {
    var grid = state.grid;

    var cell = this.getCell(state, cellId);
    var x = cell.x,
        y = cell.y;

    var row = grid[cell.y];
    return _extends({}, state, {
      grid: [].concat(_toConsumableArray(grid.slice(0, y)), [[].concat(_toConsumableArray(row.slice(0, x)), [_extends({}, cell, props)], _toConsumableArray(row.slice(x + 1)))], _toConsumableArray(grid.slice(y + 1)))
    });
  },


  // assign props to all cells in cellIds
  assignCells: function assignCells(state, cellIds, props) {
    return _extends({}, state, {
      grid: state.grid.map(function (row) {
        return row.map(function (cell) {
          return cellIds.includes(cell.id) ? _extends({}, cell, props) : cell;
        });
      })
    });
  },


  // get cell by id
  getCell: function getCell(state, cellId) {
    return flatten(state.grid).find(function (cell) {
      return cell.id === cellId;
    });
  },


  // get cell at coordinate x, y
  getCellAt: function getCellAt(state, _ref2) {
    var x = _ref2.x,
        y = _ref2.y;
    var grid = state.grid,
        width = state.width,
        height = state.height;

    if (x >= 0 && y >= 0 && x < width && y < height) {
      // bounds check
      return grid[y][x];
    }
    return null;
  },


  // get cells around cell (where cell.id === cellId)
  getNeighbors: function getNeighbors(state, cellId) {
    var grid = state.grid;

    var _getCell = this.getCell(state, cellId),
        x = _getCell.x,
        y = _getCell.y;

    return [this.getCellAt(state, { x: x - 1, y: y - 1 }), // top left
    this.getCellAt(state, { x: x, y: y - 1 }), // top
    this.getCellAt(state, { x: x + 1, y: y - 1 }), // top right

    this.getCellAt(state, { x: x - 1, y: y }), // left
    this.getCellAt(state, { x: x + 1, y: y }), // right

    this.getCellAt(state, { x: x - 1, y: y + 1 }), // bottom left
    this.getCellAt(state, { x: x, y: y + 1 }), // bottom
    this.getCellAt(state, { x: x + 1, y: y + 1 })].filter(function (cell) {
      return !!cell;
    }); // remove null cells (if target cell is on an edge)
  },


  // starting at startCell continuing through its neighbors, finds all cells that touch no mines (returns an array of ids)
  // this is required to open large pockets of empty space when a cell is revealed
  getRevealCells: function getRevealCells(state, startCellId) {
    var _this = this;

    var visited = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    var cell = this.getCell(state, startCellId);
    if (cell.mine) {
      // don't reveal empty cells around mines
      return [startCellId];
    }
    var neighbors = this.getNeighbors(state, startCellId);
    var neighborMines = neighbors.filter(function (cell) {
      return cell.mine;
    });
    visited.push(startCellId); // keep track of visited mines (passed to recursive calls)

    if (neighborMines.length) {
      // stop if the cell borders a mine (but still reveal it)
      return [startCellId];
    } else {
      var toReveal = neighbors.filter(function (neighbor) {
        return !neighbor.flagged && !visited.includes(neighbor.id);
      }) // unvisited/unflagged neighbors only
      .map(function (neighbor) {
        return neighbor.id;
      });

      return flatten([startCellId].concat(_toConsumableArray(toReveal.map(function (cellId) {
        return _this.getRevealCells(state, cellId, visited);
      }))));
    }
  },


  // returns the number of mines bordering a cell
  countMinesAround: function countMinesAround(state, cellId) {
    return this.getNeighbors(state, cellId).filter(function (c) {
      return c.mine;
    }).length;
  },


  // check if you are blown up
  hasLost: function hasLost(state) {
    var cells = flatten(state.grid);
    return cells.some(function (c) {
      return c.mine && c.revealed;
    });
  },


  // check if all non-mine cells are revealed
  hasWon: function hasWon(state) {
    var cells = flatten(state.grid);
    var nonMines = cells.filter(function (c) {
      return !c.mine;
    });
    return nonMines.every(function (c) {
      return c.revealed;
    });
  }
};

var minesweeperActions = {
  "@@redux/INIT": function reduxINIT(state) {
    return state;
  },
  FLAG_CELL: function FLAG_CELL(state, _ref3) {
    var cellId = _ref3.cellId;

    var cell = helpers.getCell(state, cellId);
    if (cell.revealed) {
      return state;
    } else {
      return helpers.assignCell(state, cellId, {
        flagged: !cell.flagged
      });
    }
  },


  // reveal a cell (and all cells around it until a cell containing a mine is reached)
  REVEAL_CELL: function REVEAL_CELL(state, _ref4) {
    var cellId = _ref4.cellId;

    if (state.won || state.lost || helpers.getCell(state, cellId).flagged) {
      return state;
    }
    if (!state.minesPlaced) {
      state = this.PLACE_MINES(state, { cellIdToAvoid: cellId });
    }
    var toReveal = helpers.getRevealCells(state, cellId);
    var newState = helpers.assignCells(state, toReveal, { revealed: true, flagged: false });
    var hasLost = helpers.hasLost(newState);
    var hasWon = !hasLost && helpers.hasWon(newState);
    return _extends({}, newState, {
      won: hasWon,
      lost: hasLost,
      endTime: Date.now()
    });
  },
  REVEAL_AROUND_CELL: function REVEAL_AROUND_CELL(state, _ref5) {
    var _this2 = this;

    var cellId = _ref5.cellId;

    var cell = helpers.getCell(state, cellId);
    var neighbors = helpers.getNeighbors(state, cellId);
    var neighborMineCount = neighbors.filter(function (n) {
      return n.mine;
    }).length;
    var neighborFlagCount = neighbors.filter(function (n) {
      return n.flagged;
    }).length;
    if (cell.revealed && neighborMineCount === neighborFlagCount) {
      var nonFlaggedNeighborIds = neighbors.filter(function (n) {
        return !n.flagged;
      }).map(function (n) {
        return n.id;
      });
      return nonFlaggedNeighborIds.reduce(function (state, cellId) {
        return _this2.REVEAL_CELL(state, { cellId: cellId });
      }, state);
    }
    return state;
  },
  PLACE_MINES: function PLACE_MINES(state, _ref6) {
    var cellIdToAvoid = _ref6.cellIdToAvoid;

    var validCells = flatten(state.grid).filter(function (c) {
      return c.id !== cellIdToAvoid;
    }).map(function (c) {
      return c.id;
    });
    var mines = sampleSize(validCells, state.mineCount);
    return _extends({}, helpers.assignCells(state, mines, { mine: true }), {
      minesPlaced: true,
      startTime: Date.now()
    });
  }
};

var store = getMinesweeperStore({ width: initialWidth, height: initialHeight, mineCount: initialMines });

function minesweeperReducer(state, action) {
  if (minesweeperActions.hasOwnProperty(action.type)) {
    // checks if handler exists for the action
    return minesweeperActions[action.type](state, action);
  } else {
    console.warn("Invalid minesweeper action: \"" + action.type + "\" (ignoring)");
    return state;
  }
}

// create a redux store with using minesweeper reducer and an initial state generated from passed options
function getMinesweeperStore(_ref7) {
  var width = _ref7.width,
      height = _ref7.height,
      mineCount = _ref7.mineCount;

  var initialState = {
    width: width, height: height, mineCount: mineCount,
    minesPlaced: false,
    lost: false,
    won: false,
    startTime: null, // starts when the first cell is clicked
    endTime: null, // set when won/lost
    grid: range(0, height).map(function (y) {
      return range(0, width).map(function (x) {
        // create a 2d grid of cells
        return {
          id: "cell-" + x + "-" + y,
          x: x, y: y,
          flagged: false,
          mine: false,
          revealed: false
        };
      });
    })
  };
  return Redux.createStore(function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return minesweeperReducer(state, action);
  });
}

// used to create popout border effect
function PopBox(props) {
  var className = classNames("pop-box", props.inset ? "pop-box--inset" : null, props.className);
  return React.createElement("div", _extends({}, props, { className: className }));
}

function Minefield(props) {
  return React.createElement(PopBox, _extends({}, props, { className: "minefield", inset: true }));
}

function MinefieldRow(props) {
  return React.createElement("div", _extends({}, props, { className: "minefield-row" }));
}

function MineCell(props) {
  var revealed = props.revealed,
      flagged = props.flagged,
      mine = props.mine;

  var className = classNames("mine-cell", "mine-cell--" + (revealed ? "revealed" : "hidden"), mine ? "mine-cell--mine" : null, flagged ? "mine-cell--flagged" : null);

  return React.createElement(PopBox, _extends({}, props, { className: className, revealed: true }));
}

function MineCellNumber(_ref8) {
  var number = _ref8.number;

  var className = "mine-cell-number mine-cell-number--" + number;
  return React.createElement(
    "span",
    { className: className },
    number || ""
  );
}

function CellContent(_ref9) {
  var revealed = _ref9.revealed,
      mine = _ref9.mine,
      borderMineCount = _ref9.borderMineCount;

  if (!mine && borderMineCount && revealed) {
    return React.createElement(MineCellNumber, { number: borderMineCount });
  }
  return null;
}

function DigitalCounter(props) {
  var number = props.number;

  var paddedNumber = padNumber(number, 3);
  return React.createElement(
    "div",
    _extends({}, props, { className: "digital-counter" }),
    paddedNumber
  );
}

var Minesweeper = function (_React$Component) {
  _inherits(Minesweeper, _React$Component);

  function Minesweeper() {
    _classCallCheck(this, Minesweeper);

    return _possibleConstructorReturn(this, (Minesweeper.__proto__ || Object.getPrototypeOf(Minesweeper)).apply(this, arguments));
  }

  _createClass(Minesweeper, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.stopTimer();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var _props = this.props,
          minesPlaced = _props.minesPlaced,
          won = _props.won,
          lost = _props.lost;


      if (!minesPlaced && nextProps.minesPlaced) {
        this.startTimer();
      }
      if (!won && nextProps.won || !lost && nextProps.lost) {
        clearInterval(this.timer);
        this.stopTimer();
      }
    }
  }, {
    key: "startTimer",
    value: function startTimer() {
      var _this4 = this;

      this.timer = setInterval(function () {
        return _this4.forceUpdate();
      }, 500);
    }
  }, {
    key: "stopTimer",
    value: function stopTimer() {
      clearInterval(this.timer);
    }
  }, {
    key: "onCellMouseUp",
    value: function onCellMouseUp(cell, event) {
      event.preventDefault();
      var store = this.props.store;
      var which = event.nativeEvent.which;

      switch (event.nativeEvent.which) {
        case 1:
          store.dispatch({
            type: "REVEAL_CELL",
            cellId: cell.id
          });
          break;
        case 2:
          store.dispatch({
            type: "REVEAL_AROUND_CELL",
            cellId: cell.id
          });
          break;
      }
      return false;
    }
  }, {
    key: "onCellMouseDown",
    value: function onCellMouseDown(cell, event) {
      event.preventDefault();
      if (event.nativeEvent.which === 3) {
        var _store = this.props.store;

        _store.dispatch({
          type: "FLAG_CELL",
          cellId: cell.id
        });
      }
      return false;
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;

      var _props2 = this.props,
          store = _props2.store,
          grid = _props2.grid,
          won = _props2.won,
          lost = _props2.lost,
          mineCount = _props2.mineCount,
          startTime = _props2.startTime,
          endTime = _props2.endTime,
          onReset = _props2.onReset;

      var flagCount = flatten(grid).filter(function (c) {
        return c.flagged;
      }).length;
      var now = Date.now();

      return React.createElement(
        PopBox,
        { className: "minesweeper" },
        React.createElement(
          PopBox,
          { className: "minesweeper__info", inset: true },
          React.createElement(DigitalCounter, { number: mineCount - flagCount }),
          React.createElement(
            "button",
            { className: "minesweeper__win-label", onClick: onReset },
            won ? "You won!" : lost ? "You Lost" : "Reset"
          ),
          React.createElement(DigitalCounter, { number: startTime ? Math.floor(((won || lost ? endTime : now) - startTime) / 1000) : 0 })
        ),
        React.createElement(
          Minefield,
          null,
          grid.map(function (row, i) {
            return React.createElement(
              MinefieldRow,
              { key: "row-" + i },
              row.map(function (cell) {
                return React.createElement(
                  MineCell,
                  _extends({}, cell, {
                    key: cell.id,
                    revealed: cell.revealed || (won || lost) && !cell.flagged && cell.mine,
                    onMouseDown: _this5.onCellMouseDown.bind(_this5, cell),
                    onClick: _this5.onCellMouseUp.bind(_this5, cell),
                    onContextMenu: function onContextMenu(e) {
                      return e.preventDefault(), false;
                    }
                  }),
                  React.createElement(CellContent, _extends({}, cell, { borderMineCount: helpers.countMinesAround(_this5.props, cell.id) }))
                );
              })
            );
          })
        )
      );
    }
  }]);

  return Minesweeper;
}(React.Component);

var App = function (_React$Component2) {
  _inherits(App, _React$Component2);

  function App(props) {
    _classCallCheck(this, App);

    var _this6 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this6.store = store;
    _this6.state = {
      width: initialWidth,
      height: initialHeight,
      mineCount: initialMines,
      storeState: store.getState()
    };
    return _this6;
  }

  _createClass(App, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.subscribe();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.unsubscribe();
    }
  }, {
    key: "subscribe",
    value: function subscribe() {
      var _this7 = this;

      this.unsub = this.store.subscribe(function () {
        return _this7.setState({
          storeState: _this7.store.getState()
        });
      });
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe() {
      if (this.unsub) {
        this.unsub();
        this.unsub = null;
      }
    }
  }, {
    key: "updateStateInt",
    value: function updateStateInt(key, event) {
      this.setState(_defineProperty({}, key, parseInt(event.target.value)));
    }
  }, {
    key: "reset",
    value: function reset() {
      var _state = this.state,
          width = _state.width,
          height = _state.height,
          mineCount = _state.mineCount;

      this.unsubscribe();
      this.store = getMinesweeperStore({ width: width, height: height, mineCount: mineCount });
      this.subscribe();
      this.setState({ storeState: this.store.getState() });
    }
  }, {
    key: "render",
    value: function render() {
      var _state2 = this.state,
          storeState = _state2.storeState,
          width = _state2.width,
          height = _state2.height,
          mineCount = _state2.mineCount;

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "game-container" },
          React.createElement(Minesweeper, _extends({}, storeState, { store: this.store, onReset: this.reset.bind(this) }))
        ),
        React.createElement(
          "div",
          { className: "game-controls" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              null,
              "Width"
            ),
            React.createElement("input", { type: "number", value: width, onChange: this.updateStateInt.bind(this, "width"), min: "0", max: "50" })
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              null,
              "Height"
            ),
            React.createElement("input", { type: "number", value: height, onChange: this.updateStateInt.bind(this, "height"), min: "0", max: "50" })
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "label",
              null,
              "Mines"
            ),
            React.createElement("input", { type: "number", value: mineCount, onChange: this.updateStateInt.bind(this, "mineCount"), min: "0", max: "2499" })
          ),
          React.createElement(
            "button",
            { onClick: this.reset.bind(this) },
            "Start"
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

function padNumber(n, length) {
  var isNegative = n < 0;
  if (isNegative) {
    n = n * -1;
    length -= 1; // tack on "-" after padding
  };
  n = n.toString();
  while (n.length < length) {
    n = "0" + n;
  }
  if (isNegative) {
    n = "-" + n;
  }
  return n;
}

function classNames() {
  for (var _len = arguments.length, names = Array(_len), _key = 0; _key < _len; _key++) {
    names[_key] = arguments[_key];
  }

  return names.filter(function (n) {
    return !!n;
  }).join(" ");
}

ReactDOM.render(React.createElement(App, null), document.querySelector(".outlet"));
