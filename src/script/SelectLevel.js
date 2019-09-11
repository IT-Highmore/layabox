import GameUI from "./GameUI";
 /**
 * 关卡界面选择
 */
export default class SelectLevel extends Laya.Scene {
    constructor() { super();
    //设置单例的引用方式，方便其他类引用
    SelectLevel.instance = this;
    this.mLastMouseX = 0;
    this.mLastMouseY = 0;
    this.mX = 0;
    this.mY = 0;
    }
    onEnable() {
    }

    onUpdate() {
        console.log(1)
    }

    select() {
        console.log(GameUI.instance.currentLevel)
        Laya.Scene.open("test/level.scene");
        console.log(22)
        // this.levelScene = new Laya.Sprite();
        // Laya.stage.addChild(this.levelScene);
        //this.levelScene.createMap("comp/level.jpg", new Laya.Rectangle(0, 0, Laya.Browser.width, Laya.Browser.height), new Laya.Handler(this, null));
        // this.levelScene.loadImage("comp/level.jpg");
        // this.levelScene.pos(0,-100);
        // Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onStartDrag);
        // Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onStopDrag);
        // this.initLevel();
    }

    initLevel() {
        const level1 = new Laya.Sprite();
        this.levelScene.addChild(level1);
        level1.loadImage("comp/unlock.png");
        level1.pos(100,1050);

        const pass1 = new Laya.Sprite();
        level1.addChild(pass1);
        pass1.loadImage("comp/pass1.png");
        pass1.pos(30,10);

        const level2 = new Laya.Sprite();
        this.levelScene.addChild(level2);
        level2.loadImage("comp/unlock.png");
        level2.pos(140,640);
        const curr = new Laya.Sprite();
        this.levelScene.addChild(curr);
        curr.loadImage("comp/curr.png");
        curr.pos(140,640);

        const pass2 = new Laya.Sprite();
        level2.addChild(pass2);
        pass2.loadImage("comp/pass2.png");
        pass2.pos(20,10);
        const curr2 = new Laya.Sprite();
        curr.addChild(curr2);
        curr2.loadImage("comp/curr2.png");
        curr2.pos(30,10);
    }

    onStartDrag(e) {
        this.drag = true;
        this.mLastMouseX = Laya.stage.mouseX;
        this.mLastMouseY = Laya.stage.mouseY;
        // console.log('drag',this.mLastMouseX,this.mLastMouseY)
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }

    onStopDrag() {
        this.drag = false;
        this.mX -= Laya.stage.mouseX - this.mLastMouseX;
		this.mY -= Laya.stage.mouseY - this.mLastMouseY;
		Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }
    
    mouseMove() {
        let 
			moveX = this.mX - (Laya.stage.mouseX - this.mLastMouseX),
			moveY = this.mY - (Laya.stage.mouseY - this.mLastMouseY);
        // 移动地图视口
        if(moveX > 0){
            moveX = 0;
        } else if(moveX < -(2048 - Laya.stage.width)) {
            moveX = -(2048 - Laya.stage.width);
        }
        
        if(moveY > 0){
            moveY = 0;
        }else if(moveY < -(2048 - Laya.stage.height)) {
            moveY = -(2048 - Laya.stage.height);
        }
        console.log(moveX,moveY)
        // this.levelScene.moveViewPort(moveX, moveY);
        this.levelScene.pos(moveX,moveY);
    }
    
    onDisable() {
        // //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        // Laya.Pool.recover("bullet", this.owner);
    }
}