
/* =========================================================
   AJIT VISUAL SYNC — TECH PAGE
   CINEMATIC 3D INTRODUCTION
   Three.js | WebGL2 | 16:9 VIDEO FRAME
   Total timeline: 16 seconds
   ========================================================= */


/* =========================================================
   01. IMPORTS AND DOM ELEMENTS
   ========================================================= */

import * as THREE from "three";

const introScene = document.getElementById("introScene");
const canvas = document.getElementById("cosmosCanvas");
const helloScreen = document.getElementById("helloScreen");
const cinematicFlash = document.getElementById("cinematicFlash");

if (!introScene || !canvas || !helloScreen) {
    throw new Error("Tech Page: Required HTML elements are missing.");
}


/* =========================================================
   02. CONFIGURATION
   ========================================================= */

const CONFIG = {
    duration: 16,

    timeline: {
        originStart: 0,
        originEnd: 3,

        journeyStart: 3,
        journeyEnd: 6,

        solarStart: 6,
        solarEnd: 9,

        transformationStart: 9,
        transformationEnd: 12,

        digitalStart: 12,
        digitalEnd: 14.5,

        fadeStart: 14.5,
        fadeEnd: 16
    },

    galaxy: {
        particles: 18000,
        radius: 10.5,
        arms: 5,
        spin: 1.15,
        randomness: 0.75
    },

    stars: {
        count: 4500,
        radius: 95
    },

    transition: {
        particles: 22000,
        digitalRadius: 8
    },

    performance: {
        maxDPR: 1.75,
        mobileDPR: 1.25,
        mobileBreakpoint: 768
    },

    interaction: {
        parallaxStrength: 0.75,
        hoverScale: 1.10,
        hoverGlow: 1.8,
        pointerSmoothing: 0.055
    }
};


/* =========================================================
   03. DEVICE DETECTION
   ========================================================= */

const isMobile = window.matchMedia(
    `(max-width: ${CONFIG.performance.mobileBreakpoint}px)`
).matches;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const particleCount = isMobile
    ? Math.floor(CONFIG.galaxy.particles * 0.65)
    : CONFIG.galaxy.particles;

const transitionCount = isMobile
    ? Math.floor(CONFIG.transition.particles * 0.65)
    : CONFIG.transition.particles;


/* =========================================================
   04. THREE.JS SCENE
   ========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    42,
    16 / 9,
    0.1,
    250
);

camera.position.set(0, 0, 35);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio || 1,
        isMobile
            ? CONFIG.performance.mobileDPR
            : CONFIG.performance.maxDPR
    )
);

renderer.setSize(
    introScene.clientWidth,
    introScene.clientHeight,
    false
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.35;


/* =========================================================
   05. LIGHTING
   ========================================================= */

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.75
);

scene.add(ambientLight);

const mainLight = new THREE.PointLight(
    0xffffff,
    45,
    100
);

mainLight.position.set(-10, 8, 15);

scene.add(mainLight);


/* =========================================================
   06. HELPER FUNCTIONS
   ========================================================= */

const clamp = THREE.MathUtils.clamp;

const lerp = THREE.MathUtils.lerp;

