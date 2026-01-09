/**
 * Image Loader
 *
 * Handles asynchronous loading of game images/sprites.
 *
 * Migrated from imageRepository in Game.js with improvements:
 * - Class-based with proper encapsulation
 * - Type-safe image repository
 * - Progress tracking
 * - Error handling
 * - No global dependencies
 */

import type {
  ImageRepository,
  ImageLoaderConfig,
  IImageLoader,
} from '../types/game.types';

/**
 * ImageLoader class
 *
 * Loads game images and provides access to the repository.
 */
export class ImageLoader implements IImageLoader {
  // Public readonly properties
  public get images(): Partial<ImageRepository> {
    return this.#images;
  }

  public get loaded(): boolean {
    return this.#loadedCount === this.#totalCount;
  }

  public get loadedCount(): number {
    return this.#loadedCount;
  }

  public get totalCount(): number {
    return this.#totalCount;
  }

  // Private state
  #images: Partial<ImageRepository> = {};
  #loadedCount: number = 0;
  #totalCount: number = 0;
  #onComplete: () => void;

  /**
   * Create a new image loader
   *
   * Immediately begins loading images.
   *
   * @param config - Configuration with image paths and completion callback
   */
  constructor(config: ImageLoaderConfig) {
    this.#onComplete = config.onComplete;

    // Count total images
    this.#totalCount = Object.keys(config.images).length;

    // Start loading images
    for (const [key, src] of Object.entries(config.images)) {
      this.#loadImage(key, src);
    }
  }

  /**
   * Load a single image
   *
   * @param key - Image key in repository
   * @param src - Image source path
   */
  #loadImage(key: string, src: string): void {
    const image = new Image();
    image.src = src;

    image.onload = () => {
      this.#handleImageLoaded();
    };

    image.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      this.#handleImageLoaded(); // Count as loaded to prevent blocking
    };

    // Store image in repository
    (this.#images as Record<string, HTMLImageElement>)[key] = image;
  }

  /**
   * Handle image load completion
   *
   * Increments loaded count and triggers callback if all images loaded.
   */
  #handleImageLoaded(): void {
    this.#loadedCount++;

    if (this.#loadedCount === this.#totalCount) {
      this.#onComplete();
    }
  }
}

/**
 * Create a new image loader
 *
 * Factory function for convenient instantiation.
 *
 * @param config - Configuration with image paths and completion callback
 * @returns New ImageLoader instance
 */
export function createImageLoader(config: ImageLoaderConfig): IImageLoader {
  return new ImageLoader(config);
}
