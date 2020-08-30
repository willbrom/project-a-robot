const roads = [
    "Alice's House-Bob's House",   "Alice's House-Cabin",
    "Alice's House-Post Office",   "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop",          "Marketplace-Farm",
    "Marketplace-Post Office",     "Marketplace-Shop",
    "Marketplace-Town Hall",       "Shop-Town Hall"
];

const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

const buildGraph = (edges) => {
    let graph = Object.create(null);

    const addEdge = (from, to) => {
        if (graph[from] == null)
            graph[from] = [to];
        else
            graph[from].push(to);
    };

    for (const [from, to] of edges.map( v => v.split('-'))) {
        addEdge(from, to);
        addEdge(to, from);
    }

    return graph;
};

const roadGraph = buildGraph(roads);

// creates a state that is used by the robot to view the village
// the robot views the village as place (it's position) and parcels (need to be delivered to specific places)
class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    // returns a new VillageState with an updated place (robots current position)
    // and upadtes parcels (parcels will be moved to the new position and those that need to be delivered to the new position will be delivered)
    move(destination) {
        if (destination == this.place) return this;
        // the map takes care of the moving and the filter the delivering
        let parcels = this.parcels.map(p => {
            // moving parcels to destination
            // if parcel has not been picked yet return parcel w/o any change
            if (p.place != this.place) return p;
            // parcels moves with the robot i.e there place property gets updated to match the current position
            return {place: destination, address: p.address};
        }).filter(p => p.place != p.address); // delivering parcels when they reach address
        return new VillageState(destination, parcels);
    }
}

// start here
const runRobot = (state, robot, memory = []) => {
    for (let i = 0;; i++) {
        if (state.parcels.length == 0) {
            console.log(`Done in ${i} moves`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${state.place}`);
    }
};

// randomly pick an index in an array
const randomPick = (array) => {
    let index = Math.floor(Math.random()  * array.length);
    return array[index];
};

// robot returns a random reachable direction to move towards
const randomRobot = (state) => {
    return {direction: randomPick(roadGraph[state.place])};
};

// robot follows the mail truck's route (path that passes all places in the village) twice
const routeRobot = (state, memory) => {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
};

const randomState = (parcelCount = 5) => {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let place = randomPick(Object.keys(roadGraph));
        let address;
        do {
            address = randomPick(Object.keys(roadGraph));
        } while(place == address);

        parcels.push({place, address});
    }

    return new VillageState("Post Office", parcels);
};

// test
runRobot(randomState(5), routeRobot);
//console.log(randomRobot(new VillageState("Post Office")));

/*
let parcels = [
    {place: "Post Office", address: "Alice's House"},
    {place: "Post Office", address: "Bob's House"},
    {place: "Bob's House", address: "Town Hall"}
];

let first = new VillageState("Post Office", parcels);
console.log(first);

let next = first.move("Alice's House");
console.log(next);

next = next.move("Bob's House");
console.log(next);

next = next.move("Town Hall");
console.log(next); */