const smoothstep = (a, b, value) => {
    const t = clamp((value - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
};

const easeInOut = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
};

const randomRange = (min, max) => {
    return min + Math.random() * (max - min);
};


/* =========================================================
   07. GLOW TEXTURE
   ========================================================= */

function createGlowTexture() {

    const size = 128;

    const glowCanvas = document.createElement("canvas");

    glowCanvas.width = size;
    glowCanvas.height = size;

    const context = glowCanvas.getContext("2d");

    const gradient = context.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.12, "rgba(200,190,255,0.85)");
    gradient.addColorStop(0.35, "rgba(110,100,255,0.35)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    context.fillStyle = gradient;

    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(glowCanvas);

    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

const glowTexture = createGlowTexture();


/* =========================================================
   08. GALAXY CONTAINER
   ========================================================= */

const galaxyGroup = new THREE.Group();

scene.add(galaxyGroup);


/* =========================================================
   09. SPIRAL GALAXY PARTICLES
   ========================================================= */

function createGalaxy() {

    const positions = new Float32Array(
        particleCount * 3
    );

    const colors = new Float32Array(
        particleCount * 3
    );

    const colorCore = new THREE.Color(0xffd9a0);
    const colorInner = new THREE.Color(0xb9a2ff);
    const colorOuter = new THREE.Color(0x536eff);

    for (let i = 0; i < particleCount; i++) {

        const radius = Math.pow(
            Math.random(),
            0.62
        ) * CONFIG.galaxy.radius;

        const arm = i % CONFIG.galaxy.arms;

        const armAngle =
            arm * (Math.PI * 2 / CONFIG.galaxy.arms);

        const spinAngle =
            radius * CONFIG.galaxy.spin;

        const randomAngle =
            (Math.random() - 0.5) *
            CONFIG.galaxy.randomness *
            (0.5 + radius * 0.1);

        const angle =
            armAngle +
            spinAngle +
            randomAngle;

        const randomRadius =
            (Math.random() - 0.5) *
            CONFIG.galaxy.randomness;

        const x =
            Math.cos(angle) * radius + randomRadius;

        const y =
            Math.sin(angle) * radius + randomRadius;

        const z =
            (Math.random() - 0.5) *
            (0.7 + radius * 0.15);

        const index = i * 3;

        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;

        const blend = clamp(
            radius / CONFIG.galaxy.radius,
            0,
            1
        );

        const color = colorCore.clone().lerp(
            colorInner,
            clamp(blend * 1.8, 0, 1)
        ).lerp(
            colorOuter,
            blend * 0.55
        );

        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
    );

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.075 : 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const galaxyPoints = new THREE.Points(
        geometry,
        material
    );

    galaxyGroup.add(galaxyPoints);

    return {
        group: galaxyGroup,
        points: galaxyPoints,
        material,
        positions
    };
}

const galaxy = createGalaxy();


/* =========================================================
   10. GALACTIC CORE
   ========================================================= */

const coreMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffd6a3,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const galaxyCore = new THREE.Sprite(coreMaterial);

galaxyCore.scale.set(8, 8, 1);

galaxyCore.position.set(0, 0, 0.3);

galaxyGroup.add(galaxyCore);


/* =========================================================
   11. BACKGROUND STAR FIELD
   ========================================================= */

function createStarField() {

    const count = isMobile
        ? 2400
        : CONFIG.stars.count;

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {

        const index = i * 3;

        positions[index] = randomRange(
            -CONFIG.stars.radius,
            CONFIG.stars.radius
        );

        positions[index + 1] = randomRange(
            -CONFIG.stars.radius,
            CONFIG.stars.radius
        );

        positions[index + 2] = randomRange(-90, -5);
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xb9c7ff,
        size: 0.055,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(
        geometry,
        material
    );

    scene.add(stars);

    return {
        object: stars,
        geometry,
        positions
    };
}

const starField = createStarField();


/* =========================================================
   12. PLANET TEXTURE GENERATOR
   ========================================================= */

function createPlanetTexture(type) {

    const textureCanvas = document.createElement("canvas");

    textureCanvas.width = 512;
    textureCanvas.height = 256;

    const context = textureCanvas.getContext("2d");

    const palettes = {
        sun: ["#fff2a5", "#ffb53f", "#ff6a19"],
        mercury: ["#d7c9b8", "#80766d", "#4d4843"],
        venus: ["#f4d6a1", "#c28b55", "#80512e"],
        earth: ["#174a9b", "#32a3c9", "#347b46"],
        mars: ["#d76e42", "#a74429", "#682b21"],
        jupiter: ["#e6c5a0", "#a9764f", "#f0d9bc"],
        saturn: ["#e8d4a6", "#b99b6b", "#806647"],
        uranus: ["#b8eff1", "#72c5d0", "#4b99ae"],
        neptune: ["#4777e8", "#183fba", "#10266f"]
    };

    const palette = palettes[type];

    const gradient = context.createLinearGradient(
        0, 0, 0, 256
    );

    gradient.addColorStop(0, palette[0]);
    gradient.addColorStop(0.5, palette[1]);
    gradient.addColorStop(1, palette[2]);

    context.fillStyle = gradient;

    context.fillRect(0, 0, 512, 256);

    if (type === "earth") {

        for (let i = 0; i < 35; i++) {

            context.fillStyle = "#4b9a53";

            context.globalAlpha = randomRange(0.3, 0.85);

            context.beginPath();

            const x = randomRange(0, 512);
            const y = randomRange(0, 256);

            context.ellipse(
                x,
                y,
                randomRange(8, 35),
                randomRange(4, 16),
                Math.random(),
                0,
                Math.PI * 2
            );

            context.fill();
        }

        context.globalAlpha = 1;
    }

    if (type === "jupiter" || type === "saturn") {

        for (let i = 0; i < 28; i++) {

            context.fillStyle =
                i % 2 === 0
                    ? palette[0]
                    : palette[2];

            context.globalAlpha = 0.28;

            context.fillRect(
                0,
                i * 10,
                512,
                randomRange(3, 9)
            );
        }

        context.globalAlpha = 1;
    }

    if (type === "mars" || type === "mercury") {

        for (let i = 0; i < 120; i++) {

            context.fillStyle = "#211b19";

            context.globalAlpha = randomRange(0.08, 0.28);

            context.beginPath();

            context.arc(
                randomRange(0, 512),
                randomRange(0, 256),
                randomRange(1, 7),
                0,
                Math.PI * 2
            );

            context.fill();
        }

        context.globalAlpha = 1;
    }

    const texture = new THREE.CanvasTexture(textureCanvas);

    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}


/* =========================================================
   13. SOLAR SYSTEM
   ========================================================= */

const solarGroup = new THREE.Group();

scene.add(solarGroup);

const solarMaterials = [];
const interactivePlanets = [];
const solarParticleSources = [];

const planetDefinitions = [
    {
        name: "Sun",
        type: "sun",
        radius: 1.25,
        x: -12.5,
        color: 0xffbd55,
        particleCount: 1800
    },
    {
        name: "Mercury",
        type: "mercury",
        radius: 0.22,
        x: -9.3,
        particleCount: 550
    },
    {
        name: "Venus",
        type: "venus",
        radius: 0.38,
        x: -6.4,
        particleCount: 650
    },
    {
        name: "Earth",
        type: "earth",
        radius: 0.43,
        x: -3.2,
        particleCount: 800
    },
    {
        name: "Mars",
        type: "mars",
        radius: 0.30,
        x: 0,
        particleCount: 650
    },
    {
        name: "Jupiter",
        type: "jupiter",
        radius: 1.05,
        x: 4.0,
        particleCount: 1500
    },
    {
        name: "Saturn",
        type: "saturn",
        radius: 0.88,
        x: 8.0,
        particleCount: 1400
    },
    {
        name: "Uranus",
        type: "uranus",
        radius: 0.62,
        x: 11.0,
        particleCount: 1000
    },
    {
        name: "Neptune",
        type: "neptune",
        radius: 0.60,
        x: 14.0,
        particleCount: 1000
    }
];

const solarStartX = -12.5;
const solarEndX = 14;

const solarCenterX = (solarStartX + solarEndX) / 2;

solarGroup.position.x = -solarCenterX;


/* =========================================================
   14. SOLAR SYSTEM LIGHT
   ========================================================= */

const sunLight = new THREE.PointLight(
    0xffc77a,
    35,
    45
);

sunLight.position.set(-12.5, 0, 1);

solarGroup.add(sunLight);


/* =========================================================
   15. PLANET CREATION
   ========================================================= */

function createPlanet(definition) {

    const geometry = new THREE.SphereGeometry(
        definition.radius,
        isMobile ? 28 : 48,
        isMobile ? 20 : 32
    );

    const texture = createPlanetTexture(
        definition.type
    );

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.02,
        transparent: true,
        opacity: 0
    });

    if (definition.type === "sun") {

        material.emissive = new THREE.Color(0xffa53d);

        material.emissiveIntensity = 1.8;
    }

    const planet = new THREE.Mesh(
        geometry,
        material
    );

    planet.position.set(
        definition.x,
        0,
        0
    );

    planet.userData = {
        name: definition.name,
        originalScale: 1,
        originalEmissive: material.emissiveIntensity || 0
    };

    solarGroup.add(planet);

    solarMaterials.push(material);

    interactivePlanets.push(planet);

    return planet;
}

const planets = [];

planetDefinitions.forEach((definition) => {

    const planet = createPlanet(definition);

    planets.push(planet);

});


/* =========================================================
   16. SATURN RINGS
   ========================================================= */

const saturn = planets.find(
    planet => planet.userData.name === "Saturn"
);

const saturnDefinition = planetDefinitions.find(
    planet => planet.name === "Saturn"
);

const ringGeometry = new THREE.RingGeometry(
    saturnDefinition.radius * 1.25,
    saturnDefinition.radius * 2.0,
    96
);

const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9c39c,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    roughness: 1,
    depthWrite: false
});

