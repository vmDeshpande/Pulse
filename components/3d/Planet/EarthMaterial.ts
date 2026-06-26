import * as THREE from "three";
import { textureManager } from "@/lib/textureManager";
import { useSceneStore } from "@/store/useSceneStore";

export function createEarthMaterial(
    sunDirection: [number, number, number],
    time: number
) {

    const textures = textureManager.getTextureSet();

    return new THREE.ShaderMaterial({

        uniforms: {

            tDay: {
                value: textures.day
            },

            tNight: {
                value: textures.night
            },

            tNormal: {
                value: textures.normal
            },

            tSpecular: {
                value: textures.specular
            },

            uSunDirection: {
                value: new THREE.Vector3(...sunDirection).normalize()
            },

            uTime: {
                value: time
            }

        },

        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPos;

            void main(){

                vUv = uv;

                vNormal =
                    normalize(
                        normalMatrix *
                        normal
                    );

                vec4 worldPos =
                    modelMatrix *
                    vec4(position,1.0);

                vWorldPos = worldPos.xyz;

                gl_Position =
                    projectionMatrix *
                    viewMatrix *
                    worldPos;

            }
        `,

        fragmentShader: `
            uniform sampler2D tDay;
            uniform sampler2D tNight;
            uniform sampler2D tSpecular;

            uniform vec3 uSunDirection;

            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPos;

            void main(){

                vec3 normal =
                    normalize(vNormal);

                vec3 lightDir =
                    normalize(uSunDirection);

                vec3 viewDir =
                    normalize(
                        cameraPosition -
                        vWorldPos
                    );

                float dayAmount =
                    smoothstep(
                        -0.15,
                        0.2,
                        dot(
                            normal,
                            lightDir
                        )
                    );

                vec3 day =
                    texture2D(
                        tDay,
                        vUv
                    ).rgb;

                vec3 night =
                    texture2D(
                        tNight,
                        vUv
                    ).rgb;

                vec3 color =
                    mix(
                        night,
                        day,
                        dayAmount
                    );

                gl_FragColor =
                    vec4(
                        color,
                        1.0
                    );

            }
        `,

        side: THREE.FrontSide

    });

}