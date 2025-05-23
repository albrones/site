<script lang="ts">
  // TypeScript block for future logic
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Raycaster, Vector2 } from 'three'; // Added Raycaster and Vector2
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  let canvasElement: HTMLCanvasElement;

  // Props for customizable colors
  export let edgeColor: string = '#888888';
  export let buttonColor: string = '#AAAAAA';

  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let ambientLight: THREE.AmbientLight;
  let directionalLight: THREE.DirectionalLight;
  let controls: OrbitControls;
  let animationFrameId: number;

  // Switch model variables
  let edgeMaterial: THREE.MeshStandardMaterial;
  let buttonMaterial: THREE.MeshStandardMaterial;
  let edgeGeometry: THREE.BoxGeometry;
  let buttonGeometry: THREE.CylinderGeometry;
  let edgeMesh: THREE.Mesh;
  let buttonMesh: THREE.Mesh;
  let switchGroup: THREE.Group;

  // Interaction variables
  let raycaster: THREE.Raycaster;
  let mouse: THREE.Vector2;
  let isSwitchOn: boolean = false;
  const buttonInitialZ = (0.2 / 2) + (0.3 / 2); // 0.25
  const buttonPressedZ = (0.2 / 2) + (0.3 / 5); // 0.1 + 0.06 = 0.16 (deeper press for visibility)

  // Reactive statements to update material colors when props change
  $: {
    if (edgeMaterial && edgeColor) {
      edgeMaterial.color.set(edgeColor);
    }
    if (buttonMaterial && buttonColor) {
      buttonMaterial.color.set(buttonColor);
    }
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  onMount(() => {
    if (!canvasElement) return;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    // Camera
    const aspectRatio = canvasElement.clientWidth / canvasElement.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 3, 5); // Adjusted camera for better view of the switch at origin
    camera.lookAt(scene.position); // Ensure it looks at the origin

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
    // No need to appendChild, as we are using the canvasElement directly

    // Lights
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    // controls.autoRotate = true; // Optional: enable auto-rotation

    // Create Switch Model
    // Materials - Initial colors are set from props due to reactivity,
    // but we can also initialize them with the prop values directly.
    edgeMaterial = new THREE.MeshStandardMaterial({ color: edgeColor, metalness: 0.5, roughness: 0.5 });
    buttonMaterial = new THREE.MeshStandardMaterial({ color: buttonColor, metalness: 0.5, roughness: 0.5 });

    // Geometries
    edgeGeometry = new THREE.BoxGeometry(2, 2, 0.2); // width, height, depth
    buttonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32); // radiusTop, radiusBottom, height, radialSegments

    // Meshes
    edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
    buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);

    // Position button on top of the edge
    buttonMesh.position.z = 0.15 + 0.1; // edge depth/2 + button height/2 (adjust as needed)
                                      // The previous 0.15 was good. Let's make it 0.25 (0.1 from edge + 0.15 from button)
    buttonMesh.position.z = buttonInitialZ; // Use defined constant
    buttonMesh.rotation.x = Math.PI / 2; // Orient cylinder to point up/down along Z for the button

    // Group
    switchGroup = new THREE.Group();
    switchGroup.add(edgeMesh);
    switchGroup.add(buttonMesh);

    scene.add(switchGroup);
    // Ensure switch is at the origin if not specified
    switchGroup.position.set(0, 0, 0);


    // Resize listener
    const handleResize = () => {
      if (canvasElement && camera && renderer) {
        const width = canvasElement.clientWidth;
        const height = canvasElement.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Initialize Raycaster and Mouse
    raycaster = new Raycaster();
    mouse = new Vector2();

    // Click event listener
    const onClick = (event: MouseEvent) => {
      if (!canvasElement || !camera || !buttonMesh) return;

      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      mouse.x = (event.clientX / canvasElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / canvasElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([buttonMesh]); // Check intersection with the button

      if (intersects.length > 0) {
        isSwitchOn = !isSwitchOn;
        console.log('Switch toggled:', isSwitchOn ? 'ON' : 'OFF');

        if (isSwitchOn) {
          buttonMesh.position.z = buttonPressedZ; // Pressed state
        } else {
          buttonMesh.position.z = buttonInitialZ; // Released state
        }
      }
    };
    canvasElement.addEventListener('click', onClick);


    // Start animation
    animate();

    console.log('Three.js scene initialized');

    return () => { // This is Svelte's onMount cleanup, equivalent to part of onDestroy
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('click', onClick); // Remove click listener
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (controls) controls.dispose();
      if (directionalLight) scene.remove(directionalLight); // Lights are added to scene, so remove from scene
      if (ambientLight) scene.remove(ambientLight);
      if (switchGroup) scene.remove(switchGroup); // Remove group from scene

      // Dispose of switch geometries and materials
      if (edgeGeometry) edgeGeometry.dispose();
      if (buttonGeometry) buttonGeometry.dispose();
      if (edgeMaterial) edgeMaterial.dispose();
      if (buttonMaterial) buttonMaterial.dispose();
      // Meshes are disposed when their geometries/materials are, and group is removed.

      if (renderer) renderer.dispose();
      console.log('Three.js scene and switch resources cleaned up from onMount return');
    };
  });

  onDestroy(() => {
    // Additional cleanup if not handled by onMount's return function
    // This ensures cleanup even if onMount's return isn't called (e.g. error during mount)
    console.log('LightSwitch component destroyed');
    // Most cleanup is now in onMount's return function for better Svelte lifecycle management.
    // However, an explicit cancelAnimationFrame here is a good safety net.
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    // Ensure renderer is disposed if it exists
    if (renderer) {
        renderer.dispose();
    }
    // Ensure controls are disposed if they exist
    if (controls) {
        controls.dispose();
    }
  });
</script>

<div class="light-switch-container">
  <canvas bind:this={canvasElement}></canvas>
</div>

<style>
  .light-switch-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
