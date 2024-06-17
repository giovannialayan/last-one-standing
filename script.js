let fightersDiv;

let fighters;

let loadedFightersDiv;

let hgWinner;

let gameDiv;

let deadFighters;

let scenarios = new Map();

let fighterStats;

const fatalChance = 0.2;

window.onload = init;

function init() {
  loadScenarios();
  document.querySelector('#save').onclick = () => saveGame();
  fightersDiv = document.querySelector('#fighters');
  document.querySelector('#export').onclick = () => exportFighters();
  loadedFightersDiv = document.querySelector('#loadedFighters');
  document.querySelector('#start').onclick = () => progressGame(0, 0);
  gameDiv = document.querySelector('#game');
  document.querySelector('#continue').onclick = () => progressGame(0, 1);
}

function progressGame(day, situation) {
  if (day == 0) {
    submitFighters();
    changeStylesheet('game.css');
    document.querySelector('#continue').onclick = () => progressGame(0, 1);

    hgWinner = fighters[Math.floor(Math.random() * fighters.length)];

    deadFighters = [];
    fighterStats = new Map();

    for (let i = 0; i < fighters.length; i++) {
      fighterStats.set(fighters[i], { kills: 0, teamKills: 0, suicides: 0, envDeaths: 0 });
    }

    day++;
  }

  window.scrollTo(0, 0);

  gameDiv.innerHTML = '';

  let pairings;
  switch (situation) {
    case 0:
      gameDiv.innerHTML += `<p>blood bath</p><br>`;
      pairings = getPairings('bloodbath', hgWinner);
      break;

    case 1:
      gameDiv.innerHTML += `<p>day ${day}</p><br>`;
      pairings = getPairings('day', hgWinner);
      break;

    case 2:
      gameDiv.innerHTML += `<p>night ${day}</p><br>`;
      pairings = getPairings('night', hgWinner);
      break;

    default:
      console.log(`situation was not between 0 - 2, it was ${situation}`);
      return;
      break;
  }

  executeScenarios(pairings);

  removeDeadFighters();

  if (fighters.length <= 1) {
    document.querySelector('#continue').onclick = () => displayWinner(hgWinner);
  } else {
    situation++;
    document.querySelector('#continue').onclick = () => progressGame(situation > 2 ? day + 1 : day, situation > 2 ? 1 : situation);
  }
}

function displayStats() {
  changeStylesheet('stats.css');
  let statsDiv = document.querySelector('#stats');
  statsDiv.innerHTML = '';

  let players = new Map();

  for (const [key, value] of fighterStats) {
    if (!players.has(key.player) && players.length != 0) {
      players.set(key.player, { kills: value.kills, teamKills: value.teamKills, suicides: 0 + value.suicides, envDeaths: 0 + value.envDeaths });
    } else {
      players.get(key.player).kills += value.kills;
      players.get(key.player).teamKills += value.teamKills;
      players.get(key.player).suicides += 0 + value.suicides;
      players.get(key.player).envDeaths += 0 + value.envDeaths;
    }
  }

  statsDiv.appendChild(document.createElement('div'));

  for (const [key, value] of players) {
    statsDiv.lastChild.appendChild(document.createElement('div'));
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `${key}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `total kills: ${value.kills}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `total team kills: ${value.teamKills}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `total suicides: ${value.suicides}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `total environmental deaths: ${value.envDeaths}`;
  }

  statsDiv.appendChild(document.createElement('div'));

  for (const [key, value] of fighterStats) {
    statsDiv.lastChild.appendChild(document.createElement('div'));
    if (key == hgWinner) {
      statsDiv.lastChild.lastChild.className = 'winner';
    }
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `${key.name}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `${key.player}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('br'));
    statsDiv.lastChild.lastChild.appendChild(document.createElement('img'));
    statsDiv.lastChild.lastChild.lastChild.src = key.image;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `kills: ${value.kills}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `team kills: ${value.teamKills}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `suicided: ${value.suicides > 0 ? 'yes' : 'no'}`;
    statsDiv.lastChild.lastChild.appendChild(document.createElement('p'));
    statsDiv.lastChild.lastChild.lastChild.innerHTML = `environmental death: ${value.envDeaths > 0 ? 'yes' : 'no'}`;
  }

  document.querySelector('#continue').onclick = () => changeStylesheet('setup.css');
}

