/**
 * Simple performance profiler for frame metrics
 * Tracks FPS, frame times, and render budget
 */
class PerformanceProfiler {
  private frameCount = 0;
  private lastTime = Date.now();
  private fps = 60;
  private frameTime = 16.67;
  private frameHistory: number[] = [];
  private maxFrameHistory = 120; // 2 seconds at 60 FPS

  tick() {
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.frameTime = deltaTime;
    this.frameHistory.push(deltaTime);

    if (this.frameHistory.length > this.maxFrameHistory) {
      this.frameHistory.shift();
    }

    this.frameCount++;

    // Update FPS every second
    if (this.frameCount % 60 === 0) {
      const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
      this.fps = Math.round(1000 / avgFrameTime);
    }
  }

  getFPS() {
    return this.fps;
  }

  getFrameTime() {
    return this.frameTime;
  }

  getAverageFrameTime() {
    if (this.frameHistory.length === 0) return 0;
    return this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
  }

  isUnderBudget() {
    // 60 FPS target = 16.67ms per frame
    return this.frameTime < 16.67;
  }

  isUnderGoodBudget() {
    // 120 FPS target = 8.33ms per frame
    return this.frameTime < 8.33;
  }

  reset() {
    this.frameHistory = [];
    this.frameCount = 0;
  }
}

export const performanceProfiler = new PerformanceProfiler();
