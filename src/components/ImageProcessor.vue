<template>
  <div class="container mx-auto p-4">
    <h1
      class="text-2xl font-semibold text-center mb-4 text-white bg-opacity-80 bg-gray-800 py-2 rounded-lg shadow-lg"
    >
      文字马赛克处理器
    </h1>
    <input type="file" @change="handleUpload" accept="image/*" />
    <div class="controls flex items-center gap-2 mb-2" >
      <div>
        <span class="text-white">像素块大小：</span>
        <div >
          <input
            v-model="blockSize"
            type="number"
            min="4"
            placeholder="像素块大小"
            style="color: white"
          />
        </div>
      </div>
      <div>
        <span class="text-white">输入文字串：</span>
        <input
          v-model="textPattern"
          placeholder="输入文字模式（如：LOVE）"
          style="color: white"
        />
      </div>
      <button @click="processImage" class="bg-green-600 rounded-lg text-white">生成文字马赛克</button>
      <button
        @click="adjustSize(3)"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
      >
        增大字号
      </button>
      <button
        @click="adjustSize(-3)"
        class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white"
      >
        缩小字号
      </button>
      <button
        @click="copyToClipboard"
        class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white"
        :disabled="!originalImage"
      >复制图片</button>
      <button
        @click="saveImage"
        class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
        :disabled="!originalImage"
      >保存图片</button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      blockSize: 10,
      textPattern: "❤",
      originalImage: null,
      image: null,
      ctx: null,
    };
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");
  },
  methods: {
    async copyToClipboard() {
      try {
        this.$refs.canvas.toBlob(blob => {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('图片已复制到剪贴板');
        });
      } catch (error) {
        alert('复制失败: ' + error.message);
      }
    },
    saveImage() {
      const link = document.createElement('a');
      link.download = 'mosaic-image.png';
      link.href = this.$refs.canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    adjustSize(change) {
      this.blockSize = Math.max(4, this.blockSize + change);
      if (this.originalImage) {
        this.processImage();
      }
    },
    handleUpload(e) {
      const file = e.target.files[0];
      if (file) {
        const img = new Image();
        this.originalImage = new Image();
        img.onload = () => {
          this.resetCanvas();
        };
        img.src = URL.createObjectURL(file);
        this.originalImage.src = URL.createObjectURL(file);
      }
    },
    drawCanvas() {
      if (!this.originalImage) return;

      this.$refs.canvas.width = this.originalImage.width;
      this.$refs.canvas.height = this.originalImage.height;
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
      this.ctx.drawImage(this.originalImage, 0, 0);
    },
    resetCanvas() {
      this.$nextTick(() => {
        this.ctx = this.$refs.canvas.getContext("2d");
        this.$refs.canvas.width = this.originalImage.width;
        this.$refs.canvas.height = this.originalImage.height;
        this.ctx.drawImage(this.originalImage, 0, 0);
      });
    },
    processImage() {
      if (!this.originalImage) return;
      this.drawCanvas();
      const pattern = this.textPattern.split("");
      let patternIndex = 0;

      for (let y = 0; y < this.originalImage.height; y += this.blockSize) {
        for (let x = 0; x < this.originalImage.width; x += this.blockSize) {
          const blockData = this.ctx.getImageData(
            x,
            y,
            this.blockSize,
            this.blockSize
          );
          const avgColor = this.getAverageColor(blockData.data);

          this.ctx.fillStyle = "#000";
          this.ctx.fillRect(x, y, this.blockSize, this.blockSize);

          this.ctx.font = `${Math.round(this.blockSize * 0.95)}px Arial`;
          this.ctx.fillStyle = avgColor;
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            pattern[patternIndex++ % pattern.length],
            x + this.blockSize / 2,
            y + this.blockSize / 2
          );
        }
      }
    },
    getAverageColor(data) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let pixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3] / 255;
        if (alpha > 0) {
          r += data[i] * alpha;
          g += data[i + 1] * alpha;
          b += data[i + 2] * alpha;
          pixelCount++;
        }
      }

      return pixelCount > 0
        ? `rgb(${Math.round(r / pixelCount)},${Math.round(
            g / pixelCount
          )},${Math.round(b / pixelCount)})`
        : "rgb(0,0,0)";
    },
  },
};
</script>

<style lang="scss" scoped>
 @reference "tailwindcss";
.container {
  background: #1a1a1a;
  color: white;
  width: 100%;
  height: 100vh;
  padding: 0;
  overflow: auto;
}
.controls {
  /* width: 100%; */
  max-width: 80%;
  @apply text-white;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

button {
  @apply min-w-[100px] h-14 px-8 rounded-[1.75rem] font-medium text-white;
  width: 200px;
  background-color: #3b82f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 16px -3px rgba(59, 130, 246, 0.4),
      0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: #2563eb;
  }
  &:active {
    transform: scale(0.96);
  }
}

input,
select {
  @apply w-full py-4 px-6 bg-white/5 border-0 rounded-2xl
     focus:ring-4 focus:ring-blue-500/30 focus:border-transparent
    transition-all duration-200;
  backdrop-filter: blur(4px);
  &::placeholder {
    @apply text-gray-400;
  }
}

input[type="range"] {
  @apply h-2 bg-gray-700 rounded-full;
  &::-webkit-slider-thumb {
    @apply w-6 h-6 bg-blue-500 rounded-full border-none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s, box-shadow 0.2s;
    &:active {
      transform: scale(1.15);
      box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.3);
    }
  }
}

input,
select {
  @apply w-full py-3 px-4 bg-gray-800/20 border border-gray-700 rounded-xl
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all duration-200;
  backdrop-filter: blur(4px);
}

input[type="range"] {
  @apply h-2 bg-gray-700 rounded-full;
  &::-webkit-slider-thumb {
    @apply w-6 h-6 bg-blue-500 rounded-full border-none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  }
}

select {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
}

canvas {
  width: auto;
  height: auto;
  margin: 1rem 0;
  transition: transform 0.3s ease;
}

canvas:hover {
  transform: scale(1.02);
}
</style>