function displayWinner(winner) {
  gameDiv.innerHTML = '';

  gameDiv.appendChild(document.createElement('p'));
  gameDiv.lastChild.innerHTML = `${winner.player}'s ${winner.name} wins`;
  gameDiv.lastChild.id = 'winnerText';
  gameDiv.appendChild(document.createElement('img'));
  gameDiv.lastChild.src = winner.image;
  gameDiv.lastChild.id = 'winnerImage';

  document.querySelector('#continue').onclick = () => displayStats();
}

function changeStylesheet(sheet) {
  document.querySelector('#pagestyle').setAttribute('href', sheet);
}

function removeDeadFighters() {
  for (let i = 0; i < deadFighters.length; i++) {
    if (fighters.includes(deadFighters[i])) {
      fighters.splice(fighters.indexOf(deadFighters[i]), 1);
    }
  }
}

function executeScenarios(pairings) {
  for (let i = 0; i < pairings.length; i++) {
    gameDiv.appendChild(document.createElement('div'));
    gameDiv.lastChild.appendChild(document.createElement('p'));
    gameDiv.lastChild.appendChild(document.createElement('div'));
    gameDiv.lastChild.lastChild.appendChild(document.createElement('img'));

    if (pairings[i].fighter2 == -1) {
      gameDiv.lastChild.childNodes[0].innerHTML = pairings[i].scenario.replaceAll('fighter1', `<span>${fighters[pairings[i].fighter1].name}</span>`);
      gameDiv.lastChild.lastChild.lastChild.src = fighters[pairings[i].fighter1].image;

      console.log(pairings[i].scenario.replaceAll('fighter1', fighters[pairings[i].fighter1].name));

      if (pairings[i].fighter1dead) {
        deadFighters.push(fighters[pairings[i].fighter1]);
      }
    } else {
      gameDiv.lastChild.lastChild.appendChild(document.createElement('img'));
      gameDiv.lastChild.childNodes[0].innerHTML = pairings[i].scenario
        .replaceAll('fighter1', `<span>${fighters[pairings[i].fighter1].name}</span>`)
        .replaceAll('fighter2', `<span>${fighters[pairings[i].fighter2].name}</span>`);
      gameDiv.lastChild.lastChild.childNodes[0].src = fighters[pairings[i].fighter1].image;
      gameDiv.lastChild.lastChild.lastChild.src = fighters[pairings[i].fighter2].image;

      console.log(
        pairings[i].scenario.replaceAll('fighter1', fighters[pairings[i].fighter1].name).replaceAll('fighter2', fighters[pairings[i].fighter2].name)
      );

      if (pairings[i].fighter1dead) {
        deadFighters.push(fighters[pairings[i].fighter1]);
      }

      if (pairings[i].fighter2dead) {
        deadFighters.push(fighters[pairings[i].fighter2]);
      }
    }
  }
}

