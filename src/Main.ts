//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

let NUM_PIPES = 4;

let FLOOR_HEIGHT = 50;
let FLOOR_Y;

// 以左边为x 0， 右为x正
// 以地面为y 0， 上位y正
let GRAVITY = 550;
let BIRD_SIZE = 20;
let PIPE_WIDTH = 52;
let PIPE_DISTANCE = 200;
let FIRST_PIPE_X = 600;
let MAX_PIPE_LENGTH = 320;
let UP_DOWN_PIPE_DISTANCE = 120;
let BIRD_POSITION_X = 100;
let BIRD_SPEED_X = 100;
let BIRD_INIT_Y = 300;

let BIRD_LEFT = BIRD_POSITION_X - BIRD_SIZE / 2;
let BIRD_RIGHT = BIRD_POSITION_X + BIRD_SIZE / 2;

let SCREEN_HEIGHT;
let SCREEN_WIDTH;

function flipY(y: number) {
    return FLOOR_Y - y;
}

class GameLogic extends egret.EventDispatcher {
    private pipeSpeed: number;
    private birdPositionY: number;

    private birdSpeedY: number;

    private groundX: number;

    private pipeUpX: number[];
    private pipeUpY: number[]; // 伸出多长
    private pipeScored: boolean[];

    public score: number;

    private event: egret.Event;
    private scoreEvent: egret.Event;
    private gameOverEvent: egret.Event;

    private startTime: number;
    private lastTime: number;
    private deltaTime: number;

    public isGameOver: boolean;

    private updateTime() {
        let currentTime: number = egret.getTimer();
        if (this.lastTime == 0) {
            this.startTime = currentTime;
            this.lastTime = currentTime;
            this.deltaTime = 0.0;
            return;
        }
        this.deltaTime = (currentTime - this.lastTime) / 1000.0;
        this.lastTime = currentTime;
    }

    constructor() {
        super();
        this.event = new egret.Event("GameLogicUpdate");
        this.scoreEvent = new egret.Event("ScoreEvent");
        this.gameOverEvent = new egret.Event("GameOverEvent");
        this.isGameOver = true;
    }

    public newGame() {
        this.pipeSpeed = 30;
        this.birdPositionY = BIRD_INIT_Y;

        this.birdSpeedY = 50;

        this.groundX = 0;

        this.pipeUpX = [];
        this.pipeUpY = []; // 伸出多长
        this.pipeScored = [];
        this.score = 0;

        this.startTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;

        this.isGameOver = false;
        for (let i = 0; i < NUM_PIPES; ++i) {
            this.pipeUpX.push(FIRST_PIPE_X + i * PIPE_DISTANCE);
            this.pipeUpY.push(this.randomLength());
            this.pipeScored.push(false);
        }
    }

    public getScreenBirdY() {
        return flipY(this.birdPositionY);
    }

    public getScreenBirdRotation(): number {
        let t = -Math.atan2(this.birdSpeedY, BIRD_SPEED_X) / Math.PI * 180;
        return t;
    }

    public getPipeX(i: number) {
        return this.pipeUpX[i];
    }

    public getGroundX() {
        return this.groundX;
    }

    public getPipeUpY(i: number) {
        return this.pipeUpY[i] - MAX_PIPE_LENGTH;
    }

    public getPipeDownY(i: number) {
        return this.pipeUpY[i] + UP_DOWN_PIPE_DISTANCE;
    }

    private randomLength() {
        return Math.random() * (MAX_PIPE_LENGTH - 20) + 20;
    }

    private updateBird() {
        this.birdPositionY += this.birdSpeedY * this.deltaTime;
        this.birdSpeedY -= GRAVITY * this.deltaTime;

        if (this.birdPositionY <= 0) {
            this.birdPositionY = 0;
        }
    }

    public onTap() {
        this.birdSpeedY = 280;
    }


