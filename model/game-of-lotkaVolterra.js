/**
 * Created by prawda on 14.01.2016.
 */

var R = require('ramda');

var cellularAutomaton = require('./cellular-automaton.js');

var CORPSE_COLOR = "black";
var PREDATOR_COLOR = "red";
var PREY_COLOR = "steelblue";
var DEAD_COLOR = "white";
var EMPTY_COLOR = "white";


function makeDecision() {

    var neighborsAlive = 0;

    for(i = 0; i < this.neighbors.length; i++) {
        if(this.neighbors[i].state.type !== 'empty') neighborsAlive++;
    }

    if(neighborsAlive === 0) {
        return {
            action: "clone",
            value: Math.floor(Math.random() * 6)
        }
    }
    else {
        return {
            action: "move",
            value: Math.floor(Math.random() * 6)
        };
    }
}

var randomMover = new cellularAutomaton.createCell(
    function init() {
        return {
                color: PREY_COLOR,
                type: 'mover',
                energy: 0,
                neighbors: []
        };
    },
    makeDecision
);

var emptyCell = new cellularAutomaton.createCell(
    function init() {
        return {
            color: EMPTY_COLOR,
            type: 'empty',
            energy: 0,
            neighbors: []
        };
    },
    function () {
        return {
            action: "stay",
            value: 0
        };
    }
);


var mooreNeighborhood = new cellularAutomaton.createNeighborhood(function () {
    var world = {};
    var space = [];

    var size = {
        x: 100,
        y: 100
    };

    for (var i = 0; i < size.x; i++) {
        space.push([]);
        for (var j = 0; j < size.y; j++) {
            space[i].push(R.clone(emptyCell));
            space[i][j].init();
        }
    }

    // the good modulo (works for negative values also)
    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    // hexagonal neighboorhood
    for (i = 0; i < size.x; i++) {
        for (j = 0; j < size.y; j++) {

            // left and right neighbors
            space[i][j].neighbors.push(space[mod(i + 1, size.x)][j]);
            space[i][j].neighbors.push(space[mod(i - 1, size.x)][j]);

            // upper neighbors
            space[i][j].neighbors.push(space[mod(i + j % 2 - 1, size.x)][mod(j + 1, size.y)]);
            space[i][j].neighbors.push(space[mod(i + j % 2, size.x)][mod(j + 1, size.y)]);

            // lower neighbors
            space[i][j].neighbors.push(space[mod(i + j % 2 - 1, size.x)][mod(j - 1, size.y)]);
            space[i][j].neighbors.push(space[mod(i + j % 2, size.x)][mod(j - 1, size.y)]);
        }
    }

    world.space = space;

    // this is not in use, but should be!
    world.parameters = {
        someProperty: 0.3
    };

    return world;
});

var gameOfLife = new cellularAutomaton.createAutomat(mooreNeighborhood, randomMover);


function print() {
    gameOfLife.applyFunc(function (cell) {
        console.log(cell.state);
    });
}


exports.init = R.bind(gameOfLife.init, gameOfLife);

exports.evolve = R.bind(gameOfLife.evolve2, gameOfLife);

exports.getState = function () {
    return gameOfLife.world.space;
};

exports.buttonClick = function (event) {

    var newCell = new cellularAutomaton.createCell(
        function init() {
            return {
                color: event.color,
                type: 'mover',
                energy: 0,
                neighbors: []
            };
        },
        makeDecision
    );

    gameOfLife.world.space[event.x][event.y].state = newCell.state;
    gameOfLife.world.space[event.x][event.y].state.color = event.color;
    gameOfLife.world.space[event.x][event.y].futureState = newCell.futureState;
    gameOfLife.world.space[event.x][event.y].futureState.color = event.color;
    gameOfLife.world.space[event.x][event.y].makeDecision = newCell.makeDecision;

};

exports.setParameters = function (event) {
    gameOfLife.parameters.someProperty = event.someProperty;
};



function mapRandomStart(fn, array) {
    var startIndex = Math.floor(Math.random() * array.length);

    for (var i = 0; i <= array.length; i++) {
//        array[i+startIndex%array.length] = R.merge(array[i+startIndex%array.length], fn(array[i+startIndex%array.length]);
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