const saturnRings = new THREE.Mesh(
    ringGeometry,
    ringMaterial
);

saturnRings.rotation.x = Math.PI / 2.6;

saturn.add(saturnRings);

solarMaterials.push(ringMaterial);


/* =========================================================
   17. ORBITAL LINES
   ========================================================= */

const orbitMaterials = [];

function createOrbitLine(radius, xPosition) {

    const points = [];

    const segments = 128;

    for (let i = 0; i <= segments; i++) {

        const angle = (i / segments) * Math.PI * 2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.35,
                0
            )
        );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(
        points
    );

    const material = new THREE.LineBasicMaterial({
        color: 0x6f82bd,
        transparent: true,
        opacity: 0
    });

    const line = new THREE.Line(
        geometry,
        material
    );

    line.position.x = xPosition;

    solarGroup.add(line);

    orbitMaterials.push(material);
}

planetDefinitions.slice(1).forEach((definition) => {

    createOrbitLine(
        definition.radius * 1.8,
        definition.x
    );

});


/* =========================================================
   18. SOLAR PARTICLE POSITIONS
   ========================================================= */

function createSolarParticlePositions() {

    const result = [];

    for (const definition of planetDefinitions) {

        const count = definition.particleCount;

        const radius = definition.radius;

        for (let i = 0; i < count; i++) {

            const u = Math.random();
            const v = Math.random();

            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);

            const x =
                definition.x +
                radius * Math.sin(phi) * Math.cos(theta);

            const y =
                radius * Math.sin(phi) * Math.sin(theta);

            const z =
                radius * Math.cos(phi);

            result.push(
                x - solarCenterX,
                y,
                z
            );
        }
    }

    return result;
}

