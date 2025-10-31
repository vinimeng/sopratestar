import * as THREE from 'three';

export interface VehicleConfig
{
    mass: number;
    chassisSize: { width: number; height: number; length: number };
    wheelRadius: number;
    wheelWidth: number;
    wheelBase: number; // distância entre eixos
    trackWidth: number; // distância entre rodas do mesmo eixo
    maxSpeed: number;
    acceleration: number;
    braking: number;
    steering: number;
}

export interface WheelData
{
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    isFront: boolean;
}

export interface TrackPoint
{
    position: THREE.Vector3;
    width: number;
}

export interface TrackConfig
{
    width: number;
    segments: number;
    barrierHeight: number;
    checkpoints: number;
}
