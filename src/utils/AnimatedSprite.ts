module flappybird {
	export class AnimatedSprite extends egret.Bitmap {
		private $currentFameIndex: number = 0;
		private $frameTextures: egret.Texture[] = [];
		private $isPlaying: boolean;
		private $interval: number;
		public frameRate: number = 1;

		public constructor() {
			super();
		}

		private $nextFrame() {
			this.$currentFameIndex += 1;
			if (this.$currentFameIndex == this.$frameTextures.length) {
				this.$currentFameIndex = 0;
			}
			this.texture = this.$frameTextures[this.$currentFameIndex];
		}

		private $addFrame(texture: egret.Texture) {
			this.$frameTextures.push(texture);
		}

		public addFramesFromSpriteSheet(spriteSheet: egret.SpriteSheet, textureNames: string[]) {
			for (let texName of textureNames) {
				let tex = spriteSheet.getTexture(texName);
				this.$addFrame(tex);
			}
		}

		public play() {
			if (this.$isPlaying || this.$frameTextures.length == 0) {
				return;
			}
			this.$isPlaying = true;
			this.$currentFameIndex = 0;
			this.$interval = setInterval(()=>{
				this.$nextFrame();
			}, 1000/this.frameRate);
		}

		public resume() {
			if (this.$isPlaying || this.$frameTextures.length == 0) {
				return;
			}
			this.$isPlaying = true;
			this.$interval = setInterval(()=>{
				this.$nextFrame();
			}, 1000/this.frameRate);
		}

		public stop() {
			if (!this.$isPlaying) {
				return;
			}
			this.$isPlaying = false;
			clearInterval(this.$interval);
		}
	}
}