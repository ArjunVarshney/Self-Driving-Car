const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 400;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 700;

let carWidth = 70;
let carHeight = 100;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const nLanes = 3;
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, nLanes);

N = 1;
const cars = generateCars(N, "AI", 4);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
   for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (i != 0) {
         NeuralNetwork.mutate(cars[i].brain, 0.01);
      }
   }
}

let traffic = [
   new Car(road.getLaneCenter(1), -100, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(0), -300, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(1), -300, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(2), -600, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(0), -600, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(3), -900, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(1), -1200, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(2), -1200, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(2), -1500, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(1), -1800, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(0), -2100, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(2), -2100, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(0), -2400, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(1), -2400, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(1), -2700, carWidth, carHeight, "DUMMY", 2),
   new Car(road.getLaneCenter(2), -2700, carWidth, carHeight, "DUMMY", 2),
];
let nWaves = 150;
createWaves(nWaves);

function generateUniqueNumbers(n) {
   const arr = [];
   while (arr.length < n) {
      let rand = Math.round(Math.random() * (nLanes - 1));
      while (arr.includes(rand)) {
         rand = Math.round(Math.random() * (nLanes - 1));
      }
      arr.push(rand);
   }
   return arr;
}

function createWaves(nWaves) {
   let distance = traffic.length > 0 ? -traffic[traffic.length - 1].y : 0;
   let minCars = 0.9;
   for (let i = 0; i < nWaves; i++) {
      let maxCars = 2;
      if (i % 7 == 0) {
         minCars += 0.1;
      }
      if (minCars > 1.5) {
         minCars = 2;
      }
      const nCars = Math.round(minCars + Math.random() * (maxCars - minCars));
      const lanes = generateUniqueNumbers(nCars);
      distance = distance + 300 + Math.random() * 50;
      for (let j = 0; j < nCars; j++) {
         const speed = 2;
         const addY = Math.random() * 40 - 20;
         const addCarWidth = Math.random() * 20 - 6;
         const addCarHeight = Math.random() * 26 - 13;
         traffic.push(
            new Car(
               road.getLaneCenter(lanes[j]),
               -distance + addY,
               carWidth + addCarWidth,
               carHeight + addCarHeight,
               "DUMMY",
               speed
            )
         );
      }
   }
   for (let j = 0; j < 3; j++) {
      const speed = 2;
      traffic.push(
         new Car(
            road.getLaneCenter(j),
            -distance - 300,
            carWidth,
            carHeight,
            "DUMMY",
            speed
         )
      );
   }
}

animate();

function save() {
   localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
   localStorage.removeItem("bestBrain");
}

function generateCars(N, type, topSpeed) {
   let cars = [];
   let height = carHeight;
   let width = carWidth;
   if (type !== "DUMMY") {
      height = carHeight - 22;
      width = carWidth - 15;
   }
   for (let i = 1; i <= N; i++) {
      cars.push(
         new Car(road.getLaneCenter(1), 100, width, height, type, topSpeed)
      );
   }
   return cars;
}

function animate() {
   for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road.borders, []);
   }

   for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      car.update(road.borders, traffic);
   }

   let minY = -200;
   bestCar = cars.find((c) => {
      minY = Math.min(...cars.map((c) => c.y));
      return c.y == minY;
   });

   carCanvas.height = window.innerHeight;
   networkCanvas.height = window.innerHeight;

   carCtx.save();
   carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

   road.draw(carCtx);

   for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(carCtx);
   }

   carCtx.globalAlpha = 0.2;
   for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      car.draw(carCtx);
   }
   carCtx.globalAlpha = 1;
   bestCar.draw(carCtx);

   carCtx.restore();

   Visualizer.drawNetwork(networkCtx, bestCar.brain);
   requestAnimationFrame(animate);
}