const solarParticlePositions = createSolarParticlePositions();


/* =========================================================
   19. TRANSFORMATION PARTICLE SYSTEM
   ========================================================= */

const transitionPositions = new Float32Array(
    transitionCount * 3
);

const transitionColors = new Float32Array(
    transitionCount * 3
);

const transitionStart = new Float32Array(
    transitionCount * 3
);

const transitionTarget = new Float32Array(
    transitionCount * 3
);

const digitalColors = [
    new THREE.Color(0x72aaff),
    new THREE.Color(0x9a7bff),
    new THREE.Color(0x68f0ff),
    new THREE.Color(0xffffff)
];

const galaxySourceCount = Math.floor(
    transitionCount * 0.60
);

const solarSourceCount =
    transitionCount - galaxySourceCount;


/* =========================================================
   20. SAMPLE GALAXY PARTICLE POSITIONS
   ========================================================= */

function sampleGalaxyPosition() {

    const index = Math.floor(
        Math.random() * particleCount
    ) * 3;

    return [
        galaxy.positions[index],
        galaxy.positions[index + 1],
        galaxy.positions[index + 2]
    ];
}


/* =========================================================
   21. CREATE TRANSITION PARTICLES
   ========================================================= */

function createTransitionParticles() {

    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < transitionCount; i++) {

        const index = i * 3;

        let position;

        if (i < galaxySourceCount) {

            position = sampleGalaxyPosition();

        } else {

            const solarIndex = Math.floor(
                Math.random() *
                (solarParticlePositions.length / 3)
            ) * 3;

            position = [
                solarParticlePositions[solarIndex],
                solarParticlePositions[solarIndex + 1],
                solarParticlePositions[solarIndex + 2]
            ];
        }

        transitionStart[index] = position[0];
        transitionStart[index + 1] = position[1];
        transitionStart[index + 2] = position[2];

        transitionPositions[index] = position[0];
        transitionPositions[index + 1] = position[1];
        transitionPositions[index + 2] = position[2];

        const color = new THREE.Color(
            0xaaaaff
        );

        transitionColors[index] = color.r;
        transitionColors[index + 1] = color.g;
        transitionColors[index + 2] = color.b;
    }

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(transitionPositions, 3)
    );

    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(transitionColors, 3)
    );

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.065 : 0.085,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(
        geometry,
        material
    );

    scene.add(points);

    return {
        points,
        geometry,
        material
    };
}