function getPairings(scenarioType, winner) {
  //figure out pairings for scenarios
  let pairings = new Array();
  let takenFighterIndexes = new Array();
  let winnerTaken = false;

  console.log(fighters.length);

  for (let i = 0; i < fighters.length; i++) {
    console.log(i + ' , ' + fighters[i].name);

    //check if the fighter was already paired
    let alreadyPaired = false;
    for (let j = 0; j < takenFighterIndexes.length; j++) {
      if (!alreadyPaired) {
        alreadyPaired = i == takenFighterIndexes[j];
      }
    }

    //only add fighter if they werent paired
    if (!alreadyPaired) {
      let scenarioTypeChance = Math.random();

      //if there is only 1 fighter left give them a 1 fighter scenario
      if (takenFighterIndexes.length == fighters.length - 1) {
        scenarioTypeChance = 0;
      }

      let scenarioFatalChance = Math.random();

      if (fighters[i] == winner && scenarioTypeChance < 0.25) {
        scenarioFatalChance = 0;
      }

      //if there are only 2 fighters left and the winner hasnt been used yet and this one is not the winner
      //and the scenario is fatal and it's a 2 fighter scenario then change it to 1 fighter becuase the while loop
      //for getValidFighter will be infinite under these exact circumstances
      if (
        takenFighterIndexes.length == fighters.length - 2 &&
        !winnerTaken &&
        fighters[i] != winner &&
        scenarioFatalChance >= fatalChance &&
        scenarioTypeChance >= 0.25
      ) {
        scenarioTypeChance = 0;
      }

      //get pairing
      let scenarioId = `${scenarioType}${scenarioFatalChance < fatalChance ? '' : 'Fatal'}${scenarioTypeChance < 0.25 ? 'Single' : 'Double'}`;

      if (scenarios.get(scenarioId).length == 0) {
        scenarioId = `${scenarioType}${scenarioFatalChance < fatalChance ? '' : 'Fatal'}${scenarioTypeChance < 0.25 ? 'Double' : 'Single'}`;
        scenarioTypeChance = scenarioTypeChance < 0.25 ? 1 : 0;
      }

      let otherFighterIndex = -1;
      if (scenarioTypeChance >= 0.25) {
        otherFighterIndex = getValidFighter(takenFighterIndexes, scenarioFatalChance, i);
        takenFighterIndexes.push(otherFighterIndex);
        if (fighters[otherFighterIndex] == winner) {
          winnerTaken = true;
        }
      }

      let scenarioIndex = Math.floor(Math.random() * scenarios.get(scenarioId).length);

      pairings.push({
        scenario: scenarios.get(scenarioId)[scenarioIndex].scenario,
        fighter1: i,
        fighter2: otherFighterIndex,
        fighter1dead: scenarios.get(scenarioId)[scenarioIndex].fighter1dead,
        fighter2dead: scenarios.get(scenarioId)[scenarioIndex].fighter2dead,
      });

      //update fighter stats
      //fighter1 kills fighter2
      if (scenarios.get(scenarioId)[scenarioIndex].fighter1kill) {
        fighterStats.get(fighters[i]).kills++;

        //fighter1 team kills fighter2
        if (otherFighterIndex != -1 && fighters[i].player == fighters[otherFighterIndex].player) {
          fighterStats.get(fighters[i]).teamKills++;
        }
      }
      //fighter2 kills fighter1
      if (scenarios.get(scenarioId)[scenarioIndex].fighter2kill && otherFighterIndex != -1) {
        fighterStats.get(fighters[otherFighterIndex]).kills++;

        //fighter1 team kills fighter2
        if (fighters[i].player == fighters[otherFighterIndex].player) {
          fighterStats.get(fighters[otherFighterIndex]).teamKills++;
        }
      }
      //fighter1 suicide
      if (scenarios.get(scenarioId)[scenarioIndex].fighter1suicide) {
        fighterStats.get(fighters[i]).suicides = true;
      }
      //fighter2 suicide
      if (scenarios.get(scenarioId)[scenarioIndex].fighter2suicide && otherFighterIndex != -1) {
        fighterStats.get(fighters[otherFighterIndex]).suicides = true;
      }
      //fighter1 environmental death
      if (scenarios.get(scenarioId)[scenarioIndex].fighter1envDeath) {
        fighterStats.get(fighters[i]).envDeaths = true;
      }
      //fighter2 environmental death
      if (scenarios.get(scenarioId)[scenarioIndex].fighter2envDeath && otherFighterIndex != -1) {
        fighterStats.get(fighters[otherFighterIndex]).envDeaths = true;
      }

      takenFighterIndexes.push(i);
      if (fighters[i] == winner) {
        winnerTaken = true;
      }
    }

    //show all pairings and contents
    console.log(`end iteration: \n${pairings.map((p) => `{${p.scenario}, ${p.fighter1}, ${p.fighter2}, ${p.fighter1dead}, ${p.fighter2dead}}\n`)}`);
  }

  return pairings;
}

function getValidFighter(taken, fatalChance, current) {
  let fighterIndex = Math.floor(Math.random() * fighters.length);

  //make sure other fighter is available and not fighter1
  while (
    (taken.length > 0 && taken.includes(fighterIndex)) ||
    fighterIndex == current ||
    (fighters[fighterIndex] == hgWinner && fatalChance >= 0.5)
  ) {
    fighterIndex++;
    if (fighterIndex >= fighters.length) {
      fighterIndex = 0;
    }
  }

  return fighterIndex;
}

