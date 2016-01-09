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
				camera.position.y = 100;
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

				var scene0_ambient = new THREE.AmbientLight( 0x404040 );
				scene0_ambient.name = 'scene0_ambient';
				scene.add( scene0_ambient );

				var scene1_ambient = new THREE.AmbientLight( 0x808080 );
				scene1_ambient.name = 'scene1_ambient';
				scene.add( scene1_ambient );

				var scene0_light = new THREE.SpotLight( 0x4f4f4f, 1.5 );
				scene0_light.position.set( 50, 500, 200 );
				scene0_light.castShadow = true;
				scene0_light.shadowDarkness = 0.8;
				scene0_light.shadowCameraNear = 200;
				scene0_light.shadowCameraFar = camera.far;
				scene0_light.shadowCameraFov = 50;
				scene0_light.shadowBias = -0.00022;
				scene0_light.shadowMapWidth = 2048;
				scene0_light.shadowMapHeight = 2048;
				scene0_light.name = 'scene0_light';
				scene.add( scene0_light );


                var scene1_light = new THREE.SpotLight( 0xffffff, 1.5 );
				scene1_light.position.set( 50, 500, 200 );
				scene1_light.castShadow = true;
				scene1_light.shadowDarkness = 0.5;
				scene1_light.shadowCameraNear = 200;
				scene1_light.shadowCameraFar = camera.far;
				scene1_light.shadowCameraFov = 50;
				scene1_light.shadowBias = -0.00022;
				scene1_light.shadowMapWidth = 2048;
				scene1_light.shadowMapHeight = 2048;
				scene1_light.name = 'scene1_light';
				scene.add( scene1_light );

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

                // material
                var scene1_metal = new THREE.MeshPhongMaterial( 
									{ color: 0x8F8F8F, 
									  specular: 0xAA9999, 
									  shininess: 100, 
									  shading: THREE.FlatShading 
									} )
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

                var scene0_wood = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene0_wood.jpg', function ( image ) {
					scene0_wood.image = image;
					scene0_wood.needsUpdate = true;
				} );

				var scene1_wood = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene1_wood.jpg', function ( image ) {
					scene1_wood.image = image;
					scene1_wood.needsUpdate = true;
				} );

				var scene1_blueCloth = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene1_blueCloth.jpg', function ( image ) {
					scene1_blueCloth.image = image;
					scene1_blueCloth.needsUpdate = true;
				} );

				var scene1_blackCloth = new THREE.Texture();
				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/scene1_blackCloth.jpg', function ( image ) {
					scene1_blackCloth.image = image;
					scene1_blackCloth.needsUpdate = true;
				});

				// model
				//furniture in the first scene
				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/tables/scene0_table0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = scene0_wood;
							}
						}

					} );

                    object.name = 'scene0_table0';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/chairs/scene0_chair0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = scene0_wood;
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

							if(child.name == "top" ){
								child.material.map = scene1_blueCloth;
							}
                            else if(child.name == "back" ){
								child.material.map = scene1_wood;
							}
							else{
								child.material = scene1_metal;
							}
						}
					} );
                    object.name = 'scene1_chair0.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

			    var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/chairs/scene1_chair1.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "back" ){
								child.material.map = scene1_wood;
							}
							else if(child.name == "top"){
								child.material.map = scene1_blueCloth;
							}
							else if(child.name == "legs"){
								child.material = scene1_metal;
							}
						}
					} );

                    object.name = 'scene1_chair1.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/chairs/scene1_chair2.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = scene1_blackCloth;
							}
							else if(child.name == "legs"){
								child.material = scene1_metal;
							}
						}
					} );

                    object.name = 'scene1_chair2.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/tables/scene1_table0.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = scene1_wood;
							}
							else if(child.name == "legs"){
								child.material = scene1_metal;
							}
						}
					} );

                    object.name = 'scene1_table0.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );

			    var loader = new THREE.OBJLoader( manager );
				loader.load( 'obj/tables/scene1_table1.obj', function ( object ) {

					object.traverse( function ( child ) {

						if ( child instanceof THREE.Mesh ) {
							child.castShadow = true;
					        child.receiveShadow = true;

							if(child.name == "top" ){
								child.material.map = scene1_wood;
							}
							else if(child.name == "legs"){
								child.material = scene1_metal;
							}
						}
					} );

                    object.name = 'scene1_table1.obj';
					object.position.y = - 60;
					scene.add( object );

				}, onProgress, onError );


                //background
                var scene0_floor = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).rotateX(-Math.PI / 2).translate(0, -60, 0),
                	new THREE.MeshBasicMaterial( {color: 0x1f1f1f} )
                 );
                scene0_floor.receiveShadow = true;
                scene0_floor.name = 'scene0_floor';
                scene.add( scene0_floor );

                var scene0_wall = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).translate( 0, 0, -500),
                	new THREE.MeshBasicMaterial( {color: 0x1f1f1f} )
                 );
                scene0_wall.receiveShadow = true;
                scene0_wall.name = 'scene0_wall';
                scene.add( scene0_wall );

                var scene1_floor = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).rotateX(-Math.PI / 2).translate(0, -60, 0),
                	new THREE.MeshBasicMaterial( {color: 0xafafaf} )
                 );
                scene1_floor.receiveShadow = true;
                scene1_floor.name = 'scene1_floor';
                scene.add( scene1_floor );

                var scene1_wall = new THREE.Mesh( 
                	new THREE.PlaneGeometry( 10000, 10000 ).translate( 0, 0, -500),
                	new THREE.MeshBasicMaterial( {color: 0xafafaf} )
                 );
                scene1_wall.receiveShadow = true;
                scene1_wall.name = 'scene1_wall';
                scene.add( scene1_wall );
			}

			function animate() {
				requestAnimationFrame( animate );
				render();
			}

			function render() {
				controls.update();
				switchToScene(0);
				renderer.render( scene, camera );
			}

			function switchToScene(sceneNumber){
				scene.children.forEach(function(o){
					if( o.name.indexOf("scene" + sceneNumber) != -1){
						o.visible = true;
					}
					else{
						o.visible = false;
					}
				})
				plane.visible = true;
			}

