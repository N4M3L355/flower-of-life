
let config = {    //this won't stay constant like in original code, but config things are in config

    // The amount of circles around each "center"
    // For the flower of life this is 6, but other values can give interesting shapes too
    nodes: 6,

    // The distance between the circles
    // If set to `null`, will be automatically determined based on screen size
    rads: null,

    // How many levels deep do we keep creating "circles around centers"
    // If set to `null`, will be automatically determined based on screen size
    maxLevel: null,

    // The lower this number, the bigger the circles become when you move down with your mouse
    mouseYDivider: 2,
    //can be "original" or "perlin"
    randomnessSource: "perlin",
    //how much randomness should be used for circle positions and their color.
    amountOfChaosInOrder: 1,

};

let addedCoords;
let rings = [];
let grow = 3;
let colorShiftDirection = 1;
let colorHueOffset = 0;
let radiusOffset = 0;
new p5((sketch) => {

    sketch.setup = () => {

        sketch.colorMode(sketch.HSB);
        sketch.noFill();
        document.addEventListener('dblclick', () => sketch.fullscreen(!sketch.fullscreen()));


        let largestScreenDimension = Math.max(sketch.windowWidth, sketch.windowHeight);

        if (!config.rads) {

            let dividingFactor = largestScreenDimension > 1000?5:3;

            config.rads = Math.round(largestScreenDimension / dividingFactor);

        }

        config.maxLevel = config.maxLevel||Math.min(7,Math.round(largestScreenDimension / config.rads) - 1);

        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        recreateRings();
        config.randomnessSource==="original"&&flipGrowDirection();
        config.randomnessSource==="original"&&colorShiftFlipper();
        moveMouseAutomatically();

    };

    sketch.windowResized = () => {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
        recreateRings();
    };

    sketch.draw = () => {

        sketch.background(0, 0, 0, 0.08);

        rings.map(ring => ring.draw());

    };


    let intensity = 100;

    sketch.mouseWheel = (event) => {

        config.rads = sketch.constrain(config.rads-event.delta,0,500);
        recreateRings()

    };


    function recreateRings() {

        const startX = (sketch.width / 2).toFixed(1);
        const startY = (sketch.height / 2).toFixed(1);
        rings = [];
        addedCoords = [];
        rings.push(new Circle(startX, startY, config.rads));
        addedCoords.push(startX+','+startY);


        function makeRings(x, y, level=0) {

            for(let i = 0; i < config.nodes; i++) {

                let newX = (+x + config.rads / 2 * Math.cos(2 * Math.PI * i / config.nodes));
                let newY = (+y + config.rads / 2 * Math.sin(2 * Math.PI * i / config.nodes));

                let coords = newX.toFixed(1) + ',' + newY.toFixed(1);

                if (addedCoords.indexOf(coords) === -1) {
                    rings.push(new Circle(newX, newY, config.rads));
                    addedCoords.push(coords)
                }

                if (level < config.maxLevel) {
                    makeRings(newX, newY, level + 1)
                }
            }
        }

        makeRings(startX, startY)

    }


    class Circle {

        constructor(x, y, r) {
            this.x = x;
            this.y = y;
            this.r = r;
        }

        draw() {
            let color = sketch.map(sketch.mouseX+colorHueOffset, 0, sketch.width, 360, 720,false)+(sketch.noise(Date.now()/4098+this.x*53/51+this.y*67/23,this.x*41/47,this.y*91/67)-1/2)*128;
            sketch.stroke(color%360, 150, intensity);
            sketch.ellipse(
              +this.x+(sketch.noise(Date.now()/4096+this.x*19/41+this.y*29/47,this.x*19/41,this.y*29/47)-1/2)*64,      //those random primes are to prevent noise coupling
              +this.y+(sketch.noise(Date.now()/4095+this.x*23/43+this.y*31/51,this.x*23/43,this.y*31/51)-1/2)*64,
              Math.abs(radiusOffset+(sketch.noise(Date.now()/4097+this.x*47/61+this.y*17/59,this.x*67/37,this.y*73/47)-1/2)*64+ sketch.mouseY) / config.mouseYDivider);
        }

    }

    sketch.mouseMoved = () =>{
        colorHueOffset = 0;
        radiusOffset = 0;
    };

    function flipGrowDirection() {
        grow = Math.random() < .5;
        setTimeout(flipGrowDirection, sketch.random(400, 1200));
    }

    function colorShiftFlipper() {
        colorShiftDirection = sketch.random([-1, 1]);
        setTimeout(colorShiftFlipper, sketch.random(400, 1200));
    }

    function moveMouseAutomatically() {
        if(config.randomnessSource === "original"){
          radiusOffset += grow?2:-2;
          colorHueOffset += colorShiftDirection * sketch.width / 64;
        }
        else if(config.randomnessSource==="perlin"){
          radiusOffset += (sketch.noise(sketch.frameCount/128,0,0)-1/2)*4;
          colorHueOffset += (sketch.noise(sketch.frameCount/128,0,1)-1/2) * sketch.width / 64;
        }
    }

    setInterval(moveMouseAutomatically,50);

}, "container");
