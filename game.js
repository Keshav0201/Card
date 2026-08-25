const urlParams = new URLSearchParams(window.location.search);
const noOfPlayers = Number(urlParams.get("players"));

const playersDisplay = document.getElementById("playersDisplay");
const gameContainer = document.getElementById("gameContainer");
const nextRoundBTN = document.getElementById("nextRoundBTN");
const leaderboardContainer = document.getElementById("leaderboardContainer");
const container = document.getElementById("Container");
container.style.display = "flex";
leaderboardContainer.style.display = "none";

nextRoundBTN.disabled = false;
const maxRounds = 8;

let game = JSON.parse(localStorage.getItem("game")) || {
  round: 1,
  forward: true,
  ans: 0,
  players: [],
};

let round = game.round;
let forward = game.forward;
let players = game.players;
let ans = game.ans;

const playerNames = JSON.parse(localStorage.getItem("playerNames"));

if (players.length == 0) {
  for (let i = 0; i < noOfPlayers; i++) {
    players[i] = {
      name: playerNames[i],
      score: 0,
      selected: -1,
    };
  }
}
const fSuits = {
  1: "♠",
  2: "♦",
  3: "♣",
  4: "♥",
  5: "♠",
  6: "♦",
  7: "♣",
  8: "♥",
};

const bSuits = {
  8: "♠",
  7: "♦",
  6: "♣",
  5: "♥",
  4: "♠",
  3: "♦",
  2: "♣",
  1: "♥",
};

function saveGame() {
  localStorage.setItem(
    "game",
    JSON.stringify({
      round,
      forward,
      ans,
      players,
    })
  );
}

function updateRound() {
  let suit;

  if (forward) {
    suit = fSuits[round];
  } else {
    suit = bSuits[round];
  }

  playersDisplay.innerText = `Round - ${round} {${suit}}`;

  gameContainer.innerHTML = "";
  let startingplayer;
  if(forward){
    startingplayer = round % noOfPlayers;
  }else{
    startingplayer = (maxRounds + (maxRounds - round + 1) % noOfPlayers);
  }
  if(startingplayer == 0){
    startingplayer = noOfPlayers;
  }
  let i = startingplayer;
  let c = 0;

  while(c < noOfPlayers){

    let newDiv = document.createElement("div");
    newDiv.classList.add("div_box");

    let html = "";

    for (let j = 0; j <= round; j++) {
      html += `
        <button class="numberBtn waiting" id="p${i}n${j}">
          ${j}
        </button>
      `;
    }

    newDiv.innerHTML = `
        <h3 id="player${i}">${players[i - 1].name}</h3>

        <div class="numberBTNS">
          ${html}
        </div>

        <h4 id="score${i}">
          Score - ${players[i - 1].score}
        </h4>

        <div class="answerBtns">
          <button class="tick pResultBtn" id="tick${i}">
            Won
          </button>

          <button class="cross pResultBtn" id="cross${i}">
            Lost
          </button>
        </div>
    `;

    gameContainer.append(newDiv);
    disableButtons();
    c++;
    i = (i % noOfPlayers) + 1;
  }
}

updateRound();

function handleNumberButtonClick(id) {
  const pName = id[1];
  const btnNumber = id[3];

  players[pName - 1].selected = Number(btnNumber);

  for (let i = 0; i <= round; i++) {
    const btnId = `p${pName}n${i}`;
    const button = document.getElementById(btnId);

    button.classList.remove("waiting");

    if (btnId == id) {
      button.classList.add("selected");
      button.disabled = true;
    } else {
      button.style.display = "none";
    }
  }
}

function checkAllSelected() {
  for (let i = 0; i < noOfPlayers; i++) {
    if (players[i].selected == -1) {
      return false;
    }
  }
  return true;
}

function checkAllAnswered() {
  for (let i = 0; i < noOfPlayers; i++) {
    if (players[i].selected != -1) {
      return false;
    }
  }
  return true;
}

