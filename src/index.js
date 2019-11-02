import React, { Component } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const HEIGHT = 850;
const style = {
  height: HEIGHT // we can control scene size by setting container dimensions
};

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentDidUpdate(props) {
    if (props.map !== this.props.map) {
      const { map, obstacleChar } = this.props;
      const mapHeight = map.length;

      this.grid = new THREE.GridHelper( HEIGHT, mapHeight );
      this.grid.setColors( 0xffffff, 0xffffff );
      this.grid.geometry.rotateX( Math.PI / 2 );
      this.scene.add( this.grid );
      let i = 0;
      map.forEach(row => {
        for (let j = 0; j < row.length; j++) {
          const c = row[j];
          if (c === obstacleChar) {
            this.drawCell(i, j, mapHeight);
          }
        }
        i = i + 1;
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  // Standard scene setup in Three.js. Check "Creating a scene" manual for more information
  // https://threejs.org/docs/#manual/en/introduction/Creating-a-scene
  sceneSetup = () => {
    // get container dimensions and use them for scene sizing
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.set(0, 0, HEIGHT / 1.5);

    // OrbitControls allow a camera to orbit around the object
    // https://threejs.org/docs/#examples/controls/OrbitControls
    this.controls = new OrbitControls(this.camera, this.el);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.el.appendChild(this.renderer.domElement); // mount using React ref
  };

  drawCell = (x, y, mapHeight) => {
    const squareSize = HEIGHT / mapHeight;
    const offset = squareSize / 2;
    const posX = (y - (mapHeight / 2)) * squareSize + offset;
    const posy = ((mapHeight / 2) - x - 1) * squareSize + offset;
    let geometry = new THREE.PlaneGeometry( squareSize, squareSize, squareSize );
    let material = new THREE.MeshBasicMaterial({
      color: 0x156289,
      side: THREE.DoubleSide
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.plane.position.set(posX, posy, 0);
    this.scene.add(this.plane);
  }

  // Here should come custom code.
  // Code below is taken from Three.js BoxGeometry example
  // https://threejs.org/docs/#api/en/geometries/BoxGeometry
  addCustomSceneObjects = () => {
    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);
  };

  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);

    // The window.requestAnimationFrame() method tells the browser that you wish to perform
    // an animation and requests that the browser call a specified function
    // to update an animation before the next repaint
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  handleWindowResize = () => {
    const width = this.el.clientWidth;
    const height = this.el.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;

    // Note that after making changes to most of camera properties you have to call
    // .updateProjectionMatrix for the changes to take effect.
    this.camera.updateProjectionMatrix();
  };

  render() {
    return <div style={style} ref={ref => (this.el = ref)} />;
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMounted: true,
      file: {},
      parsedFile: [],
    }
  }

  render() {
    const { isMounted = true, file, parsedFile } = this.state;
    return (
      <>
        <button
          onClick={() =>
            this.setState(state => ({ isMounted: !state.isMounted }))
          }
        >
          {isMounted ? "Unmount" : "Mount"}
        </button>
        <button
          onClick={() => {
            var reader = new FileReader();
            reader.onload = (evt) => {
              if(evt.target.readyState != 2) return;
              if(evt.target.error) {
                alert('Error while reading file');
                return;
              }

              const filecontent = evt.target.result;
              const partialGrid = filecontent.split('\n');
              this.setState({ parsedFile: partialGrid });
            };
            reader.readAsText(file);
          }}
        >
          Parse Map
        </button>
        {isMounted && <App map={parsedFile} obstacleChar="T" />}
        {isMounted && (
          <div>
            Scroll to zoom, drag to rotate
            <input
              type='file'
              value={file.file}
              onChange={(e) => {
                this.setState({ file: e.target.files[0] });
              }}
            />

          </div>
        )}
      </>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Container />, rootElement);