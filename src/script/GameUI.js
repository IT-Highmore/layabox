import GameControl from "./GameControl"
import LevelUI from "./LevelUI"
import SelectLevel from "./SelectLevel"

/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends Laya.Scene {
    constructor() {
        super();
        //设置单例的引用方式，方便其他类引用
        GameUI.instance = this;
        //关闭多点触控，否则就无敌了
        Laya.MouseManager.multiTouchEnabled = false;
        //加载场景文件
        this.loadScene("test/start.scene");
    }

    onEnable() {
        //戏控制脚本引用，避免每次获取组件带来不必要的性能开销
        this._control = this.getComponent(GameControl);

        this.currentLevel = 1;//当前等级
		this.currentLevelScore = 0;//当前等级分数
        this.targetScore = 8;//当前等级目标分数
        this.remainSteps = 2; // 剩余的步数
        //点击提示文字，开始游戏
        //初始化游戏，生成随机地图
		this.start.on(Laya.Event.CLICK, this, this.GameStart);
    }

    onUpdata() {
        if(this.selectArray.length >= 3) {
            console.log(1)
        }
    }

    GameStart() {
        this.InitUI();
        this.loadTarget();
        Laya.SoundManager.playSound("sound/start.mp3", 1, new Laya.Handler(this, null));
    }

    InitUI() {

        Laya.SoundManager.musicMuted = false;        

        let bgPath = "comp/bg.jpg";
		this.bg = new Laya.Sprite();
		Laya.stage.addChild(this.bg);
		this.bg.loadImage(bgPath);
        this.bg.pos(0, 0);
        
        // 新生成块的数组的初始位置 应在图的下方
        // this.newStarGroup = new Laya.Sprite();
        // this.bg.addChild(this.newStarGroup);
        // this.newStarGroup.pos(Laya.stage.width /2,Laya.stage.height /2);
        

        let headPath = "comp/top.png";
		this.head = new Laya.Sprite();
		this.bg.addChild(this.head);
		this.head.loadImage(headPath);
        this.head.pos(0, 0);

        let bottomPath = "comp/bottom.png";
		this.bottom = new Laya.Sprite();
		this.bg.addChild(this.bottom);
		this.bottom.loadImage(bottomPath);
        this.bottom.pos(0, 920);

        // Laya.loader.load(["comp/progressBar.png", "comp/progressBar$bar.png"],Laya.Handler.create(this, null));
        let progressBarPath = "comp/progressBar.png";
		this.progressBar = new Laya.ProgressBar(progressBarPath);
		this.bottom.addChild(this.progressBar);
		this.progressBar.width = 451;
        this.progressBar.x = 80;
        this.progressBar.y = 10;
        this.progressBar.value = 0;
        this.progressBar.sizeGrid = "0,0,0,0,1";
		this.progressBar.changeHandler = new Laya.Handler(this, this.onChange);

        for(let i =0; i< 3; i++) {
            let starBlackPath = "comp/star_2.png";
		    this.starBlack = new Laya.Sprite();
		    this.progressBar.addChild(this.starBlack);
		    this.starBlack.loadImage(starBlackPath);
            this.starBlack.pos(242 + i * 90, 0);

            let starLightPath = "comp/star_1.png";
		    this.starLight = new Laya.Sprite();
		    this.starBlack.addChild(this.starLight);
		    this.starLight.loadImage(starLightPath);
            this.starLight.pos(0, 0);
            this.starLight.visible = false;
        }

        this.score = new Laya.Text();
        this.bottom.addChild(this.score);
        this.score.text = '0';
        this.score.color = "#fff";
        this.score.fontSize = 40;
        this.score.pos(350,65);

        this.currentLevelScore = 0;
		this.colorArray = new Array('5', '1', '2', '3', '4'); //颜色数组
		// this.x = 7; //行数
        // this.y = 5; //列数
        // this.startPositionX = 75;
        // this.startPositionY = 200;
        this.totalArray = new Array();//方块总数
        this.totalPosition = new Array();//存放每个方块的位置
        this.selectArray = new Array();//选中方块数组
        this.deleteArray = new Array();//删除的方块数组

        this.colNum = {}; //删除元素的每列个数
        this.isHold = false;//是否按下
        this.canTouch = true;
        this.starHeight = 96;//六边形排列宽高
        this.starWidth = 104;
        this.hexSide = 4;//每边四个
        this.bombNumber = 0;//炸弹数量
        this.gameEnded = false;

        this.currentLevelText = new Laya.Text();
        this.bottom.addChild(this.currentLevelText);
        this.currentLevelText.text = this.currentLevel;
        this.currentLevelText.color = "#fff";
        this.currentLevelText.fontSize = 40;
        this.currentLevelText.pos(125,65);

        this.targetScoreText = new Laya.Text();
        this.head.addChild(this.targetScoreText);
        this.targetScoreText.text = '目标分数: '+ this.targetScore + '  剩余步数: ' + this.remainSteps;
        this.targetScoreText.color = "#008000";
        this.targetScoreText.fontSize = 20;
        this.targetScoreText.pos(3,75);
        this.targetScoreText.width = 130;
        this.targetScoreText.bold = true;
        this.targetScoreText.align = "left";
        this.targetScoreText.leading= 20;
        this.targetScoreText.wordWrap = true;
        
    }

    /**
     * 加载资源
     */
    loadTarget() {
        this.starGroup = new Laya.Sprite();
        this.starGroup.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.bg.addChild(this.starGroup);
        Laya.SoundManager.playMusic("sound/bgmusic.mp3", 0, new Laya.Handler(this, null));
        Laya.SoundManager.MusicVolume = 0.5;
        //六边形坐标排列

        this.hexSide--;
        for (let i = -this.hexSide; i <= this.hexSide; i++) {
            for (let j = -this.hexSide; j <= this.hexSide; j++) {
                if (i * j > 0 && Math.abs(i + j) > this.hexSide) continue;
                if (i * j < 0 && (Math.abs(i) > this.hexSide || Math.abs(j) > this.hexSide)) continue;
                let index = parseInt(Math.random() * this.colorArray.length - 1);
                let starPath = `comp/lbx_${index}.png`;
                let bombPath = `comp/bomb_${index}.png`;
                Laya.loader.load([starPath,bombPath], Laya.Handler.create(this, function () {
                    let star = new Laya.Sprite();
                    this.starGroup.addChild(star);
                    if(Math.random() > 0.95 && this.bombNumber < 5) {
                        star.loadImage(bombPath);
                        star.name = "bomb";
                        this.bombNumber++;
                    } else {
                        star.loadImage(starPath);
                        star.name = "lbx";
                    }
                    star.indexColor = index;
                    star.row = i;
                    star.col = j;
                    star.select = false;
                    star.count = 0;
                    star.pivot(star.width / 2, star.height / 2);
                    const position = this.hex2pixel({ i, j }, this.starWidth)
                    star.pos(position.x, position.y);
                    star.scaleX = 1;
                    star.scaleY = 1;
                    const pos = {
                        x: star.x,
                        y: star.y,
                        isExist: true
                    }
                    this.totalPosition.push(pos);
                    this.totalArray.push(star);
                    star.on(Laya.Event.MOUSE_DOWN, this, this.startClick, [star]);
                    star.on(Laya.Event.MOUSE_OVER, this, this.onOver, [star]);
                    star.on(Laya.Event.MOUSE_OUT, this, this.onOut, [star]);
                }))
            }
        }
        // Laya.timer.once(1, this, this.loadProps, []);
    }
    
    // 加载道具
    loadProps() {
        let indexbomb = 1;
        for (let j = 0; j < indexbomb; j++) {
            let index = parseInt(Math.random() * this.starGroup._children.length - 1);
            let bombPath = `comp/bomb_${this.starGroup._children[index].indexColor}.png`;
            Laya.loader.load(bombPath, Laya.Handler.create(this, function () {
                // console.log(this.starGroup._children[index])
                this.starGroup._children[index].loadImage(bombPath);
                this.starGroup._children[index].name = "bomb";
            }))
        }
    }

    /**
     * 开始点击
     * @param {*} sprite 
     */
    startClick(sprite) {
        if (this.gameEnded) {
            return;
        }
        if(!this.canTouch) {
            return
        }
        this.selectHasBomb = [];
        if(sprite.name != 'lbx') {
            this.selectHasBomb.push(sprite)
        }
        
        Laya.Tween.to(sprite, {
            "scaleX": 1.1,
            "scaleY": 1.1
        }, 100);
        this.isHold = true;
        this.selectArray.push(sprite);//消灭方块数组
        sprite.select = true;
        Laya.SoundManager.playSound("sound/select.mp3", 1, new Laya.Handler(this, null));
        
        this.lineGroup = new Laya.Sprite();
        this.bg.addChild(this.lineGroup);
        this.lineGroup.pos(Laya.stage.width /2,Laya.stage.height /2);

        this.boomGroup = new Laya.Sprite();
        this.bg.addChild(this.boomGroup);
        this.boomGroup.pos(Laya.stage.width /2,Laya.stage.height /2);

        this.explosionGroup = new Laya.Sprite();
        this.bg.addChild(this.explosionGroup);
        this.explosionGroup.pos(Laya.stage.width /2,Laya.stage.height /2);

        // console.log(sprite.row,sprite.col)
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onStartMouseUp, [sprite]);
        
    }

    
    /**
     * 六边形坐标转换成像素值
     * @param {*坐标} hex 
     * @param {*高度} h 
     */
    hex2pixel(hex, h) {
        let size = h / 2;
        let y = parseInt(size * Math.sqrt(3) * (hex.i + hex.j / 2));
        let x = ((size * 3) / 2) * hex.j;
        const pos = {
            x: x,
            y: y
        }
         return pos;
      }

    onOver(sprite) {
        if (!this.isHold) {
            return
        }
        if (this.gameEnded) {
            return;
        }

        if (this.selectArray[this.selectArray.length - 1].indexColor == sprite.indexColor) {
            if ((Math.abs(this.selectArray[this.selectArray.length - 1].row - sprite.row) == 1 && this.selectArray[this.selectArray.length - 1].col == sprite.col)
             || (this.selectArray[this.selectArray.length - 1].col - sprite.col == 1 && (this.selectArray[this.selectArray.length - 1].row - sprite.row == 0 || this.selectArray[this.selectArray.length - 1].row - sprite.row == -1))
                    || (this.selectArray[this.selectArray.length - 1].col - sprite.col == -1 && (this.selectArray[this.selectArray.length - 1].row - sprite.row == 0 || this.selectArray[this.selectArray.length - 1].row - sprite.row == 1))) {
                Laya.Tween.to(sprite, {
                    "scaleX": 1.1,
                    "scaleY": 1.1
                }, 100, Laya.Ease.bounceOut);
                Laya.SoundManager.playSound("sound/select.mp3", 1, new Laya.Handler(this, null));
                if (!sprite.select) {
                    this.drawLine(this.selectArray[this.selectArray.length - 1],sprite);
                    this.selectArray.push(sprite);//消灭方块数组
                    sprite.select = true;
                    if(sprite.name != 'lbx') {
                        this.selectHasBomb.push(sprite);
                    }
                }
            }
        }
            
        if (sprite == this.selectArray[this.selectArray.length - 2]) {
            this.lineGroup._children[this.lineGroup._children.length - 1].destroy();
            this.selectArray[this.selectArray.length - 1].select = false;
            this.selectArray.pop();
            if(sprite.name != 'lbx') {
                this.selectHasBomb.pop(sprite)
            }
        }
        
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.overMouseUp, [sprite]);
    }

    overMouseUp (sprite) {
        Laya.Tween.to(sprite, {
            "scaleX": 1,
            "scaleY": 1
        }, 100, Laya.Ease.bounceOut);
    }

    onOut (sprite) {
        if (!this.isHold) {
            return
        }
        Laya.Tween.to(sprite, {
            "scaleX": 1,
            "scaleY": 1
        }, 100, Laya.Ease.bounceOut);
    }

    /** 鼠标放开时，如果正在hold，则播放放开的效果
     * 
     * @param {*} sprite 
     */
    onStartMouseUp(sprite) {
        // let DIV = document.getElementById("layaCanvas");
        // DIV.onmouseout = function () {
        //     console.log(1);
        // }
		if (this.isHold) {
            this.lineGroup.destroy();
            this.isHold = false;
            Laya.Tween.to(sprite, {
                "scaleX": 1,
                "scaleY": 1
            }, 100, Laya.Ease.bounceOut);

            if(this.selectArray.length >= 3) {
                if(this.selectHasBomb.length != 0) {
                    this.selectArray.forEach(item => {
                        Laya.SoundManager.playSound("sound/boom.mp3", 1, new Laya.Handler(this, null));
                        this.DestoryAnimation(item)
                        this.BoomAnimation(item);
                        this.deleteArray.push(item);
                        let index = this.totalArray.indexOf(item);
                        if(index > -1) {
                           this.totalArray.splice(index,1);
                        }
                    })
                    for(let i = 0; i < this.selectHasBomb.length; i++) {
                        // Laya.SoundManager.playSound("sound/boom.mp3", 1, new Laya.Handler(this, null));
                        this.bombProps(this.selectHasBomb[i])
                        this.bombExplosion(this.selectHasBomb[i]);
                    }
                    this.updateArray();
                } else {
                    this.selectArray.forEach(item => {
                        this.deleteArray.push(item);
                        this.DestoryAnimation(item)
                        this.BoomAnimation(item);
                        let index = this.totalArray.indexOf(item);
                        if(index > -1) {
                           this.totalArray.splice(index,1);
                        }
                    })
                }
                Laya.SoundManager.playSound("sound/clear.mp3", 1, new Laya.Handler(this, null));
                this.selectArray = [];
                // console.log(this.deleteArray.length)
                this.canTouch = false;
                Laya.timer.once(150,this,this.verticalFall,[]);
            } else {
                this.selectArray.forEach(item => {
                    item.select = false;
                })
                this.selectHasBomb = [];
                this.selectArray = [];
            }
        }
    }

    /**
     * 炸弹道具逻辑
     */
    bombProps(sprite) {
        // console.log('total' + this.totalArray.length)
        // console.log(this.deleteArray.length)
        this.updateArray();
        for (let j = 0; j < this.totalArray.length; j++) {
            if ((this.totalArray[j].col == sprite.col && Math.abs(this.totalArray[j].row - sprite.row) == 1)
                || (sprite.col - this.totalArray[j].col == 1 && (sprite.row - this.totalArray[j].row == 0 || sprite.row - this.totalArray[j].row == -1))
                || (sprite.col - this.totalArray[j].col == -1 && (sprite.row - this.totalArray[j].row == 0 || sprite.row - this.totalArray[j].row == 1))) {
                    this.DestoryAnimation(this.totalArray[j]);
                    // this.bombExplosion(this.totalArray[j]);
                    this.BoomAnimation(this.totalArray[j]);
                    if (!this.totalArray[j].select) {
                        this.deleteArray.push(this.totalArray[j]);
                        this.totalArray[j].select = true;
                    }
                    if (this.totalArray[j].name == 'bomb') {
                        // console.log(this.totalArray.length)
                        this.bombExplosion(this.totalArray[j]);
                        this.bombProps(this.totalArray[j]);
                    }
            }
        }
    }

    updateArray() {
        // console.log('delete' + this.deleteArray.length)
        for (let k = 0; k < this.deleteArray.length; k++) {
            let index = this.totalArray.indexOf(this.deleteArray[k]);
            if (index > -1) {
                this.totalArray.splice(index, 1);
            }
        }
        // console.log('total new' + this.totalArray.length)
        // for (let m = 0; m < this.deleteArray.length; m++) {
        //     if (this.deleteArray[m].name == 'bomb') {
        //         this.bombProps(this.deleteArray[m]);
        //     }
        // }
    }

    /**
     * 消失动画
     */
    DestoryAnimation(item) {
        let timeLine = new Laya.TimeLine();
        timeLine.addLabel("disappear",0).to(item, {scaleX:0.1, scaleY:0.1, alpha:0},300,null,0);
        timeLine.play(0, false);
        timeLine.on(Laya.Event.COMPLETE, this, function() {
            item.destroy();
        });
    }

    /**
     * 炸弹爆炸动画
     */
    bombExplosion(item) {
        let aniConfPath = "res/atlas/explosion/explosion.atlas";
        Laya.loader.load(aniConfPath, Laya.Handler.create(this, null), null, Laya.Loader.ATLAS);
        let explosionAni = new Laya.Animation;
        this.explosionGroup.addChild(explosionAni)
        explosionAni.loadAtlas(aniConfPath);
        explosionAni.interval= 30;
        explosionAni.play(0,false);
        explosionAni.pivot(92/2,86/2);
        explosionAni.pos(item.x,item.y);
        explosionAni.on(Laya.Event.COMPLETE,this,function () {
            this.explosionGroup.destroy();
        })
    }
    /**
     * 星星爆炸动画
     */
    BoomAnimation(item) {
        let aniConfPath = "res/atlas/boom/boom.atlas";
        Laya.loader.load(aniConfPath, Laya.Handler.create(this, null), null, Laya.Loader.ATLAS);
        let boomAni = new Laya.Animation;
        this.boomGroup.addChild(boomAni)
        boomAni.loadAtlas(aniConfPath);
        boomAni.interval= 30;
        boomAni.play(0,false);
        boomAni.pivot(92/2,86/2);
        boomAni.pos(item.x,item.y);
        boomAni.on(Laya.Event.COMPLETE,this,function () {
            this.boomGroup.destroy();
        })
    }

    /**
     * 进度条
     */
    changeProcessBar(length) {
        if (this.progressBar.value < 1) {
            let add = length / this.targetScore;
            this.progressBar.value += add;
            for (let i = 2; i< this.progressBar._children.length;i++) {
                if (this.progressBar.value >= (this.progressBar._children[i].x + 18)/ this.progressBar.width) {
                    this.progressBar._children[i]._children[0].visible = true;
                }
            }
        }
    }

    /**
     * 进度条实时检测
     */
    onChange (value)  {
        if(this.remainSteps = 0 && value < 1) {
            Laya.SoundManager.musicMuted = true;
            Laya.timer.once(500,this,this.defeat)       
        }
        if(value >= 1) {
            Laya.SoundManager.musicMuted = true;
            Laya.timer.once(500,this,this.success,[]);
        }
    }

    /**
     * 划线
     * @param {*} start 
     * @param {*} end 
     */
    drawLine(start, end) {

        if (start.col == end.col) {
            // console.log("竖直")
            let linePath = `comp/line_${4}.png`;
            let line = new Laya.Sprite();
            this.lineGroup.addChild(line);
            line.loadImage(linePath);
            line.pivot(line.width / 2, line.height / 2);
            line.pos((start.x + end.x) / 2 , (start.y + end.y) / 2);
        } else if ((start.col + start.row) == (end.col + end.row)) {
            // console.log("左斜")
            let linePath = `comp/line_${4}.png`;
            let line = new Laya.Sprite();
            this.lineGroup.addChild(line);
            line.loadImage(linePath);
            line.pivot(line.width / 2, line.height / 2);
            line.pos((start.x + end.x) / 2, (start.y + end.y) / 2);
            line.rotation = 60;
        } else {
            // console.log("右斜")
            let linePath = `comp/line_${4}.png`;
            let line = new Laya.Sprite();
            this.lineGroup.addChild(line);
            line.loadImage(linePath);
            line.pivot(line.width / 2, line.height / 2);
            line.pos((start.x + end.x) / 2, (start.y + end.y) / 2);
            line.rotation = 120;
        }
    }

    /**
     * 垂直下落填充方法
     * 消除后要补充被消除掉的元素，补充动画元素前
     * 按列把被消元素的上方元素下降，无可降后再随机进行填充
     * 填满被消除的个数
     */
    verticalFall() {
        // console.log(this.deleteArray.length)
        this.currentLevelScore += this.deleteArray.length;
        this.score.changeText(this.currentLevelScore);
        this.changeProcessBar(this.deleteArray.length);
        
        for (let i = 0; i < this.deleteArray.length; i++) {
            let col = this.deleteArray[i].col;
            // let row = this.deleteArray[i].row;
            if(!this.colNum[col]) {
                this.colNum[col] = 1;
            } else {
                this.colNum[col]++;
            }
        }
        // console.log(this.colNum)
        // 要获取某一列方块 下方 消除方块的个数
        this.totalArray.forEach(tolItem => {
            this.deleteArray.forEach(item => {
                if(item.col == tolItem.col && item.row > tolItem.row) {
                    tolItem.count++;
                }
            })
        })
        
        for(let i = 0; i < this.totalArray.length; i++) {
            for (let j = 0; j < this.deleteArray.length; j++) {
                if(this.deleteArray[j].col == this.totalArray[i].col && this.deleteArray[j].row > this.totalArray[i].row) {
                    let timeLine = new Laya.TimeLine();
                    timeLine.addLabel("turnDown",0).to(this.totalArray[i], { y : this.totalArray[i].y + 90 * this.totalArray[i].count }, 100 + 100 * this.totalArray[i].count,Laya.Ease.sineOut)
                    .addLabel("turnUp",0).to(this.totalArray[i], { y : this.totalArray[i].y + 90 * this.totalArray[i].count - 10 - 5 * this.setBounceDistance(this.totalArray[i].count)}, 100,Laya.Ease.sineOut)
                    .addLabel("turnDown",0).to(this.totalArray[i], { y : this.totalArray[i].y + 90 * this.totalArray[i].count }, 100,Laya.Ease.sineOut)
                    timeLine.play(0, false);
                    this.totalArray[i].row += this.totalArray[i].count;
                    break;
                }
            }
        }

        Laya.timer.once(200,this,this.creatNewStar,[]);
    }

    /**
     * 生成新的元素
     */
    creatNewStar() {
        this.totalArray.forEach(tolItem => {
            tolItem.count = 0;
        })

        const newStarGroup = new Laya.Sprite();
        this.bg.addChild(newStarGroup);
        newStarGroup.pos(Laya.stage.width /2,Laya.stage.height /2);

        for(let p = -this.hexSide; p <= this.hexSide; p++) {
            if(this.colNum[p] != null) {
                for (let q = 0; q < this.colNum[p]; q++) {
                    let index = parseInt(Math.random() * this.colorArray.length - 1);
                    let starPath = `comp/lbx_${index}.png`;
                    let bombPath = `comp/bomb_${index}.png`;
                    let star = new Laya.Sprite();
                    // if (Math.random() > 0.8) {
                    //     star.loadImage(bombPath);
                    //     star.name = "bomb";
                    // } else {
                        star.loadImage(starPath);
                        star.name = `lbx`;
                    // }
                    newStarGroup.addChild(star);
                    star.pivot(star.width / 2,star.height / 2);
                    if (p >= 0) {
                        star.pos(this.hex2pixel({i:-4 -q-1,j:p},this.starWidth).x,this.hex2pixel({i:-4 -q -1,j:p},this.starWidth).y);
                        star.row = -4 -q + this.colNum[p];
                    } else {
                        star.pos(this.hex2pixel({i:(-3-p-q -1-1),j:p},this.starWidth).x,this.hex2pixel({i:-3-p-q -1 -1,j:p},this.starWidth).y);
                        star.row = -3 - p -q -1 + this.colNum[p];
                    }
                    star.indexColor = index;
                    star.col = p;
                    star.count = 0;
                    star.select = false;
                    this.totalArray.push(star);
                    star.on(Laya.Event.MOUSE_DOWN, this, this.startClick, [star]);
                    star.on(Laya.Event.MOUSE_OVER, this, this.onOver, [star]);
                    star.on(Laya.Event.MOUSE_OUT, this, this.onOut, [star]);
                }
            }
        }
        if (Math.random() > 0.85) {
            let index = parseInt(Math.random() * newStarGroup._children.length - 1);
            let bombPath = `comp/bomb_${newStarGroup._children[index].indexColor}.png`;
            Laya.loader.load(bombPath, Laya.Handler.create(this, function () {
                // console.log(newStarGroup._children[index])
                newStarGroup._children[index].loadImage(bombPath);
                newStarGroup._children[index].name = "bomb";
            }))
        }
        
        
        //下落
        for (let k = 0; k < this.deleteArray.length; k++) {
            let timeLine = new Laya.TimeLine();
            timeLine.addLabel("turnDown",0).to(newStarGroup._children[k], { 
                y : newStarGroup._children[k].y + 90 * (this.colNum[newStarGroup._children[k].col]+1) 
            }, 300,Laya.Ease.sineOut)
            .addLabel("turnUp",0).to(newStarGroup._children[k], { y : newStarGroup._children[k].y + 90 * (this.colNum[newStarGroup._children[k].col] + 1 ) - 10 - 5 * this.setBounceDistance(this.colNum[newStarGroup._children[k].col])}, 100,Laya.Ease.sineOut)
            .addLabel("turnDown",0).to(newStarGroup._children[k], { y : newStarGroup._children[k].y + 90 * (this.colNum[newStarGroup._children[k].col]+1) }, 100,Laya.Ease.sineOut)
            timeLine.play(0, false);
        }
        this.selectHasBomb = [];
        this.deleteArray = [];
        this.colNum = {};
        this.canTouch = true;
        this.remainSteps--;
        this.targetScoreText.changeText('剩余步数: ' + this.remainSteps);
    }

    /**
     * 下落反弹设定
     */
    setBounceDistance (count) {
        if(count <= 4) {
            return count - 1
        } else {
            return 3
        }
    }

    /**
     * 失败
     */
    defeat(){
        console.log("defeat")
        this.gameEnded = true;
        Laya.SoundManager.playSound("sound/defeat.mp3", 1, new Laya.Handler(this, function() {

        }));
    };

    /**
     * 成功
     */
    success() {
        console.log("success")
        this.gameEnded = true;
        Laya.SoundManager.playSound("sound/success.mp3", 1, new Laya.Handler(this, function() {
            let bgGreyPath = "comp/bg_grey.png";
		    const bgGrey = new Laya.Sprite();
		    this.bg.addChild(bgGrey);
		    bgGrey.loadImage(bgGreyPath);
            bgGrey.pos(0, 0);
            let winPath = "comp/win.png";
            Laya.loader.load(winPath, Laya.Handler.create(this, function() {
		        const win = new Laya.Sprite();
		        bgGrey.addChild(win);
                win.loadImage(winPath);
                win.pivot(win.width/2,win.height/2);
                win.pos(Laya.stage.width/2, Laya.stage.height/2);

                const winStar1 = new Laya.Sprite();
		        win.addChild(winStar1);
                winStar1.loadImage("comp/star_1_1.png");
                winStar1.pos(80,80);

                const winStar2 = new Laya.Sprite();
		        win.addChild(winStar2);
                winStar2.loadImage("comp/star_2_1.png");
                winStar2.pos(230,35);

                const winStar3 = new Laya.Sprite();
		        win.addChild(winStar3);
                winStar3.loadImage("comp/star_3_1.png");
                winStar3.pos(400,85);

                const pauseIcon =new Laya.Sprite();
                win.addChild(pauseIcon);
                pauseIcon.loadImage("comp/icon_2.png");
                pauseIcon.pos(510,-15);
                pauseIcon.on(Laya.Event.CLICK, this, this.LevelSelect);
                

                const endIcon =new Laya.Sprite();
                win.addChild(endIcon);
                endIcon.loadImage("comp/icon_1.png");
                endIcon.pos(210,525);
                endIcon.on(Laya.Event.CLICK, this, this.LevelReset);

                const currentScore = new Laya.Text();
                win.addChild(currentScore);
                currentScore.text = this.currentLevelScore;
                currentScore.color = "#fff";
                currentScore.fontSize = 40;
                currentScore.pos(300,420);

            }));
        }));
    }

    LevelSelect() {

        const levelSelect = new SelectLevel();
        levelSelect.select();
    }

    LevelReset() {
        const levelReset = new LevelUI();
        levelReset.startGame();
        // console.log(this.starGroup)
    }

	/**
     * 流程
	 * 初始化游戏
	 * 时间，等级，分数，目标分数
	 * 地图，随机颜色
	 * 触发点击事件，检测相同消除
	 * 检测颜色区域，扩展加入新的元素，掉落填补空缺，检查死局
	 * 获取分数是否大于目标分数
	 */
}