    private isCollideWithPipeOrGround(): boolean {
        if (this.birdPositionY <= 0) {
            return true;
        }
        for (let i = 0; i < NUM_PIPES; ++i) {
            if (this.pipeUpX[i] > BIRD_RIGHT) {
                break;
            }
            let pipeLeftX = this.pipeUpX[i] - BIRD_SIZE / 2;
            let pipeRightX = this.pipeUpX[i] + BIRD_SIZE / 2 + PIPE_WIDTH;
            if (BIRD_POSITION_X > pipeLeftX && BIRD_POSITION_X < pipeRightX) {
                let upPipeY = flipY(this.pipeUpY[i] + BIRD_SIZE / 2);
                let downPipY = upPipeY - UP_DOWN_PIPE_DISTANCE + BIRD_SIZE;
                if (this.birdPositionY > upPipeY || this.birdPositionY < downPipY) {
                    // collide with pipe
                    return true;
                }
            }
        }
        return false;
    }

    public onUpdate() {
        if (this.isGameOver) {
            return;
        }
        // TODO update gamelogic
        this.updateTime();

        this.updateBird();

        let distance = BIRD_SPEED_X * this.deltaTime;
        for (let i = 0; i < NUM_PIPES; ++i) {
            this.pipeUpX[i] -= distance;
        }
        for (let i = 0; i < NUM_PIPES; ++i) {
            if (this.pipeUpX[i] + PIPE_WIDTH / 2 < BIRD_POSITION_X) {
                // SCORE
                if (!this.pipeScored[i]) {
                    this.pipeScored[i] = true;
                    this.score += 1;
                    this.dispatchEvent(this.scoreEvent);
                }
            } else {
                break;
            }
        }
        if (this.pipeUpX[0] < -100) {
            this.pipeUpX.shift();
            this.pipeUpX.push(this.pipeUpX[this.pipeUpX.length - 1] + PIPE_DISTANCE);
            this.pipeUpY.shift();
            this.pipeUpY.push(this.randomLength());
            this.pipeScored.shift();
            this.pipeScored.push(false);
        }
        this.groundX -= distance;
        if (this.groundX < -SCREEN_WIDTH) {
            this.groundX += SCREEN_WIDTH;
        }

        if (this.isCollideWithPipeOrGround()) {
            this.dispatchEvent(this.gameOverEvent);
            this.isGameOver = true;
        }
        this.dispatchEvent(this.event);
    }

};
class Main extends egret.DisplayObjectContainer {
    $gameLogic: GameLogic;