const transitionSystem = createTransitionParticles();


/* =========================================================
   22. DIGITAL UNIVERSE
   ========================================================= */

const digitalGroup = new THREE.Group();

scene.add(digitalGroup);

const digitalNodeCount = isMobile ? 100 : 180;

const digitalNodePositions = [];

const digitalNodeObjects = [];

const digitalNodeMaterials = [];


/* =========================================================
   23. DIGITAL NODE POSITIONS
   ========================================================= */

function createDigitalNodePositions() {

    const positions = [];

    for (let i = 0; i < digitalNodeCount; i++) {

        const y = randomRange(-1, 1);

        const theta = randomRange(0, Math.PI * 2);

        const radius = Math.sqrt(1 - y * y);

        const distance = randomRange(
            4.0,
            CONFIG.transition.digitalRadius
        );

        positions.push(
            new THREE.Vector3(
                Math.cos(theta) * radius * distance,
                y * distance,
                Math.sin(theta) * radius * distance
            )
        );
    }

    return positions;
}

digitalNodePositions.push(
    ...createDigitalNodePositions()
);


/* =========================================================
   24. DIGITAL NODES
   ========================================================= */

function createDigitalNodes() {

    const nodeGeometry = new THREE.SphereGeometry(
        0.075,
        8,
        8
    );

    digitalNodePositions.forEach((position, index) => {

        const material = new THREE.MeshBasicMaterial({
            color: digitalColors[index % digitalColors.length],
            transparent: true,
            opacity: 0
        });

        const node = new THREE.Mesh(
            nodeGeometry,
            material
        );

        node.position.copy(position);

        node.userData = {
            name: "Digital Node",
            originalScale: 1
        };

        digitalGroup.add(node);

        digitalNodeObjects.push(node);

        digitalNodeMaterials.push(material);
    });
}

createDigitalNodes();


/* =========================================================
   25. DIGITAL CONNECTIONS
   ========================================================= */

