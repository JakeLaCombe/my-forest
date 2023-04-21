import { AdditiveBlending, AmbientLight, BoxGeometry, BufferGeometry, CircleGeometry, Event, Float32BufferAttribute, Line, LineBasicMaterial, Matrix4, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Quaternion, Raycaster, RingGeometry, Scene, Vector3, WebGLRenderer, XRTargetRaySpace } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Forest from  './blender/forest.glb'

export class GameScene {
    private geometry: BoxGeometry;
    private camera: PerspectiveCamera;
    private scene: Scene;
    private material: MeshBasicMaterial;
    private cube: Mesh;
    private renderer: WebGLRenderer;
    private forestModel: GLTF | null = null;
    private controller1: XRTargetRaySpace;
    private controller2: XRTargetRaySpace;
    private tempMatrix: Matrix4 = new Matrix4();
    private raycaster: Raycaster = new Raycaster();
    private INTERSECTION: Vector3 | undefined;
    private baseReferenceSpace: XRReferenceSpace | undefined;
    private floor: Object3D | undefined;
    private marker: Mesh;

    constructor(canvas: HTMLCanvasElement)
    {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.renderer = new WebGLRenderer({ canvas });
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.geometry = new BoxGeometry( 1, 1, 1 );
        this.material = new MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new Mesh( this.geometry, this.material );
        this.scene.add( this.cube );

        const loader = new GLTFLoader();
        console.log("Forest");
        console.log(Forest)
        loader.load(Forest, ( gltf: GLTF ) => {

            this.scene.add( gltf.scene );
            this.forestModel = gltf;
            this.floor = gltf.scene.getObjectByName("Ground");
    
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

            //this.renderer.xr.setReferenceSpace(gltf.scene.getObjectByName("Ground").)
        })

        this.marker = new Mesh(
            new CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
            new MeshBasicMaterial( { color: 0x808080 } )
        );
        this.scene.add( this.marker );


        this.camera.position.z = 5;

        const light = new AmbientLight( 0x404040, 5 ); // soft white light
        this.scene.add( light );

        this.renderer.xr.enabled = true;
        
        if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
            document.body.appendChild( VRButton.createButton( this.renderer ) );
        }

        this.controller1 = this.renderer.xr.getController( 0 );
        this.controller1.name = "VR Controller 1";
        this.controller1.addEventListener( 'selectstart', this.onSelectStart.bind(this) );
        this.controller1.addEventListener( 'selectend', this.onSelectEnd.bind(this) );
        this.controller1.addEventListener( 'connected', ( event: Event & {target: XRTargetRaySpace} & {data? : XRInputSource}) => {
            if (event.data) {
                let pointer = this.buildController(event.data);

                if (pointer) {
                    this.controller1.add(pointer)
                }
            }
        } );
        
        this.controller1.addEventListener( 'disconnected', () => {
            this.controller1.remove( this.controller1.children[ 0 ] );
        } );
        this.scene.add( this.controller1 );

       
        this.controller2 = this.renderer.xr.getController( 1 );
        this.controller2.name = "VR Controller 2";
        this.controller2.addEventListener( 'selectstart', this.onSelectStart.bind(this) );
        this.controller2.addEventListener( 'selectend', this.onSelectEnd.bind(this) );
        this.controller2.addEventListener( 'connected', ( event: Event & {target: XRTargetRaySpace} & {data? : XRInputSource}) => {
            if (event.data) {
                let pointer = this.buildController(event.data);

                if (pointer) {
                    this.controller2.add(pointer)
                }
            }
        } );
        
        this.controller2.addEventListener( 'disconnected', () => {
            this.controller2.remove( this.controller2.children[ 0 ] );
        } );
        this.scene.add( this.controller2 );


        const controllerModelFactory = new XRControllerModelFactory();

        let controllerGrip1 = this.renderer.xr.getControllerGrip( 0 );
        controllerGrip1.add(controllerModelFactory.createControllerModel( controllerGrip1 ) );
        this.scene.add( controllerGrip1 );

        let controllerGrip2 = this.renderer.xr.getControllerGrip( 1 );
        controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
        this.scene.add( controllerGrip2 );

        //this.renderer.xr.setReferenceSpaceType('bounded-floor');
        this.renderer.xr.addEventListener('sessionstart', () => {
            this.baseReferenceSpace = this.renderer.xr.getReferenceSpace() || undefined;
        });

        console.log(this.controller2);
    }

    buildController( data: XRInputSource ) {
        let geometry, material;

        switch ( data.targetRayMode ) {
            case 'tracked-pointer':
                geometry = new BufferGeometry();
                geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
                geometry.setAttribute( 'color', new Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
                material = new LineBasicMaterial( { vertexColors: true, blending: AdditiveBlending } );
                return new Line( geometry, material );
            case 'gaze':
                geometry = new RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
                material = new MeshBasicMaterial( { opacity: 0.5, transparent: true } );
                return new Mesh( geometry, material );
        }

    }

    onSelectStart(event: Event & {target: XRTargetRaySpace} & {data? : XRInputSource}) {
        event.target.userData.isSelecting = true;
    }

    onSelectEnd(event: Event & {target: XRTargetRaySpace} & {data? : XRInputSource}) {
        event.target.userData.isSelecting = false;

        console.log("Done Selecting");
        console.log(this.INTERSECTION);

        if ( this.INTERSECTION ) {

            const offsetPosition = { x: - this.INTERSECTION.x, y: - this.INTERSECTION.y, z: - this.INTERSECTION.z, w: 1 };
            const offsetRotation = new Quaternion();
            const transform = new XRRigidTransform( offsetPosition, offsetRotation );
            console.log(this.baseReferenceSpace)
            const teleportSpaceOffset = this.baseReferenceSpace?.getOffsetReferenceSpace( transform );

            if (teleportSpaceOffset)
            {
                console.log("Moving");
                this.renderer.xr.setReferenceSpace( teleportSpaceOffset );
            }
        }
    }

    startAnimation()
    {
        this.renderer.setAnimationLoop(this.animate.bind(this))
    }

    animate() {
	    this.cube.rotation.x += 0.01;
	    this.cube.rotation.y += 0.01;

        this.INTERSECTION = undefined;

        if ( this.controller1.userData.isSelecting === true ) {

            this.tempMatrix.identity().extractRotation( this.controller1.matrixWorld );

            this.raycaster.ray.origin.setFromMatrixPosition( this.controller1.matrixWorld );
            this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );

            const intersects = this.raycaster.intersectObjects( [ this.floor! ] );

            if ( intersects.length > 0 ) {
                this.INTERSECTION = intersects[ 0 ].point;
            }

        } else if ( this.controller2.userData.isSelecting === true ) {

            this.tempMatrix.identity().extractRotation( this.controller2.matrixWorld );

            this.raycaster.ray.origin.setFromMatrixPosition( this.controller2.matrixWorld );
            this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );

            const intersects = this.raycaster.intersectObjects( [ this.floor! ] );

            if ( intersects.length > 0 ) {

                this.INTERSECTION = intersects[ 0 ].point;

            }

        }

        if ( this.INTERSECTION ) this.marker.position.copy( this.INTERSECTION );

        this.marker.visible = this.INTERSECTION !== undefined;


	    this.renderer.render( this.scene, this.camera );
    }
}



//animate();