function submitFighters() {
  fighters = [];

  for (let i = 0; i < fightersDiv.childElementCount; i++) {
    fighters.push({
      name: fightersDiv.childNodes[i].childNodes[2].value.trim(),
      player: fightersDiv.childNodes[i].childNodes[4].value.trim(),
      image: fightersDiv.childNodes[i].childNodes[8].src,
    });
  }
}

function exportFighters() {
  submitFighters();

  if (loadedFightersDiv.lastChild == null) {
    loadedFightersDiv.appendChild(document.createElement('p'));
  }

  loadedFightersDiv.lastChild.innerHTML = '';

  for (let i = 0; i < fightersDiv.childElementCount; i++) {
    loadedFightersDiv.lastChild.innerHTML += `number: ${i + 1}, name: ${fighters[i].name}, player: ${fighters[i].player}, image: ${
      fighters[i].image
    }<br>`;
  }
}

function saveGame() {
  let numFighters = document.querySelector('#numFighters').value;

  while (fightersDiv.childElementCount > numFighters) {
    fightersDiv.removeChild(fightersDiv.lastChild);
  }

  while (fightersDiv.childElementCount < numFighters) {
    fightersDiv.appendChild(document.createElement('div'));
    fightersDiv.lastChild.appendChild(document.createElement('p'));
    fightersDiv.lastChild.lastChild.innerHTML = `fighter ${Array.from(fightersDiv.childNodes).indexOf(fightersDiv.lastChild) + 1}`;
    fightersDiv.lastChild.appendChild(document.createElement('p'));
    fightersDiv.lastChild.lastChild.innerHTML = 'name: ';
    fightersDiv.lastChild.appendChild(document.createElement('input'));
    fightersDiv.lastChild.lastChild.type = 'text';
    fightersDiv.lastChild.lastChild.autocomplete = 'chrome-off';
    fightersDiv.lastChild.appendChild(document.createElement('p'));
    fightersDiv.lastChild.lastChild.innerHTML = 'player: ';
    fightersDiv.lastChild.appendChild(document.createElement('input'));
    fightersDiv.lastChild.lastChild.type = 'text';
    fightersDiv.lastChild.lastChild.autocomplete = 'chrome-off';
    fightersDiv.lastChild.appendChild(document.createElement('p'));
    fightersDiv.lastChild.lastChild.innerHTML = 'image link: ';
    fightersDiv.lastChild.appendChild(document.createElement('input'));
    fightersDiv.lastChild.lastChild.type = 'text';
    fightersDiv.lastChild.lastChild.autocomplete = 'chrome-off';
    fightersDiv.lastChild.appendChild(document.createElement('br'));
    fightersDiv.lastChild.appendChild(document.createElement('img'));
    fightersDiv.lastChild.lastChild.width = '150';
    fightersDiv.lastChild.lastChild.height = '150';
    fightersDiv.lastChild.lastChild.src = 'noimage.png';
    let currentImg = fightersDiv.lastChild.lastChild;
    fightersDiv.lastChild.childNodes[6].onchange = (e) => testImage(e.target.value, updateImage, 5000, currentImg);
  }

  //import fighters from text
  let importFighters = document
    .querySelector('#import')
    .value.split('\n')
    .map((f) => f.split(', '));

  try {
    for (let i = 0; i < importFighters.length; i++) {
      let number = importFighters[i][0].substr('number: '.length) - 1;
      let name = importFighters[i][1].substr('name: '.length);
      let player = importFighters[i][2].substr('player: '.length);
      let image = importFighters[i][3].substr('image: '.length);

      //number = fighter div, name = 2, player = 4, image = 6, img = 8
      fightersDiv.childNodes[number].childNodes[2].value = name;
      fightersDiv.childNodes[number].childNodes[4].value = player;
      fightersDiv.childNodes[number].childNodes[6].value = image;
      testImage(image, updateImage, 5000, fightersDiv.childNodes[number].childNodes[8]);
    }
  } catch (e) {
    console.log('import was incorrectly formatted');
  }
}

function updateImage(link, element, errorcode) {
  if (element.tagName != 'IMG') {
    console.log('element was not an img');
    return;
  }

  if (errorcode != 'success') {
    element.src = 'noimage.png';
    return;
  }

  element.src = link;
}