function createDigitalConnections() {

    const positions = [];

    for (let i = 0; i < digitalNodePositions.length; i++) {

        const current = digitalNodePositions[i];

        const candidates = [];

        for (let j = 0; j < digitalNodePositions.length; j++) {

            if (i === j) continue;

            const distance = current.distanceTo(
                digitalNodePositions[j]
            );

            if (distance < 4.2) {

                candidates.push({
                    index: j,
                    distance
                });
            }
        }

        candidates.sort(
            (a, b) => a.distance - b.distance
        );

        candidates.slice(0, 3).forEach((candidate) => {

            if (candidate.index > i) {

                const other = digitalNodePositions[
                    candidate.index
                ];

                positions.push(
                    current.x,
                    current.y,
                    current.z,
                    other.x,
                    other.y,
                    other.z
                );
            }
        });
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const material = new THREE.LineBasicMaterial({
        color: 0x668cff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });

    const lines = new THREE.LineSegments(
        geometry,
        material
    );

    digitalGroup.add(lines);

    return {
        object: lines,
        material
    };
}

const digitalConnections = createDigitalConnections();


/* =========================================================
   26. DIGITAL TARGET PARTICLE POSITIONS
   ========================================================= */

function createDigitalTargets() {

    for (let i = 0; i < transitionCount; i++) {

        const index = i * 3;

        const node = digitalNodePositions[
            Math.floor(
                Math.random() * digitalNodePositions.length
            )
        ];

        const spread = randomRange(0.5, 2.2);

        transitionTarget[index] =
            node.x + randomRange(-spread, spread);

        transitionTarget[index + 1] =
            node.y + randomRange(-spread, spread);

        transitionTarget[index + 2] =
            node.z + randomRange(-spread, spread);

        const color = digitalColors[
            Math.floor(Math.random() * digitalColors.length)
        ];

        transitionColors[index] = color.r;
        transitionColors[index + 1] = color.g;
        transitionColors[index + 2] = color.b;
    }

    transitionSystem.geometry.attributes.color.needsUpdate = true;
}

createDigitalTargets();


/* =========================================================
   27. PARTICLE MORPHING
   ========================================================= */

function updateParticleMorph(progress) {

    const eased = easeInOut(progress);

    const positions =
        transitionSystem.geometry.attributes.position.array;

    for (let i = 0; i < transitionCount; i++) {

        const index = i * 3;

        const startX = transitionStart[index];
        const startY = transitionStart[index + 1];
        const startZ = transitionStart[index + 2];

        const targetX = transitionTarget[index];
        const targetY = transitionTarget[index + 1];
        const targetZ = transitionTarget[index + 2];

        positions[index] = lerp(
            startX,
            targetX,
            eased
        );

        positions[index + 1] = lerp(
            startY,
            targetY,
            eased
        );

        positions[index + 2] = lerp(
            startZ,
            targetZ,
            eased
        );
    }

    transitionSystem.geometry.attributes.position.needsUpdate = true;
}


/* =========================================================
   28. TRANSFORMATION PARTICLE START
   ========================================================= */

function prepareTransformation() {

    transitionStart.set(transitionPositions);

    transitionSystem.material.opacity = 0;

    createDigitalTargets();
}


/* =========================================================
   29. POINTER INTERACTION
   ========================================================= */

const pointer = {
    x: 0,
    y: 0,

    targetX: 0,
    targetY: 0,

    active: false,

    tapped: false
};

const raycaster = new THREE.Raycaster();

raycaster.params.Points.threshold = 0.25;

const pointerNDC = new THREE.Vector2();

let hoveredObject = null;

let hoverPulse = 0;


/* =========================================================
   30. POINTER POSITION
   ========================================================= */

function updatePointerCoordinates(event) {

    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;

    const y = (event.clientY - rect.top) / rect.height;

    pointer.targetX = (x - 0.5) * 2;

    pointer.targetY = -(y - 0.5) * 2;

    pointerNDC.set(
        pointer.targetX,
        pointer.targetY
    );

    pointer.active = true;
}


/* =========================================================
   31. HOVER DETECTION
   ========================================================= */

function updateHover() {

    raycaster.setFromCamera(
        pointerNDC,
        camera
    );

    const intersections = raycaster.intersectObjects(
        [...interactivePlanets, ...digitalNodeObjects],
        false
    );

    const nextHovered = intersections.length
        ? intersections[0].object
        : null;

    if (hoveredObject && hoveredObject !== nextHovered) {

        hoveredObject.scale.setScalar(1);

        if (hoveredObject.material?.emissive) {

            hoveredObject.material.emissiveIntensity =
                hoveredObject.userData.originalEmissive || 0;
        }
    }

    if (nextHovered) {

        nextHovered.scale.setScalar(
            CONFIG.interaction.hoverScale
        );

        if (nextHovered.material?.emissive) {

            nextHovered.material.emissiveIntensity =
                CONFIG.interaction.hoverGlow;
        }

        canvas.style.cursor = "pointer";

    } else {

        canvas.style.cursor = "default";
    }

    hoveredObject = nextHovered;
}


/* =========================================================
   32. POINTER EVENTS
   ========================================================= */

canvas.addEventListener(
    "pointermove",
    (event) => {

        updatePointerCoordinates(event);

        if (event.pointerType === "mouse") {

            updateHover();
        }
    },
    { passive: true }
);


canvas.addEventListener(
    "pointerleave",
    () => {

        pointer.active = false;

        pointer.targetX = 0;
        pointer.targetY = 0;

        if (hoveredObject) {

            hoveredObject.scale.setScalar(1);

            hoveredObject = null;
        }

        canvas.style.cursor = "default";
    }
);


canvas.addEventListener(
    "pointerdown",
    (event) => {

        updatePointerCoordinates(event);

        pointer.tapped = true;

        hoverPulse = 1;

        if (event.pointerType === "touch") {

            updateHover();
        }
    },
    { passive: true }
);


canvas.addEventListener(
    "pointerup",
    () => {

        pointer.tapped = false;
    }
);


/* =========================================================
   33. CAMERA PARALLAX
   ========================================================= */

const baseCameraPosition = new THREE.Vector3(
    0,
    0,
    35
);

function updateCameraParallax() {

    pointer.x = lerp(
        pointer.x,
        pointer.targetX,
        CONFIG.interaction.pointerSmoothing
    );

    pointer.y = lerp(
        pointer.y,
        pointer.targetY,
        CONFIG.interaction.pointerSmoothing
    );

    const strength = CONFIG.interaction.parallaxStrength;

    camera.position.x =
        baseCameraPosition.x + pointer.x * strength;

    camera.position.y =
        baseCameraPosition.y + pointer.y * strength;

    camera.lookAt(0, 0, 0);
}


/* =========================================================
   34. CAMERA TIMELINE
   ========================================================= */

function updateCameraTimeline(time) {

    let cameraZ = 35;

    let cameraX = 0;

    let cameraY = 0;

    if (time >= 3 && time <= 6) {

        const progress = smoothstep(3, 6, time);

        cameraZ = lerp(
            35,
            15,
            progress
        );

        cameraX = lerp(
            0,
            1.5,
            progress
        );

    } else if (time > 6 && time <= 9) {

        const progress = smoothstep(6, 9, time);

        cameraZ = lerp(
            15,
            35,
            progress
        );

        cameraX = lerp(
            1.5,
            0,
            progress
        );

    } else if (time > 9) {

        cameraZ = 35;
    }

    baseCameraPosition.set(
        cameraX,
        cameraY,
        cameraZ
    );
}


/* =========================================================
   35. GALAXY ANIMATION
   ========================================================= */

function updateGalaxy(time) {

    const reveal = 1 - smoothstep(14.5, 16, time);

    galaxy.group.rotation.z =
        time * 0.025;

    galaxyCore.material.opacity = reveal;

    galaxy.material.opacity = reveal;

    if (time >= 3 && time <= 6) {

        galaxy.group.scale.setScalar(
            lerp(
                1,
                1.45,
                smoothstep(3, 6, time)
            )
        );

    } else if (time > 6) {

        galaxy.group.scale.setScalar(
            lerp(
                1.45,
                1,
                smoothstep(6, 9, time)
            )
        );
    }

    if (time >= 9) {

        galaxy.material.opacity =
            1 - smoothstep(9, 12, time);
    }
}


/* =========================================================
   36. BACKGROUND STAR MOTION
   ========================================================= */

function updateStarField(time, delta) {

    const positions = starField.positions;

    const speed = time >= 3 && time <= 6
        ? 28
        : 0.8;

    for (let i = 0; i < positions.length; i += 3) {

        positions[i + 2] += speed * delta;

        if (positions[i + 2] > 8) {

            positions[i] = randomRange(-95, 95);

            positions[i + 1] = randomRange(-95, 95);

            positions[i + 2] = -90;
        }
    }

    starField.geometry.attributes.position.needsUpdate = true;

    starField.object.material.opacity =
        time >= 14.5
            ? 1 - smoothstep(14.5, 16, time)
            : 0.8;
}


/* =========================================================
   37. SOLAR SYSTEM TIMELINE
   ========================================================= */

function updateSolarSystem(time) {

    const reveal = smoothstep(6, 6.8, time);

    const fade = 1 - smoothstep(9, 11.5, time);

    const opacity = reveal * fade;

    solarGroup.visible = time >= 5.8 && time < 12;

    solarGroup.scale.setScalar(
        lerp(
            0.92,
            1,
            reveal
        )
    );

    solarMaterials.forEach((material) => {

        material.opacity = opacity;
    });

    orbitMaterials.forEach((material) => {

        material.opacity = opacity * 0.35;
    });

    planets.forEach((planet, index) => {

        planet.rotation.y +=
            0.002 + index * 0.0003;

        planet.rotation.x += 0.0005;

        if (planet.userData.name === "Saturn") {

            saturnRings.rotation.z += 0.0005;
        }
    });

    sunLight.intensity = 35 * opacity;
}


/* =========================================================
   38. DIGITAL UNIVERSE TIMELINE
   ========================================================= */

function updateDigitalUniverse(time) {

    const reveal = smoothstep(10.8, 12.5, time);

    const fade = 1 - smoothstep(14.5, 16, time);

    const opacity = reveal * fade;

    digitalGroup.visible = time >= 10.8 && time < 16;

    digitalNodeMaterials.forEach((material) => {

        material.opacity = opacity;
    });

    digitalConnections.material.opacity =
        opacity * 0.55;

    digitalGroup.rotation.y += 0.0015;

    digitalGroup.rotation.x =
        Math.sin(time * 0.3) * 0.04;
}


/* =========================================================
   39. TRANSFORMATION TIMELINE
   ========================================================= */

function updateTransformation(time) {

    if (time < 9) {

        transitionSystem.material.opacity = 0;

        return;
    }

    const progress = smoothstep(
        9,
        12,
        time
    );

    transitionSystem.material.opacity =
        smoothstep(9, 9.5, time) *
        (1 - smoothstep(14.5, 16, time));

    updateParticleMorph(progress);
}


/* =========================================================
   40. INTERACTION RESPONSE
   ========================================================= */

function updateInteraction() {

    hoverPulse = lerp(
        hoverPulse,
        0,
        0.08
    );

    if (hoverPulse > 0.01) {

        galaxyCore.scale.setScalar(
            1 + hoverPulse * 0.12
        );
    }

    const activeTime = pointer.active ? 1 : 0;

    galaxyGroup.rotation.x = lerp(
        galaxyGroup.rotation.x,
        pointer.y * 0.045 * activeTime,
        0.04
    );

    galaxyGroup.rotation.y = lerp(
        galaxyGroup.rotation.y,
        pointer.x * 0.045 * activeTime,
        0.04
    );
}


/* =========================================================
   41. CINEMATIC FLASH CONTROL
   ========================================================= */

function updateFlash(time) {

    cinematicFlash.style.opacity = "0";

    cinematicFlash.style.visibility = "hidden";
}


/* =========================================================
   42. INTRO COMPLETION
   ========================================================= */

let introFinished = false;

function finishIntro() {

    if (introFinished) return;

    introFinished = true;

    renderer.setAnimationLoop(null);

    introScene.hidden = true;

    helloScreen.hidden = false;

    helloScreen.style.display = "flex";
}


/* =========================================================
   43. MASTER TIMELINE
   ========================================================= */

function updateTimeline(time, delta) {

    updateCameraTimeline(time);

    updateCameraParallax();

    updateGalaxy(time);

    updateStarField(time, delta);

    updateSolarSystem(time);

    updateTransformation(time);

    updateDigitalUniverse(time);

    updateInteraction();

    updateFlash(time);

    if (time >= CONFIG.duration) {

        finishIntro();
    }
}


/* =========================================================
   44. RESIZE HANDLER
   ========================================================= */

function handleResize() {

    if (introFinished) return;

    const width = introScene.clientWidth;

    const height = introScene.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            isMobile
                ? CONFIG.performance.mobileDPR
                : CONFIG.performance.maxDPR
        )
    );

    renderer.setSize(
        width,
        height,
        false
    );
}