    public constructor() {
        super();
        this.$gameLogic = new GameLogic();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        SCREEN_HEIGHT = this.stage.stageHeight;
        SCREEN_WIDTH = this.stage.stageWidth;
        FLOOR_Y = SCREEN_HEIGHT - FLOOR_HEIGHT;
        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private pipeUps: egret.Bitmap[] = [];
    private pipDowns: egret.Bitmap[] = [];
    private bird: flappybird.AnimatedSprite;
    private ground: egret.Bitmap;
    private scoreLabel: egret.BitmapText;

    private updateUi() {
        let bird = this.bird;
        let gameLogic = this.$gameLogic;

        if (gameLogic.isGameOver) {
            bird.stop();
            return;
        }

        bird.x = BIRD_POSITION_X;
        bird.y = gameLogic.getScreenBirdY();
        bird.rotation = gameLogic.getScreenBirdRotation();

        for (let i = 0; i < NUM_PIPES; ++i) {
            this.pipDowns[i].x = this.pipeUps[i].x = gameLogic.getPipeX(i);
            this.pipeUps[i].y = gameLogic.getPipeUpY(i);
            this.pipDowns[i].y = gameLogic.getPipeDownY(i);
        }
        this.ground.x = gameLogic.getGroundX();
        this.scoreLabel.text = "" + gameLogic.score;
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        let sky = this.createBitmapByName("bg_day_png");
        this.addChild(sky);
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        let spriteSheet: egret.SpriteSheet = RES.getRes("flappybird_all_json")

        for (let i = 0; i < NUM_PIPES; ++i) {
            let pipe_up = new egret.Bitmap(spriteSheet.getTexture("pipe_down"));
            let pipe_down = new egret.Bitmap(spriteSheet.getTexture("pipe_up"));
            pipe_up.x = SCREEN_WIDTH * 2;
            pipe_down.x = SCREEN_WIDTH * 2;
            this.addChild(pipe_up);
            this.addChild(pipe_down);
            this.pipeUps.push(pipe_up);
            this.pipDowns.push(pipe_down);
        }

        let ground = new egret.Bitmap(spriteSheet.getTexture("land"));
        ground.y = FLOOR_Y;
        ground.fillMode = egret.BitmapFillMode.REPEAT;
        ground.width *= 2;
        this.ground = ground;
        this.addChild(ground);

        let bird = new flappybird.AnimatedSprite();
        bird.addFramesFromSpriteSheet(spriteSheet, ["bird0_0", "bird0_1", "bird0_2"]);
        this.addChild(bird);
        bird.frameRate = 15;
        this.bird = bird;
        bird.y = flipY(BIRD_INIT_Y);
        bird.x = BIRD_POSITION_X;
        bird.anchorOffsetX = 24;
        bird.anchorOffsetY = 24;
        bird.play();

        let scoreLabel = new egret.BitmapText();
        scoreLabel.font = RES.getRes("score_font_fnt");
        scoreLabel.text = "0";
        scoreLabel.x = SCREEN_WIDTH / 2;
        scoreLabel.y = 80;
        this.addChild(scoreLabel);
        this.scoreLabel = scoreLabel;

        let wingsSound = RES.getRes("wings_mp3");
        let scoreSound = RES.getRes("coin_mp3");
        let gameOverSound = RES.getRes("gameover_mp3");

        let playButton = new egret.Bitmap(spriteSheet.getTexture("button_play"));
        playButton.x = SCREEN_WIDTH / 2;
        playButton.y = SCREEN_HEIGHT - 120;
        playButton.anchorOffsetX = playButton.width / 2;
        playButton.anchorOffsetY = playButton.height / 2;
        playButton.touchEnabled = true;
        playButton.addEventListener(egret.TouchEvent.TOUCH_BEGIN, (e: egret.TouchEvent) => {
            this.$gameLogic.newGame();
            this.removeChild(playButton);
            e.stopPropagation();
        }, this);
        this.addChild(playButton);

        // this.$gameLogic.newGame();
        this.$gameLogic.addEventListener("GameLogicUpdate", this.updateUi, this);
        this.$gameLogic.addEventListener("ScoreEvent", (e: any) => {
            scoreSound.play(0, 1);
        }, this);
        this.$gameLogic.addEventListener("GameOverEvent", (e: any) => {
            gameOverSound.play(0, 1);
            this.addChild(playButton);
        }, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, (e: egret.TouchEvent) => {
            wingsSound.play(0, 1);
            this.$gameLogic.onTap();
        }, this);

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {
                this.$gameLogic.onUpdate();
            }
        });

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        // let parser = new egret.HtmlTextParser();

        // let textflowArr = result.map(text => parser.parse(text));
        // let count = -1;
        // let change = () => {
        //     count++;
        //     if (count >= textflowArr.length) {
        //         count = 0;
        //     }
        //     let textFlow = textflowArr[count];

        //     // 切换描述内容
        //     // Switch to described content
        //     textfield.textFlow = textFlow;
        //     let tw = egret.Tween.get(textfield);
        //     tw.to({ "alpha": 1 }, 200);
        //     tw.wait(2000);
        //     tw.to({ "alpha": 0 }, 200);
        //     tw.call(change, this);
        // };

        // change();
    }
}