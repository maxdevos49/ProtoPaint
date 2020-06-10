/**
 * Vector class with its related methods
 * @author Maxwell DeVos
 * @property { number } x The horizontal component of a vector.
 * @property { number } y The Vertical component of a vector.
 */
export class Vector {

    public x: number;

    public y: number;

    /**
     * Constructs a new Vector object using an x and y component
     * @param { number } x The starting x component of the vector
     * @param { number } y The starting y component of the vector
     */
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds a given vector into the current instance
     * @param { Vector } vector
     */
    public add(vector: Vector): void {
        if (!(vector instanceof Vector)) {
            throw new TypeError("Argument must be of type Vector.");
        }

        this.x = this.x + vector.x;
        this.y = this.y + vector.y;
    }

    /**
     * Subtracts a given vector from the current instance
     * @param { Vector } vector
     */
    public sub(vector: Vector): void {
        if (!(vector instanceof Vector)) {
            throw new TypeError("Argument must be of type Vector.");
        }

        this.x = this.x - vector.x;
        this.y = this.y - vector.y;
    }

    /**
     * Subtracts a given vector from another vector
     * @param { Vector } vector1
     * @param { Vector } vector2
     * @throws { TypeError } When an argument is not a vector
     * @returns { Vector } The resultant vector of subtracting two given vectors
     */
    public static sub(vector1: Vector, vector2: Vector): Vector {
        if (!(vector1 instanceof Vector)) {
            throw new TypeError("Argument must be of type Vector.");
        }

        if (!(vector2 instanceof Vector)) {
            throw new TypeError("Argument must be of type Vector.");
        }

        let x = vector1.x - vector2.x;
        let y = vector1.y - vector2.y;

        return new Vector(x, y);
    }

    /**
     * Multiplies a given vector from the current instance
     * @param { number } scalar
     */
    public mult(scalar: number): void {
        if (typeof scalar !== "number") {
            throw new TypeError("Argument must be of type number.");
        }

        this.x = this.x * scalar;
        this.y = this.y * scalar;
    }

    /**
     * Normailze the current vector instance
     */
    public normalize(): void {
        let magnitude = this.getMagnitude();
        this.x = this.x / magnitude;
        this.y = this.y / magnitude;
    }

    /**
     * Gets the current angle of the vector in radians
     * @returns { number } the angle in radians
     */
    public getRadians(): number {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Gets the current angle of the vector in degrees
     * @returns { number } angle in degrees.
     */
    public getDegrees(): number {
        return this.getRadians() * (180 / Math.PI);
    }

    /**
     * Gets the magnitude of the current vector
     * @returns { number } The magnitude of the current vector
     */
    public getMagnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * Sets the magnitude of the current vector
     * @param { number } givenMag the new magnitude of the vector
     */
    public setMagnitude(givenMag: number): void {
        this.normalize();
        this.mult(givenMag)
    }

    /**
     * Limits the size of the magnitude of the vector
     * @param { number } givenLimit 
     */
    public limit(givenLimit: number): void {
        let mag = this.getMagnitude();
        if (mag > givenLimit) {
            this.setMagnitude(givenLimit);
        }
    }

    public toString(): string {
        return `Vector:\n 
X: ${this.x}\n 
Y: ${this.y}\n 
Magnitude: ${this.getMagnitude()}
Degrees: ${this.getDegrees()}\n 
Radians: ${this.getRadians()}\n`;
    }
}
