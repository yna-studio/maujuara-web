import { type Db, Collection, ObjectId, type Sort, type Filter, type Document } from 'mongodb';
import { withDatabase } from './mongodb';

/**
 * Get a collection from the database
 */
export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  return withDatabase(async (db: Db) => {
    return db.collection<T>(name);
  });
}

/**
 * Common database operations
 */
export class DatabaseService {
  /**
   * Find multiple documents
   */
  static async find<T extends Document = Document>(
    collectionName: string,
    filter: Filter<T> = {},
    options: {
      sort?: Sort;
      limit?: number;
      skip?: number;
      projection?: Document;
    } = {}
  ): Promise<T[]> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection<T>(collectionName);
      let cursor = collection.find(filter);
      
      if (options.projection) cursor = cursor.project(options.projection);
      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.skip) cursor = cursor.skip(options.skip);
      if (options.limit) cursor = cursor.limit(options.limit);
      
      return await cursor.toArray();
    });
  }

  /**
   * Find one document
   */
  static async findOne<T extends Document = Document>(
    collectionName: string,
    filter: Filter<T>,
    options: {
      projection?: Document;
    } = {}
  ): Promise<T | null> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection<T>(collectionName);
      return await collection.findOne(filter, options);
    });
  }

  /**
   * Insert one document
   */
  static async insertOne<T extends Document = Document>(
    collectionName: string,
    document: T
  ): Promise<{ insertedId: ObjectId }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection<T>(collectionName);
      const result = await collection.insertOne(document);
      return { insertedId: result.insertedId };
    });
  }

  /**
   * Insert multiple documents
   */
  static async insertMany<T extends Document = Document>(
    collectionName: string,
    documents: T[]
  ): Promise<{ insertedIds: ObjectId[] }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection<T>(collectionName);
      const result = await collection.insertMany(documents);
      return { 
        insertedIds: Object.values(result.insertedIds) as ObjectId[]
      };
    });
  }

  /**
   * Update one document
   */
  static async updateOne(
    collectionName: string,
    filter: Document,
    update: Document,
    options: {
      upsert?: boolean;
    } = {}
  ): Promise<{ matchedCount: number; modifiedCount: number; upsertedId?: ObjectId }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      const result = await collection.updateOne(filter, update, options);
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId || undefined
      };
    });
  }

  /**
   * Update multiple documents
   */
  static async updateMany(
    collectionName: string,
    filter: Document,
    update: Document
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      const result = await collection.updateMany(filter, update);
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      };
    });
  }

  /**
   * Delete one document
   */
  static async deleteOne(
    collectionName: string,
    filter: Document
  ): Promise<{ deletedCount: number }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      const result = await collection.deleteOne(filter);
      return { deletedCount: result.deletedCount };
    });
  }

  /**
   * Delete multiple documents
   */
  static async deleteMany(
    collectionName: string,
    filter: Document
  ): Promise<{ deletedCount: number }> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany(filter);
      return { deletedCount: result.deletedCount };
    });
  }

  /**
   * Count documents
   */
  static async count(
    collectionName: string,
    filter: Document = {}
  ): Promise<number> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      return await collection.countDocuments(filter);
    });
  }

  /**
   * Aggregate documents
   */
  static async aggregate<T = any>(
    collectionName: string,
    pipeline: Document[]
  ): Promise<T[]> {
    return withDatabase(async (db: Db) => {
      const collection = db.collection(collectionName);
      return await collection.aggregate<T>(pipeline).toArray();
    });
  }
}

/**
 * Collection-specific helpers
 */
export const Collections = {
  users: () => getCollection('users'),
  categories: () => getCollection('categories'),
  competitions: () => getCollection('competitions'),
  news: () => getCollection('news'),
  organizers: () => getCollection('organizers'),
  tags: () => getCollection('tags'),
  quota: () => getCollection('quota'),
  stats: () => getCollection('stats')
};