function enableButtons() {
  const buttons = document.querySelectorAll(".pResultBtn");
  buttons.forEach((b) => {
    b.disabled = false;
  });
}

function disableButtons() {
  const buttons = document.querySelectorAll(".pResultBtn");
  buttons.forEach((b) => {
    b.disabled = true;
  });
}

disableButtons();

function updateScore(player) {
  const disp = document.getElementById(`score${player}`);
  disp.innerText = `Score - ${players[player - 1].score}`;
}

function handleWonRound(id) {
  const player = Number(id[4]);
  players[player - 1].score += Number(players[player - 1].selected + 10);
  updateScore(player);
}

function handleLostRound(id) {
  const player = Number(id[5]);
  updateScore(player);
}

function handleWonUndo(id) {
  const player = Number(id[4]);
  players[player - 1].score -= Number(players[player - 1].selected + 10);
  updateScore(player);
}

gameContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("numberBtn")) {
    const clickedBtnId = event.target.id;
    handleNumberButtonClick(clickedBtnId);
    if (checkAllSelected()) {
      enableButtons();
    }
    saveGame();
    return;
  }

  if (!checkAllSelected()) {
    alert("Select guess of each player first");
    return;
  }

  if (event.target.classList.contains("tick")) {
    const button = document.getElementById(`cross${event.target.id[4]}`);
    if (button.disabled) {
      ans--;
    }
    ans++;
    console.log(ans);
    handleWonRound(event.target.id);
    document.getElementById(event.target.id).disabled = true;
  }

  if (event.target.classList.contains("cross")) {
    const button = document.getElementById(`tick${event.target.id[5]}`);
    if (button.disabled) {
      handleWonUndo(button.id);
      ans--;
    }
    ans++;
    console.log(ans);
    handleLostRound(event.target.id);
    document.getElementById(event.target.id).disabled = true;
  }
  saveGame();
});

function displayLeaderboard() {
  container.style.display = "none";
  leaderboardContainer.style.display = "block";
  leaderboardContainer.innerHTML = "";

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Title
  const title = document.createElement("h1");
  title.classList.add("leaderboard-title");
  title.innerText = "🏆 Final Leaderboard";
  leaderboardContainer.appendChild(title);

  // Leaderboard
  sortedPlayers.forEach((player, index) => {
    const playerDiv = document.createElement("div");
    playerDiv.classList.add("leaderboard-entry");

    if (index === 0) {
      playerDiv.classList.add("first-place");
    } else if (index === 1) {
      playerDiv.classList.add("second-place");
    } else if (index === 2) {
      playerDiv.classList.add("third-place");
    }

    playerDiv.innerHTML = `
      <div class="rank">
        ${index + 1}
      </div>

      <div class="player-info">
        <h3>${player.name}</h3>
        <p>${index === 0 ? "🏆 Winner" : "Player"}</p>
      </div>

      <div class="player-score">
        ${player.score}
        <span>pts</span>
      </div>
    `;

    leaderboardContainer.appendChild(playerDiv);
  });

  // New Game button
  const newGameButton = document.createElement("button");
  newGameButton.id = "newGameBtn";
  newGameButton.innerText = "🎮 New Game";

  newGameButton.addEventListener("click", () => {
    localStorage.removeItem("game");
    location.reload();
  });

  leaderboardContainer.appendChild(newGameButton);
}

nextRoundBTN.addEventListener("click", (e) => {
  if (ans != noOfPlayers) {
    alert("Please select status of each");
    return;
  }
  ans = 0;

  players.forEach((player) => {
    player.selected = -1;
  });

  if (forward) {
    if (round < maxRounds) {
      round++;
    } else if (round == maxRounds) {
      forward = false;
    }
  } else {
    if (round == 1) {
      displayLeaderboard();
    } else if (round <= maxRounds) {
      round--;
    }
  }

  updateRound();
  saveGame();
});
