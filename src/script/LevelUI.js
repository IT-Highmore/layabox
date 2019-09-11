import GameUI from "./GameUI";
 /**
 * 关卡界面选择
 */
export default class LevelUI extends Laya.Script {
    constructor() { super();
    //设置单例的引用方式，方便其他类引用
    LevelUI.instance = this;
    }
    onEnable() {
    }

    onUpdate() {
        
    }

    startGame() {
        console.log(GameUI.instance.currentLevel)
        GameUI.instance.currentLevel++;
        GameUI.instance.targetScore += 50;
        GameUI.instance.GameStart();
    }

    onDisable() {
        // //子弹被移除时，回收子弹到对象池，方便下次复用，减少对象创建开销
        // Laya.Pool.recover("bullet", this.owner);
    }
}