function loadScenarios() {
  const url = 'scenarios.xml';
  const xhr = new XMLHttpRequest();
  xhr.onload = (e) => {
    console.log(`in onload - http status code = ${e.target.status}`);
    const xml = e.target.responseXML;

    if (!xml) {
      console.log('bad xml');
      return;
    }

    scenarios.set('bloodbathSingle', new Array());
    scenarios.set('bloodbathDouble', new Array());
    scenarios.set('bloodbathFatalSingle', new Array());
    scenarios.set('bloodbathFatalDouble', new Array());
    scenarios.set('daySingle', new Array());
    scenarios.set('dayDouble', new Array());
    scenarios.set('dayFatalSingle', new Array());
    scenarios.set('dayFatalDouble', new Array());
    scenarios.set('nightSingle', new Array());
    scenarios.set('nightDouble', new Array());
    scenarios.set('nightFatalSingle', new Array());
    scenarios.set('nightFatalDouble', new Array());
    scenarios.set('feastSingle', new Array());
    scenarios.set('feastDouble', new Array());
    scenarios.set('feastFatalSingle', new Array());
    scenarios.set('feastFatalDouble', new Array());
    scenarios.set('arenaFatalSingle', new Array());
    scenarios.set('arenaFatalDouble', new Array());

    let allscenarioLists = xml.querySelectorAll('scenariolist');
    for (const a of allscenarioLists) {
      let tempArr = a.children;
      for (const s of tempArr) {
        if (a.id == 'arenaIntro' || a.id == 'arenaSurvive') {
          scenarios.set(a.id, s.textContent);
        } else if (s.textContent.includes('fighter2')) {
          scenarios.get(a.id + 'Double').push({
            scenario: s.textContent.trim(),
            fighter1dead: s.attributes.fighter1dead.nodeValue == 'true',
            fighter2dead: s.attributes.fighter2dead.nodeValue == 'true',
            fighter1kill: s.attributes.fighter1kill.nodeValue == 'true',
            fighter2kill: s.attributes.fighter2kill.nodeValue == 'true',
            fighter1suicide: s.attributes.fighter1suicide.nodeValue == 'true',
            fighter2suicide: s.attributes.fighter2suicide.nodeValue == 'true',
            fighter1envDeath: s.attributes.fighter1envDeath.nodeValue == 'true',
            fighter2envDeath: s.attributes.fighter2envDeath.nodeValue == 'true',
          });
        } else {
          scenarios.get(a.id + 'Single').push({
            scenario: s.textContent.trim(),
            fighter1dead: s.attributes.fighter1dead.nodeValue == 'true',
            fighter2dead: s.attributes.fighter2dead.nodeValue == 'true',
            fighter1kill: s.attributes.fighter1kill.nodeValue == 'true',
            fighter2kill: s.attributes.fighter2kill.nodeValue == 'true',
            fighter1suicide: s.attributes.fighter1suicide.nodeValue == 'true',
            fighter2suicide: s.attributes.fighter2suicide.nodeValue == 'true',
            fighter1envDeath: s.attributes.fighter1envDeath.nodeValue == 'true',
            fighter2envDeath: s.attributes.fighter2envDeath.nodeValue == 'true',
          });
        }
      }
    }
  };

  xhr.onerror = (e) => console.log(`in onerror - http status code = ${e.target.status}`);
  xhr.open('GET', url);
  xhr.send();
}

//test url for image code stolen from https://stackoverflow.com/questions/9714525/javascript-image-url-verify
function testImage(url, callback, timeout, element) {
  timeout = timeout || 5000;
  var timedOut = false,
    timer;
  var img = new Image();
  img.onerror = img.onabort = function () {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, element, 'error');
    }
  };
  img.onload = function () {
    if (!timedOut) {
      clearTimeout(timer);
      callback(url, element, 'success');
    }
  };
  img.src = url;
  timer = setTimeout(function () {
    timedOut = true;
    // reset .src to invalid URL so it stops previous
    // loading, but doesn't trigger new load
    img.src = '//!!!!/test.jpg';
    callback(url, element, 'timeout');
  }, timeout);
}
