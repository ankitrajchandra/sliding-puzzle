var n;

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function initialise_n(value) {
  n = value;
  console.log("Test 1 passed");
  create_game(n);
}

function create_game(n) {
  var workspace = document.getElementById("game");
  // to empty the menu page
  workspace.textContent = "";

  var board = document.createElement("div");
  board.className = "grid";
  board.id = "board";

  workspace.appendChild(board);

  for (var i = 1; i < n * n; i++) {
    var tile = document.createElement("button");
    tile.innerText = i;
    board.appendChild(tile);
  }

  var tile = document.createElement("button");
  tile.innerText = "";
  board.appendChild(tile);

  var val = "80px ";
  var str = "80px ";
  for (var i = 1; i < n; i++) str = str.concat(val);
  document.querySelector(".grid").style.gridTemplateColumns = str;
  document.querySelector(".grid").style.gridTemplateRows = str;

  var foot = document.createElement("div");
  foot.className = "footer";

  var playButton = document.createElement("button");
  playButton.innerText = "Play";

  var movescounter = document.createElement("span");
  movescounter.id = "move";
  movescounter.innerText = "Move: 100";

  var timer = document.createElement("span");
  timer.id = "time";
  timer.innerText = "Time: 100";

  foot.appendChild(playButton);
  foot.appendChild(movescounter);
  foot.appendChild(timer);
  workspace.appendChild(foot);
  

  const GAME = Game.ready();
}
class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === n - 1) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === n - 1) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
};

const isSolved = grid => {
  var check = true;
  var index = 1
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      if ((i === n - 1) && (j === n - 1)) check = check && grid[i][j] === 0;
      else check = check && (grid[i][j] === index);
      index++;
    }
  }
  return (check);
};

const getRandomGrid = () => {
  let grid = new Array(n);
  var value = 1
  for (var i = 0; i < n; i++) {
    grid[i] = new Array(n);
    for (var j = 0; j < n; j++) {
      if (value === n * n) grid[i][j] = 0;
      else grid[i][j] = value;
      value++;

    }
  }

  // Shuffle
  let blankBox = new Box(n - 1, n - 1);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  if (isSolved(grid)) return getRandomGrid();
  return grid;
};

class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  static ready() {
    var initialise_grid = new Array(n);
    for (var i = 0; i < n; i++) {
      initialise_grid[i] = new Array(n);
      for (var j = 0; j < n; j++) {
        initialise_grid[i][j] = 0;
      }
    }


    return new State(
      initialise_grid,
      0,
      0,
      "ready"
    );
  }

  static start() {
    return new State(getRandomGrid(), 0, 0, "playing");
  }
}

class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  static ready() {
    return new Game(State.ready());
  }

  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleClickBox(box) {
    return function () {
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        swapBoxes(newGrid, box, blankBox);
        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            grid: newGrid,
            move: this.state.move + 1
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1
          });
        }
      }
    }.bind(this);
  }

  render() {
    const { grid, move, time, status } = this.state;

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const button = document.createElement("button");

        if (status === "playing") {
          button.addEventListener("click", this.handleClickBox(new Box(j, i)));
        }

        button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
        newGrid.appendChild(button);
      }
    }
    document.querySelector(".grid").replaceWith(newGrid);
    var val = "80px ";
    var str = "80px ";
    for (var i = 1; i < n; i++) str = str.concat(val);
    document.querySelector(".grid").style.gridTemplateColumns = str;
    document.querySelector(".grid").style.gridTemplateRows = str;


    // Render button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start());
    });
    document.querySelector(".footer button").replaceWith(newButton);

    // Render move
    document.getElementById("move").textContent = `Move: ${move}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${time}`;

    // Render message
    if (status === "won") {
      document.querySelector(".message").textContent = "You win!";
    } else {
      document.querySelector(".message").textContent = "";
    }
  }
}