const resizeObserver = new ResizeObserver(
    handleResize
);

resizeObserver.observe(introScene);

window.addEventListener(
    "orientationchange",
    handleResize
);


/* =========================================================
   45. REDUCED MOTION
   ========================================================= */

if (reducedMotion) {

    introScene.hidden = true;

    helloScreen.hidden = false;

    helloScreen.style.display = "flex";

    renderer.dispose();

    resizeObserver.disconnect();

} else {


    /* =====================================================
       46. START MASTER ANIMATION
       ===================================================== */

    let startTime = null;

    let previousTime = 0;

    renderer.setAnimationLoop((timestamp) => {

        if (startTime === null) {

            startTime = timestamp;
        }

        const elapsed = Math.min(
            (timestamp - startTime) / 1000,
            CONFIG.duration
        );

        const delta = Math.min(
            (elapsed - previousTime),
            0.05
        );

        previousTime = elapsed;

        updateTimeline(
            elapsed,
            delta
        );

        renderer.render(
            scene,
            camera
        );
    });
}


/* =========================================================
   47. CLEANUP
   ========================================================= */

function cleanup() {

    renderer.setAnimationLoop(null);

    resizeObserver.disconnect();

    window.removeEventListener(
        "orientationchange",
        handleResize
    );

    canvas.removeEventListener(
        "pointermove",
        updatePointerCoordinates
    );

    scene.traverse((object) => {

        if (object.geometry) {

            object.geometry.dispose();
        }

        if (object.material) {

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach((material) => {

                material.dispose();
            });
        }
    });

    glowTexture.dispose();

    renderer.dispose();
}

window.addEventListener(
    "pagehide",
    cleanup,
    { once: true }
);


/* =========================================================
   END OF TECH PAGE JAVASCRIPT
   ========================================================= */
