			var container;

			var camera, scene, controls, renderer, plane;

			var mouse = new THREE.Vector2();
			var offset = new THREE.Vector3();
			var raycaster = new THREE.Raycaster();

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

            var INTERSECTED, SELECTED;

			init();
			animate();

			function init() {
				initCamera();
				initScene();
				initControls();
				initRenderer();
			}

            function initCamera() {
                container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.x = 50;
				camera.position.z = 200;
				camera.position.y = 70;
            }

            function initControls() {
				controls = new THREE.TrackballControls( camera );
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
            }

            function initScene() {
				scene = new THREE.Scene();

				var ambient = new THREE.AmbientLight( 0x101010 );
				scene.add( ambient );

                var light = new THREE.SpotLight( 0xffffff, 1.5 );
				light.position.set( 50, 500, 200 );
				light.castShadow = true;
				light.shadowDarkness = 0.5;

				light.shadowCameraNear = 200;
				light.shadowCameraFar = camera.far;
				light.shadowCameraFov = 50;

				light.shadowBias = -0.00022;

				light.shadowMapWidth = 2048;
				light.shadowMapHeight = 2048;

				scene.add( light );

				plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
					new THREE.MeshBasicMaterial( { visible: false } )
				);
				scene.add( plane );

				loadScene();
            }

            function initRenderer() {
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setClearColor( 0xf0f0f0 );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.sortObjects = false;

				renderer.shadowMap.enabled = true;
				renderer.shadowMap.type = THREE.PCFShadowMap;

				container.appendChild( renderer.domElement );

				renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
				renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
				renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

				window.addEventListener( 'resize', onWindowResize, false );

				function onWindowResize() {
                    camera.aspect = window.innerWidth / window.innerHeight;
				    camera.updateProjectionMatrix();
				    renderer.setSize( window.innerWidth, window.innerHeight );
			    }

			    function onDocumentMouseMove( event ) {
			    	event.preventDefault();
			    	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			    	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				    raycaster.setFromCamera( mouse, camera );
                    if ( SELECTED ) {
					    var intersects = raycaster.intersectObject( plane );
					    var newPosition = intersects[ 0 ].point.sub( offset );
					    if ( intersects.length > 0 ) {
							    SELECTED.parent.children.forEach(function(mesh){
							    mesh.position.copy(newPosition);
						    })
					    }
					    return;
				    }
                    var intersects = raycaster.intersectObjects( scene.children.filter(function(o){
						return o.type == 'Object3D';
					}), true );
				    if ( intersects.length > 0 ) {
					    if ( INTERSECTED != intersects[ 0 ].object ) {
						    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
						    INTERSECTED = intersects[ 0 ].object;
						    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

						    plane.position.copy( INTERSECTED.position );
						    plane.lookAt( camera.position );
                        }

					    container.style.cursor = 'pointer';

				    } else {
					    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					    INTERSECTED = null;
					    container.style.cursor = 'auto';
				    }
			    }

				function onDocumentMouseDown( event ) {
					event.preventDefault();
					raycaster.setFromCamera( mouse, camera );
					var intersects = raycaster.intersectObjects( scene.children.filter(function(o){
						return o.type == 'Object3D';
					}), true );
					if ( intersects.length > 0 ) {
						controls.enabled = false;
						SELECTED = intersects[ 0 ].object;
						var intersects = raycaster.intersectObject( plane );
						if ( intersects.length > 0 ) {
							offset.copy( intersects[ 0 ].point ).sub( plane.position );
						}
						container.style.cursor = 'move';
					}
				}

				function onDocumentMouseUp( event ) {
					event.preventDefault();
					controls.enabled = true;
					if ( INTERSECTED ) {
						plane.position.copy( INTERSECTED.position );
						SELECTED = null;
					}
					container.style.cursor = 'auto';
				}
            }

			function loadScene(){

				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};

                var wood0 = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene0_wood.jpg', function ( image ) {
					wood0.image = image;
					wood0.needsUpdate = true;
				} );

				var blueCloth = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene1_blueCloth.jpg', function ( image ) {
					blueCloth.image = image;
					blueCloth.needsUpdate = true;
				} );


				// model
				//table
				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/tables/scene0_table0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = wood0;
							}
						}

					} );

                    object.name = 'scene0_table0';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

                //chair
				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/chairs/scene0_chair0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = wood0;
							}
						}

					} );

                    object.name = 'scene0_chair0';
					object.position.y = - 60;
					scene.add( object );

					var scene0_chair1 = object.clone();
					scene0_chair1.name = 'scene0_chair1';
					scene0_chair1.children.forEach(function(mesh){
						mesh.translateX(-50);
					});
					scene.add(scene0_chair1);

					var scene0_chair2 = object.clone();
					scene0_chair2.name = 'scene0_chair2';
					scene0_chair2.children.forEach(function(mesh){
						mesh.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI);
					});
					scene.add(scene0_chair2);

					var scene0_chair3 = object.clone();
					scene0_chair3.name = 'scene0_chair3';
					scene0_chair3.children.forEach(function(mesh){
						mesh.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI).translateX(-50);
					});
					scene.add(scene0_chair3);

				}, onProgress, onError );

                // furniture in the second scene
		        var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/chairs/scene1_chair0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "2" ){
								child.material.map = blueCloth;
							}
						}

					} );

                    object.name = 'scene1_chair0.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );


                var floor = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).rotateX(-Math.PI / 2).translate(0, -60, 0),
                	new THREE.MeshBasicMaterial( {color: 0x4f4f4f} )
                 );
                floor.receiveShadow = true;
                scene.add( floor );

                var wall = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).translate( 0, 0, -500),
                	new THREE.MeshBasicMaterial( {color: 0x4f4f4f} )
                 );
                wall.receiveShadow = true;
                scene.add( wall );
			}

			function animate() {
				requestAnimationFrame( animate );
				render();
			}

			function render() {
				controls.update();
				switchToScene(1);
				renderer.render( scene, camera );
			}

			function switchToScene(sceneNumber){
				scene.children.filter(function(o){
					return o.type == 'Object3D';
				}).forEach(function(o){
					if( o.name.indexOf("scene" + sceneNumber) != -1){
						o.visible = true;
					}
					else{
						o.visible = false;
					}
				})
			}

