import type { ObjectId } from 'mongodb';

/**
 * @interface User
 * @description This interface defines the structure of the user document in the database.
 * @property {ObjectId} _id - The unique identifier of the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {Date} createdAt - The date and time the user was created.
 * @property {Date} updatedAt - The date and time the user was last updated.
 */
export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @interface UserResponse
 * @description This interface defines the structure of the user response for the API.
 * @property {ObjectId} _id - The unique identifier of the user.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {Date} createdAt - The date and time the user was created.
 * @property {Date} updatedAt - The date and time the user was last updated.
 */
export type UserResponse = Omit<User, 'password'>;
